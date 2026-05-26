import uuid
from datetime import date, datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean,
    Date, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ─── User ──────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id            = Column(String, primary_key=True, default=gen_uuid)
    name          = Column(String(120), nullable=False)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    role          = Column(String(50), default="Sales Rep")
    hashed_password = Column(String(255), nullable=False)
    created       = Column(Date, default=date.today)
    is_active     = Column(Boolean, default=True)


# ─── Account ───────────────────────────────────────────────────────────────────
class Account(Base):
    __tablename__ = "accounts"

    id       = Column(String, primary_key=True, default=gen_uuid)
    name     = Column(String(120), nullable=False)
    industry = Column(String(80))
    phone    = Column(String(50))
    email    = Column(String(255))
    owner    = Column(String(120))
    website  = Column(String(255))
    created  = Column(Date, default=date.today)

    opportunities = relationship("Opportunity", back_populates="account_rel", cascade="all, delete-orphan")
    activities    = relationship("Activity", back_populates="account_rel", cascade="all, delete-orphan")


# ─── Opportunity ───────────────────────────────────────────────────────────────
class Opportunity(Base):
    __tablename__ = "opportunities"

    id         = Column(String, primary_key=True, default=gen_uuid)
    name       = Column(String(120), nullable=False)
    account_id = Column(String, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    account    = Column(String(120))          # denormalised display name
    stage      = Column(String(50), default="Prospecting")
    value      = Column(Float, default=0.0)
    prob       = Column(Integer, default=0)   # probability 0–100
    owner      = Column(String(120))
    close      = Column(Date, nullable=True)
    created    = Column(Date, default=date.today)

    account_rel = relationship("Account", back_populates="opportunities")


# ─── Activity ──────────────────────────────────────────────────────────────────
class Activity(Base):
    __tablename__ = "activities"

    id         = Column(String, primary_key=True, default=gen_uuid)
    type       = Column(String(30), default="Call")   # Call / Email / Meeting / Note
    account_id = Column(String, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    account    = Column(String(120))                  # denormalised display name
    owner      = Column(String(120))
    date       = Column(Date, default=date.today)
    followup   = Column(Date, nullable=True)
    notes      = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    account_rel = relationship("Account", back_populates="activities")
