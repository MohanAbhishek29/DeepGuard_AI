import unittest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.storage import storage_manager

class TestCloudArchitecture(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["group_code"], "K3C0175")
        self.assertEqual(data["sih_mapping"], "SIH1683")

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["storage_ready"])

    def test_system_telemetry(self):
        response = self.client.get("/api/v1/system/telemetry")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("Mohan Abhishek Gupta", data["lead_architect"])
        self.assertIn("storage", data)
        self.assertIn("orchestration", data)
        self.assertIn(data["storage"]["storage_mode"], ["AWS S3", "Local Hybrid Storage"])
        # Disk metrics
        self.assertIn("disk_total_gb", data["storage"])
        self.assertIn("disk_free_gb", data["storage"])

    def test_media_upload_stream_report_and_delete(self):
        # 1. Video upload
        file_content = b"FAKE_MP4_HEADER_FORENSIC_SAMPLE_CONTENT"
        files = {"file": ("sample_test_video.mp4", file_content, "video/mp4")}
        
        upload_res = self.client.post("/api/v1/media/upload", files=files)
        self.assertEqual(upload_res.status_code, 201)
        upload_data = upload_res.json()
        
        file_id = upload_data["file_id"]
        self.assertEqual(upload_data["media_type"], "video")
        self.assertIn("stream_url", upload_data)

        # 2. Media stream endpoint
        stream_res = self.client.get(f"/api/v1/media/{file_id}/stream")
        self.assertEqual(stream_res.status_code, 200)
        self.assertEqual(stream_res.content, file_content)

        # 3. Presigned / stream URL info
        url_res = self.client.get(f"/api/v1/media/{file_id}/url")
        self.assertEqual(url_res.status_code, 200)
        self.assertIn("stream_url", url_res.json())

        # 4. Multimodal analysis execution
        analysis_res = self.client.post(
            "/api/v1/analysis/start",
            json={"file_id": file_id}
        )
        self.assertEqual(analysis_res.status_code, 202)
        analysis_data = analysis_res.json()
        job_id = analysis_data["job_id"]
        self.assertEqual(analysis_data["status"], "COMPLETED")
        self.assertIsNotNone(analysis_data["vision"])
        self.assertIsNotNone(analysis_data["audio"])
        self.assertIsNotNone(analysis_data["cross_modal"])

        # 5. Forensic Audit Report generation
        report_res = self.client.get(f"/api/v1/analysis/jobs/{job_id}/report")
        self.assertEqual(report_res.status_code, 200)
        report_data = report_res.json()
        self.assertTrue(report_data["report_id"].startswith("CERT-"))
        self.assertEqual(report_data["job_id"], job_id)
        self.assertEqual(report_data["file_id"], file_id)
        self.assertEqual(len(report_data["file_sha256"]), 64)  # Valid SHA-256 length
        self.assertEqual(report_data["chain_of_custody_status"], "VERIFIED_TAMPER_EVIDENT")
        self.assertIn("Mohan Abhishek Gupta", report_data["lead_architect"])

        # 6. List jobs
        jobs_res = self.client.get("/api/v1/analysis/jobs")
        self.assertEqual(jobs_res.status_code, 200)
        self.assertGreaterEqual(len(jobs_res.json()), 1)

        # 7. Media deletion (Lifecycle cleanup)
        del_res = self.client.delete(f"/api/v1/media/{file_id}")
        self.assertEqual(del_res.status_code, 200)
        self.assertTrue(del_res.json()["deleted"])
        self.assertFalse(storage_manager.file_exists(file_id))

    def test_audio_only_pipeline_dispatch(self):
        audio_content = b"FAKE_WAV_AUDIO_CONTENT"
        files = {"file": ("test_interview.wav", audio_content, "audio/wav")}
        
        upload_res = self.client.post("/api/v1/media/upload", files=files)
        self.assertEqual(upload_res.status_code, 201)
        file_id = upload_res.json()["file_id"]
        self.assertEqual(upload_res.json()["media_type"], "audio")

        analysis_res = self.client.post(
            "/api/v1/analysis/start",
            json={"file_id": file_id}
        )
        self.assertEqual(analysis_res.status_code, 202)
        data = analysis_res.json()
        self.assertIsNone(data["vision"])  # Vision correctly bypassed for audio
        self.assertIsNotNone(data["audio"])
        self.assertIsNotNone(data["speech"])

        # Cleanup
        self.client.delete(f"/api/v1/media/{file_id}")

if __name__ == "__main__":
    unittest.main()
