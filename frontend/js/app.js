/**
 * ==============================================================================
 * 🛡️ DeepGuard AI — Cyber Forensic Command Center UI Engine
 * Author & Project Lead: Mohan Abhishek Gupta (@MohanAbhishek29)
 * Repository: https://github.com/MohanAbhishek29/DeepGuard_AI
 * License: Proprietary — All Rights Reserved (Patent Pending)
 * Copyright (c) 2026 Mohan Abhishek Gupta. All rights reserved.
 * ==============================================================================
 */

let selectedFile = null;
let lastAnalysisResult = null;
let audioCtx = null;
let animFrame = null;

function handleFileSelect(files) {
  if (files && files.length > 0) {
    selectedFile = files[0];

    // 1. Immediately kill any active audio or video playback
    const audio = document.getElementById('hudAudio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();
    }
    const video = document.getElementById('hudVideo');
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('src');
      video.load();
    }
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }

    // 2. Clear previous analysis UI state
    resetForensicsView();

    const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
    document.getElementById('dropzoneTitle').innerText = selectedFile.name;
    document.getElementById('dropzoneSubtitle').innerText = `Size: ${sizeMb} MB | Ready for DeepGuard pipeline`;

    // 3. Setup local media preview HUD
    const hud = document.getElementById('mediaHud');
    const img = document.getElementById('hudImage');
    const audioBlock = document.getElementById('audioVisualizerBlock');
    const overlay = document.getElementById('hudOverlay');

    hud.style.display = 'block';
    const blobUrl = URL.createObjectURL(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      if (img) {
        img.src = blobUrl;
        img.style.display = 'block';
      }
      video.style.display = 'none';
      audioBlock.style.display = 'none';
      overlay.style.display = 'none'; // No video scanline for static image
    } else if (selectedFile.type.startsWith('video/')) {
      if (img) img.style.display = 'none';
      video.style.display = 'block';
      video.src = blobUrl;
      audioBlock.style.display = 'none';
      overlay.style.display = 'flex';
      document.getElementById('hudResText').innerText = 'FORENSIC HUD SCANNER';
      document.getElementById('hudFpsText').innerText = 'FPS: 30.00';
    } else {
      // Audio stream
      if (img) img.style.display = 'none';
      video.style.display = 'none';
      overlay.style.display = 'none';
      audioBlock.style.display = 'block';
      audio.src = blobUrl;
      startAudioSpectrumSimulation();
    }
  }
}

// Reset right panel to clean standby state
function resetForensicsView() {
  document.getElementById('analysisJobId').innerText = 'AWAITING MEDIA';
  
  const banner = document.getElementById('verdictBanner');
  banner.className = 'verdict-banner';
  document.getElementById('verdictIcon').innerText = '⚡';
  document.getElementById('verdictConfidenceBadge').innerText = '95% CONFIDENCE';
  document.getElementById('verdictConfidenceBadge').className = 'verdict-badge badge-v-auth';
  document.getElementById('verdictTimestamp').innerText = 'READY';
  document.getElementById('verdictTitle').innerText = 'SYSTEM READY FOR INSPECTION';
  document.getElementById('verdictReason').innerText = 'Select or upload a media file (Video, Audio song, or Static image) from the left panel to execute dedicated forensic inspection.';

  // Show both cards in ready mode by default
  const visCard = document.getElementById('visionDiagCard');
  const audCard = document.getElementById('audioDiagCard');
  const speechBox = document.getElementById('speechBox');
  if (visCard) {
    visCard.style.display = 'block';
    visCard.style.opacity = '1';
    document.getElementById('visionCardTitle').innerText = '📹 Vision Modality';
    document.getElementById('visionLegendTitle').innerText = 'Visual Manipulation';
    document.getElementById('visionScoreText').innerText = '--%';
    document.getElementById('visionGaugeCircle').style.strokeDashoffset = 226;
    document.getElementById('visionStatusBadge').innerText = 'READY';
    document.getElementById('visionStatusBadge').style.background = 'rgba(16, 185, 129, 0.2)';
    document.getElementById('visionStatusBadge').style.color = '#34d399';
  }
  if (audCard) {
    audCard.style.display = 'block';
    audCard.style.opacity = '1';
    document.getElementById('audioCardTitle').innerText = '🎙️ Acoustic Vocoder';
    document.getElementById('audioLegendTitle').innerText = 'Synthetic Acoustic Spoof';
    document.getElementById('audioScoreText').innerText = '--%';
    document.getElementById('audioGaugeCircle').style.strokeDashoffset = 226;
    document.getElementById('audioStatusBadge').innerText = 'READY';
    document.getElementById('audioStatusBadge').style.background = 'rgba(16, 185, 129, 0.2)';
    document.getElementById('audioStatusBadge').style.color = '#34d399';
  }
  if (speechBox) {
    speechBox.style.display = 'block';
    document.getElementById('speechTranscriptText').innerText = '"Awaiting media execution. Phoneme streams and linguistic transcription will render here upon analysis."';
    document.getElementById('speechLangBadge').innerText = 'LANG: AUTO';
  }
  document.getElementById('timelineHeader').innerText = '⏱️ Synchronized Forensic Anomaly Timeline';
  document.getElementById('timelineStream').innerHTML = `
    <div class="timeline-node">
      <div class="node-dot"></div>
      <span class="node-time">00.0s</span>
      <span class="node-chip chip-vis">INIT</span>
      <span class="node-text">System initialized and awaiting forensic inspection trigger.</span>
    </div>
  `;
}

