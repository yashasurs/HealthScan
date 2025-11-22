from sqlalchemy import TIMESTAMP, DateTime, Column, ForeignKey, Integer, String, Text, Boolean, text, Enum
from sqlalchemy.orm import relationship
from ..database import Base
from .base import UserRole, doctor_hospitals


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
    
    # Family relationship
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)  # User's family
    is_family_admin = Column(Boolean, default=False)  # Whether user is the family admin
    
    # Relationships
    collections = relationship("Collection", back_populates="owner", cascade="all, delete-orphan", foreign_keys="Collection.user_id")
    records = relationship("Record", back_populates="owner", cascade="all, delete-orphan", foreign_keys="Record.user_id")
    
    # Doctor-Patient relationships
    doctor = relationship("User", remote_side=[id], backref="patients", foreign_keys=[doctor_id])
    # This creates a self-referential relationship where:
    # - A doctor can have many patients (via backref "patients")
    # - A patient can have one doctor (via "doctor")
    
    # Doctor-Hospital many-to-many relationship
    hospitals = relationship("Hospital", secondary=doctor_hospitals, back_populates="doctors")
    
    # Family relationship
    family = relationship("Family", back_populates="members")
