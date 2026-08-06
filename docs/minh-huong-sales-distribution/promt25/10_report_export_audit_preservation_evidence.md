# Report Export Audit Preservation Evidence

## Preservation

Prompt 25 adds one read-only list endpoint and one audit report type. It does not change order attribution report/export behavior.

## Regression

The following passed:

- `npm --prefix apps/api test -- --runInBand channel-affiliate`
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts`
- full Jest

These preserve Prompt 19 list report, Prompt 20 aggregate report, Prompt 21 CSV exports, Prompt 22 report access audits, and Prompt 23/24 commission snapshot tests.
