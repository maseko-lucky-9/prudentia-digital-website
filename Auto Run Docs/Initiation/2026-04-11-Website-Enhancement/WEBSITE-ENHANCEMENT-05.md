# Phase 05: Content & Growth

This phase adds the content sections that support long-term growth — a team/founder bio that humanises the brand, a portfolio section that validates capabilities, a blog scaffold for inbound SEO, and basic PWA setup for installability. These aren't launch-critical but they transform the site from a landing page into a credible digital presence.

## Tasks

- [x] Add a team/founder bio section to `index.html` between the About section and the CTA section:
  - New `<section class="team" id="team" aria-labelledby="team-heading">`
  - Section header: eyebrow "Who We Are", heading "Meet the Team", gold line separator
  - Include a founder card with:
    - A placeholder image area (use a CSS-styled circle with the person's initials "TM" as fallback — `width: 120px; height: 120px; border-radius: 50%; background: var(--color-navy-700); color: var(--color-accent); display: flex; align-items: center; justify-content: center; font-family: var(--font-family-heading); font-size: var(--text-h2);`). Wrap in a `<picture>` element with a commented-out `<img>` tag so a real photo can be dropped in later: `<!-- Replace with: <img src="assets/team/thulani.webp" alt="Thulani Maseko" width="120" height="120"> -->`
    - Name: "Thulani Maseko" (use the name from the email address pattern)
    - Title: "Founder & Principal Consultant"
    - Brief bio paragraph: highlight enterprise background (Capitec, Absa, E4 Strategic), full-stack expertise, and the vision behind Prudentia Digital. Keep it to 2-3 sentences
    - Mark with `data-placeholder="true"` so the user knows to personalise the bio content
  - Layout: on desktop, image left + text right in a horizontal card. On mobile, stack vertically centred
  - Style using existing card tokens. Add `.team` and `.team__*` styles to `css/styles.css`
  - Apply `.reveal` animation classes for scroll entrance

- [x] Add a portfolio/case studies section to `index.html` between the Services section and the Why Us section:
  - New `<section class="portfolio" id="portfolio" aria-labelledby="portfolio-heading">`
  - Section header: eyebrow "Our Work", heading "Selected Projects", gold line separator
  - Include 3 placeholder case study cards in a responsive grid (1 col mobile, 3 col desktop):
    - Each card has: a category tag (e.g., "Web Application", "Cloud & DevOps", "Data Analytics"), a project title, a 2-sentence description, and a "View Details" link (disabled/placeholder for now)
    - Placeholder projects:
      1. "Enterprise Procurement Portal" — Government tender management platform with role-based access, B-BBEE scoring, and document workflow
      2. "Cloud Migration & CI/CD Pipeline" — Kubernetes migration for a fintech SaaS platform with Terraform IaC and Prometheus monitoring
      3. "Executive Analytics Dashboard" — Multi-source data aggregation dashboard with ML-powered categorisation and automated PDF reporting
    - Mark with `data-placeholder="true"` for later replacement with real case studies
  - Style cards similar to service cards but with a category badge at the top (use `--badge-*` tokens from design-tokens.css). Add `.portfolio` and `.portfolio__*` styles to `css/styles.css`
  - Apply `.reveal` animation classes with staggered `--reveal-delay`

- [x] Update the nav links to include the new sections:
  - In the desktop nav links (`ul.nav__links`), add "Portfolio" (`href="#portfolio"`) between "Services" and "Why Us"
  - In the mobile nav (`ul.nav__mobile-links`), add the same "Portfolio" link in the same position
  - In the footer nav, add "Portfolio" (`href="#portfolio"`) and "Team" (`href="#team"`) links
  - Update `privacy.html` and `terms.html` footer nav links to match (these link back to `index.html#portfolio` and `index.html#team`)
  - In `js/nav.js`, the mobile menu close-on-link-click handler already uses `mobileMenu.querySelectorAll('a')` so new links are automatically covered

- [x] Create a blog scaffold — a `blog.html` listing page and one sample post:
  - `blog.html` — Blog listing page:
    - Same HTML shell, nav, and footer as legal pages
    - Nav: add "Insights" link in desktop and mobile nav across all pages (index.html, privacy.html, terms.html, blog.html). Position after "About"
    - Page content: heading "Insights", subtext "Thoughts on technology, delivery, and digital transformation in South Africa"
    - A grid of blog post cards (1 col mobile, 2 col desktop, max-width 900px centred)
    - One sample card linking to `blog/ai-augmented-consultancy.html`:
      - Date: "11 April 2026"
      - Title: "What AI-Augmented Consultancy Actually Means"
      - Excerpt: 2 sentences about how AI tools enhance (not replace) senior engineering judgment
      - "Read More →" link
    - Mark sample content with `data-placeholder="true"`
  - `blog/ai-augmented-consultancy.html` — Sample blog post:
    - Create `blog/` directory
    - Same HTML shell — CSS paths adjusted to `../css/` and JS to `../js/`
    - Article layout: centred, max-width 720px, readable typography
    - Title, date, author ("Thulani Maseko"), estimated read time
    - 3-4 paragraphs of placeholder content about AI-augmented consultancy (marked with `data-placeholder="true"`)
    - "← Back to Insights" link at the bottom
  - Add `.blog` and `.blog__*` styles to `css/styles.css`: listing grid, post card, article typography
  - Update `sitemap.xml` with `blog.html` and `blog/ai-augmented-consultancy.html`

- [x] Create `manifest.json` and basic PWA setup:
  - Create `manifest.json` in the project root:
    - `name`: "Prudentia Digital"
    - `short_name`: "Prudentia"
    - `description`: from existing meta description
    - `start_url`: "/"
    - `display`: "standalone"
    - `background_color`: "#0D1B2A" (navy-900)
    - `theme_color`: "#0D1B2A"
    - `icons`: reference the existing `assets/logo-icon-white-512.png` at 512x512. Add a TODO comment for creating proper PWA icon sizes (192x192, 384x384)
  - Add `<link rel="manifest" href="manifest.json">` to the `<head>` of all HTML pages
  - Add `<meta name="theme-color" content="#0D1B2A">` to all HTML pages
  - Do NOT create a service worker at this stage — that's a bigger lift for a future phase. The manifest alone enables "Add to Home Screen" on mobile and sets the theme colour in browser chrome
  - Add `<meta name="apple-mobile-web-app-capable" content="yes">` and `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` for iOS

- [x] Final verification of Phase 05 and overall site integrity:
  - Read every HTML file (index.html, privacy.html, terms.html, blog.html, blog/ai-augmented-consultancy.html, 404.html) and confirm:
    - All nav links are consistent across pages
    - All footer links match (including legal pages, portfolio, team)
    - manifest.json and theme-color meta tags present in all pages
    - Cookie banner markup present in all pages
  - Read `sitemap.xml` and confirm all pages are listed
  - Read `manifest.json` and confirm it's valid JSON
  - Read `css/styles.css` and confirm team, portfolio, blog styles are present
  - Verify no broken cross-references (IDs used in aria-labelledby all exist, href anchors all have matching IDs)
  - Confirm the section order in index.html is: Nav → Hero → Proof → Services → Portfolio → Why Us → Testimonials → About → Team → CTA (with contact form) → Footer
