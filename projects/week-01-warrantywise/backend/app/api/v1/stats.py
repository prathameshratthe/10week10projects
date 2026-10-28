from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.schemas import DashboardStats
from app.services.record_service import RecordService

router = APIRouter(prefix="/stats", tags=["Dashboard Statistics"])


@router.get("/", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Retrieve warranty and return statistics for the dashboard."""
    return await RecordService.get_dashboard_stats(db)
