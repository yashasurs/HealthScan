from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, oauth2, database, utils
import base64

router = APIRouter(tags=["Doctor"])

@router.get("/doctor/dashboard", response_model=schemas.DoctorDashboard)
def get_doctor_dashboard(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get doctor dashboard with patient statistics"""
    # Check if user is a doctor
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Doctor privileges required."
        )
    
    # Get patient statistics
    total_patients = db.query(models.User).filter(
        models.User.doctor_id == current_user.id
    ).count()
    
    # Get recent patients (last 10)
    recent_patients = db.query(models.User).filter(
        models.User.doctor_id == current_user.id
    ).order_by(models.User.created_at.desc()).limit(10).all()
    
    return {
        "doctor_info": {
            "id": current_user.id,
            "name": f"{current_user.first_name} {current_user.last_name}",
            "email": current_user.email,
            "specialization": current_user.specialization,
            "medical_license_number": current_user.medical_license_number,
            "hospital_affiliation": current_user.hospital_affiliation,
            "years_of_experience": current_user.years_of_experience
        },
        "total_patients": total_patients,
        "recent_patients": [
            {
                "id": patient.id,
                "name": f"{patient.first_name} {patient.last_name}",
                "email": patient.email,
                "phone_number": patient.phone_number,
                "blood_group": patient.blood_group,
                "last_visit": patient.visit_date
            } for patient in recent_patients
        ]
    }

@router.post("/doctor/register", response_model=schemas.DoctorVerificationResult)
def register_doctor(
    resume: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Register as a doctor with resume verification"""
    if current_user.role == models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already registered as a doctor"
        )
    
    try:
        # Read and encode the resume file
        resume_content = resume.file.read()
        resume_base64 = base64.b64encode(resume_content).decode('utf-8')
        
        # Here you would integrate with an AI service to verify the resume
        # For now, we'll simulate the verification
        verification_confidence = 85.0  # Simulated confidence score
        is_verified = verification_confidence >= 80.0
        
        if is_verified:
            # Update user role to doctor
            current_user.role = models.UserRole.DOCTOR
            current_user.resume_verification_status = True
            current_user.resume_verification_confidence = verification_confidence
            db.commit()
            
            return {
                "success": True,
                "message": "Doctor registration successful",
                "verification_confidence": verification_confidence,
                "user_id": current_user.id
            }
        else:
            # Store verification attempt but don't change role
            current_user.resume_verification_status = False
            current_user.resume_verification_confidence = verification_confidence
            db.commit()
            
            return {
                "success": False,
                "message": "Resume verification failed. Please submit a valid medical resume.",
                "verification_confidence": verification_confidence,
                "user_id": current_user.id
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )

@router.get("/doctor/patients", response_model=List[schemas.PatientInfo])
def get_doctor_patients(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get all patients assigned to the doctor"""
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Doctor privileges required."
        )
    
    patients = db.query(models.User).filter(
        models.User.doctor_id == current_user.id
    ).all()
    
    return [
        {
            "id": patient.id,
            "name": f"{patient.first_name} {patient.last_name}",
            "email": patient.email,
            "phone_number": patient.phone_number,
            "blood_group": patient.blood_group,
            "aadhar": patient.aadhar,
            "allergies": patient.allergies,
            "last_visit": patient.visit_date,
            "created_at": patient.created_at
        } for patient in patients
    ]

@router.put("/doctor/info", response_model=schemas.UserOut)
def update_doctor_info(
    doctor_update: schemas.DoctorInfoUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Update doctor-specific information"""
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Doctor privileges required."
        )
    
    # Update doctor-specific fields
    if doctor_update.specialization is not None:
        current_user.specialization = doctor_update.specialization
    if doctor_update.medical_license_number is not None:
        current_user.medical_license_number = doctor_update.medical_license_number
    if doctor_update.hospital_affiliation is not None:
        current_user.hospital_affiliation = doctor_update.hospital_affiliation
    if doctor_update.years_of_experience is not None:
        current_user.years_of_experience = doctor_update.years_of_experience
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/doctor/patient/{patient_id}/records", response_model=List[schemas.RecordOut])
def get_patient_records(
    patient_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get all records for a specific patient (doctor only)"""
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Doctor privileges required."
        )
    
    # Verify the patient is assigned to this doctor
    patient = db.query(models.User).filter(
        models.User.id == patient_id,
        models.User.doctor_id == current_user.id
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or not assigned to you"
        )
    
    records = db.query(models.Record).filter(
        models.Record.owner_id == patient_id
    ).all()
    
    return records
