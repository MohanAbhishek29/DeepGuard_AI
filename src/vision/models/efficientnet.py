import torch
from torch import nn

try:
    from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
    HAS_TORCHVISION = True
except ImportError:
    HAS_TORCHVISION = False


class EfficientNetBaseline(nn.Module):
    """
    EfficientNet-B0 advanced model for Deepfake Detection.
    Provides better accuracy/parameter trade-off than ResNet.
    Includes pure PyTorch fallback when torchvision is not installed.
    """

    def __init__(self, num_classes=2, dropout_rate=0.4, freeze_features=False):
        super().__init__()

        if HAS_TORCHVISION:
            try:
                self.model = efficientnet_b0(weights=None)
            except Exception:
                self.model = efficientnet_b0()

            if freeze_features:
                for param in self.model.parameters():
                    param.requires_grad = False

            in_features = self.model.classifier[1].in_features
            self.model.classifier = nn.Sequential(
                nn.Dropout(p=dropout_rate, inplace=True),
                nn.Linear(in_features, num_classes),
            )
            self._initialize_weights()
        else:
            # Resilient PyTorch convolutional baseline without torchvision dependency
            self.model = nn.Sequential(
                nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1, bias=False),
                nn.BatchNorm2d(32),
                nn.SiLU(inplace=True),
                nn.AdaptiveAvgPool2d((1, 1)),
                nn.Flatten(),
                nn.Dropout(p=dropout_rate),
                nn.Linear(32, num_classes),
            )

    def _initialize_weights(self):
        """Initialize only the replaced classifier weights."""
        if hasattr(self.model, "classifier"):
            for m in self.model.classifier.modules():
                if isinstance(m, nn.Linear):
                    nn.init.normal_(m.weight, 0, 0.01)
                    if m.bias is not None:
                        nn.init.zeros_(m.bias)

    def forward(self, x):
        return self.model(x)
