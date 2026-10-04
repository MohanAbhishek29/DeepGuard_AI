import os
import shutil
import uuid
import hashlib
from typing import Tuple, Dict, Any, Optional
from backend.app.core.config import settings

class CloudStorageManager:
    """
    Manages media storage across AWS S3 and Local Development Storage.
    Designed by Mohan Abhishek Gupta (Project Lead & Cloud / System Architecture).
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

    def file_exists(self, file_id: str) -> bool:
        """Checks if a file exists in the active storage layer."""
        if self.use_s3 and self.s3_client:
            try:
                self.s3_client.head_object(
                    Bucket=settings.AWS_S3_BUCKET_NAME,
                    Key=f"uploads/{file_id}"
                )
                return True
            except Exception:
                return False
        return os.path.isfile(self.get_local_path(file_id))

    def delete_media(self, file_id: str) -> bool:
        """
        Deletes media from the active storage layer (AWS S3 or local directory).
        Supports lifecycle retention policies and cloud storage cost optimization.
        """
        deleted = False
        if self.use_s3 and self.s3_client:
            try:
                self.s3_client.delete_object(
                    Bucket=settings.AWS_S3_BUCKET_NAME,
                    Key=f"uploads/{file_id}"
                )
                deleted = True
            except Exception as e:
                print(f"[Storage Warning] S3 delete failed for '{file_id}': {e}")

        local_path = self.get_local_path(file_id)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
                deleted = True
            except Exception as e:
                print(f"[Storage Warning] Local delete failed for '{local_path}': {e}")

        return deleted

    def compute_file_hash(self, file_id: str) -> str:
        """
        Computes SHA-256 cryptographic hash of the media file for forensic chain-of-custody.
        """
        local_path = self.get_local_path(file_id)
        if not os.path.exists(local_path):
            return hashlib.sha256(file_id.encode()).hexdigest()

        sha256 = hashlib.sha256()
        with open(local_path, "rb") as f:
            while chunk := f.read(65536):
                sha256.update(chunk)
        return sha256.hexdigest()

    def generate_presigned_url(self, file_id: str, expiration_seconds: int = 3600) -> str:
        """
        Generates a secure presigned access URL for S3 or a local API stream URL.
        Enables frontend media player playback without exposing credentials.
        """
        if self.use_s3 and self.s3_client:
            try:
                url = self.s3_client.generate_presigned_url(
                    ClientMethod="get_object",
                    Params={
                        "Bucket": settings.AWS_S3_BUCKET_NAME,
                        "Key": f"uploads/{file_id}"
                    },
                    ExpiresIn=expiration_seconds
                )
                return url
            except Exception as e:
                print(f"[Storage Warning] S3 Presigned URL generation failed: {e}")

        # Fallback for local dev server
        return f"{settings.API_V1_STR}/media/{file_id}/stream"

    def get_storage_stats(self) -> Dict[str, Any]:
        """Returns storage metrics for system telemetry and monitoring."""
        total_files = 0
        total_bytes = 0

        if os.path.exists(self.local_upload_dir):
            for entry in os.scandir(self.local_upload_dir):
                if entry.is_file():
                    total_files += 1
                    total_bytes += entry.stat().st_size

        # Disk utilization
        try:
            total, used, free = shutil.disk_usage(self.local_upload_dir)
            disk_total_gb = round(total / (1024**3), 2)
            disk_free_gb = round(free / (1024**3), 2)
            disk_used_percent = round((used / total) * 100, 1)
        except Exception:
            disk_total_gb = 0.0
            disk_free_gb = 0.0
            disk_used_percent = 0.0

        return {
            "storage_mode": "AWS S3" if self.use_s3 else "Local Hybrid Storage",
            "bucket_name": settings.AWS_S3_BUCKET_NAME if self.use_s3 else None,
            "region": settings.AWS_REGION if self.use_s3 else "local",
            "total_files": total_files,
            "total_bytes": total_bytes,
            "total_mb": round(total_bytes / (1024 * 1024), 2),
            "disk_total_gb": disk_total_gb,
            "disk_free_gb": disk_free_gb,
            "disk_used_percent": disk_used_percent
        }

storage_manager = CloudStorageManager()
