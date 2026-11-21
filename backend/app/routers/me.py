from fastapi import APIRouter

from app.auth import CurrentUser, CurrentUserDep
from app.schemas import UserRead

router = APIRouter(tags=["me"])


@router.get("/me", response_model=UserRead)
def read_me(user: CurrentUserDep) -> CurrentUser:
    return user
