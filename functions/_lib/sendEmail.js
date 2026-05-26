/**
 * functions/_lib/sendEmail.js
 *
 * Shared Resend HTTP-API sender used by every Pages Function that needs
 * to dispatch transactional email from prudentiadigital.co.za.
 *
 * Design goals:
 *   - Never throws; caller decides on retry/log.
 *   - 5s AbortController timeout on the Resend fetch.
 *   - Graceful degrade when RESEND_API_KEY is missing (returns queued:false).
 *   - Best-effort guard: refuses to send if RESEND_FROM_ADDRESS is explicitly
 *     set AND doesn't end in @prudentiadigital.co.za. The fallback
 *     onboarding@resend.dev (used when RESEND_FROM_ADDRESS is unset) is
 *     exempt — that's Resend's universal test sender and must always work
 *     during the pre-verification window.
 *
 * Usage:
 *   import { sendEmail } from '../_lib/sendEmail.js';
 *   const result = await sendEmail({
 *     env,
 *     from: 'Prudentia Digital <contact-form@prudentiadigital.co.za>',
 *     to: 'masekolt@prudentiadigital.co.za',
 *     replyTo: submitterEmail,
 *     subject: '…',
 *     html: '…',
 *     text: '…',
 *   });
 *   // result = { queued: bool, status: number|null, error: string|null, id: string|null }
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FETCH_TIMEOUT_MS = 5000;
const FALLBACK_FROM = 'onboarding@resend.dev';
const ALLOWED_DOMAIN_SUFFIX = '@prudentiadigital.co.za';

/**
 * Send a transactional email via Resend. Never throws.
 *
 * @param {object} args
 * @param {object} args.env       Cloudflare Pages env (must contain RESEND_API_KEY).
 * @param {string} args.from      Sender address (raw or `Name <addr>` form).
 * @param {string|string[]} args.to  Recipient(s).
 * @param {string} [args.replyTo] Optional reply-to.
 * @param {string} args.subject   Email subject.
 * @param {string} args.html      HTML body.
 * @param {string} args.text      Plaintext body.
 * @returns {Promise<{queued: boolean, status: number|null, error: string|null, id: string|null}>}
 */
export async function sendEmail({ env, from, to, replyTo, subject, html, text }) {
  if (!env || !env.RESEND_API_KEY) {
    return {
      queued: false,
      status: null,
      error: 'RESEND_API_KEY missing',
      id: null,
    };
  }

  // Extract bare address from "Name <addr@example>" form for the guard check.
  const bareFrom = extractBareAddress(from);

  // Best-effort guard: if RESEND_FROM_ADDRESS is explicitly set, it must be on
  // our verified domain. The unset fallback (onboarding@resend.dev) is exempt.
  if (
    env.RESEND_FROM_ADDRESS &&
    bareFrom !== FALLBACK_FROM &&
    !bareFrom.endsWith(ALLOWED_DOMAIN_SUFFIX)
  ) {
    return {
      queued: false,
      status: null,
      error: `from-address guard: ${bareFrom} not on prudentiadigital.co.za`,
      id: null,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const body = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    };
    if (replyTo) {
      body.reply_to = replyTo;
    }

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await safeReadText(response);
      console.warn(`sendEmail Resend ${response.status}: ${errText}`);
      return {
        queued: false,
        status: response.status,
        error: `resend-${response.status}`,
        id: null,
      };
    }

    let id = null;
    try {
      const json = await response.json();
      id = json && typeof json.id === 'string' ? json.id : null;
    } catch {
      // Body parse failure is non-fatal — Resend accepted the request.
    }

    return { queued: true, status: response.status, error: null, id };
  } catch (err) {
    clearTimeout(timeoutId);
    const reason = err && err.name === 'AbortError' ? 'timeout' : 'network-error';
    console.warn(`sendEmail ${reason}:`, err && err.message);
    return {
      queued: false,
      status: null,
      error: reason,
      id: null,
    };
  }
}

function extractBareAddress(fromHeader) {
  // Matches `Name <addr@host>` or just `addr@host`.
  const m = String(fromHeader || '').match(/<([^>]+)>\s*$/);
  return m ? m[1].trim() : String(fromHeader || '').trim();
}

async function safeReadText(response) {
  try {
    const t = await response.text();
    return t.slice(0, 200);
  } catch {
    return '<unreadable>';
  }
}
