# Scope And Baseline

## Baseline Read

Prompt 7 was based on:

- Prompt 6 result packet and accepted review;
- Prompt 5 blocker review, treating Prompt 5 as not completed;
- Prompt 4 idempotency/history baseline;
- Prompt 3 channel-scope integration test design;
- Prompt 2 commercial regression/test evidence.

Prompt 6 left DB-backed channel scope tests as the next highest commercial risk. Prompt 7 implements that narrow test-hardening slice.

## In Scope

- Activation order visibility by channel subtree.
- Channel finance report and overview visibility by channel subtree.
- Wallet and commission ledger visibility by channel subtree.
- Payout list visibility by channel subtree.
- CSV/export visibility by channel subtree.
- Admin/operations global behavior.
- Non-admin user with no channel participant safety.
- Result packet with DB strategy and test evidence.

## Out Of Scope

No affiliate/QR, payment gateway/webhook/reconciliation, package entitlement/snapshot, entitlement enforcement, commission policy version engine, frontend rewrite, Lead CRM, RenewalOpportunity, `AgencyMember` cleanup, broad model rename, or broad commercial architecture rewrite was implemented.

## Source Changes

No product service/controller/schema source was changed in Prompt 7.

Only a new DB-backed integration test was added:

- `apps/api/src/channel-finance/channel-scope.integration.spec.ts`

