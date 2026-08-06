# Bugs Found And Fixes

## Bug 1: Order Create Had No Safe Affiliate Click Input

Before Prompt 18, `ActivationOrder` creation could not accept the public `AffiliateClickEvent.clickId`.

Fix:

- added optional `affiliateClickId` to both sale-assisted and self-service DTOs
- kept it optional for backward compatibility
- validated public token shape

## Bug 2: Click Events Were Not Snapshotted Onto Orders

Before Prompt 18, Prompt 17 click events were stored but not connected to orders.

Fix:

- added `affiliateAttributionSnapshotJson`
- resolved valid `AffiliateClickEvent` by public `clickId`
- stored immutable explicit-click snapshot on order creation

## Bug 3: Sale-Assisted Click Could Have Ambiguous Ownership

Prompt 18 needed a conflict-safe rule.

Fix:

- compatible click from same participant is allowed
- no-participant order can adopt click participant
- conflicting participant is rejected deterministically
