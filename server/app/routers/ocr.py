import io
import easyocr
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from PIL import Image
import numpy as np
from ..schemas import OCRResponse

router = APIRouter(
    prefix='/ocr',
    tags=['ocr']
)

reader = easyocr.Reader(['en'], gpu=False)

@router.get("/")
def testing():
    return {"message": "ocr works fine"}

@router.post("/get-text", response_model=List[OCRResponse])
async def get_text(files: List[UploadFile] = File(...)):
    response = []

    try:
        for file in files:
            # Validate file type
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
            
            # Read the file content
            content = await file.read()
            
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

            response.append(OCRResponse(content=extracted_text))

        return response
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print("An unexpected error occurred:", e)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")