from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
from schemas import OpportunityCreate, OpportunityUpdate, OpportunityOut
import models

router = APIRouter(prefix="/opportunities", tags=["opportunities"])


@router.get("/", response_model=List[OpportunityOut])
def list_opportunities(
    stage:  Optional[str] = Query(None, description="Filter by stage"),
    db:     Session = Depends(get_db),
    _:      models.User = Depends(get_current_user),
):
    q = db.query(models.Opportunity)
    if stage:
        q = q.filter(models.Opportunity.stage == stage)
    return q.order_by(models.Opportunity.created.desc()).all()


@router.post("/", response_model=OpportunityOut, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    body: OpportunityCreate,
    db:   Session = Depends(get_db),
    _:    models.User = Depends(get_current_user),
):
    opp = models.Opportunity(**body.model_dump())
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return opp


@router.get("/{opp_id}", response_model=OpportunityOut)
def get_opportunity(
    opp_id: str,
    db: Session = Depends(get_db),
    _:  models.User = Depends(get_current_user),
):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp


@router.patch("/{opp_id}", response_model=OpportunityOut)
def update_opportunity(
    opp_id: str,
    body:   OpportunityUpdate,
    db:     Session = Depends(get_db),
    _:      models.User = Depends(get_current_user),
):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(opp, field, value)
    db.commit()
    db.refresh(opp)
    return opp


@router.delete("/{opp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity(
    opp_id: str,
    db: Session = Depends(get_db),
    _:  models.User = Depends(get_current_user),
):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    db.delete(opp)
    db.commit()
