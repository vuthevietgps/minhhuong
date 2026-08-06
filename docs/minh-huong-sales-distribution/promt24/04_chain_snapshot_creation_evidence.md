# Chain Snapshot Creation Evidence

## Self-Service

- `createSelfServiceOrder` builds commission chain snapshot after affiliate click attribution resolves the participant.
- It writes `commissionChainSnapshotJson` only when an affiliate snapshot exists.
- Pending order creation still creates no commission/payment/subscription/wallet side effects.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:744`
- `apps/api/src/activation-orders/activation-orders.service.ts:797`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:966`

## Sale-Assisted

- `createOrder` uses the same snapshot builder for affiliate-attributed sale-assisted orders.
- Non-affiliate orders do not get this field.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:443`
- `apps/api/src/activation-orders/activation-orders.service.ts:492`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1525`

## Upline Snapshot

- Test creates an affiliate participant with manager parent.
- Order creation snapshot includes sale depth 0 and manager depth 1 before approval.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1067`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1107`
