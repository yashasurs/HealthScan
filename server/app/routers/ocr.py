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
from ..utils import GeminiAgent, merge_texts

router = APIRouter(
    prefix='/ocr',
    tags=['ocr']
)

reader = easyocr.Reader(['en'], gpu=True)

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
    extracted_texts = []
    file_info = []

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
            
            # Store extracted text and file info for batch processing
            extracted_texts.append(extracted_text)
            file_info.append({
                'filename': file.filename,
                'file_size': file_size,
                'file_type': file.content_type
            })

        # Second pass: format all extracted texts in batch
        agent = GeminiAgent()
        try:
            # Merge texts into a single string with default separator
            merged_text = merge_texts(extracted_texts)
            
            # Pass the merged text to the Gemini agent
            markup_responses = await agent.generate_markup(merged_text)
            
            # Extract markup content from MarkupResponse objects
            formatted_texts = [response.markup for response in markup_responses]
            
        except Exception as e:
            print(f"Error formatting content: {str(e)}")
            formatted_texts = extracted_texts  # fallback to raw text
        
        for i, info in enumerate(file_info):
            markup = formatted_texts[i] if i < len(formatted_texts) else extracted_texts[i]
            
            record = Record(
                filename=info['filename'],
                content=markup,
                file_size=info['file_size'],
                file_type=info['file_type'],
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