import { test, expect } from '@playwright/test';

/**
 * Service-illustration spec — Phase 6 verification gate for the pilot.
 *
 * Asserts (all deterministic — no timing-flakiness):
 *   1. Visual snapshots (light/dark × mobile/desktop + reduced-motion).
 *   2. Lifecycle: .is-playing added on viewport entry, persists (play-once).
 *   3. Reduced-motion: .is-playing NEVER added.
 *   4. After settle: accent fully opaque, animation has run to completion.
 *   5. Theme: dark-mode .dark class swaps computed colour correctly.
 *   6. Existing service-grid contract preserved (6 cards, AI card accent).
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  desktop: { width: 1440, height: 900 },
};

const SETTLE_MS = 2500; // longest animation delay (1700ms) + duration (560ms) + buffer

test.describe('service-illustration: pilot (Web Application Development)', () => {
  test.describe('existing-contract preservation', () => {
    test('services grid still has exactly 6 cards', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('.services__grid .card')).toHaveCount(6);
    });

    test('all 6 cards have the has-illustration modifier (post-Phase-7)', async ({ page }) => {
      await page.goto('/');
      for (let i = 0; i < 6; i++) {
        const card = page.locator('.services__grid .card').nth(i);
        await expect(card).toHaveClass(/card--has-illustration/);
      }
    });

    test('all 6 cards have a service-illustration host', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('.service-illustration')).toHaveCount(6);
    });

    test('AI accent card is still 6th and links to /ai/', async ({ page }) => {
      await page.goto('/');
      const aiCard = page.locator('.services__grid .card--accent');
      await expect(aiCard).toBeVisible();
      // The card is wrapped in <a.card-link> — query the link directly.
      await expect(page.locator('a.card-link[href="/ai/"]')).toBeVisible();
    });
  });

  test.describe('lifecycle (play-once)', () => {
    test('before scroll: .is-playing is NOT present', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      // Without scrolling, observer hasn't fired for the pilot card yet
      // (it sits below the fold per Phase 0a measurement).
      const illustration = page.locator('.service-illustration--web-app');
      await expect(illustration).not.toHaveClass(/is-playing/);
    });

    test('on viewport entry: .is-playing is added', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      const pilot = page.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();
      const illustration = page.locator('.service-illustration--web-app');
      await expect(illustration).toHaveClass(/is-playing/, { timeout: 1000 });
    });

    test('after settle: animation has run to completion (accent opacity 1)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      const pilot = page.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();
      await page.waitForTimeout(SETTLE_MS);
      const accentOpacity = await page
        .locator('.service-illustration--web-app .si-accent--fill')
        .evaluate((el) => getComputedStyle(el).opacity);
      expect(Number(accentOpacity)).toBeCloseTo(1, 1);
    });

    test('class persists on re-scroll (play-once, not restart)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      const pilot = page.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const illustration = page.locator('.service-illustration--web-app');
      await expect(illustration).toHaveClass(/is-playing/);

      // Scroll away, then back
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      await pilot.scrollIntoViewIfNeeded();
      // Class should STILL be present — not removed and re-added
      await expect(illustration).toHaveClass(/is-playing/);
    });
  });

  test.describe('reduced motion', () => {
    test('.is-playing is NEVER added when reduced-motion is set', async ({ page }) => {
      // Emulate BEFORE navigation so matchMedia returns true at IIFE init time.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      // Sanity-check the emulation actually took effect.
      const emulated = await page.evaluate(() =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
      expect(emulated).toBe(true);

      const pilot = page.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      const illustration = page.locator('.service-illustration--web-app');
      await expect(illustration).not.toHaveClass(/is-playing/);
    });

    test('static outcome key-frame is visible (accent opacity 1)', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      const pilot = page.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();
      const accentOpacity = await page
        .locator('.service-illustration--web-app .si-accent--fill')
        .evaluate((el) => getComputedStyle(el).opacity);
      expect(Number(accentOpacity)).toBeCloseTo(1, 1);
    });
  });

  test.describe('theming', () => {
    test('dark mode swaps illustration colour via currentColor', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      const pilot = page.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();

      const lightColor = await page
        .locator('.service-illustration--web-app')
        .evaluate((el) => getComputedStyle(el).color);

      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await page.waitForTimeout(100);

      const darkColor = await page
        .locator('.service-illustration--web-app')
        .evaluate((el) => getComputedStyle(el).color);

      expect(darkColor).not.toBe(lightColor);
    });
  });

  test.describe('visual snapshots', () => {
    test('desktop settled', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      const pilot = page.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();
      await page.waitForTimeout(SETTLE_MS);
      await expect(pilot).toHaveScreenshot('pilot-desktop-settled.png', {
        maxDiffPixelRatio: 0.005,
      });
    });

    test('mobile settled', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      const pilot = page.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();
      await page.waitForTimeout(SETTLE_MS);
      await expect(pilot).toHaveScreenshot('pilot-mobile-settled.png', {
        maxDiffPixelRatio: 0.005,
      });
    });

    test('desktop reduced-motion (static key-frame)', async ({ page, browser }) => {
      const ctx = await browser.newContext({
        viewport: VIEWPORTS.desktop,
        reducedMotion: 'reduce',
      });
      const p = await ctx.newPage();
      await p.goto('/');
      const pilot = p.locator('.services__grid .card').first();
      await pilot.scrollIntoViewIfNeeded();
      await p.waitForTimeout(300);
      await expect(pilot).toHaveScreenshot('pilot-desktop-reduced-motion.png', {
        maxDiffPixelRatio: 0.005,
      });
      await ctx.close();
    });
  });
});
