/**
 * Cloudflare Pages Function — Contact Form Handler
 * Route: POST /contact-submit
 *
 * Accepts the 6-step "Get Started" wizard payload from index.html.
 *
 * TODO: Forward to email API (Resend, Mailgun, SendGrid) or webhook
 *       once an email service is configured. Store API key in
 *       Cloudflare Pages environment variables.
 */

const ALLOWED_SERVICES = new Set([
  'software-dev',
  'cloud-devops',
  'ai-engineering',
  'advisory',
]);

const ALLOWED_TIMELINES = new Set(['asap', '1-3m', '3-6m', 'exploring']);

const ALLOWED_BUDGETS = new Set([
  'lt-25k',
  '25-75k',
  '75-150k',
  '150k-plus',
]);

const ALLOWED_TOPICS = new Set([
  'ai-general',
  'ai-agent-loop',
  'ai-rag',
  'ai-evals',
  'ai-vector',
  'ai-mcp',
]);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestPost(context) {
  const { request } = context;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Invalid form data.' }, 400);
  }

  // Honeypot — bots that fill _gotcha get a silent 200.
  if (formData.get('_gotcha')) {
    return json({ ok: true });
  }

  const name = (formData.get('name') || '').trim();
  const email = (formData.get('email') || '').trim();
  const website = (formData.get('website') || '').trim();
  const challenge = (formData.get('challenge') || '').trim();
  const timeline = (formData.get('timeline') || '').trim();
  const budget = (formData.get('budget') || '').trim();
  const services = formData
    .getAll('services')
    .map((s) => String(s).trim())
    .filter(Boolean);

  if (!name || !email || !challenge || !timeline || !budget || services.length === 0) {
    return json({ error: 'Please complete every required step before submitting.' }, 400);
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return json({ error: 'Please provide a valid email address.' }, 400);
  }

  if (website && !/^https?:\/\//i.test(website)) {
    return json({ error: 'Website URL must start with http:// or https://.' }, 400);
  }

  if (!services.every((s) => ALLOWED_SERVICES.has(s))) {
    return json({ error: 'Unknown service selection.' }, 400);
  }

  if (!ALLOWED_TIMELINES.has(timeline)) {
    return json({ error: 'Unknown timeline selection.' }, 400);
  }

  if (!ALLOWED_BUDGETS.has(budget)) {
    return json({ error: 'Unknown budget selection.' }, 400);
  }

  const rawTopic = (formData.get('topic') || '').trim();
  const topic = ALLOWED_TOPICS.has(rawTopic) ? rawTopic : null;

  const subject = (formData.get('_subject') || '').trim();

  // Log submission. Until the email-API TODO above is closed, Cloudflare Pages
  // > Functions > Logs is the only delivery channel.
  console.log('Get Started submission:', {
    name,
    email,
    website: website || null,
    services,
    timeline,
    challenge,
    budget,
    topic,
    subject,
  });

  return json({ ok: true });
}
