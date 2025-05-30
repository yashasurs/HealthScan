from datetime import datetime
from typing import Optional, List

from pydantic import Field, BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: int | None = None


class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(UserLogin):
    email: EmailStr
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
    blood_group: Optional[str] = None
    aadhar: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[datetime] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    blood_group: str
    aadhar: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[datetime] = None

    class Config:
        from_attributes = True

