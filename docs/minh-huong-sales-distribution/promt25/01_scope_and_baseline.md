# Scope And Baseline

## Accepted Baseline

Prompt 25 starts after Prompt 24:

- affiliate source proof is immutable on `CommissionEarning.attributionSnapshotJson`;
- affiliate commission chain can be frozen on `ActivationOrder.commissionChainSnapshotJson`;
- legacy affiliate commissions can be marked `commissionChainSnapshotStatus: legacy_missing`;
- affiliate order report/export/audit suites already exist.

## Implemented Scope

- Added `GET /v1/channel-affiliate/commissions`.
- Added query DTO for filters, sorting, and pagination.
- Added safe serialization for `affiliateProof` and `chainProof`.
- Added report access audit type `AFFILIATE_COMMISSION_LIST`.
- Added integration tests for filters, sorting, pagination, scope, privacy, read-only counters, legacy status, and audit safety.

## Explicit Non-Scope

- No aggregate endpoint.
- No CSV export for commissions.
- No payout execution.
- No payout request workflow.
- No payment gateway/webhook/reconciliation.
- No frontend/UI.
- No backfill.
