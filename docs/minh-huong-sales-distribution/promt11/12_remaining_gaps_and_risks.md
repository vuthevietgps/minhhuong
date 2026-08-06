# Remaining Gaps And Risks

## Remaining Gaps

- No frontend UI was added for package entitlements.
- Entitlement enforcement is intentionally not implemented in Prompt 11.
- Legacy subscriptions that cannot be directly linked by `sourceOrderId` or `providerRef = ActivationOrder.id` remain with null snapshot.
- Prompt 6 `sourceOrderId` uniqueness remains deferred pending duplicate audit.
- OrderStatusHistory lifecycle expansion beyond approval remains deferred.
- Commission policy version/snapshot remains deferred.
- Affiliate/QR remains blocked until canonical BA docs are synced.

## Risks

- Package entitlement values are flexible JSON; future enforcement prompts must validate key-specific shapes before blocking access.
- Historical snapshots backfilled by migration intentionally have empty entitlements because current package entitlement rows may not match past sale terms.
- DB-backed tests still emit a non-failing `pg` deprecation warning.

## Hard-Ban Confirmation

Prompt 11 did not implement:

- affiliate/QR;
- payment gateway/webhook/reconciliation;
- learning entitlement enforcement;
- commission policy engine;
- frontend rewrite;
- Lead CRM;
- RenewalOpportunity;
- `AgencyMember` cleanup;
- broad channel hierarchy redesign;
- broad model rename;
- broad order/subscription/commission rewrite.
