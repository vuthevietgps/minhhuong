# Bugs Found And Fixes

## Bug 1: Affiliate Approval Used Mutable Parent Hierarchy

Before Prompt 24, approval still walked current `parentParticipantId` links. If hierarchy changed between order creation and approval, commission recipients/depth could change.

Fix:

- Added order-time `commissionChainSnapshotJson`.
- Approval consumes frozen snapshot items and avoids current parent walk for snapshot-backed affiliate orders.

## Bug 2: No Deterministic Guard For Bad Chain Proof

Before Prompt 24, there was no chain snapshot parser because no chain snapshot existed.

Fix:

- Added deterministic parser and malformed snapshot failure before approval side effects.

## Bug 3: Old Affiliate Orders May Lack Chain Snapshot

Existing affiliate orders created before Prompt 24 may have affiliate attribution snapshots but no chain snapshot.

Fix:

- Approval keeps a legacy fallback to current hierarchy for missing chain snapshots and marks commission attribution proof with `commissionChainSnapshotStatus: legacy_missing`.
