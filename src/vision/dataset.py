import logging
import os

import numpy as np
import torch
from PIL import Image
from torch.utils.data import Dataset

logger = logging.getLogger(__name__)


class FaceForensicsDataset(Dataset):
    """
    Robust dataset loader for FaceForensics++ directory structure.
    Expected structure:
    root_dir/
      real/
        video_001_frame_01.jpg
      fake/
        video_002_frame_01.jpg
    """

    def __init__(self, root_dir: str, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.samples = []
        self.labels = []

        self.class_map = {"real": 0, "fake": 1}

        if not os.path.exists(root_dir):
            logger.error(f"Dataset root directory does not exist: {root_dir}")
            return

        self._load_metadata()

    def _load_metadata(self):
        """Scans the directory structure and populates sample paths."""
        logger.info(f"Scanning dataset at {self.root_dir}...")
        for class_name, label in self.class_map.items():
            class_dir = os.path.join(self.root_dir, class_name)
            if not os.path.isdir(class_dir):
                logger.warning(f"Class directory not found: {class_dir}")
                continue

            valid_extensions = (".jpg", ".jpeg", ".png")
            for root, _, files in os.walk(class_dir):
                for file in files:
                    if file.lower().endswith(valid_extensions):
                        self.samples.append(os.path.join(root, file))
                        self.labels.append(label)

        logger.info(f"Loaded {len(self.samples)} valid image paths.")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        """Safely loads an image, applies transforms, and returns tensor."""
        img_path = self.samples[idx]
        label = self.labels[idx]

        try:
            # Open image and convert to RGB
            image = Image.open(img_path).convert("RGB")
            image_np = np.array(image)
        except Exception as e:  # noqa: BLE001
            logger.error(f"Failed to load image at {img_path}: {e}")
            # Return a blank zero tensor as a fallback (robustness)
            image_np = np.zeros((224, 224, 3), dtype=np.uint8)

        if self.transform:
            try:
                # Albumentations expects named arguments
                augmented = self.transform(image=image_np)
                image_tensor = augmented["image"]
            except TypeError:
                # Fallback for standard torchvision transforms
                image_tensor = self.transform(image)
        else:
            # Fallback: Just convert to tensor (C, H, W) format
            image_tensor = (
                torch.from_numpy(image_np.transpose((2, 0, 1))).float() / 255.0
            )

        return image_tensor, torch.tensor(label, dtype=torch.long)
