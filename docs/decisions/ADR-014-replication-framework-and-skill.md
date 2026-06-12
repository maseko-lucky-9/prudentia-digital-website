# ADR-014: Productize the website stack as a replication framework + orchestration skill

- **Status**: Accepted
- **Date**: 2026-06-12
- **Relates to**: ADR-011 (single wrangler config), ADR-013 (Titan SMTP email)

## Problem

The stack this site runs on — Cloudflare Workers static assets, an
abuse-resistant contact form, email via the business's existing mailbox SMTP
relay (ADR-013) — is now live and verified end-to-end. Rebuilding it manually
for each future client would repeat roughly a full day of setup and re-expose
every gotcha we already paid for once (dual deploy paths masking failures,
provider paywalls discovered at activation, mailbox 2FA vs SMTP auth, the
MX/SPF/DMARC preservation requirement). The owner wants the setup to be a
sellable, repeatable product.

## Decision

Productize as two artifacts:

1. **Client-facing offer document** in the business wiki
   (`wiki/business/framework/client-website-launch-framework.md`) — the
   sellable package: five client-visible milestones, deliverables, guarantees
   (R0/month hosting, mail records never touched), pricing slots aligned to
   the rate card. No internal ops detail.
2. **`client-site-launch` Claude Code skill** (`~/.claude/skills/`) — the
   delivery automation: six phases (Intake → Scaffold → Cloudflare provision →
   DNS/email → CI/CD+deploy → Verify/handover) with hard per-phase closure, a
   per-client state file, and verification scripts (`verify-dns.sh` proves
   MX/SPF/DMARC stay byte-identical; `verify-live.sh` proves the form queues).

### Template source: skill-embedded, manual instantiation

Options considered:

| Option | Trade-off |
|---|---|
| Starter template repo under `~/Repo` | Cleanest versioning, but a second repo to maintain and keep in sync |
| **Skill-embedded templates (chosen)** | Self-contained with the orchestration that uses them; instantiated only by an explicit `instantiate.sh` call — scaffolding is never an automatic side effect |
| Copy-from-live at run time | Always current, but every run risks leaking this site's branding/copy into a client deliverable |

The skill's templates are this repo's worker, functions, tests, CI workflow,
and configs, genericized with `{{TOKEN}}` placeholders. An instantiation-time
**leak check** fails the scaffold if any token survives or any
case-insensitive "prudentia" string reaches a client repo. Dry-run evidence
(fictional client `acme-demo`): 22 files scaffolded, leak check clean, 19/19
worker contract tests green, build produces a complete `dist/`.

### Generalized email rule (carried from ADR-013)

Consumer SMTP relays send only FROM the authenticated mailbox, so
`EMAIL_FROM_ADDRESS = SMTP_USERNAME` always; the visitor rides in Reply-To.
The client's inbound-mail DNS (MX/SPF/DMARC) is never modified; if SPF must
gain an `include:` for the relay, the change is proposed as a one-line diff
and requires explicit owner approval. The code-level SMTP host allowlist and
from-domain guard survive genericization with parameterized values.

## Consequences

- New client launches reuse hardened code paths (CRLF stripping, timing-safe
  health token, KV rate limiting, PII masking, `{ok, queued}` no-oracle
  contract, `EMAIL_DELIVERY_FAILURE` marker) instead of reimplementing them.
- Stack improvements land in the skill's `templates/`, not in N client repos —
  template drift against this live site is possible and accepted; this repo
  remains the reference implementation.
- Secrets never enter intake/state/template files; they are set live via
  `wrangler secret put` / `gh secret set` per launch.
- This ADR is the pointer from the reference implementation to the framework:
  offer doc in the vault, automation in the `client-site-launch` skill.
