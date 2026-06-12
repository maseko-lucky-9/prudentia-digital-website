/**
 * Worker-level regression tests for the contact-form handler.
 *
 * Guards the exact bug this change set fixes: the form returns HTTP 200 with
 * { ok: true } whether or not the email was actually sent, so a UI/Playwright
 * test (which only sees `ok`) is structurally blind to a delivery failure.
 * These tests assert the `queued` contract and the failure-marker behaviour
 * directly, with no Cloudflare runtime — only Node 20 globals and the
 * env.TEST_MAILER seam (stands in for the GoDaddy SMTP relay; see ADR-013).
 *
 * Run: npm run test:worker   (node --test)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { onRequestPost } from '../../functions/contact-submit.js';
import { sendEmail, buildSmtpOptions } from '../../functions/_lib/sendEmail.js';

const COMPANY = 'masekolt@prudentiadigital.co.za';

function validForm(overrides = {}) {
  const fd = new FormData();
  fd.set('name', 'Test User');
  fd.set('email', 'visitor@example.com');
  fd.set('challenge', 'We need help shipping faster.');
  fd.set('timeline', 'exploring');
  fd.set('budget', 'lt-25k');
  fd.append('services', 'software-dev');
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

function makeRequest(fd) {
  return new Request('https://prudentiadigital.co.za/contact-submit', {
    method: 'POST',
    body: fd,
  });
}

// Build a mocked SMTP transport for the env.TEST_MAILER seam. `impl`
// resolves/rejects each send() call; every message is recorded.
function mockMailer(impl = async () => {}) {
  const sent = [];
  return {
    sent,
    mailer: {
      async send(message) {
        sent.push(message);
        return impl(message);
      },
    },
  };
}

// Run `fn` with console.error/warn captured.
async function withConsoleCapture(fn) {
  const calls = { error: [], warn: [] };
  const origError = console.error;
  const origWarn = console.warn;
  console.error = (...a) => calls.error.push(a);
  console.warn = (...a) => calls.warn.push(a);
  try {
    return await fn(calls);
  } finally {
    console.error = origError;
    console.warn = origWarn;
  }
}

const marker = (calls, name) => calls.error.concat(calls.warn).some((a) => a[0] === name);

test('no SMTP credentials → {ok:true, queued:false}, logs EMAIL_DELIVERY_FAILURE', async () => {
  await withConsoleCapture(async (calls) => {
    const res = await onRequestPost({ request: makeRequest(validForm()), env: {} });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.deepEqual(body, { ok: true, queued: false });
    assert.ok(marker(calls, 'EMAIL_DELIVERY_FAILURE'), 'expected the page-worthy failure marker');
  });
});

test('SMTP send ok → {ok:true, queued:true}; primary self-send with visitor reply-to', async () => {
  const { sent, mailer } = mockMailer();
  await withConsoleCapture(async (calls) => {
    const res = await onRequestPost({
      request: makeRequest(validForm()),
      env: { TEST_MAILER: mailer },
    });
    const body = await res.json();
    assert.deepEqual(body, { ok: true, queued: true });
    assert.ok(!marker(calls, 'EMAIL_DELIVERY_FAILURE'), 'no failure marker on success');
    assert.equal(sent.length, 1, 'only the primary email without SEND_AUTO_ACK');
    assert.deepEqual(sent[0].to, [COMPANY]);
    assert.equal(sent[0].from.email, COMPANY, 'GoDaddy relay: from = authenticated mailbox');
    assert.equal(sent[0].reply, 'visitor@example.com');
  });
});

test('SEND_AUTO_ACK="true" → primary + visitor ack both sent', async () => {
  const { sent, mailer } = mockMailer();
  await withConsoleCapture(async () => {
    const res = await onRequestPost({
      request: makeRequest(validForm()),
      env: { TEST_MAILER: mailer, SEND_AUTO_ACK: 'true' },
    });
    const body = await res.json();
    assert.deepEqual(body, { ok: true, queued: true });
    assert.equal(sent.length, 2, 'primary + auto-ack');
    assert.deepEqual(sent[1].to, ['visitor@example.com']);
    assert.equal(sent[1].reply, COMPANY);
  });
});

test('SMTP throw → {ok:true, queued:false} + failure marker with smtp-failed', async () => {
  const { mailer } = mockMailer(async () => {
    throw new Error('535 authentication failed for visitor@example.com');
  });
  await withConsoleCapture(async (calls) => {
    const res = await onRequestPost({
      request: makeRequest(validForm()),
      env: { TEST_MAILER: mailer },
    });
    const body = await res.json();
    assert.deepEqual(body, { ok: true, queued: false });
    const failure = calls.error.find((a) => a[0] === 'EMAIL_DELIVERY_FAILURE');
    assert.ok(failure, 'expected the page-worthy failure marker');
    assert.equal(failure[1].error, 'smtp-failed');
  });
});

test('honeypot _gotcha → silent {ok:true, queued:false}, never sends', async () => {
  const { sent, mailer } = mockMailer();
  await withConsoleCapture(async () => {
    const res = await onRequestPost({
      request: makeRequest(validForm({ _gotcha: 'i-am-a-bot' })),
      env: { TEST_MAILER: mailer },
    });
    const body = await res.json();
    assert.deepEqual(body, { ok: true, queued: false });
    assert.equal(sent.length, 0, 'honeypot must short-circuit before any send');
  });
});

test('invalid payload → 400 with an error, never sends', async () => {
  const { sent, mailer } = mockMailer();
  await withConsoleCapture(async () => {
    const res = await onRequestPost({
      request: makeRequest(validForm({ email: 'not-an-email' })),
      env: { TEST_MAILER: mailer },
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.ok(body.error, 'expected a validation error message');
    assert.equal(sent.length, 0);
  });
});

test('sendEmail() without credentials returns queued:false (no throw)', async () => {
  const r = await sendEmail({
    env: {},
    from: `Prudentia Digital <${COMPANY}>`,
    to: COMPANY,
    subject: 's',
    html: '<p>h</p>',
    text: 't',
  });
  assert.equal(r.queued, false);
  assert.equal(r.error, 'SMTP credentials missing');
});

test('sendEmail() refuses off-domain from address before any send', async () => {
  const { sent, mailer } = mockMailer();
  const r = await sendEmail({
    env: { TEST_MAILER: mailer },
    from: 'Spoof <attacker@evil.example>',
    to: COMPANY,
    subject: 's',
    html: '<p>h</p>',
    text: 't',
  });
  assert.equal(r.queued, false);
  assert.match(r.error, /from-address guard/);
  assert.equal(sent.length, 0);
});

test('CRLF in _subject is stripped before it reaches the Subject header', async () => {
  const { sent, mailer } = mockMailer();
  await withConsoleCapture(async () => {
    await onRequestPost({
      request: makeRequest(validForm({ _subject: 'Hello\r\nBcc: attacker@evil.com' })),
      env: { TEST_MAILER: mailer },
    });
    assert.equal(sent.length, 1);
    // The security property is "no CR/LF reaches the header" — the injected
    // text survives only as inert inline subject content (harmless without newlines).
    assert.ok(!/[\r\n]/.test(sent[0].subject), 'subject must contain no CR/LF');
    assert.equal(sent[0].subject, 'Hello Bcc: attacker@evil.com');
  });
});

test('buildSmtpOptions: port 465 → implicit TLS, 587 → STARTTLS', () => {
  const creds = { username: 'u', password: 'p' };
  const o465 = buildSmtpOptions({ SMTP_PORT: '465' }, creds);
  assert.equal(o465.port, 465);
  assert.equal(o465.secure, true);
  assert.equal(o465.startTls, false);
  assert.deepEqual(o465.authType, ['login', 'plain']);
  assert.equal(o465.credentials, creds);

  const o587 = buildSmtpOptions({ SMTP_HOST: 'smtp.secureserver.net', SMTP_PORT: '587' }, creds);
  assert.equal(o587.port, 587);
  assert.equal(o587.secure, false);
  assert.equal(o587.startTls, true);
});

test('buildSmtpOptions: rejects a non-secureserver.net host (credential-exfil guard)', () => {
  assert.equal(buildSmtpOptions({ SMTP_HOST: 'attacker-smtp.example.com' }, {}), null);
  // default host is allowed
  assert.ok(buildSmtpOptions({}, {}));
});

test('sendEmail refuses to connect when SMTP_HOST is off-allowlist', async () => {
  const r = await sendEmail({
    env: { SMTP_USERNAME: 'masekolt@prudentiadigital.co.za', SMTP_PASSWORD: 'pw', SMTP_HOST: 'evil.example.com' },
    from: 'Prudentia Digital <masekolt@prudentiadigital.co.za>',
    to: 'masekolt@prudentiadigital.co.za',
    subject: 's',
    html: '<p>h</p>',
    text: 't',
  });
  assert.equal(r.queued, false);
  assert.equal(r.error, 'smtp-host-not-allowed');
});

test('SMTP error messages are PII-redacted in the warn log', async () => {
  const { mailer } = mockMailer(async () => {
    throw new Error('550 rejected: visitor@example.com not allowed');
  });
  await withConsoleCapture(async (calls) => {
    await sendEmail({
      env: { TEST_MAILER: mailer },
      from: `Prudentia Digital <${COMPANY}>`,
      to: COMPANY,
      subject: 's',
      html: '<p>h</p>',
      text: 't',
    });
    const warned = calls.warn.map((a) => a.join(' ')).join('\n');
    assert.ok(!warned.includes('visitor@example.com'), 'email addresses must be redacted');
    assert.ok(warned.includes('[redacted-email]'));
  });
});
