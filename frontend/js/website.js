/**
 * ==============================================================================
 * 🛡️ DeepGuard AI — Official Product Showcase Interactive Engine
 * Author & Project Lead: Mohan Abhishek Gupta (@MohanAbhishek29)
 * Repository: https://github.com/MohanAbhishek29/DeepGuard_AI
 * License: Proprietary — All Rights Reserved (Patent Pending)
 * Copyright (c) 2026 Mohan Abhishek Gupta. All rights reserved.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initMorphTabs();
  initComparisonSlider();
  initTerminalCopy();
  initHeroTilt();
  initAudioSim();
  initElaToggle();
  initRegimeSelector();
});

/* ==========================================================================
   1. INTERACTIVE MORPHING & SLIDING TABS
   ========================================================================== */
function initMorphTabs() {
  const tabButtons = document.querySelectorAll('.morph-tab-btn');
  const tabCards = document.querySelectorAll('.morph-card');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      // Update button active states
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update card states with slide-in animation
      tabCards.forEach(card => {
        if (card.id === targetId) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    });
  });
}

/* ==========================================================================
   2. INTERACTIVE BEFORE/AFTER FACE COMPARISON SLIDER
   ========================================================================== */
function initComparisonSlider() {
  const container = document.getElementById('faceSliderContainer');
  const divider = document.getElementById('sliderDivider');
  const synthLayer = document.getElementById('sliderSynthLayer');

  if (!container || !divider || !synthLayer) return;

  let isDragging = false;

  function updateSlider(clientX) {
    const rect = container.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    if (offsetX < 20) offsetX = 20;
    if (offsetX > rect.width - 20) offsetX = rect.width - 20;

    const percentage = (offsetX / rect.width) * 100;
    divider.style.left = `${percentage}%`;
    synthLayer.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
  }

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSlider(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  // Mobile Touch Support
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateSlider(e.touches[0].clientX);
  });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updateSlider(e.touches[0].clientX);
  });
}

/* ==========================================================================
   3. DEVELOPER QUICKSTART TERMINAL COPY
   ========================================================================== */
