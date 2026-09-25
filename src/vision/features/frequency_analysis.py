import logging

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class FrequencyAnalyzer:
    """
    Analyzes the frequency domain of images to detect artifacts commonly
    left behind by GANs and Diffusion models.
    """

    def __init__(self):
        pass

    def get_magnitude_spectrum(self, image: np.ndarray) -> np.ndarray:
        """
        Computes the 2D Fast Fourier Transform (FFT) magnitude spectrum.
        """
        try:
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            else:
                gray = image

            # Perform 2D FFT
            f = np.fft.fft2(gray)
            # Shift the zero-frequency component to the center
            fshift = np.fft.fftshift(f)

            # Calculate magnitude spectrum (log scale for visibility)
            # Add small epsilon to prevent log(0)
            magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-8)

            # Normalize to 0-255 for visualization
            magnitude_spectrum = cv2.normalize(
                magnitude_spectrum, None, 0, 255, cv2.NORM_MINMAX
            )
            return magnitude_spectrum.astype(np.uint8)

        except Exception as e:  # noqa: BLE001
            logger.error(f"Failed to compute FFT magnitude spectrum: {e}")
            return np.zeros_like(image[:, :, 0] if len(image.shape) == 3 else image)

    def detect_high_frequency_anomalies(
        self, magnitude_spectrum: np.ndarray, threshold: float = 0.85
    ) -> float:
        """
        Estimates the likelihood of GAN artifacts by analyzing high-frequency energy.
        Real images tend to have smooth drop-offs, while fakes have high-frequency spikes.

        Returns a score from 0.0 (Real) to 1.0 (Fake).
        """
        # A simple heuristic: compute energy in the outer rings (high frequency) vs inner rings
        h, w = magnitude_spectrum.shape
        center_x, center_y = w // 2, h // 2

        # Mask out the low frequencies (inner circle)
        y, x = np.ogrid[:h, :w]
        radius = min(center_x, center_y) // 4
        mask = (x - center_x) ** 2 + (y - center_y) ** 2 > radius**2

        high_freq_energy = np.mean(magnitude_spectrum[mask])
        low_freq_energy = np.mean(magnitude_spectrum[~mask])

        if low_freq_energy == 0:
            return 0.0

        ratio = high_freq_energy / low_freq_energy

        # Normalize the ratio to a 0-1 anomaly score
        # These bounds (0.2, 0.8) are hyperparams that should be tuned on a dataset
        anomaly_score = np.clip((ratio - 0.2) / 0.6, 0.0, 1.0)
        return float(anomaly_score)
