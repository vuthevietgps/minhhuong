# Privacy Response Safety Evidence

## Response Safety

The commission report select list excludes:

- customer email;
- customer phone;
- payment proof fields;
- wallet ledger;
- payout execution fields;
- raw click request fields.

Only safe commission/order/proof fields are returned.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:492`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1732`

## Audit Safety

Access audit uses safe filter summary and does not store raw body/PII/payment proof.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:536`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1315`

## Tests

The integration test seeds unsafe values in proof/order rows and asserts response/audit JSON does not contain:

- email/phone;
- raw IP/User-Agent;
- hashes;
- device hint;
- cookies;
- Authorization;
- payment proof;
- payout invoice URL;
- report body.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1339`
