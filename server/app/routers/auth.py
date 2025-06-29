from fastapi import APIRouter, Depends, HTTPException, status, Response, File, UploadFile, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import qrcode
import io
from .. import models, schemas, utils, oauth2, database

router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """Register a new user (always as patient by default)"""
    # Check if email or username already exists
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Override any role in the request - all users start as patients
    hashed_password = utils.hash(user.password)    
    new_user = models.User(
        email=user.email,
        username=user.username,
        password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        blood_group=user.blood_group,
        aadhar=user.aadhar,
        allergies=user.allergies,
        doctor_name=user.doctor_name,
        visit_date=user.visit_date,
        totp_enabled=False,
        role=models.UserRole.PATIENT  # Always set as PATIENT
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate tokens
    access_token = oauth2.create_access_token(data={"user_id": new_user.id})
    refresh_token = oauth2.create_refresh_token(data={"user_id": new_user.id})
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "require_totp": False
    }


@router.post("/login", response_model=schemas.LoginResponse)
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
    
    # Check if 2FA is enabled for this user
    if user.totp_enabled:
        return {
            "require_totp": True,
            "user_id": user.id
        }
    
    # If 2FA is not enabled, proceed with normal login
    access_token = oauth2.create_access_token(data={"user_id": user.id})
    refresh_token = oauth2.create_refresh_token(data={"user_id": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "require_totp": False,
        "user_id": user.id
    }

@router.post("/login/verify-totp", response_model=schemas.Token)
def verify_totp(
    totp_data: schemas.TOTPVerify,
    user_id: int,
    db: Session = Depends(database.get_db)
):
    """Verify TOTP code and complete login if successful"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    if not user.totp_enabled or not user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TOTP not enabled for this user"
        )
    
    # Verify the TOTP code
    if not oauth2.verify_totp(user.totp_secret, totp_data.totp_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code"
        )
    
    # Code is valid, generate tokens
    access_token = oauth2.create_access_token(data={"user_id": user.id})
    refresh_token = oauth2.create_refresh_token(data={"user_id": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "require_totp": False
    }

@router.post("/totp/setup")
def setup_totp(
    response_format: str = "json",
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Generate and setup TOTP for a user
    
    Parameters:
    - response_format: Set to "qrcode" to return QR code image directly, or "json" for JSON response
    """
    # Generate a new TOTP secret
    totp_secret = oauth2.generate_totp_secret()
    
    # Generate the provisioning URI
    provisioning_uri = oauth2.get_totp_provisioning_uri(
        current_user.username, 
        totp_secret
    )
    
    # Store the secret but don't enable it yet (verification required)
    current_user.totp_secret = totp_secret
    db.commit()
    
    # Return QR code image if requested
    if response_format == "qrcode":
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        # Create an image from the QR code
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert image to bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        # Return the image
        return Response(content=img_byte_arr.getvalue(), media_type="image/png")
    
    # Return JSON response by default
    return schemas.TOTPSetup(
        totp_secret=totp_secret,
        provisioning_uri=provisioning_uri
    )

@router.post("/totp/activate", response_model=schemas.MessageResponse)
def activate_totp(
    totp_data: schemas.TOTPVerify,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Verify and activate TOTP for a user"""
    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TOTP setup required before activation"
        )
    
    # Verify the TOTP code
    if not oauth2.verify_totp(current_user.totp_secret, totp_data.totp_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code"
        )
    
    # Enable TOTP for the user
    current_user.totp_enabled = True
    db.commit()
    
    return {"message": "TOTP successfully enabled"}

@router.post("/totp/disable", response_model=schemas.MessageResponse)
def disable_totp(
    totp_data: schemas.TOTPDisable,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Disable TOTP for a user"""
    if not current_user.totp_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TOTP is not enabled for this user"
        )
    
    # Verify the TOTP code one last time
    if not oauth2.verify_totp(current_user.totp_secret, totp_data.totp_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code"
        )
    
    # Disable and clear TOTP info
    current_user.totp_enabled = False
    current_user.totp_secret = None
    db.commit()
    
    return {"message": "TOTP successfully disabled"}

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
    
    # Handle username update
    if user_update.username:
        if db.query(models.User).filter(models.User.username == user_update.username, models.User.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="Username already taken")
        user_obj.username = user_update.username
    
    # Handle email update
    if user_update.email:
        if db.query(models.User).filter(models.User.email == user_update.email, models.User.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        user_obj.email = user_update.email
    
    # Handle required fields
    if user_update.first_name is not None:
        user_obj.first_name = user_update.first_name
    if user_update.last_name is not None:
        user_obj.last_name = user_update.last_name
    if user_update.phone_number is not None:
        user_obj.phone_number = user_update.phone_number
    
    # Handle optional fields
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

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(refresh_token: str, db: Session = Depends(database.get_db)):
    """Endpoint to get a new access token using a refresh token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify the refresh token
    token_data = oauth2.verify_refresh_token(refresh_token, credentials_exception)
    
    # Get the user from the database
    user = db.query(models.User).filter(models.User.id == token_data.id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate new tokens
    new_access_token = oauth2.create_access_token(data={"user_id": user.id})
    new_refresh_token = oauth2.create_refresh_token(data={"user_id": user.id})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(oauth2.get_current_user)):
    return current_user
