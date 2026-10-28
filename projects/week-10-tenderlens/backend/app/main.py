from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.tenders import router as tenders_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="TenderLens - Public Tender & RFP Compliance Analyzer with Exact Page Citation & Contractor Screening Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tenders_router, prefix=f"{settings.API_V1_STR}/tenders", tags=["tenders"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "tenderlens-api", "version": "1.0.0"}
