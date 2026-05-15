/**
 * Cloudflare Pages Function — Contact Form Handler
 * Route: POST /contact-submit
 *
 * Sends contact-form submissions via Resend.
 *
 * Required env var (set in Cloudflare Pages → Settings → Environment variables,
 * both Production and Preview):
 *   RESEND_API_KEY — API key from resend.com. The sending domain
 *                    prudentiadigital.co.za must be verified in Resend.
 *
 * Returns:
 *   200  { ok: true }              — email dispatched
 *   400  { error: string }         — validation failure
 *   500  { error: string }         — RESEND_API_KEY missing
 *   502  { error: string }         — Resend API error or network failure
 */

// Allow-listed topic tags emitted by /ai/ page CTAs (see js/contact-prefill.js).
// Keep in sync with that file when adding capabilities.
const ALLOWED_TOPICS = new Set([
  'ai-general',
  'ai-agent-loop',
  'ai-rag',
  'ai-evals',
  'ai-vector',
  'ai-mcp',
]);

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Parse form data first so an honest bot still gets a fast 400.
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid form data.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Honeypot — silently succeed for bots.
  if (formData.get('_gotcha')) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Required-field validation.
  const name = (formData.get('name') || '').trim();
  const email = (formData.get('email') || '').trim();
  const message = (formData.get('message') || '').trim();

  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ error: 'Name, email, and message are required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return new Response(
      JSON.stringify({ error: 'Please provide a valid email address.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const company = (formData.get('company') || '').trim();
  const rawTopic = (formData.get('topic') || '').trim();
  const topic = ALLOWED_TOPICS.has(rawTopic) ? rawTopic : null;
  const subject = (formData.get('_subject') || '').trim() ||
    'New inquiry from prudentiadigital.co.za';

  // 4. Guard: API key must exist. Returning 500 surfaces the misconfiguration
  // instead of silently dropping the lead.
  if (!env || !env.RESEND_API_KEY) {
    console.error('contact-submit: RESEND_API_KEY is not configured');
    return new Response(
      JSON.stringify({
        error:
          'Email delivery is temporarily unavailable. Please email masekolt@prudentiadigital.co.za directly.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 5. Compose the plain-text body.
  const lines = [
    'New inquiry from prudentiadigital.co.za',
    '',
    `Name:    ${name}`,
    `Email:   ${email}`,
  ];
  if (company) lines.push(`Company: ${company}`);
  if (topic) lines.push(`Topic:   ${topic}`);
  lines.push('', 'Message:', message);
  const textBody = lines.join('\n');

  // 6. POST to Resend.
  let resendResponse;
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'notifications@prudentiadigital.co.za',
        to: ['masekolt@prudentiadigital.co.za'],
        reply_to: email,
        subject,
        text: textBody,
      }),
    });
  } catch (networkError) {
    console.error('contact-submit: network error reaching Resend:', networkError);
    return new Response(
      JSON.stringify({
        error:
          'Email delivery failed due to a network error. Please try again or email masekolt@prudentiadigital.co.za directly.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!resendResponse.ok) {
    let detail = null;
    try {
      detail = await resendResponse.json();
    } catch {
      // body wasn't JSON; ignore
    }
    console.error(
      `contact-submit: Resend returned ${resendResponse.status}`,
      detail
    );
    return new Response(
      JSON.stringify({
        error:
          'Email delivery failed. Please try again or email masekolt@prudentiadigital.co.za directly.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  console.log('contact-submit: dispatched', { name, email, company, topic, subject });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
