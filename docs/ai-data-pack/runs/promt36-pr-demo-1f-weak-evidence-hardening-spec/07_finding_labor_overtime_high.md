# Finding Spec: labor_overtime_high

## Current Evidence

- Classification: `detected_but_weak_evidence`
- Current location: `18_alerts`
- Current label: `labor_overtime_high_without_matching_revenue_growth`

## Why Evidence Is Weak

The current evidence lacks timesheets, overtime hours, labor cost by period, revenue by comparable period, SLA/workload, staff capacity, and overtime thresholds.

## Business Meaning For Director

The director needs to know whether overtime is operationally justified by workload/revenue or whether it indicates capacity planning or efficiency risk. Without supporting rows, the safe conclusion is only to review staffing and workload evidence.

## Minimum ERP Fields/Tables Needed

| Area | Minimum fields |
| --- | --- |
| Timesheets | staff/team id, regular hours, overtime hours, date, approval status |
| Labor cost | base cost, overtime cost, period, department/team |
| Revenue comparison | revenue, gross profit, order count, comparable period |
| Workload/SLA | tickets/orders/tasks processed, SLA target, SLA breach count |
| Capacity | staff count, planned capacity hours, overtime threshold |

## Likely Current ERP Collections/Modules To Inspect Later

- timesheets
- payroll/labor cost summary
- order/task workload
- SLA reporting
- staff scheduling/capacity
- revenue by period

## Proposed Director JSON Read-Only Evidence Rows

| field | proposed value |
| --- | --- |
| `finding_key` | `labor_overtime_high` |
| `source_domain` | `labor_capacity_finance` |
| `source_collections_or_modules` | `timesheets`, `labor_costs`, `orders`, `sla_metrics`, `revenue_summary` |
| `affected_entity_type` | `team`, `department`, or `staff_group` |
| `metric_name` | `overtime_hours`, `overtime_cost`, `revenue_growth_percent`, `workload_growth_percent` |
| `calculation_method` | Compare overtime hours/cost with revenue and workload growth over the same period. |
| `not_allowed_actions` | reduce staff hours, approve hiring, change schedules, Action Draft Schema |

## Data Quality Gates

- Timesheets must be approved or clearly marked draft.
- Labor cost and revenue must use comparable periods.
- SLA/workload data must map to the same team or department.
- Threshold source must be explicit.
- Downgrade confidence if overtime exists but workload data is missing.
- Refuse strong conclusion if only alert label is present.

## Example Advisory-Only Wording

"Overtime may be elevated relative to revenue growth. Review approved timesheets, workload, and SLA pressure before making staffing decisions."

## Future Implementation Acceptance Criteria

- Director JSON includes overtime hours, overtime cost, comparable revenue/workload metrics, and threshold source.
- Missing SLA/workload data causes confidence downgrade.
- Advisory text avoids staffing commands.

## Future Tests

- Unit test overtime threshold classification.
- Fixture test comparing overtime growth with revenue growth.
- Negative test for mismatched time windows.
- Static guard test preventing action wording.

## Must Not Do Now

- Do not adjust schedules or staffing.
- Do not create approval workflow.
- Do not use production payroll data.
- Do not add provider execution.

