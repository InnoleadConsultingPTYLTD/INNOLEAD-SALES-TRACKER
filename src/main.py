from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import accounts, opportunities, activities, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Innolead CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router,      prefix="/api/accounts",      tags=["Accounts"])
app.include_router(opportunities.router, prefix="/api/opportunities", tags=["Opportunities"])
app.include_router(activities.router,    prefix="/api/activities",    tags=["Activities"])
app.include_router(users.router,         prefix="/api/users",         tags=["Users"])

@app.get("/")
def root():
    return {"message": "Innolead CRM API is running"}
