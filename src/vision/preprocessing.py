import logging

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class Preprocessor:
    """
    Advanced image preprocessing for deepfake detection models.
    Features Contrast Limited Adaptive Histogram Equalization (CLAHE)
    and robust facial alignment techniques.
    """

    def __init__(self):
        # Initialize CLAHE for better lighting consistency across frames
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

    def apply_clahe(self, image: np.ndarray) -> np.ndarray:
        """
        Applies CLAHE to the lightness channel in LAB color space.
        Enhances local contrast without affecting color balance.
        """
        if len(image.shape) != 3 or image.shape[2] != 3:
            logger.warning("CLAHE requires a 3-channel RGB image. Returning original.")
            return image

        # Convert RGB to LAB
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        # Apply CLAHE to L-channel
        cl = self.clahe.apply(l)

        # Merge and convert back
        limg = cv2.merge((cl, a, b))
        final = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
        return final

    def align_face(
        self, image: np.ndarray, left_eye: tuple, right_eye: tuple
    ) -> np.ndarray:
        """
        Aligns a face image so that the eyes are perfectly horizontal.
        Crucial for CNN models to focus on facial features rather than pose.

        Args:
            image: Cropped face numpy array (RGB)
            left_eye: (x, y) coordinates of the left eye
            right_eye: (x, y) coordinates of the right eye
        """
        # Calculate angle
        dy = right_eye[1] - left_eye[1]
        dx = right_eye[0] - left_eye[0]
        angle = np.degrees(np.arctan2(dy, dx))

        # Center of rotation
        eyes_center = (
            (left_eye[0] + right_eye[0]) // 2,
            (left_eye[1] + right_eye[1]) // 2,
        )

        # Get rotation matrix
        M = cv2.getRotationMatrix2D(eyes_center, angle, scale=1.0)

        # Apply affine transformation
        aligned = cv2.warpAffine(
            image,
            M,
            (image.shape[1], image.shape[0]),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE,
        )
        return aligned

    def normalize_tensor(self, image: np.ndarray) -> np.ndarray:
        """
        Standard ImageNet normalization.
        Expects image in range [0, 255].
        """
        img_float = image.astype(np.float32) / 255.0

        # ImageNet mean and std
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

        normalized = (img_float - mean) / std
        return normalized

    def full_pipeline(self, image: np.ndarray) -> np.ndarray:
        """Runs the standard sequence of preprocessing steps."""
        enhanced = self.apply_clahe(image)
        # Note: Alignment is skipped here as it requires landmark detection outputs
        return enhanced
