from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.analyze import router as analyze_router

app = FastAPI(
    title="DiffGuard API",
    description="Change-Aware Git Diff & Test File Analyzer Identifying Regression Blast Radius",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "DiffGuard"}

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
            "message": "Welcome to week-09-diffguard API",
            "docs_url": "/docs",
            "health_url": "/health",
            "version": "1.0.0"
        }
