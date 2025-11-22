# Family Access Control Implementation Guide

## Current Status

⚠️ **The family admin feature is NOT yet implemented in the routers.**

While the database models and schemas are ready:
- ✅ Family model exists
- ✅ User has `family_id` and `is_family_admin` fields
- ❌ Routes don't check family permissions yet
- ❌ Family admin cannot access member records yet

## Required Changes

### 1. Create Authorization Helper Functions

Create `app/utils/family_auth.py`:

```python
from app.models import User
from typing import Optional

def is_family_admin(user: User, family_id: int) -> bool:
    """Check if user is admin of the specified family"""
    return (
        user.family_id == family_id and 
        user.is_family_admin == True
    )

def can_access_user_records(
    current_user: User, 
    target_user: User
) -> bool:
    """
    Check if current user can access target user's records.
    
    Rules:
    1. User can access their own records
    2. Family admin can access family members' records
    3. Doctors can access their patients' records
    4. Admins can access all records
    """
    from app.models import UserRole
    
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

def get_accessible_user_ids(current_user: User, db) -> list:
    """
    Get list of user IDs that current user can access records for.
    This is useful for querying records efficiently.
    """
    from app.models import UserRole
    
    accessible_ids = [current_user.id]  # Can always access own records
    
    # Admin can access all users
    if current_user.role == UserRole.ADMIN:
        all_users = db.query(User.id).all()
        return [user.id for user in all_users]
    
    # Family admin can access family members
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
    
    return list(set(accessible_ids))  # Remove duplicates
```

### 2. Update Records Router

Modify `app/routers/records.py`:

```python
from ..utils.family_auth import get_accessible_user_ids, can_access_user_records

# Change the get_user_records endpoint
@router.get("/", response_model=List[schemas.RecordResponse])
def get_user_records(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """
    Get all records accessible to the current user.
    - Regular users: see only their own records
    - Family admins: see all family members' records
    - Doctors: see their patients' records
    - Admins: see all records
    """
    accessible_user_ids = get_accessible_user_ids(current_user, db)
    
    records = db.query(models.Record).filter(
        models.Record.user_id.in_(accessible_user_ids)
    ).all()
    
    return records

# Update get_record endpoint to check permissions
@router.get("/{record_id}", response_model=schemas.RecordResponse)
def get_record(
    record_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get a specific record if user has access"""
    record = db.query(models.Record).filter(
        models.Record.id == record_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    # Get the owner of the record
    record_owner = db.query(models.User).filter(
        models.User.id == record.user_id
    ).first()
    
    # Check if current user can access this record
    if not can_access_user_records(current_user, record_owner):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this record"
        )
    
    return record

# Similar updates needed for:
# - update_record
# - delete_record
# - get_record_markup
# - download_record_pdf
```

### 3. Update Collections Router

Modify `app/routers/collections.py`:

```python
from ..utils.family_auth import get_accessible_user_ids, can_access_user_records

@router.get("/", response_model=List[CollectionResponse])
async def get_all_collections(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all collections accessible to the current user.
    - Regular users: see only their own collections
    - Family admins: see all family members' collections
    - Doctors: see their patients' collections
    - Admins: see all collections
    """
    accessible_user_ids = get_accessible_user_ids(current_user, db)
    
    collections = db.query(Collection).filter(
        Collection.user_id.in_(accessible_user_ids)
    ).all()
    
    return collections

# Similar updates for:
# - get_collection
# - update_collection
# - delete_collection
```

### 4. Add Family-Specific Endpoints (Optional but Recommended)

Add `app/routers/family.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, Family, Collection, Record
from ..schemas import (
    FamilyResponse, FamilyMemberInfo,
    CollectionResponse, RecordResponse
)
from ..oauth2 import get_current_user
from ..utils.family_auth import is_family_admin

router = APIRouter(prefix='/family', tags=['family'])

@router.get("/my-family", response_model=FamilyResponse)
def get_my_family(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's family with all members"""
    if not current_user.family_id:
        raise HTTPException(status_code=404, detail="User is not in a family")
    
    family = db.query(Family).filter(
        Family.id == current_user.family_id
    ).first()
    
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    
    return family

@router.get("/members/{user_id}/records", response_model=List[RecordResponse])
def get_family_member_records(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get records of a family member (family admin only).
    """
    # Get target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if users are in same family
    if current_user.family_id != target_user.family_id:
        raise HTTPException(
            status_code=403,
            detail="User is not in your family"
        )
    
    # Check if current user is family admin
    if not current_user.is_family_admin:
        raise HTTPException(
            status_code=403,
            detail="Only family admin can access other members' records"
        )
    
    # Get records
    records = db.query(Record).filter(
        Record.user_id == user_id
    ).all()
    
    return records

@router.get("/members/{user_id}/collections", response_model=List[CollectionResponse])
def get_family_member_collections(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get collections of a family member (family admin only).
    """
    # Similar implementation as above
    # ...
```

Then register it in `app/main.py`:

```python
from .routers import ocr, auth, collections, records, qr, doctor, patient, admin, public, hospitals, family

app.include_router(family.router)
```

## Testing Family Access

### Test Scenario 1: Family Admin Access
```bash
# Login as john_smith (family admin of Smith Family)
curl -X POST http://localhost:8000/login \
  -d "username=john_smith&password=password123"

# Get all records (should include family members' records)
curl http://localhost:8000/records/ \
  -H "Authorization: Bearer <token>"

# Should see records from:
# - john_smith (self)
# - jane_smith (family member)
# - jimmy_smith (family member)
# - julia_smith (family member)
```

### Test Scenario 2: Regular Family Member
```bash
# Login as jane_smith (regular member of Smith Family)
curl -X POST http://localhost:8000/login \
  -d "username=jane_smith&password=password123"

# Get all records (should only see own records)
curl http://localhost:8000/records/ \
  -H "Authorization: Bearer <token>"

# Should only see records from:
# - jane_smith (self only)
```

### Test Scenario 3: Cross-Family Access Denied
```bash
# john_smith tries to access mike_johnson's record
# (mike_johnson is in a different family)
curl http://localhost:8000/records/{mike_record_id} \
  -H "Authorization: Bearer <john_token>"

# Should return: 403 Forbidden
```

## Summary

| Feature | Status | Action Needed |
|---------|--------|---------------|
| Database Models | ✅ Complete | None |
| Schemas | ✅ Complete | None |
| Authorization Helpers | ❌ Missing | Create `family_auth.py` |
| Records Router | ❌ Needs Update | Add family checks |
| Collections Router | ❌ Needs Update | Add family checks |
| Family Router | ❌ Missing | Create `family.py` router |
| Main.py Integration | ❌ Missing | Register family router |

## Recommended Implementation Order

1. ✅ Create `app/utils/family_auth.py` with helper functions
2. ✅ Update `app/routers/records.py` with family access checks
3. ✅ Update `app/routers/collections.py` with family access checks
4. ✅ Create `app/routers/family.py` for family-specific endpoints
5. ✅ Register family router in `app/main.py`
6. ✅ Test with seed data users
7. ✅ Add unit tests for authorization logic

## Quick Answer

**Current State:** No, family admins do NOT currently have access to family members' records. The database structure is ready, but the authorization logic hasn't been implemented in the API routes yet.

**What's Needed:** Update the routers to check `is_family_admin` and `family_id` fields when determining record access.
