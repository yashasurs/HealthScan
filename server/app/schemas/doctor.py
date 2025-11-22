from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from ..models import UserRole
from .user import PatientInfo


class DoctorRegistration(BaseModel):
    user: "UserCreate"  # Forward reference to avoid circular import
    resume: str = Field(..., description="Base64 encoded image of doctor's resume")


class DoctorDashboardInfo(BaseModel):
    """Doctor information for dashboard"""
    id: int
    name: str
    email: str
    specialization: Optional[str] = None
    medical_license_number: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    years_of_experience: Optional[int] = None


class RecentPatientInfo(BaseModel):
    """Recent patient information for dashboard"""
    id: int
    name: str
    email: str
    phone_number: str
    blood_group: str
    last_visit: Optional[datetime] = None


class DoctorDashboard(BaseModel):
    """Schema for doctor dashboard data"""
    doctor_info: DoctorDashboardInfo
    total_patients: int
    recent_patients: List[RecentPatientInfo]


class ResumeVerifierResponse(BaseModel):
    """Schema for AI verification of doctor resume"""
    veridication_status: bool
    confidence: int
    message: str = "Resume verification complete"


class DoctorVerificationResult(BaseModel):
    """Schema for the result of doctor registration and verification"""
    message: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None
    verification_status: bool
    verification_confidence: int = 0


class DoctorInfoUpdate(BaseModel):
    """Schema for updating doctor-specific information"""
    specialization: Optional[str] = None
    medical_license_number: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    years_of_experience: Optional[int] = None


class DoctorInfo(BaseModel):
    """Public doctor information"""
    id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str
    specialization: Optional[str] = None
    medical_license_number: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    years_of_experience: Optional[int] = None
    resume_verification_status: Optional[bool] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AssignDoctorRequest(BaseModel):
    """Request to assign a doctor to a patient"""
    doctor_id: int


class AssignDoctorResponse(BaseModel):
    """Response after assigning a doctor"""
    message: str
    doctor: DoctorInfo


# Import at the end to avoid circular import
from .user import UserCreate
DoctorRegistration.model_rebuild()
