from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


class HospitalBase(BaseModel):
    name: str
    address: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None


class HospitalCreate(HospitalBase):
    pass


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None


class HospitalResponse(HospitalBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class AddDoctorToHospitalRequest(BaseModel):
    doctor_id: int
