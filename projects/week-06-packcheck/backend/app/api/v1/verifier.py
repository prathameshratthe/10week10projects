from fastapi import APIRouter
from app.models.schemas import VendorDossier, VerificationScorecard
from app.services.pack_verifier import PackVerifier

router = APIRouter(prefix="/verify", tags=["Verification"])


@router.post("/dossier", response_model=VerificationScorecard)
async def verify_vendor_dossier(dossier: VendorDossier):
    """Verify vendor compliance pack against statutory checklists & cross-entity tax reconciliation."""
    return PackVerifier.verify_dossier(dossier)
