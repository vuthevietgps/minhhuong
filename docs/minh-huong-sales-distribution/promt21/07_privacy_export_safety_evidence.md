# Privacy Export Safety Evidence

## List Export Whitelist

List CSV contains only:

- order id
- order status
- order created date
- approved amount/currency only for approved orders
- whitelisted attribution snapshot fields

Code evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:172` defines list export headers.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:987` serializes list export rows through a whitelist.

The list export select does not include customer email, user profile, phone, raw request headers, payment proof fields, or financial ledger rows.

## Aggregate Export Whitelist

Aggregate CSV contains only:

- groupBy
- snapshotField
- key
- totalAttributedOrders
- approvedOrders
- countByStatus
- approvedAmountCentsByCurrency
- approvedAmountCents
- firstOrderCreatedAt
- lastOrderCreatedAt

Code evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:196` defines aggregate export headers.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:513` maps aggregate items into the whitelist.

## Privacy Tests

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:798` asserts list CSV does not contain customer email.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:799` asserts list CSV does not contain raw IP data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:800` asserts list CSV does not contain raw User-Agent data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:801` asserts list CSV does not contain `ipHash`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:802` asserts list CSV does not contain `userAgentHash`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:803` asserts list CSV does not contain `deviceHint`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:804` asserts list CSV does not contain cookies.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:805` asserts list CSV does not contain Authorization.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:806` asserts list CSV does not contain payment proof fields.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:813` asserts aggregate CSV does not contain customer email.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:814` asserts aggregate CSV does not contain raw IP data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:815` asserts aggregate CSV does not contain payment proof fields.
