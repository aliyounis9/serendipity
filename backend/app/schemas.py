import uuid
from datetime import UTC, datetime
from typing import Annotated

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StringConstraints, field_validator

# Whitespace is stripped first, so "   " counts as empty and is rejected.
Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Location = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Description = Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)]


class PlanCreate(BaseModel):
    """What a client may send to create a plan."""

    # Unknown fields (e.g. "id" or "created_at") are rejected, not ignored,
    # so clients can't try to set values the server controls.
    model_config = ConfigDict(extra="forbid")

    title: Title
    description: Description | None = None
    location: Location
    # Must include a timezone offset, e.g. "2026-11-14T14:00:00-08:00".
    starts_at: AwareDatetime
    # Includes the organizer.
    max_participants: int = Field(ge=2, le=5)

    @field_validator("starts_at")
    @classmethod
    def must_be_in_the_future(cls, value: datetime) -> datetime:
        if value <= datetime.now(UTC):
            raise ValueError("must be in the future")
        return value


class PlanRead(BaseModel):
    """What the API returns."""

    # Lets Pydantic read the values from a SQLAlchemy Plan object.
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    location: str
    starts_at: datetime
    max_participants: int
    created_at: datetime
