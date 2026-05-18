import { test, expect } from '@playwright/test';

test.describe('Get Started wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
  });

  test('initial state shows step 1 with progress 1/6', async ({ page }) => {
    await expect(page.locator('.cta__progress-label')).toContainText('1/6');
    await expect(page.locator('.cta__progress')).toHaveAttribute('aria-valuenow', '1');
    await expect(page.locator('[data-step="1"]')).toBeVisible();
    await expect(page.locator('[data-step="2"]')).toBeHidden();
    await expect(page.locator('#ctaBack')).toBeHidden();
    await expect(page.locator('#ctaSubmit')).toBeHidden();
  });

  test('Next advances only when current step is valid', async ({ page }) => {
    await page.locator('#ctaNext').click();
    // Step 1 has required name/email — still on step 1.
    await expect(page.locator('[data-step="1"]')).toBeVisible();
    await expect(page.locator('.cta__progress-label')).toContainText('1/6');

    await page.locator('#ctaName').fill('Test User');
    await page.locator('#ctaEmail').fill('test@example.com');
    await page.locator('#ctaNext').click();

    await expect(page.locator('[data-step="2"]')).toBeVisible();
    await expect(page.locator('.cta__progress-label')).toContainText('2/6');
  });

  test('services step requires at least one checkbox', async ({ page }) => {
    await page.locator('#ctaName').fill('Test User');
    await page.locator('#ctaEmail').fill('test@example.com');
    await page.locator('#ctaNext').click();
    // Step 2 (optional website) — skip.
    await page.locator('#ctaNext').click();

    await expect(page.locator('[data-step="3"]')).toBeVisible();
    await page.locator('#ctaNext').click();
    // No service selected — still on step 3.
    await expect(page.locator('[data-step="3"]')).toBeVisible();
    await expect(page.locator('.cta__progress-label')).toContainText('3/6');

    await page.locator('input[name="services"][value="ai-engineering"]').check();
    await page.locator('#ctaNext').click();
    await expect(page.locator('[data-step="4"]')).toBeVisible();
  });

  test('Back retains prior selections', async ({ page }) => {
    await page.locator('#ctaName').fill('Test User');
    await page.locator('#ctaEmail').fill('test@example.com');
    await page.locator('#ctaNext').click();
    await page.locator('#ctaWebsite').fill('https://example.com');
    await page.locator('#ctaNext').click();
    await page.locator('input[name="services"][value="software-dev"]').check();
    await page.locator('input[name="services"][value="ai-engineering"]').check();
    await page.locator('#ctaNext').click();

    await expect(page.locator('[data-step="4"]')).toBeVisible();
    await page.locator('#ctaBack').click();

    await expect(page.locator('[data-step="3"]')).toBeVisible();
    await expect(page.locator('input[name="services"][value="software-dev"]')).toBeChecked();
    await expect(page.locator('input[name="services"][value="ai-engineering"]')).toBeChecked();
  });

  test('successful 6-step submission posts expected FormData keys', async ({ page, context }) => {
    let capturedBody = '';
    let routeHit = false;
    await context.route(/contact-submit/, async (route) => {
      routeHit = true;
      capturedBody = route.request().postData() || '';
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await page.locator('#ctaName').fill('Test User');
    await page.locator('#ctaEmail').fill('test@example.com');
    await page.locator('#ctaNext').click();

    await page.locator('#ctaWebsite').fill('https://example.com');
    await page.locator('#ctaNext').click();

    await page.locator('input[name="services"][value="ai-engineering"]').check();
    await page.locator('#ctaNext').click();

    await page.locator('input[name="timeline"][value="1-3m"]').check();
    await page.locator('#ctaNext').click();

    await page.locator('#ctaChallenge').fill('We need to ship an AI agent loop for ticket triage.');
    await page.locator('#ctaNext').click();

    await page.locator('input[name="budget"][value="75-150k"]').check();
    await expect(page.locator('#ctaSubmit')).toBeVisible();
    await page.locator('#ctaSubmit').click();

    await expect(page.locator('#ctaFeedback')).toHaveClass(/success/);
    await expect(page.locator('#ctaFeedback')).toContainText('within 24 hours');

    expect(routeHit).toBe(true);
    for (const key of ['name="name"', 'name="email"', 'name="website"', 'name="services"', 'name="timeline"', 'name="challenge"', 'name="budget"']) {
      expect(capturedBody).toContain(key);
    }
  });

  test('honeypot is present and off-screen', async ({ page }) => {
    const honeypot = page.locator('input[name="_gotcha"]');
    await expect(honeypot).toHaveCount(1);
    // Off-screen via .cta__honeypot positioning — bots fill it, humans don't.
    const box = await honeypot.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeLessThan(-100);
  });

  test('?topic=ai-rag pre-checks AI Engineering and prefills challenge', async ({ page }) => {
    await page.goto('/?topic=ai-rag#contact');
    // Walk to step 3.
    await page.locator('#ctaName').fill('Test User');
    await page.locator('#ctaEmail').fill('test@example.com');
    await page.locator('#ctaNext').click();
    await page.locator('#ctaNext').click();
    await expect(page.locator('input[name="services"][value="ai-engineering"]')).toBeChecked();
    // Skip to step 5.
    await page.locator('#ctaNext').click();
    await page.locator('input[name="timeline"][value="exploring"]').check();
    await page.locator('#ctaNext').click();
    await expect(page.locator('#ctaChallenge')).toHaveValue(/RAG/);

    const topicInput = page.locator('input[name="topic"]');
    await expect(topicInput).toHaveValue('ai-rag');
  });
});
