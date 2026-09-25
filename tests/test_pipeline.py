from src.vision.pipeline import VisionPipeline


def test_pipeline_init():
    pipeline = VisionPipeline()
    assert pipeline is not None
