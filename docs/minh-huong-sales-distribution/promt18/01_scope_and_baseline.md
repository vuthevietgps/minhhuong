# Scope And Baseline

## Scope Implemented

Allowed and implemented:

- optional `affiliateClickId` order create input
- `ActivationOrder.affiliateAttributionSnapshotJson`
- click resolution by `AffiliateClickEvent.clickId`
- 30-day attribution window fallback via `AFFILIATE_ATTRIBUTION_WINDOW_DAYS`
- self-service click snapshot
- sale-assisted compatible click snapshot
- sale-assisted conflict rejection
- financial safety assertions for order creation

## Baseline Preserved

Prompt 16/17 affiliate tests still pass:

- `channel-affiliate`: 2 suites, 14 tests
- `channel-affiliate-migration.integration.spec.ts`: 1 suite, 8 tests

Commercial regression baseline still passes:

- activation-orders + channel-finance: 2 suites, 33 tests
- package-entitlement: 3 suites, 12 tests
- entitlement + learning: 2 suites, 21 tests
- channel participant FK: 1 suite, 1 test
- channel scope/admin scope: 2 suites, 7 tests
- full API suite: 23 suites, 146 tests
- e2e: 5 suites, 12 tests
- build: passed

## Hard Scope Boundary

Prompt 18 did not implement mobile install attribution, customer attribution, frontend, payment gateway, commission policy changes, finance reports, QR rendering, coupon, renewal ownership, or manual override.
