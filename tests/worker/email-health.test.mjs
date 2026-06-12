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

function makeRequest(token) {
  const headers = token ? { 'X-Health-Token': token } : {};
  return new Request('https://prudentiadigital.co.za/api/email-health', { headers });
}

const emailBinding = { async send() { return { messageId: 'msg_1' }; } };

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

test('valid token + binding + vars → exact green response shape', async () => {
  const res = await onRequestGet({
    request: makeRequest(TOKEN),
    env: {
      HEALTH_TOKEN: TOKEN,
      EMAIL: emailBinding,
      EMAIL_FROM_ADDRESS: 'contact-form@prudentiadigital.co.za',
      CONTACT_TO_ADDRESS: 'masekolt@prudentiadigital.co.za',
      SEND_AUTO_ACK: 'false',
    },
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(res.headers.get('x-robots-tag'), 'noindex');
  const body = await res.json();
  assert.deepEqual(body, {
    bindingConfigured: true,
    fromAddress: 'contact-form@prudentiadigital.co.za',
    toAddress: 'masekolt@prudentiadigital.co.za',
    autoAck: false,
    error: null,
  });
});

test('no EMAIL binding → bindingConfigured:false with address defaults', async () => {
  const res = await onRequestGet({
    request: makeRequest(TOKEN),
    env: { HEALTH_TOKEN: TOKEN },
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.bindingConfigured, false);
  assert.equal(body.fromAddress, 'contact-form@prudentiadigital.co.za');
  assert.equal(body.toAddress, 'masekolt@prudentiadigital.co.za');
});

test('SEND_AUTO_ACK="true" → autoAck:true', async () => {
  const res = await onRequestGet({
    request: makeRequest(TOKEN),
    env: { HEALTH_TOKEN: TOKEN, EMAIL: emailBinding, SEND_AUTO_ACK: 'true' },
  });
  const body = await res.json();
  assert.equal(body.autoAck, true);
});
