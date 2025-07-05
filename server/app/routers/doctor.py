from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, oauth2, database, utils

router = APIRouter(
    tags=["Doctor"],
    prefix='/doctor'

)

@router.get("/dashboard", response_model=schemas.DoctorDashboard)
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

@router.post("/register", response_model=schemas.DoctorVerificationResult)
async def register_doctor(
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
        # Read the resume file content
        resume_content = await resume.read()
        
        # Create and use the ResumeVerifierAgent
        resume_verification_agent = utils.ResumeVerifierAgent()
        
        # Get verification result from the agent
        verification_result = await resume_verification_agent.verify_resume(resume_content)
        
        # Check if verification was successful
        if verification_result.veridication_status:
            # Update user role to doctor
            current_user.role = models.UserRole.DOCTOR
            current_user.resume_verification_status = True
            current_user.resume_verification_confidence = verification_result.confidence
            db.commit()
            db.refresh(current_user)
            
            return {
                "success": True,
                "message": verification_result.message or "Doctor registration successful - your medical credentials have been verified.",
                "verification_confidence": verification_result.confidence,
                "user_id": current_user.id,
                "verification_status": True
            }
        else:
            # Store verification attempt but don't change role
            current_user.resume_verification_status = False
            current_user.resume_verification_confidence = verification_result.confidence
            db.commit()
            db.refresh(current_user)
            
            return {
                "success": False,
                "message": verification_result.message or "Resume verification failed. Please submit a valid medical resume with clear medical credentials.",
                "verification_confidence": verification_result.confidence,
                "user_id": current_user.id,
                "verification_status": False
            }
            
    except Exception as e:
        # Log the error for debugging
        print(f"Error in doctor registration: {str(e)}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )

@router.get("/patients", response_model=List[schemas.PatientInfo])
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
    
    # Return the actual patient objects, not manually constructed dictionaries
    return patients

@router.put("/info", response_model=schemas.UserOut)
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

@router.get("/patient/{patient_id}/records", response_model=List[schemas.RecordOut])
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
        models.Record.user_id == patient_id
    ).all()
    
    return records
