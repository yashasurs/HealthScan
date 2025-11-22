from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from .user import CreatorInfo


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


class RecordResponse(RecordBase):
    id: str
    user_id: int
    created_by_id: Optional[int] = None
    collection_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    creator: Optional[CreatorInfo] = None  # Who created this record
    
    class Config:
        from_attributes = True


class RecordSummaryResponse(RecordResponse):
    original_record_id: Optional[str] = None
    original_filename: Optional[str] = None


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


class SummaryRecordResponse(BaseModel):
    original_record_id: str
    original_filename: str
    summary_record_id: Optional[str] = None
    summary_filename: Optional[str] = None
    error: Optional[str] = None


class DoctorRecordCreate(BaseModel):
    """Schema for doctor creating a record for a patient"""
    patient_id: int
    filename: str
    content: str
    collection_id: Optional[str] = None
    file_type: Optional[str] = "text/plain"
