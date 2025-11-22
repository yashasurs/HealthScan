from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from ..models import UserRole


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
