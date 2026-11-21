import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, inspect, select
from sqlalchemy.orm import Session

from app.models import Profile
from tests.test_auth import USER_ID, claims, sign, supabase  # noqa: F401

OTHER_USER_ID = uuid.UUID("7f3a1c2e-0000-4000-8000-000000000002")


def headers(user_id: uuid.UUID = USER_ID, email: str = "ali@example.com") -> dict:
    return {"Authorization": f"Bearer {sign(claims(sub=str(user_id), email=email))}"}


def test_needs_a_token(client: TestClient, supabase: None):
    assert client.get("/me").status_code == 401
    assert client.put("/me", json={"display_name": "Ali"}).status_code == 401


def test_404_until_the_profile_is_set_up(client: TestClient, supabase: None):
    response = client.get("/me", headers=headers())

    assert response.status_code == 404
    assert response.json()["detail"] == "Profile not set up"


def test_put_creates_the_profile(client: TestClient, supabase: None):
    response = client.put("/me", headers=headers(), json={"display_name": " Ali ", "bio": "New in SF"})

    expected = {"id": str(USER_ID), "email": "ali@example.com", "display_name": "Ali", "bio": "New in SF"}
    assert response.status_code == 200
    assert response.json() == expected
    assert client.get("/me", headers=headers()).json() == expected


def test_put_updates_the_existing_profile(client: TestClient, supabase: None, db_session: Session):
    client.put("/me", headers=headers(), json={"display_name": "Ali", "bio": "New in SF"})

    response = client.put("/me", headers=headers(), json={"display_name": "Alex"})

    assert response.json()["display_name"] == "Alex"
    assert response.json()["bio"] is None  # PUT replaces the whole profile
    assert db_session.scalar(select(func.count()).select_from(Profile)) == 1


def test_sending_the_same_put_twice_is_safe(client: TestClient, supabase: None, db_session: Session):
    body = {"display_name": "Ali", "bio": "New in SF"}

    first = client.put("/me", headers=headers(), json=body)
    second = client.put("/me", headers=headers(), json=body)

    assert first.json() == second.json()
    assert db_session.scalar(select(func.count()).select_from(Profile)) == 1


def test_blank_bio_is_stored_as_no_bio(client: TestClient, supabase: None):
    response = client.put("/me", headers=headers(), json={"display_name": "Ali", "bio": "   "})

    assert response.json()["bio"] is None


@pytest.mark.parametrize(
    ("body", "field"),
    [
        ({}, "display_name"),
        ({"display_name": ""}, "display_name"),
        ({"display_name": "   "}, "display_name"),
        ({"display_name": "x" * 51}, "display_name"),
        ({"display_name": "Ali", "bio": "x" * 201}, "bio"),
        ({"display_name": "Ali", "id": str(OTHER_USER_ID)}, "id"),  # can't choose whose profile
        ({"display_name": "Ali", "email": "someone@example.com"}, "email"),
    ],
)
def test_invalid_profiles_are_rejected(client: TestClient, supabase: None, db_session: Session, body: dict, field: str):
    response = client.put("/me", headers=headers(), json=body)

    assert response.status_code == 422
    assert field in [error["loc"][-1] for error in response.json()["detail"]]
    assert db_session.scalar(select(func.count()).select_from(Profile)) == 0


def test_users_only_see_and_change_their_own_profile(client: TestClient, supabase: None):
    client.put("/me", headers=headers(USER_ID), json={"display_name": "Ali"})

    assert client.get("/me", headers=headers(OTHER_USER_ID)).status_code == 404

    client.put("/me", headers=headers(OTHER_USER_ID), json={"display_name": "Sam"})

    assert client.get("/me", headers=headers(USER_ID)).json()["display_name"] == "Ali"
    assert client.get("/me", headers=headers(OTHER_USER_ID)).json()["display_name"] == "Sam"


def test_email_is_not_stored_in_our_database():
    assert "email" not in [column.name for column in inspect(Profile).columns]
