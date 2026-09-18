# DeepGuard AI 🛡️
### Multimodal Synthetic Media and Deepfake Detection Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688.svg)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-Deep%20Learning-EE4C2C.svg)](https://pytorch.org/)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-black.svg)](https://nextjs.org/)
[![Group Code](https://img.shields.io/badge/Group%20Code-K3C0175-orange.svg)]()
[![SIH Mapping](https://img.shields.io/badge/SIH-Problem%20SIH1683-brightgreen.svg)]()

---

## 📌 Project Overview

**DeepGuard AI** is a research-oriented, multimodal media analysis platform designed to detect and investigate manipulated or AI-generated video and audio content. 

Unlike black-box commercial tools that output an opaque authenticity score without contextual explanations, **DeepGuard AI introduces a transparent multimodal evidence-correlation approach**. The platform inspects visual artifacts, acoustic spoof signals, and transcribed speech across a synchronized timeline, keeping modality-specific evidence visible so users can understand *where*, *when*, and *why* manipulation is suspected.

---

## 🎯 The Problem & Proposed Contribution

Modern generative AI tools can forge human likenesses with high realism. A malicious synthetic video may contain:
- A genuine video track with a **voice-cloned audio track**.
- An authentic audio track with a **deepfake face-swap**.
- Completely synthetic audio-visual content.

Traditional unimodal detectors often fail when only one dimension of media has been tampered with. DeepGuard AI solves this by:
1. **Separating Analysis Branches**: Video frames, acoustic spectrograms, and speech transcripts are processed through dedicated specialized models.
2. **Exposing Modality Evidence**: Individual scores, Mel-spectrograms, and suspicious video frames are preserved rather than collapsed into a single mystery number.
3. **Cross-Modal Disagreement Detection**: Explicitly detecting inconsistencies between branches (e.g., visual analysis indicates authentic video while audio indicates synthetic speech).
4. **Temporal Evidence Alignment**: Pinpointing exact timestamps where anomalies are observed.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    A[User / Client] -->|Upload Media| B[Web Interface / Dashboard]
    B -->|API Request| C[FastAPI Backend Orchestrator]
    C -->|Store Media| D[(AWS S3 / Storage)]
    
    subgraph Preprocessing [Preprocessing Pipeline]
        C --> E[Frame Sampling & Face Crop - OpenCV / FFmpeg]
        C --> F[Audio Track Separation & Spectrograms - Librosa]
    end
    
    subgraph Modalities [Parallel Analysis Branches]
        E --> G[Visual Manipulation Detector - FaceForensics++]
        F --> H[Audio Synthetic Media Detector - ASVspoof]
        F --> I[Speech-to-Text Transcriber - OpenAI Whisper]
    end
    
    subgraph Fusion [Cross-Modal Evidence Correlation]
        G --> J[Temporal Alignment & Disagreement Analysis]
        H --> J
        I --> J
    end
    
    J -->|Correlated Results & Evidence| K[Interactive Evidence Dashboard]
    K --> A
```

---

## 👥 Team Members & Responsibilities

| Team Member | Primary Responsibility | Key Deliverables |
| :--- | :--- | :--- |
| **Mohan Abhishek Gupta** | **Cloud & System Architecture (Lead)** | Cloud infrastructure, AWS S3 storage, FastAPI backend orchestrator, API schemas, and deployment. |
| **Tunga Durga Sai Prasad** | **ML / Computer Vision** | Frame extraction, face detection, visual deepfake model experiments, and visual evidence generation. |
| **Harsha Paladi** | **Audio Machine Learning** | Audio extraction, acoustic representation, Mel-spectrograms, and synthetic speech detector. |
| **Vinay Rayi** | **Speech / NLP** | OpenAI Whisper ASR integration, speech transcription, and textual contextual analysis. |
| **Bikesh** | **Data Pipeline & ML Evaluation** | Dataset curation, benchmarking (Precision, Recall, F1, Confusion Matrix), and ablation studies. |
| **Harsha** | **Full Stack & Dashboard** | Next.js/React frontend, media upload workflow, interactive evidence dashboard, and timeline UI. |

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | Next.js / React, TailwindCSS, Lucide Icons, Wavesurfer.js |
| **Backend API** | Python, FastAPI, Uvicorn, Pydantic |
| **Computer Vision** | OpenCV, FFmpeg, PyTorch, Pretrained Deepfake Detectors |
| **Audio & Speech** | Librosa, PyTorch Audio, OpenAI Whisper |
| **Evaluation Data** | FaceForensics++, ASVspoof 2021 Benchmark Datasets |
| **Cloud & DevOps** | AWS S3, Docker, Git & GitHub |

---

## 📅 Project Roadmap

- [x] **Phase 1**: Project topic submission, architecture design, and repository setup.
- [ ] **Phase 2**: Media upload flow, validation, and preprocessing pipelines.
- [ ] **Phase 3**: Visual analysis baseline model implementation.
- [ ] **Phase 4**: Audio synthetic-speech baseline model implementation.
- [ ] **Phase 5**: Speech-to-text integration and supporting transcript generation.
- [ ] **Phase 6**: Cross-modal correlation layer and disagreement detection logic.
- [ ] **Phase 7**: Evidence dashboard integration and cloud deployment.
- [ ] **Phase 8**: Quantitative evaluation, ablation experiments, and error analysis.
- [ ] **Phase 9**: Final demonstration, documentation, and research presentation.

---

## ⚖️ Academic Disclaimer & Responsible Use

DeepGuard AI is an academic research prototype intended for experimental evaluation and educational demonstration. Detection outputs represent probabilistic model estimates under tested conditions and are not presented as legally conclusive forensic evidence.
