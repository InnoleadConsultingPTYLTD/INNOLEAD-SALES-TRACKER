import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine, Base
import models  # ensure models are registered before create_all

from routers import auth, accounts, opportunities, activities, users

load_dotenv()

# ─── Create tables ─────────────────────────────────────────────────────────────
# In production you'd use Alembic migrations instead, but this is fine for
# initial deployment and development.
Base.metadata.create_all(bind=engine)

# ─── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Innolead CRM API",
    version="1.0.0",
    description="FastAPI + PostgreSQL backend for Innolead Sales CRM",
)

# ─── CORS ──────────────────────────────────────────────────────────────────────
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
origins = [o.strip() for o in raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(opportunities.router)
app.include_router(activities.router)
app.include_router(users.router)


# ─── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}
