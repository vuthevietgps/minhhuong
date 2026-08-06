# Prompt 19 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: implementation-narrow-slice / read-only affiliate order attribution report  
Verdict: CONDITIONAL

## Conditional Reason

Implementation is complete and all required tests/build passed. The result is `CONDITIONAL` because:

- `git status --short` cannot run in this workspace: `fatal: not a git repository (or any of the parent directories): .git`
- DB-backed suites still emit the known non-failing `pg` deprecation warning from prior accepted baselines

## Scope Implemented

Implemented Prompt 19 only:

- read-only endpoint `GET /v1/channel-affiliate/order-attributions`
- query DTO `ListAffiliateOrderAttributionsQueryDto`
- service method `ChannelAffiliateService.listOrderAttributions`
- source of truth is `ActivationOrder.affiliateAttributionSnapshotJson`
- filters for participant, agency, agency member, affiliate link, QR asset, click id, campaign, channel, placement, package, order status, order created date, click date
- deterministic page/pageSize pagination
- summary with total orders, count by status, approved order count, and approved amount cents
- scope/RBAC using existing channel-affiliate view roles and lineage scope
- response field whitelist that excludes IP, User-Agent, hashes, device hint, headers, cookies, Authorization, and payment proof fields
- immutable snapshot proof test after mutating current `AffiliateLink` fields
- read-only financial safety proof

## Route

Runtime route:

```text
GET /v1/channel-affiliate/order-attributions
```

The app uses URI versioning with default version `1`, matching existing `channel-affiliate` routes.

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
- `npm --prefix apps/api run build` -> passed early and final.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts` -> passed, 1 suite, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate` -> passed, 2 suites, 17 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` -> passed, 1 suite, 11 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 33 tests.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 23 suites, 149 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 5 suites, 12 tests.
- `git status --short` -> failed because workspace is not a git repository.

## Evidence Packet

Full evidence is under:

- `docs/minh-huong-sales-distribution/promt19/`

## Next Prompt Recommendation

Prompt 20 should add a narrow affiliate attribution report aggregate/read endpoint by link/participant/campaign, still using immutable order snapshots as source of truth and still excluding commission policy changes, frontend, payment gateway, mobile/customer attribution, and override/dispute workflows.
