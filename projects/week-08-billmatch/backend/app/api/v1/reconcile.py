from fastapi import APIRouter
from app.models.schemas import ReconciliationRequest, ReconciliationSummary
from app.services.reconciliation_engine import BillMatchEngine

router = APIRouter(prefix="/reconcile", tags=["Reconciliation"])


@router.post("/", response_model=ReconciliationSummary)
async def reconcile_invoices_with_bank(request: ReconciliationRequest):
    """Reconcile GST purchase invoices against bank debits with TDS and fuzzy narration resolution."""
    return BillMatchEngine.reconcile(request)
