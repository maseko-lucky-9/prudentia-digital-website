/*
 * Why Choose Us — pointer-reactive glow + 3D tilt.
 * Single delegated pointermove on .why__grid, RAF-throttled.
 * Touch devices and reduced-motion users are skipped at the matchMedia gate.
 *
 * Updates CSS custom properties:
 *   --why-mx, --why-my : radial-gradient position (px from card top-left)
 *   --why-tx, --why-ty : normalized tilt vector in [-1, 1]
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

  let pending = false;
  let lastEvent = null;

  const update = () => {
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
      requestAnimationFrame(update);
    }
  }, { passive: true });

  grid.addEventListener('pointerleave', (e) => {
    const card = e.target.closest && e.target.closest('.why__item');
    if (!card) return;
    card.style.setProperty('--why-tx', '0');
    card.style.setProperty('--why-ty', '0');
  }, { passive: true, capture: true });
})();
