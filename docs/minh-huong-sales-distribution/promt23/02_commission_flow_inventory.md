# Commission Flow Inventory

## Approval Flow

- `approveOrder` loads `ActivationOrder` with `user`, `createdBy`, `referrerMember`, `channelParticipant`, and `agency`.
- Inside the approval transaction it updates the order to `APPROVED`, creates manual payment, creates subscription, writes wallet ledger, then calls `createCommissionEntries`.
- Evidence: `apps/api/src/activation-orders/activation-orders.service.ts:1013`, `1057`, `1072`, `1086`, `1098`.

## Commission Creation

- `createCommissionEntries` has an idempotency guard by counting existing `CommissionEarning` rows for the order.
- It resolves a participant, walks active parent participants up to four nodes, and creates one `CommissionEarning` per depth.
- Evidence: `apps/api/src/activation-orders/activation-orders.service.ts:2060`, `2099`, `2111`, `2125`, `2135`.

## Models

- `CommissionEarning` stores `activationOrderId`, `participantId`, beneficiary fields, base amount, rate, amount, currency, status, depth, availability, and now nullable `attributionSnapshotJson`.
- `CommissionLedgerEntry` stores ledger entries for release/revoke/payout flows, not approve-time proof.
- `ActivationOrder` stores `affiliateAttributionSnapshotJson`.
- Evidence: `apps/api/prisma/schema.prisma:1001`, `1013`, `1032`, `1085`, `1105`.

## Existing Rate And Amount Policy

- Base amount is `order.amountCents`.
- Currency is `order.currency`.
- Rate is `Math.round(4000 * Math.pow(0.4, depth))`.
- Commission amount is `Math.round(baseAmountCents * rateBps / 10000)`.
- Evidence: `apps/api/src/activation-orders/activation-orders.service.ts:2126`, `2127`, `2128`, `2156`, `2381`.

## Existing Attribution Before Prompt 23

- Commission recipient selection used `order.channelParticipant`, then fallback legacy participant lookup from `agencyId` or `createdById`.
- That did not persist immutable affiliate campaign/channel/placement/referral/QR proof on the commission row.
- Current affiliate link metadata was not part of the approve flow, but there was also no commission-level immutable affiliate proof.

## Ledger Inventory

- `CommissionLedgerEntry` is created when pending commissions are released, and on revoke/payout flows.
- Prompt 23 does not add ledger writes during approval and does not change ledger release behavior.
- Evidence: `apps/api/src/activation-orders/activation-orders.service.ts:2258`, `2299`.
