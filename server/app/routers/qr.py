from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from ..utils import make_qr
from ..schemas import LinkInput
import io
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