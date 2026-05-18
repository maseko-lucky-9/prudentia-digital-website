import { test, expect } from '@playwright/test';

test.describe('Get Started single-page form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
  });

  test('all 6 field groups visible on initial load', async ({ page }) => {
    await expect(page.locator('#ctaName')).toBeVisible();
    await expect(page.locator('#ctaEmail')).toBeVisible();
    await expect(page.locator('#ctaWebsite')).toBeVisible();
    await expect(page.locator('input[name="services"]').first()).toBeAttached();
    await expect(page.locator('input[name="timeline"]').first()).toBeAttached();
    await expect(page.locator('#ctaChallenge')).toBeVisible();
    await expect(page.locator('input[name="budget"]').first()).toBeAttached();
    await expect(page.locator('#ctaSubmit')).toBeVisible();
  });

  test('sidebar shows progress, checklist, email callout', async ({ page }) => {
    await expect(page.locator('.cta__progress-panel')).toBeVisible();
    await expect(page.locator('.cta__checklist li')).toHaveCount(4);
    await expect(page.locator('.cta__email-callout a')).toHaveAttribute('href', /mailto:masekolt/);
  });

  test('progress reads 0/6 on load, advances per filled group', async ({ page }) => {
    await expect(page.locator('#ctaProgressStep')).toHaveText('0');
    await expect(page.locator('.cta__progress-bar')).toHaveAttribute('aria-valuenow', '0');

    await page.locator('#ctaName').fill('Test User');
    await page.locator('#ctaName').blur();
    await expect(page.locator('#ctaProgressStep')).toHaveText('1');

    await page.locator('#ctaEmail').fill('test@example.com');
    await page.locator('#ctaEmail').blur();
    await expect(page.locator('#ctaProgressStep')).toHaveText('2');

    await page.locator('input[name="services"][value="ai-engineering"]').evaluate((el: HTMLInputElement) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
    await expect(page.locator('#ctaProgressStep')).toHaveText('3');

    await page.locator('input[name="timeline"][value="1-3m"]').evaluate((el: HTMLInputElement) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
    await expect(page.locator('#ctaProgressStep')).toHaveText('4');

    await page.locator('#ctaChallenge').fill('Build an AI triage agent.');
    await expect(page.locator('#ctaProgressStep')).toHaveText('5');

    await page.locator('input[name="budget"][value="75-150k"]').evaluate((el: HTMLInputElement) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
    await expect(page.locator('#ctaProgressStep')).toHaveText('6');
    await expect(page.locator('.cta__progress-bar')).toHaveAttribute('aria-valuenow', '6');
  });

  test('inline error appears when services empty on submit', async ({ page }) => {
    await page.locator('#ctaName').fill('Test User');
    await page.locator('#ctaEmail').fill('test@example.com');
    await page.locator('input[name="timeline"][value="asap"]').evaluate((el: HTMLInputElement) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.locator('#ctaChallenge').fill('Some challenge.');
    await page.locator('input[name="budget"][value="lt-25k"]').evaluate((el: HTMLInputElement) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });

    await page.locator('#ctaSubmit').click();

    await expect(page.locator('.cta__error[data-error-for="services"]')).toBeVisible();
    await page.locator('input[name="services"][value="software-dev"]').evaluate((el: HTMLInputElement) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
    await expect(page.locator('.cta__error[data-error-for="services"]')).toBeHidden();
  });

  test('successful submission replaces form panel with confirmation', async ({ context, page }) => {
    let routeHit = false;
    let capturedBody = '';
    await context.route(/contact-submit/, async (route) => {
      routeHit = true;
      capturedBody = route.request().postData() || '';
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await page.locator('#ctaName').fill('Test User');
    await page.locator('#ctaEmail').fill('test@example.com');
    await page.locator('input[name="services"][value="ai-engineering"]').evaluate((el: HTMLInputElement) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.locator('input[name="timeline"][value="1-3m"]').evaluate((el: HTMLInputElement) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.locator('#ctaChallenge').fill('Build an AI agent.');
    await page.locator('input[name="budget"][value="75-150k"]').evaluate((el: HTMLInputElement) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.locator('#ctaSubmit').click();

    await expect(page.locator('.cta__success')).toBeVisible();
    await expect(page.locator('.cta__success h3')).toHaveText('Thank you!');
    expect(routeHit).toBe(true);
    for (const key of ['name="name"', 'name="email"', 'name="services"', 'name="timeline"', 'name="challenge"', 'name="budget"']) {
      expect(capturedBody).toContain(key);
    }
  });

  test('honeypot field present and off-screen', async ({ page }) => {
    const honeypot = page.locator('input[name="_gotcha"]');
    await expect(honeypot).toHaveCount(1);
    const box = await honeypot.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeLessThan(-100);
  });

  test('?topic=ai-rag prefills AI Engineering chip and challenge, progress reflects it', async ({ page }) => {
    await page.goto('/?topic=ai-rag#contact');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('input[name="services"][value="ai-engineering"]')).toBeChecked();
    await expect(page.locator('#ctaChallenge')).toHaveValue(/RAG/);
    const step = await page.locator('#ctaProgressStep').textContent();
    expect(Number(step)).toBeGreaterThanOrEqual(2);
  });

  test('mobile viewport: form panel renders before sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/#contact');

    const formY = (await page.locator('.cta__form-panel').boundingBox())!.y;
    const sidebarY = (await page.locator('.cta__sidebar').boundingBox())!.y;
    expect(formY).toBeLessThan(sidebarY);
  });
});
