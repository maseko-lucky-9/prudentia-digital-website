import { test, expect } from '@playwright/test';

test.describe('AI page — /ai/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai/');
  });

  test('page title and canonical are AI-specific', async ({ page }) => {
    await expect(page).toHaveTitle(/AI Agent Engineering.*Prudentia Digital/);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://prudentiadigital.co.za/ai/');
  });

  test('hero positions AI as solving business problems, not chatbots', async ({ page }) => {
    await expect(page.locator('h1.hero__headline')).toContainText('AI that solves');
    await expect(page.locator('h1.hero__headline')).toContainText('business problems');
    await expect(page.locator('h1.hero__headline')).toContainText('not chatbots');
  });

  test('all 5 capability sections render', async ({ page }) => {
    const capabilities = page.locator('.ai-capability');
    await expect(capabilities).toHaveCount(5);

    const expectedIds = ['cap-agents', 'cap-rag', 'cap-evals', 'cap-vector', 'cap-mcp'];
    for (const id of expectedIds) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('each capability has problem, solution, use case, stack, and CTA', async ({ page }) => {
    const capabilities = page.locator('.ai-capability');
    const count = await capabilities.count();

    for (let i = 0; i < count; i++) {
      const cap = capabilities.nth(i);
      await expect(cap.locator('.ai-capability__problem')).toContainText('problem');
      await expect(cap.locator('.ai-capability__solution')).toContainText('What we build');
      await expect(cap.locator('.ai-capability__use-case')).toContainText('use case');
      await expect(cap.locator('.ai-capability__stack')).toContainText('Under the hood');
      await expect(cap.locator('.ai-capability__cta a')).toBeVisible();
    }
  });

  test('every capability CTA links to /?topic=ai-*#contact', async ({ page }) => {
    const ctas = page.locator('.ai-capability__cta a');
    const count = await ctas.count();
    expect(count).toBe(5);

    const seenTopics = new Set<string>();
    for (let i = 0; i < count; i++) {
      const href = await ctas.nth(i).getAttribute('href');
      expect(href).toMatch(/^\/\?topic=ai-[a-z-]+#contact$/);
      const topic = href!.match(/topic=([a-z-]+)/)![1];
      seenTopics.add(topic);
    }
    expect(seenTopics).toEqual(
      new Set(['ai-agent-loop', 'ai-rag', 'ai-evals', 'ai-vector', 'ai-mcp'])
    );
  });

  test('"How we ship" approach section has 6 cards', async ({ page }) => {
    await expect(page.locator('#approach .services__grid .card')).toHaveCount(6);
  });

  test('prompt engineering foundation note is present', async ({ page }) => {
    const panel = page.locator('.prompt-foundation__panel');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('table stakes');
  });

  test('FAQ has 6 items answering buyer questions', async ({ page }) => {
    const items = page.locator('.faq__item');
    await expect(items).toHaveCount(6);

    const expectedQuestions = [
      /How long does an AI engagement take/,
      /Do you sign NDAs/,
      /Where does our data live/,
      /What does pricing look like/,
      /Can we self-host/,
      /What if the model vendor/,
    ];
    for (let i = 0; i < expectedQuestions.length; i++) {
      await expect(items.nth(i).locator('.faq__question')).toHaveText(expectedQuestions[i]);
    }
  });

  test('about blurb cross-links to home team section', async ({ page }) => {
    const link = page.locator('.about-blurb a[href="/#team"]');
    await expect(link).toBeVisible();
  });

  test('no public demo links or Coming Soon badges anywhere on the page', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).not.toContainText(/Coming Soon/i);
    await expect(body).not.toContainText(/View Demo/i);
  });

  test('final CTA encourages booking a strategy session', async ({ page }) => {
    const finalCta = page.locator('#final-cta');
    await expect(finalCta).toContainText(/Book a 30-minute strategy session/i);
    const bookBtn = finalCta.locator('a.btn--accent');
    await expect(bookBtn).toHaveAttribute('href', '/?topic=ai-general#contact');
  });

  test('JSON-LD Service structured data is present', async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(scripts.length).toBeGreaterThanOrEqual(2);
    const hasService = scripts.some((s) => s.includes('"@type": "Service"') && s.includes('AI Agent Engineering'));
    const hasFaq = scripts.some((s) => s.includes('"@type": "FAQPage"'));
    expect(hasService).toBe(true);
    expect(hasFaq).toBe(true);
  });

  test('OG meta has page-specific title and absolute image URL', async ({ page }) => {
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /AI Agent Engineering/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://prudentiadigital.co.za/ai/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/.+\.(png|webp)$/);
  });

  test('navigation back to home works (logo + footer)', async ({ page }) => {
    await expect(page.locator('a.nav__logo')).toHaveAttribute('href', '/');
    await expect(page.locator('a.footer__logo')).toHaveAttribute('href', '/');
  });

  test('mobile viewport (375px) renders hero without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/ai/');
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasOverflow).toBe(false);
    await expect(page.locator('h1.hero__headline')).toBeVisible();
  });
});

test.describe('Contact prefill from ?topic= param', () => {
  test('navigating to /?topic=ai-rag#contact prefills subject, services, and challenge', async ({ page }) => {
    await page.goto('/?topic=ai-rag#contact');
    await page.waitForLoadState('domcontentloaded');

    const subject = page.locator('#contactForm input[name="_subject"]');
    await expect(subject).toHaveValue(/AI Agent Engineering.*Production RAG/);

    const topicField = page.locator('#contactForm input[name="topic"]');
    await expect(topicField).toHaveValue('ai-rag');

    const aiService = page.locator('#contactForm input[name="services"][value="ai-engineering"]');
    await expect(aiService).toBeChecked();

    const challenge = page.locator('#contactForm #ctaChallenge');
    await expect(challenge).toHaveValue(/RAG over our private documents/);
  });

  test('unknown topic value does not modify the form', async ({ page }) => {
    await page.goto('/?topic=bogus-value#contact');
    await page.waitForLoadState('domcontentloaded');

    const subject = page.locator('#contactForm input[name="_subject"]');
    await expect(subject).toHaveValue('New Get Started inquiry from prudentiadigital.co.za');
  });
});
