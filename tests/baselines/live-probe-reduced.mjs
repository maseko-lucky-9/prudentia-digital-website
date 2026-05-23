#!/usr/bin/env node
// Test the live site WITH reduced-motion to confirm what the user sees if their OS has it on.
import { chromium } from '@playwright/test';
import { setTimeout as wait } from 'node:timers/promises';
const URL = 'https://prudentiadigital.co.za/';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',   // ← THIS is the question
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  const services = page.locator('#services');
  await services.scrollIntoViewIfNeeded();
  await wait(1000);

  const result = await page.evaluate(() => {
    const hosts = Array.from(document.querySelectorAll('.service-illustration')).map((el) => ({
      cls: el.className.split(' ').filter(c => c.startsWith('service-illustration--'))[0],
      isPlaying: el.classList.contains('is-playing'),
    }));
    const probe = (() => {
      const el = document.querySelector('.service-illustration--web-app .si-accent--fill');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        animationName: cs.animationName,
        animationPlayState: cs.animationPlayState,
        opacity: cs.opacity,
      };
    })();
    return {
      reducedMotionMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      hosts,
      probe,
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
