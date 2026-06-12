/**
 * functions/_lib/sendEmail.js
 *
 * Shared Cloudflare Email Service sender used by every Pages Function that
 * needs to dispatch transactional email from prudentiadigital.co.za.
 *
 * Uses the native `send_email` Worker binding (env.EMAIL) — no API key, no
 * third-party vendor. The from-domain must be onboarded to Email Sending
 * (npx wrangler email sending enable prudentiadigital.co.za).
 *
 * Design goals (unchanged from the Resend era — same return contract):
 *   - Never throws; caller decides on retry/log.
 *   - Graceful degrade when the EMAIL binding is missing (returns queued:false).
 *   - Guard: refuses to send unless the from address is on prudentiadigital.co.za
 *     (anything else would be rejected by Email Sending as an unverified sender).
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
 *   // status is always null with the binding (no HTTP layer); kept for contract stability.
 */

const ALLOWED_DOMAIN_SUFFIX = '@prudentiadigital.co.za';

/**
 * Send a transactional email via the Cloudflare Email Service binding. Never throws.
 *
 * @param {object} args
 * @param {object} args.env       Worker env (must contain the EMAIL send_email binding).
 * @param {string} args.from      Sender address (raw or `Name <addr>` form).
 * @param {string|string[]} args.to  Recipient(s).
 * @param {string} [args.replyTo] Optional reply-to.
 * @param {string} args.subject   Email subject.
 * @param {string} args.html      HTML body.
 * @param {string} args.text      Plaintext body.
 * @returns {Promise<{queued: boolean, status: number|null, error: string|null, id: string|null}>}
 */
export async function sendEmail({ env, from, to, replyTo, subject, html, text }) {
  if (!env || !env.EMAIL || typeof env.EMAIL.send !== 'function') {
    return {
      queued: false,
      status: null,
      error: 'EMAIL binding missing',
      id: null,
    };
  }

  const bareFrom = extractBareAddress(from);
  if (!bareFrom.endsWith(ALLOWED_DOMAIN_SUFFIX)) {
    return {
      queued: false,
      status: null,
      error: `from-address guard: ${bareFrom} not on prudentiadigital.co.za`,
      id: null,
    };
  }

  try {
    const message = {
      to: Array.isArray(to) ? to : [to],
      from: { email: bareFrom, name: extractDisplayName(from) },
      subject,
      text,
      html,
    };
    if (replyTo) {
      message.replyTo = replyTo;
    }

    const response = await env.EMAIL.send(message);

    return {
      queued: true,
      status: null,
      error: null,
      id: response && typeof response.messageId === 'string' ? response.messageId : null,
    };
  } catch (err) {
    // Binding errors carry an E_* code (E_SENDER_NOT_VERIFIED, E_RECIPIENT_NOT_ALLOWED,
    // E_DAILY_LIMIT_EXCEEDED, …). Message may echo addresses — redact before logging.
    const code = err && typeof err.code === 'string' ? err.code : 'send-failed';
    console.warn(`sendEmail ${code}: ${redactEmails(err && err.message)}`);
    return {
      queued: false,
      status: null,
      error: code,
      id: null,
    };
  }
}

function extractBareAddress(fromHeader) {
  // Matches `Name <addr@host>` or just `addr@host`.
  const m = String(fromHeader || '').match(/<([^>]+)>\s*$/);
  return m ? m[1].trim() : String(fromHeader || '').trim();
}

function extractDisplayName(fromHeader) {
  const s = String(fromHeader || '');
  const m = s.match(/^(.*?)<[^>]+>\s*$/);
  const name = m ? m[1].trim() : '';
  return name || 'Prudentia Digital';
}

function redactEmails(str) {
  return String(str || '').replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[redacted-email]');
}
