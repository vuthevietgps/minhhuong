# Order Attribution Inventory

## Current Order Fields

`apps/api/prisma/schema.prisma`

- `ActivationOrder.channelParticipantId`: existing participant attribution field.
- `ActivationOrder.agencyId`: existing agency attribution field.
- `ActivationOrder.referrerMemberId`: existing agency member referral field.
- `ActivationOrder.entitlementSnapshotJson`: existing immutable entitlement snapshot pattern.

## New Field

`ActivationOrder.affiliateAttributionSnapshotJson`: `apps/api/prisma/schema.prisma:1104`

This follows the existing JSON snapshot convention instead of adding a new attribution model or FK-heavy design.

## Create Flows Inventoried

`apps/api/src/activation-orders/activation-orders.service.ts`

- sale-assisted create starts in `createOrder`.
- self-service create starts in `createSelfServiceOrder`.
- existing channel attribution is resolved through `resolveChannelAttribution`.
- approval creates financial side effects only after status approval.

## Approval Flow Boundary

Existing approve writes remain in `approveOrder`:

- `payment.create`: line 1000
- `subscription.create`: line 1015
- `walletLedgerEntry.create`: line 1029
- `createCommissionEntries`: line 1041
- `createCommissionEntries` implementation: line 1907

Prompt 18 did not add financial writes to order creation.
