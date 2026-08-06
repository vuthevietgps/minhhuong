# Privacy Audit Safety Evidence

## Audit Metadata Whitelist

Audit metadata stores:

- actor user id
- actor roles
- route
- report type
- format
- safe filter summary
- row count
- safe role/scope summary

It does not store:

- raw headers
- cookies
- Authorization
- raw IP
- raw User-Agent
- IP/User-Agent hashes
- device hint
- customer email or phone
- payment proof fields
- CSV body
- raw report body

## Code Evidence

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:954` constructs safe metadata.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:963` uses safe filter summary only.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1012` serializes audit read response through a whitelist.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1058` returns only primitive safe filter fields.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1069` returns only safe role/scope summary.

## Test Evidence

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1061` checks unsafe query values are not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1062` checks raw IP is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1063` checks raw User-Agent is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1064` checks `ipHash` is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1065` checks `userAgentHash` is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1066` checks `deviceHint` is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1067` checks cookies are not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1068` checks Authorization is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1069` checks customer email is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1070` checks payment proof is not present.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1071` and `1072` check CSV headers/body are not stored.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1073` checks order IDs from CSV/report rows are not stored.
