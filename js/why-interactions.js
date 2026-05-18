/*
 * Why Choose Us — pointer-reactive glow + 3D tilt + Phase 10 tendrils.
 * Single delegated pointer handler on .why__grid. RAF-throttled, passive.
 * Touch devices and reduced-motion users are skipped at the matchMedia gate.
 *
 * CSS custom properties set per-card:
 *   --why-mx, --why-my : radial-gradient position (px from card top-left)
 *   --why-tx, --why-ty : normalized tilt vector in [-1, 1]
 *
 * Grid-level data attribute set:
 *   data-tendril-active : index of currently-hovered card (0..3), or "-1"
 *
 * Tendril SVG paths between sibling icon centres are recomputed on
 * resize / scroll / layout change. Path stroke geometry stays in CSS; JS
 * only sets the `d` attribute and the active-card index on the grid.
 *
 * Plan: /Users/ltmas/.claude/plans/the-section-why-choose-misty-backus.md
 */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduced || !fine) return;

  const grid = document.querySelector('.why__grid');
  if (!grid) return;

  /* ── Phase 9 pointer-driven tilt + glow ───────────────────── */

  let pending = false;
  let lastEvent = null;

  const updatePointer = () => {
    pending = false;
    if (!lastEvent) return;
    const card = lastEvent.target.closest('.why__item');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = lastEvent.clientX - rect.left;
    const y = lastEvent.clientY - rect.top;
    const nx = (x / rect.width) * 2 - 1;   // -1..1
    const ny = (y / rect.height) * 2 - 1;  // -1..1

    card.style.setProperty('--why-mx', x + 'px');
    card.style.setProperty('--why-my', y + 'px');
    card.style.setProperty('--why-tx', nx.toFixed(3));
    card.style.setProperty('--why-ty', ny.toFixed(3));
  };

  grid.addEventListener('pointermove', (e) => {
    lastEvent = e;
    if (!pending) {
      pending = true;
      requestAnimationFrame(updatePointer);
    }
  }, { passive: true });

  grid.addEventListener('pointerleave', (e) => {
    const card = e.target.closest && e.target.closest('.why__item');
    if (!card) return;
    card.style.setProperty('--why-tx', '0');
    card.style.setProperty('--why-ty', '0');
  }, { passive: true, capture: true });

  /* ── Phase 10 tendrils ─────────────────────────────────────── */

  const tendrils = grid.querySelectorAll('.why__tendril');
  const cards = Array.from(grid.querySelectorAll('.why__item'));

  // Active card index → CSS lights the two incident tendrils via attribute selector.
  cards.forEach((card, i) => {
    card.addEventListener('pointerenter', () => {
      grid.setAttribute('data-tendril-active', String(i));
    }, { passive: true });
  });
  grid.addEventListener('pointerleave', () => {
    grid.setAttribute('data-tendril-active', '-1');
  }, { passive: true });

  // Compute bezier paths between consecutive icon centres (cards i ↔ i+1).
  // The svg sits in the grid's coordinate space (viewBox synced to grid px).
  const computePaths = () => {
    if (window.innerWidth < 1024) return;  // only when 4-col layout is active

    const gridRect = grid.getBoundingClientRect();
    const svg = grid.querySelector('.why__tendrils');
    if (!svg) return;

    svg.setAttribute('viewBox', `0 0 ${gridRect.width} ${gridRect.height}`);

    const centres = cards.map((card) => {
      const icon = card.querySelector('.why__icon-wrap');
      if (!icon) return null;
      const r = icon.getBoundingClientRect();
      return {
        x: r.left - gridRect.left + r.width / 2,
        y: r.top  - gridRect.top  + r.height / 2,
      };
    });

    for (let i = 0; i < 3; i++) {
      const a = centres[i];
      const b = centres[i + 1];
      const t = tendrils[i];
      if (!a || !b || !t) continue;

      // Gentle drape between siblings — control points dropped ~14px.
      const drop = 14;
      const c1x = a.x + (b.x - a.x) * 0.25;
      const c1y = a.y + drop;
      const c2x = a.x + (b.x - a.x) * 0.75;
      const c2y = b.y + drop;

      t.setAttribute('d', `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`);
    }
  };

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => requestAnimationFrame(computePaths));
    ro.observe(grid);
  } else {
    window.addEventListener('resize', () => requestAnimationFrame(computePaths), { passive: true });
  }
  requestAnimationFrame(computePaths);
})();
