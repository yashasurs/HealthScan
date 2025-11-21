from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from .. import schemas, models, database, oauth2, utils
from fastapi.responses import StreamingResponse
import io
from ..utils import markdown_to_pdf_bytes, MarkupAgent
from datetime import datetime


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

@router.patch("/{record_id}", response_model=schemas.MessageResponse)
def update_record(
    record_id: str,
    record_update: schemas.RecordUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Update a record's fields"""
    record = db.query(models.Record).filter(
        models.Record.id == record_id,
        models.Record.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    # Update only the fields that are provided
    if record_update.filename is not None:
        record.filename = record_update.filename
    if record_update.content is not None:
        record.content = record_update.content
        
    db.commit()
    
    return {"message": "Record updated successfully"}

@router.patch("/{record_id}/content", response_model=schemas.MessageResponse)
def update_record_content(
    record_id: str,
    content: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Update only the content of a record (backward compatibility)"""
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

@router.delete("/{record_id}", response_model=schemas.MessageResponse)
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

@router.get("/{record_id}/pdf")
def get_record_pdf(
    record_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get a PDF file generated from the record's content (assumed Markdown)."""
    record = db.query(models.Record).filter(
        models.Record.id == record_id,
        models.Record.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    pdf_bytes = markdown_to_pdf_bytes(record.content)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=record_{record_id}.pdf"
    })

@router.get("/share/{share_token}", response_model=schemas.SharedRecordResponse)
async def access_shared_record(
    share_token: str,
    db: Session = Depends(database.get_db)
):
    """Access a record via secure share token (no auth required)"""
    
    # Find the share
    share = db.query(models.Share).filter(
        models.Share.share_token == share_token,
        models.Share.is_active == True,
        models.Share.record_id.isnot(None)
    ).first()
    
    if not share:
        raise HTTPException(status_code=404, detail="Invalid or expired share link")
    
    # Get the record
    record = db.query(models.Record).filter(models.Record.id == share.record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    return {
        "id": record.id,
        "filename": record.filename,
        "content": record.content,
        "file_size": record.file_size,
        "file_type": record.file_type,
        "created_at": record.created_at
    }

@router.get("/share/{share_token}/pdf")
async def get_shared_record_pdf(
    share_token: str,
    db: Session = Depends(database.get_db)
):
    """Get a PDF file generated from a shared record's content (no auth required)"""
    
    # Find the share
    share = db.query(models.Share).filter(
        models.Share.share_token == share_token,
        models.Share.is_active == True,
        models.Share.record_id.isnot(None)
    ).first()
    
    if not share:
        raise HTTPException(status_code=404, detail="Invalid or expired share link")
    
    # Get the record
    record = db.query(models.Record).filter(models.Record.id == share.record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    # Generate PDF from markdown content
    pdf_bytes = markdown_to_pdf_bytes(record.content)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename={record.filename or f'shared_record_{share_token[:8]}'}.pdf"
    })

@router.post("/share/{share_token}/save", response_model=schemas.RecordResponse)
async def save_shared_record(
    share_token: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Save a shared record to the current user's account (creates a copy)"""
    
    # Find the share
    share = db.query(models.Share).filter(
        models.Share.share_token == share_token,
        models.Share.is_active == True,
        models.Share.record_id.isnot(None)
    ).first()
    
    if not share:
        raise HTTPException(status_code=404, detail="Invalid or expired share link")
    
    # Get the original record
    original_record = db.query(models.Record).filter(models.Record.id == share.record_id).first()
    
    if not original_record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    # Check if user already has a copy of this record
    existing_copy = db.query(models.Record).filter(
        models.Record.user_id == current_user.id,
        models.Record.filename == f"Copy of {original_record.filename}",
        models.Record.content == original_record.content
    ).first()
    
    if existing_copy:
        raise HTTPException(status_code=400, detail="You already have a copy of this record")
    
    # Create a new record for the current user (copy)
    new_record = models.Record(
        filename=f"Copy of {original_record.filename}",
        content=original_record.content,
        file_size=original_record.file_size,
        file_type=original_record.file_type,
        user_id=current_user.id,
        collection_id=None  # Save as unorganized record
    )
    
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    return new_record

@router.post("/create", response_model=schemas.RecordResponse)
def create_manual_record(
    record_data: schemas.ManualRecordCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Create a manual record for the current user (works for both patients and doctors)"""
    try:
        # Validate collection exists if provided and belongs to the user
        if record_data.collection_id:
            collection = db.query(models.Collection).filter(
                models.Collection.id == record_data.collection_id,
                models.Collection.user_id == current_user.id
            ).first()
            
            if not collection:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Collection not found or not owned by you"
                )
        
        # Create the record
        new_record = models.Record(
            filename=record_data.filename,
            content=record_data.content,
            file_size=len(record_data.content.encode('utf-8')),
            file_type=record_data.file_type or "text/plain",
            user_id=current_user.id,
            created_by_id=current_user.id,  # Track who created it
            collection_id=record_data.collection_id
        )
        
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        
        return new_record
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating manual record for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating record: {str(e)}"
        )

