# Prompt 23 Result - Minh Huong Commercial Distribution

Date: 2026-06-15

Mode: implementation-narrow-slice / commission attribution proof and minimal approve-time wiring

Verdict: CONDITIONAL

## Conditional Reason

- Implementation is complete and all required build/test commands passed.
- `git status --short` cannot run because this workspace is not a git repository.
- DB-backed suites still emit the known non-failing `pg` deprecation warning.

## Implemented

- Added nullable `CommissionEarning.attributionSnapshotJson`.
- Added narrow migration with no backfill.
- Added approve-time resolver from immutable `ActivationOrder.affiliateAttributionSnapshotJson`.
- For valid affiliate snapshots, commission proof stores sanitized snapshot fields and ignores current mutable affiliate link metadata.
- Malformed affiliate snapshots fail deterministically.
- Non-affiliate/channel commission behavior remains unchanged.
- Existing rate/amount/currency policy remains unchanged.

## Key Evidence

- Resolver: `apps/api/src/activation-orders/activation-orders.service.ts:1968`
- Approval wiring: `apps/api/src/activation-orders/activation-orders.service.ts:1013`
- Commission write: `apps/api/src/activation-orders/activation-orders.service.ts:2196`
- Schema: `apps/api/prisma/schema.prisma:1013`
- Immutable snapshot test: `apps/api/src/activation-orders/activation-orders.service.spec.ts:661`
- Malformed snapshot test: `apps/api/src/activation-orders/activation-orders.service.spec.ts:750`
- Idempotency test: `apps/api/src/activation-orders/activation-orders.service.spec.ts:973`

## Test Summary

- Required Prisma generate, build, focused tests, full Jest, and e2e passed.
- Full Jest result: 23 suites, 159 tests passed.
- E2E result: 5 suites, 12 tests passed.

## Packet

Full evidence packet is under:

- `docs/minh-huong-sales-distribution/promt23/`
