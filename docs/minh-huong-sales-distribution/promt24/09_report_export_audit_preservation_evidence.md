# Report Export Audit Preservation Evidence

## Scope

Prompt 24 changed only activation order commission snapshotting and schema. It did not change channel-affiliate report/list/aggregate/export/audit services or controllers.

## Regression

The following passed:

- `npm --prefix apps/api test -- --runInBand channel-affiliate`
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts`
- full Jest

These cover Prompt 19/20/21/22 report/export/audit behavior and Prompt 23 commission attribution proof regressions.
