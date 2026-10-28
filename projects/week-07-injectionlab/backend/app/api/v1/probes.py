from fastapi import APIRouter
from app.models.schemas import SecurityAuditResult, SecurityProbeRequest
from app.services.injection_engine import InjectionSecurityEngine

router = APIRouter(prefix="/probes", tags=["Security Probes"])


@router.post("/test", response_model=SecurityAuditResult)
async def test_single_probe(request: SecurityProbeRequest):
    """Execute a single adversarial prompt injection probe comparing raw vs. defended behavior."""
    return InjectionSecurityEngine.evaluate_probe(
        attack_id=1,
        prompt=request.prompt,
        attack_vector=request.attack_vector
    )
