from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
from schemas import UserOut, UserUpdate
import models

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _:  models.User = Depends(get_current_user),
):
    return db.query(models.User).order_by(models.User.created.desc()).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    _:  models.User = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    body:    UserUpdate,
    db:      Session = Depends(get_db),
    current: models.User = Depends(get_current_user),
):
    # Only allow users to edit themselves, or Admins to edit anyone
    if current.id != user_id and current.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorised to edit this user")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    db:      Session = Depends(get_db),
    current: models.User = Depends(get_current_user),
):
    if current.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can delete users")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
