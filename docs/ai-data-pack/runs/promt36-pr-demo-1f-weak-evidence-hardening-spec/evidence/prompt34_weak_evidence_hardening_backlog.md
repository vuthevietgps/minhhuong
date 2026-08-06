# Prompt 34 Weak Evidence Hardening Backlog - Available Source Mirror

This backlog contains exactly the five weak-evidence findings targeted by Prompt 36.

## supplier_cost_up

- Current evidence: alert label in `18_alerts`.
- Why weak: supplier quote/cost/dealer price rows are absent.
- Minimum additional ERP fields/tables: supplier quote history, product cost history, dealer price update history, joins, effective dates, approval status, cost increase percent, dealer price update lag.
- Suggested future phase: read-only Director JSON evidence rows.
- Must not do now: price update, action draft, provider call.

## overdue_dealer_receivables

- Current evidence: alert label plus operation signal.
- Why weak: no invoice-level receivable aging.
- Minimum additional ERP fields/tables: dealer/agent receivables, invoice/order linkage, due date, last payment date, outstanding balance, collection owner, aging buckets.
- Suggested future phase: read-only finance receivable evidence rows.
- Must not do now: collection workflow or credit action.

## low_inventory_best_seller

- Current evidence: alert label in `18_alerts`.
- Why weak: no inventory-by-best-seller table.
- Minimum additional ERP fields/tables: best-seller rank, SKU, current inventory, reserved quantity, available quantity, reorder threshold, incoming stock, sales velocity, days of cover.
- Suggested future phase: read-only inventory/sales evidence rows.
- Must not do now: purchase order creation or stock allocation.

## labor_overtime_high

- Current evidence: alert label in `18_alerts`.
- Why weak: no timesheet or labor cost detail.
- Minimum additional ERP fields/tables: timesheets, overtime hours, labor cost by period, revenue by comparable period, SLA/workload, staff capacity, overtime threshold.
- Suggested future phase: read-only labor/capacity evidence rows.
- Must not do now: staffing schedule changes.

## slow_supplier_good_cost

- Current evidence: alert label in `18_alerts`.
- Why weak: supplier performance rows are absent.
- Minimum additional ERP fields/tables: supplier lead time, late delivery count, fulfilled PO count, accepted quote count, quote/cost comparison, delivery quality notes, reliability score, cost advantage.
- Suggested future phase: read-only supplier performance evidence rows.
- Must not do now: supplier switch, PO mutation, provider execution.

