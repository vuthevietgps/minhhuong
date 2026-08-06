# Remaining Gaps And Risks

## Deliberately Deferred

Prompt 19 did not implement:

- aggregate report grouped by participant/link/campaign/QR
- CSV/export
- frontend/UI
- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- customer/register attribution API
- first-click/last-click attribution engine
- attribution dispute/manual override workflow
- commission policy or calculation changes
- payout/payment gateway/webhook/reconciliation
- coupon/discount
- renewal ownership logic
- fraud/risk scoring

## Remaining Risks

- Scope uses current channel lineage for visibility. Historical snapshot values remain immutable, but current hierarchy changes can affect who can view rows.
- Summary currently reports approved amount cents only, not net revenue or commission.
- No dedicated aggregate endpoint exists for link/QR performance yet.
- No retention/archive policy for affiliate order reports exists yet.

## Open Business Decisions

- final report dimensions
- export format and permissions
- whether finance roles need a separate report role
- how to handle historical scope if participant lineage changes
- retention period for click/order attribution records
