# Scope And Baseline

## Scope Implemented

Allowed and implemented:

- read-only affiliate order attribution endpoint
- filters on immutable order snapshot fields
- page/pageSize pagination
- summary counts and approved amount cents
- channel lineage scope
- admin/operations global scope
- privacy-safe response whitelist
- read-only side-effect tests

## Baseline Preserved

Prompt 16/17/18 tests still pass:

- `activation-orders.service.spec.ts`: 1 suite, 21 tests
- `channel-affiliate`: 2 suites, 17 tests
- `channel-affiliate-migration.integration.spec.ts`: 1 suite, 11 tests

Commercial regression baseline still passes:

- activation-orders + channel-finance: 2 suites, 33 tests
- package-entitlement: 3 suites, 12 tests
- entitlement + learning: 2 suites, 21 tests
- channel participant FK: 1 suite, 1 test
- channel scope/admin scope: 2 suites, 7 tests
- full API suite: 23 suites, 149 tests
- e2e: 5 suites, 12 tests
- build: passed

## Hard Scope Boundary

Prompt 19 did not implement commission policy, frontend, mobile/customer attribution, payment gateway, override/dispute workflows, QR rendering, coupon, renewal ownership, or broad channel hierarchy changes.
