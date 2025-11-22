"""
Family-based authorization helpers for HealthScan.
These functions determine what users and records a user can access based on:
- Own records (everyone)
- Family admin status (family admins can access all family member records)
- Doctor-patient relationship (doctors can access their patients)
- Admin role (admins can access everything)
"""

from app.models import User, UserRole
from sqlalchemy.orm import Session
from typing import List


def is_family_admin(user: User, family_id: int) -> bool:
    """
    Check if user is admin of the specified family.
    
    Args:
        user: The user to check
        family_id: The family ID to check against
        
    Returns:
        True if user is admin of the specified family, False otherwise
    """
    return (
        user.family_id == family_id and 
        user.is_family_admin == True
    )


def can_access_user_records(current_user: User, target_user: User) -> bool:
    """
    Check if current user can access target user's records.
    
    Access Rules:
    1. Users can always access their own records
    2. Family admins can access all family members' records
    3. Doctors can access their assigned patients' records
    4. Admins can access all records
    
    Args:
        current_user: The user requesting access
        target_user: The user whose records are being accessed
        
    Returns:
        True if access is allowed, False otherwise
    """
    # User can access their own records
    if current_user.id == target_user.id:
        return True
    
    # Admin can access all records
    if current_user.role == UserRole.ADMIN:
        return True
    
    # Family admin can access family members' records
    if (current_user.is_family_admin and 
        current_user.family_id and 
        current_user.family_id == target_user.family_id):
        return True
    
    # Doctor can access their patients' records
    if (current_user.role == UserRole.DOCTOR and
        target_user.doctor_id == current_user.id):
        return True
    
    return False


def get_accessible_user_ids(current_user: User, db: Session) -> List[int]:
    """
    Get list of user IDs whose records the current user can access.
    This is useful for efficiently querying records and collections.
    
    Access includes:
    - Own records (always)
    - Family members' records (if family admin)
    - Patients' records (if doctor)
    - All records (if admin)
    
    Args:
        current_user: The user requesting access
        db: Database session
        
    Returns:
        List of user IDs that current user can access
    """
    accessible_ids = [current_user.id]  # Can always access own records
    
    # Admin can access all users
    if current_user.role == UserRole.ADMIN:
        all_users = db.query(User.id).all()
        return [user.id for user in all_users]
    
    # Family admin can access all family members
    if current_user.is_family_admin and current_user.family_id:
        family_members = db.query(User.id).filter(
            User.family_id == current_user.family_id
        ).all()
        accessible_ids.extend([member.id for member in family_members])
    
    # Doctor can access their patients
    if current_user.role == UserRole.DOCTOR:
        patients = db.query(User.id).filter(
            User.doctor_id == current_user.id
        ).all()
        accessible_ids.extend([patient.id for patient in patients])
    
    # Remove duplicates and return
    return list(set(accessible_ids))


def can_modify_user_record(current_user: User, target_user: User) -> bool:
    """
    Check if current user can modify (edit/delete) target user's records.
    
    Modification Rules:
    1. Users can modify their own records
    2. Family admins can modify family members' records
    3. Doctors can modify their patients' records (creating on their behalf)
    4. Admins can modify all records
    
    Args:
        current_user: The user requesting modification
        target_user: The user whose records are being modified
        
    Returns:
        True if modification is allowed, False otherwise
    """
    # Same rules as read access for now
    # You can make this more restrictive if needed
    return can_access_user_records(current_user, target_user)
