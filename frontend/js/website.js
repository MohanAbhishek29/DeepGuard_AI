/**
 * ==============================================================================
 * 🛡️ DeepGuard AI — Cinematic Immersive Product Showcase Interactive Engine
 * Author & Project Lead: Mohan Abhishek Gupta (@MohanAbhishek29)
 * Repository: https://github.com/MohanAbhishek29/DeepGuard_AI
 * License: Proprietary — All Rights Reserved (Patent Pending)
 * Copyright (c) 2026 Mohan Abhishek Gupta. All rights reserved.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initCyberCursor();
  initCinematicBootLoader();
  initCursorSpotlight();
  initSceneDeckObserver();
  initSceneHudNav();
  initMorphTabs();
  initComparisonSlider();
  initAudioSim();
  initElaToggle();
  initRegimeSelector();
  initTerminalCopy();
  init3DCardTilts();
});

/* ==========================================================================
   0. CUSTOM CYBER SCI-FI CURSOR
   ========================================================================== */
function initCyberCursor() {
  const dot = document.getElementById('cyberCursorDot');
  const ring = document.getElementById('cyberCursorRing');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderRing);
  }
  renderRing();

  const hoverTargets = 'a, button, input, select, textarea, .nav-item, .bento-card, .morph-tab-btn, .regime-interactive-card, .slider-handle-pill, .btn-hero-launch, .btn-hero-terminal, .scene-dot-btn';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      ring.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      ring.classList.remove('cursor-hover');
    }
  });

  document.addEventListener('mousedown', () => {
    ring.classList.add('cursor-click');
  });

  document.addEventListener('mouseup', () => {
    ring.classList.remove('cursor-click');
  });
}

/* ==========================================================================
   1. CINEMATIC BOOT LOADER & UNBLUR SEQUENCE
   ========================================================================== */
function initCinematicBootLoader() {
  const overlay = document.getElementById('bootIntroOverlay');
  const progressFill = document.getElementById('bootProgressFill');
  const statusText = document.getElementById('bootStatusText');
  const unblurStage = document.getElementById('unblurStage');

  if (!overlay || !progressFill || !statusText || !unblurStage) return;

  const bootSteps = [
    { pct: 15, msg: "Probing optical sensor physical photon grains..." },
    { pct: 35, msg: "Initializing 2D-FFT spatial frequency upsampling mesh..." },
    { pct: 60, msg: "Activating ultrasonic vocoder filter (>16,000 Hz)..." },
    { pct: 85, msg: "Aligning multilingual Whisper phoneme sync..." },
    { pct: 100, msg: "DeepGuard AI v2.4 Tri-Spectral Core Initialized." }
  ];

  let currentStep = 0;

  function runNextBootStep() {
    if (currentStep >= bootSteps.length) {
      setTimeout(() => {
        overlay.classList.add('boot-complete');
        unblurStage.classList.add('unblurred');
      }, 350);
      return;
    }

    const step = bootSteps[currentStep];
    progressFill.style.width = `${step.pct}%`;
    statusText.innerText = step.msg;
    currentStep++;

    const delay = currentStep === 1 ? 150 : 250;
    setTimeout(runNextBootStep, delay);
  }

  // Start sequence
  setTimeout(runNextBootStep, 100);
}

/* ==========================================================================
   2. DYNAMIC CYBER CURSOR SPOTLIGHT
   ========================================================================== */
function initCursorSpotlight() {
  const spotlight = document.getElementById('cursorSpotlight');
  if (!spotlight) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateSpotlight() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    spotlight.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateSpotlight);
  }
  animateSpotlight();
}

/* ==========================================================================
   3. SCENE DECK OBSERVER (ACTIVE SCENE TRANSITIONS)
   ========================================================================== */
function initSceneDeckObserver() {
  const scenes = document.querySelectorAll('.scene-deck-section');
  const dots = document.querySelectorAll('.scene-dot-btn');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px',
    threshold: 0.25
  };

  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        scenes.forEach(s => s.classList.remove('scene-active'));
        entry.target.classList.add('scene-active');

        // Update active dot in right HUD
        const sceneId = entry.target.id;
        dots.forEach(dot => {
          if (dot.getAttribute('data-scene') === sceneId) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });

        // Update top nav active item
        const navLinks = document.querySelectorAll('.header-nav .nav-item');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sceneId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  scenes.forEach(scene => sceneObserver.observe(scene));
}

/* ==========================================================================
   4. SCENE HUD NAVIGATOR CLICK HANDLER
   ========================================================================== */
function initSceneHudNav() {
  const dots = document.querySelectorAll('.scene-dot-btn');

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetId = dot.getAttribute('data-scene');
      const targetScene = document.getElementById(targetId);
      if (targetScene) {
        targetScene.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ==========================================================================
   5. INTERACTIVE MORPHING & SLIDING TABS
   ========================================================================== */
function initMorphTabs() {
  const tabButtons = document.querySelectorAll('.morph-tab-btn');
  const tabCards = document.querySelectorAll('.morph-card');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

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
   6. INTERACTIVE BEFORE/AFTER FACE COMPARISON SLIDER
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

  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  // Touch Support
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateSlider(e.touches[0].clientX);
  });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updateSlider(e.touches[0].clientX);
  });
}

