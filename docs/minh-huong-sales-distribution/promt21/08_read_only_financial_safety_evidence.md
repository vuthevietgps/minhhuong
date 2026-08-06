# Read Only Financial Safety Evidence

## Code Evidence

List export:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:363` implements `exportOrderAttributionsCsv`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:369` uses `activationOrder.findMany`.
- no create/update/delete operation is used in the list export method.

Aggregate export:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:508` implements `exportOrderAttributionAggregatesCsv`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:512` reuses read-only aggregate computation.
- no create/update/delete operation is used in the aggregate export method.

## Counter Test

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:780` captures financial counters before export.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:846` asserts counters are unchanged after list and aggregate export.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1580` defines `financialCounts`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1592` counts subscriptions.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1593` counts wallet ledger entries.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1594` counts commission earnings.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1595` counts commission ledger entries.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1596` counts payout requests.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1597` counts payments.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1598` counts affiliate click events.

Result: exports are read-only with respect to orders, clicks, payments, subscriptions, wallet ledgers, commissions, and payouts.
