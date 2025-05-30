from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils, oauth2, database

router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if email or username already exists
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = utils.hash(user.password)

    new_user = models.User(
        email=user.email,
        username=user.username,
        password=hashed_password,
        blood_group=user.blood_group,
        aadhar=user.aadhar,
        allergies=user.allergies,
        doctor_name=user.doctor_name,
        visit_date=user.visit_date
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = oauth2.create_access_token(data={"user_id": new_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    """Login endpoint that works with both Swagger UI and API clients"""
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not utils.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = oauth2.create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.delete("/user")
def delete_user(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_obj = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user_obj)
    db.commit()
    return {"detail": "User deleted"}

@router.get("/users")
def get_all_users(db: Session = Depends(database.get_db)):
    users = db.query(models.User).all()
    return users

@router.put("/user", response_model=schemas.UserOut)
def update_user(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_obj = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    if user_update.username:
        # Check if username is taken by another user
        if db.query(models.User).filter(models.User.username == user_update.username, models.User.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="Username already taken")
        user_obj.username = user_update.username
    if user_update.email:
        # Check if email is taken by another user
        if db.query(models.User).filter(models.User.email == user_update.email, models.User.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        user_obj.email = user_update.email
    if user_update.blood_group:
        user_obj.blood_group = user_update.blood_group
    if user_update.aadhar is not None:
        user_obj.aadhar = user_update.aadhar
    if user_update.allergies is not None:
        user_obj.allergies = user_update.allergies
    if user_update.doctor_name is not None:
        user_obj.doctor_name = user_update.doctor_name
    if user_update.visit_date is not None:
        user_obj.visit_date = user_update.visit_date
    db.commit()
    db.refresh(user_obj)
    return user_obj

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(oauth2.get_current_user)):
    return current_user
