from torch import nn
from torchvision.models import ResNet18_Weights, resnet18


class ResNetBaseline(nn.Module):
    """
    ResNet18 Baseline model for Deepfake Detection.
    Includes Dropout for regularization and proper weight initialization
    for the newly added fully connected layer.
    """

    def __init__(self, num_classes=2, dropout_rate=0.5, freeze_features=False):
        super().__init__()
        # Load pretrained weights
        self.model = resnet18(weights=ResNet18_Weights.DEFAULT)

        if freeze_features:
            for param in self.model.parameters():
                param.requires_grad = False

        # Get the number of features going into the FC layer
        in_features = self.model.fc.in_features

        # Replace the final layer with a custom classification head
        self.model.fc = nn.Sequential(
            nn.Dropout(p=dropout_rate),
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(p=dropout_rate),
            nn.Linear(256, num_classes),
        )

        self._initialize_weights()

    def _initialize_weights(self):
        """Initialize weights of the newly added layers."""
        for m in self.model.fc.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)

    def forward(self, x):
        return self.model(x)
