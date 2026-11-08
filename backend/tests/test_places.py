import json

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.config import settings
from app.main import app
from app.routers.places import get_http_client
from tests.conftest import fake_http_client

FAKE_KEY = "test-key-not-real"

# What Google's Places API (New) returns for "ferry", shortened.
GOOGLE_RESPONSE = {
    "suggestions": [
        {
            "placePrediction": {
                "structuredFormat": {
                    "mainText": {"text": "Ferry Building"},
                    "secondaryText": {"text": "The Embarcadero, San Francisco, CA, USA"},
                }
            }
        },
        # A search-query suggestion, not a place: should be skipped.
        {"queryPrediction": {"text": {"text": "ferry schedules"}}},
        {
            "placePrediction": {
                "structuredFormat": {"mainText": {"text": "Ferry Plaza"}},
            }
        },
    ]
}


@pytest.fixture
def api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    # A fake key, so tests don't depend on (or ever use) the real one.
    monkeypatch.setattr(settings, "google_maps_api_key", SecretStr(FAKE_KEY))


def use_fake_google(handler) -> None:
    app.dependency_overrides[get_http_client] = fake_http_client(handler)


def test_returns_place_suggestions(client: TestClient, api_key: None):
    sent: list[httpx.Request] = []

    def google(request: httpx.Request) -> httpx.Response:
        sent.append(request)
        return httpx.Response(200, json=GOOGLE_RESPONSE)

    use_fake_google(google)
    response = client.get("/places/autocomplete", params={"q": "ferry"})

    assert response.status_code == 200
    assert response.json() == [
        {"name": "Ferry Building", "address": "The Embarcadero, San Francisco, CA, USA"},
        {"name": "Ferry Plaza", "address": ""},
    ]
    body = json.loads(sent[0].content)
    assert sent[0].headers["X-Goog-Api-Key"] == FAKE_KEY
    assert body["input"] == "ferry"
    assert "locationRestriction" in body


def test_returns_at_most_5_suggestions(client: TestClient, api_key: None):
    many = {"suggestions": GOOGLE_RESPONSE["suggestions"][:1] * 8}
    use_fake_google(lambda request: httpx.Response(200, json=many))

    assert len(client.get("/places/autocomplete", params={"q": "ferry"}).json()) == 5


@pytest.mark.parametrize("q", ["", "fe", "x" * 101])
def test_rejects_too_short_or_too_long_queries(client: TestClient, api_key: None, q: str):
    assert client.get("/places/autocomplete", params={"q": q}).status_code == 422


def test_503_when_no_key_is_configured(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(settings, "google_maps_api_key", None)

    response = client.get("/places/autocomplete", params={"q": "ferry"})

    assert response.status_code == 503


def test_503_without_leaking_details_when_google_rejects_the_request(client: TestClient, api_key: None):
    error = {"error": {"message": f"API key {FAKE_KEY} not valid", "status": "PERMISSION_DENIED"}}
    use_fake_google(lambda request: httpx.Response(403, json=error))

    response = client.get("/places/autocomplete", params={"q": "ferry"})

    assert response.status_code == 503
    assert FAKE_KEY not in response.text


def test_503_when_google_is_unreachable(client: TestClient, api_key: None):
    def unreachable(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectTimeout("timed out", request=request)

    use_fake_google(unreachable)

    assert client.get("/places/autocomplete", params={"q": "ferry"}).status_code == 503


def test_other_tests_cannot_reach_the_real_google(client: TestClient, api_key: None):
    # Without use_fake_google, conftest's guard refuses any real request.
    with pytest.raises(AssertionError, match="real HTTP request"):
        client.get("/places/autocomplete", params={"q": "ferry"})
