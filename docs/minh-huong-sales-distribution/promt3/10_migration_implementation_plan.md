# Migration And Implementation Plan For Prompt 4+

Prompt 3 is no-code. This file defines future implementation slices.

## Recommended Prompt 4 Scope

Do one narrow slice only:

Preferred: Slice 4A-min, `OrderStatusHistory` plus `IdempotencyRecord` for approve order, payout pay, and payout reject.

Reason: it builds directly on Prompt 2's P0 duplicate side-effect fixes and improves audit/replay semantics without touching entitlement or affiliate.

## Slice 4A - Status History And Minimal Idempotency

Likely files:

- `apps/api/prisma/schema.prisma`
- new Prisma migration
- `apps/api/src/activation-orders/activation-orders.service.ts`
- `apps/api/src/channel-finance/channel-finance.service.ts`
- DTO/interceptor/helper for idempotency header
- tests under activation-orders and channel-finance

Migration risk: medium.

Backward compatibility:

- nullable/optional fields.
- existing clients can continue without idempotency header during rollout, or header can be required only for admin review endpoints after UI update.

Required tests:

- approve writes status history once.
- repeated same idempotency key replays response.
- repeated different payload same key returns conflict.
- stale second approve with different key fails without side effects.
- payout pay/reject same coverage.

Rollback notes:

- If idempotency helper has issues, disable header requirement and keep conditional status claims.
- History rows can remain as append-only data.

Acceptance:

- Prompt 2 tests still pass.
- New idempotency/history tests pass.
- No duplicate side effects under same key or different-key stale racing.

## Slice 4B - Subscription Traceability

Likely files:

- `apps/api/prisma/schema.prisma`
- new migration
- activation approval service
- backfill script or migration SQL
- learning tests

Migration risk: medium.

Backward compatibility:

- add nullable `sourceOrderId`, `activationPackageId`, `entitlementSnapshotJson`.
- keep `providerRef`.

Required tests:

- new approved order creates subscription with `sourceOrderId`.
- source order uniqueness prevents duplicate subscription per order.
- legacy `providerRef` backfill works.
- active subscription access remains unchanged.

Rollback:

- keep nullable columns unused if rollout must pause.

Acceptance:

- trace from subscription to order/package is explicit for new approvals.

## Slice 4C - Package Entitlement And Snapshot

Likely files:

- `schema.prisma`
- channel-admin package service/controller
- activation order service
- learning entitlement helper
- package/admin tests

Migration risk: medium-high.

Backward compatibility:

- snapshot fields nullable initially.
- legacy default entitlement fallback.

Required tests:

- entitlement rows per package.
- order captures snapshot.
- subscription receives snapshot.
- package edits do not mutate old snapshots.

Rollback:

- ignore entitlement enforcement while preserving snapshot data.

Acceptance:

- runtime learning access can read snapshot but legacy active access still works.

## Slice 4D - Commission Policy Version/Snapshot

Likely files:

- `schema.prisma`
- channel-admin commission policy service/controller
- activation commission creation service
- commission tests

Migration risk: medium-high.

Backward compatibility:

- existing earnings keep null version and are treated as legacy.
- create default version equivalent to current formula.

Required tests:

- default policy version matches current rates.
- new earning stores policy/calculation/upline snapshots.
- changing policy does not alter old earnings.

Rollback:

- keep hardcoded fallback if no active version is found, but log/document legacy path.

Acceptance:

- every new earning is explainable from stored snapshot.

## Slice 4E - DB-Backed Channel Scope Tests

Likely files:

- integration test files.
- test factories.
- test DB config.

Migration risk: low if test-only.

Backward compatibility:

- no product behavior change unless tests reveal bug.

Required tests:

- sibling order/report/wallet/payout/CSV exclusion.
- manager/agency/director/admin expected visibility.

Rollback:

- tests can be isolated from product build if DB environment is not ready, but should be required before channel expansion.

Acceptance:

- real DB rows prove no sibling leakage.

## Slices Not For Prompt 4

- affiliate/QR implementation.
- payment gateway/webhook/reconciliation.
- Lead CRM.
- RenewalOpportunity.
- frontend rewrite.
