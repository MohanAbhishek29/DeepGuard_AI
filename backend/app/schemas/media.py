from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class MediaUploadResponse(BaseModel):
    file_id: str = Field(..., description="Unique media identifier")
    original_filename: str
    file_size_bytes: int
    media_type: str = Field(..., description="video or audio")
    storage_uri: str = Field(..., description="AWS S3 URI or local storage path")
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class AnalysisRequest(BaseModel):
    file_id: str = Field(..., description="Identifier of the uploaded media file")
    enabled_modalities: List[str] = Field(default=["vision", "audio", "speech"])

class VisionEvidence(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0, description="Visual manipulation probability")
    status: str = Field(..., description="AUTHENTIC, SUSPICIOUS, or UNCERTAIN")
    total_frames_analyzed: int
    suspicious_frames_detected: int
    face_detected: bool
    timestamps: List[float] = Field(default_factory=list)
    artifacts: List[str] = Field(default_factory=list)

class AudioEvidence(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0, description="Synthetic voice / spoof probability")
    status: str = Field(..., description="AUTHENTIC, SUSPICIOUS, or UNCERTAIN")
    spectrogram_generated: bool
    timestamps: List[float] = Field(default_factory=list)
    acoustic_features: Dict[str, Any] = Field(default_factory=dict)

class SpeechEvidence(BaseModel):
    transcript: str = Field(default="", description="OpenAI Whisper speech-to-text transcript")
    status: str = Field(default="SUPPORTING_INFO")
    language_detected: str = "en"
    word_count: int = 0

class CrossModalCorrelation(BaseModel):
    overall_verdict: str = Field(..., description="AUTHENTIC, MANIPULATED, DISAGREEMENT, or UNCERTAIN")
    disagreement_detected: bool = Field(..., description="True if vision and audio indicate conflicting signals")
    disagreement_reason: Optional[str] = None
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    timeline_events: List[Dict[str, Any]] = Field(default_factory=list)

class AnalysisResultResponse(BaseModel):
    job_id: str
    file_id: str
    status: str = Field(..., description="PENDING, PROCESSING, or COMPLETED")
    vision: Optional[VisionEvidence] = None
    audio: Optional[AudioEvidence] = None
    speech: Optional[SpeechEvidence] = None
    cross_modal: Optional[CrossModalCorrelation] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
