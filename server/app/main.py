from fastapi import FastAPI
from . import models
from .database import engine
from .routers import ocr, auth

models.Base.metadata.create_all(bind=engine)


app = FastAPI()
app.include_router(ocr.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Welcome to my api!!"}

