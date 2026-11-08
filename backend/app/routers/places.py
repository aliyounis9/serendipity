from collections.abc import Iterator
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.config import settings

# Proxy for Google Places, so the API key stays on the server.
router = APIRouter(prefix="/places", tags=["places"])

GOOGLE_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete"
MAX_SUGGESTIONS = 5

# Rough box around San Francisco, so suggestions stay in the city.
SAN_FRANCISCO_AREA = {
    "rectangle": {
        "low": {"latitude": 37.70, "longitude": -122.53},
        "high": {"latitude": 37.84, "longitude": -122.35},
    }
}


class PlaceSuggestion(BaseModel):
    name: str
    address: str


def get_http_client() -> Iterator[httpx.Client]:
    # A dependency, so tests can replace it with a fake.
    with httpx.Client(timeout=5) as client:
        yield client


HttpClient = Annotated[httpx.Client, Depends(get_http_client)]


@router.get("/autocomplete", response_model=list[PlaceSuggestion])
def autocomplete(
    http: HttpClient,
    q: Annotated[str, Query(min_length=3, max_length=100)],
) -> list[PlaceSuggestion]:
    if settings.google_maps_api_key is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Place suggestions aren't configured")

    try:
        response = http.post(
            GOOGLE_AUTOCOMPLETE_URL,
            headers={"X-Goog-Api-Key": settings.google_maps_api_key.get_secret_value()},
            json={
                "input": q,
                "includedRegionCodes": ["us"],
                "locationRestriction": SAN_FRANCISCO_AREA,
            },
        )
    except httpx.HTTPError:
        # Google's errors aren't passed on: they can contain request details.
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Place suggestions are unavailable")

    if response.status_code != 200:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Place suggestions are unavailable")

    return [
        PlaceSuggestion(
            name=prediction["structuredFormat"]["mainText"]["text"],
            address=prediction["structuredFormat"].get("secondaryText", {}).get("text", ""),
        )
        for suggestion in response.json().get("suggestions", [])
        # Google can also suggest search queries; we only want places.
        if (prediction := suggestion.get("placePrediction"))
    ][:MAX_SUGGESTIONS]
