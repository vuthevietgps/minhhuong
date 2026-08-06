# Prompt 23 Chain Ledger

Date: 2026-06-15

## Baseline

- Continued from accepted Prompt 22.
- Prompt 22 result packet: `docs/minh-huong-sales-distribution/promt22/ketqua_promt_quanly_minhhuong_22.md`.
- Prompt 22 accepted conditionally because `git status --short` cannot run outside a git repository and DB suites emit the known non-failing `pg` warning.

## Prompt 23 Scope

- Implemented narrow approve-time commission attribution proof from immutable `ActivationOrder.affiliateAttributionSnapshotJson`.
- Preserved existing commission amount/rate policy.
- Added one nullable JSON proof field on `CommissionEarning`.
- Did not change payout, payment gateway, webhook, UI, reporting source, or export behavior.

## Files Changed

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260615090000_commission_attribution_snapshot/migration.sql`
- `apps/api/src/activation-orders/activation-orders.service.ts`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
- `docs/minh-huong-sales-distribution/promt23/*`
