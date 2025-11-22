from sqlalchemy import DateTime, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Owner of the collection
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Who created it (patient or doctor)
    
    # Relationships
    owner = relationship("User", back_populates="collections", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by_id])
    records = relationship("Record", back_populates="collection", cascade="all, delete-orphan")
