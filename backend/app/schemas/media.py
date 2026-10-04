from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class MediaUploadResponse(BaseModel):
    file_id: str = Field(..., description="Unique media identifier")
    original_filename: str
    file_size_bytes: int
    media_type: str = Field(..., description="video or audio")
    storage_uri: str = Field(..., description="AWS S3 URI or local storage path")
    stream_url: Optional[str] = Field(None, description="Direct playback or presigned URL")
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class MediaURLResponse(BaseModel):
    file_id: str
    stream_url: str
    storage_mode: str
    expires_in_seconds: int = 3600

class MediaDeleteResponse(BaseModel):
    file_id: str
    deleted: bool
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

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

class JobSummary(BaseModel):
    job_id: str
    file_id: str
    status: str
    overall_verdict: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

class ForensicAuditReport(BaseModel):
    report_id: str = Field(..., description="Unique verifiable forensic audit certificate identifier")
    job_id: str
    file_id: str
    file_sha256: str = Field(..., description="SHA-256 cryptographic media checksum for chain-of-custody")
    lead_architect: str = "Mohan Abhishek Gupta (Cloud & System Architecture)"
    group_code: str = "K3C0175"
    sih_mapping: str = "SIH1683"
    executive_verdict: str
    confidence_percentage: float
    disagreement_analysis: Dict[str, Any]
    modalities_evaluated: Dict[str, Any]
    timeline_anomalies_count: int
    chain_of_custody_status: str = "VERIFIED_TAMPER_EVIDENT"
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class SystemTelemetryResponse(BaseModel):
    status: str
    service: str
    version: str
    group_code: str
    sih_problem_id: str
    lead_architect: str
    storage: Dict[str, Any]
    orchestration: Dict[str, Any]
    uptime_seconds: float
