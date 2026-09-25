from dataclasses import dataclass


@dataclass
class VisionConfig:
    batch_size: int = 32
    image_size: int = 224
    num_workers: int = 4
    learning_rate: float = 1e-4
    epochs: int = 20
