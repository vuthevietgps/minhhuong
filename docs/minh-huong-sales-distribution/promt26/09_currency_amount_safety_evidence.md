# Currency Amount Safety Evidence

Currency behavior:

- all amount totals are returned as currency maps;
- `totalAmountCents` is a number only when one currency is present;
- multi-currency aggregate returns `totalAmountCents: null`;
- `sortBy=totalAmountCents` requires a `currency` filter.

Evidence:

- single-currency helper: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2115`
- total amount sort rejection: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:647`
- multi-currency test: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1514`
- currency-filtered sort test: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1534`
