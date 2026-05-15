# POPIA Addendum — AI / Data-Processing Activities

**Document owner:** Thulani Maseko · Prudentia Digital
**Effective date:** 2026-05-15
**Status:** Draft for legal review before publishing on `privacy.html`
**Supersedes:** Nothing yet — this is the first explicit AI/data-processing statement

---

## ⚠️ Important note

This is a **starting-point draft** prepared as part of Phase 0 of the AI Agent Portfolio rollout. It is **not legal advice** and must be reviewed by a POPIA-qualified attorney (e.g., an Information Officer in your network, or a firm such as Webber Wentzel or Bowmans) before being added to the live privacy policy. Treat it as a first draft of the *substance* — the legal phrasing must be confirmed.

When this document is approved, the contents will be integrated into [`privacy.html`](../../privacy.html) as a new section, and this markdown stays as the canonical source of truth.

---

## 1. Scope

This addendum covers personal information processed by Prudentia Digital in the course of:

- **AI strategy sessions** booked via `prudentiadigital.co.za/ai/` and its `?topic=ai-*` inquiry tags
- **AI Audit, Capability Pilot, and AI Engagement Retainer** engagements (see [ADR-009](../../docs/decisions/ADR-009-offering-tiers-and-no-public-pricing.md))
- The **demo systems** (Earnings Reaction Playbook, Production RAG, Evals, Vector DB compare, MCP server) listed in `docs/sales/demo-data-handling.md`

It supplements — and where relevant clarifies — Prudentia Digital's general privacy policy.

---

## 2. Responsible Party

Prudentia Digital (Pty) Ltd is the **Responsible Party** under POPIA for personal information processed during AI-related engagements.

Information Officer: Thulani Maseko · masekolt@prudentiadigital.co.za.

---

## 3. Personal information we process

We process the following categories of personal information *during* an AI engagement:

| Category | Examples | Purpose | Lawful basis |
|---|---|---|---|
| Identifiers of prospect contacts | Name, work email, role title, company name | Pre-engagement comms, NDAs, invoicing | Contract performance · legitimate interest |
| Prospect business data | Documents the prospect uploads for a pilot demo (contracts, policies, internal manuals) | Demonstrating or building the AI capability | Contract performance (under signed NDA) |
| End-user data within prospect data | Employee or customer names, IDs, transaction records embedded in prospect documents | Incidental — surfaced only if the prospect uploads documents that contain it | Same lawful basis as the prospect's own processing — we operate as **Operator** for this data |

We do **not** process:

- Special personal information (race, health, biometric, religious belief) unless the prospect explicitly requests it for a regulated use case (e.g., HR analytics in a healthcare firm), and with documented purpose limitation and explicit written consent.
- Children's personal information.
- Payment-card data (PCI scope) — payments are processed by third-party providers; we never touch PAN.

---

## 4. Cross-border transfers

AI model inference may involve transfer of prospect data to model-vendor infrastructure outside South Africa:

- **Anthropic** (Claude models) — typically United States data centres
- **OpenAI** (GPT models, when used) — United States
- **Google** (Gemini, when used) — United States / European Union
- **Local / self-hosted models** — South Africa only (no cross-border transfer)

When we transfer prospect personal information across borders for AI inference, we rely on:

1. **The prospect's explicit, informed consent** (captured in the signed engagement scope), AND
2. **Vendor data-protection commitments** (Anthropic, OpenAI, Google publish DPA equivalents; we retain the latest versions on file), AND
3. **Where possible, model providers' "no training on customer data" guarantees** (Anthropic and OpenAI both offer this for API usage — we configure for this by default).

If a prospect's risk posture excludes cross-border AI inference, we offer self-hostable local models as an alternative (see Section 6 of [`docs/sales/demo-data-handling.md`](../sales/demo-data-handling.md)).

---

## 5. Retention

| Data type | Default retention | Maximum (with explicit consent) |
|---|---|---|
| Demo session ingested documents | 7 days after the session | Duration of a signed Pilot scope |
| Conversation logs with the AI (prompts and responses) | 30 days for operational debugging | 12 months for compliance evidence under signed engagement |
| Engagement deliverables (reports, code) | Until the engagement ends + 12 months | Per the signed engagement |
| Inquiry form submissions via `/?topic=ai-*#contact` | 24 months from submission | n/a |
| NDAs and signed scopes | 7 years (SARS / contractual statute of limitations) | n/a |
| Audit logs of demo-data scrubs | 12 months from scrub event | n/a |

Retention is enforced operationally per [`docs/sales/demo-data-handling.md`](../sales/demo-data-handling.md) and verified at the close of each engagement.

---

## 6. Security safeguards

