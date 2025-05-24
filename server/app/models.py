from sqlalchemy import TIMESTAMP, DateTime, Column, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
    
    # Relationships
    collections = relationship("Collection", back_populates="owner", cascade="all, delete-orphan")
    records = relationship("Record", back_populates="owner", cascade="all, delete-orphan")


class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="collections")
    records = relationship("Record", back_populates="collection", cascade="all, delete-orphan")


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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    collection_id = Column(String(36), ForeignKey("collections.id"), nullable=True)  # Nullable for standalone records
    
    # Relationships
    owner = relationship("User", back_populates="records")
    collection = relationship("Collection", back_populates="records")