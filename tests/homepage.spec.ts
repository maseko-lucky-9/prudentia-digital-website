import { test, expect } from '@playwright/test';

test.describe('Homepage — static content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page title matches brand', async ({ page }) => {
    await expect(page).toHaveTitle(
      'Prudentia Digital — Enterprise Technology. Local Expertise, Global Reach.'
    );
  });

  test('hero section renders correctly', async ({ page }) => {
    await expect(page.locator('.hero__eyebrow')).toContainText(
      'Technology Consultancy · South Africa'
    );
    await expect(page.locator('h1.hero__headline')).toContainText('Enterprise-grade technology');
    await expect(page.locator('.hero__subtext')).toContainText('Full-stack delivery');
  });

  test('hero CTAs have correct links', async ({ page }) => {
    const viewServices = page.locator('.hero__ctas a', { hasText: 'View Services' });
    const getInTouch = page.locator('.hero__ctas a', { hasText: 'Get in Touch' });

    await expect(viewServices).toHaveAttribute('href', '#services');
    await expect(getInTouch).toHaveAttribute('href', /^mailto:/);
  });

  test('proof strip has 4 items', async ({ page }) => {
    await expect(page.locator('.proof__item')).toHaveCount(4);
  });

  test('services grid has 6 cards', async ({ page }) => {
    await expect(page.locator('.services__grid .card')).toHaveCount(6);
  });

  test('each service card has a title and tagline', async ({ page }) => {
    const cards = page.locator('.services__grid .card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.card__title')).not.toBeEmpty();
      await expect(card.locator('.card__tagline')).not.toBeEmpty();
    }
  });

  test('6th services card is AI Agent Engineering and links to /ai/', async ({ page }) => {
    const aiCard = page.locator('.services__grid .card--accent');
    await expect(aiCard).toHaveCount(1);
    await expect(aiCard.locator('.card__title')).toHaveText('AI Agent Engineering');
    await expect(aiCard.locator('.card__tagline')).toContainText('AI that finishes the job');

    const aiCardLink = page.locator('a.card-link[href="/ai/"]');
    await expect(aiCardLink).toHaveCount(1);
  });

  test('legacy "Government & Enterprise Tenders" card has been removed', async ({ page }) => {
    await expect(page.locator('.services__grid')).not.toContainText('Government & Enterprise Tenders');
  });

  test('footer copyright contains brand name', async ({ page }) => {
    await expect(page.locator('.footer__copy')).toContainText('Prudentia Digital');
  });

  test('nav logo links to home', async ({ page }) => {
    await expect(page.locator('a.nav__logo')).toHaveAttribute('href', '/');
  });

  test('favicon is declared', async ({ page }) => {
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href', /logo-icon\.svg/);
  });
});
