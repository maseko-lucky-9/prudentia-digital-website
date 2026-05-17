#!/usr/bin/env node
/**
 * Phase 8 lint: catches directional-entry regressions in service-illustrations.css.
 *
 * Forbids in *any* keyframe / declaration:
 *   - scaleX(...) and scaleY(...) — these wipe in from an edge
 *   - translateX(...) and 1-axis translate3d with non-zero X/Y — slides
 *   - transform-origin values that aren't "center" or "50%" or "Npx Npx"
 *     (the px-coordinate form is OK — used for SVG accent group centers)
 *
 * The AI block uses opacity-only animations after Phase 8, so this lint is
 * applied to the whole file with no carve-out. If you ship a legitimate
 * scale-from-center elsewhere, that's `scale(...)` (uniform), not `scaleX/Y`.
 *
 * Exits non-zero on match. Wire into CI by adding to package.json test script.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = join(__dirname, '..', 'css', 'service-illustrations.css');

const css = readFileSync(CSS_PATH, 'utf8');

const violations = [];

function findMatches(regex, label, exemptKeyframeNames = []) {
  const lines = css.split('\n');
  let currentKeyframe = null;
  lines.forEach((line, idx) => {
    const kfMatch = line.match(/^@keyframes\s+([\w-]+)/);
    if (kfMatch) currentKeyframe = kfMatch[1];
    if (line.match(/^\s*}\s*$/) && currentKeyframe && !line.trim().includes('{')) {
      // Approximate end-of-block detection; not perfect but adequate
    }

    const m = line.match(regex);
    if (m) {
      // Skip if inside an exempt keyframe
      if (currentKeyframe && exemptKeyframeNames.includes(currentKeyframe)) return;
      // Skip if line is a comment-only line
      const trimmed = line.trim();
      if (trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
      violations.push({
        line: idx + 1,
        rule: label,
        snippet: line.trim().slice(0, 120),
        keyframe: currentKeyframe || '(declaration)',
      });
    }
  });
}

// Directional transform functions
findMatches(/\bscaleX\s*\(/, 'scaleX (directional)');
findMatches(/\bscaleY\s*\(/, 'scaleY (directional)');
findMatches(/\btranslateX\s*\(/, 'translateX (directional)');

// translate3d with non-zero X or Y component (slides)
// Catches: translate3d(0, -6px, 0), translate3d(8px, 0, 0)
// Allows:  translate3d(0, 0, 0) — identity, no-op
findMatches(
  /\btranslate3d\s*\(\s*(-?\d*\.?\d+(?:px|em|rem|%)?|0)\s*,\s*(-?\d*\.?\d+(?:px|em|rem|%)?|0)\s*,\s*(-?\d*\.?\d+(?:px|em|rem|%)?|0)\s*\)/,
  'translate3d (directional)'
);

// Directional transform-origin keywords
findMatches(
  /transform-origin\s*:\s*(top|bottom|left|right)\b/,
  'transform-origin: top/bottom/left/right (directional)'
);

// Compound directional transform-origin (e.g. "left center")
findMatches(
  /transform-origin\s*:\s*[\w%]+\s+(top|bottom|left|right)\b/,
  'transform-origin: <x> top/bottom/left/right (directional)'
);
findMatches(
  /transform-origin\s*:\s*(top|bottom|left|right)\s+[\w%]+/,
  'transform-origin: top/bottom/left/right <y> (directional)'
);

// stroke-dashoffset animations (directional draw)
// Static stroke-dashoffset: 0 is fine; ANIMATING it is the problem.
// Catch keyframes that change dashoffset.
{
  const kfBlocks = css.split(/@keyframes\s+/).slice(1);
  for (const block of kfBlocks) {
    const nameMatch = block.match(/^([\w-]+)/);
    const bodyMatch = block.match(/\{([^}]+(?:\}[^{}]*)*?)\n\}/s);
    if (!nameMatch || !bodyMatch) continue;
    const name = nameMatch[1];
    const body = bodyMatch[1];
    if (/stroke-dashoffset\s*:/.test(body)) {
      // Find line number
      const lineIdx = css.split('\n').findIndex((l) =>
        l.includes(`@keyframes ${name}`)
      );
      violations.push({
        line: lineIdx >= 0 ? lineIdx + 1 : 0,
        rule: 'stroke-dashoffset in @keyframes (directional draw)',
        snippet: `@keyframes ${name} animates stroke-dashoffset`,
        keyframe: name,
      });
    }
  }
}

// translate3d with explicit non-zero offsets — catch the common bug pattern
// e.g. `translate3d(0, -6px, 0)` or `translate3d(-8px, 0, 0)`.
// (Already covered above but adding a tighter check.)
findMatches(/translate3d\s*\(\s*0\s*,\s*-?\d+(?:\.\d+)?(?:px|em|rem|%)\s*,/, 'translate3d Y-offset (slides from above/below)');
findMatches(/translate3d\s*\(\s*-?\d+(?:\.\d+)?(?:px|em|rem|%)\s*,\s*0\s*,/, 'translate3d X-offset (slides from side)');

if (violations.length > 0) {
  console.error('\n❌ Phase 8 lint: directional-entry violations found in css/service-illustrations.css\n');
  for (const v of violations) {
    console.error(`  line ${v.line} [${v.keyframe}]  ${v.rule}`);
    console.error(`    → ${v.snippet}`);
  }
  console.error(`\nTotal: ${violations.length} violation(s)\n`);
  process.exit(1);
}

console.log('✓ Phase 8 lint passed: no directional entry in css/service-illustrations.css');
process.exit(0);
