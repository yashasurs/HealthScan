from sqlalchemy import TIMESTAMP, DateTime, Column, ForeignKey, Integer, String, Text, Boolean, text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base
import enum

class UserRole(enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String(15), nullable=False)
    aadhar = Column(String(12), nullable=True)  # Optional 12-digit Aadhar number
    allergies = Column(Text, nullable=True)
    doctor_name = Column(String(100), nullable=True)
    visit_date = Column(DateTime, nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
    blood_group = Column(String(3), nullable=False)  # Blood group (e.g., A+, O-, etc.)
    totp_secret = Column(String(100), nullable=True)  # Secret key for TOTP
    totp_enabled = Column(Boolean, default=False)  # Whether 2FA is enabled
    role = Column(Enum(UserRole), nullable=False, default=UserRole.PATIENT)
    resume_verification_status = Column(Boolean, nullable=True)
    resume_verification_confidence = Column(Integer, nullable=True)
    
    # Doctor-specific fields
    specialization = Column(String(100), nullable=True)
    medical_license_number = Column(String(50), nullable=True)
    hospital_affiliation = Column(String(100), nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    
    # Add doctor-patient relationship
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Patient's assigned doctor
    
    # Relationships
    collections = relationship("Collection", back_populates="owner", cascade="all, delete-orphan")
    records = relationship("Record", back_populates="owner", cascade="all, delete-orphan")
    
    # Doctor-Patient relationships
    doctor = relationship("User", remote_side=[id], backref="patients")
    # This creates a self-referential relationship where:
    # - A doctor can have many patients (via backref "patients")
    # - A patient can have one doctor (via "doctor")


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


class Share(Base):
    __tablename__ = "shares"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    share_token = Column(String(64), unique=True, index=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    
    # What's being shared
    collection_id = Column(String(36), ForeignKey("collections.id"), nullable=True)
    record_id = Column(String(36), ForeignKey("records.id"), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    creator = relationship("User")
    collection = relationship("Collection")
    record = relationship("Record")