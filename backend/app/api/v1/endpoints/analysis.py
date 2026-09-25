from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.media import AnalysisRequest, AnalysisResultResponse
from backend.app.services.orchestrator import orchestrator

router = APIRouter()

@router.post(
    "/start",
    response_model=AnalysisResultResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Start multimodal analysis job",
    description="Initiates asynchronous processing across Vision, Audio, and Speech pipelines, computing cross-modal evidence correlation."
)
async def start_analysis(request: AnalysisRequest):
    job = orchestrator.create_job(file_id=request.file_id)
    # Trigger orchestrator execution
    result = orchestrator.execute_analysis(job_id=job.job_id, file_id=request.file_id)
    return result

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
