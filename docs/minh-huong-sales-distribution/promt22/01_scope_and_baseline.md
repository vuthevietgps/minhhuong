# Scope And Baseline

## Accepted Baseline

Prompt 22 continues from accepted Prompt 21:

- `GET /v1/channel-affiliate/order-attributions`
- `GET /v1/channel-affiliate/order-attributions/aggregates`
- `GET /v1/channel-affiliate/order-attributions/export.csv`
- `GET /v1/channel-affiliate/order-attributions/aggregates/export.csv`
- source of truth: `ActivationOrder.affiliateAttributionSnapshotJson`

## Implemented Scope

Only operational access audit was added:

- audit row creation on successful report/export access
- safe metadata on the existing `AuditLog` table
- admin/operations audit read endpoint
- tests for audit rows, privacy, RBAC, invalid query, and financial safety

## Explicit Non-Scope

Not implemented:

- commission policy changes
- commission calculation redesign
- payout/payment gateway/webhook/reconciliation
- frontend/UI
- mobile/customer attribution
- first-click/last-click attribution engine
- ownership changes
- manual override/dispute workflow
- async export job/object storage
- materialized report/read-model table unrelated to audit
