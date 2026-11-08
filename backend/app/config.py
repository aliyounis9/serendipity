from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/.env, found relative to this file so it works from any directory.
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")
    database_url: SecretStr
    cors_origins: list[str]
    # Optional: without it, only place suggestions are unavailable.
    google_maps_api_key: SecretStr | None = None


settings = Settings()
