import cv2
import matplotlib.pyplot as plt
import numpy as np
from pytorch_grad_cam.utils.image import show_cam_on_image


def overlay_heatmap(
    img_path: str, heatmap: np.ndarray, output_path: str, alpha: float = 0.5
):
    """
    Standard visualization overlaying coarse GradCAM heatmap on the original image.
    """
    try:
        img = cv2.imread(img_path)
        if img is None:
            raise FileNotFoundError(f"Image not found: {img_path}")

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_float = np.float32(img) / 255.0

        # Apply colormap (JET is default in show_cam_on_image)
        cam_image = show_cam_on_image(
            img_float, heatmap, use_rgb=True, image_weight=alpha
        )

        cv2.imwrite(output_path, cv2.cvtColor(cam_image, cv2.COLOR_RGB2BGR))
        return True
    except Exception as e:  # noqa: BLE001
        print(f"Error in overlay_heatmap: {e}")
        return False


def generate_evidence_grid(
    img_path: str, gradcam: np.ndarray, guided_gradcam: np.ndarray, output_path: str
):
    """
    Creates a 1x3 grid for the dashboard:
    [Original] | [GradCAM Overlay] | [Guided GradCAM High-Res]
    """
    try:
        original = plt.imread(img_path)

        # Prepare GradCAM overlay
        img_float = np.float32(original) / 255.0
        cam_overlay = show_cam_on_image(
            img_float, gradcam, use_rgb=True, image_weight=0.5
        )

        fig, axes = plt.subplots(1, 3, figsize=(15, 5))

        axes[0].imshow(original)
        axes[0].set_title("Original Face", fontsize=14)
        axes[0].axis("off")

        axes[1].imshow(cam_overlay)
        axes[1].set_title("Deepfake Confidence Map", fontsize=14)
        axes[1].axis("off")

        axes[2].imshow(guided_gradcam)
        axes[2].set_title("High-Res Artifact Map", fontsize=14)
        axes[2].axis("off")

        plt.tight_layout()
        plt.savefig(output_path, bbox_inches="tight", dpi=150)
        plt.close(fig)
        return True
    except Exception as e:  # noqa: BLE001
        print(f"Error generating evidence grid: {e}")
        return False
