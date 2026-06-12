/**
 * Worker-level regression tests for the contact-form handler.
 *
 * Guards the exact bug this change set fixes: the form returns HTTP 200 with
 * { ok: true } whether or not the email was actually sent, so a UI/Playwright
 * test (which only sees `ok`) is structurally blind to a delivery failure.
 * These tests assert the `queued` contract and the failure-marker behaviour
 * directly, with no Cloudflare runtime — only Node 20 globals and a mocked
 * Cloudflare Email Service binding (env.EMAIL.send).
 *
 * Run: npm run test:worker   (node --test)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { onRequestPost } from '../../functions/contact-submit.js';
import { sendEmail } from '../../functions/_lib/sendEmail.js';

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

// Build a mocked EMAIL binding. `impl` resolves/rejects each send() call;
// every call's message is recorded for assertions.
function mockEmailBinding(impl) {
  const sent = [];
  return {
    sent,
    binding: {
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

test('no EMAIL binding → {ok:true, queued:false}, logs EMAIL_DELIVERY_FAILURE', async () => {
  await withConsoleCapture(async (calls) => {
    const res = await onRequestPost({ request: makeRequest(validForm()), env: {} });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.deepEqual(body, { ok: true, queued: false });
    assert.ok(marker(calls, 'EMAIL_DELIVERY_FAILURE'), 'expected the page-worthy failure marker');
  });
});

test('EMAIL binding ok → {ok:true, queued:true}, no failure marker, ack NOT sent by default', async () => {
  const { sent, binding } = mockEmailBinding(async () => ({ messageId: 'msg_123' }));
  await withConsoleCapture(async (calls) => {
    const res = await onRequestPost({
      request: makeRequest(validForm()),
      env: { EMAIL: binding },
    });
    const body = await res.json();
    assert.deepEqual(body, { ok: true, queued: true });
    assert.ok(!marker(calls, 'EMAIL_DELIVERY_FAILURE'), 'no failure marker on success');
    assert.equal(sent.length, 1, 'only the primary email — SEND_AUTO_ACK defaults off');
    assert.deepEqual(sent[0].to, ['masekolt@prudentiadigital.co.za']);
    assert.equal(sent[0].from.email, 'contact-form@prudentiadigital.co.za');
    assert.equal(sent[0].replyTo, 'visitor@example.com');
  });
});

test('SEND_AUTO_ACK="true" → primary + ack both sent', async () => {
  const { sent, binding } = mockEmailBinding(async () => ({ messageId: 'msg_123' }));
  await withConsoleCapture(async () => {
    const res = await onRequestPost({
      request: makeRequest(validForm()),
      env: { EMAIL: binding, SEND_AUTO_ACK: 'true' },
    });
    const body = await res.json();
    assert.deepEqual(body, { ok: true, queued: true });
    assert.equal(sent.length, 2, 'primary + auto-ack');
    assert.deepEqual(sent[1].to, ['visitor@example.com']);
    assert.equal(sent[1].replyTo, 'masekolt@prudentiadigital.co.za');
  });
});

test('binding throws E_SENDER_NOT_VERIFIED → {ok:true, queued:false} + failure marker with code', async () => {
  const { binding } = mockEmailBinding(async () => {
    const err = new Error('sender domain not onboarded');
    err.code = 'E_SENDER_NOT_VERIFIED';
    throw err;
  });
  await withConsoleCapture(async (calls) => {
    const res = await onRequestPost({
      request: makeRequest(validForm()),
      env: { EMAIL: binding },
    });
    const body = await res.json();
    assert.deepEqual(body, { ok: true, queued: false });
    const failure = calls.error.find((a) => a[0] === 'EMAIL_DELIVERY_FAILURE');
    assert.ok(failure, 'expected the page-worthy failure marker');
    assert.equal(failure[1].error, 'E_SENDER_NOT_VERIFIED');
  });
});

test('honeypot _gotcha → silent {ok:true, queued:false}, never sends', async () => {
  const { sent, binding } = mockEmailBinding(async () => ({ messageId: 'msg_123' }));
  await withConsoleCapture(async () => {
    const res = await onRequestPost({
      request: makeRequest(validForm({ _gotcha: 'i-am-a-bot' })),
      env: { EMAIL: binding },
    });
    const body = await res.json();
    assert.deepEqual(body, { ok: true, queued: false });
    assert.equal(sent.length, 0, 'honeypot must short-circuit before any send');
  });
});

test('invalid payload → 400 with an error, never sends', async () => {
  const { sent, binding } = mockEmailBinding(async () => ({ messageId: 'msg_123' }));
  await withConsoleCapture(async () => {
    const res = await onRequestPost({
      request: makeRequest(validForm({ email: 'not-an-email' })),
      env: { EMAIL: binding },
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.ok(body.error, 'expected a validation error message');
    assert.equal(sent.length, 0);
  });
});

test('sendEmail() without the binding returns queued:false (no throw)', async () => {
  const r = await sendEmail({
    env: {},
    from: 'Prudentia Digital <contact-form@prudentiadigital.co.za>',
    to: 'masekolt@prudentiadigital.co.za',
    subject: 's',
    html: '<p>h</p>',
    text: 't',
  });
  assert.equal(r.queued, false);
  assert.equal(r.error, 'EMAIL binding missing');
});

test('sendEmail() refuses off-domain from address before calling the binding', async () => {
  const { sent, binding } = mockEmailBinding(async () => ({ messageId: 'msg_123' }));
  const r = await sendEmail({
    env: { EMAIL: binding },
    from: 'Spoof <attacker@evil.example>',
    to: 'masekolt@prudentiadigital.co.za',
    subject: 's',
    html: '<p>h</p>',
    text: 't',
  });
  assert.equal(r.queued, false);
  assert.match(r.error, /from-address guard/);
  assert.equal(sent.length, 0);
});
