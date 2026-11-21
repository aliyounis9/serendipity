from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.auth import CurrentUser, CurrentUserDep
from app.database import get_db
from app.models import Profile
from app.schemas import MeRead, ProfileUpdate

router = APIRouter(prefix="/me", tags=["me"])

DbSession = Annotated[Session, Depends(get_db)]


def to_me(user: CurrentUser, profile: Profile) -> MeRead:
    return MeRead(id=user.id, email=user.email, display_name=profile.display_name, bio=profile.bio)


@router.get("", response_model=MeRead)
def read_me(user: CurrentUserDep, db: DbSession) -> MeRead:
    profile = db.get(Profile, user.id)
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not set up")
    return to_me(user, profile)


@router.put("", response_model=MeRead)
def set_my_profile(changes: ProfileUpdate, user: CurrentUserDep, db: DbSession) -> MeRead:
    values = changes.model_dump()
    # Insert the profile, or update it if it already exists. 
    statement = (
        insert(Profile)
        .values(id=user.id, **values)
        .on_conflict_do_update(index_elements=[Profile.id], set_=values)
        .returning(Profile)
    )
    profile = db.scalars(statement).one()
    db.commit()
    return to_me(user, profile)
