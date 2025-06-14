from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from . import models
from .database import engine
from .routers import ocr, auth, collections, records, qr

models.Base.metadata.create_all(bind=engine)


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
