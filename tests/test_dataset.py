import unittest
from src.vision.dataset import FaceForensicsDataset


class TestDataset(unittest.TestCase):

    def test_dataset_initialization(self):
        dataset = FaceForensicsDataset(root_dir="dummy")
        self.assertIsNotNone(dataset)


if __name__ == "__main__":
    unittest.main()
