# Prompt 24 Chain Ledger

Date: 2026-06-15

## Baseline

- Continued from accepted Prompt 23.
- Prompt 23 added `CommissionEarning.attributionSnapshotJson` and approve-time affiliate attribution proof from immutable `ActivationOrder.affiliateAttributionSnapshotJson`.
- Prompt 23 accepted limitation: approval still walked current participant/upline hierarchy.

## Prompt 24 Scope

- Added immutable order-time commission chain snapshot for affiliate-attributed orders.
- Approval consumes the frozen chain snapshot when present.
- Existing non-affiliate commission behavior remains unchanged.
- Existing rate, amount, currency, availability, payout, ledger, and report/export/audit behavior remains unchanged.

## Files Changed

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260615100000_activation_order_commission_chain_snapshot/migration.sql`
- `apps/api/src/activation-orders/activation-orders.service.ts`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
- `docs/minh-huong-sales-distribution/promt24/*`
