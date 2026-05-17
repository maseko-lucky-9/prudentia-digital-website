#!/usr/bin/env node
// Standalone baseline capture for the services section.
// Bypasses playwright.config webServer (port 3000/3001 are owned by other processes).
// Spins its own `npx serve` on PORT (default 4173) and uses chromium directly.

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4173);
const BASE_URL = `http://localhost:${PORT}`;
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'services-section');
const MEASURE_FILE = path.join(__dirname, 'above-fold-measurement.json');

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

async function startServer() {
  const proc = spawn('npx', ['serve', '-l', String(PORT), '.'], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('serve startup timeout')), 10000);
    proc.stdout.on('data', (chunk) => {
      if (String(chunk).includes('Accepting connections')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    proc.stderr.on('data', (chunk) => process.stderr.write(chunk));
    proc.on('error', reject);
  });
  return proc;
}

async function captureServices(page, filename) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const services = page.locator('#services');
  await services.scrollIntoViewIfNeeded();
  await wait(500);
  const outPath = path.join(SCREENSHOT_DIR, filename);
  await services.screenshot({ path: outPath });
  console.log(`  saved ${path.relative(REPO_ROOT, outPath)}`);
}

async function main() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  console.log(`Starting serve on :${PORT}…`);
  const server = await startServer();
  try {
    const browser = await chromium.launch();

    // mobile light
    {
      const ctx = await browser.newContext({ viewport: VIEWPORTS.mobile });
      const page = await ctx.newPage();
      console.log('mobile light:');
      await captureServices(page, 'mobile-light.png');
      await ctx.close();
    }

    // desktop light
    {
      const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop });
      const page = await ctx.newPage();
      console.log('desktop light:');
      await captureServices(page, 'desktop-light.png');
      await ctx.close();
    }

    // mobile dark (force .dark class)
    {
      const ctx = await browser.newContext({ viewport: VIEWPORTS.mobile });
      const page = await ctx.newPage();
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await wait(200);
      const services = page.locator('#services');
      await services.scrollIntoViewIfNeeded();
      await wait(500);
      console.log('mobile dark:');
      await services.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-dark.png') });
      console.log(`  saved ${path.relative(REPO_ROOT, path.join(SCREENSHOT_DIR, 'mobile-dark.png'))}`);
      await ctx.close();
    }

    // desktop dark
    {
      const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop });
      const page = await ctx.newPage();
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await wait(200);
      const services = page.locator('#services');
      await services.scrollIntoViewIfNeeded();
      await wait(500);
      console.log('desktop dark:');
      await services.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-dark.png') });
      console.log(`  saved ${path.relative(REPO_ROOT, path.join(SCREENSHOT_DIR, 'desktop-dark.png'))}`);
      await ctx.close();
    }

    // mobile reduced-motion
    {
      const ctx = await browser.newContext({
        viewport: VIEWPORTS.mobile,
        reducedMotion: 'reduce',
      });
      const page = await ctx.newPage();
      console.log('mobile reduced-motion:');
      await captureServices(page, 'mobile-reduced-motion.png');
      await ctx.close();
    }

    // above-fold measurement
    console.log('above-fold measurement:');
    const measurements = {};
    for (const [name, vp] of Object.entries(VIEWPORTS)) {
      const ctx = await browser.newContext({ viewport: vp });
      const page = await ctx.newPage();
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const scrollY = await page.evaluate(() => {
        const el = document.querySelector('#services');
        if (!el) return -1;
        const rect = el.getBoundingClientRect();
        return Math.round(rect.top + window.scrollY);
      });
      measurements[name] = {
        scrollY,
        viewportHeight: vp.height,
        aboveFold: scrollY > 0 && scrollY <= vp.height,
      };
      console.log(`  ${name} (${vp.width}x${vp.height}): scrollY=${scrollY}px, aboveFold=${measurements[name].aboveFold}`);
      await ctx.close();
    }
    await fs.writeFile(MEASURE_FILE, JSON.stringify(measurements, null, 2) + '\n');
    console.log(`  saved ${path.relative(REPO_ROOT, MEASURE_FILE)}`);

    await browser.close();
  } finally {
    server.kill('SIGTERM');
    await wait(300);
    if (!server.killed) server.kill('SIGKILL');
  }
  console.log('\nBaseline capture complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
