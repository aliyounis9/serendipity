from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, places, plans

app = FastAPI(title="Serendipity API")

# Lets the Expo web app (a different origin) read API responses in the
# browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(health.router)
app.include_router(plans.router)
app.include_router(places.router)
