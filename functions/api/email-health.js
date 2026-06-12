/**
 * Cloudflare Pages Function — Token-gated email-wiring health probe.
 * Route: GET /api/email-health
 *
 * Purpose: lets /ship's verify step (and a human with the token) confirm
 * that Cloudflare Email Service is wired for prudentiadigital.co.za without
 * firing a real email. Reveals NO secrets.
 *
 * Auth:
 *   - Caller MUST send `X-Health-Token: <value>` matching env.HEALTH_TOKEN.
 *   - If env.HEALTH_TOKEN is unset/empty → 503 (endpoint not configured).
 *   - If token missing or mismatched → 401.
 *
 * Response (200, on auth pass):
 *   {
 *     bindingConfigured: bool,   // EMAIL send_email binding present on the Worker
 *     fromAddress: string,
 *     toAddress: string,
 *     autoAck: bool,             // SEND_AUTO_ACK flag (visitor receipt; needs Workers Paid)
 *     error: string|null
 *   }
 *
 * Note: domain onboarding status is NOT visible from the Worker runtime —
 * check it with `npx wrangler email sending list` / the dashboard. A send
 * attempt against an un-onboarded domain surfaces as queued:false with
 * error E_SENDER_NOT_VERIFIED in the EMAIL_DELIVERY_FAILURE log marker.
 *
 * Hard rules:
 *   - Whole handler wrapped in try/catch — uncaught throws never leak.
 *   - Cache-Control: no-store + X-Robots-Tag: noindex (belt + braces).
 */

const DEFAULT_TO_ADDRESS = 'masekolt@prudentiadigital.co.za';
const DEFAULT_FROM_ADDRESS = 'contact-form@prudentiadigital.co.za';

const headersJson = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: headersJson });

export async function onRequestGet(context) {
  const { request, env } = context;

  // ── Auth ──────────────────────────────────────────────────────────────
  const configuredToken = (env && env.HEALTH_TOKEN) || '';
  if (!configuredToken) {
    return json({ error: 'HEALTH_TOKEN not configured' }, 503);
  }
  const presented = request.headers.get('x-health-token') || '';
  if (presented !== configuredToken) {
    return json({ error: 'unauthorized' }, 401);
  }

  // ── Handler (catch-all-safe) ─────────────────────────────────────────
  try {
    return json({
      bindingConfigured: Boolean(env && env.EMAIL && typeof env.EMAIL.send === 'function'),
      fromAddress: (env && env.EMAIL_FROM_ADDRESS) || DEFAULT_FROM_ADDRESS,
      toAddress: (env && env.CONTACT_TO_ADDRESS) || DEFAULT_TO_ADDRESS,
      autoAck: Boolean(env && env.SEND_AUTO_ACK === 'true'),
      error: null,
    });
  } catch (err) {
    console.warn('email-health uncaught:', err && err.message);
    return json({
      bindingConfigured: false,
      fromAddress: DEFAULT_FROM_ADDRESS,
      toAddress: DEFAULT_TO_ADDRESS,
      autoAck: false,
      error: 'internal',
    });
  }
}
