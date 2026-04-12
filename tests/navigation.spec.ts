import { test, expect } from '@playwright/test';

const NAV_HEIGHT = 68;

test.describe('Navigation — desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('desktop nav links are visible', async ({ page }) => {
    await expect(page.locator('.nav__links')).toBeVisible();
    await expect(page.locator('.nav__link', { hasText: 'Services' })).toBeVisible();
    await expect(page.locator('.nav__link', { hasText: 'Why Us' })).toBeVisible();
    await expect(page.locator('.nav__link', { hasText: 'About' })).toBeVisible();
  });

  test('hamburger is hidden on desktop', async ({ page }) => {
    await expect(page.locator('.nav__hamburger')).toBeHidden();
  });

  test('desktop CTA button is visible', async ({ page }) => {
    await expect(page.locator('.nav__cta')).toBeVisible();
    await expect(page.locator('.nav__cta')).toHaveAttribute('href', /^mailto:/);
  });

  test('nav gets scrolled class after hero', async ({ page }) => {
    const nav = page.locator('#nav');
    await expect(nav).not.toHaveClass(/scrolled/);

    // Scroll well past the hero
    await page.evaluate(() => window.scrollTo({ top: 1000 }));
    await expect(nav).toHaveClass(/scrolled/);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await expect(nav).not.toHaveClass(/scrolled/);
  });

  test('services anchor link does not hide section heading behind nav', async ({ page }) => {
    await page.locator('.nav__link', { hasText: 'Services' }).click();
    await page.waitForTimeout(600); // allow smooth scroll

    const servicesHeading = page.locator('#services-heading');
    const headingBox = await servicesHeading.boundingBox();
    expect(headingBox).not.toBeNull();
    // Heading top must be below nav bottom (68px)
    expect(headingBox!.y).toBeGreaterThan(NAV_HEIGHT);
  });
});

test.describe('Navigation — mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hamburger is visible on mobile', async ({ page }) => {
    await expect(page.locator('.nav__hamburger')).toBeVisible();
  });

  test('desktop nav links are hidden on mobile', async ({ page }) => {
    await expect(page.locator('.nav__links')).toBeHidden();
  });

  test('hamburger opens and closes mobile menu', async ({ page }) => {
    const hamburger = page.locator('#navToggle');
    const mobileMenu = page.locator('#navMobile');

    // Initially closed
    await expect(mobileMenu).toBeHidden();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    // Open
    await hamburger.click();
    await expect(mobileMenu).toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');

    // Close
    await hamburger.click();
    await expect(mobileMenu).toBeHidden();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking a mobile menu link closes the menu', async ({ page }) => {
    const hamburger = page.locator('#navToggle');
    const mobileMenu = page.locator('#navMobile');

    await hamburger.click();
    await expect(mobileMenu).toBeVisible();

    await mobileMenu.locator('a', { hasText: 'Services' }).click();
    await expect(mobileMenu).toBeHidden();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });
});
