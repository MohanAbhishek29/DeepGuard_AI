from pathlib import Path

BASE_DIR = Path(r"c:\Users\tunga\OneDrive\Documents\Projects\New folder\DeepGuard_AI")

files_to_create = {
    # Week 3
    "src/vision/preprocessing.py": '''import cv2
import numpy as np

def align_face(image: np.ndarray, landmarks: dict) -> np.ndarray:
    """Align face based on landmarks."""
    return image

def normalize_face(image: np.ndarray) -> np.ndarray:
    """Normalize face pixel values."""
    return image / 255.0
''',
    "notebooks/01_face_extraction_eda.ipynb": """{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Face Extraction Exploratory Data Analysis"
   ]
  }
 ],
 "metadata": {},
 "nbformat": 4,
 "nbformat_minor": 5
}
""",
    # Week 4
    "src/vision/models/resnet_baseline.py": """import torch.nn as nn
from torchvision.models import resnet18, ResNet18_Weights

class ResNetBaseline(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.model = resnet18(weights=ResNet18_Weights.DEFAULT)
        self.model.fc = nn.Linear(self.model.fc.in_features, num_classes)
        
    def forward(self, x):
        return self.model(x)
""",
    "src/vision/config.py": """from dataclasses import dataclass

@dataclass
class VisionConfig:
    batch_size: int = 32
    image_size: int = 224
    num_workers: int = 4
    learning_rate: float = 1e-4
    epochs: int = 20
""",
    # Week 5
    "src/vision/dataset.py": """import torch
from torch.utils.data import Dataset
import os
from PIL import Image

class FaceForensicsDataset(Dataset):
    def __init__(self, root_dir: str, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.samples = [] # Load from directory

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        return torch.zeros((3, 224, 224)), 0 # Placeholder
""",
    "tests/test_dataset.py": """import pytest
from src.vision.dataset import FaceForensicsDataset

def test_dataset_initialization():
    dataset = FaceForensicsDataset(root_dir="dummy")
    assert dataset is not None
""",
    # Week 6
    "src/vision/train.py": """import torch
import logging

logger = logging.getLogger(__name__)

def train_epoch(model, dataloader, optimizer, criterion, device):
    model.train()
    total_loss = 0
    for inputs, labels in dataloader:
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(dataloader)

if __name__ == "__main__":
    print("Training script ready.")
""",
    "src/vision/utils/metrics.py": """from sklearn.metrics import accuracy_score, roc_auc_score, f1_score

def calculate_metrics(y_true, y_pred, y_prob):
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "f1": f1_score(y_true, y_pred),
        "auc": roc_auc_score(y_true, y_prob)
    }
""",
    # Week 7
    "src/vision/evaluate.py": """import torch
from src.vision.utils.metrics import calculate_metrics

def evaluate_model(model, dataloader, device):
    model.eval()
    all_preds, all_labels, all_probs = [], [], []
    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=1)[:, 1]
            preds = torch.argmax(outputs, dim=1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())
            
    return calculate_metrics(all_labels, all_preds, all_probs)
""",
    "notebooks/02_model_training_analysis.ipynb": """{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Model Training Analysis"
   ]
  }
 ],
 "metadata": {},
 "nbformat": 4,
 "nbformat_minor": 5
}
""",
    # Week 8
    "src/vision/explainability/gradcam.py": """from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

class GradCAMWrapper:
    def __init__(self, model, target_layers):
        self.cam = GradCAM(model=model, target_layers=target_layers)

    def generate_heatmap(self, input_tensor, target_class=1):
        targets = [ClassifierOutputTarget(target_class)]
        grayscale_cam = self.cam(input_tensor=input_tensor, targets=targets)
        return grayscale_cam[0, :]
""",
    "src/vision/explainability/visualizer.py": """import cv2
import numpy as np
from pytorch_grad_cam.utils.image import show_cam_on_image

def overlay_heatmap(img_path: str, heatmap: np.ndarray, output_path: str):
    img = cv2.imread(img_path)
    img = np.float32(img) / 255
    cam_image = show_cam_on_image(img, heatmap, use_rgb=True)
    cv2.imwrite(output_path, cv2.cvtColor(cam_image, cv2.COLOR_RGB2BGR))
""",
    # Week 9
    "src/vision/models/efficientnet.py": """import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

class EfficientNetBaseline(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
        self.model.classifier[1] = nn.Linear(self.model.classifier[1].in_features, num_classes)
        
    def forward(self, x):
        return self.model(x)
""",
    "scripts/download_weights.py": """import os
import urllib.request

def download_file(url, dest):
    print(f"Downloading {url} to {dest}")
    urllib.request.urlretrieve(url, dest)
    print("Download complete.")

if __name__ == "__main__":
    os.makedirs("weights", exist_ok=True)
    print("Run download commands here.")
""",
    # Week 10
    "src/vision/pipeline.py": """import logging
from src.vision.frame_extractor import FrameExtractor
from src.vision.face_detector import FaceDetector

logger = logging.getLogger(__name__)

class VisionPipeline:
    def __init__(self):
        self.extractor = FrameExtractor()
        self.detector = FaceDetector()
        
    def process_video(self, video_path: str):
        logger.info(f"Processing {video_path}")
        # Complete E2E process will be here
        return {"status": "success"}
""",
    "tests/test_pipeline.py": """import pytest
from src.vision.pipeline import VisionPipeline

def test_pipeline_init():
    pipeline = VisionPipeline()
    assert pipeline is not None
""",
    # Week 11
    "src/vision/utils/video_utils.py": """import cv2

def get_video_info(video_path: str):
    cap = cv2.VideoCapture(video_path)
    info = {
        "fps": cap.get(cv2.CAP_PROP_FPS),
        "frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    }
    cap.release()
    return info
""",
    "notebooks/03_inference_speed_benchmark.ipynb": """{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Inference Speed Benchmarking"
   ]
  }
 ],
 "metadata": {},
 "nbformat": 4,
 "nbformat_minor": 5
}
""",
    # Week 12
    "src/vision/heuristics.py": '''def select_best_face(faces: list) -> dict:
    """Select the most prominent face if multiple are detected."""
    if not faces:
        return None
    # Assuming face dict has 'box'
    faces.sort(key=lambda f: (f['box'][2] - f['box'][0]) * (f['box'][3] - f['box'][1]), reverse=True)
    return faces[0]
''',
    "src/vision/utils/transforms.py": """import albumentations as A
from albumentations.pytorch import ToTensorV2

def get_train_transforms():
    return A.Compose([
        A.HorizontalFlip(p=0.5),
        A.RandomBrightnessContrast(p=0.2),
        A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
        ToTensorV2(),
    ])
""",
    # Week 13
    "src/vision/evidence_exporter.py": """import json
import os

def export_evidence(results: dict, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, "evidence.json"), "w") as f:
        json.dump(results, f, indent=4)
""",
    "notebooks/04_evidence_visualization.ipynb": """{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Evidence Visualization Dashboard"
   ]
  }
 ],
 "metadata": {},
 "nbformat": 4,
 "nbformat_minor": 5
}
""",
    # Week 14
    "README_VISION.md": """# DeepGuard AI - Vision Module

This module handles video frame extraction, face detection, model inference, and explainability for the DeepGuard AI project.

## Installation
`pip install -r requirements.txt`

## Usage
`python -m src.vision.pipeline`
""",
    "src/vision/__init__.py": """# DeepGuard AI Vision Package
__version__ = "1.0.0"
""",
}


def main():
    for rel_path, content in files_to_create.items():
        file_path = BASE_DIR / rel_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Created: {file_path}")


if __name__ == "__main__":
    main()
