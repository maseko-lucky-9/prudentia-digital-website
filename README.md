# Prudentia Digital — Company Website

Landing page for [Prudentia Digital](https://prudentiadigital.co.za) — an AI-augmented IT consultancy based in South Africa.  
Live at **prudentiadigital.co.za**, deployed as a Cloudflare Worker with the Workers Static Assets binding.

---

## Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styles | Vanilla CSS (custom design tokens, no framework) |
| Scripts | Vanilla JS (no libraries or bundler) |
| Fonts | DM Serif Display + Inter (Google Fonts) |
| Server runtime | Cloudflare Worker (`worker.js`) + Workers Static Assets binding (`[assets]`) |
| Route handlers | ES modules under `functions/` — imported by `worker.js`, bundled by wrangler |
| Email delivery | Resend HTTP API via `functions/_lib/sendEmail.js` |
| CI/CD | GitHub Actions → `cloudflare/wrangler-action@v3` → `wrangler deploy` (local fallback: `npx wrangler deploy`) |

Zero runtime dependencies on the client. A trivial build step (`npm run build`) stages static assets into `dist/`; wrangler bundles `worker.js` + handlers into the deployed Worker.

---

## Project Structure

```
prudentia-digital-website/
├── worker.js                       # Cloudflare Worker entrypoint — routes /contact-submit + /api/email-health, falls through to env.ASSETS.fetch
├── wrangler.toml                   # Workers config — main, [assets] binding=ASSETS, custom_domain routes
├── _headers                        # Static-asset response headers (incl. CSP)
├── index.html                      # Single-page site
├── 404.html / privacy.html / terms.html
├── assets/
│   ├── logo-icon.svg               # "Precision P" SVG logo
│   └── logo-icon-white-512.png     # PNG variant for footer
├── css/
│   ├── design-tokens.css           # Brand colours, typography, spacing (source of truth)
│   ├── styles.css                  # Page layout and component styles
│   └── animated-bg.css             # Canvas animation layer styles
├── js/
│   ├── animated-bg.js              # IntersectionObserver-driven canvas backgrounds
│   └── contact-form.js             # Client-side fetch handler for the Get Started form
├── functions/                      # Worker route handlers (imported by worker.js — NOT Pages Functions)
│   ├── contact-submit.js           # POST /contact-submit — form validation + Resend dispatch + auto-ack
│   ├── _lib/sendEmail.js           # Shared Resend HTTP-API sender (5s timeout, graceful degrade)
│   └── api/email-health.js         # GET /api/email-health — token-gated Resend wiring probe
├── .claude/
│   └── skills/                     # Department AI personas (engineering, design, etc.)
├── .github/
│   └── workflows/deploy.yml        # CI deploy via wrangler-action
├── CHANGELOG.md                    # Notable changes log
└── package.json                    # build script + dev tooling only (Playwright, serve)
```

---

## Brand

| Token | Value |
|---|---|
| Primary | Deep Navy `#0D1B2A` |
| Accent | Gold `#C9A96E` |
| Typeface — headings | DM Serif Display |
| Typeface — body | Inter (300 / 400 / 500 / 600) |

Design tokens are defined once in `css/design-tokens.css` and consumed everywhere else.

---

## Page Sections

1. **Navigation** — sticky, scroll-aware, responsive (hamburger on mobile)
2. **Hero** — headline, subtext, dual CTA buttons
3. **Proof strip** — animated stat counters (enterprise pedigree, AI-augmented delivery, stack coverage, accountability)
4. **Services** — 6 service cards with pricing:
   - Web Application Development — from R50 000
   - Cloud Infrastructure & DevOps — from R30 000
   - Data Analytics & Dashboards — from R25 000
   - Digital Transformation Advisory — from R15 000
   - API Development & Integration — from R20 000
   - Government & Enterprise Tenders — contact for scope
5. **Our Work** — 3 anonymised case-study cards (AI · Cloud · Data)
6. **Why Us** — senior-led delivery, delivery without ceremony, regulatory fluency, full-stack accountability
7. **About** — company story and the meaning of *Prudentia*
8. **Contact / CTA** — multi-step "Get Started" form (POST → `/contact-submit` Worker route handler → Resend)
9. **Footer** — brand, nav links, registration details, copyright

---

## Local Development

Two modes, depending on whether you need the Worker route handlers (`/contact-submit`, `/api/email-health`) or just the static HTML.

```bash
# Static-only preview — fast, no Worker, no env vars needed:
npx serve .

# Full Worker + static-assets emulation (recommended for any change to
# worker.js, functions/, or _headers):
npm run build            # populates dist/ (the assets binding source)
npx wrangler dev         # http://localhost:8787 with main = worker.js
```

`wrangler dev` reads env vars from a gitignored `.dev.vars` file at project root. For local `/api/email-health` testing, create:

```bash
# .dev.vars (already covered by .gitignore — never commit)
HEALTH_TOKEN=testtoken
# Optional, if testing Resend wiring locally with a real key:
# RESEND_API_KEY=re_xxx
```

Without `RESEND_API_KEY` the contact form returns `{ok: true, queued: false}` — graceful degrade so you can iterate without burning quota.

---

## Architecture

A single Worker entrypoint (`worker.js`) does dynamic routing; everything else falls through to the Workers Static Assets binding for normal HTML/CSS/JS serving.

```
                       ┌───────────────────────────────┐
   request ───────────▶│  worker.js  (main entrypoint) │
                       │                               │
                       │  • POST /contact-submit       │──▶ functions/contact-submit.js
                       │  • GET  /api/email-health     │──▶ functions/api/email-health.js
                       │  • everything else            │──▶ env.ASSETS.fetch(request)
                       └───────────────────────────────┘                │
                                                                       ▼
                                                          ┌─────────────────────────┐
                                                          │  Static assets (dist/)  │
                                                          │  _headers applied       │
                                                          │  404.html for unknowns  │
                                                          └─────────────────────────┘
```

**Why not Cloudflare Pages Functions?** The project switched to **Workers Static Assets** so it can use the `routes = [{ custom_domain: true }]` config in `wrangler.toml` (declared deploy targets in version control). In that deploy mode, files under `functions/` are NOT auto-routed by Cloudflare — they have to be imported and dispatched explicitly by `worker.js`. The folder is named `functions/` historically; the named exports (`onRequestPost`, `onRequestGet`) match what Pages Functions would expect, so the same files would work in either deploy mode.

`wrangler.toml` key config:

```toml
name = "prudentia-digital-website"
main = "worker.js"                          # the Worker entrypoint
compatibility_date = "2026-04-12"

routes = [
  { pattern = "prudentiadigital.co.za", custom_domain = true },
  { pattern = "www.prudentiadigital.co.za", custom_domain = true },
]

[build]
command = "npm run build"

[assets]
directory = "./dist"                        # static files come from here
binding = "ASSETS"                          # env.ASSETS.fetch(request)
not_found_handling = "404-page"             # serve dist/404.html on unknowns
```

---

## Deployment

Two paths, both deploy the same Worker artifact:

### Primary: GitHub Actions (when account is healthy)

Push to `main` → `.github/workflows/deploy.yml` runs `cloudflare/wrangler-action@v3` with `command: deploy` → Cloudflare picks up changes within ~30 s.

**Required GitHub repo secrets:**

| Secret | Description |
|---|---|
| `CF_API_TOKEN` | Cloudflare API token with: `Account:Workers Scripts:Edit`, `Account:Cloudflare Pages:Edit` (if you ever switch back), `Zone:Workers Routes:Edit` for `prudentiadigital.co.za`, `Zone:Zone:Read` |
| `CF_ACCOUNT_ID` | Cloudflare account ID |

The Cloudflare Worker name is `prudentia-digital-website` (matches `wrangler.toml` `name`).

### Fallback: local `wrangler deploy`

Useful when CI is unavailable (account suspension, runner queue stuck, network issues). Uses your local OAuth via `wrangler login`:

```bash
npx wrangler whoami       # confirm you're authed
npx wrangler deploy       # build + bundle + deploy in ~25 s
```

The deploy is identical to what CI would produce — wrangler runs `npm run build` (the `[build] command` in `wrangler.toml`), bundles `worker.js` + handlers, uploads assets, and binds custom domains.

---

## Email delivery (contact form)

The "Get Started" contact form posts to `/contact-submit`, a Worker route handler (`functions/contact-submit.js`, dispatched by `worker.js`). It validates the payload and sends via the **GoDaddy/Titan SMTP relay the business already pays for** (`smtpout.secureserver.net:465`), using the [`worker-mailer`](https://github.com/zou-yu/worker-mailer) SMTP client over Cloudflare TCP sockets. See ADR-013 (supersedes ADR-012: Cloudflare Email Sending turned out to be Workers-Paid-gated; Resend was dropped earlier by owner decision).

### Required setup (one-time)

> **No DNS changes at all.** Mail is sent from the company's own GoDaddy mailbox, and the apex SPF (`v=spf1 include:secureserver.net -all`) already authorizes GoDaddy's relay. Apex MX/SPF/DMARC stay exactly as they are.

1. **Set the mailbox password as the one sending secret** (for **both** Production and Preview):

   ```bash
   npx wrangler secret put SMTP_PASSWORD     # password for masekolt@prudentiadigital.co.za
   ```

2. `HEALTH_TOKEN` (secret) gates `/api/email-health` — already set.

That's it. Without `SMTP_PASSWORD`, every send degrades gracefully to `{ok:true, queued:false}` and logs `EMAIL_DELIVERY_FAILURE`.

### Configuration (committed in `wrangler.toml` — survives `wrangler deploy --keep-vars=false`)

| Item | Value | Notes |
|---|---|---|
| `SMTP_HOST` / `SMTP_PORT` | `smtpout.secureserver.net` / `465` | GoDaddy Workspace relay; 465 = implicit TLS (587/STARTTLS also works) |
| `SMTP_USERNAME` | `masekolt@prudentiadigital.co.za` | the authenticated mailbox |
| `EMAIL_FROM_ADDRESS` | `masekolt@prudentiadigital.co.za` | **must equal `SMTP_USERNAME`** — GoDaddy only relays the authed mailbox |
| `CONTACT_TO_ADDRESS` | `masekolt@prudentiadigital.co.za` | self-send; reply-to carries the visitor's address |
| `SEND_AUTO_ACK` | `"true"` | courtesy receipt to the visitor; flip to `"false"` if relay quota or complaints become an issue |
| `[[kv_namespaces]]` `FORM_RATELIMIT` | bound | per-IP throttle: 5 submissions / 10 min (anti mail-amplification) |
| `compatibility_flags` | `["nodejs_compat"]` | required by `worker-mailer` |

### What the contact form sends

1. **Primary** → `CONTACT_TO_ADDRESS` with the full payload, reply-to = submitter's address. This is the message you act on.
2. **Auto-acknowledgement** → the submitter (when `SEND_AUTO_ACK = "true"`). Failures log `EMAIL_ACK_FAILED` and never affect the request outcome.

### Local development of the form

```bash
npm run build            # stage dist/
npx wrangler dev         # http://localhost:8787 — POST /contact-submit hits the Worker

curl -sS -X POST http://localhost:8787/contact-submit \
  -d "name=test&email=t@t.com&challenge=hi&timeline=exploring&budget=lt-25k&services=software-dev"
# → {"ok":true,"queued":false}   (no SMTP_PASSWORD locally — graceful degrade)
```

To send real emails from dev, add `SMTP_PASSWORD=...` to the gitignored `.dev.vars`.

### Verify with `/api/email-health` (no-send probe)

```bash
curl -sS -H "X-Health-Token: $HEALTH_TOKEN" \
  https://prudentiadigital.co.za/api/email-health | jq .
```

Expected on full-green:

```json
{
  "smtpConfigured": true,
  "fromAddress": "masekolt@prudentiadigital.co.za",
  "toAddress": "masekolt@prudentiadigital.co.za",
  "autoAck": true,
  "error": null
}
```

The probe checks configuration only — it does not open an SMTP connection. A live relay/auth failure surfaces as `queued:false` + `error:"smtp-failed"` in the logs.

### Inspecting submission logs

```bash
npx wrangler tail prudentia-digital-website
```

Logs are retained/queryable because `wrangler.toml` enables `[observability]`. Two greppable markers:

- **`EMAIL_DELIVERY_FAILURE`** — **page-worthy.** The company did **not** receive an inquiry. `error` is `SMTP credentials missing` or `smtp-failed` (relay/auth/timeout — details in the adjacent redacted warn line). Build alerts on this string. PII is masked in logs (email → `a***@domain`, no client IP).
- **`EMAIL_ACK_FAILED`** — informational. The courtesy auto-ack failed; the company copy still arrived. Do not alert on it.

> **Quotas:** GoDaddy Workspace relay allows roughly 250–500 messages/day — each submission consumes 2 (company copy + ack), far below quota for a contact form. SMTP failures (including quota) surface as `smtp-failed` → `EMAIL_DELIVERY_FAILURE`.



## Company

**Prudentia Digital (Pty) Ltd**  
Enterprise No. 2025/910056/07 · CIPC registered · CSD registered  
POPIA · PFMA · PPPFA compliant  

Contact: masekolt@prudentiadigital.co.za
