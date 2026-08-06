# Prompt 21 Result - Minh Huong Commercial Distribution

Date: 2026-06-15  
Mode: implementation-narrow-slice / read-only affiliate attribution CSV export  
Verdict: CONDITIONAL

## Conditional Reason

Implementation is complete and all required tests/build passed. The result is `CONDITIONAL` because:

- `git status --short` cannot run in this workspace: `fatal: not a git repository (or any of the parent directories): .git`
- DB-backed suites still emit the known non-failing `pg` deprecation warning
- the first DB-backed test attempt hit `ECONNREFUSED` because Docker/Postgres was not running; after starting Docker and waiting for `minhhuong-postgres` healthy, the same tests passed

## Scope Implemented

Implemented Prompt 21 only:

- read-only list CSV endpoint `GET /v1/channel-affiliate/order-attributions/export.csv`
- read-only aggregate CSV endpoint `GET /v1/channel-affiliate/order-attributions/aggregates/export.csv`
- list export query DTO with Prompt 19 filters and max `limit` 1000
- aggregate export reuses Prompt 20 query contract and limit 1-100
- CSV response headers with `text/csv; charset=utf-8` and attachment filenames
- deterministic fixed headers
- CSV escaping for comma, quote, CR, and LF
- source of truth remains `ActivationOrder.affiliateAttributionSnapshotJson`
- list export whitelist with no customer email or display name
- aggregate export whitelist with currency-safe amount fields
- scope/RBAC using existing channel affiliate view roles and lineage scope
- tests for immutable snapshot source, scope safety, privacy, read-only financial safety, currency safety, CSV escaping, and invalid query rejection

## Routes

```text
GET /v1/channel-affiliate/order-attributions/export.csv
GET /v1/channel-affiliate/order-attributions/aggregates/export.csv
```

## Hard-Ban Check

Not implemented:

- commission policy changes
- commission calculation redesign
- payout/payment gateway/webhook/reconciliation
- finance report redesign outside affiliate attribution export
- frontend/UI
- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- customer/register attribution API
- first-click/last-click attribution engine
- manual override/dispute workflow
- coupon/discount
- renewal ownership
- fraud/risk scoring
- broad channel hierarchy redesign
- QR image rendering
- schema migration

## Test Summary

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api run build` -> passed before focused tests and final.
- `npm --prefix apps/api test -- --runInBand channel-affiliate` -> passed, 2 suites, 23 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` -> passed, 1 suite, 17 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 33 tests.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 23 suites, 155 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 5 suites, 12 tests.
- `git status --short` -> failed because workspace is not a git repository.

## Evidence Packet

Full evidence is under:

- `docs/minh-huong-sales-distribution/promt21/`

## Next Prompt Recommendation

Prompt 22 should add narrow operational audit/read tracking for affiliate report/export access, still preserving immutable snapshots, scope safety, privacy whitelist, read-only financial safety, and still excluding commission/payment/payout/frontend/mobile/customer attribution work.
