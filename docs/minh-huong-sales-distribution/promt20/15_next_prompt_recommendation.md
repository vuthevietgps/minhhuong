# Next Prompt Recommendation

Recommended Prompt 21:

Add an optional export/read model layer for affiliate attribution reports without changing attribution ownership or commission policy.

Suggested narrow scope:

- keep `ActivationOrder.affiliateAttributionSnapshotJson` as source of truth
- add CSV/export for the Prompt 19 list endpoint and Prompt 20 aggregate endpoint
- keep the same scope/RBAC filters
- keep privacy whitelist
- keep currency amounts split by currency
- add tests for export scope, privacy, and read-only safety

Still exclude:

- commission calculation changes
- payout/payment gateway work
- frontend redesign
- mobile/customer attribution
- first-click/last-click engine
- manual override/dispute workflow
