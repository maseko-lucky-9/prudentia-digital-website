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

The "Get Started" contact form posts to `/contact-submit`, a Worker route handler (`functions/contact-submit.js`, dispatched by `worker.js`). It validates the payload and forwards via the **Resend** HTTP API.

### Required setup

> **DNS lives at Cloudflare**; inbound email is handled by **GoDaddy / Titan** (MX records point to `secureserver.net`). Add Resend's records in the Cloudflare DNS dashboard, not in GoDaddy. **Do not touch MX records** — leave Titan in place.

1. **Sign up for Resend** at [resend.com](https://resend.com) using `masekolt@prudentiadigital.co.za` as the account email (so the pre-verification fallback can send to that address).
2. **Add a domain** for `prudentiadigital.co.za` in the Resend dashboard. Resend will list the DNS records you need.
3. **Add the records in Cloudflare DNS** (dash.cloudflare.com → prudentiadigital.co.za → DNS → Records) **exactly as the Resend dashboard lists them — do NOT hand-author or modify any value.** For this domain:
   - **Resend's records live on the `send.` subdomain and on `resend._domainkey` — NOT on the apex.** Resend sends via Amazon SES, so it generates an SPF `TXT` on `send` (typically `v=spf1 include:amazonses.com ~all`), an **MX** on `send` (→ `feedback-smtp.<region>.amazonses.com`), and a DKIM record at `resend._domainkey`. Add all of them verbatim.
   - **Do NOT touch the apex SPF** (`v=spf1 include:secureserver.net -all`, Titan) and **do NOT touch the apex MX** (Titan inbound). The `send.` subdomain MX is a *separate host* and does not affect Titan. ⚠️ Earlier guidance here to merge `include:_spf.resend.com` into the apex SPF was **incorrect** — ignore it; Resend does not use the apex record.
   - **DKIM (`resend._domainkey`) is the record that carries the DMARC pass** at `p=quarantine` — SPF alignment rides on the `send.` subdomain, not the apex. Wait for the Resend dashboard to show **DKIM verified** specifically.
   - **DMARC is at `p=quarantine`** — mail failing alignment lands in **spam, not bounced**. Confirm a real send shows `dkim=pass` / `dmarc=pass` in its **Authentication-Results** header before trusting the form. Consider tightening to `p=reject` only after 24 h of stable delivery.
4. Wait for the Resend dashboard to mark the domain **verified** (DKIM green; usually 5–60 min after the records propagate).
5. **Create an API key** in Resend → API Keys.
6. **Set the two secrets, then the two addresses — they live in different places** (this matters: CI runs `wrangler deploy`, whose default `--keep-vars=false` **deletes dashboard plaintext vars not in `wrangler.toml`**; encrypted Secrets are preserved):

   - **Secrets** — `wrangler secret put <NAME>` (or dashboard → Variables and **Secrets**), for **both Production and Preview**:

     | Secret | Value | Required? |
     |---|---|---|
     | `RESEND_API_KEY` | the key from step 5 | yes — without it every send returns `{ok:true, queued:false}` and logs `EMAIL_DELIVERY_FAILURE` |
     | `HEALTH_TOKEN` | random 32+ chars — `openssl rand -hex 32` | required to use `/api/email-health` (returns 503 without it) |

   - **Non-secret addresses** — committed in `wrangler.toml` `[vars]` (deploy-stable; do **not** set these as dashboard plaintext vars or they get wiped on the next deploy):

     | Var | Value | Notes |
     |---|---|---|
     | `CONTACT_TO_ADDRESS` | `masekolt@prudentiadigital.co.za` | already committed; code default matches |
     | `RESEND_FROM_ADDRESS` | `contact-form@prudentiadigital.co.za` | **uncomment in `wrangler.toml` only AFTER DKIM verified.** Until then leave unset → falls back to `onboarding@resend.dev` (sends only to the Resend account email; the auto-ack to other addresses will 403 — expected) |

7. **Bind the per-IP rate limit BEFORE `RESEND_API_KEY` goes live** (abuse gate — the auto-ack sends to an attacker-controllable address, so an unthrottled live form is a mail-amplification vector). Create the namespace and uncomment the `[[kv_namespaces]]` block in `wrangler.toml`:
   ```bash
   npx wrangler kv namespace create FORM_RATELIMIT   # paste the id into wrangler.toml
   ```
   The handler then throttles each IP to 5 submissions / 10 min. (Durable abuse control = Cloudflare Turnstile on the form — recommended fast-follow; zero MX/DNS impact.)

### What the contact form sends

When `RESEND_API_KEY` is configured AND the Resend domain is verified, every successful submission triggers TWO emails (both via the shared `functions/_lib/sendEmail.js` helper):

1. **Primary** → `CONTACT_TO_ADDRESS` (you) with the full payload, reply-to = submitter's address. This is the message you act on.
2. **Auto-acknowledgement** → the submitter's address with a one-line "we've received your message" courtesy receipt, reply-to = `masekolt@prudentiadigital.co.za`. Fires only when the primary succeeded; failures here are logged and never affect the request outcome (form's job is to capture; the ack is a bonus).

### Local development of the form

See the project-wide [Local Development](#local-development) section above. Quick recap for the contact form:

```bash
npm run build            # stage dist/
npx wrangler dev         # http://localhost:8787 — POST /contact-submit hits the Worker

# In another shell, submit a test payload:
curl -sS -X POST http://localhost:8787/contact-submit \
  -d "name=test&email=t@t.com&challenge=hi&timeline=exploring&budget=lt-25k&services=software-dev"
# → {"ok":true,"queued":false}
```

If `RESEND_API_KEY` is unset locally (the default), the handler logs the payload and returns success — useful for testing without burning quota.

### Verifying live

After deploying:

1. Send a test message via the form on `prudentiadigital.co.za#contact`.
2. Confirm the email lands at `masekolt@prudentiadigital.co.za` within ~30 s.
3. Reply-to should be the submitter's address.
4. Confirm the submitter inbox also receives the courtesy auto-acknowledgement.

### Verify with `/api/email-health` (no-send probe)

The token-gated `/api/email-health` endpoint lets you confirm the Resend wiring is configured WITHOUT firing a real email. Useful right after DNS records propagate and before you trust the form for real submissions.

```bash
# Set HEALTH_TOKEN to whatever you put in the Cloudflare Worker env vars.
curl -sS -H "X-Health-Token: $HEALTH_TOKEN" \
  https://prudentiadigital.co.za/api/email-health | jq .
```

Expected response on full-green (Resend signed up, domain verified, env vars set):

```json
{
  "apiKeyConfigured": true,
  "fromAddress": "contact-form@prudentiadigital.co.za",
  "toAddress": "masekolt@prudentiadigital.co.za",
  "resendReachable": true,
  "resendStatus": 200,
  "prudentiaDomainStatus": "verified",
  "error": null
}
```

If `prudentiaDomainStatus` is `pending` or `not_started`, finish the DNS step. If `apiKeyConfigured: false`, set `RESEND_API_KEY` in the Pages env vars.

Endpoint security: the probe is token-gated (`X-Health-Token` header must match `HEALTH_TOKEN` env var). Without a token, requests get a 401. If `HEALTH_TOKEN` itself isn't set on the Worker, the endpoint returns 503. Responses set `Cache-Control: no-store` + `X-Robots-Tag: noindex`. Only the `prudentiadigital.co.za` domain status is exposed — other domains in your Resend account are never returned.

### Inspecting submission logs

Submissions are logged via `console.log` from the Worker. View live in real time with:

```bash
npx wrangler tail prudentia-digital-website
```

Or via the Cloudflare dashboard → Workers & Pages → `prudentia-digital-website` → Logs.

Logs are retained/queryable because `wrangler.toml` enables `[observability]`. Two greppable markers:

- **`EMAIL_DELIVERY_FAILURE`** — **page-worthy.** The company did **not** receive an inquiry (missing key, unverified domain, Resend 4xx/5xx, timeout, or 429 quota). Build alerts on this string. Submission PII is masked in logs (email → `a***@domain`, no client IP).
- **`EMAIL_ACK_FAILED`** — informational. The courtesy auto-acknowledgement to the submitter failed; the company copy still arrived. **Expected** during the pre-verification window (Resend 403 to non-account recipients) — do not alert on it.

> **Free-tier quota:** Resend free = **100 emails/day, 3,000/month**. Each submission sends **2** emails (company copy + auto-ack) ⇒ ~**50 submissions/day**. Quota exhaustion surfaces as a Resend **429** → `EMAIL_DELIVERY_FAILURE` (a distinct failure mode from a missing key). Upgrade the plan or drop the auto-ack if volume approaches the cap.

---

## Company

**Prudentia Digital (Pty) Ltd**  
Enterprise No. 2025/910056/07 · CIPC registered · CSD registered  
POPIA · PFMA · PPPFA compliant  

Contact: masekolt@prudentiadigital.co.za
