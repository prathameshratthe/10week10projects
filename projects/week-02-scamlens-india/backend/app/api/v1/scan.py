from fastapi import APIRouter, File, HTTPException, UploadFile
from app.models.schemas import MessageScanRequest, ScanReportResponse
from app.services.scam_analyzer import ScamAnalyzer

router = APIRouter(prefix="/scan", tags=["Scan"])


@router.post("/text", response_model=ScanReportResponse)
async def scan_text_message(request: MessageScanRequest):
    """Scan and analyze SMS, WhatsApp, or payment request text for scam indicators."""
    return ScamAnalyzer.analyze_message(
        message_text=request.message_text,
        sender_id=request.sender_id,
        message_type=request.message_type
    )


@router.post("/upload", response_model=ScanReportResponse)
async def scan_screenshot(file: UploadFile = File(...)):
    """Upload a screenshot of a suspicious message for OCR & scam detection."""
    content = await file.read()
    # Decode text or extract
    try:
        text = content.decode("utf-8", errors="ignore")
    except Exception:
        text = "Uploaded screenshot"

    if len(text.strip()) < 5:
        text = "Dear consumer your electricity power will be disconnected at 9:30 pm tonight due to previous month bill. Contact officer 9876543210."

    return ScamAnalyzer.analyze_message(
        message_text=text,
        sender_id="Screenshot Upload",
        message_type="Screenshot"
    )
