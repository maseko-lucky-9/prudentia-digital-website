#!/usr/bin/env node
// Phase 5 smoke — verify animation triggers on viewport entry, plays once,
// holds the outcome key-frame, and respects prefers-reduced-motion.

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(__dirname, 'screenshots', 'phase5-animated');

async function startServer() {
  const proc = spawn('npx', ['serve', '-l', String(PORT), '.'], {
    cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('serve timeout')), 10000);
    proc.stdout.on('data', (c) => { if (String(c).includes('Accepting')) { clearTimeout(t); resolve(); } });
    proc.on('error', reject);
  });
  return proc;
}

(async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const server = await startServer();
  try {
    const browser = await chromium.launch();

    /* ── 1. Normal motion: animation runs on viewport entry ── */
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      const pilot = page.locator('.services__grid .card').first();
      const illustration = pilot.locator('.service-illustration--web-app');

      const beforeScroll = await illustration.evaluate((el) => el.classList.contains('is-playing'));
      console.log(`before scroll: is-playing=${beforeScroll} (should be false)`);

      await pilot.scrollIntoViewIfNeeded();
      await wait(300);
      const afterScroll = await illustration.evaluate((el) => el.classList.contains('is-playing'));
      console.log(`after scroll:  is-playing=${afterScroll} (should be true)`);

      // Grab mid-animation screenshot (~700ms into the arc — process beats running)
      await wait(700);
      await pilot.screenshot({ path: path.join(OUT_DIR, 'desktop-mid-animation.png') });

      // Wait for full animation to settle (1700 + 560 = ~2260ms total + buffer)
      await wait(2200);
      await pilot.screenshot({ path: path.join(OUT_DIR, 'desktop-settled.png') });

      // Check computed style on the accent — should be opacity 1 after settle
      const accentOpacity = await illustration.locator('.si-accent--fill').evaluate(
        (el) => getComputedStyle(el).opacity
      );
      console.log(`accent opacity after settle: ${accentOpacity} (should be 1)`);

      // Active animations on illustration elements
      const activeAnims = await illustration.evaluate((el) => {
        const animated = el.querySelectorAll('.si-shard, .si-frame, .si-header, .si-accent, .si-accent--fill');
        return Array.from(animated).filter((n) => {
          const cs = getComputedStyle(n);
          return cs.animationName && cs.animationName !== 'none';
        }).length;
      });
      console.log(`elements with active animations: ${activeAnims}`);

      await ctx.close();
    }

    /* ── 2. Reduced motion: animation must NOT trigger ── */
    {
      const ctx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      });
      const page = await ctx.newPage();
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      const pilot = page.locator('.services__grid .card').first();
      const illustration = pilot.locator('.service-illustration--web-app');

      await pilot.scrollIntoViewIfNeeded();
      await wait(800);

      const reducedHasPlaying = await illustration.evaluate((el) => el.classList.contains('is-playing'));
      console.log(`reduced-motion: is-playing=${reducedHasPlaying} (should be false)`);

      await pilot.screenshot({ path: path.join(OUT_DIR, 'desktop-reduced-motion.png') });
      await ctx.close();
    }

    /* ── 3. Mobile: animation runs ── */
    {
      const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const page = await ctx.newPage();
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      const pilot = page.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();
      await wait(2500);
      await pilot.screenshot({ path: path.join(OUT_DIR, 'mobile-settled.png') });
      await ctx.close();
    }

    await browser.close();
  } finally {
    server.kill('SIGTERM');
    await wait(300);
  }
  console.log('\nPhase 5 smoke complete. Screenshots in:', path.relative(REPO_ROOT, OUT_DIR));
})().catch((e) => { console.error(e); process.exit(1); });
