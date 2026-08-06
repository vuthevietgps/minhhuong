# Scope And Baseline

## Baseline Read

Prompt 9 followed:

- Prompt 8 result packet and external review;
- Prompt 7 DB-backed fixture evidence;
- accepted Prompt 6, Prompt 4, and Prompt 2 regression baselines.

Prompt 8 review explicitly requested DB-backed channel-admin scope tests using `migrate deploy`.

## In Scope

- DB-backed channel-admin agency list scope tests.
- DB-backed channel-admin user list scope tests.
- Participant visibility evidence via summary counts and participant payloads.
- Sibling/non-descendant action rejection.
- Positive in-scope action controls.
- Admin/operations global behavior.
- Unscoped non-admin safe behavior.
- Result packet.

## Out Of Scope

No affiliate/QR, payment gateway/webhook/reconciliation, package entitlement/snapshot, entitlement enforcement, commission policy version engine, frontend rewrite, Lead CRM, RenewalOpportunity, `AgencyMember` cleanup, broad model rename, or broad commercial architecture rewrite was implemented.

## Source Change Summary

Only a new integration test and result packet were added. No product service/controller source was changed.

