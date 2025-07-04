from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from ..schemas import RecordResponse, OcrResponseGemini
from ..models import Record
from ..database import get_db
from ..oauth2 import get_current_user
from ..utils import MarkupAgent, merge_texts, process_single_image_tesseract, OcrAgent
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

@router.post("/get-text", response_model=List[RecordResponse])
async def get_text(
    files: List[UploadFile] = File(...),
    collection_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    response = []
    
    # Optimize worker selection based on file count and system resources
    num_files = len(files)
    cpu_count = multiprocessing.cpu_count()
    
    # Determine processing strategy
    if num_files == 1:
        use_async = False
        max_workers = 1
    elif num_files <= 4:
        # Use threading for small batches (less overhead)
        use_async = True
        use_processes = False
        max_workers = min(num_files, cpu_count * 2)  # More threads than CPUs for I/O bound tasks
    else:
        # Use multiprocessing for large batches (better CPU utilization)
        use_async = True
        use_processes = True
        max_workers = min(num_files, cpu_count)
    
    try:
        # First, validate and read all files
        file_data = []
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
            
            file_data.append({
                'content': content,
                'filename': file.filename,
                'file_size': file_size,
                'file_type': file.content_type
            })
        
        # Process images with optimized concurrency
        if use_async:
            loop = asyncio.get_event_loop()
            
            if use_processes:
                # Use ProcessPoolExecutor for CPU-intensive work with many files
                with ProcessPoolExecutor(max_workers=max_workers) as executor:
                    futures = []
                    for file_info in file_data:
                        future = loop.run_in_executor(
                            executor,
                            process_single_image_tesseract,
                            file_info['content'],
                            file_info['filename'],
                            file_info['file_size'],
                            file_info['file_type']
                        )
                        futures.append(future)
                    
                    results = await asyncio.gather(*futures)
            else:
                # Use ThreadPoolExecutor for I/O bound work with fewer files
                with ThreadPoolExecutor(max_workers=max_workers) as executor:
                    futures = []
                    for file_info in file_data:
                        future = loop.run_in_executor(
                            executor,
                            process_single_image_tesseract,
                            file_info['content'],
                            file_info['filename'],
                            file_info['file_size'],
                            file_info['file_type']
                        )
                        futures.append(future)
                    
                    results = await asyncio.gather(*futures)
        else:
            # Single file processing (no concurrency overhead)
            results = []
            for file_info in file_data:
                result = process_single_image_tesseract(
                    file_info['content'],
                    file_info['filename'],
                    file_info['file_size'],
                    file_info['file_type']
                )
                results.append(result)
        
        # Check for any errors in processing
        extracted_texts = []
        file_info = []
        
        for result in results:
            if not result['success']:
                raise HTTPException(
                    status_code=400, 
                    detail=f"OCR failed for {result['filename']}: {result['error']}"
                )
            
            extracted_texts.append(result['extracted_text'])
            file_info.append({
                'filename': result['filename'],
                'file_size': result['file_size'],
                'file_type': result['file_type']
            })
        
        # Second pass: format all extracted texts in batch using Gemini
        agent = MarkupAgent()
        try:
            # Merge texts into a single string with default separator
            merged_text = merge_texts(extracted_texts)
            
            # Pass the merged text to the Gemini agent
            binaryimages = []
            for file_info in file_info:
                binaryimages.append(file_info['content'])
            
            result = await agent.run(
                [
                    'Extract the text from each image and format it into markup format. Provide a confidence level for each extraction. Return a list of objects, one per image.',
                    *binaryimages
                ]
            )
            
            # Extract markup content from MarkupResponse objects
            formatted_texts = [response.markup for response in result]
            
        except Exception as e:
            print(f"Error formatting content: {str(e)}")
            formatted_texts = extracted_texts  # fallback to raw text
        
        # Create records in database with batch processing
        records_to_add = []
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
            records_to_add.append(record)
        
        # Batch insert for better database performance
        db.add_all(records_to_add)
        db.commit()
        
        # Refresh all records
        for record in records_to_add:
            db.refresh(record)
            response.append(record)

        return response

    except Exception as e:
        db.rollback()
        print("An unexpected error occurred:", e)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

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
