from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, oauth2, database
from ..utils.family_auth import can_access_user_records

router = APIRouter(
    prefix="/family",
    tags=["Family"]
)


@router.post("/", response_model=schemas.FamilyResponse, status_code=status.HTTP_201_CREATED)
@router.post("/create", response_model=schemas.FamilyResponse, status_code=status.HTTP_201_CREATED)
def create_family(
    family: schemas.FamilyCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """
    Create a new family and set the current user as the family admin.
    The user must not already belong to a family.
    """
    # Check if user already belongs to a family
    if current_user.family_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already belong to a family. Leave your current family first."
        )
    
    # Create the family
    new_family = models.Family(name=family.name)
    db.add(new_family)
    db.commit()
    db.refresh(new_family)
    
    # Add current user to the family as admin
    current_user.family_id = new_family.id
    current_user.is_family_admin = True
    db.commit()
    db.refresh(current_user)
    
    return new_family


@router.get("/my-family", response_model=schemas.FamilyResponse)
def get_my_family(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get the current user's family information"""
    if current_user.family_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not part of any family"
        )
    
    family = db.query(models.Family).filter(models.Family.id == current_user.family_id).first()
    if not family:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found"
        )
    
    return family


@router.get("/my-family/members", response_model=List[schemas.FamilyMemberInfo])
def get_family_members(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get all members of the current user's family"""
    if current_user.family_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not part of any family"
        )
    
    members = db.query(models.User).filter(
        models.User.family_id == current_user.family_id
    ).all()
    
    return members


@router.post("/add-member", response_model=schemas.MessageResponse)
def add_family_member(
    request: schemas.AddFamilyMemberRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """
    Add a member to the family (family admin only).
    The user to be added must not already belong to any family.
    """
    # Check if current user is family admin
    if not current_user.is_family_admin or current_user.family_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only family admins can add members"
        )
    
    # Get the user to be added
    user_to_add = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user_to_add:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user already belongs to a family
    if user_to_add.family_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already belongs to a family"
        )
    
    # Add user to the family
    user_to_add.family_id = current_user.family_id
    user_to_add.is_family_admin = False
    db.commit()
    
    return {"message": f"Successfully added {user_to_add.first_name} {user_to_add.last_name} to the family"}


@router.post("/remove-member", response_model=schemas.MessageResponse)
def remove_family_member(
    request: schemas.RemoveFamilyMemberRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """
    Remove a member from the family (family admin only).
    Cannot remove the family admin themselves.
    """
    # Check if current user is family admin
    if not current_user.is_family_admin or current_user.family_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only family admins can remove members"
        )
    
    # Get the user to be removed
    user_to_remove = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user_to_remove:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user belongs to the same family
    if user_to_remove.family_id != current_user.family_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a member of your family"
        )
    
    # Cannot remove the admin themselves
    if user_to_remove.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Family admin cannot remove themselves. Transfer admin role first or delete the family."
        )
    
    # Remove user from the family
    user_to_remove.family_id = None
    user_to_remove.is_family_admin = False
    db.commit()
    
    return {"message": f"Successfully removed {user_to_remove.first_name} {user_to_remove.last_name} from the family"}


@router.post("/leave", response_model=schemas.MessageResponse)
def leave_family(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """
    Leave the current family.
    Family admin must transfer admin role or delete the family first.
    """
    if current_user.family_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not part of any family"
        )
    
    # Family admin cannot leave without transferring admin role
    if current_user.is_family_admin:
        # Check if there are other members
        member_count = db.query(models.User).filter(
            models.User.family_id == current_user.family_id
        ).count()
        
        if member_count > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Family admin must transfer admin role to another member before leaving, or remove all members first."
            )
        # If admin is the only member, allow them to leave and delete the family
        family_id = current_user.family_id
        current_user.family_id = None
        current_user.is_family_admin = False
        
        # Delete the empty family
        family = db.query(models.Family).filter(models.Family.id == family_id).first()
        if family:
            db.delete(family)
        
        db.commit()
        return {"message": "Successfully left the family. The family has been deleted."}
    
    # Regular member can leave
    current_user.family_id = None
    db.commit()
    
    return {"message": "Successfully left the family"}


@router.post("/transfer-admin", response_model=schemas.MessageResponse)
def transfer_admin_role(
    request: schemas.TransferFamilyAdminRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """
    Transfer family admin role to another family member (current admin only).
    """
    # Check if current user is family admin
    if not current_user.is_family_admin or current_user.family_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only family admins can transfer the admin role"
        )
    
    # Get the new admin
    new_admin = db.query(models.User).filter(models.User.id == request.new_admin_user_id).first()
    if not new_admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user belongs to the same family
    if new_admin.family_id != current_user.family_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a member of your family"
        )
    
    # Cannot transfer to self
    if new_admin.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already the family admin"
        )
    
    # Transfer admin role
    current_user.is_family_admin = False
    new_admin.is_family_admin = True
    db.commit()
    
    return {"message": f"Successfully transferred admin role to {new_admin.first_name} {new_admin.last_name}"}


@router.delete("/", response_model=schemas.MessageResponse)
def delete_family(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """
    Delete the family (family admin only).
    All members will be removed from the family.
    """
    # Check if current user is family admin
    if not current_user.is_family_admin or current_user.family_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only family admins can delete the family"
        )
    
    family_id = current_user.family_id
    
    # Remove all members from the family
    members = db.query(models.User).filter(models.User.family_id == family_id).all()
    for member in members:
        member.family_id = None
        member.is_family_admin = False
    
    # Delete the family
    family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if family:
        db.delete(family)
    
    db.commit()
    
    return {"message": "Family has been deleted and all members have been removed"}


@router.get("/members/{member_id}/records", response_model=List[schemas.RecordResponse])
def get_family_member_records(
    member_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """
    Get all medical records for a specific family member.
    Only accessible by family admins or the member themselves.
    """
    # Get the target user to verify they exist
    target_user = db.query(models.User).filter(models.User.id == member_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if current user can access the target user's records
    if not can_access_user_records(current_user, target_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this member's records"
        )
    
    # Verify the target user is in the same family (for family admins)
    if current_user.is_family_admin and current_user.id != member_id:
        if target_user.family_id != current_user.family_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user is not in your family"
            )
    
    # Get all records for the member
    records = db.query(models.Record).filter(
        models.Record.user_id == member_id
    ).order_by(models.Record.created_at.desc()).all()
    
    return records


@router.get("/members/{member_id}/collections", response_model=List[schemas.CollectionResponse])
def get_family_member_collections(
    member_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """
    Get all collections for a specific family member.
    Only accessible by family admins or the member themselves.
    """
    # Get the target user to verify they exist
    target_user = db.query(models.User).filter(models.User.id == member_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if current user can access the target user's records
    if not can_access_user_records(current_user, target_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this member's collections"
        )
    
    # Verify the target user is in the same family (for family admins)
    if current_user.is_family_admin and current_user.id != member_id:
        if target_user.family_id != current_user.family_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user is not in your family"
            )
    
    # Get all collections for the member
    collections = db.query(models.Collection).filter(
        models.Collection.user_id == member_id
    ).order_by(models.Collection.created_at.desc()).all()
    
    return collections

