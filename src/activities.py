from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models, schemas

router = APIRouter()

def enrich(act):
    act.account_name = act.account_rel.name if act.account_rel else None
    return act

@router.get("/", response_model=list[schemas.ActivityOut])
def list_activities(db: Session = Depends(get_db)):
    acts = db.query(models.Activity).order_by(models.Activity.created_at.desc()).all()
    return [enrich(a) for a in acts]

@router.post("/", response_model=schemas.ActivityOut, status_code=201)
def create_activity(payload: schemas.ActivityCreate, db: Session = Depends(get_db)):
    act = models.Activity(**payload.model_dump())
    db.add(act)
    db.commit()
    db.refresh(act)
    return enrich(act)

@router.delete("/{activity_id}", status_code=204)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(act)
    db.commit()
