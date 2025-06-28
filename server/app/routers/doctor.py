from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils, oauth2, database

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"]
)

@router.post("/verify", response_model=schemas.DoctorVerificationResult)
async def verify_doctor(
    resume: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Verify a user as a doctor by submitting their medical credentials
    This endpoint allows existing users to upgrade their role from patient to doctor
    """
    try:
        # Check if user is already a doctor
        if current_user.role == models.UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already verified as a doctor"
            )
        
        # Only patients can apply to become doctors
        if current_user.role != models.UserRole.PATIENT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can apply for doctor verification"
            )
        
        # Read the file content
        resume_content = await resume.read()
        
        # Verify resume using the ResumeVerifierAgent
        resume_agent = utils.ResumeVerifierAgent()
        verification_result = await resume_agent.verify_resume(resume_content)
        
        if verification_result.veridication_status:
            # Resume verified, update user to doctor role
            current_user.role = models.UserRole.DOCTOR
            current_user.resume_verification_status = True
            current_user.resume_verification_confidence = verification_result.confidence
            
            db.commit()
            db.refresh(current_user)
            
            return {
                "message": "Your medical credentials have been verified. Your account has been upgraded to doctor status.",
                "verification_status": True,
                "verification_confidence": verification_result.confidence
            }
        else:
            # Resume verification failed
            print(f"Verification failed: {verification_result.message}")
            return {
                "message": verification_result.message or "Your doctor verification could not be completed. Please try again with clearer credentials.",
                "verification_status": False,
                "verification_confidence": verification_result.confidence if hasattr(verification_result, 'confidence') else 0
            }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing doctor verification: {str(e)}"
        )

@router.get("/status", response_model=schemas.MessageResponse)
def check_doctor_status(current_user = Depends(oauth2.get_current_user)):
    """Check the verification status of a doctor account"""
    print("------------------->")
    print(current_user.role)
    if current_user.role == models.UserRole.DOCTOR:
        return {"message": "Your doctor account is verified and active."}
    elif current_user.role == models.UserRole.PENDING_DOCTOR:
        return {"message": "Your doctor verification is still pending. We'll notify you once the process is complete."}
    else:
        return {"message": "You are currently registered as a patient. To upgrade to a doctor account, please submit your medical credentials for verification."}

@router.post("/update-info", response_model=schemas.UserOut)
def update_doctor_info(
    doctor_info: schemas.DoctorInfoUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Update doctor-specific information"""
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified doctors can update doctor information"
        )
    
    # Update doctor-specific fields
    if doctor_info.specialization is not None:
        current_user.specialization = doctor_info.specialization
    if doctor_info.medical_license_number is not None:
        current_user.medical_license_number = doctor_info.medical_license_number
    if doctor_info.hospital_affiliation is not None:
        current_user.hospital_affiliation = doctor_info.hospital_affiliation
    if doctor_info.years_of_experience is not None:
        current_user.years_of_experience = doctor_info.years_of_experience
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/patients", response_model=List[schemas.PatientInfo])
def get_doctor_patients(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get all patients assigned to the current doctor"""
    # Check if user is a verified doctor
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified doctors can access patient lists"
        )
    
    try:
        # Get all patients assigned to this doctor
        patients = db.query(models.User).filter(
            models.User.doctor_id == current_user.id,
            models.User.role == models.UserRole.PATIENT
        ).all()
        
        print(f"Doctor {current_user.username} has {len(patients)} patients")
        
        return patients
    
    except Exception as e:
        print(f"Error getting patients for doctor {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving patient list: {str(e)}"
        )

@router.get("/patient/{patient_id}", response_model=schemas.PatientInfo)
def get_patient_details(
    patient_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get detailed information about a specific patient"""
    # Check if user is a verified doctor
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified doctors can access patient details"
        )
    
    try:
        # Get the specific patient and verify they belong to this doctor
        patient = db.query(models.User).filter(
            models.User.id == patient_id,
            models.User.doctor_id == current_user.id,
            models.User.role == models.UserRole.PATIENT
        ).first()
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found or not assigned to you"
            )
        
        return patient
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting patient {patient_id} for doctor {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving patient details: {str(e)}"
        )