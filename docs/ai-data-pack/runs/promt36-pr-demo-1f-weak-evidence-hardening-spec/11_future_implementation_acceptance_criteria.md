# Future Implementation Acceptance Criteria

This file defines criteria for a later read-only implementation slice. It does not implement code, DB queries, exports, or schemas now.

Future implementation can be accepted only if:

- exported/downloaded Director JSON is parseable;
- no secret, token, storage path, raw provider payload, or credential is exposed;
- all five weak findings are upgraded from alert-label-only to evidence-backed read-only rows;
- every evidence row includes source domain, source modules, time window, affected entity, metric, threshold, calculation method, sample size, data quality status, and confidence;
- data quality gates downgrade weak or incomplete evidence;
- tests exist for each of the five findings;
- demo seed/fixture evidence is used only if a later prompt explicitly allows it;
- no Action Draft Schema is added;
- no action import is added;
- no approval workflow is added;
- no provider dry-run/live execution is added;
- no production DB is queried;
- no provider mutation or adapter is added.

## Per-Finding Acceptance

| Finding | Minimum future acceptance |
| --- | --- |
| `supplier_cost_up` | Cost increase percent, dealer price update lag, effective dates, approval status, and join proof exist. |
| `overdue_dealer_receivables` | Invoice/order linkage, due date, last payment date, outstanding balance, aging bucket, and owner exist. |
| `low_inventory_best_seller` | Best-seller rank, SKU, available quantity, reorder threshold, incoming stock, velocity, and days of cover exist. |
| `labor_overtime_high` | Timesheets, overtime hours/cost, revenue/workload comparison, staff capacity, and threshold exist. |
| `slow_supplier_good_cost` | Lead time, late delivery count/rate, fulfilled PO count, accepted quotes, cost advantage, and reliability score exist. |

