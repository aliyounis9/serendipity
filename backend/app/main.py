from fastapi import FastAPI

from app.routers import health, plans

app = FastAPI(title="Serendipity API")

app.include_router(health.router)
app.include_router(plans.router)
