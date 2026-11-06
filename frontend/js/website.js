// ==============================================================================
//  DeepGuard AI — Website Interactive JS
//  Author: Mohan Abhishek Gupta (@MohanAbhishek29) — Project Lead & System Architect
//  License: Proprietary — All Rights Reserved (Patent Pending)
// ==============================================================================

(function () {
  'use strict';

  /* ── 1. ELECTRIC BLUE LASER COMET CURSOR (ZERO CANVAS, ZERO LAYOUT SHIFT) ── */
  // Remove any leftover canvas elements to eliminate empty space completely
  const badCanvas = document.getElementById('laserCanvas');
  if (badCanvas) badCanvas.remove();
  const badCore = document.getElementById('laserCore');
  if (badCore) badCore.remove();

  let dot = document.getElementById('laserCursorDot');
  let ring = document.getElementById('laserCursorRing');

  if (!dot) {
    dot = document.createElement('div');
    dot.id = 'laserCursorDot';
    dot.className = 'laser-cursor-dot';
    document.body.appendChild(dot);
  }
  if (!ring) {
    ring = document.createElement('div');
    ring.id = 'laserCursorRing';
    ring.className = 'laser-cursor-ring';
    document.body.appendChild(ring);
  }

  // Hide old elements if present
  const oldDot = document.getElementById('cursorDot');
  const oldRing = document.getElementById('cursorRing');
  if (oldDot) oldDot.style.display = 'none';
  if (oldRing) oldRing.style.display = 'none';

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let lastSparkTime = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';

    // Spawn micro spark trail throttled to 35ms (ultra smooth, zero lag, zero canvas)
    const now = performance.now();
    if (now - lastSparkTime > 35) {
      lastSparkTime = now;
      const spark = document.createElement('div');
      spark.className = 'laser-spark';
      const size = Math.random() * 4 + 2;
      spark.style.width = size + 'px';
      spark.style.height = size + 'px';
      spark.style.left = (mx + (Math.random() - 0.5) * 6) + 'px';
      spark.style.top = (my + (Math.random() - 0.5) * 6) + 'px';
      document.body.appendChild(spark);

      setTimeout(() => { spark.remove(); }, 350);
    }
  });

  // Click burst (spawns 8 micro electric blue sparks radiating outward)
  window.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('div');
      spark.className = 'laser-spark';
      const size = Math.random() * 5 + 3;
      spark.style.width = size + 'px';
      spark.style.height = size + 'px';
      const angle = (Math.PI * 2 / 8) * i;
      const dist = Math.random() * 16 + 10;
      spark.style.left = (e.clientX + Math.cos(angle) * dist) + 'px';
      spark.style.top = (e.clientY + Math.sin(angle) * dist) + 'px';
      document.body.appendChild(spark);
      setTimeout(() => { spark.remove(); }, 400);
    }
  });

  // Ring fluid lag animation
  function renderRing() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(renderRing);
  }
  renderRing();

  // Hover target scaling
  const hoverSelector = 'a, button, input, select, textarea, .cursor-card, .test-target, .pipeline-step, .arch-node, .team-card, .usecase-card, .sim-btn, .btn, .spec-card, .metric-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelector)) {
      dot.classList.add('active-hover');
      ring.classList.add('active-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelector)) {
      dot.classList.remove('active-hover');
      ring.classList.remove('active-hover');
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });

  /* ── 2. BOOT INTRO ──────────────────────────────────────────────────────── */
  const overlay   = document.getElementById('bootOverlay');
  const barFill   = document.getElementById('bootBarFill');
  const bootStatus = document.getElementById('bootStatus');

  const bootMessages = [
    'Initializing multimodal forensic engine...',
    'Loading OpenCV vision pipeline...',
    'Calibrating 1D-FFT vocoder detector...',
    'Mounting SHA-256 chain of custody...',
    'DeepGuard AI — Ready.'
  ];

  let progress = 0;
  let msgIdx   = 0;
  const bootInterval = setInterval(() => {
    progress += (Math.random() * 18 + 8);
    if (progress >= 100) progress = 100;
    barFill.style.width = progress + '%';

    const idx = Math.min(Math.floor(progress / 25), bootMessages.length - 1);
    if (idx !== msgIdx) {
      msgIdx = idx;
      bootStatus.textContent = bootMessages[msgIdx];
    }

    if (progress >= 100) {
      clearInterval(bootInterval);
      setTimeout(() => {
        overlay.classList.add('hidden');
        // Trigger scroll animations for first visible section
        triggerVisibleFades();
      }, 500);
    }
  }, 180);

  /* ── 3. NAVBAR SCROLL STYLE ─────────────────────────────────────────────── */
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ── 4. SCROLL-INTO-VIEW FADE ANIMATIONS ────────────────────────────────── */
  const fades = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fades.forEach(el => observer.observe(el));

  function triggerVisibleFades() {
    fades.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('visible');
      }
    });
  }

  /* ── 5. PERFORMANCE BARS — ANIMATE ON SCROLL ────────────────────────────── */
  const perfSection = document.getElementById('performance');
  const barFills    = document.querySelectorAll('.perf-bar-fill');

  // Reset widths to 0 initially for animation
  barFills.forEach(b => {
    const target = b.style.width;
    b.dataset.target = target;
    b.style.width = '0%';
  });

  const perfObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        barFills.forEach((b, i) => {
          setTimeout(() => {
            b.style.width = b.dataset.target;
          }, i * 120);
        });
        perfObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  if (perfSection) perfObserver.observe(perfSection);

  /* ── 6. SMOOTH SCROLL FOR NAV LINKS ─────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - navH - 20,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ── 7. PIPELINE STEP HOVER MICRO INTERACTION ───────────────────────────── */
  document.querySelectorAll('.pipeline-step').forEach(step => {
    step.addEventListener('mouseenter', () => {
      step.style.borderLeftColor = 'var(--accent)';
    });
    step.addEventListener('mouseleave', () => {
      step.style.borderLeftColor = '';
    });
  });

  /* ── 8. ARCH NODE HOVER — TEAL GLOW ─────────────────────────────────────── */
  document.querySelectorAll('.arch-node').forEach(node => {
    node.addEventListener('mouseenter', () => {
      node.style.boxShadow = '0 0 20px rgba(0, 245, 180, 0.08)';
    });
    node.addEventListener('mouseleave', () => {
      node.style.boxShadow = '';
    });
  });

  /* ── 9. INTERACTIVE FORENSIC LAB ─────────────────────────────────────────── */
  const spectrumContainer = document.getElementById('spectrumBarsContainer');
  const barCount = 24;

  if (spectrumContainer) {
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'spectrum-bar';
      const baseHeight = Math.max(8, Math.round(95 * Math.exp(-i * 0.14) + (Math.random() * 12)));
      bar.style.height = baseHeight + '%';
      spectrumContainer.appendChild(bar);
    }
  }

  window.setAudioSimMode = function (mode) {
    const btnReal = document.getElementById('btnAudioReal');
    const btnAi = document.getElementById('btnAudioAi');
    const status = document.getElementById('audioReadoutStatus');
    const ratio = document.getElementById('audioReadoutRatio');
    const bars = document.querySelectorAll('.spectrum-bar');

    if (mode === 'real') {
      btnReal.classList.add('active');
      btnAi.classList.remove('active');
      status.innerText = 'STATUS: NATURAL ANALOG ROLL-OFF (AUTHENTIC)';
      status.style.color = 'var(--accent)';
      ratio.innerText = 'HF RATIO: 0.0019';

      bars.forEach((bar, i) => {
        bar.classList.remove('hf-spike');
        const h = Math.max(6, Math.round(92 * Math.exp(-i * 0.16) + (Math.random() * 10)));
        bar.style.height = h + '%';
      });
    } else {
      btnAi.classList.add('active');
      btnReal.classList.remove('active');
      status.innerText = 'STATUS: ULTRASONIC NEURAL VOCODER SPIKE (>16kHz HASH DETECTED)';
      status.style.color = 'var(--accent-warn)';
      ratio.innerText = 'HF RATIO: 0.0124 (FLAGGED >0.007)';

      bars.forEach((bar, i) => {
        if (i >= 16) {
          bar.classList.add('hf-spike');
          const h = Math.round(75 + (Math.random() * 22));
          bar.style.height = h + '%';
        } else {
          bar.classList.remove('hf-spike');
          const h = Math.max(10, Math.round(85 * Math.exp(-i * 0.12) + (Math.random() * 12)));
          bar.style.height = h + '%';
        }
      });
    }
  };

  window.setVisionSimMode = function (mode) {
    const btnReal = document.getElementById('btnVisionReal');
    const btnFake = document.getElementById('btnVisionFake');
    const seamBadge = document.getElementById('simSeamBadge');
    const elaBadge = document.getElementById('simElaBadge');
    const tracker = document.getElementById('simTrackerBox');
    const lapText = document.getElementById('simLaplacianText');
    const verdict = document.getElementById('simVerdictText');
    const desc = document.getElementById('simDescText');

    if (mode === 'real') {
      btnReal.classList.add('active');
      btnFake.classList.remove('active');
      seamBadge.innerText = 'BOUNDARY SEAM: NATURAL (1.04x)';
      seamBadge.style.color = 'var(--accent)';
      elaBadge.innerText = 'ELA STD: 4.82';
      tracker.style.borderColor = 'var(--accent)';
      tracker.style.color = 'var(--accent)';
      tracker.innerText = 'FACE REGION [AUTHENTIC]';
      lapText.innerText = 'SENSOR NOISE: LAPLACIAN 145 (NATURAL GRAIN)';
      verdict.innerText = 'PASSED ✅';
      verdict.style.color = 'var(--accent)';
      desc.innerText = 'Original camera photo shows smooth optical blending between the facial skin and surrounding background with uniform photon sensor grain.';
    } else {
      btnFake.classList.add('active');
      btnReal.classList.remove('active');
      seamBadge.innerText = 'BOUNDARY SEAM: SPLICED DISCONTINUITY (2.48x)';
      seamBadge.style.color = '#ef4444';
      elaBadge.innerText = 'ELA STD: 1.42 (COMPRESSION DISPARITY)';
      tracker.style.borderColor = '#ef4444';
      tracker.style.color = '#ef4444';
      tracker.innerText = 'SEAM FLAGGED [2.48x]';
      lapText.innerText = 'SENSOR NOISE: LAPLACIAN 22 (SYNTHETIC SMOOTHING)';
      verdict.innerText = 'FLAGGED 🚨';
      verdict.style.color = '#ef4444';
      desc.innerText = 'Face-swap deepfake detected: The pasted facial boundary has an unnatural sharpness step compared to the background, and skin textures show artificial diffusion smoothing.';
    }
  };

})();
