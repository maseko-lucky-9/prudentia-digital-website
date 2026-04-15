# Phase 02: Accessibility & Performance

This phase hardens the site for keyboard users, screen readers, and slow connections. It adds a mobile menu focus trap, cleans up semantic HTML, activates the dark mode tokens already defined in design-tokens.css, optimises font loading with local fallbacks, and adds cache-busting to static assets. The result is a faster, more inclusive site that respects user preferences.

## Tasks

- [x] Implement mobile menu focus trap in the inline `<script>` block of `index.html`:
  - When the mobile menu opens (`navMobile` gains the `open` class), trap keyboard focus within the menu and the hamburger close button
  - On open: move focus to the first menu link
  - On Tab from the last focusable element (the "Get in Touch" link), wrap to the hamburger button. On Shift+Tab from the hamburger button, wrap to the last link
  - On Escape key: close the menu, return focus to the hamburger button
  - On close (via link click or hamburger toggle): restore focus to the hamburger button
  - Search the existing mobile menu JS in `index.html` (the `toggle.addEventListener('click', ...)` block and the link-click close handler) and extend it rather than creating a separate script
  - Respect the existing `prefers-reduced-motion` guard (focus trap is non-visual, so it should work regardless)

- [x] Perform semantic HTML cleanup in `index.html`:
  - The hero section currently uses `<header class="hero">` — change it to `<section class="hero" aria-labelledby="hero-heading">`. Add an `id="hero-heading"` to the `<h1>` inside it. Remove the `aria-label="Hero"` attribute since `aria-labelledby` is more specific
  - Verify the proof strip section: it uses `aria-label="Key facts"` — this is fine, keep it
  - Ensure all `<section>` elements have either `aria-label` or `aria-labelledby`
  - Verify the footer `role="contentinfo"` is correct (it is, since it's a `<footer>`)
  - No changes to CSS needed — all selectors use `.hero` class, not `header.hero`

- [x] Define local font fallback stacks in `css/design-tokens.css`:
  - Update `--font-heading` to: `'DM Serif Display', Georgia, 'Times New Roman', serif` (Georgia is the closest system serif to DM Serif Display)
  - Update `--font-body` to: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` (standard system font stack as fallback)
  - This ensures text is readable immediately while web fonts load, reducing layout shift

- [x] Create WebP versions of the PNG logo and update HTML references:
  - The only raster image is `assets/logo-icon-white-512.png` (used in the footer)
  - Create a WebP version at `assets/logo-icon-white-512.webp` using the command: `cwebp assets/logo-icon-white-512.png -q 90 -o assets/logo-icon-white-512.webp` (install cwebp via `brew install webp` if needed, or use `sips` or `ImageMagick convert` as fallback)
  - In `index.html`, replace the footer `<img>` tag with a `<picture>` element:
    ```html
    <picture>
      <source srcset="assets/logo-icon-white-512.webp" type="image/webp">
      <img src="assets/logo-icon-white-512.png" alt="" width="32" height="41" loading="lazy" aria-hidden="true">
    </picture>
    ```
  - If WebP conversion tools are not available, skip the conversion and just wrap the existing `<img>` in a `<picture>` element with the WebP `<source>` commented out with a TODO note

- [x] Add cache-busting query strings to static asset references in `index.html`:
  - Append `?v=1.1` to all CSS `<link>` hrefs: `css/design-tokens.css?v=1.1`, `css/styles.css?v=1.1`, `css/animated-bg.css?v=1.1`
  - Append `?v=1.1` to the JS `<script>` src: `js/animated-bg.js?v=1.1`
  - Also update the preload `<link>` tags added in Phase 01 to include the same version string
  - Add a comment at the top of the `<head>` section: `<!-- Asset version: bump ?v= on deploy to bust cache -->`
  - Do NOT add version strings to external resources (Google Fonts) or inline content

- [x] Activate dark mode via `prefers-color-scheme` media query:
  - The `.dark` class tokens are already fully defined in `css/design-tokens.css` (lines 299-315)
  - Add a `@media (prefers-color-scheme: dark)` block at the end of `css/design-tokens.css` that applies the same overrides as the `.dark` class (duplicate the semantic token overrides from `.dark` into the media query). This gives automatic dark mode for users who have it enabled at the OS level
  - Also add a small JS snippet in the inline `<script>` block of `index.html` that checks `window.matchMedia('(prefers-color-scheme: dark)').matches` and adds the `.dark` class to `<html>` on load. This ensures both CSS media query and JS-dependent styling (if any) are in sync
  - Important: the nav, hero, CTA, and footer already use navy backgrounds with white text — verify these sections still look correct in dark mode. The main sections that will change are: proof strip, services, why us, and about (they use `--color-surface`, `--color-card`, `--color-muted` backgrounds)
  - Test by reviewing the dark mode token values: cards become navy-700, backgrounds become navy-900, text becomes warm-white. The gold accent stays the same. Ensure no contrast issues

- [x] Verify Phase 02 changes are correct and nothing is broken:
  - Read `index.html` and confirm: focus trap code is in the inline script, hero is a `<section>`, cache-bust strings are on all assets, dark mode JS snippet is present, `<picture>` element wraps the footer logo
  - Read `css/design-tokens.css` and confirm: font fallback stacks updated, `@media (prefers-color-scheme: dark)` block present at end of file
  - Ensure the mobile menu focus trap logic integrates cleanly with existing open/close handlers
  - Confirm no duplicate IDs, no broken `aria-labelledby` references
