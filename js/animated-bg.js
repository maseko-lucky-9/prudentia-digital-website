/**
 * Animated Backgrounds — Prudentia Digital
 *
 * Hero canvas: gold diamond particles drifting upward with connecting lines.
 * IntersectionObserver: pauses/resumes CSS animations when sections leave viewport.
 *
 * Colour: gold-500 (#C9A96E) only — primitives, theme-invariant.
 * Performance: 30fps on high-DPR, ResizeObserver, pre-allocated pool.
 * Accessibility: bails entirely if prefers-reduced-motion is active.
 */
(() => {
  'use strict';

  /* ── Reduced-motion guard ───────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) {
    document.body.classList.add('bg-static');
    return; // Exit — no animations initialised
  }

  /* ── Constants ──────────────────────────────────── */
  const GOLD = { r: 201, g: 169, b: 110 };       // #C9A96E
  const CONNECTION_DIST = 150;                      // px — max distance for connecting lines
  const MIN_OPACITY = 0.08;
  const MAX_OPACITY = 0.20;
  const MIN_SIZE = 8;
  const MAX_SIZE = 28;
  const MIN_SPEED = 0.15;
  const MAX_SPEED = 0.4;
  const ROTATION_RANGE = Math.PI / 12;             // ~15 degrees
  const FADE_ZONE = 40;                            // px — fade-out zone at top/bottom edges
  const FRAME_INTERVAL_HIGH_DPR = 1000 / 30;       // 30fps cap on high-DPR
  const RESIZE_DEBOUNCE = 200;                      // ms

  /* ── Utility ────────────────────────────────────── */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getParticleCount(width) {
    if (width < 480) return Math.round(rand(4, 6));
    if (width < 768) return Math.round(rand(8, 12));
    return Math.round(rand(15, 25));
  }

  /* ── Diamond Particle ───────────────────────────── */
  class Diamond {
    constructor(canvasW, canvasH) {
      this.reset(canvasW, canvasH, true);
    }

    reset(canvasW, canvasH, randomY = false) {
      this.x = rand(0, canvasW);
      this.y = randomY ? rand(0, canvasH) : canvasH + rand(10, 50);
      this.size = rand(MIN_SIZE, MAX_SIZE);
      this.baseOpacity = rand(MIN_OPACITY, MAX_OPACITY);
      this.speed = rand(MIN_SPEED, MAX_SPEED);
      this.rotation = rand(-ROTATION_RANGE, ROTATION_RANGE);
      this.rotationSpeed = rand(-0.0003, 0.0003);
      this.horizontalDrift = rand(-0.05, 0.05);
    }

    update(canvasH) {
      this.y -= this.speed;
      this.x += this.horizontalDrift;
      this.rotation += this.rotationSpeed;

      // Off-screen at top — recycle
      if (this.y < -this.size * 2) {
        return false;
      }
      return true;
    }

    getOpacity(canvasH) {
      let opacity = this.baseOpacity;
      // Fade near top edge
      if (this.y < FADE_ZONE) {
        opacity *= Math.max(0, this.y / FADE_ZONE);
      }
      // Fade near bottom edge (for spawning)
      if (this.y > canvasH - FADE_ZONE) {
        opacity *= Math.max(0, (canvasH - this.y) / FADE_ZONE);
      }
      return opacity;
    }
  }

  /* ── Hero Canvas Setup ──────────────────────────── */
  const heroLayer = document.querySelector('.bg-layer--hero');
  if (!heroLayer) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  heroLayer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId = null;
  let isVisible = false;
  let lastFrameTime = 0;
  let dpr = 1;
  let cssWidth = 0;
  let cssHeight = 0;

  function sizeCanvas() {
    const rect = heroLayer.getBoundingClientRect();
    cssWidth = rect.width;
    cssHeight = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Resize particle pool
    const targetCount = getParticleCount(cssWidth);

    if (targetCount === 0) {
      // Canvas disabled on this viewport size
      particles = [];
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = 'block';

    // Adjust pool size
    while (particles.length < targetCount) {
      particles.push(new Diamond(cssWidth, cssHeight));
    }
    while (particles.length > targetCount) {
      particles.pop();
    }
  }

  /* ── Render Loop ────────────────────────────────── */
  function drawDiamond(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function render(timestamp) {
    if (!isVisible || particles.length === 0) {
      animId = null;
      return;
    }

    // Frame throttle on high-DPR
    const frameInterval = dpr > 1.5 ? FRAME_INTERVAL_HIGH_DPR : 0;
    if (frameInterval && timestamp - lastFrameTime < frameInterval) {
      animId = requestAnimationFrame(render);
      return;
    }
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Update + draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (!p.update(cssHeight)) {
        p.reset(cssWidth, cssHeight, false);
      }
    }

    // Draw connecting lines (before diamonds, so diamonds sit on top)
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const lineOpacity = 0.05 * (1 - dist / CONNECTION_DIST);
          const aOpacity = a.getOpacity(cssHeight);
          const bOpacity = b.getOpacity(cssHeight);
          // Only draw line if both particles are visible
          if (aOpacity > 0.005 && bOpacity > 0.005) {
            ctx.strokeStyle = `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${lineOpacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw diamonds
    for (const p of particles) {
      const opacity = p.getOpacity(cssHeight);
      if (opacity > 0.005) {
        ctx.fillStyle = `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${opacity})`;
        drawDiamond(p.x, p.y, p.size / 2, p.rotation);
      }
    }

    animId = requestAnimationFrame(render);
  }

  function startRender() {
    if (animId === null && particles.length > 0) {
      animId = requestAnimationFrame(render);
    }
  }

  function stopRender() {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  /* ── IntersectionObserver — pause/resume all bg-layers + bg-fx ── */
  const bgLayers = document.querySelectorAll('.bg-layer, .bg-fx');

  const bgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      if (el.classList.contains('bg-layer--hero')) {
        // Canvas: start/stop render loop
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startRender();
        } else {
          stopRender();
        }
      } else {
        // CSS animations: toggle pause class
        el.classList.toggle('bg-paused', !entry.isIntersecting);
      }
    });
  }, { threshold: 0 });

  bgLayers.forEach(layer => bgObserver.observe(layer));

  /* ── Spotlight — mouse-aware glow on [data-spotlight] sections ── */
  function initSpotlight() {
    const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!fineHover.matches) return;

    const sections = document.querySelectorAll('[data-spotlight]');
    if (sections.length === 0) return;

    sections.forEach(section => {
      let rafId = null;
      let pendingX = 0;
      let pendingY = 0;

      const apply = () => {
        rafId = null;
        section.style.setProperty('--mx', pendingX + '%');
        section.style.setProperty('--my', pendingY + '%');
      };

      section.addEventListener('pointerenter', () => {
        section.dataset.spotlightActive = 'true';
      });

      section.addEventListener('pointermove', (e) => {
        const rect = section.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        pendingX = ((e.clientX - rect.left) / rect.width) * 100;
        pendingY = ((e.clientY - rect.top) / rect.height) * 100;
        if (rafId === null) {
          rafId = requestAnimationFrame(apply);
        }
      });

      section.addEventListener('pointerleave', () => {
        section.dataset.spotlightActive = 'false';
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    });
  }

  initSpotlight();

  /* ── Card pulse — mark cards in-view via existing reveal observer
       Cards already get `.in-view` class; CSS picks it up.
       This block also exposes a fallback observer in case some cards
       use `.reveal` (without becoming `.in-view`). */
  const pulseCards = document.querySelectorAll('.card-pulse');
  if (pulseCards.length > 0 && 'IntersectionObserver' in window) {
    const cardIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.2 });
    pulseCards.forEach(c => cardIo.observe(c));
  }

  /* ── Resize handling ────────────────────────────── */
  let resizeTimer = null;

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeCanvas();
      }, RESIZE_DEBOUNCE);
    });
    ro.observe(heroLayer);
  } else {
    // Fallback for older browsers
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeCanvas();
      }, RESIZE_DEBOUNCE);
    });
  }

  /* ── Initialise ─────────────────────────────────── */
  sizeCanvas();

  // Listen for reduced-motion changes (user toggles during session)
  reducedMotion.addEventListener('change', (e) => {
    if (e.matches) {
      stopRender();
      document.body.classList.add('bg-static');
      bgLayers.forEach(layer => layer.classList.add('bg-paused'));
    } else {
      document.body.classList.remove('bg-static');
      bgLayers.forEach(layer => layer.classList.remove('bg-paused'));
      sizeCanvas();
      if (isVisible) startRender();
    }
  });
})();
