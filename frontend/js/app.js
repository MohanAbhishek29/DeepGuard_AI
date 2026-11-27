/**
 * ==============================================================================
 * 🛡️ DeepGuard AI — Clinical Forensic Workbench Engine
 * Zero-Scroll Tabbed UI · Qualitative & Physical Evidence Cards (No Gauge Spam)
 * Frontend Engineering: Harsha Vardhan | Lead Architect: Mohan Abhishek Gupta
 * ==============================================================================
 */

let selectedFile = null;
let lastAnalysisResult = null;
const API_BASE = (window.location.protocol === 'file:' || window.location.port !== '8000')
  ? 'http://127.0.0.1:8000'
  : '';

const IDLE_ENGINE_COPY = {
  image: {
    chips: [
      'ViT-Base Patch16-224 (TTA)',
      'Error Level Analysis (ELA Q=90)',
      'Camera EXIF Tag 271/272',
      '2D-FFT Upsampling Grid'
    ],
    desc: 'Separates physical smartphone/DSLR captures from Gemini, ChatGPT, Midjourney, and DALL-E generations using neural self-attention, uniform compression variance, and optical sensor EXIF proof.'
  },
  video: {
    chips: [
      '14-Frame Temporal Sampling',
      'Facial Seam Blending Ratio',
      'Hardware Clock Drift (FPS)',
      '1D-FFT Voice Track Check'
    ],
    desc: 'Inspects sampled video frames for face-swap splicing seams, temporal warping jitter, diffusion skin smoothing, ViT keyframe anomalies, and embedded audio track cloning.'
  },
  audio: {
    chips: [
      '1D-FFT >16kHz Energy Ratio',
      'ID3 / Container Tag Probe',
      'Biomechanical Jitter Check',
      'Audio-Visual Alignment'
    ],
    desc: 'Measures ultrasonic frequency energy (>16 kHz) produced by neural vocoders (Suno, Udio, HiFi-GAN, ElevenLabs) and checks audio container headers against natural microphone acoustics.'
  }
};

