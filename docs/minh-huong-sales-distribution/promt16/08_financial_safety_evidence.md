# Financial Safety Evidence

## Product Code Boundary

Prompt 16 did not modify:

- `apps/api/src/activation-orders`
- `apps/api/src/channel-finance`
- `apps/api/src/entitlement`
- `apps/api/src/package-entitlement`
- `apps/web`

New runtime code is under:

- `apps/api/src/channel-affiliate`

## Service Write Boundary

`ChannelAffiliateService` writes only:

- `AffiliateLink`
- `AffiliateQrAsset`
- `AuditLog`

It does not write:

- `ActivationOrder`
- `Subscription`
- `CommissionEarning`
- `CommissionLedgerEntry`
- `PayoutRequest`
- `Payment`

## Test Evidence

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- financial count helper checks activation orders, subscriptions, commission earnings, commission ledger entries, and payments: lines 696-716
- link creation preserves financial counts: lines 154-195
- QR creation preserves financial counts: lines 267-300

## Regression Evidence

Existing commercial regressions all passed:

- activation-orders + channel-finance: 2 suites, 29 tests
- package-entitlement: 3 suites, 12 tests
- entitlement + learning: 2 suites, 21 tests
- full API suite: 22 suites, 135 tests
- e2e: 4 suites, 10 tests

## Hard-Ban Scan

The new module does not define public redirect, click/install/customer attribution, order attribution snapshot, or commission/report changes.
