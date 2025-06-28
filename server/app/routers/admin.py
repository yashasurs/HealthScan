from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from .. import models, schemas, utils, oauth2, database

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Admin dependency
def get_admin_user(current_user: models.User = Depends(oauth2.get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/dashboard", response_model=schemas.AdminStats)
def get_admin_dashboard(
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Get admin dashboard statistics"""
    try:
        total_users = db.query(models.User).count()
        total_patients = db.query(models.User).filter(models.User.role == models.UserRole.PATIENT).count()
        total_doctors = db.query(models.User).filter(models.User.role == models.UserRole.DOCTOR).count()
        total_admins = db.query(models.User).filter(models.User.role == models.UserRole.ADMIN).count()
        total_collections = db.query(models.Collection).count()
        total_records = db.query(models.Record).count()
        verified_doctors = db.query(models.User).filter(
            models.User.role == models.UserRole.DOCTOR,
            models.User.resume_verification_status == True
        ).count()
        unverified_doctors = db.query(models.User).filter(
            models.User.role == models.UserRole.DOCTOR,
            models.User.resume_verification_status != True
        ).count()

        return {
            "total_users": total_users,
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "total_admins": total_admins,
            "total_collections": total_collections,
            "total_records": total_records,
            "verified_doctors": verified_doctors,
            "unverified_doctors": unverified_doctors
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )

@router.get("/users", response_model=List[schemas.AdminUserList])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Get all users with pagination and filtering"""
    try:
        query = db.query(models.User)
        
        # Filter by role if specified
        if role and role.upper() in [r.value.upper() for r in models.UserRole]:
            query = query.filter(models.User.role == models.UserRole(role.lower()))
        
        # Search functionality
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                (models.User.username.ilike(search_filter)) |
                (models.User.email.ilike(search_filter)) |
                (models.User.first_name.ilike(search_filter)) |
                (models.User.last_name.ilike(search_filter))
            )
        
        users = query.offset(skip).limit(limit).all()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}"
        )

@router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Get detailed user information"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/users", response_model=schemas.UserOut)
def create_user(
    user_data: schemas.AdminUserCreate,
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Create a new user with any role"""
    try:
        # Check if email or username already exists
        if db.query(models.User).filter(models.User.email == user_data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        if db.query(models.User).filter(models.User.username == user_data.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")

        # Hash password
        hashed_password = utils.hash(user_data.password)
        
        # Create user
        new_user = models.User(
            email=user_data.email,
            username=user_data.username,
            password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone_number=user_data.phone_number,
            blood_group=user_data.blood_group,
            aadhar=user_data.aadhar,
            allergies=user_data.allergies,
            doctor_name=user_data.doctor_name,
            visit_date=user_data.visit_date,
            role=user_data.role,
            totp_enabled=False,
            specialization=user_data.specialization,
            medical_license_number=user_data.medical_license_number,
            hospital_affiliation=user_data.hospital_affiliation,
            years_of_experience=user_data.years_of_experience
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    user_data: schemas.AdminUserUpdate,
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Update any user's information"""
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields if provided
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )

@router.delete("/users/{user_id}", response_model=schemas.MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Delete any user account"""
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent admin from deleting themselves
        if user.id == admin_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own admin account"
            )
        
        db.delete(user)
        db.commit()
        
        return {"message": f"User {user.username} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )

@router.put("/users/{user_id}/role", response_model=schemas.UserOut)
def update_user_role(
    user_id: int,
    role_data: schemas.RoleUpdateRequest,
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Update a user's role"""
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent admin from changing their own role
        if user.id == admin_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change your own admin role"
            )
        
        old_role = user.role
        user.role = role_data.new_role
        
        # If promoting to doctor, set verification status
        if role_data.new_role == models.UserRole.DOCTOR:
            user.resume_verification_status = True
            user.resume_verification_confidence = 100
        
        db.commit()
        db.refresh(user)
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user role: {str(e)}"
        )

@router.get("/collections", response_model=List[schemas.CollectionResponse])
def get_all_collections(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Get all collections across all users"""
    try:
        collections = db.query(models.Collection).offset(skip).limit(limit).all()
        return collections
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching collections: {str(e)}"
        )

@router.get("/records", response_model=List[schemas.RecordResponse])
def get_all_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Get all records across all users"""
    try:
        records = db.query(models.Record).offset(skip).limit(limit).all()
        return records
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching records: {str(e)}"
        )

@router.delete("/collections/{collection_id}", response_model=schemas.MessageResponse)
def delete_collection(
    collection_id: str,
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Delete any collection"""
    try:
        collection = db.query(models.Collection).filter(models.Collection.id == collection_id).first()
        if not collection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collection not found"
            )
        
        db.delete(collection)
        db.commit()
        
        return {"message": f"Collection {collection.name} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting collection: {str(e)}"
        )

@router.delete("/records/{record_id}", response_model=schemas.MessageResponse)
def delete_record(
    record_id: str,
    db: Session = Depends(database.get_db),
    admin_user: models.User = Depends(get_admin_user)
):
    """Delete any record"""
    try:
        record = db.query(models.Record).filter(models.Record.id == record_id).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Record not found"
            )
        
        db.delete(record)
        db.commit()
        
        return {"message": f"Record {record.filename} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting record: {str(e)}"
        )