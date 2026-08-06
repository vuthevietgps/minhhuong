# Remaining Gaps And Risks

## Remaining Risks

- The FK prevents missing parent references, but it does not by itself prevent future cyclic parent chains.
- The recursive cycle audit is bounded to 50 levels. That is enough for the current channel hierarchy shape, but it is not a general graph invariant.
- Production or external legacy databases that differ from the audited local configured DB must run the same audit before deploying the validation migration.
- The DB-backed tests emit a non-failing `pg` package deprecation warning.

## Deferred Commercial Gaps

- Prompt 6 `sourceOrderId` uniqueness remains deferred pending legacy duplicate audit.
- OrderStatusHistory lifecycle expansion beyond approval remains deferred.
- Package entitlement/snapshot remains deferred.
- Commission policy version/snapshot remains deferred.
- Affiliate/QR remains blocked until canonical BA docs are synced.

## Hard-Ban Confirmation

Prompt 10 did not implement or modify:

- affiliate/QR;
- payment gateway/webhook/reconciliation;
- package entitlement/snapshot;
- entitlement enforcement;
- commission policy version engine;
- frontend rewrite;
- Lead CRM;
- RenewalOpportunity;
- `AgencyMember` cleanup;
- broad channel hierarchy redesign;
- broad model rename.
