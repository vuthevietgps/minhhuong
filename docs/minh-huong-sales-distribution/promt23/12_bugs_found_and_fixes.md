# Bugs Found And Fixes

## Bug 1: No Commission-Level Immutable Affiliate Proof

Before Prompt 23, affiliate order snapshots existed on `ActivationOrder`, but approve-time `CommissionEarning` rows did not persist sanitized affiliate attribution proof.

Fix:

- Added nullable `CommissionEarning.attributionSnapshotJson`.
- Added resolver to copy allowed fields from immutable `ActivationOrder.affiliateAttributionSnapshotJson`.

## Bug 2: Malformed Affiliate Snapshot Had No Approval-Time Guard

Before Prompt 23, approve-time commission creation did not parse affiliate snapshots, so malformed snapshot data would not fail clearly during commission attribution.

Fix:

- Malformed affiliate snapshots now throw `BadRequestException` before the approval transaction body creates order/payment/subscription/commission side effects.
- Added unit test.

## Bug 3: Tests Did Not Prove Mutable Link Independence At Commission Creation

Before Prompt 23, tests proved order creation snapshotting but did not prove commission proof ignores current mutable link state.

Fix:

- Added test that mocks a mutated current link and asserts approval does not query it and commission proof uses snapshot fields.
