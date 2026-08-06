# Prompt 2 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: test-hardening + minimal P0 correctness fixes  
Verdict: PASS

## Prompt 1 Inputs

Read all required Prompt 1 outputs from `docs/minh-huong-sales-distribution/bromt1/`. No Prompt 1 input was missing.

## Tests Added

- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
  - self-service order -> payment proof -> operations approve -> child subscription + commission
  - sale-assisted order -> duplicate guard -> approve -> closer/upline pending commission
  - repeated approve stale-read guard
  - commission release idempotency and canceled source order path
- `apps/api/src/channel-finance/channel-finance.service.spec.ts`
  - payout request HOLD
  - payout pay RELEASE + DEBIT
  - repeated pay guard
  - reject RELEASE
  - repeated reject guard
  - terminal status transition guard
  - non-admin channel subtree and empty-participant finance scope

## Results By P0 Group

- Self-service order/proof/approve/subscription: covered by service-level unit test at `activation-orders.service.spec.ts:249`.
- Sale-assisted order/commission: covered by service-level unit test at `activation-orders.service.spec.ts:362`.
- Commission release idempotency: covered by service-level unit tests at `activation-orders.service.spec.ts:483` and `activation-orders.service.spec.ts:577`.
- Payout ledger/idempotency: covered by service-level unit tests at `channel-finance.service.spec.ts:137`, `:180`, `:222`, `:244`, `:281`, and `:306`.
- Channel subtree scope: partially covered by service-level unit tests at `channel-finance.service.spec.ts:330` and `:360`.

## Bugs Found And Fixed

1. P0: activation order approval could double-create payment/subscription/commission under concurrent stale reads because the order status was updated after side effects. Fixed by claiming the order with conditional `updateMany` inside the transaction before side effects.
2. P0: payout pay/reject could double-write ledger entries under concurrent stale reads because payout status was checked outside the transaction. Fixed by conditional `updateMany` inside the transaction before ledger writes.
3. P2: commission release cron returned an inaccurate `released` count when a stale due earning failed the conditional update. Fixed so the counter increments only when CREDIT is actually written.

## Source Evidence

- `apps/api/src/activation-orders/activation-orders.service.ts:615` conditionally claims `PENDING_REVIEW` before approval side effects.
- `apps/api/src/activation-orders/activation-orders.service.ts:681` returns the claimed approved order after side effects.
- `apps/api/src/activation-orders/activation-orders.service.ts:1417` only reports released commission when the conditional update succeeds.
- `apps/api/src/channel-finance/channel-finance.service.ts:702` conditionally claims payable payout status.
- `apps/api/src/channel-finance/channel-finance.service.ts:773` conditionally claims rejectable payout status.

## Commands Run

- `git status --short` -> failed because `C:\Users\PC\Documents\code\minhhuong` is not a git repository.
- Baseline before changes: `npm --prefix apps/api test -- --runInBand` -> passed, 6 suites, 20 tests.
- Baseline before changes: `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 1 suite, 1 test.
- Targeted after changes: `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 14 tests.
- Full unit after changes: `npm --prefix apps/api test -- --runInBand` -> passed, 8 suites, 34 tests.
- E2E after changes: `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 1 suite, 1 test.
- Build after changes: `npm --prefix apps/api run build` -> passed.

## Scope Creep Check

No affiliate/QR, payment gateway/webhook/reconciliation, frontend rewrite, schema migration, model rename, Lead CRM, RenewalOpportunity, or AI learning/game feature was implemented.

## Next Prompt Recommendation

Prompt 3 should be a narrow technical spec for entitlement snapshot, order status history, explicit idempotency keys/contracts, subscription source-order/package traceability, and commission policy snapshot/versioning.
