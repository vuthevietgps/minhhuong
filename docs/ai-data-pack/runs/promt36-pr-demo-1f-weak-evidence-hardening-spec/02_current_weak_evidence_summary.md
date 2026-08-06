# Current Weak Evidence Summary

The five findings below are treated as detected but weak. The common issue is that the current Director JSON/transcript evidence names an alert or risk signal but does not expose enough ERP rows, metrics, joins, thresholds, and time windows for a director to verify cause and magnitude.

| finding_key | current classification | current evidence location | why weak | risk if ChatGPT Web over-interprets it |
| --- | --- | --- | --- | --- |
| `supplier_cost_up` | `detected_but_weak_evidence` | `18_alerts` | Alert label exists: `supplier_cost_up_15_percent_without_matching_dealer_price_update`; supplier quote/cost/dealer price details are absent. | It may imply vendor negotiation or dealer price action without proof of effective dates, approval status, or cost-to-price lag. |
| `overdue_dealer_receivables` | `detected_but_weak_evidence` | `18_alerts + 16_operation_capacity` | Alert exists and operations signal mentions high-sales late-payment agents; dealer receivable aging is not independently expanded. | It may name collection urgency without invoice linkage, aging buckets, outstanding balance, or collection owner. |
| `low_inventory_best_seller` | `detected_but_weak_evidence` | `18_alerts` | Alert label exists: `best_selling_product_low_inventory`; no inventory-by-best-seller table is present. | It may recommend restock priority without stock on hand, reserved quantity, incoming stock, or sales velocity. |
| `labor_overtime_high` | `detected_but_weak_evidence` | `18_alerts` | Alert label exists: `labor_overtime_high_without_matching_revenue_growth`; labor/overtime rows are absent. | It may conclude staffing inefficiency without timesheets, workload, SLA, revenue comparison, or capacity baseline. |
| `slow_supplier_good_cost` | `detected_but_weak_evidence` | `18_alerts` | Alert label exists: `slow_reliability_supplier_with_good_cost`; supplier performance rows are not expanded. | It may recommend supplier switching or retention without lead time, late delivery rate, accepted quotes, quality, or cost advantage evidence. |

All wording in Prompt 36 remains advisory-only. The spec must improve future evidence surfaces, not prescribe live action.

