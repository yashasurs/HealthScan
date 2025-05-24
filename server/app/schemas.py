from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: int | None = None


class UserLogin(BaseModel):
    username: str
    password: str


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