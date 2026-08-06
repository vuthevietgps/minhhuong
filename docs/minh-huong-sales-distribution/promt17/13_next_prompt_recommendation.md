# Next Prompt Recommendation

## Recommended Prompt 18

Implement activation order attribution snapshot wiring from affiliate click signal to order creation.

## Include

- order create input accepts safe click token/reference
- resolve active `AffiliateClickEvent` by `clickId`
- snapshot selected affiliate attribution onto `ActivationOrder`
- preserve existing channel participant fields where compatible
- no commission calculation changes yet, except proving existing approval flow remains unchanged
- scope-safe tests for self-service and sale-assisted order creation
- financial safety tests proving snapshot creation does not create commission before approval

## Exclude

- mobile first-open/deferred attribution
- `CustomerAttribution`
- install attribution
- commission policy changes
- finance report changes
- frontend/UI
- payout/payment changes

## Acceptance Focus

- order snapshot is immutable and contains no raw IP/User-Agent
- click event remains a signal until an order is created
- order pending state does not create commission
- approved order regression remains unchanged
- existing Prompt 16/17 link, QR, redirect, and click tests still pass
