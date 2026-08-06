# Currency Export Safety Evidence

## List Export

List CSV exports approved amount and currency per approved order row:

- `approvedAmountCents`
- `approvedCurrency`

Non-approved rows leave those cells empty, so the export does not imply payment collection for waiting or non-approved orders.

Code evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1003` emits `approvedAmountCents` only for `APPROVED`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1005` emits `approvedCurrency` only for `APPROVED`.

Test evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:795` asserts VND approved amount/currency.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:796` asserts USD approved amount/currency.

## Aggregate Export

Aggregate CSV always includes `approvedAmountCentsByCurrency` as deterministic JSON.

If multiple currencies appear, `approvedAmountCents` is exported as explicit `null`.

Code evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:520` exports `approvedAmountCentsByCurrency` through deterministic JSON.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:524` exports `approvedAmountCents` as `null` when the aggregate item is multi-currency.

Test evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:760` seeds an additional approved USD order.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:811` asserts `{"USD":1234,"VND":5000000}` appears in aggregate CSV.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:812` asserts `approvedAmountCents` is `null` for the multi-currency aggregate.
