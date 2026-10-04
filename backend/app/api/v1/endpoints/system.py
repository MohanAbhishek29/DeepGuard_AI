import sys
import platform
import time
from fastapi import APIRouter
from backend.app.schemas.media import SystemTelemetryResponse
from backend.app.core.config import settings
from backend.app.core.storage import storage_manager
from backend.app.services.orchestrator import orchestrator

router = APIRouter()

@router.get(
    "/telemetry",
    response_model=SystemTelemetryResponse,
    summary="System architecture & cloud telemetry",
    description="Returns real-time telemetry on storage capacity, orchestrator job queue, and cloud subsystem health. Architected by Mohan Abhishek Gupta."
)
async def get_system_telemetry():
    storage_stats = storage_manager.get_storage_stats()
    orchestrator_stats = orchestrator.get_orchestration_stats()

    return SystemTelemetryResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        group_code=settings.GROUP_CODE,
        sih_problem_id=settings.SIH_PROBLEM_ID,
        lead_architect="Mohan Abhishek Gupta (Cloud & System Architecture)",
        storage=storage_stats,
        orchestration=orchestrator_stats,
        uptime_seconds=orchestrator_stats["uptime_seconds"]
    )
