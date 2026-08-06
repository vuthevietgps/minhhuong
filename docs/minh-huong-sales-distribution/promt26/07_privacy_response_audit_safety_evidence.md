# Privacy Response Audit Safety Evidence

Response does not include:

- customer email or phone;
- raw IP or raw User-Agent;
- `ipHash` or `userAgentHash`;
- device hint;
- cookies;
- Authorization;
- raw headers;
- payment proof data;
- payout execution data;
- report/export body.

Audit metadata stores only safe report metadata:

- actor id and roles;
- route;
- report type;
- format;
- safe filter summary;
- row count;
- scope summary;
- timestamp from audit row.

Evidence:

- audit call: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:626`
- audit metadata construction: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1581`
- safe summary: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1612`
- privacy/audit tests: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1647`
