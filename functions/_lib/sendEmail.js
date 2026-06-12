/**
 * functions/_lib/sendEmail.js
 *
 * Shared transactional-email sender for prudentiadigital.co.za, delivered via
 * the GoDaddy/Titan SMTP relay (smtpout.secureserver.net) that the business
 * already pays for — using the `worker-mailer` SMTP client over Cloudflare
 * TCP sockets (requires `nodejs_compat` compatibility flag; port 25 is
 * blocked on Workers, 465/587 are allowed). See ADR-013.
 *
 * GoDaddy's relay only accepts mail FROM the authenticated mailbox, so the
 * from address must be SMTP_USERNAME (masekolt@prudentiadigital.co.za);
 * reply-to carries the visitor's address. Apex SPF already includes
 * secureserver.net, so SPF/DMARC alignment holds with zero DNS changes.
 *
 * Design goals (same return contract since the Resend era):
 *   - Never throws; caller decides on retry/log.
 *   - Graceful degrade when SMTP credentials are missing (returns queued:false).
 *   - Guard: refuses to send unless the from address is on prudentiadigital.co.za.
 *   - Test seam: when env.TEST_MAILER (object with .send) is present it is used
 *     instead of a real SMTP connection — mirrors the old env.EMAIL mock seam.
 *
 * Usage:
 *   import { sendEmail } from '../_lib/sendEmail.js';
 *   const result = await sendEmail({
 *     env,
 *     from: 'Prudentia Digital <masekolt@prudentiadigital.co.za>',
 *     to: 'masekolt@prudentiadigital.co.za',
 *     replyTo: submitterEmail,
 *     subject: '…',
 *     html: '…',
 *     text: '…',
 *   });
 *   // result = { queued: bool, status: number|null, error: string|null, id: string|null }
 *   // status/id are always null over SMTP; kept for contract stability.
 */

const DEFAULT_SMTP_HOST = 'smtpout.secureserver.net';
const DEFAULT_SMTP_PORT = 465;
const SMTP_TIMEOUT_MS = 10000;
const ALLOWED_DOMAIN_SUFFIX = '@prudentiadigital.co.za';
// The relay host must stay on GoDaddy's domain — a misconfigured/overridden
// SMTP_HOST var must never exfiltrate the mailbox password to another server.
const ALLOWED_SMTP_HOST_SUFFIX = '.secureserver.net';

/**
 * Build the WorkerMailer.connect options from env. Extracted (and exported) so
 * the secure/startTls-per-port logic is unit-testable without cloudflare:sockets.
 * Returns null if SMTP_HOST is not a GoDaddy relay (defense-in-depth guard).
 * @param {object} env
 * @param {{username: string, password: string}} credentials
 */
export function buildSmtpOptions(env, credentials) {
  const host = (env && env.SMTP_HOST) || DEFAULT_SMTP_HOST;
  if (host !== DEFAULT_SMTP_HOST && !host.endsWith(ALLOWED_SMTP_HOST_SUFFIX)) {
    return null;
  }
  const port = Number((env && env.SMTP_PORT) || DEFAULT_SMTP_PORT);
  return {
    host,
    port,
    // 465 = implicit TLS; 587 = plaintext upgrade via STARTTLS.
    secure: port === 465,
    startTls: port !== 465,
    credentials,
    authType: ['login', 'plain'],
    socketTimeoutMs: SMTP_TIMEOUT_MS,
    responseTimeoutMs: SMTP_TIMEOUT_MS,
  };
}

/**
 * Send a transactional email via the GoDaddy SMTP relay. Never throws.
 *
 * @param {object} args
 * @param {object} args.env       Worker env (SMTP_USERNAME var + SMTP_PASSWORD secret).
 * @param {string} args.from      Sender address (raw or `Name <addr>` form).
 * @param {string|string[]} args.to  Recipient(s).
 * @param {string} [args.replyTo] Optional reply-to.
 * @param {string} args.subject   Email subject.
 * @param {string} args.html      HTML body.
 * @param {string} args.text      Plaintext body.
 * @returns {Promise<{queued: boolean, status: number|null, error: string|null, id: string|null}>}
 */
export async function sendEmail({ env, from, to, replyTo, subject, html, text }) {
  const testMailer =
    env && env.TEST_MAILER && typeof env.TEST_MAILER.send === 'function'
      ? env.TEST_MAILER
      : null;
  const username = (env && env.SMTP_USERNAME) || '';
  const password = (env && env.SMTP_PASSWORD) || '';

  if (!testMailer && (!username || !password)) {
    return {
      queued: false,
      status: null,
      error: 'SMTP credentials missing',
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

  const message = {
    from: { email: bareFrom, name: stripHeader(extractDisplayName(from)) },
    to: Array.isArray(to) ? to : [to],
    // Belt-and-braces: callers already sanitise, but never let CR/LF reach a
    // header field even if a new call site forgets.
    subject: stripHeader(subject),
    text,
    html,
  };
  if (replyTo) {
    message.reply = stripHeader(replyTo); // worker-mailer's field name for Reply-To
  }

  try {
    if (testMailer) {
      await testMailer.send(message);
    } else {
      const options = buildSmtpOptions(env, { username, password });
      if (!options) {
        console.warn('sendEmail smtp-failed: SMTP_HOST not a secureserver.net relay');
        return { queued: false, status: null, error: 'smtp-host-not-allowed', id: null };
      }
      const { WorkerMailer } = await import('worker-mailer');
      await WorkerMailer.send(options, message);
    }
    return { queued: true, status: null, error: null, id: null };
  } catch (err) {
    // SMTP errors can echo addresses — redact before logging. The caller emits
    // the EMAIL_DELIVERY_FAILURE alert marker; this line is detail only.
    console.warn(`sendEmail smtp-failed: ${redactEmails(err && err.message)}`);
    return {
      queued: false,
      status: null,
      error: 'smtp-failed',
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

// Collapse CR/LF to a space and drop other control chars so a value can never
// inject an extra SMTP header. Applied to every header-bound field as
// defense-in-depth (printable text -- incl. spaces/hyphens -- is preserved).
function stripHeader(value) {
  return String(value || '')
    .replace(/[\r\n]+/g, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}
