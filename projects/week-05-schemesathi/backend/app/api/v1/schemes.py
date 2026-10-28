from fastapi import APIRouter
from app.models.schemas import CitizenProfile, SchemeSathiResponse
from app.services.scheme_engine import SchemeEngine

router = APIRouter(prefix="/schemes", tags=["Schemes"])


@router.post("/evaluate", response_model=SchemeSathiResponse)
async def evaluate_eligibility(profile: CitizenProfile):
    """Evaluate citizen profile against official Indian welfare schemes with citations & negative abstention."""
    return SchemeEngine.evaluate_profile(profile)
