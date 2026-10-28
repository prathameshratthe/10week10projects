from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import VoiceNoteInput, WorkOrder
from app.services.workorder_extractor import VoiceWorkOrderExtractor

router = APIRouter(prefix="/workorders", tags=["Work Orders"])

SAVED_WORK_ORDERS: List[WorkOrder] = []


@router.post("/process", response_model=WorkOrder)
async def process_voice_transcript(input_data: VoiceNoteInput):
    """Parse raw audio dictation transcript into structured commercial work order."""
    wo = VoiceWorkOrderExtractor.extract_work_order(input_data)
    SAVED_WORK_ORDERS.insert(0, wo)
    return wo


@router.get("/", response_model=List[WorkOrder])
async def list_work_orders():
    """Retrieve history of parsed work orders."""
    return SAVED_WORK_ORDERS
