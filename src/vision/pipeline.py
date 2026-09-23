import logging
import os
from typing import Any

import torch

from src.vision.face_detector import FaceDetector

# Advanced Features
from src.vision.features.frequency_analysis import FrequencyAnalyzer
from src.vision.features.optical_flow import OpticalFlowAnalyzer
from src.vision.features.rppg import rPPGExtractor
from src.vision.frame_extractor import FrameExtractor
from src.vision.models.efficientnet import EfficientNetBaseline
from src.vision.preprocessing import Preprocessor

logger = logging.getLogger(__name__)


class VisionPipeline:
    """
    End-to-End Orchestrator for the DeepGuard AI Vision Module.
    Integrates Deep Learning Classification with advanced feature analytics
    (Frequency Analysis, Biological rPPG, Temporal Optical Flow).
    """

    def __init__(self, model_path: str | None = None, device: str | None = None):
        self.device = torch.device(
            device if device else ("cuda" if torch.cuda.is_available() else "cpu")
        )
        logger.info(f"Initializing VisionPipeline on {self.device}")

        self.fps = 15  # Required for rPPG
        self.extractor = FrameExtractor(target_fps=self.fps)
        self.detector = FaceDetector(device=self.device)
        self.preprocessor = Preprocessor()

        # Initialize Feature Analyzers
        self.freq_analyzer = FrequencyAnalyzer()
        self.rppg = rPPGExtractor(fps=self.fps)
        self.opt_flow = OpticalFlowAnalyzer()

        # Initialize Deep Learning model
        self.model = EfficientNetBaseline(num_classes=2).to(self.device)
        if model_path and os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()

    def process_video(
        self, video_path: str, temp_dir: str = "./temp_frames"
    ) -> dict[str, Any]:
        """Process a single video through DL and advanced feature pipelines."""
        logger.info(f"--- Starting pipeline for {video_path} ---")

        results = {
            "video_path": video_path,
            "status": "failed",
            "frame_scores": [],
            "advanced_features": {},
            "overall_score": 0.0,
            "error": None,
        }

        try:
            frames = self.extractor.extract_frames(video_path, temp_dir)
            if not frames:
                raise ValueError("No frames extracted.")

            self.opt_flow.reset()
            fake_probs = []
            freq_anomalies = []

            for frame_path in frames:
                # 1. Detection
                faces = self.detector.crop_faces(frame_path)
                if not faces:
                    continue

                primary_face = faces[0]

                # 2. Advanced Features Processing
                # Biological Pulse
                self.rppg.process_frame(primary_face)

                # Frequency Analysis (GAN artifacts)
                mag_spec = self.freq_analyzer.get_magnitude_spectrum(primary_face)
                freq_anomaly = self.freq_analyzer.detect_high_frequency_anomalies(
                    mag_spec
                )
                freq_anomalies.append(freq_anomaly)

                # Temporal Jitter (Optical Flow)
                flow_data = self.opt_flow.compute_flow(primary_face)

                # 3. Deep Learning Classification
                clean_face = self.preprocessor.full_pipeline(primary_face)
                input_tensor = self.preprocessor.normalize_tensor(clean_face)
                input_batch = (
                    torch.from_numpy(input_tensor).unsqueeze(0).to(self.device)
                )

                with torch.no_grad():
                    output = self.model(input_batch)
                    prob = torch.softmax(output, dim=1)[0, 1].item()

                fake_probs.append(
                    {
                        "frame": os.path.basename(frame_path),
                        "dl_fake_prob": round(prob, 4),
                        "optical_flow_anomaly": round(
                            flow_data.get("anomaly_score", 0), 4
                        ),
                    }
                )

            if not fake_probs:
                raise ValueError("No faces detected in any frames.")

            # Aggregate advanced metrics
            rppg_data = self.rppg.analyze_signal()
            avg_freq_anomaly = sum(freq_anomalies) / len(freq_anomalies)
            avg_dl_score = sum(f["dl_fake_prob"] for f in fake_probs) / len(fake_probs)

            results["advanced_features"] = {
                "biological_pulse": rppg_data,
                "frequency_artifact_score": round(avg_freq_anomaly, 4),
            }
            results["frame_scores"] = fake_probs

            # Combine DL score with advanced feature anomalies for final verdict
            # (In a real system, this would be an ensemble model)
            ensemble_score = (avg_dl_score * 0.7) + (avg_freq_anomaly * 0.3)

            results["status"] = "success"
            results["overall_score"] = round(ensemble_score, 4)
            logger.info(f"Pipeline complete. Ensemble Fake Score: {ensemble_score:.4f}")

        except Exception as e:
            logger.error(f"Pipeline failed: {e}", exc_info=True)  # noqa: G201
            results["error"] = str(e)

        finally:
            if os.path.exists(temp_dir):
                for f in os.listdir(temp_dir):
                    os.remove(os.path.join(temp_dir, f))
                os.rmdir(temp_dir)

        return results
