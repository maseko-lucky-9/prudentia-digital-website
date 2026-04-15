# Hotfix: Service Cards & Email Address Update

Two targeted changes: replace the `card__price` pricing elements in the services grid with catchy per-service taglines, and update all `masekolt@prudentiadigital.co.za` references to `masekolt@prudentiadigital.co.za` across the entire codebase.

## Tasks

- [x] Replace all `card__price` elements in `index.html` with per-service tagline elements:
  - Change `<p class="card__price">` to `<p class="card__tagline">` for all 6 service cards
  - Replace each pricing string with the following per-card taglines:
    - Web Application Development: `"Prototype to production-grade."`
    - Cloud Infrastructure & DevOps: `"Zero downtime. Zero guesswork."`
    - Data Analytics & Dashboards: `"Decisions, not just data."`
    - Digital Transformation Advisory: `"Clarity that pays for itself."`
    - API Development & Integration: `"Connect everything, reliably."`
    - Government & Enterprise Tenders: `"Win more. Deliver better."` (this is the `.card--accent` card — ensure the tagline still reads well on the dark accent background)
  - Also update the services section subheading on line ~235 from `"Enterprise-grade delivery across the full technology stack — priced for growing businesses."` to `"Enterprise-grade delivery across the full technology stack — built for your ambitions."`
  - Add `.card__tagline` styles to `css/styles.css`:
    - Copy the existing `.card__price` rule as the base (same font-size and spacing), then change:
    - `font-family: var(--font-family-heading)` → keep or set to `var(--font-family-body)`
    - `font-size: var(--text-sm)`
    - `font-weight: var(--font-semibold)`
    - `color: var(--color-accent)`
    - `letter-spacing: var(--tracking-wide)`
    - `margin-top: var(--space-4)`
    - For `.card--accent .card__tagline`: `color: rgba(255,255,255,0.85)`
  - **Note:** Phase 03 plans to add `card__scope` content *below* `card__price`. Since `card__price` is being renamed to `card__tagline`, update Phase 03's WEBSITE-ENHANCEMENT-03.md task to reference `card__tagline` instead of `card__price`. Place `card__scope` below `card__tagline`.

- [x] Update all email address references from `masekolt@prudentiadigital.co.za` to `masekolt@prudentiadigital.co.za`:
  - In `index.html`:
    - Nav CTA link `href="mailto:thulani@..."` (line ~141)
    - Mobile nav link `href="mailto:thulani@..."` (line ~156)
    - Hero/proof area link (line ~181)
    - Footer email `<a href="mailto:thulani@..."` (line ~414 and ~421)
    - Footer nav contact link (line ~451)
    - Footer copyright area (line ~462)
    - `aria-label="Send an email to thulani@..."` attribute — update the label text too
  - In `404.html` (if the email appears there — check first)
  - In the Auto Run planning documents — update these files in `/Auto Run Docs/`:
    - `Initiation/2026-04-11-Website-Enhancement/WEBSITE-ENHANCEMENT-03.md` — replace `masekolt@prudentiadigital.co.za` with `masekolt@prudentiadigital.co.za` wherever it appears in the task descriptions (contact form fallback text, CSD/CIPC registration task)
    - `Initiation/2026-04-11-Website-Enhancement/WEBSITE-ENHANCEMENT-04.md` — replace all instances of `thulani@` in POPIA policy content, Terms contact sections, and cookie consent tasks
    - `Initiation/2026-04-11-Website-Enhancement/WEBSITE-ENHANCEMENT-05.md` — replace in team bio section and blog author references
  - Verify `index.html` line 51 already has `masekolt@` in the JSON-LD — confirm this is correct and leave it

- [x] Verify the changes are correct:
  - Read `index.html` and confirm: zero occurrences of `masekolt@prudentiadigital.co.za`, all 6 `card__tagline` elements present with correct text, services subheading updated
  - Read `css/styles.css` and confirm: `.card__tagline` rule is present and `.card--accent .card__tagline` override exists
  - Run a grep across the project for `thulani@` to confirm no stray references remain: `grep -r "thulani@" --include="*.html" --include="*.js" --include="*.css" --include="*.md" --include="*.json" .`
