from typing import List
from pydantic import BaseModel, Field


class OCRResponse(BaseModel):
    content: str


class MarkupResponse(BaseModel):
    markup: str = Field(description="The markup content of the record.")


class FormattingRequest(BaseModel):
    texts: List[str] = Field(..., description="The texts to format")
    separator: str = Field(..., description="The separator used to split the texts")


class OcrResponseGemini(BaseModel):
    """Response schema for OCR processing"""
    content: str 
    confidence: float
