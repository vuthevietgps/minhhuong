# Financial Safety Evidence

## Pre-Approval

Affiliate order creation now writes only order snapshot JSON fields. It does not create:

- payment
- subscription
- wallet ledger
- commission
- commission ledger
- payout

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:966`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1067`

## Approval Only

Commission rows are still created only in the existing approval flow.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:1163`
- `apps/api/src/activation-orders/activation-orders.service.ts:2322`

## Idempotency

Existing approve idempotency test still passes with affiliate snapshot and commission chain snapshot.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1306`
