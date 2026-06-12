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
    from: { email: bareFrom, name: extractDisplayName(from) },
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
  };
  if (replyTo) {
    message.reply = replyTo; // worker-mailer's field name for Reply-To
  }

  try {
    if (testMailer) {
      await testMailer.send(message);
    } else {
      const port = Number((env && env.SMTP_PORT) || DEFAULT_SMTP_PORT);
      const { WorkerMailer } = await import('worker-mailer');
      await WorkerMailer.send(
        {
          host: (env && env.SMTP_HOST) || DEFAULT_SMTP_HOST,
          port,
          // 465 = implicit TLS; 587 = plaintext upgrade via STARTTLS.
          secure: port === 465,
          startTls: port !== 465,
          credentials: { username, password },
          authType: ['login', 'plain'],
          socketTimeoutMs: SMTP_TIMEOUT_MS,
          responseTimeoutMs: SMTP_TIMEOUT_MS,
        },
        message
      );
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
