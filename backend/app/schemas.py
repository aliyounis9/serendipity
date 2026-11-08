import uuid
from datetime import UTC, datetime, time
from typing import Annotated
from zoneinfo import ZoneInfo

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StringConstraints, field_validator

# All plans are in San Francisco, so their allowed hours are SF local time.
# Mirrored in src/plans/form.ts.
PLAN_TIME_ZONE = ZoneInfo("America/Los_Angeles")
EARLIEST_START = time(9, 0)
LATEST_START = time(19, 0)

Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Location = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Description = Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)]


class PlanCreate(BaseModel):
    """What a client may send to create a plan."""

    # Reject server-controlled fields (id, created_at) instead of ignoring them.
    model_config = ConfigDict(extra="forbid")

    title: Title
    description: Description | None = None
    location: Location
    starts_at: AwareDatetime
    # Includes the organizer.
    max_participants: int = Field(ge=2, le=5)

    @field_validator("starts_at")
    @classmethod
    def must_be_in_the_future(cls, value: datetime) -> datetime:
        if value <= datetime.now(UTC):
            raise ValueError("must be in the future")
        return value

    @field_validator("starts_at")
    @classmethod
    def must_be_during_the_day(cls, value: datetime) -> datetime:
        local_time = value.astimezone(PLAN_TIME_ZONE).time()
        if not EARLIEST_START <= local_time <= LATEST_START:
            raise ValueError("must be between 9:00 and 19:00 San Francisco time")
        return value


class PlanRead(BaseModel):
    """What the API returns."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    location: str
    starts_at: datetime
    max_participants: int
    created_at: datetime
