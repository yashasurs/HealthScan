from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from .. import schemas, models, database, oauth2, utils
from fastapi.responses import StreamingResponse
import io
from ..utils import markdown_to_pdf_bytes


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

@router.patch("/{record_id}/content")
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

@router.get("/share/{share_token}")
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
