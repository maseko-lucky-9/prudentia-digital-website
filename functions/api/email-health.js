/**
 * Cloudflare Pages Function — Token-gated email-wiring health probe.
 * Route: GET /api/email-health
 *
 * Purpose: lets /ship's verify step (and a human with the token) confirm
 * that the GoDaddy SMTP relay wiring (ADR-013) is configured WITHOUT firing
 * a real email. Reveals NO secrets.
 *
 * Auth:
 *   - Caller MUST send `X-Health-Token: <value>` matching env.HEALTH_TOKEN.
 *   - If env.HEALTH_TOKEN is unset/empty → 503 (endpoint not configured).
 *   - If token missing or mismatched → 401.
 *
 * Response (200, on auth pass):
 *   {
 *     smtpConfigured: bool,   // SMTP_USERNAME present AND SMTP_PASSWORD secret set
 *     fromAddress: string,
 *     toAddress: string,
 *     autoAck: bool,          // SEND_AUTO_ACK flag (visitor courtesy receipt)
 *     error: string|null
 *   }
 *
 * Note: relay reachability/auth is NOT probed here (that would open an SMTP
 * connection per health call). A live failure surfaces as queued:false with
 * error 'smtp-failed' under the EMAIL_DELIVERY_FAILURE log marker.
 *
 * Hard rules:
 *   - Whole handler wrapped in try/catch — uncaught throws never leak.
 *   - Cache-Control: no-store + X-Robots-Tag: noindex (belt + braces).
 */

const DEFAULT_TO_ADDRESS = 'masekolt@prudentiadigital.co.za';
const DEFAULT_FROM_ADDRESS = 'masekolt@prudentiadigital.co.za';

const headersJson = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: headersJson });

// Length-independent, content-constant-time string compare — avoids leaking the
// token byte-by-byte via response timing.
function timingSafeEqual(a, b) {
  const x = String(a);
  const y = String(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < x.length; i++) {
    diff |= x.charCodeAt(i) ^ y.charCodeAt(i % y.length);
  }
  return diff === 0;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  // ── Auth ──────────────────────────────────────────────────────────────
  const configuredToken = (env && env.HEALTH_TOKEN) || '';
  if (!configuredToken) {
    return json({ error: 'HEALTH_TOKEN not configured' }, 503);
  }
  const presented = request.headers.get('x-health-token') || '';
  if (!timingSafeEqual(presented, configuredToken)) {
    return json({ error: 'unauthorized' }, 401);
  }

  // ── Handler (catch-all-safe) ─────────────────────────────────────────
  try {
    return json({
      smtpConfigured: Boolean(env && env.SMTP_USERNAME && env.SMTP_PASSWORD),
      fromAddress: (env && env.EMAIL_FROM_ADDRESS) || DEFAULT_FROM_ADDRESS,
      toAddress: (env && env.CONTACT_TO_ADDRESS) || DEFAULT_TO_ADDRESS,
      autoAck: Boolean(env && env.SEND_AUTO_ACK === 'true'),
      error: null,
    });
  } catch (err) {
    console.warn('email-health uncaught:', err && err.message);
    return json({
      smtpConfigured: false,
      fromAddress: DEFAULT_FROM_ADDRESS,
      toAddress: DEFAULT_TO_ADDRESS,
      autoAck: false,
      error: 'internal',
    });
  }
}
