/**
 * Cloudflare Pages Function — Token-gated email-wiring health probe.
 * Route: GET /api/email-health
 *
 * Purpose: lets /ship's verify step (and a human with the token) confirm
 * that Resend is properly wired for prudentiadigital.co.za without firing
 * a real email. Reveals NO secrets and NO other domains' status.
 *
 * Auth:
 *   - Caller MUST send `X-Health-Token: <value>` matching env.HEALTH_TOKEN.
 *   - If env.HEALTH_TOKEN is unset/empty → 503 (endpoint not configured).
 *   - If token missing or mismatched → 401.
 *
 * Response (200, on auth pass):
 *   {
 *     apiKeyConfigured: bool,
 *     fromAddress: string,
 *     toAddress: string,
 *     resendReachable: bool,
 *     resendStatus: number|null,
 *     prudentiaDomainStatus: "verified"|"not_started"|"pending"|"failure"|null,
 *     error: string|null
 *   }
 *
 * Hard rules:
 *   - Whole handler wrapped in try/catch — uncaught throws never leak.
 *   - 5s AbortController timeout on the Resend /domains call.
 *   - Cache-Control: no-store + X-Robots-Tag: noindex (belt + braces).
 *   - prudentiaDomainStatus is filtered to ONLY the prudentiadigital.co.za
 *     entry — other domains in the user's Resend account are never exposed.
 */

const DEFAULT_TO_ADDRESS = 'masekolt@prudentiadigital.co.za';
const DEFAULT_FROM_ADDRESS = 'onboarding@resend.dev';
const RESEND_DOMAINS_ENDPOINT = 'https://api.resend.com/domains';
const PRUDENTIA_DOMAIN = 'prudentiadigital.co.za';
const FETCH_TIMEOUT_MS = 5000;

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
    const apiKeyConfigured = Boolean(env && env.RESEND_API_KEY);
    const fromAddress = (env && env.RESEND_FROM_ADDRESS) || DEFAULT_FROM_ADDRESS;
    const toAddress = (env && env.CONTACT_TO_ADDRESS) || DEFAULT_TO_ADDRESS;

    if (!apiKeyConfigured) {
      return json({
        apiKeyConfigured: false,
        fromAddress,
        toAddress,
        resendReachable: false,
        resendStatus: null,
        prudentiaDomainStatus: null,
        error: null,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(RESEND_DOMAINS_ENDPOINT, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      const reason = err && err.name === 'AbortError' ? 'timeout' : 'network-error';
      return json({
        apiKeyConfigured: true,
        fromAddress,
        toAddress,
        resendReachable: false,
        resendStatus: null,
        prudentiaDomainStatus: null,
        error: reason,
      });
    }
    clearTimeout(timeoutId);

    const resendStatus = response.status;
    const resendReachable = response.ok;

    let prudentiaDomainStatus = null;
    if (resendReachable) {
      try {
        const body = await response.json();
        // Resend wraps the list under `data` on the /domains endpoint.
        const list = Array.isArray(body) ? body : Array.isArray(body && body.data) ? body.data : [];
        const entry = list.find(
          (d) =>
            d &&
            typeof d.name === 'string' &&
            d.name.toLowerCase() === PRUDENTIA_DOMAIN
        );
        if (entry && typeof entry.status === 'string') {
          // Normalise common Resend statuses; pass through any unknown value.
          prudentiaDomainStatus = entry.status;
        }
      } catch {
        // Body parse failure — surface as reachable but unknown status.
      }
    }

    return json({
      apiKeyConfigured: true,
      fromAddress,
      toAddress,
      resendReachable,
      resendStatus,
      prudentiaDomainStatus,
      error: resendReachable ? null : `resend-${resendStatus}`,
    });
  } catch (err) {
    console.warn('email-health uncaught:', err && err.message);
    return json({
      apiKeyConfigured: Boolean(env && env.RESEND_API_KEY),
      fromAddress: (env && env.RESEND_FROM_ADDRESS) || DEFAULT_FROM_ADDRESS,
      toAddress: (env && env.CONTACT_TO_ADDRESS) || DEFAULT_TO_ADDRESS,
      resendReachable: false,
      resendStatus: null,
      prudentiaDomainStatus: null,
      error: 'internal',
    });
  }
}
