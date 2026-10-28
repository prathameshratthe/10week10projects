from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.probes import router as probes_router

app = FastAPI(
    title="InjectionLab API",
    description="LLM Prompt Injection Red-Teaming, Canary Leak Defense & Security Evaluation Harness",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(probes_router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "InjectionLab"}
