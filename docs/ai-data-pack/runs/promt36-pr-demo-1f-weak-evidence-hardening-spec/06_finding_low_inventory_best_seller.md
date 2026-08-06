# Finding Spec: low_inventory_best_seller

## Current Evidence

- Classification: `detected_but_weak_evidence`
- Current location: `18_alerts`
- Current label: `best_selling_product_low_inventory`

## Why Evidence Is Weak

The current evidence is an alert label without SKU/product id, best-seller rank, inventory on hand, reserved quantity, available quantity, reorder threshold, incoming stock, sales velocity, or days of cover.

## Business Meaning For Director

The director needs to know whether a high-selling product is at risk of stockout and whether replenishment is already inbound. Without evidence rows, the safe conclusion is an inventory review item, not a purchase instruction.

## Minimum ERP Fields/Tables Needed

| Area | Minimum fields |
| --- | --- |
| Product ranking | SKU/product id, best-seller rank, sales quantity, sales window |
| Inventory | on-hand quantity, reserved quantity, available quantity, warehouse id |
| Replenishment | reorder threshold, incoming stock quantity, expected receipt date, purchase order status |
| Velocity | average daily sales, days of cover, stockout risk threshold |

## Likely Current ERP Collections/Modules To Inspect Later

- product variant performance
- inventory balances
- reserved stock/order allocation
- purchase orders/incoming stock
- sales velocity or order item history
- reorder rule configuration

## Proposed Director JSON Read-Only Evidence Rows

| field | proposed value |
| --- | --- |
| `finding_key` | `low_inventory_best_seller` |
| `source_domain` | `inventory_sales` |
| `source_collections_or_modules` | `product_variant_performance`, `inventory_balances`, `purchase_orders` |
| `affected_entity_type` | `sku` or `product` |
| `metric_name` | `available_quantity`, `sales_velocity`, `days_of_cover`, `reorder_threshold` |
| `calculation_method` | Available quantity = on hand minus reserved; days of cover = available quantity / average daily sales. |
| `not_allowed_actions` | create purchase order, reserve stock, alter reorder rule, Action Draft Schema |

## Data Quality Gates

- SKU mapping must be consistent across sales and inventory modules.
- Available quantity must account for reserved stock.
- Sales velocity must declare its time window.
- Incoming stock must include status and expected date.
- Downgrade confidence if sales window and inventory snapshot time do not align.
- Refuse strong conclusion if best-seller rank exists but inventory quantity is missing.

## Example Advisory-Only Wording

"A best-selling SKU may have low available stock. Confirm available quantity, incoming stock, and days of cover before deciding on replenishment."

## Future Implementation Acceptance Criteria

- Director JSON includes best-seller rank, available quantity, reorder threshold, incoming stock, velocity, and days of cover.
- Rows with stale inventory snapshots are downgraded.
- Evidence differentiates on-hand, reserved, and available quantities.

## Future Tests

- Unit test days-of-cover calculation.
- Fixture test for reserved quantity reducing available stock.
- Negative test when SKU mapping is missing.
- JSON parse and evidence row presence tests.

## Must Not Do Now

- Do not create purchase orders.
- Do not change inventory allocations.
- Do not generate new seed/export behavior.
- Do not add DB migrations.

