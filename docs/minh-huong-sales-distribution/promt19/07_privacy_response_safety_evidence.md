# Privacy Response Safety Evidence

## Response Whitelist

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- `serializeOrderAttribution`: line 546
- safe order fields returned: lines 569-577
- `normalizeAffiliateSnapshot`: line 582
- whitelisted affiliate fields returned: lines 615-631

The response does not expose:

- raw IP
- raw User-Agent
- `ipHash`
- `userAgentHash`
- device hint
- cookies
- Authorization
- raw request headers
- payment proof fields
- invoice storage keys

## Test Evidence

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- seeded snapshot contains sensitive decoy fields: lines 919-924
- serialized response excludes raw IP/User-Agent and hash keys: lines 333-336
- serialized response excludes device hint, cookie, Authorization, and payment proof: lines 337-340

## Prompt 17/18 Boundary

Prompt 17 click hashes remain on `AffiliateClickEvent`. Prompt 18 order snapshot excludes those hashes. Prompt 19 report only returns the Prompt 18 snapshot whitelist.
