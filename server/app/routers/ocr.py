from fastapi import APIRouter

router = APIRouter(
    prefix='/ocr',
    tags=['ocr']
)


@router.get("/")
def testing():
    return {"message": "ocr works fine"}