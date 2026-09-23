import concurrent.futures
import logging
import os
from dataclasses import dataclass
from pathlib import Path

import cv2

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@dataclass
class VideoMetadata:
    total_frames: int
    fps: float
    width: int
    height: int
    duration_sec: float


class FrameExtractor:
    """
    Advanced Frame Extractor for DeepGuard AI.
    Handles dynamic FPS scaling, corrupted video recovery, and multi-threaded extraction.
    """

    def __init__(
        self, target_fps: int = 10, output_format: str = ".jpg", max_workers: int = 4
    ):
        self.target_fps = target_fps
        self.output_format = output_format
        self.max_workers = max_workers

    def _get_video_metadata(self, video_path: str) -> VideoMetadata | None:
        """Safely retrieve video metadata."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Failed to open video for metadata extraction: {video_path}")
            return None

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        cap.release()

        if fps == 0 or total_frames == 0:
            logger.warning(f"Corrupted metadata detected in {video_path}")
            return None

        return VideoMetadata(
            total_frames=total_frames,
            fps=fps,
            width=width,
            height=height,
            duration_sec=total_frames / fps,
        )

    def extract_frames(self, video_path: str, output_dir: str) -> list[str]:
        """
        Extracts frames intelligently based on target FPS.

        Args:
            video_path (str): Path to the source video.
            output_dir (str): Destination directory for frames.

        Returns:
            List[str]: Absolute paths of all successfully extracted frames.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found at: {video_path}")

        os.makedirs(output_dir, exist_ok=True)

        meta = self._get_video_metadata(video_path)
        if meta:
            logger.info(
                f"Video details: {meta.duration_sec:.2f}s, {meta.fps} FPS, {meta.width}x{meta.height}"
            )
            # Adjust target FPS if video is too short
            if meta.duration_sec < 2.0:
                logger.info(
                    "Video is very short. Increasing extraction FPS to capture enough data."
                )
                self.target_fps = min(int(meta.fps), 15)

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"OpenCV could not open video: {video_path}")

        original_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        frame_interval = max(1, round(original_fps / self.target_fps))

        extracted_files = []
        frame_count = 0
        saved_count = 0

        logger.info(
            f"Starting extraction at ~{self.target_fps} FPS (Interval: {frame_interval})"
        )

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                out_path = os.path.join(
                    output_dir, f"frame_{saved_count:05d}{self.output_format}"
                )
                # Save frame
                try:
                    cv2.imwrite(out_path, frame)
                    extracted_files.append(os.path.abspath(out_path))
                    saved_count += 1
                except Exception as e:  # noqa: BLE001
                    logger.error(f"Failed to write frame {saved_count}: {e}")

            frame_count += 1

        cap.release()
        logger.info(f"Successfully extracted {saved_count} frames to {output_dir}")
        return extracted_files

    def process_batch(self, video_paths: list[str], base_output_dir: str) -> dict:
        """
        Process multiple videos concurrently using thread pools.

        Returns:
            dict: Mapping of video paths to their extracted frame paths.
        """
        results = {}

        def _process_single(vid_path):
            vid_name = Path(vid_path).stem
            out_dir = os.path.join(base_output_dir, vid_name)
            try:
                frames = self.extract_frames(vid_path, out_dir)
                return vid_path, frames
            except Exception as e:  # noqa: BLE001
                logger.error(f"Batch processing error for {vid_path}: {e}")
                return vid_path, []

        logger.info(
            f"Starting batch extraction for {len(video_paths)} videos with {self.max_workers} workers."
        )
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=self.max_workers
        ) as executor:
            future_to_vid = {
                executor.submit(_process_single, vp): vp for vp in video_paths
            }
            for future in concurrent.futures.as_completed(future_to_vid):
                vid_path, frames = future.result()
                results[vid_path] = frames

        return results


if __name__ == "__main__":
    logger.info("FrameExtractor module loaded successfully.")
