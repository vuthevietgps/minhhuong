# Finding Spec: slow_supplier_good_cost

## Current Evidence

- Classification: `detected_but_weak_evidence`
- Current location: `18_alerts`
- Current label: `slow_reliability_supplier_with_good_cost`

## Why Evidence Is Weak

The current evidence lacks supplier lead time, late delivery count, fulfilled purchase order count, accepted quote count, quote/cost comparison, delivery quality notes, reliability score, and cost advantage.

## Business Meaning For Director

The director needs to balance supplier cost advantage against fulfillment reliability. Without source rows, the safe conclusion is only to compare supplier performance before making procurement decisions.

## Minimum ERP Fields/Tables Needed

| Area | Minimum fields |
| --- | --- |
| Supplier lead time | supplier id, PO id, order date, promised delivery date, actual delivery date |
| Reliability | late delivery count, fulfilled PO count, on-time percentage, cancellation count |
| Cost comparison | accepted quote count, quote cost, benchmark cost, cost advantage percent |
| Quality | rejected quantity, delivery quality notes, issue count, return reason |
| Score | reliability score, cost advantage, threshold source |

## Likely Current ERP Collections/Modules To Inspect Later

- purchase orders
- supplier quote history
- goods receipts
- supplier scorecard
- quality/return notes
- procurement benchmark costs

## Proposed Director JSON Read-Only Evidence Rows

| field | proposed value |
| --- | --- |
| `finding_key` | `slow_supplier_good_cost` |
| `source_domain` | `supplier_performance_procurement` |
| `source_collections_or_modules` | `purchase_orders`, `goods_receipts`, `supplier_quotes`, `quality_notes` |
| `affected_entity_type` | `supplier` |
| `metric_name` | `average_lead_time_days`, `late_delivery_rate`, `cost_advantage_percent`, `reliability_score` |
| `calculation_method` | Compare promised vs actual receipt dates and accepted supplier quote cost vs benchmark/current alternatives. |
| `not_allowed_actions` | switch supplier, cancel PO, renegotiate contract, Action Draft Schema |

## Data Quality Gates

- Supplier id must map across quotes, POs, and receipts.
- Fulfilled PO sample size must be sufficient for reliability scoring.
- Late delivery must use promised date and actual receipt date.
- Cost comparison must use accepted quotes or approved costs.
- Downgrade confidence if quality notes are missing.
- Refuse strong conclusion if only alert label exists.

## Example Advisory-Only Wording

"This supplier may offer favorable cost but weak delivery reliability. Compare cost advantage with lead-time and quality evidence before procurement decisions."

## Future Implementation Acceptance Criteria

- Director JSON includes lead time, late delivery rate, fulfilled PO count, accepted quote count, reliability score, and cost advantage.
- Evidence row declares sample size and comparison period.
- Advisory wording does not recommend supplier mutation.

## Future Tests

- Unit test late delivery rate calculation.
- Fixture test for cost advantage with accepted quote data.
- Negative test for insufficient fulfilled PO sample size.
- Safety guard scan for action wording.

## Must Not Do Now

- Do not change supplier ranking.
- Do not cancel or create purchase orders.
- Do not call provider APIs.
- Do not implement adapter or DB migrations.

