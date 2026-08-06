# Prompt 2 Review Sync

## Repo Baseline

- Repo root used: `C:\Users\PC\Documents\code\minhhuong`
- `git status --short`: not available because this directory is not a git repository.

## Prompt 2 Inputs Read

All required Prompt 2 files were found under `docs/minh-huong-sales-distribution/promt2/`.

## Tests Added In Prompt 2

- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
  - self-service order -> proof -> approve -> child subscription + commission.
  - sale-assisted order -> duplicate guard -> approve -> closer/upline commission.
  - stale repeated approve guard.
  - commission release idempotency and canceled source order path.
- `apps/api/src/channel-finance/channel-finance.service.spec.ts`
  - payout request HOLD.
  - pay payout RELEASE + DEBIT.
  - repeated pay guard.
  - reject RELEASE.
  - repeated reject guard.
  - terminal transition guard.
  - non-admin channel subtree and empty-participant scope.

## Source Files Changed In Prompt 2

- `apps/api/src/activation-orders/activation-orders.service.ts`
  - approval now claims `PENDING_REVIEW` with conditional `updateMany` inside transaction.
  - commission release count increments only after successful conditional update and CREDIT ledger write.
- `apps/api/src/channel-finance/channel-finance.service.ts`
  - payout pay/reject now claim allowed status with conditional `updateMany` inside transaction.

## Bugs Fixed In Prompt 2

- P0: concurrent activation approval could double-create payment/subscription/commission.
- P0: concurrent payout pay/reject could double-write ledger entries.
- P2: commission release could over-report `released` count on stale reads.

## Remaining Gaps From Prompt 2

- No `OrderStatusHistory`.
- No explicit idempotency record/key contract.
- No `Subscription.sourceOrderId` or package relation.
- No package entitlement or entitlement snapshot.
- No commission policy version/snapshot.
- Channel subtree scope still needs DB-backed integration tests.
- Canonical BA v1.1 affiliate/QR docs are still missing.

## Prompt 3 Constraint

Prompt 3 is no-code design. It must not modify product source, schema, migration, controller, service, or frontend files.
