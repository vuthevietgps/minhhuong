# Scope And Baseline

## Accepted Baseline

Prompt 23 starts after Prompt 22:

- Affiliate links and QR foundation exist.
- Public redirect and `AffiliateClickEvent` exist.
- `ActivationOrder.affiliateAttributionSnapshotJson` exists.
- Affiliate order attribution list, aggregate reports, CSV exports, and report/export access audit already exist.

## Implemented Scope

- Added approve-time commission attribution resolver in `ActivationOrdersService`.
- When an order has a valid affiliate attribution snapshot, commission creation uses the immutable order snapshot for the commission attribution proof.
- The resolver does not query current `AffiliateLink`.
- Malformed affiliate snapshots fail deterministically before approval side effects in the transaction body.
- Existing non-affiliate/channel commission behavior is preserved.

## Explicitly Out Of Scope

- No commission tier redesign.
- No payout execution or payout workflow changes.
- No payment gateway, webhook, or reconciliation changes.
- No frontend or mobile attribution work.
- No first-click/last-click engine.
- No coupon/discount or renewal ownership logic.
