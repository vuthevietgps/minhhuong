# Next Prompt Recommendation

Recommended Prompt 23:

Start a narrow commission proof/policy wiring slice from immutable order attribution snapshots.

Suggested strict scope:

- use `ActivationOrder.affiliateAttributionSnapshotJson` as the commission attribution source
- no payment gateway/webhook changes
- no payout execution
- no frontend/mobile/customer attribution
- add tests proving commission attribution does not use mutable current affiliate link state
- keep audit/privacy/scope safety from Prompts 19-22

Still exclude:

- broad commission redesign
- payout processing
- payment gateway/reconciliation
- first-click/last-click engine
- manual override/dispute workflow
- frontend/UI
- mobile/customer attribution
