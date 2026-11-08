from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Plan


SAN_FRANCISCO = ZoneInfo("America/Los_Angeles")


def in_days(days: float) -> datetime:
    return datetime.now(UTC) + timedelta(days=days)


def sf_time(hour: int, minute: int = 0, days_from_now: int = 1) -> datetime:
    # A start time within the allowed hours, in San Francisco time.
    day = datetime.now(SAN_FRANCISCO) + timedelta(days=days_from_now)
    return day.replace(hour=hour, minute=minute, second=0, microsecond=0)


def valid_plan(**overrides) -> dict:
    plan = {
        "title": "Sunset walk at Crissy Field",
        "description": "Easy waterfront walk",
        "location": "Crissy Field East Beach",
        "starts_at": sf_time(15).isoformat(),
        "max_participants": 4,
    }
    plan.update(overrides)
    return plan


def add_plan_directly(db: Session, title: str, starts_at: datetime) -> None:
    # Bypasses the API, e.g. to create plans in the past.
    db.add(Plan(title=title, location="Somewhere", starts_at=starts_at, max_participants=3))
    db.commit()


def test_create_plan_returns_201_with_server_fields(client: TestClient):
    response = client.post("/plans", json=valid_plan())

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Sunset walk at Crissy Field"
    assert body["max_participants"] == 4
    assert body["id"]
    assert body["created_at"]


def test_created_plan_is_stored_and_listed(client: TestClient, db_session: Session):
    created = client.post("/plans", json=valid_plan()).json()

    assert db_session.scalar(select(func.count()).select_from(Plan)) == 1
    listed = client.get("/plans").json()
    assert [plan["id"] for plan in listed] == [created["id"]]


def test_title_and_location_whitespace_is_stripped(client: TestClient):
    body = client.post("/plans", json=valid_plan(title="  Coffee  ", location=" Polk St ")).json()

    assert body["title"] == "Coffee"
    assert body["location"] == "Polk St"


def test_description_is_optional(client: TestClient):
    plan = valid_plan()
    del plan["description"]

    response = client.post("/plans", json=plan)

    assert response.status_code == 201
    assert response.json()["description"] is None


def test_list_shows_only_upcoming_plans_soonest_first(client: TestClient, db_session: Session):
    add_plan_directly(db_session, "past", in_days(-1))
    add_plan_directly(db_session, "in three days", in_days(3))
    add_plan_directly(db_session, "tomorrow", in_days(1))

    titles = [plan["title"] for plan in client.get("/plans").json()]

    assert titles == ["tomorrow", "in three days"]


def test_list_returns_at_most_50_plans(client: TestClient, db_session: Session):
    for i in range(51):
        db_session.add(
            Plan(title=f"plan {i}", location="x", starts_at=in_days(1 + i), max_participants=2)
        )
    db_session.commit()

    assert len(client.get("/plans").json()) == 50


@pytest.mark.parametrize(
    ("overrides", "bad_field"),
    [
        ({"title": None}, "title"),
        ({"title": "   "}, "title"),
        ({"title": "x" * 121}, "title"),
        ({"location": ""}, "location"),
        ({"location": "x" * 201}, "location"),
        ({"description": "x" * 1001}, "description"),
        ({"max_participants": 1}, "max_participants"),
        ({"max_participants": 6}, "max_participants"),
        ({"starts_at": "2030-01-01T14:00:00"}, "starts_at"),  # no timezone
        ({"starts_at": "not a date"}, "starts_at"),
        ({"starts_at": in_days(-1).isoformat()}, "starts_at"),  # in the past
        ({"id": "chosen-by-client"}, "id"),  # server-controlled field
        ({"created_at": "2020-01-01T00:00:00Z"}, "created_at"),
    ],
)
def test_invalid_plans_are_rejected_and_not_stored(
    client: TestClient, db_session: Session, overrides: dict, bad_field: str
):
    response = client.post("/plans", json=valid_plan(**overrides))

    assert response.status_code == 422
    assert bad_field in [error["loc"][-1] for error in response.json()["detail"]]
    assert db_session.scalar(select(func.count()).select_from(Plan)) == 0


def test_missing_required_field_is_rejected(client: TestClient):
    plan = valid_plan()
    del plan["location"]

    response = client.post("/plans", json=plan)

    assert response.status_code == 422


def test_database_rejects_invalid_group_size_even_without_the_api(db_session: Session):
    db_session.add(Plan(title="too big", location="x", starts_at=in_days(1), max_participants=9))

    with pytest.raises(IntegrityError, match="max_participants_range"):
        db_session.commit()
    db_session.rollback()


def test_get_plan_by_id(client: TestClient):
    created = client.post("/plans", json=valid_plan()).json()

    response = client.get(f"/plans/{created['id']}")

    assert response.status_code == 200
    assert response.json() == created


def test_get_missing_plan_returns_404(client: TestClient):
    response = client.get("/plans/00000000-0000-0000-0000-000000000000")

    assert response.status_code == 404


def test_get_plan_with_invalid_id_returns_422(client: TestClient):
    assert client.get("/plans/not-a-uuid").status_code == 422


def test_cors_allows_the_expo_web_origin(client: TestClient):
    response = client.options(
        "/plans",
        headers={
            "Origin": "http://localhost:8081",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:8081"


def test_cors_rejects_other_origins(client: TestClient):
    response = client.get("/plans", headers={"Origin": "https://minerva.edu"})

    assert "access-control-allow-origin" not in response.headers


@pytest.mark.parametrize(
    ("starts_at", "allowed"),
    [
        (sf_time(9, 0), True),  # earliest start
        (sf_time(19, 0), True),  # latest start
        (sf_time(8, 59), False),
        (sf_time(19, 1), False),
        (sf_time(2, 0), False),
    ],
)
def test_start_time_must_be_between_9_and_19_in_san_francisco(
    client: TestClient, starts_at: datetime, allowed: bool
):
    response = client.post("/plans", json=valid_plan(starts_at=starts_at.isoformat()))

    assert response.status_code == (201 if allowed else 422)


def test_allowed_hours_use_san_francisco_time_not_the_clients_timezone(client: TestClient):
    # 15:00 in Berlin is 6:00 in San Francisco, so it's rejected...
    berlin_afternoon = sf_time(6).astimezone(ZoneInfo("Europe/Berlin"))
    assert client.post("/plans", json=valid_plan(starts_at=berlin_afternoon.isoformat())).status_code == 422

    # ...while the same SF afternoon is accepted however it's written, e.g. in UTC.
    sf_afternoon_in_utc = sf_time(15).astimezone(UTC)
    assert client.post("/plans", json=valid_plan(starts_at=sf_afternoon_in_utc.isoformat())).status_code == 201
