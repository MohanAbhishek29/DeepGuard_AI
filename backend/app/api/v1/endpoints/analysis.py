from typing import List
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query, status
from backend.app.schemas.media import (
    AnalysisRequest,
    AnalysisResultResponse,
    JobSummary,
    ForensicAuditReport
)
from backend.app.services.orchestrator import orchestrator
from backend.app.core.storage import storage_manager

router = APIRouter()

@router.post(
    "/start",
    response_model=AnalysisResultResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Start multimodal analysis job",
    description="Initiates processing across Vision, Audio, and Speech pipelines, computing cross-modal evidence correlation. Supports both synchronous and background asynchronous execution."
)
async def start_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    async_exec: bool = Query(False, description="If True, executes in background task queue and returns 202 immediately")
):
    if not storage_manager.file_exists(request.file_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media file '{request.file_id}' not found in storage. Please upload before analyzing."
        )

    job = orchestrator.create_job(file_id=request.file_id)

    if async_exec:
        # Background worker dispatch (non-blocking cloud queue)
        background_tasks.add_task(orchestrator.execute_analysis, job.job_id, request.file_id)
        job.status = "PROCESSING"
        return job

    # Direct synchronous execution
    result = orchestrator.execute_analysis(job_id=job.job_id, file_id=request.file_id)
    return result

@router.get(
    "/jobs",
    response_model=List[JobSummary],
    summary="List recent analysis jobs",
    description="Returns summaries of recent multimodal analysis jobs, their execution states, and detection verdicts."
)
async def list_jobs(limit: int = Query(50, ge=1, le=100)):
    return orchestrator.list_jobs(limit=limit)

@router.get(
    "/jobs/{job_id}",
    response_model=AnalysisResultResponse,
    summary="Retrieve analysis job status and forensic evidence",
    description="Returns the full forensic breakdown, individual modality confidence scores, and cross-modal correlation verdict."
)
async def get_job_results(job_id: str):
    job = orchestrator.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job '{job_id}' not found."
        )
    return job

@router.get(
    "/jobs/{job_id}/report",
    response_model=ForensicAuditReport,
    summary="Generate forensic audit certificate",
    description="Produces a tamper-evident forensic audit certificate with cryptographic SHA-256 media verification, cross-modal breakdown, and chain-of-custody status for legal and investigative triage."
)
async def get_forensic_report(job_id: str):
    report = orchestrator.generate_audit_report(job_id)
    if not report:
        job = orchestrator.get_job(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis job '{job_id}' not found."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Analysis job '{job_id}' is still '{job.status}'. An audit report can only be generated for COMPLETED jobs."
        )
    return report

