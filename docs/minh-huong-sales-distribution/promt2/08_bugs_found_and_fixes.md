# Bugs Found And Fixes

## P0 - Concurrent Activation Approval Could Double Side Effects

Before:

- Approval read `PENDING_REVIEW` before the transaction.
- Payment, subscription, wallet, and commission side effects were created before final order status update.
- Two stale concurrent approvals could both create side effects.

After:

- `apps/api/src/activation-orders/activation-orders.service.ts:615` claims the order with `updateMany` on `{ id, status: 'PENDING_REVIEW' }` inside the transaction before side effects.
- If the claim count is zero, approval throws before side effects.
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:543` proves stale repeated approval writes side effects once.

## P0 - Concurrent Payout Pay/Reject Could Double Ledger Writes

Before:

- Payout status was checked before the transaction.
- Ledger RELEASE/DEBIT writes happened without first conditionally claiming the payout status inside the transaction.

After:

- `apps/api/src/channel-finance/channel-finance.service.ts:702` claims payable statuses inside the transaction.
- `apps/api/src/channel-finance/channel-finance.service.ts:773` claims rejectable status inside the transaction.
- `apps/api/src/channel-finance/channel-finance.service.spec.ts:222` and `:281` prove repeated stale calls do not double-write ledger entries.

## P2 - Commission Release Count Could Over-Report

Before:

- A stale due earning with `updateMany.count = 0` created no duplicate ledger entry, but the service still incremented `released`.

After:

- `apps/api/src/activation-orders/activation-orders.service.ts:1417` returns a transaction boolean.
- `released` increments only after the conditional update and CREDIT ledger write succeed.
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:483` proves the second stale release reports `released: 0`.
