from torch import nn
from torchvision.models import EfficientNet_B0_Weights, efficientnet_b0


class EfficientNetBaseline(nn.Module):
    """
    EfficientNet-B0 advanced model for Deepfake Detection.
    Provides better accuracy/parameter trade-off than ResNet.
    """

    def __init__(self, num_classes=2, dropout_rate=0.4, freeze_features=False):
        super().__init__()

        # Load pretrained EfficientNet-B0
        self.model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)

        if freeze_features:
            for param in self.model.parameters():
                param.requires_grad = False

        # EfficientNet classifier structure is different (Sequential)
        in_features = self.model.classifier[1].in_features

        self.model.classifier = nn.Sequential(
            nn.Dropout(p=dropout_rate, inplace=True),
            nn.Linear(in_features, num_classes),
        )

        self._initialize_weights()

    def _initialize_weights(self):
        """Initialize only the replaced classifier weights."""
        for m in self.model.classifier.modules():
            if isinstance(m, nn.Linear):
                nn.init.normal_(m.weight, 0, 0.01)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    def forward(self, x):
        return self.model(x)
