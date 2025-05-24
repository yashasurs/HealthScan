from fastapi import FastAPI
from . import models
from .database import engine
from .routers import ocr

models.Base.metadata.create_all(bind=engine)


app = FastAPI()
app.include_router(ocr.router)

@app.get("/")
def root():
    return {"message": "Welcome to my api!!"}

