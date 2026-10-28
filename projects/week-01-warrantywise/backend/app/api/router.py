from fastapi import APIRouter
from app.api.v1.receipts import router as receipts_router
from app.api.v1.records import router as records_router
from app.api.v1.stats import router as stats_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(receipts_router)
api_router.include_router(records_router)
api_router.include_router(stats_router)
