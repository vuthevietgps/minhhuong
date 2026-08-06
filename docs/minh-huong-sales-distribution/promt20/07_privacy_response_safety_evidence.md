# Privacy Response Safety Evidence

## Response Shape

The aggregate endpoint returns only aggregate metrics and grouping keys:

- `groupBy`
- `snapshotField`
- `key`
- counts
- approved amount by currency
- first/last order created dates
- sanitized filters

It does not return:

- customer email
- customer phone
- raw IP
- raw User-Agent
- IP hash
- User-Agent hash
- device hint
- cookies
- Authorization headers
- payment proof fields

## Code Evidence

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:333` selects only fields needed for aggregate computation.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:776` serializes a whitelist aggregate item.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:829` serializes only safe filter echo fields.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:933` normalizes snapshots through an allowlist.

## Test Evidence

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:617` checks aggregate serialization does not contain raw IP data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:618` checks raw User-Agent is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:619` checks `ipHash` is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:620` checks `userAgentHash` is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:621` checks `deviceHint` is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:622` checks cookies are not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:623` checks `Authorization` is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:624` checks payment proof data is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:625` checks customer email is not present.
