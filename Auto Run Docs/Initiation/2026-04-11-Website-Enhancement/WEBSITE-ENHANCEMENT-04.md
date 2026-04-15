# Phase 04: Legal & Compliance

This phase adds the legal pages required for a professional consultancy — especially one that claims POPIA compliance. A Privacy Policy and Terms of Service are created as standalone HTML pages, and the footer/nav are updated with links to them. A lightweight cookie consent banner is included for completeness. These pages build institutional trust and satisfy enterprise/government due diligence requirements.

## Tasks

- [x] Create `privacy.html` — a POPIA-aligned Privacy Policy page:
  - Use the same HTML shell as `index.html`: charset, viewport, same CSS files (design-tokens.css, styles.css), same favicon, same Google Fonts link
  - Include the same nav bar markup from `index.html` (logo, links, hamburger) — update nav links: Services → `index.html#services`, Why Us → `index.html#why-us`, About → `index.html#about`. Add "Privacy Policy" as the active page indicator
  - Page content in a `.legal` container (centred, max-width 800px, readable typography):
    - Title: "Privacy Policy"
    - Last updated date: 11 April 2026
    - Sections (use `<h2>` for each, styled with DM Serif Display):
      1. **Introduction** — who we are (Prudentia Digital (Pty) Ltd), what this policy covers
      2. **Information We Collect** — contact form submissions (name, email, company, message), website analytics (if any), cookies
      3. **How We Use Your Information** — respond to inquiries, improve services, comply with legal obligations
      4. **Legal Basis for Processing (POPIA)** — consent (contact form), legitimate interest (analytics), legal obligation
      5. **Data Sharing** — we do not sell data, may share with: Cloudflare (hosting), email service providers. List sub-processors
      6. **Your Rights Under POPIA** — access, correction, deletion, objection, data portability. Include the Information Officer contact: masekolt@prudentiadigital.co.za
      7. **Data Retention** — inquiry data kept for 2 years, then deleted
      8. **Security** — HTTPS, access controls, encrypted storage
      9. **Cookies** — what cookies are used (Cloudflare analytics if any), how to manage them
      10. **Changes to This Policy** — we may update, last updated date at top
      11. **Contact** — Information Officer details, email, right to lodge a complaint with the Information Regulator
    - Reference POPIA (Protection of Personal Information Act, 2013) by name throughout
    - Use a professional, clear tone — not legalese, but thorough
  - Include the same footer markup from `index.html` (with the Privacy Policy link now pointing to `#` or self)
  - Include the mobile menu JS (copy the hamburger toggle + close logic from `index.html` inline script, or extract into a shared JS file — prefer extracting to `js/nav.js` to avoid duplication)

- [x] Create `terms.html` — a Terms of Service page:
  - Same HTML shell, nav, and footer structure as `privacy.html`
  - Page content sections:
    1. **Introduction** — these terms govern use of prudentiadigital.co.za and engagement with Prudentia Digital
    2. **Services** — we provide technology consulting services as described on the site. Specific deliverables, timelines, and costs are governed by individual Statements of Work (SOWs)
    3. **Engagement Process** — inquiries via contact form or email, followed by scoping, proposal, and SOW agreement
    4. **Intellectual Property** — client owns deliverables upon full payment. Prudentia retains rights to general methodologies, tools, and frameworks. Open-source components governed by their respective licenses
    5. **Payment Terms** — as specified in individual SOWs. Standard: 50% upfront, 50% on delivery (or as agreed)
    6. **Limitation of Liability** — standard professional services limitation (liability capped at fees paid for the specific engagement)
    7. **Confidentiality** — mutual NDA implied for all engagement discussions. Formal NDA available on request
    8. **Governing Law** — Republic of South Africa. Disputes resolved in courts of Gauteng
    9. **B-BBEE & Compliance** — Level 1 B-BBEE EME certified, POPIA/PFMA/PPPFA compliant
    10. **Amendments** — we may update these terms, continued use constitutes acceptance
    11. **Contact** — masekolt@prudentiadigital.co.za
  - Use the same `.legal` container and typography as the privacy page

