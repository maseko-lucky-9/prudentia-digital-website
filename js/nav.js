/**
 * Prudentia Digital — Shared navigation behaviour
 * Handles: sticky nav scroll class, mobile menu toggle, focus trap.
 * Works on index.html (IntersectionObserver) and inner pages (always-scrolled).
 */
(() => {
  'use strict';

  /* ── Sticky nav scroll behaviour ──────────── */
  const nav = document.getElementById('nav');

  if (nav) {
    const heroSentinel = document.getElementById('heroSentinel');

    if (heroSentinel) {
      // Home page: toggle on hero visibility
      const navObserver = new IntersectionObserver(([entry]) => {
        nav.classList.toggle('scrolled', !entry.isIntersecting);
      }, { threshold: 0.1 });
      navObserver.observe(heroSentinel);
    }
    // Inner pages already have nav--scrolled class applied inline
  }

  /* ── Mobile menu ───────────────────────────── */
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('navMobile');

  if (!toggle || !mobileMenu) return;

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.focus();
  }

  toggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    mobileMenu.setAttribute('aria-hidden', !open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  /* Focus trap within mobile menu */
  mobileMenu.addEventListener('keydown', (e) => {
    if (!mobileMenu.classList.contains('open')) return;
    const links = Array.from(mobileMenu.querySelectorAll('a'));
    const first = links[0];
    const last = links[links.length - 1];
    if (e.key === 'Escape') {
      closeMobileMenu();
    } else if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          toggle.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          toggle.focus();
        }
      }
    }
  });

  /* Trap focus back into menu when tabbing forward from hamburger */
  toggle.addEventListener('keydown', (e) => {
    if (!mobileMenu.classList.contains('open')) return;
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  });

  /* Close mobile menu on link click */
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
})();
