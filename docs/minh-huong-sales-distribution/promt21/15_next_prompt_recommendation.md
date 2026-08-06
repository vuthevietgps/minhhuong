# Next Prompt Recommendation

Recommended Prompt 22:

Add a narrow operational audit/read endpoint for affiliate report access and export usage, without changing attribution, commission, payment, or payout behavior.

Suggested scope:

- audit when list/aggregate export endpoints are called
- record actor id, route, safe filter summary, row count, and timestamp
- keep no PII or raw sensitive query values beyond existing safe report filter fields
- keep report source as `ActivationOrder.affiliateAttributionSnapshotJson`
- add tests for scope, privacy, and read-only financial safety

Still exclude:

- commission policy or calculation changes
- payment gateway/webhook/reconciliation
- frontend/UI
- mobile/customer attribution
- first-click/last-click engine
- override/dispute workflow
- coupon/renewal ownership
