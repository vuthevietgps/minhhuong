# Bugs Found And Fixes

## Revoke Was Not Claiming Status Before Update

Before Prompt 12, `revokeOrder` validated the loaded order status before entering the transaction and then used `activationOrder.update`. Prompt 12 changed this to an in-transaction `updateMany` claim on `{ id, status: 'APPROVED' }`.

Fix:

- If the claim returns `count = 0`, throw before side effects/history.
- If the claim succeeds, cancel related commission/subscription records and write `REVOKE` history in the same transaction.

## Missing History Coverage In Existing Flows

Create, proof upload, resubmit, reject, cancel, and revoke flows previously had no activation order history rows. Prompt 12 adds rows for each required action.

## Test Fixture Gaps

The payment proof test fixture needed `userId` because `UPLOAD_PAYMENT_PROOF` records the order user as actor. The transaction mock also needed a default `subscription.updateMany` result so revoke metadata can record canceled subscription count.

