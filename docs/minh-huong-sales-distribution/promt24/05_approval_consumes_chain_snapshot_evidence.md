# Approval Consumes Chain Snapshot Evidence

## Approval Wiring

- `approveOrder` resolves the affiliate commission proof and commission chain before approval side effects.
- `createCommissionEntries` receives the resolved chain.
- If snapshot items exist, it creates `CommissionEarning` from frozen items and returns without walking current hierarchy.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:1075`
- `apps/api/src/activation-orders/activation-orders.service.ts:1163`
- `apps/api/src/activation-orders/activation-orders.service.ts:2322`
- `apps/api/src/activation-orders/activation-orders.service.ts:2366`

## Malformed Snapshot

- Malformed chain snapshot throws `BadRequestException`.
- Test asserts no order update, payment, subscription, or commission side effects occur.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:2218`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:925`
