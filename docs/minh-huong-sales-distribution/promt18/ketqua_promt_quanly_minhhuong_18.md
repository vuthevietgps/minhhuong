# Prompt 18 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: implementation-narrow-slice / activation order attribution snapshot  
Verdict: CONDITIONAL

## Conditional Reason

Implementation is complete and all required tests/build passed. The result is `CONDITIONAL` because:

- `git status --short` cannot run in this workspace: `fatal: not a git repository (or any of the parent directories): .git`
- production should explicitly set `AFFILIATE_ATTRIBUTION_WINDOW_DAYS`; local/default fallback is 30 days
- DB-backed suites still emit the known non-failing `pg` deprecation warning from prior accepted baselines

## Scope Implemented

Implemented Prompt 18 only:

- optional public order input `affiliateClickId`
- nullable immutable `ActivationOrder.affiliateAttributionSnapshotJson`
- migration `20260614223000_activation_order_affiliate_attribution_snapshot`
- click resolution by public `AffiliateClickEvent.clickId`
- attribution window config with 30-day fallback
- explicit-click snapshot with link, QR, participant, agency/member, campaign/channel/placement/package fields
- conflict-safe sale-assisted behavior
- tests proving missing/malformed/not-found/expired/inactive/conflicting click behavior
- financial safety tests proving order creation does not create payment, subscription, wallet ledger, commission, or payout side effects

## Deterministic Input Behavior

- Missing `affiliateClickId`: keep existing order create behavior and do not query `AffiliateClickEvent`.
- Malformed `affiliateClickId`: reject with `BadRequestException`.
- Not-found `affiliateClickId`: reject with `BadRequestException`.
- Expired click: reject with `BadRequestException`.
- Inactive link/participant/agency/member state: reject with `BadRequestException`.
- Sale-assisted participant conflict: reject with `BadRequestException` and do not override the selected participant.

## Hard-Ban Check

Not implemented:

- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- customer/register attribution API
- first-click/last-click engine
- dispute/manual override workflow
- commission policy changes
- finance report changes
- payout/payment gateway/webhook/reconciliation
- frontend/UI
- QR image rendering
- coupon/discount
- renewal ownership logic
- broad channel hierarchy changes

## Test Summary

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api run build` -> passed early and final.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts` -> passed, 1 suite, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` -> passed, 1 suite, 8 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate` -> passed, 2 suites, 14 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 33 tests.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 23 suites, 146 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 5 suites, 12 tests.
- `git status --short` -> failed because workspace is not a git repository.

## Evidence Packet

Full evidence is under:

- `docs/minh-huong-sales-distribution/promt18/`

## Next Prompt Recommendation

Prompt 19 should add read/report evidence for affiliate order attribution funnel metrics, or an approve-time commission-read proof that consumes the immutable order snapshot without changing commission policy. It should still exclude mobile install/customer attribution, frontend, payment gateway, and manual override unless explicitly scoped.
