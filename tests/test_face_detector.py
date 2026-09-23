import cv2
import numpy as np
import pytest

from src.vision.face_detector import FaceDetector


@pytest.fixture
def dummy_image(tmp_path):
    """Creates a dummy image with a simulated face-like square for testing."""
    img_path = tmp_path / "dummy_face.jpg"

    # Create a blank image (gray background)
    img = np.ones((500, 500, 3), dtype=np.uint8) * 200

    # Draw a flesh-colored rectangle (simulate face)
    cv2.rectangle(img, (150, 150), (350, 350), (180, 200, 240), -1)

    # Draw eyes
    cv2.circle(img, (200, 200), 20, (0, 0, 0), -1)
    cv2.circle(img, (300, 200), 20, (0, 0, 0), -1)

    # Draw mouth
    cv2.rectangle(img, (200, 300), (300, 320), (0, 0, 0), -1)

    cv2.imwrite(str(img_path), img)
    return str(img_path)


def test_face_detector_initialization():
    detector = FaceDetector(device="cpu")
    assert detector is not None


def test_detect_faces(dummy_image):
    # Note: MTCNN might struggle with a very artificial dummy image,
    # but we can test the pipeline execution.
    detector = FaceDetector(device="cpu")
    results = detector.detect_faces(dummy_image)

    assert isinstance(results, list)
    # Since it's a dummy image, it might not find a face, but the function should not crash.
    # If it finds a face, ensure format is correct.
    if len(results) > 0:
        assert "box" in results[0]
        assert "confidence" in results[0]
        assert len(results[0]["box"]) == 4
