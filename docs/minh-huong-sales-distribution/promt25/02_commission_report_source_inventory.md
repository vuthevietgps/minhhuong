# Commission Report Source Inventory

## Source Tables

- `CommissionEarning` is the primary source.
- `CommissionEarning.attributionSnapshotJson` is the immutable affiliate proof source.
- `ActivationOrder` is joined only for safe id/status/date/amount/currency fields and `commissionChainSnapshotJson`.

Evidence:

- `apps/api/prisma/schema.prisma:1001`
- `apps/api/prisma/schema.prisma:1013`
- `apps/api/prisma/schema.prisma:1085`
- `apps/api/prisma/schema.prisma:1106`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:471`

## Not Used

- Does not recompute from current `AffiliateLink`.
- Does not recompute chain from current participant hierarchy.
- Does not read payment proof, wallet ledger, payout execution details, or raw click request data.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:502`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:515`
