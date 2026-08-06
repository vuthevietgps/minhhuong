# Scope And Baseline

## Prompt 10 Scope

Prompt 10 was limited to data-quality and deploy safety for:

- `ChannelParticipant.parentParticipantId`
- `ChannelParticipant_parentParticipantId_fkey`

The requested checks were:

- missing parent references;
- self-parent rows;
- practical cycle detection;
- `pg_constraint` status;
- safe validation or honest remediation plan;
- DB-backed `migrate deploy` proof;
- preservation of Prompt 2/4/6/8/9 behavior.

## Baseline From Prior Prompts

- Prompt 8 introduced the parent self-FK as `NOT VALID`.
- Prompt 8 converted channel-scope DB-backed tests to `migrate deploy`.
- Prompt 9 added channel-admin DB-backed scope coverage.
- Prompt 9 left the parent FK validation as the remaining deploy-safety item.

## Hard Scope Exclusions

Prompt 10 did not implement:

- affiliate/QR;
- payment gateway, webhook, or reconciliation;
- package entitlement/snapshot;
- entitlement enforcement;
- commission policy version engine;
- frontend rewrite;
- Lead CRM;
- RenewalOpportunity;
- `AgencyMember` cleanup;
- broad channel hierarchy redesign;
- broad model rename;
- unrelated order/subscription/commission behavior changes.
