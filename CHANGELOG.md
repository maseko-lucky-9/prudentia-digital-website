# Changelog

All notable changes to prudentia-digital-website. Newest first.

## 2026-05-26

### Added

- **`functions/_lib/sendEmail.js`** — shared Resend HTTP-API sender used by every Pages Function that sends transactional email. 5s timeout, graceful degrade, never throws, best-effort from-address guard.
- **`functions/api/email-health.js`** — token-gated `/api/email-health` probe. Returns `apiKeyConfigured` / `resendReachable` / `prudentiaDomainStatus` without firing email. Filtered to expose only the `prudentiadigital.co.za` domain status. Auth via `X-Health-Token` header matching the `HEALTH_TOKEN` Pages env var.
- **Auto-acknowledgement to contact-form submitters** — every successful inquiry now triggers a courtesy receipt back to the submitter with reply-to set to `masekolt@prudentiadigital.co.za`. Failures here are logged but never affect the form's success response.

### Changed

- **`functions/contact-submit.js`** — refactored to use the shared `sendEmail()` helper. No behaviour change visible to the form.
- **README "Email delivery" section** — added `HEALTH_TOKEN` env var row, "What the contact form sends" subsection, "Verify with /api/email-health" subsection, and corrected DMARC policy notation (live record is `p=quarantine`).

### Fixed

- BBEE references removed across all 11 HTML pages + orphan CSS cleanup (commit `93cc9e8`, 2026-05-26).
- "Why Choose Us" section visibility — text now visible by default with translateY-only animation; body color bumped from slate-500 to navy-500 for stronger contrast (commit `93cc9e8`).
- "Our Work" placeholder — replaced text-only stub with three anonymised case-study cards (commit `93cc9e8`).
