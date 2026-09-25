from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1.router import api_router

app = FastAPI(
    title="DeepGuard AI - Cloud & Forensic Orchestration API",
    description="""
    ## Multimodal Synthetic Media & Deepfake Detection Platform
    
    Backend orchestration service designed for **Capstone Group K3C0175** (Mapped to **SIH1683**).
    
    ### System Architecture & Capabilities:
    * **Media Ingestion**: High-throughput video and audio ingestion with cloud persistence (AWS S3).
    * **Parallel Inspection**: Dispatches to Vision (FaceForensics++), Audio (ASVspoof 2021), and Speech (Whisper ASR).
    * **Cross-Modal Evidence Correlation**: Correlates separate modality signals and highlights cross-modal disagreements.
    * **Forensic Evidence Timeline**: Synchronized timestamped forensic anomalies for downstream dashboard consumption.
    
    **Architect & Lead:** Mohan Abhishek Gupta
    """,
    version=settings.PROJECT_VERSION,
    openapi_tags=[
        {"name": "System Health", "description": "Core health status and project metadata"},
        {"name": "Media Ingestion", "description": "Endpoints for media validation and cloud storage upload"},
        {"name": "Forensic Analysis & Correlation", "description": "Multimodal analysis dispatch and evidence aggregation"}
    ]
)

# CORS Middleware (Allows Next.js / React frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include V1 Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["System Health"], summary="Root Health Check")
async def root():
    return {
        "status": "online",
        "service": "DeepGuard AI Backend Orchestrator",
        "version": settings.PROJECT_VERSION,
        "group_code": settings.GROUP_CODE,
        "sih_mapping": settings.SIH_PROBLEM_ID,
        "storage_mode": "AWS S3" if settings.USE_S3_STORAGE else "Local Hybrid Storage",
        "docs_url": "/docs"
    }

@app.get("/health", tags=["System Health"], summary="Liveness & Readiness Probe")
async def health_check():
    return {
        "status": "healthy",
        "storage_ready": True,
        "vision_subsystem": "ready",
        "audio_subsystem": "ready",
        "speech_subsystem": "ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
