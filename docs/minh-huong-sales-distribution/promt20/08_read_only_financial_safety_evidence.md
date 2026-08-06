# Read Only Financial Safety Evidence

## Code Evidence

The aggregate method uses a read path:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:333` calls `activationOrder.findMany`.
- It does not call `create`, `update`, `upsert`, `delete`, or `deleteMany` inside `listOrderAttributionAggregates`.
- It does not touch subscription, wallet ledger, commission, payout, or payment write paths.

## Financial Counter Test

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:454` captures financial counters before aggregate calls.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:627` asserts financial counters are unchanged after aggregate calls.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1324` defines `financialCounts`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1336` counts subscriptions.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1337` counts wallet ledger entries.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1338` counts commission earnings.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1339` counts commission ledger entries.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1340` counts payout requests.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1341` counts payments.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1342` counts affiliate click events.

## Result

Prompt 20 aggregate reporting is read-only with respect to financial, commission, payout, payment, subscription, and click-event records.
