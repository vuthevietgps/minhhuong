# Future Test Plan

This is a draft test plan for a future read-only implementation slice. Prompt 36 does not implement these tests.

## Unit Tests

- `supplier_cost_up`: cost increase percent, dealer price update lag, and missing effective date downgrade.
- `overdue_dealer_receivables`: aging bucket, outstanding balance after payment allocation, and missing due date refusal.
- `low_inventory_best_seller`: available quantity, days of cover, and missing SKU mapping downgrade.
- `labor_overtime_high`: overtime threshold comparison, aligned-period revenue/workload comparison, and mismatched period refusal.
- `slow_supplier_good_cost`: late delivery rate, cost advantage, and insufficient sample downgrade.

## Fixture / Seed Tests

- Evidence rows generated for all five findings from safe fixture data.
- Weak fixture data produces `confidence: low` or `blocked`.
- Missing mapping fields do not produce strong conclusions.

## Director JSON Tests

- New read-only evidence section exists if Option 2 is implemented.
- Evidence rows contain all canonical fields.
- JSON download/export remains parseable.
- No secret/token/provider payload fields appear.

## Safety / Static Guard Tests

- No Action Draft Schema section is emitted.
- No provider execution fields appear.
- No action import, approval workflow, validateOnly, or mutation contract appears.
- Advisory text does not instruct live business action.

## Negative Tests

- Alert-label-only input remains weak.
- Stale snapshot downgrades confidence.
- Missing threshold source blocks strong conclusion.
- Missing sample size blocks strong conclusion.

