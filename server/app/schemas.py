from datetime import datetime
from typing import Optional, List

from pydantic import Field, BaseModel, EmailStr, field_validator
from .models import UserRole

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    require_totp: bool = False


class TokenData(BaseModel):
    id: int | None = None
    token_type: str | None = None
    role: str 


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

    @field_validator('blood_group')
    @classmethod
    def validate_blood_group(cls, v):
        valid_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        if v.upper() not in valid_groups:
            raise ValueError(f'Invalid blood group. Must be one of: {", ".join(valid_groups)}')
        return v.upper()

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        # Extract only digits
        cleaned = ''.join(filter(str.isdigit, v))
        # Check if original string has any invalid characters (anything other than digits, spaces, dashes, parentheses)
        allowed_chars = set('0123456789 -()')
        if not all(c in allowed_chars for c in v):
            raise ValueError('Invalid phone number format')
        # Check if we have exactly 10 digits
        if len(cleaned) != 10:
            raise ValueError('Phone number must contain exactly 10 digits')
        return cleaned  # Return digits only

    @field_validator('aadhar')
    @classmethod
    def validate_aadhar(cls, v):
        if v is not None:  # Only validate if aadhar is provided (it's optional)
            # Extract only digits
            cleaned = ''.join(filter(str.isdigit, v))
            # Check if original string has any invalid characters (anything other than digits, spaces, dashes)
            allowed_chars = set('0123456789 -')
            if not all(c in allowed_chars for c in v):
                raise ValueError('Invalid Aadhar number format')
            # Check if we have exactly 12 digits
            if len(cleaned) != 12:
                raise ValueError('Aadhar number must contain exactly 12 digits')
            return cleaned  # Return digits only
        return v

# Add doctor registration schema
class DoctorRegistration(BaseModel):
    user: UserCreate
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

class RecordOut(BaseModel):
    """Schema for record output"""
    id: str
    filename: str
    content: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    owner_id: int
    collection_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

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

    @field_validator('blood_group')
    @classmethod
    def validate_blood_group(cls, v):
        if v is not None:  # Only validate if blood_group is provided
            valid_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            if v.upper() not in valid_groups:
                raise ValueError(f'Invalid blood group. Must be one of: {", ".join(valid_groups)}')
            return v.upper()
        return v

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        if v is not None:  # Only validate if phone_number is provided
            # Extract only digits
            cleaned = ''.join(filter(str.isdigit, v))
            # Check if original string has any invalid characters (anything other than digits, spaces, dashes, parentheses)
            allowed_chars = set('0123456789 -()')
            if not all(c in allowed_chars for c in v):
                raise ValueError('Phone number can only contain digits, spaces, dashes, and parentheses')
            # Check if we have exactly 10 digits
            if len(cleaned) != 10:
                raise ValueError('Phone number must contain exactly 10 digits')
            return cleaned  # Return digits only
        return v

    @field_validator('aadhar')
    @classmethod
    def validate_aadhar(cls, v):
        if v is not None:  # Only validate if aadhar is provided
            # Extract only digits
            cleaned = ''.join(filter(str.isdigit, v))
            # Check if original string has any invalid characters (anything other than digits, spaces, dashes)
            allowed_chars = set('0123456789 -')
            if not all(c in allowed_chars for c in v):
                raise ValueError('Aadhar number can only contain digits, spaces, and dashes')
            # Check if we have exactly 12 digits
            if len(cleaned) != 12:
                raise ValueError('Aadhar number must contain exactly 12 digits')
            return cleaned  # Return digits only
        return v

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

    @field_validator('blood_group')
    @classmethod
    def validate_blood_group(cls, v):
        valid_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        if v.upper() not in valid_groups:
            raise ValueError(f'Invalid blood group. Must be one of: {", ".join(valid_groups)}')
        return v.upper()

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        # Extract only digits
        cleaned = ''.join(filter(str.isdigit, v))
        # Check if original string has any invalid characters (anything other than digits, spaces, dashes, parentheses)
        allowed_chars = set('0123456789 -()')
        if not all(c in allowed_chars for c in v):
            raise ValueError('Phone number can only contain digits, spaces, dashes, and parentheses')
        # Check if we have exactly 10 digits
        if len(cleaned) != 10:
            raise ValueError('Phone number must contain exactly 10 digits')
        return cleaned  # Return digits only

    @field_validator('aadhar')
    @classmethod
    def validate_aadhar(cls, v):
        if v is not None:  # Only validate if aadhar is provided (it's optional)
            # Extract only digits
            cleaned = ''.join(filter(str.isdigit, v))
            # Check if original string has any invalid characters (anything other than digits, spaces, dashes)
            allowed_chars = set('0123456789 -')
            if not all(c in allowed_chars for c in v):
                raise ValueError('Aadhar number can only contain digits, spaces, and dashes')
            # Check if we have exactly 12 digits
            if len(cleaned) != 12:
                raise ValueError('Aadhar number must contain exactly 12 digits')
            return cleaned  # Return digits only
        return v

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

    @field_validator('blood_group')
    @classmethod
    def validate_blood_group(cls, v):
        if v is not None:  # Only validate if blood_group is provided
            valid_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            if v.upper() not in valid_groups:
                raise ValueError(f'Invalid blood group. Must be one of: {", ".join(valid_groups)}')
            return v.upper()
        return v

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        if v is not None:  # Only validate if phone_number is provided
            # Extract only digits
            cleaned = ''.join(filter(str.isdigit, v))
            # Check if original string has any invalid characters (anything other than digits, spaces, dashes, parentheses)
            allowed_chars = set('0123456789 -()')
            if not all(c in allowed_chars for c in v):
                raise ValueError('Phone number can only contain digits, spaces, dashes, and parentheses')
            # Check if we have exactly 10 digits
            if len(cleaned) != 10:
                raise ValueError('Phone number must contain exactly 10 digits')
            return cleaned  # Return digits only
        return v

    @field_validator('aadhar')
    @classmethod
    def validate_aadhar(cls, v):
        if v is not None:  # Only validate if aadhar is provided
            # Extract only digits
            cleaned = ''.join(filter(str.isdigit, v))
            # Check if original string has any invalid characters (anything other than digits, spaces, dashes)
            allowed_chars = set('0123456789 -')
            if not all(c in allowed_chars for c in v):
                raise ValueError('Aadhar number can only contain digits, spaces, and dashes')
            # Check if we have exactly 12 digits
            if len(cleaned) != 12:
                raise ValueError('Aadhar number must contain exactly 12 digits')
            return cleaned  # Return digits only
        return v

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
    content: str 
    confidence: float

class ManualRecordCreate(BaseModel):
    """Schema for manually creating a record"""
    filename: str
    content: str
    collection_id: Optional[str] = None
    file_type: Optional[str] = "text/plain"
    
    class Config:
        json_schema_extra = {
            "example": {
                "filename": "Medical Report - 2024-01-15.txt",
                "content": "Patient visited today with symptoms of...",
                "collection_id": "optional-collection-id",
                "file_type": "text/plain"
            }
        }

class ManualRecordUpdate(BaseModel):
    """Schema for updating a manual record"""
    filename: Optional[str] = None
    content: Optional[str] = None
    collection_id: Optional[str] = None
    file_type: Optional[str] = None