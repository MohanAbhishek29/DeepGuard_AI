import os
import mimetypes
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from backend.app.schemas.media import MediaUploadResponse, MediaURLResponse, MediaDeleteResponse
from backend.app.core.storage import storage_manager
from backend.app.core.config import settings

router = APIRouter()

@router.post(
    "/upload",
    response_model=MediaUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload media for deepfake inspection",
    description="Accepts video or audio files, validates format and size, and persists to AWS S3 / Local storage. Managed by Mohan Abhishek Gupta."
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
    stream_url = storage_manager.generate_presigned_url(file_id)

    return MediaUploadResponse(
        file_id=file_id,
        original_filename=filename,
        file_size_bytes=len(content),
        media_type=media_type,
        storage_uri=storage_uri,
        stream_url=stream_url
    )

@router.get(
    "/{file_id}/stream",
    summary="Stream or download media file",
    description="Streams the specified video or audio file for client-side playback and forensic inspection."
)
async def stream_media(file_id: str):
    local_path = storage_manager.get_local_path(file_id)
    if not os.path.exists(local_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media file '{file_id}' not found in storage."
        )
    
    mime_type, _ = mimetypes.guess_type(local_path)
    if not mime_type:
        mime_type = "application/octet-stream"
        
    return FileResponse(
        path=local_path,
        media_type=mime_type,
        filename=file_id
    )

@router.get(
    "/{file_id}/url",
    response_model=MediaURLResponse,
    summary="Get secure media playback URL",
    description="Generates an AWS S3 presigned URL or direct streaming endpoint for frontend media player."
)
async def get_media_url(file_id: str):
    if not storage_manager.file_exists(file_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media file '{file_id}' not found in storage."
        )

    stream_url = storage_manager.generate_presigned_url(file_id)
    stats = storage_manager.get_storage_stats()

    return MediaURLResponse(
        file_id=file_id,
        stream_url=stream_url,
        storage_mode=stats["storage_mode"],
        expires_in_seconds=3600
    )

@router.delete(
    "/{file_id}",
    response_model=MediaDeleteResponse,
    summary="Delete media from cloud/local storage",
    description="Removes the uploaded media file to enforce storage retention policies and reduce cloud storage footprint. Managed by Mohan Abhishek Gupta."
)
async def delete_media(file_id: str):
    if not storage_manager.file_exists(file_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media file '{file_id}' not found in storage."
        )

    deleted = storage_manager.delete_media(file_id)
    return MediaDeleteResponse(
        file_id=file_id,
        deleted=deleted,
        message=f"Media file '{file_id}' successfully removed from storage."
    )

