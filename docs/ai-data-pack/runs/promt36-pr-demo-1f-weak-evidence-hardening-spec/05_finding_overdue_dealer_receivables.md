# Finding Spec: overdue_dealer_receivables

## Current Evidence

- Classification: `detected_but_weak_evidence`
- Current location: `18_alerts + 16_operation_capacity`
- Current signal: alert label plus `high_sales_late_payment_agent` operation signal with affected count reported as 62 in the available transcript.

## Why Evidence Is Weak

The current evidence does not expose dealer/agent receivable aging, invoice/order linkage, due dates, last payment dates, outstanding balances, collection owner, or aging buckets.

## Business Meaning For Director

The director needs to know which dealer/agent receivables are overdue, how much is outstanding, how long it has been overdue, and who owns collection follow-up. Without that, the safe conclusion is only that receivable detail should be reviewed before cash or sales decisions.

## Minimum ERP Fields/Tables Needed

| Area | Minimum fields |
| --- | --- |
| Dealer/agent receivables | dealer/agent id, receivable id, invoice id, order id, invoice date, due date, outstanding balance |
| Payment history | payment id, payment date, amount paid, allocation to invoice/order |
| Aging | days overdue, aging bucket, collection status, collection owner |
| Commercial context | order value, channel, dealer tier, credit terms, dispute flag |

## Likely Current ERP Collections/Modules To Inspect Later

- agent/dealer statements
- invoices
- orders
- payment allocations
- receivable aging report
- collection task/owner module

## Proposed Director JSON Read-Only Evidence Rows

| field | proposed value |
| --- | --- |
| `finding_key` | `overdue_dealer_receivables` |
| `source_domain` | `finance_receivables` |
| `source_collections_or_modules` | `agentstatements`, `invoices`, `orders`, `payments` |
| `affected_entity_type` | `dealer` or `agent` |
| `metric_name` | `outstanding_balance`, `days_overdue`, `aging_bucket`, `overdue_invoice_count` |
| `calculation_method` | Sum unpaid invoice balances past due date after payment allocation. |
| `not_allowed_actions` | block dealer, send collection notice, change credit limit, Action Draft Schema |

## Data Quality Gates

- Receivable must map to invoice/order and dealer/agent.
- Due date must be present and based on explicit credit terms.
- Outstanding balance must account for applied payments.
- Sample size must include invoice count and total amount.
- Downgrade confidence if payment allocation is incomplete.
- Refuse strong conclusion if only late-payment alert labels exist.

## Example Advisory-Only Wording

"Receivable risk appears present, but collection priority should be based on invoice-level aging and outstanding balance evidence before taking action."

## Future Implementation Acceptance Criteria

- Director JSON includes dealer/agent receivable aging evidence rows.
- Each row includes due date, last payment date, outstanding balance, aging bucket, and collection owner when available.
- Rows with missing invoice linkage are marked caution or blocked.

## Future Tests

- Unit test aging bucket calculation.
- Fixture test for partial payments reducing outstanding balance.
- Negative test for missing due date.
- Director JSON section presence and parse tests.

## Must Not Do Now

- Do not trigger collection workflow.
- Do not block dealers/agents.
- Do not change credit limits.
- Do not access production DB.

