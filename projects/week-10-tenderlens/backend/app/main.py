from fastapi.staticfiles import StaticFiles
from pathlib import Path
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

# Mount built frontend if present
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not frontend_dist.exists():
    frontend_dist = Path("/app/frontend-dist")
if not frontend_dist.exists():
    frontend_dist = Path(__file__).resolve().parent.parent / "frontend-dist"

if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": "Welcome to week-10-tenderlens API",
            "docs_url": "/docs",
            "health_url": "/health",
            "version": "1.0.0"
        }