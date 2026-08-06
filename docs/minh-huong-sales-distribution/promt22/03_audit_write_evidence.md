# Audit Write Evidence

## Audited Endpoints

Four successful access paths now write one audit row each:

- list JSON report
- aggregate JSON report
- list CSV export
- aggregate CSV export

## Code Evidence

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:386` audits list JSON report access.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:420` audits list CSV export access.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:436` audits aggregate JSON report access.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:586` audits aggregate CSV export access.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:945` implements `auditAffiliateReportAccess`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:971` writes the audit row.

## Row Count

- list JSON row count uses returned page item count
- aggregate JSON row count uses returned aggregate item count
- list CSV row count uses data rows, excluding the CSV header
- aggregate CSV row count uses aggregate data rows, excluding the CSV header

## Test Evidence

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:949` starts the Prompt 22 audit test.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1004` asserts list JSON audit metadata.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1016` asserts aggregate JSON audit metadata.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1032` asserts list CSV audit metadata.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1042` asserts aggregate CSV audit metadata.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:993` verifies exactly four audit rows for the unique Prompt 22 campaign.
