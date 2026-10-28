from fastapi import APIRouter, File, HTTPException, UploadFile
from app.models.schemas import ReceiptExtractionResult
from app.services.extractor_factory import get_extractor
from app.services.file_processor import FileProcessor

router = APIRouter(prefix="/receipts", tags=["Receipts"])


@router.post("/extract", response_model=ReceiptExtractionResult)
async def extract_receipt(file: UploadFile = File(...)):
    """
    Upload a receipt image (JPG, PNG, WEBP) or PDF document.
    Extracts structured purchase details and explicit warranty/return information.
    """
    try:
        saved_filename, raw_bytes, mime_type, extracted_text = (
            await FileProcessor.process_and_save_upload(file)
        )
        extractor = get_extractor()
        result = await extractor.extract(
            file_bytes=raw_bytes,
            filename=saved_filename,
            mime_type=mime_type,
            extracted_text=extracted_text,
        )
        # Attach saved filename to raw_text or metadata if needed
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process receipt: {str(e)}"
        )
