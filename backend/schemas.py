from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ─── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name:     str       = Field(..., min_length=1, max_length=120)
    email:    EmailStr
    password: str       = Field(..., min_length=6)
    role:     str       = "Sales Rep"

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None


# ─── User ──────────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id:      str
    name:    str
    email:   str
    role:    str
    created: date

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name:  Optional[str] = None
    role:  Optional[str] = None


# ─── Account ───────────────────────────────────────────────────────────────────
class AccountCreate(BaseModel):
    name:     str = Field(..., min_length=1, max_length=120)
    industry: Optional[str] = None
    phone:    Optional[str] = None
    email:    Optional[str] = None
    owner:    Optional[str] = None
    website:  Optional[str] = None

class AccountOut(AccountCreate):
    id:      str
    created: date

    class Config:
        from_attributes = True


# ─── Opportunity ───────────────────────────────────────────────────────────────
class OpportunityCreate(BaseModel):
    name:       str = Field(..., min_length=1)
    account:    Optional[str] = None      # display name
    account_id: Optional[str] = None     # FK
    stage:      str = "Prospecting"
    value:      float = 0.0
    prob:       int   = Field(0, ge=0, le=100)
    owner:      Optional[str] = None
    close:      Optional[date] = None

class OpportunityUpdate(BaseModel):
    name:    Optional[str]   = None
    account: Optional[str]   = None
    stage:   Optional[str]   = None
    value:   Optional[float] = None
    prob:    Optional[int]   = Field(None, ge=0, le=100)
    owner:   Optional[str]   = None
    close:   Optional[date]  = None

class OpportunityOut(OpportunityCreate):
    id:      str
    created: date

    class Config:
        from_attributes = True


# ─── Activity ──────────────────────────────────────────────────────────────────
class ActivityCreate(BaseModel):
    type:       str = "Call"
    account:    Optional[str] = None
    account_id: Optional[str] = None
    owner:      Optional[str] = None
    date:       Optional[date] = None
    followup:   Optional[date] = None
    notes:      Optional[str]  = None

class ActivityUpdate(BaseModel):
    type:     Optional[str]  = None
    account:  Optional[str]  = None
    owner:    Optional[str]  = None
    date:     Optional[date] = None
    followup: Optional[date] = None
    notes:    Optional[str]  = None

class ActivityOut(ActivityCreate):
    id:         str
    created_at: datetime

    class Config:
        from_attributes = True
