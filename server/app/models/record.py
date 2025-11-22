from sqlalchemy import DateTime, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class Record(Base):
    __tablename__ = "records"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    filename = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)  # Extracted text from OCR
    file_size = Column(Integer, nullable=True)  # File size in bytes
    file_type = Column(String(50), nullable=True)  # MIME type
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Owner of the record
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Who created it (patient or doctor)
    collection_id = Column(String(36), ForeignKey("collections.id"), nullable=True)  # Nullable for standalone records
    
    # Relationships
    owner = relationship("User", back_populates="records", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by_id])
    collection = relationship("Collection", back_populates="records")
