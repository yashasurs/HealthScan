from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


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


class SharedRecordSummaryResponse(BaseModel):
    id: str
    filename: str
    content: str
    original_filename: str


class LinkInput(BaseModel):
    link: str = Field(..., description="The link to generate a QR code for.")
