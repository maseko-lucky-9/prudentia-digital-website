#!/usr/bin/env node
/**
 * Phase 8 sustained-perf probe.
 *
 * Six continuous loops + always-on means we need to verify the page stays at
 * 60fps under load. Lighthouse doesn't catch this (its perf scores measure
 * load, not sustained interaction). Approach: scroll services into view, hold
 * for 10s, sample requestAnimationFrame deltas via PerformanceObserver, then
 * assert that ≥ 95% of frames render within 16.67ms (60fps budget).
 *
 * Gate: pass when frames_under_16_67ms / total_frames ≥ 0.95.
 */

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TARGET_FRAME_RATIO = 0.95;
const FRAME_BUDGET_MS = 16.67;
const SAMPLE_DURATION_MS = 10_000;

async function startServer() {
  const proc = spawn('npx', ['serve', '-l', String(PORT), '.'], {
    cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('serve timeout')), 10_000);
    proc.stdout.on('data', (c) => {
      if (String(c).includes('Accepting')) { clearTimeout(t); resolve(); }
    });
    proc.on('error', reject);
  });
  return proc;
}

(async () => {
  const server = await startServer();
  let exitCode = 0;
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
      await wait(500); // let .is-playing land

      const stats = await page.evaluate(async (sampleMs) => {
        const deltas = [];
        let last = performance.now();
        return new Promise((resolve) => {
          let raf;
          const tick = (now) => {
            deltas.push(now - last);
            last = now;
            if (now - deltas[0] < sampleMs || deltas.length < 30) {
              raf = requestAnimationFrame(tick);
            } else {
              const total = deltas.length;
              const within = deltas.filter((d) => d <= 16.67).length;
              const max = Math.max(...deltas);
              const p95 = deltas.sort((a, b) => a - b)[Math.floor(deltas.length * 0.95)];
              resolve({ total, within, max, p95 });
            }
          };
          requestAnimationFrame((start) => { last = start; raf = requestAnimationFrame(tick); });
          setTimeout(() => { if (raf) cancelAnimationFrame(raf); }, sampleMs + 1000);
        });
      }, SAMPLE_DURATION_MS);

      const ratio = stats.within / stats.total;
      const status = ratio >= TARGET_FRAME_RATIO ? '✓' : '✗';
      console.log(
        `${status} ${name}: ${stats.within}/${stats.total} frames ≤ ${FRAME_BUDGET_MS}ms ` +
        `(${(ratio * 100).toFixed(1)}%) · max=${stats.max.toFixed(1)}ms · p95=${stats.p95.toFixed(1)}ms`
      );
      if (ratio < TARGET_FRAME_RATIO) exitCode = 1;

      await ctx.close();
    }
    await browser.close();
  } finally {
    server.kill('SIGTERM');
    await wait(300);
  }
  process.exit(exitCode);
})().catch((e) => { console.error(e); process.exit(1); });
