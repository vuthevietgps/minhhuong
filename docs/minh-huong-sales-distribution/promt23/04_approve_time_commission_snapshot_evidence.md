# Approve-Time Commission Snapshot Evidence

## Approval Wiring

- `approveOrder` resolves commission attribution at the start of the transaction body.
- The resolved attribution is passed into `createCommissionEntries`.
- `createCommissionForParticipant` writes the sanitized proof to `CommissionEarning.attributionSnapshotJson` only when present.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:1013`
- `apps/api/src/activation-orders/activation-orders.service.ts:1098`
- `apps/api/src/activation-orders/activation-orders.service.ts:2149`
- `apps/api/src/activation-orders/activation-orders.service.ts:2196`

## Test Proof

- Test `creates commission attribution proof from the immutable affiliate order snapshot` approves an affiliate-attributed order.
- It asserts the commission row keeps snapshot campaign/channel/placement/referral, QR id, agency id, member id, link id, click id, and snapshot timestamps.
- It also asserts amount/rate/currency remain unchanged.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:661`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:718`
