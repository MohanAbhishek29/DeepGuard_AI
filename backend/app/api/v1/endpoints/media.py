from fastapi import APIRouter, UploadFile, File, HTTPException, status
from backend.app.schemas.media import MediaUploadResponse
from backend.app.core.storage import storage_manager
from backend.app.core.config import settings

router = APIRouter()

@router.post(
    "/upload",
    response_model=MediaUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload media for deepfake inspection",
    description="Accepts video or audio files, validates format and size, and persists to AWS S3 / Local storage."
)
async def upload_media(file: UploadFile = File(...)):
    filename = file.filename or "unknown.mp4"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported media format '{ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    media_type = "video" if ext in ["mp4", "avi", "mov", "mkv", "webm"] else "audio"
    file_id, storage_uri = storage_manager.save_media(content, filename)

    return MediaUploadResponse(
        file_id=file_id,
        original_filename=filename,
        file_size_bytes=len(content),
        media_type=media_type,
        storage_uri=storage_uri
    )
