import json
import logging
import os
import time
from typing import Any

logger = logging.getLogger(__name__)


class EvidenceExporter:
    """
    Handles packaging the vision analysis results into a structured format
    ready for consumption by the React/Next.js dashboard and correlation
    with the Audio/Speech modules.
    """

    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def export_video_report(
        self,
        video_id: str,
        fps: float,
        overall_score: float,
        frame_data: list[dict[str, Any]],
    ):
        """
        Exports a comprehensive JSON report containing temporal data.

        Args:
            video_id: Unique identifier for the video being processed.
            fps: The extraction frames per second (to calculate timestamps).
            overall_score: The aggregated fake probability [0-1].
            frame_data: List of dictionaries containing frame scores and heatmap paths.
        """
        # Calculate timestamps based on frame index and FPS
        enriched_frames = []
        for i, frame in enumerate(frame_data):
            timestamp_sec = round(i / fps, 2)
            enriched_frames.append(
                {
                    "frame_index": i,
                    "timestamp_sec": timestamp_sec,
                    "fake_probability": frame.get("fake_probability", 0.0),
                    "original_img_path": frame.get("frame_path", ""),
                    "heatmap_grid_path": frame.get("heatmap_path", ""),
                }
            )

        report = {
            "metadata": {
                "video_id": video_id,
                "processed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "module": "Vision",
                "extraction_fps": fps,
            },
            "summary": {
                "overall_fake_probability": overall_score,
                "verdict": "FAKE" if overall_score > 0.5 else "REAL",
                "total_frames_analyzed": len(enriched_frames),
            },
            "timeline": enriched_frames,
        }

        out_file = os.path.join(self.output_dir, f"{video_id}_vision_report.json")
        try:
            with open(out_file, "w") as f:
                json.dump(report, f, indent=4)
            logger.info(f"Successfully exported vision evidence report to {out_file}")
            return out_file
        except Exception as e:  # noqa: BLE001
            logger.error(f"Failed to export evidence report: {e}")
            return None
