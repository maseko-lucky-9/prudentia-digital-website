# Phase 01: Service Cards & Email Address Hotfix

Two targeted, production-ready changes: replace the six `card__price` pricing elements in the services grid with punchy per-service taglines (including a CSS rule for the new class and a subheading refresh), then sweep every `masekolt@prudentiadigital.co.za` occurrence across the entire project and replace it with `masekolt@prudentiadigital.co.za`. When this phase completes the site will be visually correct, price-free, and pointing to the right inbox.

## Tasks

- [x] Update `index.html` service card pricing elements with per-service taglines:
  - On line ~235 change the services section subheading from `"Enterprise-grade delivery across the full technology stack — priced for growing businesses."` to `"Enterprise-grade delivery across the full technology stack — built for your ambitions."`
  - Replace all six `<p class="card__price">` elements with `<p class="card__tagline">` and use these tagline strings:
    - Web Application Development card → `"Prototype to production-grade."`
    - Cloud Infrastructure & DevOps card → `"Zero downtime. Zero guesswork."`
    - Data Analytics & Dashboards card → `"Decisions, not just data."`
    - Digital Transformation Advisory card → `"Clarity that pays for itself."`
    - API Development & Integration card → `"Connect everything, reliably."`
    - Government & Enterprise Tenders card (`.card--accent`) → `"Win more. Deliver better."`

- [x] Add `.card__tagline` CSS rule to `css/styles.css`:
  - Find the existing `.card__price` rule (around line 817) and add a new `.card__tagline` rule immediately after it using these declarations:
    ```css
    .card__tagline {
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      color: var(--color-accent);
      letter-spacing: var(--tracking-wide);
      margin-top: var(--space-4);
    }

    .card--accent .card__tagline {
      color: rgba(255, 255, 255, 0.85);
    }
    ```
  - Leave the original `.card__price` and `.card--accent .card__price` rules in place (they may still be referenced by tests or future phases)

- [x] Replace all `masekolt@prudentiadigital.co.za` occurrences with `masekolt@prudentiadigital.co.za` across the project:
  - In `index.html`: update every `href="mailto:thulani@..."`, every `aria-label` containing the old address, and every visible text occurrence (nav CTA ~line 141, mobile nav ~line 156, hero CTA ~line 181, footer icon link ~lines 414–417, footer text link ~line 421, footer nav link ~line 451, footer copyright link ~line 462)
  - In `404.html`: check for any occurrences and replace if found
  - In Auto Run planning docs under `Auto Run Docs/Initiation/2026-04-11-Website-Enhancement/`:
    - `WEBSITE-ENHANCEMENT-03.md` — replace in contact form fallback text and CSD/CIPC registration task
    - `WEBSITE-ENHANCEMENT-04.md` — replace in POPIA policy content, Terms contact sections, and cookie consent tasks
    - `WEBSITE-ENHANCEMENT-05.md` — replace in team bio section and blog author references
  - **Do not** touch line 51 of `index.html` — the JSON-LD `"email"` field already correctly shows `masekolt@prudentiadigital.co.za`

- [x] Verify all changes are correct and complete:
  - Run: `grep -r "thulani@" --include="*.html" --include="*.js" --include="*.css" --include="*.md" --include="*.json" .` — expect zero matches
  - Run: `grep -c "card__tagline" index.html` — expect 6
  - Run: `grep -c "card__price" index.html` — expect 0
  - Confirm `css/styles.css` contains both `.card__tagline` and `.card--accent .card__tagline` rules
  - Confirm the services subheading contains `"built for your ambitions"`
