# Fix contact-form email delivery — REVISED: Cloudflare Email Service (plan: the-deployed-website-on-snazzy-boot)

Root cause: Resend setup never completed (no RESEND_API_KEY secret, no DNS records).
Pivot (user decision 2026-06-12): drop Resend → Cloudflare Email Service native binding.
No API keys/secrets for sending. Auto-ack OFF (free plan = verified destinations only).
GoDaddy: zero changes. Apex MX/SPF/DMARC stay byte-identical.

## User gates (manual)
- [x] U1. Click verification email sent to masekolt@prudentiadigital.co.za (destination address ID 60881063cf254d6082629f6433de6d0a)
- [ ] U2. Dashboard → Compute & AI → Email Service → opt into Email Sending beta / onboard prudentiadigital.co.za (wrangler `email sending enable` currently Unauthorized 2036 until opt-in)

## Implementation
- [x] 0. Credentials/access: CF DNS token working (fallback only); wrangler OAuth has email_routing + email_sending scopes
- [x] 1. Destination address created → verification email fired
- [x] 2. wrangler.toml: [[send_email]] EMAIL binding; KV FORM_RATELIMIT created + bound; EMAIL_FROM_ADDRESS + SEND_AUTO_ACK="false" vars
- [x] 3. sendEmail.js: env.EMAIL.send() replaces Resend fetch; contract {queued,status,error,id} preserved; 'EMAIL binding missing' enum
- [x] 4. contact-submit.js: from default contact-form@prudentiadigital.co.za; EMAIL_FROM_ADDRESS; ack gated on SEND_AUTO_ACK==='true'
- [x] 5. email-health.js: binding presence + addresses + autoAck (Resend /domains call removed)
- [x] 6. tests: mock env.EMAIL.send; same contract assertions; ack-not-sent test
- [x] 7. README email section rewrite + ADR-012-email-provider-cloudflare.md
- [x] 8. Branch → PR #27 → gates GO → merged 2026-06-12T13:07Z → CI deploy in progress
- [ ] 9. After U1+U2: wrangler email sending enable + dns get; dig checks; apex untouched
- [ ] 10. Verify: /api/email-health green · live submission {ok,queued:true} + wrangler tail · email lands at masekolt@ (reply-to=submitter) · 6th rapid submit throttled · CI green

## Review (2026-06-12)

Shipped via PR #27 (squash 601afbe). All 3 review gates GO (1 bounce cycle: email-health
test coverage → fixed, 13/13 worker tests). Deployed to prod by Cloudflare Workers Builds
13:07:42Z (100% traffic, version 08252f7d); GH Actions deploy step RED — CF_API_TOKEN
lacks "Workers KV Storage: Edit" (error 10023) now that FORM_RATELIMIT KV is bound.
Live proof: POST /contact-submit → {ok:true,queued:false}; tail shows masked PII log +
EMAIL_DELIVERY_FAILURE with E_DELIVERY_FAILED (binding live, domain not onboarded).
Smoke 200/200; /api/email-health 401-gated. U1 verified 12:49Z. Remaining: U2 dashboard
opt-in → wrangler email sending enable → live email lands (items 9-10); fix CI token perms.


## Pivot 2 — Titan/GoDaddy SMTP (2026-06-12, CF Email Sending = paid-plan gated)

- [x] P2-1. worker-mailer dep + nodejs_compat; deploy.yml deploy job npm ci
- [x] P2-2. wrangler.toml: SMTP vars (smtpout.secureserver.net:465, username=from=masekolt@), SEND_AUTO_ACK=true, [[send_email]] removed
- [x] P2-3. sendEmail.js → SMTP via worker-mailer; contract preserved; TEST_MAILER seam; PII-redacted errors
- [x] P2-4. email-health.js → smtpConfigured; tests updated (14/14 green)
- [x] P2-5. README rewrite + ADR-013
- [x] P2-6. Gates GO (1 security bounce→fixed) → PR #28 merged 14:07Z → Workers Builds deployed version f1c6ebe8 (14:08Z); live log now shows error="SMTP credentials missing" (new SMTP path confirmed)
- [x] U3. SMTP_PASSWORD secret set by user (option A) 2026-06-12 ~14:26Z
- [x] P2-7. LIVE PROOF: form → {ok:true,queued:true}; tail shows 2× WorkerMailer connect→send→close to smtpout.secureserver.net:465 (primary + auto-ack), NO EMAIL_DELIVERY_FAILURE. Inbox confirmation = final human check.

## DONE 2026-06-12 ✅ CONFIRMED
GoDaddy/Titan SMTP live. User confirmed BOTH emails arrived (company copy to masekolt@ + visitor auto-ack). Original goal fully met: functional email sent from the form with a response. Known residual (non-blocking): GH Actions deploy red (CF_API_TOKEN lacks KV write) — prod current via Workers Builds.
