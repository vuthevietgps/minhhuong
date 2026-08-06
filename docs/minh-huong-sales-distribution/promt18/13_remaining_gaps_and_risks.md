# Remaining Gaps And Risks

## Deliberately Deferred

Prompt 18 did not implement:

- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- customer/register attribution API
- first-click/last-click engine
- attribution dispute/manual override workflow
- commission policy or calculation changes
- finance report changes
- payout/payment gateway/webhook/reconciliation
- frontend/UI
- QR image rendering
- coupon/discount
- renewal ownership logic

## Remaining Risks

- Production should configure `AFFILIATE_ATTRIBUTION_WINDOW_DAYS`; default is 30 days.
- Sale-assisted participant conflicts currently reject; there is no dispute workflow yet.
- If an affiliate link/participant is made inactive after click but before order, Prompt 18 rejects the click rather than snapshotting stale ownership.
- No affiliate funnel read/report endpoint exists yet.
- Commission approval still uses existing channel participant fields; Prompt 18 does not redesign commission policy.

## Open Business Decisions

- final attribution window
- whether stale-but-originally-valid clicks should still be accepted after link pause/revocation
- first-click vs last-click rule
- manual override/dispute process
- renewal ownership policy
- affiliate reporting dimensions and retention
