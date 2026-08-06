# Filter Sort Pagination Evidence

## Filters

Implemented filters on:

- direct commission fields;
- JSON proof fields via Prisma JSON path filters;
- activation approval date range;
- chain snapshot status.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1110`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1244`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1257`

## Sorting

Safe sort fields only:

- `createdAt`
- `availableAt`
- `amountCents`
- `depth`

Invalid sort values throw `BadRequestException`.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1269`

## Pagination

- Default page size remains 50.
- Commission endpoint supports max page size 200.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:477`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2265`

## Tests

- Filter set covering link, QR, campaign, channel, placement, package, participant, agency, member, click id, status, currency, date ranges.
- Sorting and pagination by `amountCents`.
- Invalid date/sort/pageSize tests.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1161`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1244`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1384`
