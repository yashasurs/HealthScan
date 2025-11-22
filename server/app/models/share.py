from sqlalchemy import DateTime, Column, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


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
