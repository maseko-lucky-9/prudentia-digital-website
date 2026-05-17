#!/usr/bin/env node
// Phase 4 smoke check — capture services section + pilot card with the layout shim
// applied. Eyeball-compare against tests/baselines/screenshots/services-section/*.

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(__dirname, 'screenshots', 'phase4-shim');

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
  const fs = await import('node:fs/promises');
  await fs.mkdir(OUT_DIR, { recursive: true });
  const server = await startServer();
  try {
    const browser = await chromium.launch();

    for (const [name, vp] of [
      ['desktop', { width: 1440, height: 900 }],
      ['mobile', { width: 375, height: 812 }],
    ]) {
      const ctx = await browser.newContext({ viewport: vp });
      const page = await ctx.newPage();
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      const services = page.locator('#services');
      await services.scrollIntoViewIfNeeded();
      await wait(500);
      await services.screenshot({ path: path.join(OUT_DIR, `${name}-services.png`) });

      // Just the pilot card
      const pilot = page.locator('.services__grid .card').first();
      await pilot.screenshot({ path: path.join(OUT_DIR, `${name}-pilot-card.png`) });

      // Sanity asserts
      const cardCount = await page.locator('.services__grid .card').count();
      const illustrationCount = await page.locator('.service-illustration').count();
      const pilotHasModifier = await pilot.evaluate((el) => el.classList.contains('card--has-illustration'));
      console.log(`${name}: cards=${cardCount}, illustrations=${illustrationCount}, pilotHasModifier=${pilotHasModifier}`);
      await ctx.close();
    }

    await browser.close();
  } finally {
    server.kill('SIGTERM');
    await wait(300);
  }
  console.log('\nPhase 4 smoke check complete.');
  console.log(`Output: ${path.relative(REPO_ROOT, OUT_DIR)}`);
})().catch((e) => { console.error(e); process.exit(1); });
