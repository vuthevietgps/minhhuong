# Read Only Financial Safety Evidence

## Product Code Boundary

Prompt 19 changed only:

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts`
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`
- result docs

No Prisma schema or migration changed in Prompt 19.

## Read Operations Only

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

`listOrderAttributions` uses only:

- `activationOrder.count`: line 190
- `activationOrder.groupBy`: line 191
- `activationOrder.aggregate`: line 196
- `activationOrder.findMany`: line 201

Hard-ban scan over runtime channel-affiliate code found no payment, subscription, wallet, commission, payout, or commission creation calls.

## Count Safety Test

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- captures financial counts before report: line 264
- asserts counts unchanged after report: line 342
- `financialCounts` includes activation orders, subscriptions, wallet ledger entries, commission earnings, commission ledger entries, payout requests, payments, and affiliate click events: lines 1007-1036

## Approval Flow

Existing approve regression still passes:

- `activation-orders.service.spec.ts`: 21 tests
- `activation-orders.service.spec.ts channel-finance.service.spec.ts`: 33 tests
