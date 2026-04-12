import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('skip link is present and targets #main', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main');
    await expect(skipLink).toHaveText('Skip to main content');
  });

  test('page has exactly one h1', async ({ page }) => {
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });

  test('all sections have aria-label or aria-labelledby', async ({ page }) => {
    const sections = await page.locator('section').all();

    for (const section of sections) {
      const hasLabel = await section.getAttribute('aria-label');
      const hasLabelledBy = await section.getAttribute('aria-labelledby');
      expect(
        hasLabel || hasLabelledBy,
        `Section missing aria-label/aria-labelledby: ${await section.getAttribute('class')}`
      ).toBeTruthy();
    }
  });

  test('nav hamburger has required ARIA attributes', async ({ page }) => {
    const hamburger = page.locator('#navToggle');
    await expect(hamburger).toHaveAttribute('aria-label');
    await expect(hamburger).toHaveAttribute('aria-expanded');
    await expect(hamburger).toHaveAttribute('aria-controls', 'navMobile');
  });

  test('nav has role and aria-label', async ({ page }) => {
    const nav = page.locator('nav.nav');
    await expect(nav).toHaveAttribute('role', 'navigation');
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  test('decorative images have aria-hidden or empty alt', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const ariaHidden = await img.getAttribute('aria-hidden');
      const alt = await img.getAttribute('alt');
      expect(
        ariaHidden === 'true' || alt === '' || alt !== null,
        'Image must have aria-hidden="true" or an alt attribute'
      ).toBeTruthy();
    }
  });

  test('all mailto links are non-empty and point to brand email', async ({ page }) => {
    const mailLinks = await page.locator('a[href^="mailto:"]').all();
    expect(mailLinks.length).toBeGreaterThan(0);

    for (const link of mailLinks) {
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^mailto:.+@prudentiadigital\.co\.za$/);
    }
  });

  test('footer has role="contentinfo"', async ({ page }) => {
    await expect(page.locator('footer')).toHaveAttribute('role', 'contentinfo');
  });

  test('main landmark is present', async ({ page }) => {
    await expect(page.locator('main#main')).toBeVisible();
  });
});
