# Report Audit Preservation Evidence

## Scope Preservation

Prompt 23 changes only:

- activation order approval commission attribution proof
- `CommissionEarning` nullable proof schema
- activation order unit tests

No channel-affiliate report, aggregate, export, or audit controller/service code was changed.

## Tests

- `npm --prefix apps/api test -- --runInBand channel-affiliate` passed.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` passed.
- Full Jest passed.

These suites cover Prompt 19 list report, Prompt 20 aggregate report, Prompt 21 CSV exports, and Prompt 22 report/export audit preservation.
