# Next Prompt Recommendation

Recommended file: `Promt_quanly_minhhuong_4.md`

Recommended type: `implementation-narrow-slice`

## Recommended Scope

Implement Slice 4A-min:

- `OrderStatusHistory`
- `IdempotencyRecord`
- idempotency support for:
  - approve activation order;
  - payout pay;
  - payout reject.
- tests that keep all Prompt 2 tests green.

## Why This Scope

- Prompt 2 already fixed duplicate side-effect race with conditional claims.
- Prompt 4A turns those guardrails into an explicit API replay contract and lifecycle audit trail.
- It is smaller and lower risk than adding entitlement enforcement or commission policy engine first.
- It avoids affiliate/QR while canonical BA docs are missing.

## Non-Scope For Prompt 4

- affiliate/QR.
- payment gateway/webhook/reconciliation.
- frontend rewrite.
- model rename.
- AgencyMember cleanup.
- Lead CRM.
- RenewalOpportunity.
- full commission policy engine.

## Acceptance For Prompt 4

- New migration is narrow and reversible.
- Existing Prompt 2 tests pass.
- New idempotency/history tests pass.
- No duplicate payment/subscription/commission/payout ledger side effects under same-key replay or stale concurrent requests.
