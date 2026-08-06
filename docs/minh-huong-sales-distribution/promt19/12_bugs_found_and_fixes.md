# Bugs Found And Fixes

## Bug 1: No Read Path For Affiliate-Attributed Orders

Before Prompt 19, orders could store affiliate snapshots, but admin/ops/channel users had no dedicated affiliate attribution read endpoint.

Fix:

- added `GET /v1/channel-affiliate/order-attributions`
- added service method and query DTO

## Bug 2: Report Could Have Used Mutable Link State

A naive report could join `AffiliateLink` and show current campaign/placement instead of historical attribution.

Fix:

- report uses only `ActivationOrder.affiliateAttributionSnapshotJson` for attribution values
- immutable snapshot test mutates current link fields and proves report output remains unchanged

## Bug 3: Scope Filters Needed To Be Composed Safely

Participant/link filters could leak data if applied without channel scope.

Fix:

- scope is added first through `participantScopeWhere`
- all query filters are ANDed with scope
- out-of-scope participant filter returns empty data
