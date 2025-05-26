from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from .. import schemas, models, database, oauth2


router = APIRouter(
    prefix="/records",
    tags=['records']
)

@router.get("/", response_model=List[schemas.RecordResponse])
def get_user_records(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get all records under the current user"""
    records = db.query(models.Record).filter(models.Record.user_id == current_user.id).all()
    return records


@router.get("/{record_id}", response_model=schemas.RecordResponse)
def get_record(
    record_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get a specific record by ID"""
    record = db.query(models.Record).filter(
        models.Record.id == record_id,
        models.Record.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    return record

@router.patch("/{record_id}")
def update_record_content(
    record_id: str,
    content: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Update only the content of a record"""
    record = db.query(models.Record).filter(
        models.Record.id == record_id,
        models.Record.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    record.content = content
    db.commit()
    
    return {"message": "Record content updated successfully"}

@router.delete("/{record_id}")
def delete_record(
    record_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Delete a record"""
    record = db.query(models.Record).filter(
        models.Record.id == record_id,
        models.Record.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    db.delete(record)
    db.commit()
    
    return {"message": "Record deleted successfully"}
