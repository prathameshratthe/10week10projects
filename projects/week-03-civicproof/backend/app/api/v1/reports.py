import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import (
    CivicAnalyzeRequest,
    CivicAnalyzeResponse,
    CivicCategory,
    CivicReportCreate,
    CivicReportResponse,
)
from app.services.civic_classifier import CivicClassifier

router = APIRouter(prefix="/reports", tags=["Reports"])

# In-memory database with preloaded seed reports for instant duplicate testing
REPORTS_DB = [
    {
        "id": 101,
        "ticket_id": "CIVIC-2026-101",
        "category": "POTHOLE",
        "department": "Roads & Traffic Infrastructure",
        "severity": "HIGH",
        "actionable_title": "Deep Pothole on FC Road opposite Starbucks",
        "description": "Massive 2-foot crater in the right lane causing traffic slowdown and near two-wheeler skids.",
        "location_address": "FC Road, Deccan Gymkhana, Pune",
        "status": "IN_PROGRESS",
        "is_duplicate": False,
        "created_at": "2026-10-27T10:30:00",
        "updated_at": "2026-10-27T10:30:00"
    },
    {
        "id": 102,
        "ticket_id": "CIVIC-2026-102",
        "category": "OPEN_MANHOLE",
        "department": "Stormwater Drainage & Disaster Safety",
        "severity": "CRITICAL",
        "actionable_title": "Uncovered Gutter Chamber at Indiranagar 100ft Road",
        "description": "Concrete slab broken, open manhole completely exposed on pedestrian footpath near metro pillar 42.",
        "location_address": "100ft Road, Indiranagar, Bangalore",
        "status": "OPEN",
        "is_duplicate": False,
        "created_at": "2026-10-28T09:15:00",
        "updated_at": "2026-10-28T09:15:00"
    },
    {
        "id": 103,
        "ticket_id": "CIVIC-2026-103",
        "category": "GARBAGE_DUMP",
        "department": "Solid Waste Management & Sanitation",
        "severity": "HIGH",
        "actionable_title": "Illegal Waste Dump outside KEM Hospital Gate 2",
        "description": "Piles of rotting household rubbish and medical packaging overflowing onto road.",
        "location_address": "Parel, Mumbai",
        "status": "OPEN",
        "is_duplicate": False,
        "created_at": "2026-10-28T08:00:00",
        "updated_at": "2026-10-28T08:00:00"
    }
]


@router.post("/analyze", response_model=CivicAnalyzeResponse)
async def analyze_report(request: CivicAnalyzeRequest):
    """Analyze civic description, classify category & severity, and detect duplicates."""
    return CivicClassifier.classify_issue(
        description=request.description,
        location=request.location_address,
        existing_reports=REPORTS_DB
    )


@router.post("/", response_model=CivicReportResponse, status_code=201)
async def create_report(payload: CivicReportCreate):
    """File a verified civic grievance report."""
    new_id = len(REPORTS_DB) + 101
    ticket_id = f"CIVIC-2026-{new_id}"
    from datetime import timezone
    now = datetime.now(timezone.utc).isoformat()

    new_report = {
        "id": new_id,
        "ticket_id": ticket_id,
        "category": payload.category.value,
        "department": payload.department,
        "severity": payload.severity.value,
        "actionable_title": payload.actionable_title,
        "description": payload.description,
        "location_address": payload.location_address,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "image_url": payload.image_url,
        "is_duplicate": payload.is_duplicate,
        "original_report_id": payload.original_report_id,
        "status": "OPEN",
        "created_at": now,
        "updated_at": now,
    }
    REPORTS_DB.insert(0, new_report)
    return new_report


@router.get("/", response_model=List[CivicReportResponse])
async def list_reports(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """List filed civic grievance reports."""
    filtered = REPORTS_DB
    if category and category.upper() != "ALL":
        filtered = [r for r in filtered if r["category"] == category.upper()]
    if status and status.upper() != "ALL":
        filtered = [r for r in filtered if r["status"] == status.upper()]
    return filtered
