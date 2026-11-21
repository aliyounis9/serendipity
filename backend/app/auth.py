import uuid
from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

# Reads the token from the "Authorization: Bearer <token>" header.
bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    id: uuid.UUID


@lru_cache
def get_supabase_keys() -> jwt.PyJWKClient:
    # Supabase's public keys, downloaded once and then cached.
    if not settings.supabase_url:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Authentication isn't configured")
    return jwt.PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json", cache_keys=True)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    keys: Annotated[jwt.PyJWKClient, Depends(get_supabase_keys)],
) -> CurrentUser:
    # Same answer for every bad token, so callers can't tell which check failed.
    not_authenticated = HTTPException(
        status.HTTP_401_UNAUTHORIZED, "Not authenticated", headers={"WWW-Authenticate": "Bearer"}
    )
    if credentials is None:
        raise not_authenticated

    token = credentials.credentials
    try:
        key = keys.get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            key,
            algorithms=["ES256", "RS256"],  # Supabase's; never "none" or HS256
            audience="authenticated",
            issuer=f"{settings.supabase_url}/auth/v1",
            options={"require": ["exp", "sub"]},
        )
        return CurrentUser(id=uuid.UUID(claims["sub"]))
    except jwt.PyJWKClientConnectionError:
        # Supabase is unreachable. Not the user's fault, so not a 401.
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Authentication is unavailable") from None
    except (jwt.PyJWTError, ValueError):
        raise not_authenticated from None


CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]
