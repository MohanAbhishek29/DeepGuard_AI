from src.vision.dataset import FaceForensicsDataset


def test_dataset_initialization():
    dataset = FaceForensicsDataset(root_dir="dummy")
    assert dataset is not None
