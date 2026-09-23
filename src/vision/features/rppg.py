import logging

import numpy as np

logger = logging.getLogger(__name__)


class rPPGExtractor:
    """
    Remote Photoplethysmography (rPPG) extraction.
    Estimates a synthetic pulse signal from facial color variations.
    Real videos exhibit micro-color changes due to blood flow.
    """

    def __init__(self, fps: float):
        self.fps = fps
        self.signal_buffer = []

    def extract_green_channel_mean(self, face_roi: np.ndarray) -> float:
        """
        Extracts the average intensity of the green channel, which absorbs
        hemoglobin the most and provides the strongest pulse signal.
        """
        if face_roi is None or face_roi.size == 0:
            return 0.0

        # Assuming input is RGB. Index 1 is Green.
        green_channel = face_roi[:, :, 1]

        # Simple spatial averaging
        return float(np.mean(green_channel))

    def process_frame(self, face_roi: np.ndarray):
        """Processes a single frame and appends to the temporal buffer."""
        val = self.extract_green_channel_mean(face_roi)
        self.signal_buffer.append(val)

    def analyze_signal(self) -> dict:
        """
        Analyzes the temporal buffer to determine if a realistic biological pulse exists.
        Returns a dictionary with heart rate and a liveness confidence score.
        """
        if len(self.signal_buffer) < int(
            self.fps * 3
        ):  # Need at least 3 seconds of data
            return {"status": "insufficient_data", "liveness_score": 0.0}

        # Detrending (removing moving average)
        signal = np.array(self.signal_buffer)
        window = int(self.fps)
        moving_avg = np.convolve(signal, np.ones(window) / window, mode="valid")

        # Align lengths
        detrended = signal[window - 1 :] - moving_avg

        # Hamming window & FFT
        detrended = detrended * np.hamming(len(detrended))
        fft = np.abs(np.fft.rfft(detrended))
        freqs = np.fft.rfftfreq(len(detrended), 1.0 / self.fps)

        # Human heart rate is typically between 0.7 Hz (42 BPM) and 3.0 Hz (180 BPM)
        valid_idx = np.where((freqs >= 0.7) & (freqs <= 3.0))[0]

        if len(valid_idx) == 0:
            return {"status": "no_pulse_detected", "liveness_score": 0.1, "bpm": 0}

        # Find peak frequency in human range
        valid_fft = fft[valid_idx]
        valid_freqs = freqs[valid_idx]

        peak_idx = np.argmax(valid_fft)
        peak_freq = valid_freqs[peak_idx]
        bpm = peak_freq * 60.0

        # Calculate Signal-to-Noise Ratio (SNR) as a liveness score
        signal_power = valid_fft[peak_idx] ** 2
        noise_power = np.sum(valid_fft**2) - signal_power
        snr = signal_power / (noise_power + 1e-5)

        # Map SNR to a 0-1 liveness score
        liveness = min(1.0, snr / 10.0)

        return {
            "status": "success",
            "bpm": round(bpm, 1),
            "liveness_score": round(liveness, 4),
        }
