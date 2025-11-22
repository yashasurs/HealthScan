from sqlalchemy import TIMESTAMP, Column, Integer, String, text
from sqlalchemy.orm import relationship
from ..database import Base
from .base import doctor_hospitals


class Hospital(Base):
    __tablename__ = "hospitals"
    
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(200), nullable=False)
    address = Column(String(500), nullable=True)
    phone_number = Column(String(15), nullable=True)
    email = Column(String, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    
    # Many-to-many relationship with doctors
    doctors = relationship("User", secondary=doctor_hospitals, back_populates="hospitals")
