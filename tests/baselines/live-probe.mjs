#!/usr/bin/env node
// Live-site probe — open prudentiadigital.co.za and report on illustration state.

import { chromium } from '@playwright/test';
import { setTimeout as wait } from 'node:timers/promises';

const URL = 'https://prudentiadigital.co.za/';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    // Explicitly DON'T set reducedMotion — match a default user
  });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

  await page.goto(URL, { waitUntil: 'networkidle' });

  // 1. matchMedia state — is reduced-motion accidentally true?
  const reducedMotion = await page.evaluate(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // 2. animated-bg.js loaded and ran?
  const jsRan = await page.evaluate(() => !!document.querySelector('.card-pulse'));

  // 3. Scroll to services + check is-playing
  const services = page.locator('#services');
  await services.scrollIntoViewIfNeeded();
  await wait(800);

  const illustrationStates = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.service-illustration')).map((el) => ({
      cls: el.className,
      isPlaying: el.classList.contains('is-playing'),
      ariaHidden: el.getAttribute('aria-hidden'),
    }));
  });

  // 4. Sample a known animated element — is the CSS animation actually running?
  const animationProbe = await page.evaluate(() => {
    const el = document.querySelector('.service-illustration--web-app .si-accent--fill');
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    return {
      found: true,
      animationName: cs.animationName,
      animationDuration: cs.animationDuration,
      animationIterationCount: cs.animationIterationCount,
      animationPlayState: cs.animationPlayState,
      opacity: cs.opacity,
    };
  });

  // 5. cardIo presence — is the .in-view class showing on cards?
  const inViewCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.card-pulse')).map((el) => ({
      hasInView: el.classList.contains('in-view'),
    }));
  });

  // 6. Network failures?
  const cssOk = await page.evaluate(async () => {
    try {
      const r = await fetch('/css/service-illustrations.css');
      return { status: r.status, size: (await r.text()).length };
    } catch (e) { return { error: String(e) }; }
  });

  console.log(JSON.stringify({
    url: URL,
    reducedMotion,
    jsRan,
    illustrationStates,
    animationProbe,
    inViewCards,
    cssOk,
    consoleErrors,
  }, null, 2));

  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
