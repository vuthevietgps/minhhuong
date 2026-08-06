# Bugs Found And Fixes

## Test Fixture Filter Ambiguity

During the focused migration test run, the aggregate test filtered by `clickId` only. Existing Prompt 19 fixture data intentionally reused the same click IDs across multiple seed prefixes, so the aggregate bucket included older seeded rows.

Fix:

- Added `campaign` to the affiliate link aggregate test query so the filter matches the Prompt 20 fixture only.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:514` now includes `campaign`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:515` filters by `clickId`.

## Type Safety Cleanup

The service implementation initially used an inferred method `ReturnType` style that was less robust inside the class body.

Fix:

- Added explicit `AffiliateOrderAttributionAggregateItem` type.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:190` defines `AffiliateOrderAttributionAggregateItem`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:776` returns that item type from `serializeAggregateBucket`.

## Build Retry Note

After e2e, one final build attempt failed with a transient Windows `EPERM` while Nest tried to remove `apps/api/dist/src/health`. Immediate retry passed without source changes.

## Result

After these fixes:

- focused migration test passed, 14 tests
- channel-affiliate suite passed, 20 tests
- full Jest passed, 152 tests
- e2e passed, 12 tests
- final build passed
