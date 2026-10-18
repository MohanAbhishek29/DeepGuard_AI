"""
DeepGuard AI - Quantitative Evaluation Test Suite (Phase 8)
Group Code: K3C0175 | SIH1683
Architect: Mohan Abhishek Gupta (Cloud & System Architecture)
"""

import unittest
from evaluation.benchmark_runner import BenchmarkRunner
from fastapi.testclient import TestClient
from backend.app.main import app

class TestEvaluationSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.runner = BenchmarkRunner()
        cls.client = TestClient(app)

    def test_benchmark_metrics_computation(self):
        metrics = self.runner.compute_overall_metrics()
        self.assertIn("per_modality_benchmarks", metrics)
        self.assertIn("cross_modal_regimes", metrics)
        self.assertIn("macro_comparison", metrics)

        # Check visual benchmark bounds
        vis = metrics["per_modality_benchmarks"]["visual_ff_plus_plus"]
        self.assertGreaterEqual(vis["accuracy"], 0.90)
        self.assertGreaterEqual(vis["auc"], 0.95)

        # Check multimodal accuracy superiority
        macro = metrics["macro_comparison"]
        self.assertGreater(macro["deepguard_multimodal_macro_accuracy"], macro["visual_only_macro_accuracy"])
        self.assertGreater(macro["deepguard_multimodal_macro_accuracy"], macro["audio_only_macro_accuracy"])
        self.assertGreater(macro["multimodal_gain_percentage"], 20.0)

    def test_benchmark_api_endpoint(self):
        response = self.client.get("/api/v1/system/benchmarks")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("macro_comparison", data)
        self.assertIn("deepguard_multimodal_macro_accuracy", data["macro_comparison"])

if __name__ == "__main__":
    unittest.main()
