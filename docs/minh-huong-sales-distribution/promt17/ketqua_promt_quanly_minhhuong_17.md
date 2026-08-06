# Prompt 17 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: implementation-narrow-slice / affiliate redirect click foundation  
Verdict: CONDITIONAL

## Conditional Reason

Implementation is complete and all required tests/build passed. The result is `CONDITIONAL` because:

- `git status --short` still cannot run in this workspace: `fatal: not a git repository (or any of the parent directories): .git`
- public redirect and hashing configs have documented safe fallbacks, but production should set `AFFILIATE_REDIRECT_BASE_URL` and `AFFILIATE_HASH_SECRET`
- DB-backed suites still emit the known non-failing `pg` deprecation warning from prior accepted baselines

## Scope Implemented

Implemented Prompt 17 only:

- Prisma model `AffiliateClickEvent`
- migration `20260614213000_affiliate_click_event_redirect`
- public unauthenticated route `GET /r/:linkCode`
- click/scan event creation for active links
- QR scan attachment when `qr={AffiliateQrAsset.id}` belongs to the link and QR is active
- inactive/missing deterministic fallback redirects with no event creation
- privacy-safe `ipHash` and `userAgentHash`
- explicit dedupe key hashing through query/header
- financial safety tests proving no order/subscription/payment/commission/ledger/payout side effects

## Hard-Ban Check

Not implemented:

- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- activation order attribution snapshot
- order create/approve attribution changes
- commission changes
- finance report changes
- payment gateway/webhook/reconciliation
- frontend/UI
- QR image rendering
- coupon/discount
- renewal ownership
- manual attribution override

## Route Behavior

`GET /r/:linkCode` is version-neutral and public.

Active link:

- validates link status and date window
- validates QR asset if supplied
- creates `AffiliateClickEvent`
- redirects to `AFFILIATE_REDIRECT_BASE_URL` or safe fallback

Inactive/missing link:

- redirects deterministically to fallback
- does not create attribution event
- does not leak participant/link internal IDs

Invalid QR:

- creates a normal link click event
- does not attach the wrong QR asset

## Test Summary

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api test -- --runInBand channel-affiliate` -> passed, 2 suites, 13 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` -> passed, 1 suite, 7 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 29 tests.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 23 suites, 141 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 4 suites, 10 tests.
- `npm --prefix apps/api run build` -> passed.
- `git status --short` -> failed because workspace is not a git repository.

## Evidence Packet

Full evidence is under:

- `docs/minh-huong-sales-distribution/promt17/`

## Next Prompt Recommendation

Prompt 18 should implement order attribution snapshot wiring from click signal to activation order creation, without mobile install/customer attribution and without changing commission calculation except reading existing approved-order flow after snapshot is present.