- [x] Add shared legal page styles to `css/styles.css`:
  - `.legal` container: `max-width: 800px; margin-inline: auto; padding: calc(68px + var(--space-12)) var(--space-6) var(--space-20);` (top padding accounts for fixed nav height)
  - `.legal h1`: `font-family: var(--font-family-heading); font-size: var(--text-h1); color: var(--color-primary); margin-bottom: var(--space-4);`
  - `.legal__updated`: `font-size: var(--text-sm); color: var(--color-muted-foreground); margin-bottom: var(--space-12);`
  - `.legal h2`: `font-family: var(--font-family-heading); font-size: var(--text-h3); color: var(--color-primary); margin-top: var(--space-12); margin-bottom: var(--space-4);`
  - `.legal p, .legal li`: `font-size: var(--text-base); line-height: var(--leading-relaxed); color: var(--color-muted-foreground); margin-bottom: var(--space-4);`
  - `.legal ul, .legal ol`: `padding-left: var(--space-6); margin-bottom: var(--space-4);`
  - `.legal a`: `color: var(--color-accent); text-decoration: underline;`
  - Verify these styles work in both light and dark mode (the token variables handle this automatically)

- [x] Extract shared navigation JavaScript into `js/nav.js`:
  - Move the hamburger toggle logic, mobile menu close-on-link-click, and focus trap (from Phase 02) into `js/nav.js`
  - The nav scroll observer (watching `heroSentinel`) should remain in the inline script of `index.html` since it's page-specific (legal pages don't have a hero sentinel)
  - For legal pages, the nav should start in the `.scrolled` state (solid navy background) since there's no hero. Add a simple check: if `#heroSentinel` doesn't exist, add `.scrolled` to the nav immediately
  - Update `index.html` to load `<script src="js/nav.js" defer></script>` and remove the duplicated hamburger/focus-trap code from the inline script
  - Update `privacy.html` and `terms.html` to load the same `js/nav.js`
  - Also move the stat counter and scroll reveal logic into appropriate inline scripts or shared files — but only if it avoids duplication. The counter and reveal observers are only needed on `index.html`, so keep them inline there

- [x] Update footer navigation links across all pages:
  - In `index.html`, `privacy.html`, and `terms.html`, add links to the legal pages in the footer nav:
    - Add `<li><a href="privacy.html">Privacy Policy</a></li>`
    - Add `<li><a href="terms.html">Terms of Service</a></li>`
  - In the footer copyright line, add: `<a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a>` after the email link
  - Update `sitemap.xml` (created in Phase 01) to include the new pages: `https://prudentiadigital.co.za/privacy.html` and `https://prudentiadigital.co.za/terms.html`

- [x] Add a lightweight cookie consent banner:
  - Add a `<div class="cookie-banner" id="cookieBanner" role="alert">` at the end of `<body>` (before scripts) in all three HTML files (`index.html`, `privacy.html`, `terms.html`)
  - Content: "We use essential cookies to ensure our website functions properly. See our <a href='privacy.html#cookies'>Privacy Policy</a> for details."
  - Two buttons: "Accept" (gold accent, `.btn--accent .btn--sm`) and "Learn More" (outline, links to privacy.html)
  - On "Accept": set a `localStorage` item `cookie_consent=accepted`, hide the banner with a fade-out
  - On page load: check `localStorage` for `cookie_consent` — if already accepted, don't show the banner
  - Style `.cookie-banner` in `css/styles.css`: fixed bottom, full width, navy background, `z-index: 99`, padding, flex layout with gap between text and buttons. Shadow for elevation
  - Add the cookie consent JS logic to `js/nav.js` since it's shared across all pages

- [x] Verify Phase 04 completeness:
  - Read `privacy.html` and `terms.html` — confirm they load correctly with nav, content, and footer
  - Read `js/nav.js` — confirm it handles hamburger toggle, focus trap, cookie banner, and fallback nav scroll state
  - Read `index.html` — confirm the inline script no longer duplicates nav logic, loads `js/nav.js`
  - Read `css/styles.css` — confirm `.legal`, `.cookie-banner` styles are present
  - Read `sitemap.xml` — confirm new pages are listed
  - Check all three pages have the cookie banner markup and footer legal links
