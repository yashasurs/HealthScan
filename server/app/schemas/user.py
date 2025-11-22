from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from ..models import UserRole


class UserCreate(BaseModel):
    username: str
    password: str
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
    family_id: Optional[int] = None
    is_family_admin: bool = False

    class Config:
        from_attributes = True


class UserDelete(BaseModel):
    user_id: int


class CreatorInfo(BaseModel):
    """Information about who created a collection or record"""
    id: int
    first_name: str
    last_name: str
    role: UserRole
    
    class Config:
        from_attributes = True


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
