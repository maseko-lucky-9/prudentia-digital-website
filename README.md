# Prudentia Digital — Company Website

Landing page for [Prudentia Digital](https://prudentiadigital.co.za) — an AI-augmented IT consultancy based in South Africa.  
Live at **prudentiadigital.co.za**, deployed via Cloudflare Pages.

---

## Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styles | Vanilla CSS (custom design tokens, no framework) |
| Scripts | Vanilla JS (no libraries or bundler) |
| Fonts | DM Serif Display + Inter (Google Fonts) |
| CI/CD | GitHub Actions → Cloudflare Pages (`wrangler-action`) |

Zero runtime dependencies. No build step required.

---

## Project Structure

```
prudentia-digital-website/
├── assets/
│   ├── logo-icon.svg               # "Precision P" SVG logo
│   └── logo-icon-white-512.png     # PNG variant for footer
├── css/
│   ├── design-tokens.css           # Brand colours, typography, spacing (source of truth)
│   ├── styles.css                  # Page layout and component styles
│   └── animated-bg.css             # Canvas animation layer styles
├── js/
│   └── animated-bg.js              # IntersectionObserver-driven canvas backgrounds
├── .claude/
│   └── skills/                     # Department AI personas (engineering, design, etc.)
├── .github/
│   └── workflows/deploy.yml        # Cloudflare Pages deployment pipeline
└── index.html                      # Single-page site
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
8. **Contact / CTA** — multi-step "Get Started" form (POST → `/contact-submit` Cloudflare Pages Function → Resend)
9. **Footer** — brand, nav links, registration details, copyright

---

## Local Development

No build step or package manager needed. Open directly in a browser:

```bash
open index.html
# or serve locally to avoid CORS issues with fonts:
npx serve .
```

---

## Deployment

Push to `main` → GitHub Actions runs `.github/workflows/deploy.yml` → Cloudflare Pages deploy.

**Required secrets** (set in GitHub repository settings):

| Secret | Description |
|---|---|
| `CF_API_TOKEN` | Cloudflare API token with Pages write permission |
| `CF_ACCOUNT_ID` | Cloudflare account ID |

The Cloudflare project name is `prudentia-digital`.

---

## Email delivery (contact form)

The "Get Started" contact form posts to `/contact-submit`, a Cloudflare Pages Function (`functions/contact-submit.js`). It validates the payload and forwards via the **Resend** HTTP API.

### Required setup

1. **Sign up for Resend** at [resend.com](https://resend.com) using `masekolt@prudentiadigital.co.za` as the account email (so the pre-verification fallback can send to that address).
2. **Add a domain** for `prudentiadigital.co.za` in the Resend dashboard. Add the DKIM, SPF, and return-path DNS records to the domain registrar. Wait for the dashboard to mark the domain "verified" (usually 5–60 min).
3. **Create an API key** in Resend → API Keys.
4. **Set Cloudflare Pages environment variables** (Project → Settings → Environment variables) for **both Production and Preview**:

| Variable | Value | Required? |
|---|---|---|
| `RESEND_API_KEY` | the key from step 3 | yes — without it the function logs and returns `{ok: true, queued: false}` |
| `RESEND_FROM_ADDRESS` | `contact-form@prudentiadigital.co.za` (post-verification) — defaults to `onboarding@resend.dev` (Resend's universal test sender, sends only to the Resend account email) | optional |
| `CONTACT_TO_ADDRESS` | `masekolt@prudentiadigital.co.za` (default) | optional override |

5. **Optional: per-IP rate limit.** Create a KV namespace called `FORM_RATELIMIT` and bind it to the Pages project. The function throttles each IP to 5 submissions / 10 min. If the binding is absent, the function accepts all requests (honeypot remains the only spam line of defence).

### Local development

```bash
# Static preview (no functions):
npx serve .

# Full local environment with functions + KV emulation:
npx wrangler pages dev .
# then visit http://localhost:8788 — submitting the form will log to the terminal.
```

If `RESEND_API_KEY` is unset locally, the function logs the payload and returns success — useful for testing without burning quota.

### Verifying live

After deploying:

1. Send a test message via the form on `prudentiadigital.co.za#contact`.
2. Confirm the email lands at `masekolt@prudentiadigital.co.za` within ~30 s.
3. Reply-to should be the submitter's address.
4. Check Cloudflare Pages → Functions → Logs for the structured submission log.

---

## Company

**Prudentia Digital (Pty) Ltd**  
Enterprise No. 2025/910056/07 · CIPC registered · CSD registered  
POPIA · PFMA · PPPFA compliant  

Contact: masekolt@prudentiadigital.co.za
