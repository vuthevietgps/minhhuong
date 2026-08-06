# Prompt 25 Chain Ledger

Date: 2026-06-15

## Baseline

- Continued from accepted Prompt 24.
- Prompt 23 added `CommissionEarning.attributionSnapshotJson`.
- Prompt 24 added `ActivationOrder.commissionChainSnapshotJson` and approval consumption of frozen chain snapshot.

## Prompt 25 Scope

- Added read-only affiliate commission list endpoint.
- Source of truth is `CommissionEarning.attributionSnapshotJson`.
- Uses related `ActivationOrder` only for safe order id/status/date/amount/currency and chain snapshot status.
- Audits this report access using the existing Prompt 22 safe audit convention.
- Does not add aggregate endpoint, CSV export, payout execution, payment gateway, or commission policy changes.

## Files Changed

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts`
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`
- `docs/minh-huong-sales-distribution/promt25/*`
