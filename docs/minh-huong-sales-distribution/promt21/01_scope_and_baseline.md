# Scope And Baseline

## Accepted Baseline

Prompt 20 is accepted as baseline:

- list report: `GET /v1/channel-affiliate/order-attributions`
- aggregate report: `GET /v1/channel-affiliate/order-attributions/aggregates`
- source of truth: `ActivationOrder.affiliateAttributionSnapshotJson`
- scope helper: `participantScopeWhere`
- report filter helper: `affiliateOrderAttributionWhere`

## Implemented Scope

Prompt 21 adds only sync CSV exports:

- list attribution CSV export
- aggregate attribution CSV export
- safe CSV serialization helper
- list export limit guard
- integration tests for snapshot source, scope, privacy, read-only safety, currency safety, escaping, and invalid queries

## Explicit Non-Scope

Not implemented:

- schema migration
- async export jobs or storage
- commission policy changes
- payout/payment gateway/webhook work
- frontend/UI
- mobile/customer attribution
- first-click/last-click engine
- manual override/dispute workflow
- coupon/discount
- renewal ownership
