import io
import easyocr
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Optional
from PIL import Image
import numpy as np
from sqlalchemy.orm import Session
from ..schemas import OCRResponse, RecordResponse
from ..models import Record
from ..database import get_db
from ..oauth2 import get_current_user

router = APIRouter(
    prefix='/ocr',
    tags=['ocr']
)

reader = easyocr.Reader(['en'], gpu=False)

@router.get("/")
def testing():
    return {"message": "ocr works fine"}

@router.post("/get-text", response_model=List[RecordResponse])
async def get_text(
    files: List[UploadFile] = File(...),
    collection_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    response = []

    try:
        for file in files:
            # Validate file type
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
            
            # Read the file content
            content = await file.read()
            file_size = len(content)
            
            # Check if content is empty
            if not content:
                raise HTTPException(status_code=400, detail=f"File {file.filename} is empty")
            
            # Reset file pointer and convert to PIL Image
            image_bytes = io.BytesIO(content)
            image_bytes.seek(0)  # Reset pointer to beginning
            
            try:
                image = Image.open(image_bytes)
                # Convert to RGB if necessary (for PNG with transparency, etc.)
                if image.mode != 'RGB':
                    image = image.convert('RGB')
            except Exception as img_error:
                raise HTTPException(status_code=400, detail=f"Cannot process image {file.filename}: {str(img_error)}")

            # Convert PIL image to numpy array for easyocr
            image_array = np.array(image)

            # Perform OCR
            ocr_results = reader.readtext(image_array)

            # Extract text from OCR results
            extracted_text = " ".join([result[1] for result in ocr_results])

            # Create and save record to database
            record = Record(
                filename=file.filename,
                content=extracted_text,
                file_size=file_size,
                file_type=file.content_type,
                user_id=current_user.id,
                collection_id=collection_id
            )
            
            db.add(record)
            db.commit()
            db.refresh(record)
            
            response.append(record)

        return response

    except Exception as e:
        db.rollback()
        print("An unexpected error occurred:", e)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")