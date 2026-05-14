# Phase 06 Backlog — Prudentia Digital Website

**Created:** 2026-05-14
**Status:** Active backlog. Items here were deliberately scoped out of the Phase 06 Polish & Honesty Pass and remain to be done.
**Context:** The Phase 06 pass swapped the founder avatar to a real headshot, replaced unsubstantiated portfolio / testimonial / blog placeholder cards with honest "coming soon" copy, regenerated the OG social card at 1200×630, expanded the sitemap, and added PWA icons at 192/384. The items below are real follow-ups, not aspirational ideas.

---

## 1. Wire contact-form email delivery (Resend)

- **Where:** `functions/contact-submit.js:5-7` (TODO comment + line 56 `console.log`).
- **What:** The handler validates input and returns `200 OK`, but never delivers anywhere. Production inquiries submitted via the homepage form are silently dropped.
- **Why now:** This is the only conversion path on the site. Every dropped submission = lost revenue.
- **How:**
  1. Create a Resend account (free tier: 100/day, 3K/month) and verify the `prudentiadigital.co.za` domain.
  2. Add Cloudflare Pages env var: `RESEND_API_KEY` (Pages → Settings → Environment variables → Production + Preview).
  3. Replace the `console.log` block in `functions/contact-submit.js` with a `fetch('https://api.resend.com/emails', …)` POST. From: `notifications@prudentiadigital.co.za`. To: `masekolt@prudentiadigital.co.za`. Subject pulled from the `_subject` hidden field.
  4. Add a test that asserts the function returns 500 when the key is missing (don't ship a silent-fail behaviour).
- **Estimate:** 30 min once the Resend domain is verified (DNS propagation may take a few hours).
- **Acceptance:** Submit the homepage form → receive an email in masekolt@ inbox within 30 seconds.

## 2. Add real social handles to Schema.org `sameAs`

- **Where:** `index.html:62` — currently `"sameAs": []`.
- **What:** LinkedIn company page URL + GitHub org URL (and any others the company actually publishes from).
- **Why:** Empty `sameAs` is a missed knowledge-graph signal for Google. It also looks half-built when crawled.
- **How:** Add the URLs as a JSON array. Confirm each URL returns 200 before publishing.
- **Estimate:** 5 min after handles are confirmed.

## 3. Replace empty-state copy with real content

The Phase 06 pass converted three sections to "coming soon" notes. They should become real content as engagements and editorial production allow:

- **Portfolio** (`index.html`, replaces `.portfolio__grid`) — target: 2–3 case studies. Each needs client sign-off on what can be published. Anonymised case studies are acceptable if the brief is conservative.
- **Testimonials** (`index.html`, replaces `.testimonials__grid`) — target: 2–3. Get written permission to quote and attribute.
- **Blog** (`blog/index.html`) — target: at least one published article. Existing draft topics in git history (Zero-Downtime K8s, POPIA for Developers, Executive Dashboards) are good candidates if rewritten as first-party experience pieces.

The HTML scaffolding (`.portfolio__grid`, `.testimonials__grid`, `.blog__posts`, and their card styles) is preserved in CSS, so re-adding cards is a markup-only change.

## 4. CSP hardening (move off `'unsafe-inline'`)

- **Where:** `_headers:8` (Content-Security-Policy header). TODO comment already present.
- **What:** Move from `'unsafe-inline'` for `script-src` and `style-src` to a nonce-based or hash-based CSP. This requires first extracting inline `<script>` and `<style>` blocks from `index.html` (there are several — see e.g. the inline `<style>` in `blog/index.html:13-124` and the JSON-LD `<script>` block in `index.html`).
- **Why:** Currently the CSP provides limited XSS protection. Nonce-based CSP is the industry standard.
- **Dependency:** Item 5 (inline-script extraction) must happen first.
- **Estimate:** 2 hours including testing across all pages.

## 5. Extract inline scripts & styles

- **Where:** Multiple inline `<script>` and `<style>` blocks across `index.html`, `blog/index.html`, `privacy.html`, `terms.html`, `404.html`.
- **What:** Move all inline JS to files under `js/` and all inline CSS to files under `css/`. Reference via `<script src="…">` and `<link rel="stylesheet" href="…">` with cache-busting `?v=` query params.
- **Why:** Prerequisite for CSP hardening (item 4). Also makes the codebase easier to lint and review.
- **Estimate:** 1 hour.

## 6. Analytics (Plausible — POPIA-friendly)

- **Where:** Currently no analytics anywhere. The cookie banner exists but only references "essential" cookies.
- **What:** Add Plausible (or alternative cookie-free analytics — Fathom, Simple Analytics, Umami self-hosted).
- **Why:** No visibility into traffic, referrers, or conversion. Can't tell which channels are working.
- **How:** Single `<script defer data-domain="prudentiadigital.co.za" src="https://plausible.io/js/script.js"></script>` in `<head>` of each HTML page. No cookie banner change needed (Plausible doesn't use cookies).
- **Estimate:** 15 min.

## 7. README freshness

- **Where:** `README.md` (specifically sections 5–7 — "Page Sections", "Local Development", "Deployment").
- **What:** README still describes a pre-phase-05 site: no portfolio, no testimonials, no team section, no blog. Update to match what's actually deployed.
- **Estimate:** 15 min.

## 8. Lighthouse / Core Web Vitals pass

- **Where:** All public pages.
- **What:** Run Lighthouse against production. Address any score below 95 on performance, accessibility, best practices, SEO. Particularly: the homepage is large (46KB HTML) and may benefit from inlining critical CSS more aggressively.
- **Estimate:** 1–3 hours depending on findings.

## 9. Sentry (or equivalent) error tracking

- **Where:** Currently no client- or function-side error reporting.
- **What:** Add Sentry browser SDK to all pages and Sentry edge SDK to the Cloudflare Pages Functions. Helps catch errors in `contact-submit.js` and the cookie-consent logic in production.
- **Estimate:** 30 min once a Sentry project exists.

## 10. PWA icon — proper maskable variant

- **Where:** `manifest.json:icons` — the 512 entry currently has `"purpose": "any maskable"` but the underlying PNG is not designed with safe-zone padding for maskable use. The 192/384 entries added in Phase 06 are `"purpose": "any"` only.
- **What:** Generate a dedicated maskable variant (logo on solid navy background with 10% safe-zone padding) and add it as a separate icon entry.
- **Why:** Android home-screen install will currently crop the logo into a circle awkwardly.
- **Estimate:** 20 min.

---

## Out of scope for this backlog

- Adding a CMS (the site is small enough to stay file-based).
- Adopting a framework (Astro/Eleventy). Worth revisiting only if content output exceeds ~30 pages.
- Migrating away from Cloudflare Pages (no current pain points).
