from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


# ── Account ──────────────────────────────────────────────────────────────────
class AccountBase(BaseModel):
    name:     str
    industry: Optional[str] = None
    phone:    Optional[str] = None
    email:    Optional[str] = None
    owner:    Optional[str] = None
    website:  Optional[str] = None

class AccountCreate(AccountBase):
    pass

class AccountOut(AccountBase):
    id:         int
    created_at: datetime
    class Config:
        from_attributes = True


# ── Opportunity ───────────────────────────────────────────────────────────────
class OpportunityBase(BaseModel):
    name:        str
    account_id:  Optional[int] = None
    stage:       Optional[str] = "Prospecting"
    value:       Optional[float] = 0
    probability: Optional[float] = 0
    owner:       Optional[str] = None
    close_date:  Optional[date] = None

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityUpdate(BaseModel):
    owner: Optional[str] = None
    stage: Optional[str] = None

class OpportunityOut(OpportunityBase):
    id:           int
    created_at:   datetime
    account_name: Optional[str] = None
    class Config:
        from_attributes = True


# ── Activity ──────────────────────────────────────────────────────────────────
class ActivityBase(BaseModel):
    type:       str
    account_id: Optional[int] = None
    owner:      Optional[str] = None
    date:       Optional[date] = None
    followup:   Optional[date] = None
    notes:      Optional[str] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityOut(ActivityBase):
    id:           int
    created_at:   datetime
    account_name: Optional[str] = None
    class Config:
        from_attributes = True


# ── User ──────────────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    name:  str
    email: str
    role:  Optional[str] = "Sales Rep"

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id:         int
    created_at: datetime
    class Config:
        from_attributes = True