function initTerminalCopy() {
  const copyBtn = document.getElementById('terminalCopyBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const textToCopy = `git clone https://github.com/MohanAbhishek29/DeepGuard_AI.git
cd DeepGuard_AI
./run_server.bat`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      copyBtn.innerText = '✓ Copied!';
      copyBtn.style.color = '#00f5d4';
      copyBtn.style.borderColor = '#00f5d4';

      setTimeout(() => {
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.style.color = '';
        copyBtn.style.borderColor = '';
      }, 2500);
    });
  });
}

/* ==========================================================================
   4. 3D PERSPECTIVE TILT ON HERO VISUAL
   ========================================================================== */
function initHeroTilt() {
  const frame = document.getElementById('heroVisualFrame');
  if (!frame) return;

  frame.addEventListener('mousemove', (e) => {
    const rect = frame.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = -(y / rect.height) * 12;
    const rotY = (x / rect.width) * 12;

    frame.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01, 1.01, 1.01)`;
  });

  frame.addEventListener('mouseleave', () => {
    frame.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/* ==========================================================================
   5. INTERACTIVE AUDIO VOCODER SPECTRUM SIMULATOR
   ========================================================================== */
function initAudioSim() {
  const btnHuman = document.getElementById('btnAudioHuman');
  const btnAi = document.getElementById('btnAudioAi');
  const graphBars = document.querySelectorAll('.audio-sim-bar');
  const specText = document.getElementById('audioSimSpecs');
  const badge = document.getElementById('audioSimBadge');

  if (!btnHuman || !btnAi) return;

  btnHuman.addEventListener('click', () => {
    btnHuman.classList.add('active');
    btnAi.classList.remove('active');

    badge.className = 'feature-tag';
    badge.style.background = 'rgba(16, 185, 129, 0.2)';
    badge.style.color = '#34d399';
    badge.innerText = 'NATURAL HUMAN VOCAL CORDS';

    specText.innerHTML = `
      • Natural Acoustic Roll-off: Smooth decline past 12 kHz.<br>
      • Human Pitch Jitter: 0.0128 (Micro-vocal cord fluctuation).<br>
      • Ultrasonic Noise (&gt;16kHz): Natural room ambiance (-78 dB).
    `;

    // Simulate natural frequency curve (high in lows/mids, smooth drop in high frequencies)
    graphBars.forEach((bar, index) => {
      const height = Math.max(10, 85 - index * 6 + (Math.random() * 8));
      bar.style.height = `${height}%`;
      bar.style.background = 'linear-gradient(to top, #10b981, #38bdf8)';
    });
  });

  btnAi.addEventListener('click', () => {
    btnAi.classList.add('active');
    btnHuman.classList.remove('active');

    badge.className = 'feature-tag';
    badge.style.background = 'rgba(244, 63, 94, 0.2)';
    badge.style.color = '#fb7185';
    badge.innerText = 'AI NEURAL VOCODER (CLONED VOICE)';

    specText.innerHTML = `
      • Unnatural Ultrasonic Spike: High energy burst (&gt;16kHz).<br>
      • Robotic Pitch Jitter: 0.0009 (Unnaturally steady synthetic cords).<br>
      • Quantization Artifacts: ElevenLabs / Suno AI vocoder signature detected.
    `;

    // Simulate AI vocoder curve (artificial high frequency energy plateau)
    graphBars.forEach((bar, index) => {
      let height = 40 + Math.random() * 30;
      if (index >= 9) {
        // High frequency spike (>16kHz)
        height = 75 + Math.random() * 20;
        bar.style.background = 'linear-gradient(to top, #f43f5e, #a855f7)';
      } else {
        bar.style.background = 'linear-gradient(to top, #a855f7, #38bdf8)';
      }
      bar.style.height = `${height}%`;
    });
  });
}

/* ==========================================================================
   6. INTERACTIVE ELA (ERROR LEVEL ANALYSIS) IMAGE SPLICING TOGGLE
   ========================================================================== */
function initElaToggle() {
  const toggleBtn = document.getElementById('elaToggleBtn');
  const elaOverlay = document.getElementById('elaHeatmapOverlay');
  const elaStatus = document.getElementById('elaStatusText');

  if (!toggleBtn || !elaOverlay) return;

  let showingEla = false;

  toggleBtn.addEventListener('click', () => {
    showingEla = !showingEla;
    if (showingEla) {
      elaOverlay.style.opacity = '0.9';
      toggleBtn.innerText = '📸 View Normal Optical Image';
      elaStatus.innerHTML = '<span style="color: #f43f5e; font-weight: 700;">⚠️ ELA HEATMAP ACTIVE:</span> White glowing squares expose mismatched compression levels (Pasted face/text spliced from foreign file).';
    } else {
      elaOverlay.style.opacity = '0';
      toggleBtn.innerText = '🔬 Reveal ELA Compression Heatmap';
      elaStatus.innerHTML = '<span style="color: #38bdf8; font-weight: 700;">NORMAL VIEW:</span> Shows original image before microscopic error level analysis.';
    }
  });
}

/* ==========================================================================
   7. INTERACTIVE 4-REGIME CORRELATION SELECTOR
   ========================================================================== */
function initRegimeSelector() {
  const cards = document.querySelectorAll('.regime-interactive-card');
  const readout = document.getElementById('regimeExplanationText');

  if (!cards.length || !readout) return;

  const regimeData = {
    '1': {
      title: 'Regime I: Visual Deepfake (Manipulated Video + Real Audio)',
      desc: 'The attacker spliced an AI face onto real interview footage. The video has 2D-FFT frequency distortion and boundary edge seams, while the audio is natural human speech. DeepGuard isolates the face tampering without false-flagging the audio.',
      color: '#fb7185'
    },
    '2': {
      title: 'Regime II: Cloned Voice Dub (Real Video + Cloned Audio)',
      desc: 'Authentic camera footage was dubbed with an AI-synthesized voice (CEO fraud / fake leaked audio). Camera noise is genuine, but acoustic frequency probing finds neural vocoder spikes above 16kHz and robotic pitch stability. DeepGuard exposes the cloned audio.',
      color: '#c084fc'
    },
    '3': {
      title: 'Regime III: Fully Synthetic (AI Avatar + Cloned Voice)',
      desc: 'Both modalities are computer-generated (e.g. Midjourney portrait animated by Sora with Suno/ElevenLabs audio). Both optical and acoustic pipelines trigger red alerts simultaneously, returning a definitive 99.8% synthetic verdict.',
      color: '#fbbf24'
    },
    '4': {
      title: 'Regime IV: Verified Authentic (Camera Provenance + Human Voice)',
      desc: 'Real optical sensor photon noise variance matches camera ISO grain. Human vocal cords show organic pitch micro-tremors (~0.012). Both branches confirm genuine capture, returning Verified Authentic.',
      color: '#34d399'
    }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const regimeId = card.getAttribute('data-regime');
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const data = regimeData[regimeId];
      if (data) {
        readout.innerHTML = `
          <strong style="color: ${data.color}; font-size: 15px; display: block; margin-bottom: 6px;">${data.title}</strong>
          <span style="color: var(--text-secondary);">${data.desc}</span>
        `;
      }
    });
  });
}
