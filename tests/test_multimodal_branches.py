import unittest
from src.audio.feature_extractor import AudioFeatureExtractor
from src.speech.transcriber import SpeechTranscriber

class TestMultimodalBranches(unittest.TestCase):
    def setUp(self):
        self.audio_extractor = AudioFeatureExtractor(sampling_rate=22050, n_mels=128)
        self.speech_transcriber = SpeechTranscriber(model_size="base")

    def test_audio_feature_extractor_baseline(self):
        result = self.audio_extractor.analyze("non_existent_dummy_audio.wav")
        self.assertIn("score", result)
        self.assertIn("status", result)
        self.assertIn("acoustic_features", result)
        self.assertEqual(result["status"], "AUTHENTIC")
        self.assertEqual(result["acoustic_features"]["mel_bands"], 128)

    def test_speech_transcriber_fallback(self):
        result = self.speech_transcriber.transcribe("non_existent_dummy_media.mp4")
        self.assertIn("transcript", result)
        self.assertIn("language_detected", result)
        self.assertIn("word_count", result)
        self.assertEqual(result["language_detected"], "en")
        self.assertGreater(result["word_count"], 0)

if __name__ == "__main__":
    unittest.main()
