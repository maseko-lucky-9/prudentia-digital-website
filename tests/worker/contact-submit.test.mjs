/**
 * Worker-level regression tests for the contact-form handler.
 *
 * Guards the exact bug this change set fixes: the form returns HTTP 200 with
 * { ok: true } whether or not the email was actually sent, so a UI/Playwright
 * test (which only sees `ok`) is structurally blind to a delivery failure.
 * These tests assert the `queued` contract and the failure-marker behaviour
 * directly, with no Cloudflare runtime — only Node 20 globals + a mocked fetch.
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

// Run `fn` with console.error/warn captured and global.fetch mocked.
async function withHarness(fetchImpl, fn) {
  const calls = { error: [], warn: [], fetched: 0 };
  const origError = console.error;
  const origWarn = console.warn;
  const origFetch = globalThis.fetch;
  console.error = (...a) => calls.error.push(a);
  console.warn = (...a) => calls.warn.push(a);
  globalThis.fetch = async (...a) => {
    calls.fetched += 1;
    return fetchImpl(...a);
  };
  try {
    return await fn(calls);
  } finally {
    console.error = origError;
    console.warn = origWarn;
    globalThis.fetch = origFetch;
  }
}

const marker = (calls, name) => calls.error.concat(calls.warn).some((a) => a[0] === name);

test('no RESEND_API_KEY → {ok:true, queued:false}, logs EMAIL_DELIVERY_FAILURE, never calls Resend', async () => {
  await withHarness(
    async () => new Response('{}', { status: 200 }),
    async (calls) => {
      const res = await onRequestPost({ request: makeRequest(validForm()), env: {} });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.deepEqual(body, { ok: true, queued: false });
      assert.equal(calls.fetched, 0, 'must not hit Resend without an API key');
      assert.ok(marker(calls, 'EMAIL_DELIVERY_FAILURE'), 'expected the page-worthy failure marker');
    }
  );
});

test('RESEND_API_KEY set + Resend 200 → {ok:true, queued:true}, no failure marker', async () => {
  await withHarness(
    async () => new Response(JSON.stringify({ id: 'msg_123' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
    async (calls) => {
      const res = await onRequestPost({
        request: makeRequest(validForm()),
        env: { RESEND_API_KEY: 're_test_key' },
      });
      const body = await res.json();
      assert.deepEqual(body, { ok: true, queued: true });
      assert.ok(!marker(calls, 'EMAIL_DELIVERY_FAILURE'), 'no failure marker on success');
    }
  );
});

test('honeypot _gotcha → silent {ok:true, queued:false}, never calls Resend', async () => {
  await withHarness(
    async () => new Response('{}', { status: 200 }),
    async (calls) => {
      const res = await onRequestPost({
        request: makeRequest(validForm({ _gotcha: 'i-am-a-bot' })),
        env: { RESEND_API_KEY: 're_test_key' },
      });
      const body = await res.json();
      assert.deepEqual(body, { ok: true, queued: false });
      assert.equal(calls.fetched, 0, 'honeypot must short-circuit before any send');
    }
  );
});

test('invalid payload → 400 with an error, never calls Resend', async () => {
  await withHarness(
    async () => new Response('{}', { status: 200 }),
    async (calls) => {
      const res = await onRequestPost({
        request: makeRequest(validForm({ email: 'not-an-email' })),
        env: { RESEND_API_KEY: 're_test_key' },
      });
      const body = await res.json();
      assert.equal(res.status, 400);
      assert.ok(body.error, 'expected a validation error message');
      assert.equal(calls.fetched, 0);
    }
  );
});

test('sendEmail() without an API key returns queued:false (no throw)', async () => {
  const r = await sendEmail({
    env: {},
    from: 'Prudentia Digital <contact-form@prudentiadigital.co.za>',
    to: 'masekolt@prudentiadigital.co.za',
    subject: 's',
    html: '<p>h</p>',
    text: 't',
  });
  assert.equal(r.queued, false);
  assert.equal(r.error, 'RESEND_API_KEY missing');
});
