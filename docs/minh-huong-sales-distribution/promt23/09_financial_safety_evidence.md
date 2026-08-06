# Financial Safety Evidence

## Approval Only

Commission proof is written only inside the existing approval commission path:

- `approveOrder`
- `createCommissionEntries`
- `createCommissionForParticipant`

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:1013`
- `apps/api/src/activation-orders/activation-orders.service.ts:1098`
- `apps/api/src/activation-orders/activation-orders.service.ts:2060`

## No Pre-Approval Commission

Existing affiliate order creation test still asserts no payment, subscription, commission, or wallet ledger side effects before approval.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:776`

## Idempotency

Affiliate-attributed approve replay with the same idempotency key creates commission only once.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:973`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1024`

## No Forbidden Financial Surface Added

Prompt 23 does not create or update payout requests, payment gateway records, webhook records, reconciliation records, or wallet ledger outside the existing approval path.
