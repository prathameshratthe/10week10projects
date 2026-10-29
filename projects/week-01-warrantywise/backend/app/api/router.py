from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.claims import router as claims_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.receipts import router as receipts_router
from app.api.v1.records import router as records_router
from app.api.v1.stats import router as stats_router
from app.api.v1.workspace import router as workspace_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(claims_router)
api_router.include_router(notifications_router)
api_router.include_router(receipts_router)
api_router.include_router(records_router)
api_router.include_router(stats_router)
api_router.include_router(workspace_router)
