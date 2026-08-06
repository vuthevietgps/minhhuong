# Bugs Found And Fixes

## Bugs Found During Prompt 4

No new product bug outside the intended Prompt 4 scope was found.

## Implemented Risk Reduction

- Added explicit replay/conflict contract on top of Prompt 2 conditional claims.
- Added approval lifecycle history row in the same transaction as approval side effects.

## Existing Prompt 2 Fixes Preserved

- Activation approval stale retry still fails before duplicate payment/subscription/commission.
- Payout pay/reject stale retry still fails before duplicate ledger writes.
- Commission release idempotency remains covered.
