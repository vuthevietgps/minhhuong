# Chain Ledger

Date: 2026-06-14  
Prompt: `Promt_quanly_minhhuong_20.md`  
Mode: implementation-narrow-slice / read-only affiliate attribution aggregate report

## Prior Chain State

- Prompt 16 implemented affiliate links and QR assets.
- Prompt 17 implemented public affiliate redirect and `AffiliateClickEvent`.
- Prompt 18 implemented immutable order attribution snapshots on `ActivationOrder`.
- Prompt 19 implemented the read-only order attribution list endpoint.

## Prompt 20 Objective

Add a narrow, read-only aggregate report over affiliate-attributed orders using only `ActivationOrder.affiliateAttributionSnapshotJson` as the attribution source of truth.

## Result

Implemented:

- `GET /v1/channel-affiliate/order-attributions/aggregates`
- single-dimension `groupBy` over participant, agency, agency member, affiliate link, QR asset, campaign, channel, placement, or package
- reused Prompt 19 filters and scope safety
- aggregate metrics by status, approved order count, first/last order date, and approved amount by currency
- immutable snapshot proof after current `AffiliateLink` mutation
- read-only financial safety proof

## Verdict

`CONDITIONAL`

Reason: implementation and tests passed, but `git status --short` cannot run because this workspace is not a git repository.
