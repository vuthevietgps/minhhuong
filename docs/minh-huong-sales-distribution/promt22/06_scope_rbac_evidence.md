# Scope RBAC Evidence

## Report/Export Access

Prompt 22 did not weaken report/export scope. The audited methods still use the Prompt 19/20/21 paths:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:319` list JSON report.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:397` list CSV export.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:446` aggregate computation using existing scope/filter helper.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:565` aggregate CSV export.

## Audit Read Access

Audit read is stricter than the report view roles:

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:108` allows only `ADMIN` and `OPERATIONS`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1035` implements service-level guard for `ADMIN` and `OPERATIONS`.

## Test Evidence

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1076` operations can read audit records.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1109` sale user is rejected.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1112` director is rejected.

Existing Prompt 19/20/21 scope tests still passed in:

- `npm --prefix apps/api test -- --runInBand channel-affiliate`
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts`
