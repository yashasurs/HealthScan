from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import ocr, auth, collections, records

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

@app.get("/")
def root():
    return {"message": "Welcome to my api!!"}
