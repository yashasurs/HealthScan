from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class FamilyBase(BaseModel):
    name: str


class FamilyCreate(FamilyBase):
    """Schema for creating a new family"""
    pass


class FamilyUpdate(BaseModel):
    """Schema for updating family information"""
    name: Optional[str] = None


class FamilyMemberInfo(BaseModel):
    """Basic member information for family member list"""
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    phone_number: str
    blood_group: str
    is_family_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class FamilyResponse(FamilyBase):
    """Schema for family response with members"""
    id: int
    created_at: datetime
    members: List[FamilyMemberInfo] = []
    
    class Config:
        from_attributes = True


class FamilyInfo(BaseModel):
    """Basic family information without members"""
    id: int
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class AddFamilyMemberRequest(BaseModel):
    """Request to add a user to a family"""
    user_id: int
    is_family_admin: bool = False


class RemoveFamilyMemberRequest(BaseModel):
    """Request to remove a user from a family"""
    user_id: int


class TransferFamilyAdminRequest(BaseModel):
    """Request to transfer family admin rights to another member"""
    new_admin_user_id: int
