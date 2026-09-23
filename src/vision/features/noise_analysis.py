import logging

import cv2
import numpy as np

try:
    import pywt
except ImportError:
    logging.warning("PyWavelets (pywt) not installed. Noise analysis will be limited.")  # noqa: LOG015
    pywt = None

logger = logging.getLogger(__name__)


class NoiseAnalyzer:
    """
    Extracts and analyzes image noise residuals to detect local tampering (like Face Swaps).
    """

    def __init__(self, wavelet="db4", level=1):
        self.wavelet = wavelet
        self.level = level

    def extract_noise_residual(self, image: np.ndarray) -> np.ndarray:
        """
        Uses Discrete Wavelet Transform to separate high-frequency noise
        from the low-frequency image content.
        """
        if pywt is None:
            logger.error(
                "pywt is required for noise extraction. Please pip install PyWavelets."
            )
            return np.zeros_like(image[:, :, 0] if len(image.shape) == 3 else image)

        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image

        # Perform 2D Wavelet Transform
        coeffs = pywt.wavedec2(gray, self.wavelet, level=self.level)

        # Reconstruct the image using ONLY the high-frequency details (noise)
        # We do this by zeroing out the approximation coefficients (cA)
        coeffs[0] = np.zeros_like(coeffs[0])
        noise_residual = pywt.waverec2(coeffs, self.wavelet)

        # Ensure dimensions match original
        noise_residual = cv2.resize(noise_residual, (gray.shape[1], gray.shape[0]))

        # Normalize for visualization [0, 255]
        normalized_noise = cv2.normalize(noise_residual, None, 0, 255, cv2.NORM_MINMAX)
        return normalized_noise.astype(np.uint8)

    def compute_local_variance(
        self, noise_residual: np.ndarray, patch_size: int = 16
    ) -> np.ndarray:
        """
        Computes local variance of the noise residual.
        Inconsistent variance across the face indicates potential tampering boundaries.
        """
        # Use a box filter to compute local mean of squared pixel values
        sq_img = noise_residual.astype(np.float32) ** 2
        mean_sq = cv2.blur(sq_img, (patch_size, patch_size))

        mean = cv2.blur(noise_residual.astype(np.float32), (patch_size, patch_size))
        sq_mean = mean**2

        variance = mean_sq - sq_mean
        variance = np.maximum(variance, 0)

        return cv2.normalize(variance, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
