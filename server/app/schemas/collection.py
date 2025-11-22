from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from .user import CreatorInfo
from .record import RecordResponse, SummaryRecordResponse


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
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    records: List[RecordResponse] = []
    creator: Optional[CreatorInfo] = None  # Who created this collection
    
    class Config:
        from_attributes = True


class CollectionSummaryResponse(BaseModel):
    collection: CollectionResponse
    summaries: List[SummaryRecordResponse]


class CollectionSummaryContent(BaseModel):
    collection_id: str
    collection_name: str
    summary_content: str
    record_count: int


class DoctorCollectionCreate(BaseModel):
    """Schema for doctor creating a collection for a patient"""
    patient_id: int
    name: str
    description: Optional[str] = None