/* ==========================================================================
   7. INTERACTIVE AUDIO VOCODER SPECTRUM SIMULATOR
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

    if (badge) {
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = '#34d399';
      badge.innerText = 'NATURAL HUMAN VOCAL CORDS';
    }

    if (specText) {
      specText.innerHTML = `
        • <strong>Natural Acoustic Roll-off:</strong> Smooth continuous analog attenuation past 12 kHz.<br>
        • <strong>Biomechanical Pitch Jitter:</strong> 0.0128 (Normal human vocal fold vibration variance).<br>
        • <strong>Ultrasonic Noise Floor (>16kHz):</strong> -78.4 dB (Clean analog decay, zero AI quantization spikes).
      `;
    }

    graphBars.forEach((bar, index) => {
      const height = Math.max(12, 85 - index * 6 + (Math.random() * 8));
      bar.style.height = `${height}%`;
      bar.style.background = 'linear-gradient(to top, #10b981, #38bdf8)';
    });
  });

  btnAi.addEventListener('click', () => {
    btnAi.classList.add('active');
    btnHuman.classList.remove('active');

    if (badge) {
      badge.style.background = 'rgba(244, 63, 94, 0.2)';
      badge.style.color = '#fb7185';
      badge.innerText = 'AI NEURAL VOCODER (CLONED VOICE)';
    }

    if (specText) {
      specText.innerHTML = `
        • <strong>Unnatural Ultrasonic Spike:</strong> Harsh energy burst between 16,000 Hz and 22,000 Hz.<br>
        • <strong>Robotic Pitch Jitter:</strong> 0.0009 (Unnaturally steady synthetic neural frequency generator).<br>
        • <strong>Quantization Hash:</strong> HiFi-GAN / ElevenLabs / Suno AI neural vocoder signature confirmed.
      `;
    }

    graphBars.forEach((bar, index) => {
      let height = 35 + Math.random() * 30;
      if (index >= 9) {
        height = 80 + Math.random() * 18;
        bar.style.background = 'linear-gradient(to top, #f43f5e, #a855f7)';
      } else {
        bar.style.background = 'linear-gradient(to top, #a855f7, #38bdf8)';
      }
      bar.style.height = `${height}%`;
    });
  });
}

/* ==========================================================================
   8. INTERACTIVE ELA (ERROR LEVEL ANALYSIS) IMAGE SPLICING TOGGLE
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
      elaOverlay.style.opacity = '0.92';
      toggleBtn.innerText = '📸 View Normal Optical Image';
      if (elaStatus) {
        elaStatus.innerHTML = '<span style="color: #f43f5e; font-weight: 700;">⚠️ ELA HEATMAP ACTIVE:</span> Glowing magenta squares spotlight mismatched compression levels where passport photo and date text were spliced.';
      }
    } else {
      elaOverlay.style.opacity = '0';
      toggleBtn.innerText = '🔬 Reveal ELA Compression Heatmap';
      if (elaStatus) {
        elaStatus.innerHTML = '<span style="color: #38bdf8; font-weight: 700;">NORMAL OPTICAL VIEW:</span> Shows original image before microscopic error level analysis.';
      }
    }
  });
}

/* ==========================================================================
   9. INTERACTIVE 4-REGIME CORRELATION SELECTOR
   ========================================================================== */
function initRegimeSelector() {
  const cards = document.querySelectorAll('.regime-interactive-card');
  const readout = document.getElementById('regimeExplanationText');

  if (!cards.length || !readout) return;

  const regimeData = {
    '1': {
      title: 'Regime I: Visual Deepfake (Manipulated Video + Real Audio)',
      badge: 'ASYMMETRIC VISUAL ATTACK',
      color: '#fb7185',
      desc: 'The attacker spliced an AI face swap (Roop/FaceFusion) onto authentic camera footage. Optical branch detects missing camera sensor grain and face boundary blending seams. Audio branch confirms authentic human voice. DeepGuard isolates the face tampering without false-flagging the audio.'
    },
    '2': {
      title: 'Regime II: Cloned Voice Dub (Real Video + Cloned Audio)',
      badge: 'ASYMMETRIC ACOUSTIC ATTACK',
      color: '#c084fc',
      desc: 'Authentic camera footage was dubbed with an AI-synthesized voice (CEO wire fraud / fabricated political audio). Camera optical grain is authentic, but acoustic frequency probing detects ultrasonic neural vocoder energy above 16kHz and robotic pitch stability (~0.0009). DeepGuard isolates the audio manipulation.'
    },
    '3': {
      title: 'Regime III: Fully Synthetic (AI Avatar + Cloned Voice)',
      badge: '100% GENERATIVE MEDIA',
      color: '#fbbf24',
      desc: 'Both modalities are computer-generated (e.g. Midjourney portrait animated by Sora or Runway with ElevenLabs speech). Both optical and acoustic pipelines trigger red alerts simultaneously, returning a definitive 99.8% synthetic verdict.'
    },
    '4': {
      title: 'Regime IV: Verified Authentic (Camera Provenance + Human Voice)',
      badge: 'VERIFIED GENUINE',
      color: '#34d399',
      desc: 'Real optical sensor photon noise matches camera ISO profile (Laplacian variance >16.0). Human vocal cords demonstrate natural elasticity and micro-jitter (~0.012). Both branches confirm genuine capture, returning Verified Authentic.'
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
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <strong style="color: ${data.color}; font-size: 16px;">${data.title}</strong>
            <span style="font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.06); color: ${data.color}; border: 1px solid ${data.color}40;">${data.badge}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 13.5px; line-height: 1.65;">${data.desc}</p>
        `;
      }
    });
  });
}

/* ==========================================================================
   10. DEVELOPER QUICKSTART TERMINAL COPY
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
   11. 3D PERSPECTIVE TILT ON CARDS & HERO
   ========================================================================== */
function init3DCardTilts() {
  const tiltElements = document.querySelectorAll('.hero-visual-frame, .bento-card, .method-card');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = -(y / rect.height) * 8;
      const rotY = (x / rect.width) * 8;

      el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}
