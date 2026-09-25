import logging

import numpy as np
import torch
from pytorch_grad_cam import GradCAM, GuidedBackpropReLUModel
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

logger = logging.getLogger(__name__)


class ExplainabilityWrapper:
    """
    Advanced explainability module for visual deepfake models.
    Combines GradCAM for coarse localization and Guided Backpropagation
    for fine-grained, high-resolution edge maps.
    """

    def __init__(self, model, target_layers, device="cpu"):
        self.device = torch.device(device)
        self.model = model.to(self.device)
        self.model.eval()

        # Initialize GradCAM
        self.cam = GradCAM(model=self.model, target_layers=target_layers)

        # Initialize Guided Backprop
        # Note: Guided Backprop requires the model to be wrapped, which can modify ReLU behavior
        self.gb_model = GuidedBackpropReLUModel(model=self.model, device=self.device)

        logger.info("Initialized ExplainabilityWrapper (GradCAM + GuidedBackprop)")

    def generate_gradcam(
        self, input_tensor: torch.Tensor, target_class: int = 1
    ) -> np.ndarray:
        """Generates the standard GradCAM heatmap."""
        targets = [ClassifierOutputTarget(target_class)]
        # GradCAM expects [B, C, H, W]
        if len(input_tensor.shape) == 3:
            input_tensor = input_tensor.unsqueeze(0)

        grayscale_cam = self.cam(
            input_tensor=input_tensor.to(self.device), targets=targets
        )
        return grayscale_cam[0, :]  # Return 2D array [H, W]

    def generate_guided_backprop(
        self, input_tensor: torch.Tensor, target_class: int = 1
    ) -> np.ndarray:
        """Generates high-frequency Guided Backpropagation gradients."""
        targets = [ClassifierOutputTarget(target_class)]
        if len(input_tensor.shape) == 3:
            input_tensor = input_tensor.unsqueeze(0)

        gb = self.gb_model(input_tensor.to(self.device), target_category=targets[0])
        # gb is returned as numpy array [H, W, C]
        return gb

    def generate_guided_gradcam(
        self, input_tensor: torch.Tensor, target_class: int = 1
    ) -> np.ndarray:
        """
        Multiplies Guided Backprop with GradCAM to get a high-res class-discriminative map.
        """
        cam_mask = self.generate_gradcam(input_tensor, target_class)
        gb_grad = self.generate_guided_backprop(input_tensor, target_class)

        # Expand cam_mask to [H, W, C] to multiply with gb_grad
        cam_mask_3d = np.repeat(cam_mask[:, :, np.newaxis], 3, axis=2)

        # Element-wise multiplication
        guided_cam = gb_grad * cam_mask_3d

        # Normalize to [0, 1] for visualization
        guided_cam = guided_cam - np.min(guided_cam)
        guided_cam = guided_cam / (np.max(guided_cam) + 1e-8)

        return guided_cam
