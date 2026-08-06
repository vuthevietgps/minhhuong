# Parent Chain Commission Inventory

## Starting Participant

- Before Prompt 24, `createCommissionEntries` started from the resolved order participant.
- For affiliate orders after Prompt 23, this participant came from `ActivationOrder.affiliateAttributionSnapshotJson.participantId`.
- Otherwise it used `order.channelParticipant`, then legacy fallback by `agencyId` or `createdById`.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:2205`
- `apps/api/src/activation-orders/activation-orders.service.ts:2322`

## Parent Walk

- Existing logic walked `parentParticipantId` with `tx.channelParticipant.findUnique`.
- It stopped when parent was missing, inactive, or after four nodes.
- Parent walk therefore read mutable participant hierarchy at approval time.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:2421`
- `apps/api/src/activation-orders/activation-orders.service.ts:2426`

## Beneficiary And Rate

- Beneficiary type is `AGENCY` only for agency participants, otherwise `SALE`.
- Beneficiary user id is used for non-agency participants.
- Beneficiary agency id is used for agency participants.
- Rate formula is `Math.round(4000 * Math.pow(0.4, depth))`.
- Amount formula is `Math.round(baseAmountCents * rateBps / 10000)`.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:2430`
- `apps/api/src/activation-orders/activation-orders.service.ts:2483`
- `apps/api/src/activation-orders/activation-orders.service.ts:2708`
