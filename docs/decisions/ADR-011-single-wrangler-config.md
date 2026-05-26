# ADR-011: One Wrangler config per project (TOML preferred)

- **Status:** Accepted
- **Date:** 2026-05-23
- **Branch:** `main` (no feature branch — corrective config decision)
- **Supersedes:** none
- **Related:** none

## Context

On 2026-05-23 a routine deploy revealed a source-code leak on the production custom domain. `npx wrangler deploy` reported uploading 186 files for a site whose `dist/` build directory contains roughly 50. Inspection of the wrangler output showed entries like `.git/objects/<sha>` being uploaded as static assets.

Root cause: the repo contained two wrangler config files side-by-side.

```
wrangler.toml   →  [assets]  directory = "./dist"     (correct, intent)
wrangler.jsonc  →  "assets": { "directory": "." }     (wrong, shadowing)
```

Wrangler's config-resolution prefers JSONC/JSON over TOML when both are present, so the `.jsonc` won silently. Result: the entire repo root — including `.git/objects/*`, `package.json`, `wrangler.toml` itself, and any local artifacts in the working tree — was being served as public assets on `prudentiadigital.co.za`. Verified live with `curl -I https://prudentiadigital.co.za/.git/HEAD` returning HTTP 200.

The `.jsonc` had been added in early commits (`fb6be11`, `00b6cbf`) and never removed when `wrangler.toml` was introduced. There was no signal in the deploy output to flag the conflict.

Constraints:

- The site is a static, vanilla-HTML deployment to Cloudflare Workers Assets. The build script is just `cp` into `dist/`.
- The deployment target is a custom domain serving the company's GTM front door; leak blast-radius includes full git history.
- The team is small; conventions are enforced by repo files, not external tooling.

## Decision

1. **One wrangler config per project. TOML preferred.** `wrangler.toml` is the single source of truth for this repo's Cloudflare Workers Assets deployment. `wrangler.json` and `wrangler.jsonc` MUST NOT exist alongside it.

2. **`assets.directory` MUST point to `./dist`**, never to the repo root or to any directory that contains source-control or environment files. The build script's explicit `cp` whitelist is the canonical declaration of what is publicly servable.

3. **Pre-deploy sanity check** lives in the deploy log itself: if `npx wrangler deploy` reports more than ~60 uploaded files for this repo, the operator MUST halt and investigate before allowing the deploy to complete. (This is an operational rule, not enforced by a hook — see Consequences.)

4. **Why TOML over JSONC for this repo:** TOML matches the convention in the Cloudflare Workers Assets docs examples, supports inline comments naturally, and is the format the repo's history settled on after the early JSONC bootstrap was deprecated. The choice is otherwise arbitrary — what matters is that exactly one config exists.

## Rejected alternatives

- **Keep both, document precedence.** Rejected. The original leak proves precedence is invisible at deploy time and documentation is not a control. One file is the only enforceable rule.
- **Use `wrangler.jsonc` (delete the TOML instead).** Rejected for path-of-least-disruption: `wrangler.toml` is what was actively maintained and is what the rest of the codebase referenced in commit messages and docs (`fix(deploy): claim prudentiadigital.co.za on company worker` etc.).
- **Edge-level path denies (e.g., `_redirects` 404 rules for `/.git/*`, `/.env*`).** Investigated and rejected: Cloudflare Workers Assets `_redirects` only supports status codes 200, 301, 302, 303, 307, 308 — `404` is rejected at deploy validation. A WAF rule or Worker script could implement this, but adds operational surface area for what the build-script whitelist already prevents at source. Revisit if asset config ever diverges from a strict whitelist.
- **Pre-commit hook to refuse `wrangler.json*` if `wrangler.toml` exists.** Considered useful but out of scope for this ADR; tracked as a follow-up.

## Consequences

Positive:

- Source-leak class of bug is closed for this repo: the only way to re-introduce it is to commit a second wrangler config, which is now explicitly forbidden by this ADR.
- Single file is the obvious place to inspect when debugging asset behaviour.

Negative:

- The rule depends on humans reading this ADR (or, eventually, a pre-commit hook). Without enforcement, the same drift could recur in a year.
- The `~60-file` operational threshold in (3) above is a heuristic and will go stale as the site grows. Consider replacing it with a hard cap derived from `find dist -type f | wc -l` at build time.

Neutral:

- The TOML-vs-JSONC choice is reversible. If a future tooling decision (e.g., JSON-schema validation in CI) makes JSONC objectively better, the rule becomes "one file, JSONC preferred" — the substance is "one file."

## Verification

- 2026-05-23: deleted `wrangler.jsonc`, redeployed (version `8a3a8166-3dde-4633-a812-f2c9ec86eb02`), confirmed `curl -I https://prudentiadigital.co.za/.git/HEAD` returns HTTP 404. Upload count: 54 files (down from 186), matching the contents of `dist/`.
- Git history audit (`git log --all -p | grep -iE 'sk-…|ghp_…|AKIA…|re_…|AIza…|BEGIN.*PRIVATE KEY'`) found no real credential values exposed during the leak window — only documentation references to env-var names.

## Follow-ups

- [ ] Pre-commit hook in this repo refusing `wrangler.json` or `wrangler.jsonc` if `wrangler.toml` is present.
- [ ] Replace operational `~60-file` threshold with a build-time hard cap.
- [ ] Apply this rule to sibling repos that also deploy to Cloudflare Workers (`portfolio-website`, others under `~/Repo/apps/`).
