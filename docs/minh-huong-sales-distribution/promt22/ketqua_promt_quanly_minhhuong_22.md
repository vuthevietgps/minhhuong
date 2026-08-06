# Prompt 22 Result - Minh Huong Commercial Distribution

Date: 2026-06-15  
Mode: implementation-narrow-slice / operational audit for affiliate report and export access  
Verdict: CONDITIONAL

## Conditional Reason

Implementation is complete and all required tests/build passed. The result is `CONDITIONAL` because:

- `git status --short` cannot run in this workspace: `fatal: not a git repository (or any of the parent directories): .git`
- DB-backed suites still emit the known non-failing `pg` deprecation warning

## Scope Implemented

Implemented Prompt 22 only:

- reused existing `AuditLog` table, no schema migration
- audits successful access to:
  - `GET /v1/channel-affiliate/order-attributions`
  - `GET /v1/channel-affiliate/order-attributions/aggregates`
  - `GET /v1/channel-affiliate/order-attributions/export.csv`
  - `GET /v1/channel-affiliate/order-attributions/aggregates/export.csv`
- records actor id, actor roles, route, report type, format, row/item count, timestamp, and safe filter summary
- stores no raw IP, raw User-Agent, hashes, Authorization, cookies, customer PII, payment proof, CSV body, or raw headers
- adds read endpoint `GET /v1/channel-affiliate/report-access-audits`
- restricts audit read to `ADMIN` and `OPERATIONS`
- preserves report source of truth as `ActivationOrder.affiliateAttributionSnapshotJson`
- proves financial/order/commission/payment/payout counters are unchanged except audit log writes

## Route

```text
GET /v1/channel-affiliate/report-access-audits
```

## Hard-Ban Check

Not implemented:

- commission policy changes
- commission calculation redesign
- payout/payment gateway/webhook/reconciliation
- frontend/UI
- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- customer/register attribution API
- first-click/last-click attribution engine
- attribution ownership changes
- manual override/dispute workflow
- coupon/discount
- renewal ownership
- fraud/risk scoring
- broad channel hierarchy redesign
- QR image rendering
- async export job/object storage
- report materialized view/read model table unrelated to audit

## Test Summary

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api run build` -> passed before focused tests and final.
- `npm --prefix apps/api test -- --runInBand channel-affiliate` -> passed, 2 suites, 25 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` -> passed, 1 suite, 19 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 33 tests.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 23 suites, 157 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 5 suites, 12 tests.
- `git status --short` -> failed because workspace is not a git repository.

## Evidence Packet

Full evidence is under:

- `docs/minh-huong-sales-distribution/promt22/`

## Next Prompt Recommendation

Prompt 23 should start a narrow commission proof/policy wiring slice from immutable order attribution snapshots, still excluding payment gateway, payout execution, frontend, mobile/customer attribution, first-click/last-click engine, and manual override/dispute workflow.
