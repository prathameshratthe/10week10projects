from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.schemas import (
    PurchaseRecordCreate,
    PurchaseRecordResponse,
    PurchaseRecordUpdate,
)
from app.services.record_service import RecordService

router = APIRouter(prefix="/records", tags=["Purchase Records"])


@router.post("/", response_model=PurchaseRecordResponse, status_code=201)
async def create_record(
    data: PurchaseRecordCreate, db: AsyncSession = Depends(get_db)
):
    """Save an extracted or manually entered purchase record."""
    return await RecordService.create_record(db, data)


@router.get("/", response_model=List[PurchaseRecordResponse])
async def list_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None, description="Search merchant, invoice #, notes"),
    category: Optional[str] = Query(None, description="Filter by category"),
    warranty_status: Optional[str] = Query(None, description="ACTIVE, EXPIRING_SOON, EXPIRED, NO_WARRANTY"),
    return_status: Optional[str] = Query(None, description="ACTIVE, EXPIRING_SOON, EXPIRED, NO_RETURN"),
    sort_by: str = Query("purchase_date", description="Field to sort by"),
    sort_order: str = Query("desc", description="asc or desc"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all purchase records with filtering, searching, and pagination."""
    return await RecordService.list_records(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category=category,
        warranty_status=warranty_status,
        return_status=return_status,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/export/csv")
async def export_records_csv(db: AsyncSession = Depends(get_db)):
    """Export all saved warranty records as an RFC 4180 CSV file."""
    csv_data = await RecordService.export_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=warrantywise_records.csv"},
    )


@router.get("/export/json")
async def export_records_json(db: AsyncSession = Depends(get_db)):
    """Export all saved warranty records as structured JSON."""
    json_data = await RecordService.export_json(db)
    return Response(
        content=json_data,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=warrantywise_records.json"},
    )


@router.get("/{record_id}", response_model=PurchaseRecordResponse)
async def get_record(record_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve a single purchase record by ID."""
    record = await RecordService.get_record(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Purchase record not found")
    return record


@router.put("/{record_id}", response_model=PurchaseRecordResponse)
async def update_record(
    record_id: int, data: PurchaseRecordUpdate, db: AsyncSession = Depends(get_db)
):
    """Update fields of an existing purchase record."""
    record = await RecordService.update_record(db, record_id, data)
    if not record:
        raise HTTPException(status_code=404, detail="Purchase record not found")
    return record


@router.delete("/{record_id}", status_code=204)
async def delete_record(record_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a purchase record by ID."""
    success = await RecordService.delete_record(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Purchase record not found")
    return Response(status_code=204)