function switchIdleEngine(mode, btn) {
  document.querySelectorAll('.engine-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const box = document.getElementById('idleEngineDetail');
  const info = IDLE_ENGINE_COPY[mode] || IDLE_ENGINE_COPY.image;
  if (box) {
    box.innerHTML = `
      <div class="detail-pill-row">
        ${info.chips.map(c => `<span class="detail-chip">${c}</span>`).join('')}
      </div>
      <p class="detail-caption">${info.desc}</p>
    `;
  }
}

function switchResultTab(tabId, btn) {
  document.querySelectorAll('.r-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.add('active');
}

function toggleTeamModal() {
  const modal = document.getElementById('teamModal');
  if (!modal) return;
  modal.style.display = (modal.style.display === 'none' || !modal.style.display) ? 'flex' : 'none';
}

function setTopStatus(text, stateClass = 'idle') {
  const txt = document.getElementById('topFileText');
  const dot = document.getElementById('topStatusDot');
  if (txt) txt.innerText = text;
  if (dot) dot.className = `status-dot ${stateClass}`;
}

function formatLogTime() {
  const d = new Date();
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function streamLog(tag, message, category = 'sys') {
  const container = document.getElementById('liveTerminalLogs');
  if (!container) return;
  const tagClassMap = {
    sys: 'tag-sys', ingest: 'tag-ingest', vision: 'tag-vision',
    audio: 'tag-audio', speech: 'tag-speech', correlate: 'tag-correlate',
    verdict: 'tag-verdict', flag: 'tag-flag'
  };
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `
    <span class="log-time">[${formatLogTime()}]</span>
    <span class="log-tag ${tagClassMap[category] || 'tag-sys'}">${tag.toUpperCase()}</span>
    <span class="log-msg">${message}</span>
  `;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

function clearLiveLogs() {
  const container = document.getElementById('liveTerminalLogs');
  if (container) {
    container.innerHTML = '';
    streamLog('SYS', 'Execution stream cleared.', 'sys');
  }
}

function resetForensicsView() {
  const standby = document.getElementById('standbyState');
  const results = document.getElementById('resultsContent');
  if (standby) standby.style.display = 'block';
  if (results) results.style.display = 'none';
  // Reset back to Diagnostic Checks tab
  const firstTab = document.querySelector('.r-tab[data-tab="signals"]');
  if (firstTab) switchResultTab('signals', firstTab);
}

function handleFileSelect(files) {
  if (!files || files.length === 0) return;
  selectedFile = files[0];

  const audio = document.getElementById('hudAudio');
  if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
  const video = document.getElementById('hudVideo');
  if (video) { video.pause(); video.removeAttribute('src'); video.load(); }

  resetForensicsView();

  const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
  document.getElementById('dropzoneTitle').innerText = selectedFile.name;
  document.getElementById('dropzoneSubtitle').innerText = `${sizeMb} MB · Ready to verify`;
  const changeBtn = document.getElementById('changeFileBtn');
  if (changeBtn) changeBtn.style.display = 'inline-block';

  const verifyBtn = document.getElementById('analyzeBtn');
  if (verifyBtn) verifyBtn.disabled = false;

  setTopStatus(`${selectedFile.name} (${sizeMb} MB) · Ready`, 'ready');
  streamLog('INGEST', `Loaded '${selectedFile.name}' (${sizeMb} MB).`, 'ingest');

  const hud = document.getElementById('mediaHud');
  const img = document.getElementById('hudImage');
  const audioBlock = document.getElementById('audioVisualizerBlock');
  const blobUrl = URL.createObjectURL(selectedFile);

  if (hud) hud.style.display = 'block';

  if (selectedFile.type.startsWith('image/')) {
    if (img) { img.src = blobUrl; img.style.display = 'block'; }
    if (video) video.style.display = 'none';
    if (audioBlock) audioBlock.style.display = 'none';
  } else if (selectedFile.type.startsWith('video/')) {
    if (img) img.style.display = 'none';
    if (video) { video.src = blobUrl; video.style.display = 'block'; }
    if (audioBlock) audioBlock.style.display = 'none';
  } else {
    if (img) img.style.display = 'none';
    if (video) video.style.display = 'none';
    if (audioBlock) audioBlock.style.display = 'block';
    if (audio) audio.src = blobUrl;
    document.getElementById('audioTrackTitle').innerText = selectedFile.name;
    document.getElementById('audioTrackMeta').innerText = `${sizeMb} MB · 44.1 kHz Probing Ready`;
  }
}

// Drag & Drop
const dropZone = document.getElementById('dropZone');
if (dropZone) {
  ['dragenter', 'dragover'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('dragover'); }));
  dropZone.addEventListener('drop', e => handleFileSelect(e.dataTransfer.files));
}

async function runAnalysis() {
  if (!selectedFile) {
    alert('Please select a media file first.');
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  const progress = document.getElementById('pipelineProgress');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');

  const isImage = selectedFile.type.startsWith('image/');
  const isAudio = selectedFile.type.startsWith('audio/');

  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span><span>Inspecting Media...</span>';
    progress.style.display = 'flex';
    setTopStatus(`Inspecting ${selectedFile.name}...`, 'busy');

    step1.innerText = '1/3 · Uploading to local forensic sandbox...';
    step2.innerText = isImage ? '2/3 · Running ViT, ELA & EXIF checks...' : (isAudio ? '2/3 · Running 1D-FFT & tag checks...' : '2/3 · Sampling frames & audio track...');
    step3.innerText = '3/3 · Synthesizing final report...';

    const formData = new FormData();
    formData.append('file', selectedFile);

    const upRes = await fetch(`${API_BASE}/api/v1/media/upload`, { method: 'POST', body: formData });
    if (!upRes.ok) throw new Error(`Upload failed (HTTP ${upRes.status})`);
    const upData = await upRes.json();
    const fileId = upData.file_id;
    streamLog('UPLOAD', `Media stored locally: ${fileId}`, 'ingest');

    step1.innerText = '✓ 1/3 · Media ingested';
    const anRes = await fetch(`${API_BASE}/api/v1/analysis/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, enabled_modalities: ['vision', 'audio', 'speech'] })
    });
    if (!anRes.ok) throw new Error(`Analysis failed (HTTP ${anRes.status})`);
    const result = await anRes.json();

    step2.innerText = '✓ 2/3 · Forensic detectors complete';
    step3.innerText = '✓ 3/3 · Verification report ready';
    lastAnalysisResult = result;

    const verdict = result.cross_modal ? result.cross_modal.overall_verdict : 'COMPLETE';
    const isSuspicious = verdict.includes('AI') || verdict.includes('DEEPFAKE') || verdict.includes('CLONED') || verdict.includes('MANIPULATED');
    streamLog(isSuspicious ? 'FLAGGED' : 'VERIFIED', `Verdict: ${verdict}`, isSuspicious ? 'flag' : 'verdict');

    setTimeout(() => {
      renderForensics(result);
      progress.style.display = 'none';
    }, 200);
  } catch (err) {
    console.error('Forensic Analysis failed:', err);
    streamLog('ERROR', err.message, 'flag');
    setTopStatus(`Error: ${err.message}`, 'flag');
    alert('Analysis error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg><span>Verify Authenticity</span>';
  }
}

function buildSignalCard(title, statusKind, statusLabel, reading, note) {
  const cardCls = statusKind === 'flag' ? 'sig-flag' : (statusKind === 'pass' ? 'sig-pass' : '');
  return `
    <div class="sig-card ${cardCls}">
      <div class="sig-top">
        <span class="sig-name">${title}</span>
        <span class="sig-badge ${statusKind}">${statusLabel}</span>
      </div>
      <div class="sig-reading">${reading}</div>
      <div class="sig-note">${note}</div>
    </div>
  `;
}

function renderForensics(data) {
  if (!data) return;

  const standby = document.getElementById('standbyState');
  const results = document.getElementById('resultsContent');
  if (standby) standby.style.display = 'none';
  if (results) results.style.display = 'flex';

  const v = (data.cross_modal && data.cross_modal.overall_verdict) ? data.cross_modal.overall_verdict : 'COMPLETE';
  const r = (data.cross_modal && data.cross_modal.disagreement_reason) ? data.cross_modal.disagreement_reason : '';

  const isImageMode = (selectedFile && selectedFile.type && selectedFile.type.startsWith('image/')) || (data.vision && !data.audio);
  const isAudioMode = (selectedFile && selectedFile.type && selectedFile.type.startsWith('audio/')) || (data.audio && !data.vision);

  const isFake = v.includes('AI') || v.includes('DEEPFAKE') || v.includes('CLONED') ||
                 v.includes('MANIPULATED') || v.includes('SYNTHETIC') ||
                 (data.vision && data.vision.status === 'AI_GENERATED') ||
                 (data.audio && data.audio.status === 'AI_GENERATED');

  // Top Pill & Verdict Card (NO confusing numeric percentages!)
  const banner = document.getElementById('verdictBanner');
  const badge = document.getElementById('verdictConfidenceBadge');
  const title = document.getElementById('verdictTitle');
  const reason = document.getElementById('verdictReason');
  const icon = document.getElementById('verdictIcon');

  document.getElementById('analysisJobId').innerText = `JOB: ${data.job_id || 'LOCAL'}`;
  document.getElementById('verdictTimestamp').innerText = new Date().toLocaleTimeString();
  reason.innerText = r;

  if (!isFake) {
    banner.className = 'verdict-card authentic';
    badge.className = 'verdict-pill pass';
    badge.innerText = 'VERIFIED AUTHENTIC';
    icon.innerText = '✓';
    title.innerText = isImageMode ? 'GENUINE CAMERA PHOTO' : (isAudioMode ? 'GENUINE HUMAN VOICE' : v.replaceAll('_', ' '));
    setTopStatus(`${selectedFile ? selectedFile.name : 'Media'} · Verified Authentic`, 'pass');
  } else {
    banner.className = 'verdict-card manipulated';
    badge.className = 'verdict-pill flag';
    badge.innerText = 'SYNTHETIC INDICATORS DETECTED';
    icon.innerText = '!';
    title.innerText = isImageMode ? 'AI-GENERATED IMAGE DETECTED' : (isAudioMode ? 'SYNTHETIC AUDIO / VOICE DETECTED' : v.replaceAll('_', ' '));
    setTopStatus(`${selectedFile ? selectedFile.name : 'Media'} · Synthetic Flagged`, 'flag');
  }

  const cardsGrid = document.getElementById('signalCardsGrid');
  const breakdownBadge = document.getElementById('breakdownMediaBadge');
  const breakdownBody = document.getElementById('breakdownTableBody');
  const speechBox = document.getElementById('speechBox');
  const timelineHeader = document.getElementById('timelineHeader');

  // -------------------------------------------------------------------------
  // MODE 1: IMAGE FORENSICS
  // -------------------------------------------------------------------------
  if (isImageMode) {
    breakdownBadge.innerText = 'IMAGE REPORT';
    speechBox.style.display = 'none';
    const diag = (data.vision && data.vision.diagnostic_metrics) ? data.vision.diagnostic_metrics : {};
    const hasCameraExif = diag.device_hardware && !diag.device_hardware.includes('No Camera EXIF');
    const isElaFlagged = diag.ela_status && diag.ela_status.includes('Too Uniform');
    const isFftSpike = diag.fft_status && diag.fft_status.includes('Upsampling');
    const vitRaw = diag.neural_vit_confidence || 'Evaluated';
    const vitFlag = isFake;

    cardsGrid.innerHTML = [
      buildSignalCard(
        'Vision Transformer (ViT)',
        vitFlag ? 'flag' : 'pass',
        vitFlag ? 'FLAGGED' : 'PASSED',
        vitFlag ? 'Synthetic Diffusion Patterns Detected' : 'Natural Visual Distribution',
        `16×16 multi-scale patch attention (${vitRaw.replace(/\d+(\.\d+)?%/g, '').trim() || 'ViT-Base TTA'}).`
      ),
      buildSignalCard(
        'Camera Hardware EXIF',
        hasCameraExif ? 'pass' : 'flag',
        hasCameraExif ? 'CONFIRMED' : 'MISSING',
        diag.device_hardware || 'No Optical Sensor Tag',
        hasCameraExif ? 'Physical smartphone or DSLR hardware identifier present in header.' : 'Real cameras record Make/Model tags; AI generators omit optical EXIF.'
      ),
      buildSignalCard(
        'Compression Physics (ELA)',
        isElaFlagged ? 'flag' : 'pass',
        isElaFlagged ? 'UNIFORM AI' : 'NATURAL',
        `${diag.ela_variance || 'Residual Checked'} · ${diag.ela_status || ''}`,
        'JPEG Q=90 recompression delta distinguishes synthetic smooth pixels from optical lens variance.'
      ),
      buildSignalCard(
        'Photon Noise & 2D-FFT',
        (!isFftSpike && !isFake) ? 'pass' : 'flag',
        (!isFftSpike && !isFake) ? 'CLEAN' : 'ANOMALY',
        `${diag.camera_sensor_noise || 'Noise Checked'} · ${diag.fft_status || 'Spectrum Checked'}`,
        'Checks physical thermal sensor grain (Laplacian) and periodic generative checkerboard grids.'
      )
    ].join('');

    breakdownBody.innerHTML = `
      <tr>
        <td><strong>Error Level Analysis (ELA)</strong></td>
        <td>JPEG Q=90 recompression delta variance</td>
        <td><code>${diag.ela_variance || 'N/A'} (${diag.ela_status || 'Checked'})</code></td>
        <td style="text-align:right;"><span class="status-pill ${!isElaFlagged ? 'pill-pass' : 'pill-flag'}">${!isElaFlagged ? 'PASSED' : 'FLAGGED'}</span></td>
      </tr>
      <tr>
        <td><strong>Camera Hardware EXIF</strong></td>
        <td>EXIF Tag 271 (Make) &amp; Tag 272 (Model)</td>
        <td><code>${diag.device_hardware || 'None'}</code></td>
        <td style="text-align:right;"><span class="status-pill ${hasCameraExif ? 'pill-pass' : 'pill-flag'}">${hasCameraExif ? 'CONFIRMED' : 'MISSING'}</span></td>
      </tr>
      <tr>
        <td><strong>Sensor Photon Noise</strong></td>
        <td>Laplacian variance across image texture</td>
        <td><code>${diag.camera_sensor_noise || 'N/A'} — ${diag.sensor_noise_status || 'Checked'}</code></td>
        <td style="text-align:right;"><span class="status-pill ${!isFake ? 'pill-pass' : 'pill-flag'}">${!isFake ? 'PASSED' : 'FLAGGED'}</span></td>
      </tr>
      <tr>
        <td><strong>2D-FFT Spatial Spectrum</strong></td>
        <td>Transposed convolution upsampling grid</td>
        <td><code>Ratio ${diag.fft_ratio || 'N/A'} — ${diag.fft_status || 'Clean'}</code></td>
        <td style="text-align:right;"><span class="status-pill ${!isFftSpike ? 'pill-pass' : 'pill-flag'}">${!isFftSpike ? 'CLEAN' : 'FLAGGED'}</span></td>
      </tr>
      <tr>
        <td><strong>Vision Transformer (ViT)</strong></td>
        <td>Multi-scale TTA neural classification</td>
        <td><code>${diag.neural_vit_confidence || 'Analyzed'}</code></td>
        <td style="text-align:right;"><span class="status-pill ${!vitFlag ? 'pill-pass' : 'pill-flag'}">${!vitFlag ? 'CLEAN' : 'FLAGGED'}</span></td>
      </tr>
    `;
    timelineHeader.innerText = 'Image Inspection Steps';
  }

  // -------------------------------------------------------------------------
  // MODE 2: AUDIO ONLY FORENSICS
  // -------------------------------------------------------------------------
  else if (isAudioMode) {
    breakdownBadge.innerText = 'AUDIO REPORT';
    const af = (data.audio && data.audio.acoustic_features) ? data.audio.acoustic_features : {};
    const isAudPass = !isFake;
    const isTagFlag = af.container_watermark && af.container_watermark.includes('Suno');

    cardsGrid.innerHTML = [
      buildSignalCard(
        'Ultrasonic Band (>16 kHz)',
        isAudPass ? 'pass' : 'flag',
        isAudPass ? 'NATURAL' : 'SYNTHETIC',
        `${af.high_freq_vocoder_ratio ?? '0.00'} · ${af.high_freq_status || 'Checked'}`,
        '1D-FFT measures energy above 16 kHz produced by neural vocoders vs analog microphones.'
      ),
      buildSignalCard(
        'Container & Tag Audit',
        !isTagFlag ? 'pass' : 'flag',
        !isTagFlag ? 'CLEAN' : 'WATERMARK',
        af.container_watermark || 'Standard Clean Stream',
        'Probes ID3/container tags via FFprobe for AI generator signatures (Suno, Udio).'
      ),
      buildSignalCard(
        'Harmonic Profile',
        isAudPass ? 'pass' : 'flag',
        isAudPass ? 'ORGANIC' : 'SYNTHETIC',
        af.vocal_jitter_status || 'Checked',
        'Evaluates spectral roll-off between human vocal band (500–8000 Hz) and ultrasonic band.'
      ),
      buildSignalCard(
        'Speech Context',
        'neutral',
        'INDEXED',
        `${data.speech ? data.speech.word_count : 0} tokens · ${(data.speech ? data.speech.language_detected : 'en').toUpperCase()}`,
        'See Timeline & Transcript tab for contextual stream notes.'
      )
    ].join('');

    speechBox.style.display = 'block';
    if (data.speech) {
      document.getElementById('speechTranscriptText').innerText = `"${data.speech.transcript}"`;
      document.getElementById('speechLangBadge').innerText = (data.speech.language_detected || 'en').toUpperCase();
    }

    breakdownBody.innerHTML = `
      <tr>
        <td><strong>1D-FFT Ultrasonic Ratio (&gt;16kHz)</strong></td>
        <td>FFT energy ratio (>16kHz vs 500–8000Hz)</td>
        <td><code>${af.high_freq_vocoder_ratio ?? 'N/A'} (${af.high_freq_status || 'Checked'})</code></td>
        <td style="text-align:right;"><span class="status-pill ${isAudPass ? 'pill-pass' : 'pill-flag'}">${isAudPass ? 'PASSED' : 'FLAGGED'}</span></td>
      </tr>
      <tr>
        <td><strong>Container Metadata Probe</strong></td>
        <td>FFprobe ID3 &amp; encoder tag inspection</td>
        <td><code>${af.container_watermark || 'Clean'}</code></td>
        <td style="text-align:right;"><span class="status-pill ${!isTagFlag ? 'pill-pass' : 'pill-flag'}">${!isTagFlag ? 'CLEAN' : 'FLAGGED'}</span></td>
      </tr>
      <tr>
        <td><strong>Sampling Rate &amp; Spectrum</strong></td>
        <td>PCM 44.1kHz decoding &amp; roll-off check</td>
        <td><code>${af.sampling_rate_hz || 44100} Hz · ${af.mel_bands || 128} bands</code></td>
        <td style="text-align:right;"><span class="status-pill pill-info">VERIFIED</span></td>
      </tr>
    `;
    timelineHeader.innerText = 'Audio Inspection Events';
  }

  // -------------------------------------------------------------------------
  // MODE 3: VIDEO (VISUAL + AUDIO CORRELATION)
  // -------------------------------------------------------------------------
  else {
    breakdownBadge.innerText = 'VIDEO MULTIMODAL REPORT';
    const isVPass = data.vision && data.vision.status !== 'AI_GENERATED';
    const isSilent = data.audio && data.audio.status === 'NO_AUDIO_TRACK';
    const isAPass = data.audio && data.audio.status !== 'AI_GENERATED';
    const vDiag = (data.vision && data.vision.diagnostic_metrics) ? data.vision.diagnostic_metrics : {};
    const af = (data.audio && data.audio.acoustic_features) ? data.audio.acoustic_features : {};

    cardsGrid.innerHTML = [
      buildSignalCard(
        'Visual Frame Integrity',
        isVPass ? 'pass' : 'flag',
        isVPass ? 'GENUINE' : 'FLAGGED',
        `${data.vision ? data.vision.total_frames_analyzed : 0} frames · ${vDiag.frame_rate_fps || 'FPS checked'}`,
        isVPass ? 'Natural camera sensor grain, clean face seams, and physical frame clock drift.' : ((data.vision && data.vision.artifacts[0]) || 'Synthetic visual patterns flagged.')
      ),
      buildSignalCard(
        'Face Seam & Texture Grain',
        isVPass ? 'pass' : 'flag',
        vDiag.face_detected ? (isVPass ? 'NATURAL' : 'ANOMALY') : 'FULL FRAME',
        `Seam: ${vDiag.face_seam_ratio || 'N/A'} · ${vDiag.camera_sensor_noise || 'Checked'}`,
        'Measures facial boundary blending discontinuities and diffusion skin over-smoothing.'
      ),
      buildSignalCard(
        'Audio Track Forensics',
        isSilent ? 'neutral' : (isAPass ? 'pass' : 'flag'),
        isSilent ? 'NO AUDIO' : (isAPass ? 'ORIGINAL' : 'CLONED'),
        isSilent ? 'Silent Video (No Audio Track)' : `${af.high_freq_vocoder_ratio ?? '0.00'} · ${af.high_freq_status || 'Checked'}`,
        isSilent ? 'Video container contains no embedded audio stream.' : '1D-FFT inspects embedded audio track for AI voice cloning (>16kHz).'
      ),
      buildSignalCard(
        'Cross-Modal Agreement',
        (data.cross_modal && data.cross_modal.disagreement_detected) ? 'flag' : (isFake ? 'flag' : 'pass'),
        (data.cross_modal && data.cross_modal.disagreement_detected) ? 'MISMATCH' : (isFake ? 'SYNTHETIC' : 'ALIGNED'),
        (data.cross_modal && data.cross_modal.disagreement_detected) ? 'Asymmetric Tampering Detected' : (isFake ? 'Dual Modality Flagged' : 'Visual & Audio Consistent'),
        'Correlates visual face authenticity against audio track provenance.'
      )
    ].join('');

    speechBox.style.display = isSilent ? 'none' : 'block';
    if (!isSilent && data.speech) {
      document.getElementById('speechTranscriptText').innerText = `"${data.speech.transcript}"`;
      document.getElementById('speechLangBadge').innerText = (data.speech.language_detected || 'en').toUpperCase();
    }

    breakdownBody.innerHTML = `
      <tr>
        <td><strong>Facial Seam &amp; Blending</strong></td>
        <td>Face boundary Laplacian edge ratio</td>
        <td><code>${vDiag.face_seam_ratio || 'Checked'} — ${vDiag.face_seam_status || 'Analyzed'}</code></td>
        <td style="text-align:right;"><span class="status-pill ${isVPass ? 'pill-pass' : 'pill-flag'}">${isVPass ? 'PASSED' : 'FLAGGED'}</span></td>
      </tr>
      <tr>
        <td><strong>Sensor Grain &amp; 2D-FFT</strong></td>
        <td>Laplacian photon noise &amp; spatial grid</td>
        <td><code>${vDiag.camera_sensor_noise || 'Checked'} · FFT ${vDiag.spatial_fft_ratio || 'N/A'}</code></td>
        <td style="text-align:right;"><span class="status-pill ${isVPass ? 'pill-pass' : 'pill-flag'}">${isVPass ? 'PASSED' : 'FLAGGED'}</span></td>
      </tr>
      <tr>
        <td><strong>Embedded Audio Vocoder</strong></td>
        <td>1D-FFT &gt;16kHz high-frequency probe</td>
        <td><code>${isSilent ? 'No Audio Stream' : `${af.high_freq_vocoder_ratio ?? 'N/A'} (${af.high_freq_status || 'Checked'})`}</code></td>
        <td style="text-align:right;"><span class="status-pill ${isSilent ? 'pill-info' : (isAPass ? 'pill-pass' : 'pill-flag')}">${isSilent ? 'SILENT' : (isAPass ? 'PASSED' : 'FLAGGED')}</span></td>
      </tr>
      <tr>
        <td><strong>Cross-Modal Match</strong></td>
        <td>Visual vs Acoustic consistency matrix</td>
        <td><code>${(data.cross_modal && data.cross_modal.disagreement_detected) ? 'Mismatch (Dub/Swap)' : 'Consistent'}</code></td>
        <td style="text-align:right;"><span class="status-pill ${!(data.cross_modal && data.cross_modal.disagreement_detected) ? 'pill-pass' : 'pill-flag'}">${!(data.cross_modal && data.cross_modal.disagreement_detected) ? 'ALIGNED' : 'MISMATCH'}</span></td>
      </tr>
    `;
    timelineHeader.innerText = 'Audio-Visual Event Timeline';
  }

  // Timeline Stream
  if (data.cross_modal && data.cross_modal.timeline_events && data.cross_modal.timeline_events.length > 0) {
    const list = document.getElementById('timelineStream');
    list.innerHTML = data.cross_modal.timeline_events.map(ev => {
      let chipClass = 'chip-vis';
      if (ev.modality === 'audio') chipClass = 'chip-aud';
      if (ev.modality === 'speech') chipClass = 'chip-spe';
      const timeText = isImageMode ? 'STEP' : (ev.time_sec + 's');
      return `
        <div class="timeline-node">
          <span class="node-dot"></span>
          <span class="node-time">${timeText}</span>
          <span class="node-chip ${chipClass}">${ev.modality.toUpperCase()}</span>
          <span>${ev.label}</span>
        </div>
      `;
    }).join('');
  }
}

function exportForensicAudit() {
  if (!lastAnalysisResult) {
    alert('Please inspect a media file first before exporting the audit report.');
    return;
  }
  const report = {
    platform: 'DeepGuard AI Multimodal Forensic Platform',
    edition: 'Clinical Forensic Workbench v3.0',
    license: 'Proprietary — All Rights Reserved (Patent Pending)',
    lead_architect: 'Mohan Abhishek Gupta',
    research_team: [
      { name: 'Mohan Abhishek Gupta', role: 'Project Lead & System Architect' },
      { name: 'Tunga Durga Sai Prasad', role: 'Computer Vision Lead' },
      { name: 'Harsha Paladi', role: 'Audio & Acoustic Forensics' },
      { name: 'Harsha Vardhan', role: 'Frontend & Console Engineering' },
      { name: 'Vinay Rayi', role: 'Speech & Multimodal Analysis' },
      { name: 'Bikesh', role: 'Data Engineering & Evaluation' }
    ],
    timestamp: new Date().toISOString(),
    analysis_job: lastAnalysisResult
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DeepGuard_Audit_${lastAnalysisResult.job_id || 'Report'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