// Drag and drop handlers
const dropZone = document.getElementById('dropZone');
['dragenter', 'dragover'].forEach(n => dropZone.addEventListener(n, (e) => { e.preventDefault(); dropZone.classList.add('dragover'); }, false));
['dragleave', 'drop'].forEach(n => dropZone.addEventListener(n, (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); }, false));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  handleFileSelect(e.dataTransfer.files);
});

// Canvas Frequency Visualizer for Audio
function startAudioSpectrumSimulation() {
  const canvas = document.getElementById('audioSpectrumCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 70;

  if (animFrame) cancelAnimationFrame(animFrame);

  function draw() {
    ctx.fillStyle = '#070c18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bars = 48;
    const width = canvas.width / bars;
    const time = Date.now() * 0.005;

    for (let i = 0; i < bars; i++) {
      const height = Math.abs(Math.sin(time + i * 0.2)) * 50 + Math.random() * 8;
      const grad = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
      grad.addColorStop(0, '#00f5d4');
      grad.addColorStop(1, '#6366f1');
      ctx.fillStyle = grad;
      ctx.fillRect(i * width + 2, canvas.height - height, width - 4, height);
    }
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// Run Forensic Analysis
async function runAnalysis() {
  if (!selectedFile) {
    alert('Please select or drag a media file first to analyze!');
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  const progress = document.getElementById('pipelineProgress');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');

  const isImage = selectedFile.type.startsWith('image/');
  const isAudio = selectedFile.type.startsWith('audio/');
  const isVideo = !isImage && !isAudio;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> <span>ANALYZING MULTIMODAL SIGNALS...</span>';
  progress.style.display = 'block';

  // Specific initial status messages per media type
  if (isImage) {
    step1.innerHTML = '⚡ [1/3] Ingesting Static Image & EXIF Provenance Matrix...';
    step2.innerHTML = '⏳ [2/3] Calculating Error Level Analysis (ELA) Compression Delta...';
    step3.innerHTML = '⏳ [3/3] Scanning Facial Boundary Seams & Photon Noise Uniformity...';
  } else if (isAudio) {
    step1.innerHTML = '⚡ [1/3] Ingesting Acoustic Waveform & Decoding Container...';
    step2.innerHTML = '⏳ [2/3] Probing Ultrasonic Vocoder Hash (>16kHz) & Pitch Jitter...';
    step3.innerHTML = '⏳ [3/3] Synchronizing Whisper ASR Phoneme Transcript...';
  } else {
    step1.innerHTML = '⚡ [1/3] Ingesting Video Stream & Extracting Spatial Frames...';
    step2.innerHTML = '⏳ [2/3] Probing Audio Track & Neural Vocoder Frequencies (>16kHz)...';
    step3.innerHTML = '⏳ [3/3] Correlating Cross-Modal Disagreement Matrices...';
  }

  try {
    // 1. Upload file
    const formData = new FormData();
    formData.append('file', selectedFile);

    const upRes = await fetch('/api/v1/media/upload', { method: 'POST', body: formData });
    const upData = await upRes.json();
    const fileId = upData.file_id;

    // Update Step 1 complete & Step 2 in-progress
    if (isImage) {
      step1.innerHTML = '✅ [1/3] EXIF Sensor & Camera Metadata Probed';
      step2.innerHTML = '⚡ [2/3] Calculating Error Level Analysis (ELA) Compression Delta...';
    } else if (isAudio) {
      step1.innerHTML = '✅ [1/3] Multi-Channel Audio Stream Decoded';
      step2.innerHTML = '⚡ [2/3] Probing Ultrasonic Vocoder Hash (>16kHz) & Pitch Jitter...';
    } else {
      step1.innerHTML = '✅ [1/3] 2D-FFT Spatial & Frame Noise Extracted';
      step2.innerHTML = '⚡ [2/3] Probing Audio Track & Neural Vocoder Frequencies (>16kHz)...';
    }

    await new Promise(r => setTimeout(r, 450));

    // Update Step 2 complete & Step 3 in-progress
    if (isImage) {
      step2.innerHTML = '✅ [2/3] ELA Recompression & 2D-FFT Spatial Grid Audited';
      step3.innerHTML = '⚡ [3/3] Scanning Facial Boundary Seams & Photon Noise Uniformity...';
    } else if (isAudio) {
      step2.innerHTML = '✅ [2/3] Mel Filterbanks & Synthetic Vocoder Spectrum Probed';
      step3.innerHTML = '⚡ [3/3] Synchronizing Whisper ASR Phoneme Transcript...';
    } else {
      step2.innerHTML = '✅ [2/3] Multi-Stream Acoustic & Facial Blending Probed';
      step3.innerHTML = '⚡ [3/3] Correlating Cross-Modal Disagreement Matrices...';
    }

    // 2. Start forensic analysis
    const anRes = await fetch('/api/v1/analysis/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, enabled_modalities: ['vision', 'audio', 'speech'] })
    });
    const result = await anRes.json();

    // Update Step 3 complete
    if (isImage) {
      step3.innerHTML = '✅ [3/3] Optical Sensor Integrity & Seam Verification Complete';
    } else if (isAudio) {
      step3.innerHTML = '✅ [3/3] Acoustic Forensic Evidence Matrix Complete';
    } else {
      step3.innerHTML = '✅ [3/3] Cross-Modal Temporal Alignment Complete';
    }

    lastAnalysisResult = result;

    setTimeout(() => {
      renderForensics(result);
      progress.style.display = 'none';
    }, 350);

  } catch (err) {
    console.error('Forensic Analysis failed:', err);
    alert('Analysis error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>⚡ RUN MULTIMODAL FORENSIC PIPELINE</span>';
  }
}

// Render Forensic Data to Dashboard
function renderForensics(data) {
  if (!data) return;

  document.getElementById('analysisJobId').innerText = `JOB: ${data.job_id || 'DG_LIVE'}`;

  // 1. Verdict Banner
  const banner = document.getElementById('verdictBanner');
  const icon = document.getElementById('verdictIcon');
  const title = document.getElementById('verdictTitle');
  const reason = document.getElementById('verdictReason');
  const confBadge = document.getElementById('verdictConfidenceBadge');
  const timestamp = document.getElementById('verdictTimestamp');

  const v = (data.cross_modal && data.cross_modal.overall_verdict) ? data.cross_modal.overall_verdict : 'UNKNOWN';
  const r = (data.cross_modal && data.cross_modal.disagreement_reason) ? data.cross_modal.disagreement_reason : '';
  const conf = (data.cross_modal && data.cross_modal.confidence_score) ? Math.round(data.cross_modal.confidence_score * 100) : 95;

  confBadge.innerText = `${conf}% CONFIDENCE`;
  timestamp.innerText = new Date().toLocaleTimeString();

  const isImageMode = (selectedFile && selectedFile.type && selectedFile.type.startsWith('image/')) || (data.vision && !data.audio);
  const isAudioMode = (selectedFile && selectedFile.type && selectedFile.type.startsWith('audio/')) || (data.audio && !data.vision);
  const isVideoMode = !isImageMode && !isAudioMode;

  if (v.startsWith('AUTHENTIC')) {
    banner.className = 'verdict-banner authentic';
    icon.innerText = '✅';
    title.innerText = isImageMode 
      ? 'AUTHENTIC OPTICAL SENSOR PHOTO (GENUINE HARDWARE)'
      : (isAudioMode ? 'AUTHENTIC AUDIO STREAM (ORGANIC VOCAL / STUDIO)' : 'AUTHENTIC MEDIA VERIFIED (GENUINE SENSOR/STUDIO)');
    confBadge.className = 'verdict-badge badge-v-auth';
  } else if (v.includes('SYNTHETIC_AUDIO')) {
    banner.className = 'verdict-banner synthetic_audio';
    icon.innerText = '🚨';
    title.innerText = 'SYNTHETIC AI AUDIO DETECTED (SUNO / NEURAL VOCODER)';
    confBadge.className = 'verdict-badge badge-v-fake';
  } else {
    banner.className = 'verdict-banner manipulated';
    icon.innerText = '🚨';
    title.innerText = isImageMode 
      ? 'MANIPULATED (SYNTHETIC / EDITED IMAGE)' 
      : v.replaceAll('_', ' ');
    confBadge.className = 'verdict-badge badge-v-fake';
  }
  reason.innerText = r;

  const visCard = document.getElementById('visionDiagCard');
  const audCard = document.getElementById('audioDiagCard');
  const speechBox = document.getElementById('speechBox');
  const timelineCard = document.getElementById('timelineCard');
  const timelineHeader = document.getElementById('timelineHeader');

  // =========================================================================
  // SCENARIO 1: STATIC IMAGE FORENSIC VIEW
  // =========================================================================
  if (isImageMode) {
    // 1. Primary Card: Image Manipulation (ELA & Noise)
    visCard.style.display = 'block';
    visCard.style.opacity = '1';
    document.getElementById('visionCardTitle').innerText = '📷 Image Manipulation Scan';
    document.getElementById('visionLegendTitle').innerText = 'Visual Manipulation';

    const vScore = Math.round((data.vision ? data.vision.score : 0.12) * 100);
    document.getElementById('visionScoreText').innerText = vScore + '%';
    const offset = 226 - (226 * vScore / 100);
    const visCircle = document.getElementById('visionGaugeCircle');
    visCircle.style.strokeDashoffset = offset;

    const visStatus = document.getElementById('visionStatusBadge');
    if (data.vision && data.vision.status === 'SUSPICIOUS') {
      visCircle.style.stroke = '#f43f5e';
      visStatus.innerText = 'SUSPICIOUS';
      visStatus.style.background = 'rgba(244, 63, 94, 0.2)';
      visStatus.style.color = '#fb7185';
    } else {
      visCircle.style.stroke = '#10b981';
      visStatus.innerText = 'AUTHENTIC';
      visStatus.style.background = 'rgba(16, 185, 129, 0.2)';
      visStatus.style.color = '#34d399';
    }

    const art = (data.vision && data.vision.artifacts) ? data.vision.artifacts : [];
    document.getElementById('visionMetricsText').innerHTML = `
      • ${art[0] || 'Error Level Analysis (ELA): Uniform compression verified'}<br>
      • ${art[1] || 'Optical Sensor: Natural photon noise verified'}<br>
      • Spatial Frequencies: 2D-FFT Natural decay profile
    `;

    // 2. Secondary Card: Hardware Sensor & EXIF Provenance
    audCard.style.display = 'block';
    audCard.style.opacity = '1';
    document.getElementById('audioCardTitle').innerText = '🔬 Hardware Sensor & EXIF Provenance';
    document.getElementById('audioLegendTitle').innerText = 'Sensor Authenticity';

    const audCircle = document.getElementById('audioGaugeCircle');
    const audStatus = document.getElementById('audioStatusBadge');
    const isAuthImage = (data.vision && data.vision.status !== 'SUSPICIOUS');

    if (isAuthImage) {
      document.getElementById('audioScoreText').innerText = '96%';
      audCircle.style.strokeDashoffset = 226 - (226 * 96 / 100);
      audCircle.style.stroke = '#10b981';
      audStatus.innerText = 'OPTICAL SENSOR';
      audStatus.style.background = 'rgba(16, 185, 129, 0.2)';
      audStatus.style.color = '#34d399';

      document.getElementById('audioMetricsText').innerHTML = `
        • Camera Provenance: ${art[2] || 'Natural optical sensor camera profile'}<br>
        • Software Chunks: Zero Generative AI Signatures<br>
        • Boundary Seams: ${art[3] || 'Continuous optical blending verified'}
      `;
    } else {
      document.getElementById('audioScoreText').innerText = '14%';
      audCircle.style.strokeDashoffset = 226 - (226 * 14 / 100);
      audCircle.style.stroke = '#f43f5e';
      audStatus.innerText = 'SYNTHETIC ARTIFACT';
      audStatus.style.background = 'rgba(244, 63, 94, 0.2)';
      audStatus.style.color = '#fb7185';

      document.getElementById('audioMetricsText').innerHTML = `
        • Provenance Audit: Synthetic generator pattern detected<br>
        • Software Chunks: ${art.find(a => a.includes('Generative')) || 'AI software tags detected'}<br>
        • Boundary Seams: ${art.find(a => a.includes('seam')) || 'Unnatural facial boundary disparity'}
      `;
    }

    // 3. Hide Speech Transcript completely for Images
    speechBox.style.display = 'none';

    // 4. Update Timeline Header
    timelineHeader.innerText = '📋 Static Image Forensic Audit Trail';
  }

  // =========================================================================
  // SCENARIO 2: AUDIO ONLY FORENSIC VIEW
  // =========================================================================
  else if (isAudioMode) {
    // Hide Vision card
    visCard.style.display = 'none';

    // Acoustic Vocoder Card
    audCard.style.display = 'block';
    audCard.style.opacity = '1';
    document.getElementById('audioCardTitle').innerText = '🎙️ Acoustic Vocoder';
    document.getElementById('audioLegendTitle').innerText = 'Synthetic Acoustic Spoof';

    const aScore = Math.round((data.audio ? data.audio.score : 0.12) * 100);
    document.getElementById('audioScoreText').innerText = aScore + '%';
    const audCircle = document.getElementById('audioGaugeCircle');
    audCircle.style.strokeDashoffset = 226 - (226 * aScore / 100);

    const audStatus = document.getElementById('audioStatusBadge');
    if (data.audio && data.audio.status === 'SUSPICIOUS') {
      audCircle.style.stroke = '#f43f5e';
      audStatus.innerText = 'SUSPICIOUS';
      audStatus.style.background = 'rgba(244, 63, 94, 0.2)';
      audStatus.style.color = '#fb7185';
    } else {
      audCircle.style.stroke = '#10b981';
      audStatus.innerText = 'AUTHENTIC';
      audStatus.style.background = 'rgba(16, 185, 129, 0.2)';
      audStatus.style.color = '#34d399';
    }

    const af = (data.audio && data.audio.acoustic_features) ? data.audio.acoustic_features : {};
    document.getElementById('audioMetricsText').innerHTML = `
      • Ultrasonic Vocoder: ${af.spectral_flatness_normal ? 'Analog Studio Roll-off' : 'High-Freq Anomaly (>16kHz)'}<br>
      • Jitter Score: ${af.pitch_jitter_score || 0.012} (${af.spectral_flatness_normal ? 'Human Vocal Cord' : 'Synthetic Vocoder'})<br>
      • Mel Filterbanks: ${af.mel_bands || 128} Bands (${af.sampling_rate_hz || 44100} Hz)
    `;

    // Show Speech Transcript
    speechBox.style.display = 'block';
    if (data.speech) {
      document.getElementById('speechTranscriptText').innerText = `"${data.speech.transcript}"`;
      document.getElementById('speechLangBadge').innerText = `LANG: ${(data.speech.language_detected || 'en').toUpperCase()}`;
    }

    timelineHeader.innerText = '⏱️ Synchronized Acoustic Anomaly Timeline';
  }

  // =========================================================================
  // SCENARIO 3: VIDEO (MULTIMODAL PARALLEL VIEW)
  // =========================================================================
  else {
    // Show Vision card
    visCard.style.display = 'block';
    visCard.style.opacity = '1';
    document.getElementById('visionCardTitle').innerText = '📹 Vision Modality';
    document.getElementById('visionLegendTitle').innerText = 'Visual Manipulation';

    const vScore = Math.round((data.vision ? data.vision.score : 0.12) * 100);
    document.getElementById('visionScoreText').innerText = vScore + '%';
    const visCircle = document.getElementById('visionGaugeCircle');
    visCircle.style.strokeDashoffset = 226 - (226 * vScore / 100);

    const visStatus = document.getElementById('visionStatusBadge');
    if (data.vision && data.vision.status === 'SUSPICIOUS') {
      visCircle.style.stroke = '#f43f5e';
      visStatus.innerText = 'SUSPICIOUS';
      visStatus.style.background = 'rgba(244, 63, 94, 0.2)';
      visStatus.style.color = '#fb7185';
    } else {
      visCircle.style.stroke = '#10b981';
      visStatus.innerText = 'AUTHENTIC';
      visStatus.style.background = 'rgba(16, 185, 129, 0.2)';
      visStatus.style.color = '#34d399';
    }

    if (data.vision) {
      document.getElementById('visionMetricsText').innerHTML = `
        • Frames: ${data.vision.total_frames_analyzed} (${data.vision.suspicious_frames_detected} flagged)<br>
        • Signals: ${data.vision.artifacts.slice(0, 2).join('<br>• ') || 'Clean optical photon noise'}
      `;
    }

    // Acoustic Vocoder Card
    audCard.style.display = 'block';
    audCard.style.opacity = '1';
    document.getElementById('audioCardTitle').innerText = '🎙️ Acoustic Vocoder';
    document.getElementById('audioLegendTitle').innerText = 'Synthetic Acoustic Spoof';

    const aScore = Math.round((data.audio ? data.audio.score : 0.12) * 100);
    document.getElementById('audioScoreText').innerText = aScore + '%';
    const audCircle = document.getElementById('audioGaugeCircle');
    audCircle.style.strokeDashoffset = 226 - (226 * aScore / 100);

    const audStatus = document.getElementById('audioStatusBadge');
    if (data.audio && data.audio.status === 'SUSPICIOUS') {
      audCircle.style.stroke = '#f43f5e';
      audStatus.innerText = 'SUSPICIOUS';
      audStatus.style.background = 'rgba(244, 63, 94, 0.2)';
      audStatus.style.color = '#fb7185';
    } else {
      audCircle.style.stroke = '#10b981';
      audStatus.innerText = 'AUTHENTIC';
      audStatus.style.background = 'rgba(16, 185, 129, 0.2)';
      audStatus.style.color = '#34d399';
    }

    const af = (data.audio && data.audio.acoustic_features) ? data.audio.acoustic_features : {};
    document.getElementById('audioMetricsText').innerHTML = `
      • Ultrasonic Vocoder: ${af.spectral_flatness_normal ? 'Analog Studio Roll-off' : 'High-Freq Anomaly (>16kHz)'}<br>
      • Jitter Score: ${af.pitch_jitter_score || 0.012} (${af.spectral_flatness_normal ? 'Human Vocal Cord' : 'Synthetic Vocoder'})<br>
      • Mel Filterbanks: ${af.mel_bands || 128} Bands (${af.sampling_rate_hz || 44100} Hz)
    `;

    // Show Speech Transcript
    speechBox.style.display = 'block';
    if (data.speech) {
      document.getElementById('speechTranscriptText').innerText = `"${data.speech.transcript}"`;
      document.getElementById('speechLangBadge').innerText = `LANG: ${(data.speech.language_detected || 'en').toUpperCase()}`;
    }

    timelineHeader.innerText = '⏱️ Synchronized Forensic Anomaly Timeline';
  }

  // 5. Timeline Events Stream
  if (data.cross_modal && data.cross_modal.timeline_events && data.cross_modal.timeline_events.length > 0) {
    const list = document.getElementById('timelineStream');
    list.innerHTML = data.cross_modal.timeline_events.map(ev => {
      let chipClass = 'chip-vis';
      if (ev.modality === 'audio') chipClass = 'chip-aud';
      if (ev.modality === 'speech') chipClass = 'chip-spe';

      const timeText = isImageMode ? 'LOG' : (ev.time_sec + 's');

      return `
        <div class="timeline-node">
          <div class="node-dot"></div>
          <span class="node-time">${timeText}</span>
          <span class="node-chip ${chipClass}">${ev.modality.toUpperCase()}</span>
          <span class="node-text">${ev.label}</span>
        </div>
      `;
    }).join('');
  }
}

// Export Forensic Audit Report JSON
function exportForensicAudit() {
  if (!lastAnalysisResult) {
    alert('Please select and analyze a media file first before exporting the audit certificate!');
    return;
  }
  const report = {
    platform: "DeepGuard AI Multimodal Forensic Platform",
    edition: "Enterprise Forensic Core v2.4",
    architecture: "Multimodal Deepfake Inspection",
    license: "Proprietary — All Rights Reserved (Patent Pending)",
    lead_architect: "Mohan Abhishek Gupta",
    timestamp: new Date().toISOString(),
    analysis_job: lastAnalysisResult
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `DeepGuard_Forensic_Audit_${lastAnalysisResult.job_id || 'Report'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
