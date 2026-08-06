# Scope And Baseline

## Scope Implemented

Prompt 17 implemented public redirect and click/scan event foundation only.

Allowed and implemented:

- `AffiliateClickEvent`
- `GET /r/:linkCode`
- active link click event creation
- QR scan event attachment for valid QR assets
- privacy-safe hashing of IP/User-Agent
- explicit dedupe key handling
- inactive/missing link deterministic redirect
- financial safety tests

## Baseline Preserved

Prompt 16 link/QR APIs still pass:

- `channel-affiliate`: 2 suites, 13 tests
- `channel-affiliate-migration.integration.spec.ts`: 1 suite, 7 tests

Commercial regression baseline still passes:

- activation-orders + channel-finance
- package-entitlement
- entitlement + learning
- channel participant FK
- channel scope and channel-admin scope
- full API suite
- e2e
- build

## Hard Scope Boundary

Prompt 17 did not implement install attribution, customer attribution, activation order snapshots, commission/report changes, frontend, QR image rendering, or payment changes.
