from fastapi import FastAPI
from pydantic_settings import BaseSettings

from . import models
from .config import settings
from .database import engine
from .routers import auth, post, user

models.Base.metadata.create_all(bind=engine)


app = FastAPI()

app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Welcome to my api!!"}

