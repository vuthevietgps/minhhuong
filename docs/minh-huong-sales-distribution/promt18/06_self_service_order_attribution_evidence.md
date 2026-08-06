# Self-Service Order Attribution Evidence

## Implementation

`apps/api/src/activation-orders/activation-orders.service.ts`

- self-service resolves click before account/order writes: lines 633-637
- self-service writes `affiliateAttributionSnapshotJson`: lines 683-686
- self-service status history records only safe click reference metadata: line 704

## Test Evidence

`apps/api/src/activation-orders/activation-orders.service.spec.ts`

- valid self-service affiliate click snapshot test: line 637
- passes `affiliateClickId`: line 666
- reads order snapshot from create payload: line 670
- asserts snapshot fields: line 682
- asserts no payment/subscription/commission/wallet side effects on order creation: lines 705-708

## Missing Click Behavior

The existing self-service create path still passes with no `affiliateClickId`; test asserts no snapshot field and no click lookup:

- no snapshot field: line 514
- upload proof/approve do not rewrite snapshot: lines 573 and 633
