# Scope And Baseline

## Accepted Baseline

Prompt 20 continues from the accepted Prompt 19 state:

- Prompt 19 endpoint: `GET /v1/channel-affiliate/order-attributions`
- Prompt 19 service method: `ChannelAffiliateService.listOrderAttributions`
- source of truth: `ActivationOrder.affiliateAttributionSnapshotJson`
- scope helper: `participantScopeWhere`
- order report filter helper: `affiliateOrderAttributionWhere`

## Implemented Scope

Only the aggregate report slice was added:

- API controller route under `channel-affiliate`
- aggregate DTO extending the same attribution filter base as the list endpoint
- service method that reads activation orders and aggregates normalized snapshot fields
- integration tests for aggregate behavior, scope safety, privacy, invalid query handling, and read-only safety

## Explicit Non-Scope

Not implemented in Prompt 20:

- commission policy changes
- commission calculation
- payout/payment gateway/webhook/reconciliation
- frontend or mobile UI
- customer/register attribution
- mobile deferred attribution
- coupon/discount logic
- renewal ownership logic
- manual override/dispute workflow
