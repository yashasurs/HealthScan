from datetime import datetime
from typing import Optional, List

from pydantic import Field, BaseModel, EmailStr
from .models import UserRole

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    require_totp: bool = False


class TokenData(BaseModel):
    id: int | None = None
    token_type: str | None = None


class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(UserLogin):
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str
    blood_group: str
    role: UserRole = UserRole.PATIENT
    aadhar: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[datetime] = None

# Add doctor registration schema
class DoctorRegistration(BaseModel):
    user: UserCreate
    resume: str = Field(..., description="Base64 encoded image of doctor's resume")

class UserDelete(BaseModel):
    user_id: int

class OCRResponse(BaseModel):
    content: str

class RecordBase(BaseModel):
    filename: str
    content: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None

class RecordCreate(RecordBase):
    collection_id: Optional[str] = None

class RecordUpdate(BaseModel):
    filename: Optional[str] = None
    content: Optional[str] = None

class RecordResponse(RecordBase):
    id: str
    user_id: int
    collection_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CollectionBase(BaseModel):
    name: str
    description: Optional[str] = None

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CollectionResponse(CollectionBase):
    id: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    records: List[RecordResponse] = []
    
    class Config:
        from_attributes = True

class MarkupResponse(BaseModel):
    markup: str = Field(description="The markup content of the record.")

class FormattingRequest(BaseModel):
    texts: List[str] = Field(..., description="The texts to format")
    separator: str = Field(..., description="The separator used to split the texts")

class LinkInput(BaseModel):
    link: str = Field(..., description="The link to generate a QR code for.")

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    blood_group: Optional[str] = None
    aadhar: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[datetime] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str
    blood_group: str
    role: UserRole
    aadhar: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[datetime] = None
    totp_enabled: bool = False
    resume_verification_status: Optional[bool] = None
    resume_verification_confidence: Optional[float] = None

    class Config:
        from_attributes = True


class TOTPSetup(BaseModel):
    totp_secret: str
    provisioning_uri: str


class TOTPVerify(BaseModel):
    totp_code: str


class TOTPDisable(BaseModel):
    totp_code: str


class LoginResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None
    require_totp: bool = False
    user_id: Optional[int] = None


class MessageResponse(BaseModel):
    message: str

class SummaryRecordResponse(BaseModel):
    original_record_id: str
    original_filename: str
    summary_record_id: Optional[str] = None
    summary_filename: Optional[str] = None
    error: Optional[str] = None

class CollectionSummaryResponse(BaseModel):
    collection: CollectionResponse
    summaries: List[SummaryRecordResponse]

class SharedCollectionResponse(BaseModel):
    collection: dict
    records: List[dict]

class SharedRecordResponse(BaseModel):
    id: str
    filename: str
    content: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    created_at: datetime

class RecordSummaryResponse(RecordResponse):
    original_record_id: Optional[str] = None
    original_filename: Optional[str] = None

class SharedRecordSummaryResponse(BaseModel):
    id: str
    filename: str
    content: str
    original_filename: str

class CollectionSummaryContent(BaseModel):
    collection_id: str
    collection_name: str
    summary_content: str
    record_count: int


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

class PatientInfo(BaseModel):
    """Basic patient information for doctor's patient list"""
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    phone_number: str
    blood_group: str
    allergies: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DoctorInfo(BaseModel):
    """Basic doctor information"""
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    specialization: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    years_of_experience: Optional[int] = None

    class Config:
        from_attributes = True

class AssignDoctorRequest(BaseModel):
    """Request to assign a doctor to a patient"""
    doctor_id: int

class AssignDoctorResponse(BaseModel):
    """Response after assigning a doctor"""
    message: str
    doctor: DoctorInfo

class AdminUserCreate(BaseModel):
    """Schema for admin to create users with any role"""
    email: EmailStr
    username: str
    password: str
    first_name: str
    last_name: str
    phone_number: str
    blood_group: str
    role: UserRole
    aadhar: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[datetime] = None
    # Doctor-specific fields
    specialization: Optional[str] = None
    medical_license_number: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    years_of_experience: Optional[int] = None

class AdminUserUpdate(BaseModel):
    """Schema for admin to update users"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    blood_group: Optional[str] = None
    role: Optional[UserRole] = None
    aadhar: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[datetime] = None
    specialization: Optional[str] = None
    medical_license_number: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    years_of_experience: Optional[int] = None
    doctor_id: Optional[int] = None

class AdminUserList(BaseModel):
    """Schema for admin user list view"""
    id: int
    email: str
    username: str
    first_name: str
    last_name: str
    phone_number: str
    role: UserRole
    created_at: datetime
    totp_enabled: bool
    resume_verification_status: Optional[bool] = None
    specialization: Optional[str] = None
    medical_license_number: Optional[str] = None
    hospital_affiliation: Optional[str] = None

    class Config:
        from_attributes = True

class AdminStats(BaseModel):
    """Admin dashboard statistics"""
    total_users: int
    total_patients: int
    total_doctors: int
    total_admins: int
    total_collections: int
    total_records: int
    verified_doctors: int
    unverified_doctors: int

class RoleUpdateRequest(BaseModel):
    """Request to update user role"""
    user_id: int
    new_role: UserRole

class OcrResponseGemini(BaseModel):
    """Response schema for OCR processing"""
    text: str 
    confidence: float