#!/usr/bin/env node
// Phase 7 smoke — capture all 6 cards after settle, on both viewports.

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(__dirname, 'screenshots', 'phase7-all-six');

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

    for (const [name, vp] of [
      ['desktop', { width: 1440, height: 900 }],
      ['mobile', { width: 375, height: 812 }],
    ]) {
      const ctx = await browser.newContext({ viewport: vp });
      const page = await ctx.newPage();
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      const services = page.locator('#services');
      await services.scrollIntoViewIfNeeded();
      // Wait long enough for all play-once animations to settle (~2.5s)
      // AND for the AI loop to be visible at its outcome peak.
      await wait(3500);
      await services.screenshot({ path: path.join(OUT_DIR, `${name}-services-full.png`) });

      // Individual card shots
      for (let i = 0; i < 6; i++) {
        const card = page.locator('.services__grid .card').nth(i);
        const label = await card.evaluate((el) => {
          const t = el.querySelector('.card__title');
          return t ? t.textContent.trim().toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '') : `card-${i}`;
        });
        await card.screenshot({ path: path.join(OUT_DIR, `${name}-${i+1}-${label}.png`) });
      }
      console.log(`${name}: captured services + 6 cards`);
      await ctx.close();
    }

    await browser.close();
  } finally {
    server.kill('SIGTERM');
    await wait(300);
  }
  console.log('\nPhase 7 smoke complete. Output:', path.relative(REPO_ROOT, OUT_DIR));
})().catch((e) => { console.error(e); process.exit(1); });
