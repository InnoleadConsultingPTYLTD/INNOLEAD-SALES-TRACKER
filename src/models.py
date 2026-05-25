from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False, index=True)
    industry   = Column(String, nullable=True)
    phone      = Column(String, nullable=True)
    email      = Column(String, nullable=True)
    owner      = Column(String, nullable=True)
    website    = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    opportunities = relationship("Opportunity", back_populates="account_rel", cascade="all, delete")
    activities    = relationship("Activity",    back_populates="account_rel", cascade="all, delete")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    account_id  = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    stage       = Column(String, default="Prospecting")
    value       = Column(Float, default=0)
    probability = Column(Float, default=0)
    owner       = Column(String, nullable=True)
    close_date  = Column(Date, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    account_rel = relationship("Account", back_populates="opportunities")


class Activity(Base):
    __tablename__ = "activities"

    id          = Column(Integer, primary_key=True, index=True)
    type        = Column(String, nullable=False)
    account_id  = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    owner       = Column(String, nullable=True)
    date        = Column(Date, nullable=True)
    followup    = Column(Date, nullable=True)
    notes       = Column(Text, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    account_rel = relationship("Account", back_populates="activities")


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    email      = Column(String, nullable=False, unique=True, index=True)
    role       = Column(String, default="Sales Rep")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