- **Encryption at rest** — All demo workspaces, eval datasets, and engagement artefacts are stored on encrypted volumes (Hetzner CX22 LUKS, Cloudflare R2 with provider-side encryption, or local-disk FileVault on operator machines).
- **Encryption in transit** — TLS 1.2+ for all customer-facing endpoints; SSH for operator access to homelab; Tailscale for ZTNA into the demo subnet.
- **Access control** — Only Thulani Maseko (and named operators added to the engagement in writing) has access to prospect demo workspaces. No shared accounts. MFA on all administrative entry points.
- **Isolation** — Each engagement gets its own workspace; prospect data is never co-mingled across pilots.
- **Deletion** — Automated scrub script per demo system with audit log retained for 12 months.

---

## 7. Data subject rights

Data subjects whose personal information is held by Prudentia Digital under POPIA may:

1. **Confirm** whether we hold personal information about them.
2. **Request access** to that personal information.
3. **Request correction or deletion** of inaccurate, irrelevant, excessive, out-of-date, incomplete, misleading, or unlawfully obtained personal information.
4. **Object to processing** in specific circumstances under Section 11(3) of POPIA.
5. **Submit a complaint** to the Information Regulator of South Africa at `complaints.IR@inforegulator.org.za`.

Requests should be sent to `masekolt@prudentiadigital.co.za`. We respond within **30 days** of receipt, or sooner where the Act requires.

**Indirect data subjects:** Where prospect documents contain personal information of third parties (employees, customers), data-subject requests are typically routed through the prospect (who is the Responsible Party for that data and is best placed to handle the request). We assist where the request relates to processing we performed.

---

## 8. AI-specific notices

We disclose to all engagements:

1. **Outputs are model-generated.** Recommendations, analyses, and decisions produced by Prudentia AI systems are model outputs. They are not financial advice, legal advice, or final decisions. A human in the prospect's organisation must review and approve before any operational use.
2. **Models can hallucinate.** Where the AI cites a source, we measure citation accuracy as part of the eval harness (see [Evals capability on `/ai/`](https://prudentiadigital.co.za/ai/#cap-evals)). Where the AI produces an answer without citation, treat it as a hypothesis, not a fact.
3. **We do not allow vendor training on prospect data.** API calls to Anthropic, OpenAI, and Google are configured with `do_not_train` / equivalent flags where available. Self-hosted models, by definition, never train on prospect data.
4. **No automated decision-making with legal effect** is performed without explicit prospect approval and documented purpose limitation. This applies in particular to credit scoring, employment decisions, and any decision that has a legal effect on or significantly affects a data subject — Section 71 of POPIA.

---

## 9. Sub-processors

We engage the following sub-processors. Updated when material changes occur:

| Sub-processor | Purpose | Country | DPA on file |
|---|---|---|---|
| Anthropic, PBC | Claude model inference | USA | Yes (commercial terms include data-processing commitments) |
| OpenAI, LLC | GPT model inference (when used) | USA | Yes |
| Google LLC | Gemini model inference (when used) | USA / EU | Yes |
| Cloudflare, Inc. | Page hosting, Pages Functions, R2 storage, Access ZTNA | USA / global | Yes |
| Hetzner Online GmbH | Compute (Hetzner CX22 demo server) | Germany | Yes |
| Resend, Inc. | Transactional email (contact form delivery, when configured) | USA | Yes |
| Braintrust Data, Inc. | Eval harness experiment tracking (Phase 4 capability) | USA | Yes |
| Pinecone Systems, Inc. | Managed vector database (Phase 5 capability, when chosen) | USA | Yes |

We do **not** engage sub-processors outside this list without notifying the prospect and amending the engagement scope.

---

## 10. Changes to this addendum

Material changes to this addendum are notified at least **30 days** in advance to active-engagement prospects and posted on `privacy.html` with a new "Last updated" stamp.

Minor clarifications and typo fixes do not constitute material changes.

---

## 11. Contact

Information Officer: Thulani Maseko
Email: `masekolt@prudentiadigital.co.za`
Postal: Per the CIPC registered address of Prudentia Digital (Pty) Ltd

For POPIA-specific complaints: Information Regulator of South Africa
Website: `inforegulator.org.za`
Email: `complaints.IR@inforegulator.org.za`

---

## Implementation notes (for the engineer, not the published policy)

When merging this into `privacy.html`:

1. Convert the markdown to HTML, preserving the table layout (browsers handle `<table>` reasonably; mobile responsive via `overflow-x: auto`).
2. Add anchors (`<h2 id="ai-popia-addendum">`) and a navigation entry in the existing privacy-policy ToC.
3. Update the "Last updated" date in the privacy-policy header.
4. Update the sitemap `<lastmod>` for `/privacy.html`.
5. Cross-link from `/ai/` FAQ — the existing FAQ already mentions POPIA; that mention links to `/docs/sales/demo-data-handling.md`, but should be retargeted to the new in-policy section once published.

This markdown stays as the source of truth; the HTML is a render.
