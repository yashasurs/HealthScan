from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..utils import make_qr
from ..schemas import LinkInput
from ..models import Collection, Record, Share
from ..database import get_db
from ..oauth2 import get_current_user
import io
import os

router = APIRouter(
    prefix='/qr',
    tags=['qr']
)


@router.post("/get-qr")
async def get_qr(link: LinkInput):
    """
    Generates a QR code for the provided link.
    """
    if not link:
        raise HTTPException(status_code=400, detail="Link is required")

    try:
        img = make_qr(link.link)
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)  # Reset pointer to beginning
        return StreamingResponse(img_bytes, media_type='image/png', headers={"Content-Disposition": "attachment; filename=qr_code.png"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating QR code: {str(e)}")


@router.post("/collection/{collection_id}")
async def create_collection_qr(
    collection_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a secure QR code for a collection"""
    
    # Verify collection belongs to user
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # Create a share record
    share = Share(
        collection_id=collection_id,
        created_by=current_user.id
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    
    # Create secure share URL with token - FIX THE PATH HERE
    base_url = os.getenv('BASE_URL', 'http://localhost:8000')
    share_url = f"{base_url}/collections/share/{share.share_token}"  # Changed from /share/collection/
    
    try:
        img = make_qr(share_url)
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        return StreamingResponse(
            img_bytes, 
            media_type='image/png',
            headers={"Content-Disposition": f"attachment; filename=collection_{collection.name}_qr.png"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating QR code: {str(e)}")


@router.post("/record/{record_id}")
async def create_record_qr(
    record_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a secure QR code for a record"""
    
    # Verify record belongs to user
    record = db.query(Record).filter(
        Record.id == record_id,
        Record.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    # Create a share record
    share = Share(
        record_id=record_id,
        created_by=current_user.id
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    
    # Create secure share URL with token - FIX THE PATH HERE
    base_url = os.getenv('BASE_URL', 'http://localhost:8000')
    share_url = f"{base_url}/records/share/{share.share_token}"  # Changed from /share/record/
    
    try:
        img = make_qr(share_url)
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        return StreamingResponse(
            img_bytes, 
            media_type='image/png',
            headers={"Content-Disposition": f"attachment; filename=record_{record.filename}_qr.png"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating QR code: {str(e)}")