// ==============================================================================
//  DeepGuard AI — Website Interactive JS
//  Author: Mohan Abhishek Gupta (@MohanAbhishek29) — Project Lead & System Architect
//  License: Proprietary — All Rights Reserved (Patent Pending)
// ==============================================================================

(function () {
  'use strict';

  /* ── 1. CUSTOM CURSOR ───────────────────────────────────────────────────── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = -100, my = -100, rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animateCursor() {
    // dot: instant
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    // ring: lag
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
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

})();
