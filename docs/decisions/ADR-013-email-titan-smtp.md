# ADR-013: Contact-form email via GoDaddy/Titan SMTP relay (supersedes ADR-012's delivery mechanism)

Date: 2026-06-12
Status: Accepted (supersedes the delivery mechanism in ADR-012)

## Problem

ADR-012 chose Cloudflare Email Service (native `send_email` binding) to replace the
never-activated Resend integration. The code shipped (PR #27) and the destination
address was verified, but activation hit a wall: **the dashboard gates Email Sending
onboarding behind the Workers Paid plan ($5/mo)** — the "free to verified addresses"
tier only applies after the feature is unlocked. The owner already pays GoDaddy for
the domain and a Titan/Workspace mailbox and declined a second recurring fee.

## Options

1. **Upgrade to Workers Paid ($5/mo)** — zero code change from PR #27, no secrets,
   also unlocks visitor auto-ack. Recurring cost.
2. **GoDaddy/Titan SMTP relay (already paid)** — Worker sends through
   `smtpout.secureserver.net:465` with the mailbox credentials, via the
   `worker-mailer` SMTP client on Cloudflare TCP sockets (`nodejs_compat`;
   port 25 blocked, 465/587 allowed). Mailbox password becomes a Worker secret.
3. **Third-party free tier (Resend/Brevo)** — API key + vendor DNS records;
   the friction the owner already rejected twice.

## Decision

**Option 2 — Titan SMTP.** Owner decision 2026-06-12 ("already paying for the domain
and email on GoDaddy"). R0 ongoing cost.

Implementation constraints that shaped the design:
- GoDaddy's relay only sends from the **authenticated mailbox**, so
  `EMAIL_FROM_ADDRESS = SMTP_USERNAME = masekolt@prudentiadigital.co.za`
  (self-send; the visitor's address rides in Reply-To).
- Apex SPF already includes `secureserver.net` → SPF/DMARC alignment with
  **zero DNS changes**.
- The `sendEmail()` helper keeps its `{queued, status, error, id}` contract, so the
  `EMAIL_DELIVERY_FAILURE` / `EMAIL_ACK_FAILED` observability is unchanged
  (`error` ∈ {`SMTP credentials missing`, `smtp-failed`, from-address guard}).
- Tests use the `env.TEST_MAILER` seam instead of a real SMTP connection.
- **Auto-ack returns ON** (`SEND_AUTO_ACK="true"`): the paid-plan objection that
  disabled it is gone; relay quota (~250–500/day) dwarfs form volume.

## Consequences

- **One sending secret**: `SMTP_PASSWORD` (mailbox password, encrypted Worker secret;
  set for Production AND Preview). Rotating the mailbox password breaks the form
  until the secret is updated — documented in README.
- **Security trade-off accepted**: a full-mailbox credential lives in the Worker.
  Mitigations: encrypted at rest, never logged, from-address guard, KV rate limit,
  honeypot. Revisit if GoDaddy ever offers app-specific passwords.
- **Reliability trade-off accepted**: SMTP-from-serverless is weaker than an HTTP
  email API (connection per send, 10s timeouts). Failures are observable
  (`EMAIL_DELIVERY_FAILURE`) and the form UX never blocks on them.
- The PR #27 Email Service work (verified destination address, ADR-012 analysis)
  remains valid groundwork; migrate back by reverting this ADR's commit if the
  account ever moves to Workers Paid.
- Deploy note: the Actions deploy job now runs `npm ci` (worker-mailer must be
  resolvable by wrangler's esbuild bundling).
