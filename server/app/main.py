from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from . import models  # This imports all models from models/__init__.py
from .database import engine, Base
from .routers import ocr, auth, collections, records, qr, doctor, patient, admin, public, hospitals, family

# Initialize database tables
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created/verified successfully")
except Exception as e:
    print(f"ERROR creating database tables: {e}")
    if os.environ.get("ENV") == "production" or os.environ.get("PORT"):
        print("Fatal error in production environment. Exiting.")
        sys.exit(1)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(ocr.router)
app.include_router(auth.router)
app.include_router(collections.router)
app.include_router(records.router)
app.include_router(qr.router)
app.include_router(doctor.router)  
app.include_router(patient.router)
app.include_router(admin.router)
app.include_router(public.router)
app.include_router(hospitals.router)
app.include_router(family.router)

@app.get("/")
def root():
    return {"message": "Welcome to my api!!"}

@app.get("/health")
def health_check():
    import os
    from .database import SQLALCHEMY_DATABASE_URL
    
    # Return some diagnostic information
    return {
        "status": "ok",
        "database_configured": bool(SQLALCHEMY_DATABASE_URL),
        "database_type": "postgresql" if SQLALCHEMY_DATABASE_URL and "postgresql" in SQLALCHEMY_DATABASE_URL else "unknown",
        "environment": os.environ.get("ENV", "development"),
        "port": os.environ.get("PORT", "8000")
    }
