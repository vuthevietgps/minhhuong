# Sale-Assisted Order Attribution Evidence

## Implementation

`apps/api/src/activation-orders/activation-orders.service.ts`

- sale-assisted resolves existing channel attribution first: lines 342-344
- sale-assisted resolves `affiliateClickId`: lines 345-349
- sale-assisted writes `affiliateAttributionSnapshotJson`: lines 391-394
- status history records safe click reference metadata: line 411

## Conflict Rule

If the sale-assisted path already has a selected participant and the click belongs to a different participant, service rejects with `BadRequestException` instead of overriding the selected participant.

Evidence:

- conflict check in resolver: lines 1789-1796
- compatible click test: `apps/api/src/activation-orders/activation-orders.service.spec.ts:1042`
- conflict reject test: `apps/api/src/activation-orders/activation-orders.service.spec.ts:1088`

## Behavior Preserved

Sale-assisted order creation without `affiliateClickId` still uses the existing participant resolution path and remains covered by the existing assisted sale/upline test.
