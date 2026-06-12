# ADR-012: Contact-form email provider — Cloudflare Email Service (drop Resend)

Date: 2026-06-12
Status: Accepted

## Problem

The "Get Started" contact form silently delivered nothing in production. Root cause
(evidence-gathered 2026-06-12): the Resend integration shipped in PR #25 was never
operationally completed — no `RESEND_API_KEY` Worker secret, and Resend's DNS records
(`send.` SPF/MX, `resend._domainkey` DKIM) were never created, so the domain was never
verified. Every submission returned `{ok:true, queued:false}` while the UI showed success.

Completing Resend required two credentials the owner had to mint and steward
(a Resend API key and a Cloudflare DNS-edit token), plus third-party DNS records.
Mid-fix, the owner asked for an alternative to Resend.

## Options

1. **Finish Resend setup** — zero code change, but keeps a third-party vendor, an
   API-key secret to rotate/steward, and externally-prescribed DNS records.
2. **Cloudflare Email Service** (native `send_email` binding) — no API key, no vendor;
   domain onboarding auto-creates DNS records inside the same Cloudflare account/zone.
   Product is **beta**. Workers free plan sends only to *verified destination addresses*;
   arbitrary recipients (the visitor auto-ack) need Workers Paid ($5/mo, 3,000/mo incl.).
3. **Amazon SES / Postmark / Mailgun** — same API-key + external-DNS shape as Resend
   (SES additionally needs SigV4 signing and a sandbox exit). Sidegrades.

## Decision

**Option 2 — Cloudflare Email Service.** Owner decision 2026-06-12, accepting beta status.
The auto-ack is gated behind `SEND_AUTO_ACK` (committed as `"false"`) so the free plan
suffices for the core goal: lead emails to the verified company inbox
(`masekolt@prudentiadigital.co.za`).

The `sendEmail()` helper keeps its `{queued, status, error, id}` contract, so the
`EMAIL_DELIVERY_FAILURE` / `EMAIL_ACK_FAILED` observability from PR #25 carries over
unchanged (`error` now carries the binding's `E_*` codes; `status` is always `null`).

## Consequences

- **No secrets for sending.** `HEALTH_TOKEN` is the only Worker secret left.
- **GoDaddy untouched** — registrar + Titan inbound only; apex MX/SPF/DMARC unchanged.
- **Auto-ack is OFF** until a Workers Paid upgrade; flipping `SEND_AUTO_ACK="true"` is
  the entire re-enable procedure.
- **Beta risk accepted**: API surface (`wrangler email sending …`, error codes, quotas)
  may shift; the daily quota starts conservative and scales with sending behaviour.
- **Account-level gates** (one-time, manual): dashboard opt-in to Email Service, then
  `wrangler email sending enable prudentiadigital.co.za`, then destination-address
  verification click. Until onboarding completes, sends fail observably as
  `queued:false` + `E_SENDER_NOT_VERIFIED`.
- Migration trigger to revisit: Email Service GA, or volume approaching quota.
