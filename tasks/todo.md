# Fix contact-form email delivery — REVISED: Cloudflare Email Service (plan: the-deployed-website-on-snazzy-boot)

Root cause: Resend setup never completed (no RESEND_API_KEY secret, no DNS records).
Pivot (user decision 2026-06-12): drop Resend → Cloudflare Email Service native binding.
No API keys/secrets for sending. Auto-ack OFF (free plan = verified destinations only).
GoDaddy: zero changes. Apex MX/SPF/DMARC stay byte-identical.

## User gates (manual)
- [ ] U1. Click verification email sent to masekolt@prudentiadigital.co.za (destination address ID 60881063cf254d6082629f6433de6d0a)
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
- [ ] 8. Branch → PR → CI → merge → deploy
- [ ] 9. After U1+U2: wrangler email sending enable + dns get; dig checks; apex untouched
- [ ] 10. Verify: /api/email-health green · live submission {ok,queued:true} + wrangler tail · email lands at masekolt@ (reply-to=submitter) · 6th rapid submit throttled · CI green

## Review

(to fill on completion)
