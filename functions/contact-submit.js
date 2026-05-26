/**
 * Cloudflare Pages Function — Contact Form Handler
 * Route: POST /contact-submit
 *
 * Pipeline:
 *   1. Parse multipart form
 *   2. Honeypot check (silent 200)
 *   3. Validate every field against allow-lists
 *   4. Optional per-IP rate limit (requires FORM_RATELIMIT KV binding; graceful degrade)
 *   5. Send via Resend HTTP API (requires RESEND_API_KEY; graceful degrade to log-only)
 *   6. Always return { ok: true, queued: <bool> } on success path
 *      — no error oracle for attackers; users always see in-page success.
 *
 * Environment variables (set in Cloudflare Pages → Settings → Environment vars,
 * BOTH Production and Preview):
 *   RESEND_API_KEY            required to send
 *   RESEND_FROM_ADDRESS       optional; defaults to onboarding@resend.dev (Resend test sender)
 *                             update to contact-form@prudentiadigital.co.za once DNS verified
 *   CONTACT_TO_ADDRESS        optional; defaults to masekolt@prudentiadigital.co.za
 *
 * Optional bindings:
 *   FORM_RATELIMIT  KV namespace for per-IP throttle (5 submissions / 10 min)
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

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const DEFAULT_TO_ADDRESS = 'masekolt@prudentiadigital.co.za';
const DEFAULT_FROM_ADDRESS = 'onboarding@resend.dev';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

async function checkRateLimit(env, clientIp) {
  if (!env.FORM_RATELIMIT || !clientIp) return { allowed: true };
  try {
    const key = `rl:${clientIp}`;
    const current = parseInt((await env.FORM_RATELIMIT.get(key)) || '0', 10);
    if (current >= RATE_LIMIT_MAX) {
      return { allowed: false, count: current };
    }
    await env.FORM_RATELIMIT.put(key, String(current + 1), {
      expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
    });
    return { allowed: true, count: current + 1 };
  } catch (err) {
    console.warn('Rate-limit KV error (allowing request):', err && err.message);
    return { allowed: true };
  }
}

function buildEmailBodies(payload) {
  const lines = [
    ['Name', payload.name],
    ['Email', payload.email],
    ['Website', payload.website || '—'],
    ['Services', payload.services.join(', ')],
    ['Timeline', payload.timeline],
    ['Budget', payload.budget],
    ['Topic', payload.topic || '—'],
    ['Submitted at', payload.submittedAt],
    ['User-Agent', payload.userAgent || '—'],
    ['Client IP', payload.clientIp || '—'],
  ];

  const text =
    'New Get Started inquiry from prudentiadigital.co.za\n\n' +
    lines.map(([k, v]) => `${k}: ${v}`).join('\n') +
    '\n\nChallenge:\n' +
    payload.challenge;

  const html =
    '<h2 style="font-family:Inter,Arial,sans-serif;color:#0D1B2A">' +
    'New Get Started inquiry' +
    '</h2>' +
    '<table cellpadding="6" style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#0D1B2A;border-collapse:collapse">' +
    lines
      .map(
        ([k, v]) =>
          `<tr><td style="font-weight:600;vertical-align:top;border-bottom:1px solid #eee">${escapeHtml(k)}</td>` +
          `<td style="vertical-align:top;border-bottom:1px solid #eee">${escapeHtml(v)}</td></tr>`
      )
      .join('') +
    '</table>' +
    '<h3 style="font-family:Inter,Arial,sans-serif;color:#0D1B2A;margin-top:24px">Challenge</h3>' +
    `<p style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#0D1B2A;white-space:pre-wrap">${escapeHtml(payload.challenge)}</p>`;

  return { text, html };
}

async function sendViaResend(env, payload) {
  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: 'no-api-key' };
  }

  const fromAddress = env.RESEND_FROM_ADDRESS || DEFAULT_FROM_ADDRESS;
  const toAddress = env.CONTACT_TO_ADDRESS || DEFAULT_TO_ADDRESS;
  const { text, html } = buildEmailBodies(payload);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Prudentia Digital <${fromAddress}>`,
        to: [toAddress],
        reply_to: payload.email,
        subject: payload.subject || 'New Get Started inquiry from prudentiadigital.co.za',
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errBody = (await response.text()).slice(0, 200);
      console.warn(`Resend ${response.status}: ${errBody}`);
      return { sent: false, reason: `resend-${response.status}` };
    }

    return { sent: true };
  } catch (err) {
    console.warn('Resend network error:', err && err.message);
    return { sent: false, reason: 'network-error' };
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Invalid form data.' }, 400);
  }

  // Honeypot — bots that fill _gotcha get a silent 200.
  if (formData.get('_gotcha')) {
    return json({ ok: true, queued: false });
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

  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    null;
  const userAgent = request.headers.get('user-agent') || null;

  // Rate-limit per IP (graceful degrade if KV not bound)
  const rate = await checkRateLimit(env, clientIp);
  if (!rate.allowed) {
    console.warn(`Rate-limit hit for ${clientIp} (count=${rate.count})`);
    // Silent success to avoid feedback to abusers
    return json({ ok: true, queued: false });
  }

  const payload = {
    name,
    email,
    website,
    services,
    timeline,
    budget,
    challenge,
    topic,
    subject,
    submittedAt: new Date().toISOString(),
    clientIp,
    userAgent,
  };

  console.log('Get Started submission:', {
    name,
    email,
    services,
    timeline,
    budget,
    topic,
    clientIp,
  });

  const result = await sendViaResend(env, payload);

  return json({ ok: true, queued: result.sent });
}
