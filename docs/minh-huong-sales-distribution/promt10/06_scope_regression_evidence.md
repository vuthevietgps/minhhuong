# Scope Regression Evidence

Prompt 10 did not change channel scope service logic. Regression proof comes from rerunning the DB-backed channel scope and channel-admin tests after the validation migration and new FK proof were added.

## Channel Scope

Command:

```bash
npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts
```

Result:

- passed;
- 1 suite;
- 3 tests;
- uses `prisma migrate deploy` on a temp PostgreSQL database from Prompt 8.

## Channel Admin Scope

Command:

```bash
npm --prefix apps/api test -- --runInBand channel-admin-scope.integration.spec.ts
```

Result:

- passed;
- 1 suite;
- 3 tests;
- uses `prisma migrate deploy` on a temp PostgreSQL database from Prompt 9.

## Full Regression

Command:

```bash
npm --prefix apps/api test -- --runInBand
```

Result:

- passed;
- 18 suites;
- 100 tests.

E2E also passed:

```bash
npm --prefix apps/api run test:e2e -- --runInBand
```

Result:

- passed;
- 3 suites;
- 7 tests.
