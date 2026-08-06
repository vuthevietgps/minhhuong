# Tests Added Or Changed

## Activation Orders

File: `apps/api/src/activation-orders/activation-orders.service.spec.ts`

- `:249` covers self-service order creation, proof upload, operations approval, child subscription creation, and pending commission creation.
- `:362` covers sale-assisted order creation, duplicate creator/email guard, approval, and closer/upline pending commission creation.
- `:483` covers repeated due commission release without double CREDIT ledger entry and with accurate release count.
- `:522` covers rejecting non-pending activation approval before transaction side effects.
- `:543` covers stale repeated approval inside the transaction claim without duplicate payment/subscription/commission.
- `:577` covers canceling due commission when the source order is no longer approved.

## Channel Finance

File: `apps/api/src/channel-finance/channel-finance.service.spec.ts`

- `:137` covers payout request creation and HOLD ledger.
- `:180` covers payout pay creating RELEASE + DEBIT.
- `:222` covers repeated payout pay without duplicate ledger writes.
- `:244` covers payout reject creating RELEASE.
- `:281` covers repeated payout reject without duplicate RELEASE.
- `:306` covers terminal payout status transitions blocked before ledger writes.
- `:330` covers non-admin finance scope by channel subtree and own orders.
- `:360` covers non-admin user without channel participant receiving empty finance scope.

## Test Type

All added tests are service-level unit tests with mocked Prisma delegates and notification side effects. Existing e2e smoke coverage was retained and rerun.
