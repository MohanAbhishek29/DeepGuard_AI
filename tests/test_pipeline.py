import unittest
from src.vision.pipeline import VisionPipeline


class TestPipeline(unittest.TestCase):

    def test_pipeline_init(self):
        pipeline = VisionPipeline()
        self.assertIsNotNone(pipeline)


if __name__ == "__main__":
    unittest.main()
