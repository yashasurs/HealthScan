from datetime import datetime
from typing import Optional, List

from pydantic import Field, BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


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
    aadhar: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[datetime] = None

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
    aadhar: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[datetime] = None

    class Config:
        from_attributes = True

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

