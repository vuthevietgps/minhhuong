# Commission Aggregate Source Inventory

Source of truth:

- `CommissionEarning`
- `CommissionEarning.attributionSnapshotJson`
- safe `ActivationOrder.commissionChainSnapshotJson` chain status only

Not used as source of truth:

- mutable current `AffiliateLink` fields;
- current participant hierarchy recomputation for commission chain;
- payout, payment, subscription, wallet ledger, or customer PII data.

Evidence:

- Service query selects only commission row fields and `commissionChainSnapshotJson`: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:657`
- Proof normalization uses `source: affiliate_order_snapshot`: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2204`
