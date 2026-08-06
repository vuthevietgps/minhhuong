# Scope And Baseline

## Accepted Baseline

Prompt 24 starts from Prompt 23:

- affiliate click attribution is snapshotted on `ActivationOrder`;
- commission affiliate proof is written to `CommissionEarning.attributionSnapshotJson`;
- report/export/audit flows are already covered by channel-affiliate suites.

## Implemented Scope

- Added `ActivationOrder.commissionChainSnapshotJson`.
- Built commission chain snapshot during affiliate-attributed order creation.
- Covered both self-service and sale-assisted affiliate order creation paths.
- Consumed frozen snapshot items during approval without walking current parent hierarchy.
- Added deterministic malformed snapshot failure before approval side effects.
- Added legacy fallback for old affiliate orders missing chain snapshot, marked with `commissionChainSnapshotStatus: legacy_missing`.

## Out Of Scope

- No broad commission redesign.
- No new commission tiers.
- No payout workflow changes.
- No payment gateway/webhook/reconciliation.
- No frontend/mobile/customer attribution.
