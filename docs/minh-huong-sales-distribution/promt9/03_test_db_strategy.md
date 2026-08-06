# Test DB Strategy

## Harness

File: `apps/api/src/channel-admin/channel-admin-scope.integration.spec.ts`

The harness:

- reads `DATABASE_URL`, falling back to local PostgreSQL;
- creates a per-run temp database named `prompt9_channel_admin_<uuid>`;
- runs `prisma migrate deploy --schema apps/api/prisma/schema.prisma`;
- connects Prisma Client with `PrismaPg`;
- asserts `select current_database()` equals the temp DB name;
- seeds deterministic channel-admin fixture rows;
- drops the temp database with `DROP DATABASE IF EXISTS ... WITH (FORCE)`.

Evidence:

- temp DB name: line 30
- DB creation: lines 36-41
- `migrate deploy`: lines 43-58
- current DB assertion: lines 63-67
- cleanup: lines 73-80

## Final Proof

Final proof does not use `prisma db push`.

Direct command:

```text
npm --prefix apps/api test -- --runInBand channel-admin-scope.integration.spec.ts
```

Result:

```text
Test Suites: 1 passed, 1 total
Tests: 3 passed, 3 total
```

