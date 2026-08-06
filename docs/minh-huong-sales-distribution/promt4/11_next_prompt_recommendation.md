# Next Prompt Recommendation

Recommended file: `Promt_quanly_minhhuong_5.md`

Recommended type: `implementation-narrow-slice`

## Option A - Subscription Traceability

Scope:

- add `Subscription.sourceOrderId`;
- add `Subscription.activationPackageId`;
- keep `providerRef`;
- backfill where `providerRef` matches `ActivationOrder.id`;
- tests for approval, renewal stacking, legacy providerRef, and learning access.

Reason:

- Prompt 4 now gives approval a safer lifecycle/replay foundation.
- The next commercial trace gap is explicit link from learning access to order/package.

## Option B - DB-Backed Channel Scope Tests

Scope:

- seed sibling channel subtrees;
- assert order/report/wallet/payout/CSV scope.

Reason:

- Prompt 2 scope tests are service-level only.
- DB-backed tests would reduce data leak risk before affiliate/channel expansion.

## Still Not Recommended

- affiliate/QR until BA canonical files are synced.
- payment gateway/webhook/reconciliation.
- frontend rewrite.
- Lead CRM/RenewalOpportunity.
