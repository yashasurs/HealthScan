from sqlalchemy import TIMESTAMP, Column, Integer, String, text
from sqlalchemy.orm import relationship
from ..database import Base


class Family(Base):
    __tablename__ = "families"
    
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), 
        nullable=False, 
        server_default=text("CURRENT_TIMESTAMP")
    )
    
    # Relationships
    # One family has many users (members)
    members = relationship("User", back_populates="family", cascade="all, delete-orphan")
