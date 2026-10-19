# ==============================================================================
#  🛡️ DeepGuard AI — Multimodal Synthetic Media Forensic Platform
#  Author & Project Lead: Mohan Abhishek Gupta (@MohanAbhishek29)
#  Repository: https://github.com/MohanAbhishek29/DeepGuard_AI
#  Module: backend.app.api.v1.router
#  License: Proprietary — All Rights Reserved (Patent Pending)
#  Copyright (c) 2026 Mohan Abhishek Gupta. All rights reserved.
# ==============================================================================

from fastapi import APIRouter
from backend.app.api.v1.endpoints import media, analysis, system

api_router = APIRouter()
api_router.include_router(system.router, prefix="/system", tags=["System Telemetry & Architecture"])
api_router.include_router(media.router, prefix="/media", tags=["Media Ingestion & Cloud Storage"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Forensic Analysis & Correlation"])
