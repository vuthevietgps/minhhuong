# Next Prompt Recommendation

## Recommended Prompt 19

Add read/report evidence for affiliate order attribution or approve-time snapshot consumption proof.

## Include

- list/filter orders by affiliate snapshot fields for admin/ops scope, or a narrow report endpoint
- verify approved-order revenue/commission reports can trace to immutable order snapshot
- keep output read-only unless a specific write slice is requested
- preserve existing commission policy and approval flow
- add tests for scope-safe report visibility

## Exclude

- mobile install attribution
- `CustomerAttribution`
- first-click/last-click engine
- manual override/dispute workflow
- frontend/UI
- payment gateway/webhook/reconciliation
- coupon/discount
- renewal ownership logic
- commission calculation redesign

## Acceptance Focus

- reports/read models use the order snapshot, not mutable link state
- scope rules prevent leaking out-of-subtree affiliate order data
- approved revenue remains order-based
- click/install/register events still do not create revenue or commission
