# Next Prompt Recommendation

## Recommended Prompt 20

Add narrow affiliate attribution aggregate reports by immutable order snapshot fields.

## Include

- aggregate by participant, affiliate link, QR asset, campaign, channel, placement, and package
- count attributed orders
- count approved orders
- sum approved amount cents
- scope-safe visibility using the same lineage rules
- tests proving aggregates use order snapshots, not mutable link state

## Exclude

- commission policy changes
- commission calculation redesign
- payout/payment gateway/webhook/reconciliation
- frontend/UI
- mobile install attribution
- `CustomerAttribution`
- first-click/last-click engine
- manual override/dispute workflow
- coupon/discount
- renewal ownership logic

## Acceptance Focus

- aggregate reads only from `ActivationOrder.affiliateAttributionSnapshotJson`
- read-only safety remains proven
- scope cannot be bypassed by aggregate filters
- approved revenue remains order-based, not click-based
