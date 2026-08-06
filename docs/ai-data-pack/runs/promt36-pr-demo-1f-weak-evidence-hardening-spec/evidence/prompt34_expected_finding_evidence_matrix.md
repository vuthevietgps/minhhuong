# Prompt 34 Expected Finding Evidence Matrix - Available Source Mirror

This mirror is reconstructed from available local transcript evidence and Prompt 34 prompt text. It is not a copy of a missing generated Prompt 34 packet.

| Finding key | Classification | Evidence location | Evidence strength | Safe for advisory analysis | Future hardening |
| --- | --- | --- | --- | --- | --- |
| `supplier_cost_up` | `detected_but_weak_evidence` | `18_alerts` | weak | caution | Supplier quote, cost history, dealer price history, effective dates. |
| `ad_spend_spike` | `detected_with_evidence` | `18_alerts + 09_marketing_profitability` | strong | yes | Keep mapping and profitability detail. |
| `cash_gap` | `detected_with_evidence` | `18_alerts + 05_financial_context + 07_cashflow_scenarios` | strong | yes | Keep cashflow scenario detail. |
| `overdue_dealer_receivables` | `detected_but_weak_evidence` | `18_alerts + 16_operation_capacity` | weak | caution | Receivable aging, invoice linkage, due dates, outstanding balance. |
| `low_inventory_best_seller` | `detected_but_weak_evidence` | `18_alerts` | weak | caution | Inventory-by-best-seller rows, availability, velocity, days of cover. |
| `labor_overtime_high` | `detected_but_weak_evidence` | `18_alerts` | weak | caution | Timesheets, overtime cost, revenue/workload comparison. |
| `negative_margin_product_group` | `detected_with_evidence` | `10_service_group_performance + 11_product_variant_performance + 12_unit_economics + 18_alerts` | strong | yes | Keep product/service unit economics. |
| `slow_supplier_good_cost` | `detected_but_weak_evidence` | `18_alerts` | weak | caution | Supplier lead time, reliability, quote/cost comparison. |
| `high_sales_late_payment_agent` | `detected_with_evidence` | `16_operation_capacity` | medium | yes | Link to receivable detail in future. |
| `return_rate_above_policy` | `detected_with_evidence` | `16_operation_capacity` | medium | yes | Keep policy and offer-level return detail. |
| `google_ads_mapping_gap` | `detected_with_evidence` | `20_mapping_report + 19_data_quality` | strong | yes | Keep attribution mapping evidence. |
| `inventory_movement_gap` | `detected_with_evidence` | `16_operation_capacity` | medium | yes | Link to purchase order movement evidence. |

