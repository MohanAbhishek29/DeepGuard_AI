# ==============================================================================
#  🛡️ DeepGuard AI — Multimodal Synthetic Media Forensic Platform
#  Author & Project Lead: Mohan Abhishek Gupta (@MohanAbhishek29)
#  Repository: https://github.com/MohanAbhishek29/DeepGuard_AI
#  Module: backend.app.main
#  License: Proprietary — All Rights Reserved (Patent Pending)
#  Copyright (c) 2026 Mohan Abhishek Gupta. All rights reserved.
# ==============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1.router import api_router

app = FastAPI(
    title="DeepGuard AI — Forensic Orchestration & Inspection Engine",
    description="""
    ## Multimodal Synthetic Media & Deepfake Detection Intelligence Platform
    
    Production-grade forensic backend engine designed for real-time artifact inspection across physical optical sensors, ultrasonic neural vocoders, and cross-modal semantic coherence.
    
    ### Core System Capabilities:
    * **Media Ingestion & Streaming**: High-throughput media ingestion with cloud persistence (AWS S3 / Local Hybrid).
    * **Parallel Inspection Engine**: Dispatches parallel extraction to Vision (Laplacian/2D-FFT), Audio (Ultrasonic Vocoder), and Speech (Whisper ASR).
    * **Cross-Modal Disagreement Matrix**: Correlates separate modality signals and highlights chimeric audio-visual tampering.
    * **Forensic Audit & Certificate**: Generates tamper-evident cryptographic reports with SHA-256 verification hashes.
    
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

import os
from fastapi.staticfiles import StaticFiles
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/dashboard", StaticFiles(directory=frontend_dir, html=True), name="frontend")

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
