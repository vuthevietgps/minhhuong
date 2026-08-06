# Currency Amount Safety Evidence

## Requirement

Prompt 20 required approved amount metrics without incorrectly mixing currencies.

## Implementation

The aggregate report always returns:

- `approvedAmountCentsByCurrency`

It also returns:

- `approvedAmountCents` only when the row or summary contains zero or one currency
- `null` when more than one currency would otherwise be mixed

## Code Evidence

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:390` increments summary approved amount by currency.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:395` increments bucket approved amount by currency.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:403` rejects `approvedAmountCents` sorting when the result contains more than one currency.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:432` returns summary `approvedAmountCentsByCurrency`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:436` derives summary `approvedAmountCents` through `singleCurrencyAmount`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:791` returns item `approvedAmountCentsByCurrency`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:792` derives item `approvedAmountCents` through `singleCurrencyAmount`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:863` returns `0`, one currency value, or `null` from `singleCurrencyAmount`.

## Test Evidence

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:471` asserts summary approved amount by currency.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:483` asserts item approved amount by currency.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:497` asserts a non-approved bucket returns no currency amount and `approvedAmountCents: 0`.
