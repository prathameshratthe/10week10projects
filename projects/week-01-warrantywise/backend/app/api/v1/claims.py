from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.schemas import (
    ClaimLetterResponse,
    GenerateClaimLetterRequest,
    WarrantyClaimCreate,
    WarrantyClaimResponse,
    WarrantyClaimUpdate,
)
from app.services.claim_service import ClaimService

router = APIRouter(prefix="/claims", tags=["Warranty Claims & Dispute Management"])


@router.get("/", response_model=List[WarrantyClaimResponse])
async def list_claims(
    status: Optional[str] = Query(None, description="DRAFT, SUBMITTED, IN_REVIEW, APPROVED, REJECTED, ALL"),
    db: AsyncSession = Depends(get_db),
):
    """List all warranty claims with associated asset details."""
    return await ClaimService.list_claims(db, status)


@router.post("/", response_model=WarrantyClaimResponse, status_code=201)
async def create_claim(
    data: WarrantyClaimCreate, db: AsyncSession = Depends(get_db)
):
    """File a new warranty claim against a cataloged purchase record."""
    try:
        return await ClaimService.create_claim(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{claim_id}", response_model=WarrantyClaimResponse)
async def update_claim(
    claim_id: int, data: WarrantyClaimUpdate, db: AsyncSession = Depends(get_db)
):
    """Update claim status, resolution progress, tracking number, or notes."""
    claim = await ClaimService.update_claim(db, claim_id, data)
    if not claim:
        raise HTTPException(status_code=404, detail="Warranty claim not found")
    return claim


@router.delete("/{claim_id}", status_code=204)
async def delete_claim(claim_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a warranty claim record."""
    success = await ClaimService.delete_claim(db, claim_id)
    if not success:
        raise HTTPException(status_code=404, detail="Warranty claim not found")
    return Response(status_code=204)


@router.post("/generate-letter", response_model=ClaimLetterResponse)
async def generate_claim_letter(
    req: GenerateClaimLetterRequest, db: AsyncSession = Depends(get_db)
):
    """Generate a legally grounded RMA claim letter referencing consumer protection frameworks."""
    try:
        return await ClaimService.generate_letter(db, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
