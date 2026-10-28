from fastapi import APIRouter
from app.models.schemas import DiffAnalysisRequest, DiffAnalysisResponse
from app.services.diff_analyzer import DiffGuardAnalyzer

router = APIRouter(prefix="/analyze", tags=["Diff Analysis"])


@router.post("/", response_model=DiffAnalysisResponse)
async def analyze_pull_request_diff(request: DiffAnalysisRequest):
    """Analyze git patch/diff for regression blast radius, breaking changes, and minimal test subset."""
    return DiffGuardAnalyzer.analyze_diff(request)
