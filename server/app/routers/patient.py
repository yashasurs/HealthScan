# Create a new file: server/app/routers/patient.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from .. import models, schemas, oauth2, database

router = APIRouter(
    prefix="/patient",
    tags=["Patient"]
)

@router.post("/assign-doctor", response_model=schemas.AssignDoctorResponse)
def assign_doctor(
    doctor_request: schemas.AssignDoctorRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Assign a doctor to the current patient"""
    # Check if user is a patient
    if current_user.role != models.UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can assign doctors to themselves"
        )
    
    try:
        # Verify the doctor exists and is verified
        doctor = db.query(models.User).filter(
            models.User.id == doctor_request.doctor_id,
            models.User.role == models.UserRole.DOCTOR
        ).first()
        
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found or not verified"
            )
        
        # Assign the doctor to the patient
        current_user.doctor_id = doctor.id
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": f"Successfully assigned Dr. {doctor.first_name} {doctor.last_name} as your doctor",
            "doctor": doctor
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error assigning doctor to patient {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error assigning doctor: {str(e)}"
        )

@router.get("/my-doctor", response_model=Optional[schemas.DoctorInfo])
def get_my_doctor(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get the doctor assigned to the current patient"""
    # Check if user is a patient
    if current_user.role != models.UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can view their assigned doctor"
        )
    
    try:
        if not current_user.doctor_id:
            return None  # No doctor assigned
        
        doctor = db.query(models.User).filter(
            models.User.id == current_user.doctor_id,
            models.User.role == models.UserRole.DOCTOR
        ).first()
        
        return doctor
    
    except Exception as e:
        print(f"Error getting doctor for patient {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving doctor information: {str(e)}"
        )

@router.delete("/remove-doctor", response_model=schemas.MessageResponse)
def remove_doctor(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Remove the assigned doctor from the current patient"""
    # Check if user is a patient
    if current_user.role != models.UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can remove their assigned doctor"
        )
    
    try:
        if not current_user.doctor_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No doctor is currently assigned"
            )
        
        current_user.doctor_id = None
        db.commit()
        
        return {"message": "Doctor successfully removed from your account"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing doctor from patient {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing doctor: {str(e)}"
        )

@router.get("/available-doctors", response_model=List[schemas.DoctorInfo])
def get_available_doctors(
    specialization: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get list of available verified doctors"""
    try:
        query = db.query(models.User).filter(models.User.role == models.UserRole.DOCTOR)
        
        if specialization:
            query = query.filter(models.User.specialization.ilike(f"%{specialization}%"))
        
        doctors = query.all()
        return doctors
    
    except Exception as e:
        print(f"Error getting available doctors: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving doctors list: {str(e)}"
        )