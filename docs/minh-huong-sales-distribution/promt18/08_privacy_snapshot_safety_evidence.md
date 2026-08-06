# Privacy Snapshot Safety Evidence

## Snapshot Exclusions

The order snapshot intentionally does not include:

- raw IP
- raw User-Agent
- `ipHash`
- `userAgentHash`
- cookie
- Authorization
- raw request headers
- payment proof data

## Implementation Evidence

`apps/api/src/activation-orders/activation-orders.service.ts`

- snapshot builder starts at line 1857
- builder copies only selected attribution fields from `AffiliateClickEvent`
- no `ipHash`, `userAgentHash`, `deviceHint`, request header, cookie, or Authorization field is copied into the order snapshot

## Test Evidence

`apps/api/src/activation-orders/activation-orders.service.spec.ts`

- serialized snapshot does not contain click hash values or sensitive keys: lines 696-704

## Prompt 17 Boundary Preserved

Prompt 17 still stores IP/User-Agent as hashes only in `AffiliateClickEvent`. Prompt 18 consumes the click event without copying even those hash values onto `ActivationOrder`.
