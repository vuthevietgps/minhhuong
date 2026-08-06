# Prompt 20 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: implementation-narrow-slice / read-only affiliate attribution aggregate report  
Verdict: CONDITIONAL

## Conditional Reason

Implementation is complete and all required tests/build passed. The result is `CONDITIONAL` because:

- `git status --short` cannot run in this workspace: `fatal: not a git repository (or any of the parent directories): .git`
- DB-backed suites still emit the known non-failing `pg` deprecation warning from prior accepted baselines

## Scope Implemented

Implemented Prompt 20 only:

- read-only endpoint `GET /v1/channel-affiliate/order-attributions/aggregates`
- query DTO `AffiliateOrderAttributionAggregateQueryDto`
- shared Prompt 19 filter DTO base `AffiliateOrderAttributionFiltersDto`
- service method `ChannelAffiliateService.listOrderAttributionAggregates`
- source of truth is `ActivationOrder.affiliateAttributionSnapshotJson`
- `groupBy` support for participant, agency, agency member, affiliate link, QR asset, campaign, channel, placement, and package
- reused Prompt 19 filters for participant, agency, agency member, affiliate link, QR asset, click id, campaign, channel, placement, package, order status, order created date, and click date
- aggregate metrics: total attributed orders, approved orders, count by status, approved amount by currency, first order date, and last order date
- scope/RBAC using existing channel-affiliate view roles and lineage scope
- response whitelist with no customer email, raw IP, User-Agent, hashes, device hint, cookies, Authorization, or payment proof fields
- immutable snapshot proof test after mutating current `AffiliateLink` fields
- read-only financial safety proof

## Route

```text
GET /v1/channel-affiliate/order-attributions/aggregates
```

## Hard-Ban Check

Not implemented:

- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- customer/register attribution API
- first-click/last-click attribution engine
- attribution dispute/manual override workflow
- commission policy changes
- commission calculation redesign
- payout/payment gateway/webhook/reconciliation
- finance report redesign
- frontend/UI
- QR image rendering
- coupon/discount
- renewal ownership logic
- fraud/risk scoring
- broad channel hierarchy redesign

## Test Summary

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api run build` -> passed before focused tests and final. One immediate prior retry attempt after e2e hit a transient Windows `EPERM` removing `apps/api/dist/src/health`; rerun passed without code changes.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts` -> passed, 1 suite, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate` -> passed, 2 suites, 20 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` -> passed, 1 suite, 14 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 33 tests.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 23 suites, 152 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 5 suites, 12 tests.
- `git status --short` -> failed because workspace is not a git repository.

## Evidence Packet

Full evidence is under:

- `docs/minh-huong-sales-distribution/promt20/`

## Next Prompt Recommendation

Prompt 21 should add an optional export/read model layer for the existing attribution list and aggregate reports, still using immutable snapshots and still excluding commission policy changes, payment gateway work, frontend redesign, mobile/customer attribution, and override/dispute workflows.
