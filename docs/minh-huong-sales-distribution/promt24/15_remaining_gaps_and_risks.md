# Remaining Gaps And Risks

## Conditional Items

- `git status --short` cannot run because this workspace is not a git repository.
- DB-backed suites still emit the known non-failing `pg` deprecation warning.

## Intentional Product Gaps

- No backfill was performed for old affiliate orders.
- Old affiliate orders missing `commissionChainSnapshotJson` fall back to the current hierarchy and are explicitly marked `legacy_missing`.
- Prompt 24 does not add affiliate commission reporting endpoints.
- Prompt 24 does not change payout execution, payment gateway, frontend, mobile attribution, coupon, fraud, or renewal policies.

## Risk

Legacy affiliate approvals without chain snapshot remain dependent on current hierarchy. This is documented and marked in commission attribution proof so later reporting can identify them.
