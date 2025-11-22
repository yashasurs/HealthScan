from sqlalchemy import Table, Column, Integer, ForeignKey
from ..database import Base
import enum

class UserRole(enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


# Association table for many-to-many relationship between doctors and hospitals
doctor_hospitals = Table(
    'doctor_hospitals',
    Base.metadata,
    Column('doctor_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('hospital_id', Integer, ForeignKey('hospitals.id'), primary_key=True)
)
