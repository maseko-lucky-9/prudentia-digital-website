/**
 * Cloudflare Pages Function — Contact Form Handler
 * Route: POST /contact-submit
 *
 * TODO: Forward to email API (Resend, Mailgun, SendGrid) or webhook
 *       once an email service is configured. Store API key in
 *       Cloudflare Pages environment variables.
 */

export async function onRequestPost(context) {
  const { request } = context;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid form data.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Honeypot check — if filled, silently succeed (bot detected)
  const honeypot = formData.get('_gotcha');
  if (honeypot) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate required fields
  const name = (formData.get('name') || '').trim();
  const email = (formData.get('email') || '').trim();
  const message = (formData.get('message') || '').trim();

  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ error: 'Name, email, and message are required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Basic email format check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return new Response(
      JSON.stringify({ error: 'Please provide a valid email address.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const company = (formData.get('company') || '').trim();

  // Log submission (replace with email API call in production)
  console.log('Contact form submission:', { name, email, company, message });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
