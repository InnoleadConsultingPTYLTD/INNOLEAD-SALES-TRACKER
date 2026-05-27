from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
from schemas import ActivityCreate, ActivityUpdate, ActivityOut
import models

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/", response_model=List[ActivityOut])
def list_activities(
    type:    Optional[str] = Query(None, description="Filter by type: Call, Email, Meeting, Note"),
    account: Optional[str] = Query(None, description="Filter by account name"),
    owner:   Optional[str] = Query(None, description="Filter by owner"),
    db:      Session = Depends(get_db),
    _:       models.User = Depends(get_current_user),
):
    q = db.query(models.Activity)
    if type:
        q = q.filter(models.Activity.type == type)
    if account:
        q = q.filter(models.Activity.account == account)
    if owner:
        q = q.filter(models.Activity.owner == owner)
    return q.order_by(models.Activity.created_at.desc()).all()


@router.post("/", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(
    body: ActivityCreate,
    db:   Session = Depends(get_db),
    _:    models.User = Depends(get_current_user),
):
    activity = models.Activity(**body.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.get("/{activity_id}", response_model=ActivityOut)
def get_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    _:  models.User = Depends(get_current_user),
):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


@router.patch("/{activity_id}", response_model=ActivityOut)
def update_activity(
    activity_id: str,
    body: ActivityUpdate,
    db:   Session = Depends(get_db),
    _:    models.User = Depends(get_current_user),
):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    _:  models.User = Depends(get_current_user),
):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()
