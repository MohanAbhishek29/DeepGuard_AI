import logging

import numpy as np

logger = logging.getLogger(__name__)


class BlinkDetector:
    """
    Analyzes eye aspect ratio (EAR) over time to detect natural blinking.
    Deepfakes often have absent, asymmetrical, or unnaturally timed blinks.
    """

    def __init__(self, ear_threshold: float = 0.21, consecutive_frames: int = 3):
        self.ear_threshold = ear_threshold
        self.consecutive_frames = consecutive_frames
        self.ear_history = []

    def calculate_ear(self, eye_landmarks: list[tuple[float, float]]) -> float:
        """
        Calculates the Eye Aspect Ratio.
        Requires 6 points for a single eye (e.g., from dlib or MediaPipe).
        """
        if len(eye_landmarks) != 6:
            logger.warning("BlinkDetector requires exactly 6 landmarks per eye.")
            return 0.0

        # Compute the euclidean distances between the two sets of vertical eye landmarks
        A = np.linalg.norm(np.array(eye_landmarks[1]) - np.array(eye_landmarks[5]))
        B = np.linalg.norm(np.array(eye_landmarks[2]) - np.array(eye_landmarks[4]))

        # Compute the euclidean distance between the horizontal eye landmarks
        C = np.linalg.norm(np.array(eye_landmarks[0]) - np.array(eye_landmarks[3]))

        # Compute EAR
        ear = (A + B) / (2.0 * C)
        return ear

    def process_frame(self, left_eye_lm: list[tuple], right_eye_lm: list[tuple]):
        """Calculates average EAR for the frame and appends to history."""
        if not left_eye_lm or not right_eye_lm:
            self.ear_history.append(1.0)  # Assume eyes open if undetectable
            return

        left_ear = self.calculate_ear(left_eye_lm)
        right_ear = self.calculate_ear(right_eye_lm)
        avg_ear = (left_ear + right_ear) / 2.0

        self.ear_history.append(avg_ear)

    def analyze_blinks(self, fps: float) -> dict:
        """
        Analyzes the EAR history to count blinks and determine blinking realism.
        """
        blink_count = 0
        frames_below_thresh = 0

        for ear in self.ear_history:
            if ear < self.ear_threshold:
                frames_below_thresh += 1
            else:
                if frames_below_thresh >= self.consecutive_frames:
                    blink_count += 1
                frames_below_thresh = 0

        duration_sec = len(self.ear_history) / max(fps, 1)
        blinks_per_minute = (blink_count / max(duration_sec, 1)) * 60

        # Natural human blinking rate is generally 15-20 times per minute
        is_realistic = 5 <= blinks_per_minute <= 30

        return {
            "total_blinks": blink_count,
            "blinks_per_minute": round(blinks_per_minute, 1),
            "is_realistic_rate": is_realistic,
        }
