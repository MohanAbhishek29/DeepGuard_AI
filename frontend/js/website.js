// ==============================================================================
//  DeepGuard AI — Website Interactive JS
//  Author: Mohan Abhishek Gupta (@MohanAbhishek29) — Project Lead & System Architect
//  License: Proprietary — All Rights Reserved (Patent Pending)
// ==============================================================================

(function () {
  'use strict';

  /* ── 1. ELECTRIC BLUE LASER COMET CURSOR (EXACT STYLE 07 FROM CURSOR SHOWCASE) ── */
  const laserCanvas = document.getElementById('laserCanvas');
  const laser = document.getElementById('c7Laser');

  if (laserCanvas && laser) {
    const ctx = laserCanvas.getContext('2d');
    let particles = [];
    let mx = -100, my = -100;

    function resizeCanvas() {
      laserCanvas.width = window.innerWidth;
      laserCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      laser.style.left = mx + 'px';
      laser.style.top = my + 'px';

      // spawn exactly 3 dust particles per move just like cursor showcase
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: mx,
          y: my,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1.0,
          radius: Math.random() * 3 + 1
        });
      }
    });

    // Click burst (spawns 14 particles outward on click)
    window.addEventListener('click', (e) => {
      for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 / 14) * i + (Math.random() - 0.5) * 0.3;
        const speed = Math.random() * 3.5 + 1.8;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          radius: Math.random() * 3.5 + 1.5
        });
      }
    });

    // Hover target scaling
    const hoverSelector = 'a, button, input, select, textarea, .cursor-card, .test-target, .pipeline-step, .arch-node, .team-card, .usecase-card, .sim-btn, .btn, .spec-card, .metric-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelector)) {
        laser.classList.add('laser-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelector)) {
        laser.classList.remove('laser-hover');
      }
    });

    document.addEventListener('mouseleave', () => {
      laser.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      laser.style.opacity = '1';
    });

    // Render loop with exact showcase physics
    function renderComet() {
      ctx.clearRect(0, 0, laserCanvas.width, laserCanvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.035;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 255, ${p.life * 0.85})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f5ff';
        ctx.fill();
      }
      requestAnimationFrame(renderComet);
    }
    renderComet();
  }

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
