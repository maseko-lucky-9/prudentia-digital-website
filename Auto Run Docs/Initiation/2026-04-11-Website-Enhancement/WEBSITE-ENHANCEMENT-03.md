# Phase 03: Conversion & Trust

This phase adds the features that convert visitors into leads. A working contact form replaces the mailto-only CTA, a testimonials section adds social proof, company registration numbers build institutional trust, and service pricing gets deliverable context. These changes directly address the biggest conversion gaps identified in the site audit.

## Tasks

- [x] Build a contact form in the CTA section of `index.html`:
  - Replace the current CTA section content (the mailto link and "Send an Email" button) with a contact form while keeping the section heading ("Ready to build something great?") and subtext
  - Form fields: Name (text, required), Email (email, required), Company (text, optional), Message (textarea, required)
  - Use native HTML5 validation (`required`, `type="email"`)
  - Style the form using existing design tokens — the input tokens are already defined in `design-tokens.css` (`--input-bg`, `--input-border`, `--input-focus-ring`, `--input-radius`, `--input-height-default`, etc.)
  - Submit button: use the existing `.btn .btn--accent .btn--lg` classes
  - Form action: use Cloudflare Pages Forms by setting `action="/contact-submit"` and `method="POST"`. Add a hidden field `<input type="hidden" name="_subject" value="New inquiry from prudentiadigital.co.za">`. Add a honeypot field for spam prevention: `<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">`
  - Keep the email address visible below the form as a fallback: "Prefer email? Reach us at masekolt@prudentiadigital.co.za"
  - The form should be centred within the CTA section, max-width 560px
  - Ensure all form elements have associated `<label>` elements (not just placeholder text) for accessibility
  - The form must work in dark mode (verify input backgrounds use token variables)

- [x] Add contact form styles to `css/styles.css`:
  - Create a `.cta__form` container: `max-width: 560px; width: 100%; margin-top: var(--space-8);`
  - `.cta__field` for each label+input group: `display: flex; flex-direction: column; gap: var(--space-2); text-align: left;`
  - `.cta__label` styling: `font-size: var(--text-sm); font-weight: var(--font-medium); color: rgba(255,255,255,0.75); letter-spacing: var(--tracking-wide);`
  - Input/textarea styling using `.cta__input`: `background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: var(--input-radius); color: var(--color-white); font-family: var(--font-family-body); font-size: var(--text-base); padding: var(--space-3) var(--space-4); height: var(--input-height-lg);` — on focus: `border-color: var(--color-accent); outline: none; box-shadow: 0 0 0 2px rgba(201,169,110,0.3);`
  - Textarea: `min-height: 120px; resize: vertical;`
  - Form layout: `display: flex; flex-direction: column; gap: var(--space-5);`
  - `.cta__fallback` for the email fallback text: `font-size: var(--text-sm); color: rgba(255,255,255,0.5); margin-top: var(--space-4);`
  - Ensure all styles use design token variables where possible

- [x] Create a Cloudflare Pages Function for contact form handling:
  - Create directory `functions/` in the project root
  - Create `functions/contact-submit.js` — a Cloudflare Pages Function that:
    - Handles POST requests
    - Parses form data from the request body
    - Checks the honeypot field (`_gotcha`) — if filled, return 200 silently (bot detected)
    - Validates required fields (name, email, message) — return 400 JSON error if missing
    - For now, log the submission data (in production this would forward to an email API or webhook — add a TODO comment noting this)
    - Returns a redirect to a thank-you anchor or a simple JSON success response
  - Create `functions/_middleware.js` if needed for CORS headers (may not be needed for same-origin form submissions)
  - Note: Cloudflare Pages Functions use the `onRequest` export pattern: `export async function onRequestPost(context) { ... }`

- [x] Add a form success/error state handler in the inline `<script>` of `index.html`:
  - Intercept the form submission with `addEventListener('submit', ...)` and use `fetch()` to submit via AJAX instead of a full page reload
  - On success: hide the form fields, show a "Thank you! We'll be in touch within 24 hours." message styled with gold accent text
  - On error: show an inline error message below the submit button in red (`--color-destructive`)
  - On network failure: fall back gracefully — show a message suggesting the user email directly
  - Add a simple loading state: disable the submit button and change its text to "Sending..." during submission

- [x] Add a testimonials/social proof section between the "Why Us" and "About" sections in `index.html`:
  - New `<section class="testimonials" id="testimonials" aria-labelledby="testimonials-heading">`
  - Section header: eyebrow "What Clients Say", heading "Trusted by Decision-Makers", gold line separator
  - Include 3 testimonial cards in a responsive grid (1 col mobile, 3 col desktop):
    - Each card: a quote paragraph, the person's name (bold), their title and company
    - Use placeholder testimonials that sound realistic for a South African IT consultancy:
      1. A government procurement officer praising B-BBEE compliance and delivery quality
      2. A fintech startup CTO praising senior-level engagement and speed
      3. An enterprise IT director praising architecture quality at SME pricing
    - Add a subtle gold quote mark (") as a decorative element in each card
    - Mark placeholder quotes with a data attribute `data-placeholder="true"` so they can be identified and replaced later
  - Style the testimonial cards similar to the existing service cards (use `--card-bg`, `--card-border`, `--card-radius`, `--card-shadow` tokens)
  - Add `.testimonials` and `.testimonial__*` styles to `css/styles.css`
  - Apply the existing `.reveal` animation class to cards for scroll-triggered entrance

- [x] Add CSD/CIPC registration numbers to the footer in `index.html`:
  - In the `.footer__meta` div, after the B-BBEE badge paragraph, add:
    ```
    <p class="footer__registration">Enterprise No. 2025/910056/07 · CIPC Registered · CSD Registered</p>
    ```
  - Style `.footer__registration` in `css/styles.css`: `font-size: var(--text-caption); color: rgba(255,255,255,0.35); line-height: var(--leading-relaxed);`
  - This data is already in the README but not visible on the public site — government and enterprise clients check for these numbers

- [x] Add deliverable context to service pricing in `index.html`:
  - Below each `<p class="card__price">` in the service cards, add a `<p class="card__scope">` with brief deliverable context:
    - Web Application Development: "Includes: discovery, UI/UX, development, testing, deployment"
    - Cloud Infrastructure & DevOps: "Includes: architecture, IaC setup, CI/CD, monitoring"
    - Data Analytics & Dashboards: "Includes: data audit, pipeline setup, dashboard build, training"
    - Digital Transformation Advisory: "Includes: assessment, roadmap, vendor evaluation, governance"
    - API Development & Integration: "Includes: API design, development, documentation, testing"
    - Government & Enterprise Tenders: "Includes: compliance documentation, technical proposal, delivery"
  - Style `.card__scope` in `css/styles.css`: `font-size: var(--text-caption); color: var(--color-muted-foreground); margin-top: var(--space-2); line-height: var(--leading-relaxed);`
  - For the accent card (Government & Enterprise Tenders), ensure `.card--accent .card__scope` uses `rgba(255,255,255,0.55)` for readable text on the dark background

- [x] Verify Phase 03 changes:
  - Read `index.html` and confirm: contact form is in the CTA section with all fields and labels, testimonials section exists between Why Us and About, registration numbers in footer, scope text under each service card price
  - Read `css/styles.css` and confirm: form styles, testimonial styles, registration and scope styles all present
  - Verify `functions/contact-submit.js` exists and exports `onRequestPost`
  - Confirm the form AJAX handler is in the inline script
  - Check that the new testimonials section has proper `aria-labelledby` and uses the `.reveal` animation class
