# DeepGuard AI - Backend & Cloud Orchestrator ⚙️

**Author / Lead:** Mohan Abhishek Gupta  
**Role:** Cloud & System Architecture  
**Group Code:** K3C0175 | **SIH Problem:** SIH1683  

---

## 📌 Architecture Overview

The **DeepGuard AI Backend** is built using **FastAPI** to serve as the central nervous system of the platform. It orchestrates asynchronous analysis jobs across three parallel forensic pipelines:
1. **Computer Vision Branch** (`src/vision/` - Tunga Durga Sai Prasad)
2. **Audio ML Branch** (Mel-spectrograms & Voice anti-spoofing)
3. **Speech / NLP Branch** (OpenAI Whisper ASR)

And performs **Cross-Modal Evidence Correlation** to expose disagreement cases (e.g. authentic video with cloned audio) on a synchronized timeline.

---

## 🚀 Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root health status & project metadata (Group code & SIH ID) |
| `GET` | `/health` | Subsystem liveness and readiness probe |
| `POST` | `/api/v1/media/upload` | Multipart file upload with format validation and AWS S3/Local persistence |
| `POST` | `/api/v1/analysis/start` | Dispatches multimodal analysis jobs across branches |
| `GET` | `/api/v1/analysis/jobs/{job_id}` | Retrieves forensic evidence, modality scores, and cross-modal correlation |

---

## 💻 Local Execution

```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Start the FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```

Interactive Swagger documentation will be available at:  
👉 **http://localhost:8000/docs**
