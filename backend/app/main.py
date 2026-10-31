from fastapi import FastAPI

from app.routers import health

app = FastAPI(title="Serendipity API")

app.include_router(health.router)
