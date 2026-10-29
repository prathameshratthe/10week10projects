import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import init_db, AsyncSessionLocal

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure upload dir and database tables exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    await init_db()

    # Auto-seed enterprise demo assets if database is empty
    try:
        from app.services.seed_service import seed_initial_data_if_empty
        async with AsyncSessionLocal() as session:
            await seed_initial_data_if_empty(session)
    except Exception as e:
        print(f"Warning: demo seeding skipped: {e}")

    yield


app = FastAPI(
    title="WarrantyWise Enterprise API",
    description="Intelligent consumer warranty, return deadline, and verified claim vault platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists for static mounting
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API v1 router
app.include_router(api_router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "WarrantyWise",
        "version": "1.0.0",
        "ai_provider": settings.AI_PROVIDER,
    }


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
            "message": "Welcome to WarrantyWise API",
            "docs_url": "/docs",
            "health_url": "/health",
            "version": "1.0.0",
        }
