import os
from typing import List

class Settings:
    PROJECT_NAME: str = "DeepGuard AI Backend"
    API_V1_STR: str = "/api/v1"
    PROJECT_VERSION: str = "1.0.0"
    GROUP_CODE: str = "K3C0175"
    SIH_PROBLEM_ID: str = "SIH1683"
    
    # Storage settings
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploads")
    MAX_UPLOAD_SIZE_MB: int = 100
    ALLOWED_EXTENSIONS: List[str] = [
        "mp4", "avi", "mov", "mkv", "webm",
        "wav", "mp3", "flac", "aac"
    ]
    
    # AWS S3 Settings (Configurable via environment variables)
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-south-1")
    AWS_S3_BUCKET_NAME: str = os.getenv("AWS_S3_BUCKET_NAME", "deepguard-media-storage")
    USE_S3_STORAGE: bool = bool(os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_S3_BUCKET_NAME"))

settings = Settings()
