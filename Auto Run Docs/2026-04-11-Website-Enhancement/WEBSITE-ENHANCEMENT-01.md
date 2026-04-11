# Phase 01: Foundation & Quick Wins

This phase transforms the bare-bones static site into a production-ready foundation. It adds SEO essentials (robots.txt, sitemap, Open Graph, structured data), Cloudflare security headers, a branded 404 page, accessibility quick-fixes, and a hardened .gitignore. By the end, the site will be discoverable, secure, accessible, and ready for the feature work in later phases.

## Tasks

- [x] Create SEO foundation files in the project root:
  - `robots.txt` allowing all crawlers, pointing to `https://prudentiadigital.co.za/sitemap.xml`
  - `sitemap.xml` with the single page `https://prudentiadigital.co.za/` (lastmod: 2026-04-11, changefreq: monthly, priority: 1.0). Leave a comment indicating where to add future pages
  - Both files must be valid and well-formed

- [x] Add Open Graph, Twitter Card meta tags, and canonical URL to `index.html`:
  - Insert after the existing `<meta name="description">` tag
  - Canonical: `<link rel="canonical" href="https://prudentiadigital.co.za/">`
  - Open Graph tags: `og:title` (match existing `<title>`), `og:description` (match existing meta description), `og:url` (canonical URL), `og:type` (website), `og:site_name` (Prudentia Digital), `og:locale` (en_ZA), `og:image` (use `https://prudentiadigital.co.za/assets/logo-icon-white-512.png` as placeholder — note this should be replaced with a proper 1200x630 OG image later)
  - Twitter Card tags: `twitter:card` (summary), `twitter:title`, `twitter:description`, `twitter:image` (same as og:image)
  - Keep all meta tags grouped with a comment: `<!-- Social & SEO meta -->`

- [x] Add JSON-LD structured data to `index.html`:
  - Insert a `<script type="application/ld+json">` block just before the closing `</head>` tag
  - Schema type: combined `Organization` + `LocalBusiness`
  - Include: `name` (Prudentia Digital), `url` (https://prudentiadigital.co.za), `logo` (logo-icon-white-512.png absolute URL), `description` (from existing meta), `email` (masekolt@prudentiadigital.co.za), `address` (South Africa — use `addressCountry: "ZA"`), `sameAs` (empty array for now — placeholder for social links)
  - Include `makesOffer` array with the 6 services listed on the page (name + description for each)
  - Validate the JSON-LD is well-formed (proper commas, no trailing commas, correct nesting)

- [x] Harden the `.gitignore` file — replace the current single-entry file with comprehensive exclusions:
  - OS files: `.DS_Store`, `Thumbs.db`, `Desktop.ini`, `*.swp`, `*.swo`, `*~`
  - IDE/editor: `.idea/`, `.vscode/` (except `.vscode/settings.json` if it exists), `*.sublime-*`, `*.code-workspace`
  - Claude Code: `.claude/launch.json` (keep existing entry)
  - Node.js (in case `npx serve` is used): `node_modules/`, `.npm`, `.cache/`
  - Deploy artifacts: `.wrangler/`, `dist/`, `build/`
  - Environment: `.env`, `.env.*`
  - Logs: `*.log`
  - Keep it clean and commented by category

- [x] Create a branded `404.html` error page in the project root:
  - Match the existing site's visual style — use the same CSS files (`css/design-tokens.css`, `css/styles.css`)
  - Dark navy background (matching the hero/nav), white text, gold accent
  - Include the SVG logo (inline, same as nav logo), a "404 — Page Not Found" heading in DM Serif Display, a brief friendly message, and a gold CTA button linking back to `/`
  - Include proper `<meta>` tags (charset, viewport)
  - Keep it lightweight — no animated backgrounds or JavaScript needed
  - Ensure it works standalone (all paths relative to root)

- [x] Create a Cloudflare `_headers` file in the project root for security headers:
  - Apply to all routes (`/*`):
    - `X-Frame-Options: DENY`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
    - `X-XSS-Protection: 1; mode=block`
    - `Content-Security-Policy`: allow `self`, Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), inline scripts (the site uses inline `<script>` blocks — use `'unsafe-inline'` for now with a TODO comment to move to nonce-based CSP later), inline styles (`'unsafe-inline'`), images from self and data URIs
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - Reference Cloudflare Pages _headers documentation format (one header per line, indented under the path pattern)

- [x] Fix accessibility quick-wins in `index.html`:
  - Add a skip-to-content link as the first child of `<body>`: `<a href="#main" class="skip-link">Skip to main content</a>`. The skip-link should be visually hidden but appear on focus (position it absolutely off-screen, bring it on-screen with `:focus` styles)
  - Fix logo `href="#"` to `href="/"` in both the nav logo (`a.nav__logo`) and footer logo (`a.footer__logo`)
  - Change the hero `<header>` tag to `<section>` (it's not a document header, it's a content section). Update the corresponding CSS selector if the `header.hero` selector is used anywhere (check `styles.css` — the current selector is `.hero` class-based so no CSS change needed, but verify)
  - Add the `.skip-link` CSS to `css/styles.css`: visually hidden by default (`position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden;`), on `:focus` bring it into view (`position: fixed; top: 8px; left: 8px; z-index: 200; width: auto; height: auto; padding: 12px 24px; background: var(--color-accent); color: var(--color-navy-900); font-weight: var(--font-semibold); border-radius: var(--radius-md); text-decoration: none;`)

- [ ] Add `<link rel="preload">` for critical CSS in `index.html`:
  - Add `<link rel="preload" href="css/design-tokens.css" as="style">` before the existing stylesheet links
  - Add `<link rel="preload" href="css/styles.css" as="style">` before the existing stylesheet links
  - The animated-bg.css is non-critical and should NOT be preloaded
  - This ensures the browser fetches design tokens and layout styles with high priority

- [ ] Verify all new files are well-formed by reviewing the final state:
  - Open and read `robots.txt`, `sitemap.xml`, `404.html`, `_headers`, `.gitignore` to confirm they were created correctly
  - Open `index.html` and verify the meta tags, JSON-LD, skip-link, href fixes, and preload links are all in place
  - Open `css/styles.css` and verify the `.skip-link` styles were added
  - Confirm no existing functionality was broken (all section IDs still present, all links still work, all CSS class references intact)
