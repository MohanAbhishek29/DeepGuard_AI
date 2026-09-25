import os
import shutil
import uuid
from typing import Tuple
from backend.app.core.config import settings

class CloudStorageManager:
    """
    Manages media storage across AWS S3 and Local Development Storage.
    Designed by Mohan Abhishek Gupta (Cloud & System Architecture).
    """
    def __init__(self):
        self.use_s3 = settings.USE_S3_STORAGE
        self.local_upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.local_upload_dir, exist_ok=True)
        
        self.s3_client = None
        if self.use_s3:
            try:
                import boto3
                self.s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION
                )
            except Exception as e:
                print(f"[Storage Warning] Failed to initialize S3 client: {e}. Falling back to local storage.")
                self.use_s3 = False

    def save_media(self, file_bytes: bytes, filename: str) -> Tuple[str, str]:
        """
        Saves uploaded media either to AWS S3 or local directory.
        Returns: (file_id, storage_uri)
        """
        ext = filename.split(".")[-1].lower() if "." in filename else "bin"
        file_id = f"{uuid.uuid4().hex[:12]}.{ext}"
        
        if self.use_s3 and self.s3_client:
            s3_key = f"uploads/{file_id}"
            self.s3_client.put_object(
                Bucket=settings.AWS_S3_BUCKET_NAME,
                Key=s3_key,
                Body=file_bytes
            )
            storage_uri = f"s3://{settings.AWS_S3_BUCKET_NAME}/{s3_key}"
            return file_id, storage_uri
        
        # Local development fallback
        local_path = os.path.join(self.local_upload_dir, file_id)
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        
        return file_id, f"local://{local_path}"

    def get_local_path(self, file_id: str) -> str:
        """Returns the local filesystem path for pipeline processing."""
        return os.path.join(self.local_upload_dir, file_id)

storage_manager = CloudStorageManager()
