# Director JSON Surface Proposal

This proposal is read-only and non-implemented. It compares ways to surface stronger evidence in a future Director JSON export.

## Option 1: Add Evidence Rows Inside Existing Relevant Sections

Examples:

- pricing/procurement evidence inside supplier/cost sections
- receivable evidence inside finance/receivables sections
- inventory evidence inside inventory/product sections
- labor evidence inside operations/capacity sections

Pros:

- Keeps evidence near existing business domain.
- Lower conceptual migration risk for readers already using sections.
- Avoids creating a large new top-level section.

Cons:

- Evidence pattern may become inconsistent across sections.
- ChatGPT Web may miss cross-domain weak-evidence rows if scattered.
- Reviewers must inspect many places.

Migration risk: medium. Existing consumers may need per-section updates.

Reviewer clarity: medium.

## Option 2: Add New Read-Only Section Such As `operational_risk_evidence`

Pros:

- Centralizes evidence rows for all weak findings.
- Easier review, testing, and quality gating.
- Clear separation from alerts and from action schemas.

Cons:

- Adds a new section to Director JSON.
- Requires consumers to learn one new read-only structure.
- Could duplicate summary facts already present in domain sections.

Migration risk: medium-low if strictly additive and read-only.

Reviewer clarity: high.

## Option 3: Keep Alert Labels But Add `evidence_detail` Rows

Pros:

- Minimal structural change.
- Preserves current alert-label flow.
- Simple for backward compatibility.

Cons:

- Alerts may still anchor the reader before evidence quality is checked.
- Mixed alert and evidence semantics can blur confidence.
- Harder to enforce reusable cross-finding quality gates.

Migration risk: low.

Reviewer clarity: medium-low.

## Recommendation

Recommend Option 2 for the next implementation slice: add a new additive read-only evidence section such as `operational_risk_evidence`, with canonical evidence rows and explicit data quality status.

Do not implement it in Prompt 36.

