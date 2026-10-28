from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.verifier import router as verifier_router

app = FastAPI(
    title="PackCheck API",
    description="Automated B2B Vendor Onboarding Compliance & Cross-Entity Verification Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verifier_router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "PackCheck"}
