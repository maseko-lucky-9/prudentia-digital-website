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
3. **Proof strip** — animated stat counters (enterprise pedigree, B-BBEE level, stack coverage)
4. **Services** — 6 service cards with pricing:
   - Web Application Development — from R50 000
   - Cloud Infrastructure & DevOps — from R30 000
   - Data Analytics & Dashboards — from R25 000
   - Digital Transformation Advisory — from R15 000
   - API Development & Integration — from R20 000
   - Government & Enterprise Tenders — contact for scope
5. **Why Us** — senior-led delivery, B-BBEE, regulatory fluency, full-stack accountability
6. **About** — company story and the meaning of *Prudentia*
7. **Contact / CTA** — mailto link
8. **Footer** — brand, nav links, B-BBEE badge, copyright

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

## Company

**Prudentia Digital (Pty) Ltd**  
Enterprise No. 2025/910056/07 · CIPC registered · CSD registered  
100% Black-owned · Level 1 B-BBEE EME (135% procurement recognition)  
POPIA · PFMA · PPPFA compliant  

Contact: thulani@prudentiadigital.co.za
