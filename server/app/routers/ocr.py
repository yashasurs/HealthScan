from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from ..schemas import RecordResponse, OcrResponseGemini
from ..models import Record
from ..database import get_db
from ..oauth2 import get_current_user
from ..utils import MarkupAgent, merge_texts, OcrAgent
import asyncio
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
import multiprocessing

router = APIRouter(
    prefix='/ocr',
    tags=['ocr']
)

@router.get("/")
def testing():
    return {"message": "ocr works fine"}


@router.post("/images-to-text", response_model=List[dict])
async def image_to_text(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    collection_id: Optional[str] = None
):
    try:
        # Validate and read all files
        image_bytes = []
        file_info = []
        for file in files:
            if file.content_type and not (file.content_type.startswith('image/') or file.content_type == 'application/octet-stream'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail=f"File {file.filename} is empty")
            image_bytes.append(content)
            file_info.append({
                'filename': file.filename,
                'file_size': len(content),
                'file_type': file.content_type
            })

        ocr_agent = OcrAgent()
        gemini_results = await ocr_agent.generate_text_from_images(image_bytes)

        response = []
        records_to_add = []
        for i, info in enumerate(file_info):
            gemini = gemini_results[i] if i < len(gemini_results) else None
            markup = gemini.content if gemini else ''
            confidence = gemini.confidence if gemini else 0.0
            record = Record(
                filename=info['filename'],
                content=markup,
                file_size=info['file_size'],
                file_type=info['file_type'],
                user_id=current_user.id,
                created_by_id=current_user.id,
                collection_id=collection_id
            )
            records_to_add.append(record)
            response.append({
                'filename': info['filename'],
                'content': markup,
                'file_size': info['file_size'],
                'file_type': info['file_type'],
                'user_id': current_user.id,
                'collection_id': collection_id,
                'confidence': confidence
            })
        db.add_all(records_to_add)
        db.commit()
        for record in records_to_add:
            db.refresh(record)
        return response
    except Exception as e:
        db.rollback()
        print(f"Error processing images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image-to-text processing failed: {str(e)}")
