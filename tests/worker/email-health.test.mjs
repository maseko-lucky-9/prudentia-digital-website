/**
 * Contract tests for the token-gated /api/email-health probe.
 *
 * The /ship deploy-verify step consumes this endpoint's exact response shape —
 * these tests pin the field names and auth behaviour so a refactor cannot
 * silently break the health pipeline. No Cloudflare runtime needed.
 *
 * Run: npm run test:worker   (node --test)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { onRequestGet } from '../../functions/api/email-health.js';

const TOKEN = 'test-health-token';
const COMPANY = 'masekolt@prudentiadigital.co.za';

function makeRequest(token) {
  const headers = token ? { 'X-Health-Token': token } : {};
  return new Request('https://prudentiadigital.co.za/api/email-health', { headers });
}

test('HEALTH_TOKEN unset → 503, endpoint not configured', async () => {
  const res = await onRequestGet({ request: makeRequest(TOKEN), env: {} });
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.error, 'HEALTH_TOKEN not configured');
});

test('missing or wrong token → 401 unauthorized', async () => {
  const env = { HEALTH_TOKEN: TOKEN };
  for (const presented of [undefined, 'wrong-token']) {
    const res = await onRequestGet({ request: makeRequest(presented), env });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, 'unauthorized');
  }
});

test('valid token + SMTP creds + vars → exact green response shape', async () => {
  const res = await onRequestGet({
    request: makeRequest(TOKEN),
    env: {
      HEALTH_TOKEN: TOKEN,
      SMTP_USERNAME: COMPANY,
      SMTP_PASSWORD: 'mailbox-password',
      EMAIL_FROM_ADDRESS: COMPANY,
      CONTACT_TO_ADDRESS: COMPANY,
      SEND_AUTO_ACK: 'true',
    },
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(res.headers.get('x-robots-tag'), 'noindex');
  const body = await res.json();
  assert.deepEqual(body, {
    smtpConfigured: true,
    fromAddress: COMPANY,
    toAddress: COMPANY,
    autoAck: true,
    error: null,
  });
});

test('no SMTP_PASSWORD → smtpConfigured:false with address defaults', async () => {
  const res = await onRequestGet({
    request: makeRequest(TOKEN),
    env: { HEALTH_TOKEN: TOKEN, SMTP_USERNAME: COMPANY },
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.smtpConfigured, false);
  assert.equal(body.fromAddress, COMPANY);
  assert.equal(body.toAddress, COMPANY);
});

test('SEND_AUTO_ACK unset → autoAck:false', async () => {
  const res = await onRequestGet({
    request: makeRequest(TOKEN),
    env: { HEALTH_TOKEN: TOKEN, SMTP_USERNAME: COMPANY, SMTP_PASSWORD: 'pw' },
  });
  const body = await res.json();
  assert.equal(body.autoAck, false);
});
