from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models, schemas

router = APIRouter()

def enrich(opp):
    opp.account_name = opp.account_rel.name if opp.account_rel else None
    return opp

@router.get("/", response_model=list[schemas.OpportunityOut])
def list_opportunities(db: Session = Depends(get_db)):
    opps = db.query(models.Opportunity).order_by(models.Opportunity.created_at.desc()).all()
    return [enrich(o) for o in opps]

@router.post("/", response_model=schemas.OpportunityOut, status_code=201)
def create_opportunity(payload: schemas.OpportunityCreate, db: Session = Depends(get_db)):
    opp = models.Opportunity(**payload.model_dump())
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return enrich(opp)

@router.patch("/{opp_id}", response_model=schemas.OpportunityOut)
def update_opportunity(opp_id: int, payload: schemas.OpportunityUpdate, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(opp, k, v)
    db.commit()
    db.refresh(opp)
    return enrich(opp)

@router.delete("/{opp_id}", status_code=204)
def delete_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    db.delete(opp)
    db.commit()
