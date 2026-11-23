import tempfile
import unittest
import cv2
import numpy as np
from src.vision.face_detector import FaceDetector


class TestFaceDetector(unittest.TestCase):

    def test_face_detector_initialization(self):
        detector = FaceDetector(device="cpu")
        self.assertIsNotNone(detector)

    def test_detect_faces(self):
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
            img_path = f.name

        img = np.ones((500, 500, 3), dtype=np.uint8) * 200
        cv2.rectangle(img, (150, 150), (350, 350), (180, 200, 240), -1)
        cv2.circle(img, (200, 200), 20, (0, 0, 0), -1)
        cv2.circle(img, (300, 200), 20, (0, 0, 0), -1)
        cv2.rectangle(img, (200, 300), (300, 320), (0, 0, 0), -1)
        cv2.imwrite(img_path, img)

        detector = FaceDetector(device="cpu")
        results = detector.detect_faces(img_path)

        self.assertIsInstance(results, list)
        if len(results) > 0:
            self.assertIn("box", results[0])
            self.assertIn("confidence", results[0])
            self.assertEqual(len(results[0]["box"]), 4)


if __name__ == "__main__":
    unittest.main()
