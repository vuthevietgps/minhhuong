# Finding Spec: supplier_cost_up

## Current Evidence

- Classification: `detected_but_weak_evidence`
- Current location: `18_alerts`
- Current label: `supplier_cost_up_15_percent_without_matching_dealer_price_update`

## Why Evidence Is Weak

The current evidence is an alert label. It does not show supplier quote history, product cost history, dealer price update history, effective dates, approval status, or joins between product, supplier, and dealer prices.

## Business Meaning For Director

The director needs to know whether supplier cost increased materially and whether dealer/customer-facing price updates lagged enough to create margin pressure. Without source rows, the safe conclusion is only that a pricing risk should be investigated.

## Minimum ERP Fields/Tables Needed

| Area | Minimum fields |
| --- | --- |
| Supplier quote history | supplier id, product/SKU id, quoted cost, currency, quote date, effective date, expiry date, approval status |
| Product cost history | product/SKU id, prior cost, new cost, effective date, source quote id, approved by, approval timestamp |
| Dealer price update history | dealer id, product/SKU id, prior dealer price, new dealer price, effective date, approval status |
| Joins | product id, supplier id, dealer id, quote id, cost record id, dealer price record id |
| Metrics | cost increase percent, dealer price update lag days, gross margin before/after |

## Likely Current ERP Collections/Modules To Inspect Later

- procurement supplier quotes
- product cost history
- price book / dealer price list
- approval status log
- product master and supplier-product mapping

## Proposed Director JSON Read-Only Evidence Rows

| field | proposed value |
| --- | --- |
| `finding_key` | `supplier_cost_up` |
| `source_domain` | `procurement_pricing` |
| `source_collections_or_modules` | `supplier_quote_history`, `product_cost_history`, `dealer_price_update_history` |
| `time_window` | last 30/60/90 days, explicitly stated |
| `affected_entity_type` | `product_supplier_pair` or `sku_supplier_pair` |
| `metric_name` | `cost_increase_percent`, `dealer_price_update_lag_days`, `margin_change_percent` |
| `calculation_method` | Compare latest approved supplier cost with previous approved cost; join to latest dealer price effective date. |
| `not_allowed_actions` | price change, supplier negotiation order, dealer notification, Action Draft Schema |

## Data Quality Gates

- Cost records must have approved status and effective dates.
- Supplier quote and product cost must map to the same SKU/product.
- Dealer price history must use the same product and relevant dealer segment.
- Threshold source must be explicit, for example policy threshold or configured margin-risk threshold.
- Downgrade confidence if price update status is draft, missing, or outside the same time window.
- Refuse strong conclusion if joins are missing or if only alert labels are available.

## Example Advisory-Only Wording

"Supplier cost appears to have increased for this product while dealer price evidence is incomplete or lagging. Treat this as a pricing review item, not an automatic price-change instruction."

## Future Implementation Acceptance Criteria

- Director JSON includes at least one read-only evidence row with cost increase percent and dealer price update lag.
- Evidence row includes source modules, time window, calculation method, sample size, and data quality status.
- Alert-label-only evidence is downgraded to low confidence.

## Future Tests

- Unit test cost increase percent calculation.
- Fixture test for approved quote linked to product cost history.
- Negative test when dealer price update history is missing.
- JSON parse test for evidence rows.

## Must Not Do Now

- Do not implement pricing mutations.
- Do not add Action Draft Schema.
- Do not call providers or notify dealers.
- Do not create migrations or query production DB.

