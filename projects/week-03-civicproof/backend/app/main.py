from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.reports import router as reports_router

app = FastAPI(
    title="CivicProof API",
    description="Citizen grievance intelligence, categorization & duplicate detection. Week 3 of 10-Week AI Builder Challenge.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "CivicProof", "version": "1.0.0"}


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to CivicProof API",
        "docs_url": "/docs",
        "health_url": "/health",
    }
