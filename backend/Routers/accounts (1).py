from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
from schemas import AccountCreate, AccountOut
import models

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/", response_model=List[AccountOut])
def list_accounts(
    db: Session = Depends(get_db),
    _:  models.User = Depends(get_current_user),
):
    return db.query(models.Account).order_by(models.Account.created.desc()).all()


@router.post("/", response_model=AccountOut, status_code=status.HTTP_201_CREATED)
def create_account(
    body: AccountCreate,
    db:   Session = Depends(get_db),
    _:    models.User = Depends(get_current_user),
):
    account = models.Account(**body.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/{account_id}", response_model=AccountOut)
def get_account(
    account_id: str,
    db: Session = Depends(get_db),
    _:  models.User = Depends(get_current_user),
):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.put("/{account_id}", response_model=AccountOut)
def update_account(
    account_id: str,
    body: AccountCreate,
    db:   Session = Depends(get_db),
    _:    models.User = Depends(get_current_user),
):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: str,
    db: Session = Depends(get_db),
    _:  models.User = Depends(get_current_user),
):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
