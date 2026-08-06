# Scope And Baseline

## In Scope

- Keep `ActivationPackage` as MVP commercial package name.
- Add package entitlement definitions.
- Add immutable entitlement snapshots to orders and subscriptions.
- Capture snapshots for new self-service and sale-assisted orders.
- Copy snapshots into subscriptions on approval.
- Reconstruct deterministic fallback snapshots for legacy pending orders.
- Keep learning access behavior compatible.
- Preserve Prompt 2/4/6/8/9/10 behavior.

## Out Of Scope

- affiliate/QR;
- payment gateway/webhook/reconciliation;
- learning entitlement enforcement;
- commission policy version engine;
- frontend rewrite;
- Lead CRM;
- RenewalOpportunity;
- `AgencyMember` cleanup;
- broad channel hierarchy redesign;
- broad order/subscription/commission rewrite.

## Files Read

All Prompt11 required baselines were read. No required baseline file was missing.
