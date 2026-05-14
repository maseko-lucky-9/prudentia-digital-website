# Demo Data Handling Policy

**Owner:** Thulani Maseko · Prudentia Digital
**Last updated:** 2026-05-14
**Applies to:** All five AI demo systems used during booked strategy sessions (Agent Loops, Production RAG, Evals, Vector DBs, MCP).

## Purpose

Define what data may be ingested into a Prudentia demo system, how long it is retained, how it is deleted, and who has access. This document supports POPIA compliance posture and is provided to prospects on request before a demo session.

## 1. What data may be ingested

- **Allowed without an NDA:**
  - Public documents (legislation, published reports, marketing materials).
  - Synthetic or anonymised sample data prepared by Prudentia.
  - Data the prospect explicitly classifies as "public / non-confidential".
- **Allowed under signed NDA only:**
  - Internal documents, contracts, customer data, financial data, or anything the prospect classifies as confidential.
  - NDA must be signed and counter-signed before any data leaves the prospect's systems.
- **Never ingested in demos:**
  - Personal data of identifiable third parties (POPIA-regulated personal information) without explicit lawful basis.
  - Payment-card data (PCI scope).
  - Special personal information under POPIA (health, biometric, race-linked profiling data) without explicit written consent and documented purpose.

## 2. Retention

- **Default retention window:** 7 days from the end of the demo session.
- **Extended retention:** only if the prospect signs the Pilot Engagement scope and explicitly requests data to be retained for the duration of the pilot.
- **Retention is configurable per demo system** via the post-session data scrub script (see `docs/sales-demo.md` in each demo repo).

## 3. Deletion

- Each demo system ships a **post-session data scrub script** that:
  - Deletes ingested files, vector indices, and any derived caches associated with the prospect's data
  - Writes an audit-log entry (timestamp, prospect alias, scope of deletion, operator)
  - Runs automatically on a cron after the retention window expires, or manually via documented command
- Audit logs are retained for 12 months for compliance evidence.

## 4. Access

- Only Thulani Maseko (and named Prudentia operators added in writing) has access to prospect data in demo environments.
- Demo systems are deployed in **auth-gated environments only**:
  - Local-only (laptop / homelab behind Tailscale), or
  - Cloudflare Access in front of Hetzner CX22, or
  - SSH-jump-only access on the homelab cluster
- No demo system is publicly exposed at any point.

## 5. Cross-prospect isolation

- Each prospect's demo session uses an **isolated workspace** (separate database/index instance, separate file path, separate API tokens).
- Workspaces are never reused across prospects.
- The scrub script (Section 3) verifies workspace isolation before deletion.

## 6. Incidents

If suspected unauthorised access, accidental retention beyond policy, or any data exposure:

1. **Within 1 hour** — operator notifies Thulani; access to the affected system is suspended.
2. **Within 24 hours** — affected prospect is notified in writing with scope, root-cause hypothesis, and remediation plan.
3. **Within 72 hours** — written incident report shared with the prospect; if POPIA-regulated personal information was implicated, the Information Regulator (South Africa) is notified per POPIA Section 22.

## 7. Review cadence

This policy is reviewed:

- After every Phase 2–6 exit (to confirm the new demo system complies before going live)
- Annually thereafter
- Immediately following any incident under Section 6

Reviewed-by entries are appended below.

## Review log

- 2026-05-14 — initial version. Thulani Maseko.
