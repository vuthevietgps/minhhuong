# Data Quality Gates

These gates define when ChatGPT Web may treat future evidence as stronger than alert-label-only. If a gate fails, confidence must be downgraded or the strong conclusion must be refused.

## supplier_cost_up

- Minimum data completeness: approved supplier quote, product cost record, product/SKU mapping, and dealer price history.
- Freshness requirement: cost and price records within the configured analysis window, usually 30/60/90 days.
- Mapping requirement: supplier quote, cost, product/SKU, and dealer price records must join on stable ids.
- Sample size requirement: at least one approved cost change; sample size must be declared.
- Threshold source requirement: explicit cost increase threshold or margin policy.
- Downgrade confidence when dealer price update status is draft/missing.
- Refuse strong conclusion when only alert label exists or effective dates are missing.

## overdue_dealer_receivables

- Minimum data completeness: dealer/agent id, invoice/order linkage, due date, payment allocation, outstanding balance.
- Freshness requirement: receivable snapshot timestamp and latest payment date must be present.
- Mapping requirement: invoice/order/payment/dealer references must join.
- Sample size requirement: invoice count and total outstanding amount must be declared.
- Threshold source requirement: credit terms and aging bucket policy.
- Downgrade confidence when payment allocation is partial or stale.
- Refuse strong conclusion when outstanding balance or due date is missing.

## low_inventory_best_seller

- Minimum data completeness: SKU id, best-seller rank, on-hand stock, reserved stock, available stock, incoming stock, sales velocity.
- Freshness requirement: inventory snapshot and sales window must be current and declared.
- Mapping requirement: sales SKU and inventory SKU must match.
- Sample size requirement: sales window order/item count must be declared.
- Threshold source requirement: reorder threshold or days-of-cover threshold.
- Downgrade confidence when incoming stock status is unknown.
- Refuse strong conclusion when available quantity cannot be computed.

## labor_overtime_high

- Minimum data completeness: approved timesheets, overtime hours, labor cost, revenue/workload comparison, capacity baseline.
- Freshness requirement: labor, revenue, and workload periods must align.
- Mapping requirement: staff/team/department ids must map across timesheet, cost, workload, and revenue modules.
- Sample size requirement: staff count or timesheet row count must be declared.
- Threshold source requirement: overtime policy threshold.
- Downgrade confidence when SLA/workload data is missing.
- Refuse strong conclusion when only overtime alert label exists.

## slow_supplier_good_cost

- Minimum data completeness: supplier id, quote/cost comparison, purchase order fulfillment, promised and actual receipt dates, quality notes if available.
- Freshness requirement: supplier performance window must be declared.
- Mapping requirement: supplier, PO, receipt, quote, and quality records must join.
- Sample size requirement: fulfilled PO count and accepted quote count must be declared.
- Threshold source requirement: reliability score and cost advantage thresholds.
- Downgrade confidence when quality notes are missing or sample size is small.
- Refuse strong conclusion when supplier performance rows are absent.

