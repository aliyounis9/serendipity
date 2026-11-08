import uuid
from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Plan
from app.schemas import PlanCreate, PlanRead

router = APIRouter(prefix="/plans", tags=["plans"])

MAX_RESULTS = 50

DbSession = Annotated[Session, Depends(get_db)]


@router.post("", response_model=PlanRead, status_code=status.HTTP_201_CREATED)
def create_plan(plan_in: PlanCreate, db: DbSession) -> Plan:
    plan = Plan(**plan_in.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)  # load created_at, which PostgreSQL generated
    return plan


@router.get("", response_model=list[PlanRead])
def list_upcoming_plans(db: DbSession) -> Sequence[Plan]:
    statement = (
        select(Plan)
        .where(Plan.starts_at > func.now())  # the database's clock
        .order_by(Plan.starts_at)
        .limit(MAX_RESULTS)
    )
    return db.scalars(statement).all()


@router.get("/{plan_id}", response_model=PlanRead)
def get_plan(plan_id: uuid.UUID, db: DbSession) -> Plan:
    plan = db.get(Plan, plan_id)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan
