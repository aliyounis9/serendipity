import base64
import hashlib
import hmac
import json
import uuid
from datetime import UTC, datetime, timedelta

import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient
from jwt.algorithms import ECAlgorithm
from sqlalchemy.orm import Session

from app.auth import get_supabase_keys
from app.config import settings
from app.main import app
from app.models import Profile

PROJECT_URL = "https://test-project.supabase.co"
ISSUER = f"{PROJECT_URL}/auth/v1"
KEY_ID = "test-key"

# Only "Supabase" (the tests) has the private half; the API only ever gets the public half.
SUPABASE_PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())
SUPABASE_PUBLIC_JWK = jwt.PyJWK(
    {**ECAlgorithm.to_jwk(SUPABASE_PRIVATE_KEY.public_key(), as_dict=True), "alg": "ES256", "kid": KEY_ID}
)
# An attacker's own key pair, unknown to the API.
ATTACKER_PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())

USER_ID = uuid.UUID("7f3a1c2e-0000-4000-8000-000000000001")


class FakeJWKS:
    """Behaves like PyJWKClient, but serves our test public key."""

    def get_signing_key_from_jwt(self, token: str) -> jwt.PyJWK:
        if jwt.get_unverified_header(token).get("kid") != KEY_ID:
            raise jwt.PyJWKClientError("no key with that kid")
        return SUPABASE_PUBLIC_JWK


@pytest.fixture
def supabase(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "supabase_url", PROJECT_URL)
    app.dependency_overrides[get_supabase_keys] = FakeJWKS


def claims(**overrides) -> dict:
    now = datetime.now(UTC)
    values = {
        "sub": str(USER_ID),
        "aud": "authenticated",
        "iss": ISSUER,
        "iat": now,
        "exp": now + timedelta(hours=1),
    }
    values.update(overrides)
    return {key: value for key, value in values.items() if value is not None}


def sign(payload: dict, key=SUPABASE_PRIVATE_KEY, algorithm: str = "ES256") -> str:
    return jwt.encode(payload, key, algorithm=algorithm, headers={"kid": KEY_ID})


def get_me(client: TestClient, token: str):
    return client.get("/me", headers={"Authorization": f"Bearer {token}"})


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def test_valid_token_identifies_the_user(client: TestClient, supabase: None, db_session: Session):
    db_session.add(Profile(id=USER_ID, display_name="Ali"))
    db_session.commit()

    response = get_me(client, sign(claims()))

    assert response.status_code == 200
    assert response.json()["id"] == str(USER_ID)


def test_missing_header_is_rejected(client: TestClient, supabase: None):
    response = client.get("/me")

    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == "Bearer"


def test_other_auth_schemes_are_rejected(client: TestClient, supabase: None):
    response = client.get("/me", headers={"Authorization": f"Basic {sign(claims())}"})

    assert response.status_code == 401


@pytest.mark.parametrize(
    "overrides",
    [
        {"exp": datetime.now(UTC) - timedelta(minutes=1)},  # expired
        {"aud": "anon"},  # not a logged-in user's token
        {"iss": "https://another-project.supabase.co/auth/v1"},  # another Supabase project
        {"exp": None},  # no expiry at all
        {"sub": None},  # no user
        {"sub": "not-a-uuid"},
    ],
)
def test_tokens_with_bad_claims_are_rejected(client: TestClient, supabase: None, overrides: dict):
    assert get_me(client, sign(claims(**overrides))).status_code == 401


def test_garbage_token_is_rejected(client: TestClient, supabase: None):
    assert get_me(client, "not-a-jwt").status_code == 401


def test_token_signed_with_another_key_is_rejected(client: TestClient, supabase: None):
    # A forged token: correct-looking claims, but signed by the attacker.
    forged = sign(claims(), key=ATTACKER_PRIVATE_KEY)

    assert get_me(client, forged).status_code == 401


def test_edited_payload_is_rejected(client: TestClient, supabase: None):
    # Take a real token and swap in another user's id, keeping the signature.
    header, _, signature = sign(claims()).split(".")
    other_user = b64url(json.dumps(claims(sub=str(uuid.uuid4())), default=str).encode())

    assert get_me(client, f"{header}.{other_user}.{signature}").status_code == 401


def test_unsigned_token_is_rejected(client: TestClient, supabase: None):
    # alg "none" means "no signature". It must never be accepted.
    unsigned = jwt.encode(claims(), key=None, algorithm="none", headers={"kid": KEY_ID})

    assert get_me(client, unsigned).status_code == 401


def test_algorithm_confusion_is_rejected(client: TestClient, supabase: None):
    # The attacker signs with HS256, using our PUBLIC key as the HMAC secret.
    # A verifier that let the token choose its algorithm would accept this.
    public_pem = SUPABASE_PRIVATE_KEY.public_key().public_bytes(
        serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo
    )
    header = b64url(json.dumps({"alg": "HS256", "typ": "JWT", "kid": KEY_ID}).encode())
    payload = b64url(json.dumps(claims(), default=lambda d: int(d.timestamp())).encode())
    signature = hmac.new(public_pem, f"{header}.{payload}".encode(), hashlib.sha256).digest()

    assert get_me(client, f"{header}.{payload}.{b64url(signature)}").status_code == 401


def test_503_when_auth_is_not_configured(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(settings, "supabase_url", None)
    app.dependency_overrides.pop(get_supabase_keys)

    assert get_me(client, sign(claims())).status_code == 503


def test_503_when_supabase_keys_are_unreachable(client: TestClient, supabase: None):
    class UnreachableJWKS:
        def get_signing_key_from_jwt(self, token: str):
            raise jwt.PyJWKClientConnectionError("timed out")

    app.dependency_overrides[get_supabase_keys] = UnreachableJWKS

    assert get_me(client, sign(claims())).status_code == 503
