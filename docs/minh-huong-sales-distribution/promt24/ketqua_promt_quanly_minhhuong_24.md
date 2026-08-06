# Prompt 24 Result - Minh Huong Commercial Distribution

Date: 2026-06-15

Mode: implementation-narrow-slice / order-time commission chain snapshot

Verdict: CONDITIONAL

## Conditional Reason

- Implementation is complete and all required build/test commands passed.
- `git status --short` cannot run because this workspace is not a git repository.
- DB-backed suites still emit the known non-failing `pg` deprecation warning.

## Implemented

- Added nullable `ActivationOrder.commissionChainSnapshotJson`.
- Added narrow no-backfill migration.
- Built immutable commission chain snapshot during affiliate self-service and sale-assisted order creation.
- Approval consumes frozen chain snapshot items and does not walk current parent hierarchy for snapshot-backed affiliate orders.
- Malformed chain snapshot fails deterministically before approval side effects.
- Missing chain snapshot on old affiliate orders falls back to current hierarchy with explicit `commissionChainSnapshotStatus: legacy_missing`.
- Preserved Prompt 23 `CommissionEarning.attributionSnapshotJson`.
- Preserved existing rate, amount, currency, availability, ledger, payout, and non-affiliate behavior.

## Key Evidence

- Schema: `apps/api/prisma/schema.prisma:1106`
- Self-service snapshot creation: `apps/api/src/activation-orders/activation-orders.service.ts:744`
- Sale-assisted snapshot creation: `apps/api/src/activation-orders/activation-orders.service.ts:443`
- Approval resolution: `apps/api/src/activation-orders/activation-orders.service.ts:1075`
- Snapshot consumption: `apps/api/src/activation-orders/activation-orders.service.ts:2322`
- End-to-end mutable hierarchy test: `apps/api/src/activation-orders/activation-orders.service.spec.ts:1067`
- Malformed chain test: `apps/api/src/activation-orders/activation-orders.service.spec.ts:925`

## Test Summary

- Full Jest: 23 suites, 163 tests passed.
- E2E: 5 suites, 12 tests passed.
- Required build and focused regressions passed.

## Packet

Full evidence packet:

- `docs/minh-huong-sales-distribution/promt24/`
