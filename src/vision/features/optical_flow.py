import logging

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class OpticalFlowAnalyzer:
    """
    Computes dense optical flow between consecutive frames to detect
    unnatural temporal jitter or facial boundaries moving inconsistently
    with the background (common in face-swapping).
    """

    def __init__(self):
        self.prev_gray = None

    def reset(self):
        self.prev_gray = None

    def compute_flow(self, current_frame: np.ndarray) -> dict:
        """
        Computes Farneback dense optical flow.
        Returns the magnitude and angle of flow, and an anomaly score.
        """
        if len(current_frame.shape) == 3:
            curr_gray = cv2.cvtColor(current_frame, cv2.COLOR_RGB2GRAY)
        else:
            curr_gray = current_frame

        if self.prev_gray is None:
            self.prev_gray = curr_gray
            return {"status": "initial_frame", "anomaly_score": 0.0}

        # Calculate dense optical flow
        flow = cv2.calcOpticalFlowFarneback(
            self.prev_gray,
            curr_gray,
            None,
            pyr_scale=0.5,
            levels=3,
            winsize=15,
            iterations=3,
            poly_n=5,
            poly_sigma=1.2,
            flags=0,
        )

        # Compute magnitude and angle
        mag, _ang = cv2.cartToPolar(flow[..., 0], flow[..., 1])

        # Detect anomaly: Extremely high variance in movement magnitude within the face
        # usually indicates jittering (poor temporal consistency of the deepfake)
        variance = float(np.var(mag))

        # Normalize variance to a 0-1 anomaly score (heuristic)
        anomaly_score = min(1.0, variance / 50.0)

        self.prev_gray = curr_gray

        return {
            "status": "success",
            "mean_magnitude": float(np.mean(mag)),
            "variance": variance,
            "anomaly_score": anomaly_score,
        }

    def visualize_flow(self, flow_dict: dict, current_frame: np.ndarray) -> np.ndarray:
        """Creates an HSV visualization of the flow."""
        # Note: This requires the raw flow data to be passed, skipping implementation
        # for brevity, returning placeholder
        return current_frame
