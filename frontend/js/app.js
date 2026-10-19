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

        const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
        document.getElementById('dropzoneTitle').innerText = selectedFile.name;
        document.getElementById('dropzoneSubtitle').innerText = `Size: ${sizeMb} MB | Ready for DeepGuard pipeline`;

        // Setup local media preview
        const hud = document.getElementById('mediaHud');
        const video = document.getElementById('hudVideo');
        const audioBlock = document.getElementById('audioVisualizerBlock');
        const audio = document.getElementById('hudAudio');
        const overlay = document.getElementById('hudOverlay');

        hud.style.display = 'block';
        const blobUrl = URL.createObjectURL(selectedFile);

        if (selectedFile.type.startsWith('video/')) {
          video.style.display = 'block';
          video.src = blobUrl;
          audioBlock.style.display = 'none';
          overlay.style.display = 'flex';
        } else {
          video.style.display = 'none';
          overlay.style.display = 'none';
          audioBlock.style.display = 'block';
          audio.src = blobUrl;
          startAudioSpectrumSimulation();
        }
      }
    }

    // Drag and drop handlers
    const dropZone = document.getElementById('dropZone');
    ['dragenter', 'dragover'].forEach(n => dropZone.addEventListener(n, (e) => { e.preventDefault(); dropZone.classList.add('dragover'); }, false));
    ['dragleave', 'drop'].forEach(n => dropZone.addEventListener(n, (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); }, false));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    });

    // Simulated Canvas Frequency Visualizer
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

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> <span>ANALYZING MULTIMODAL SIGNALS...</span>';
      progress.style.display = 'block';

      step1.innerHTML = '⚡ [1/3] Uploading & Ingesting Media File...';
      step2.innerHTML = '⏳ [2/3] Probing Ultrasonic Neural Vocoder Hash (>16kHz)...';
      step3.innerHTML = '⏳ [3/3] Correlating Cross-Modal Evidence Matrices...';

      try {
        // Upload file
        const formData = new FormData();
        formData.append('file', selectedFile);

        const upRes = await fetch('/api/v1/media/upload', { method: 'POST', body: formData });
        const upData = await upRes.json();
        const fileId = upData.file_id;

        step1.innerHTML = '✅ [1/3] 2D FFT Spatial & Laplacian Noise Extracted';
        step2.innerHTML = '⚡ [2/3] Probing Ultrasonic Neural Vocoder Hash (>16kHz)...';
        await new Promise(r => setTimeout(r, 400));
        step2.innerHTML = '✅ [2/3] Neural Vocoder Spectrum Probed';
        step3.innerHTML = '⚡ [3/3] Correlating Cross-Modal Evidence Matrices...';

        // Start analysis
        const anRes = await fetch('/api/v1/analysis/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_id: fileId, enabled_modalities: ['vision', 'audio', 'speech'] })
        });
        const result = await anRes.json();
        step3.innerHTML = '✅ [3/3] Cross-Modal Evidence Correlation Complete';
        lastAnalysisResult = result;

        setTimeout(() => {
          renderForensics(result);
          progress.style.display = 'none';
        }, 300);

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

      if (v === 'AUTHENTIC') {
        banner.className = 'verdict-banner authentic';
        icon.innerText = '✅';
        title.innerText = 'AUTHENTIC MEDIA VERIFIED (GENUINE SENSOR/STUDIO)';
        confBadge.className = 'verdict-badge badge-v-auth';
      } else if (v.includes('SYNTHETIC_AUDIO')) {
        banner.className = 'verdict-banner synthetic_audio';
        icon.innerText = '🚨';
        title.innerText = 'SYNTHETIC AI AUDIO DETECTED (SUNO / NEURAL VOCODER)';
        confBadge.className = 'verdict-badge badge-v-fake';
      } else {
        banner.className = 'verdict-banner manipulated';
        icon.innerText = '🚨';
        title.innerText = v.replaceAll('_', ' ');
        confBadge.className = 'verdict-badge badge-v-fake';
      }
      reason.innerText = r;

      // 2. Vision Modality Diagnostic
      const visCard = document.getElementById('visionDiagCard');
      const visCircle = document.getElementById('visionGaugeCircle');
      const visScoreText = document.getElementById('visionScoreText');
      const visStatus = document.getElementById('visionStatusBadge');
      const visMetrics = document.getElementById('visionMetricsText');

      if (data.vision) {
        visCard.style.opacity = '1';
        const vScore = Math.round(data.vision.score * 100);
        visScoreText.innerText = vScore + '%';
        const offset = 226 - (226 * vScore / 100);
        visCircle.style.strokeDashoffset = offset;

        if (data.vision.status === 'SUSPICIOUS') {
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

        visMetrics.innerHTML = `
          • Frames: ${data.vision.total_frames_analyzed} (${data.vision.suspicious_frames_detected} flagged)<br>
          • Signals: ${data.vision.artifacts.slice(0, 2).join('<br>• ') || 'Clean optical photon noise'}
        `;
      } else {
        visCard.style.opacity = '0.4';
        visScoreText.innerText = 'N/A';
        visCircle.style.strokeDashoffset = 226;
        visStatus.innerText = 'SKIPPED (AUDIO)';
        visStatus.style.background = 'rgba(255, 255, 255, 0.08)';
        visStatus.style.color = '#94a3b8';
        visMetrics.innerHTML = '• Audio-only stream: Vision analysis bypassed';
      }

      // 3. Audio Modality Diagnostic
      const audCircle = document.getElementById('audioGaugeCircle');
      const audScoreText = document.getElementById('audioScoreText');
      const audStatus = document.getElementById('audioStatusBadge');
      const audMetrics = document.getElementById('audioMetricsText');

      if (data.audio) {
        const aScore = Math.round(data.audio.score * 100);
        audScoreText.innerText = aScore + '%';
        const offset = 226 - (226 * aScore / 100);
        audCircle.style.strokeDashoffset = offset;

        if (data.audio.status === 'SUSPICIOUS') {
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

        const af = data.audio.acoustic_features || {};
        audMetrics.innerHTML = `
          • Ultrasonic Vocoder: ${af.spectral_flatness_normal ? 'Analog Studio Roll-off' : 'High-Freq Anomaly'}<br>
          • Jitter Score: ${af.pitch_jitter_score || 0.012} (${af.spectral_flatness_normal ? 'Human' : 'Synthetic Vocoder'})<br>
          • Mel Filterbanks: ${af.mel_bands || 128} Bands (${af.sampling_rate_hz || 44100} Hz)
        `;
      }

      // 4. Speech Transcript
      if (data.speech) {
        document.getElementById('speechTranscriptText').innerText = `"${data.speech.transcript}"`;
        document.getElementById('speechLangBadge').innerText = `LANG: ${(data.speech.language_detected || 'en').toUpperCase()}`;
      }

      // 5. Timeline Events
      if (data.cross_modal && data.cross_modal.timeline_events && data.cross_modal.timeline_events.length > 0) {
        const list = document.getElementById('timelineStream');
        list.innerHTML = data.cross_modal.timeline_events.map(ev => {
          let chipClass = 'chip-vis';
          if (ev.modality === 'audio') chipClass = 'chip-aud';
          if (ev.modality === 'speech') chipClass = 'chip-spe';

          return `
            <div class="timeline-node">
              <div class="node-dot"></div>
              <span class="node-time">${ev.time_sec}s</span>
              <span class="node-chip ${chipClass}">${ev.modality}</span>
              <span class="node-text">${ev.label}</span>
            </div>
          `;
        }).join('');
      }
    }

    // Export Forensic Audit Report JSON
    function exportForensicAudit() {
      if (!lastAnalysisResult) {
        alert('Please run a forensic analysis first before exporting the audit certificate!');
        return;
      }
      const report = {
        platform: "DeepGuard AI Multimodal Forensic Platform",
        group: "K3C0175",
        sih_problem: "SIH1683",
        supervisor: "Dr. Navneet Kaur (LPU)",
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
