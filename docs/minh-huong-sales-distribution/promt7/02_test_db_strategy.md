# Test DB Strategy

## Pre-Audit Result

Existing commercial service specs are mostly unit/service tests with mocked Prisma delegates. That is useful regression coverage, but it does not prove real sibling subtree rows are excluded by actual Prisma `where` filters.

Prompt 7 therefore adds a dedicated DB-backed integration spec.

## Harness

File: `apps/api/src/channel-finance/channel-scope.integration.spec.ts`

The harness:

- reads `DATABASE_URL`, falling back to `postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public`;
- connects with `PrismaPg`;
- creates a per-run PostgreSQL database named `prompt7_scope_<uuid>`;
- runs the local Prisma CLI with `db push --schema apps/api/prisma/schema.prisma`;
- connects a Prisma Client to the temp database;
- asserts `select current_database()` equals the temp database name;
- seeds deterministic commercial fixture data;
- drops the temp database with `DROP DATABASE IF EXISTS ... WITH (FORCE)` in `afterAll`.

Evidence:

- temp DB name: `channel-scope.integration.spec.ts:34`
- DB creation: `channel-scope.integration.spec.ts:41-48`
- Prisma `db push`: `channel-scope.integration.spec.ts:50-65`
- database assertion: `channel-scope.integration.spec.ts:71-74`
- cleanup/drop: `channel-scope.integration.spec.ts:86-93`

## Migration History Finding

The final DB-backed harness uses `db push`, not `migrate deploy`.

Reason: schema/migration history drift was found during pre-audit. Current Prisma schema includes channel hierarchy fields used by scope filters:

- `ChannelParticipant.rootParticipantId`: `apps/api/prisma/schema.prisma:716`
- `ChannelParticipant.lineage`: `apps/api/prisma/schema.prisma:717`
- `ChannelParticipant.depth`: `apps/api/prisma/schema.prisma:718`
- `@@index([rootParticipantId])`: `apps/api/prisma/schema.prisma:737`
- `@@index([lineage])`: `apps/api/prisma/schema.prisma:738`
- `CommissionEarning.depth`: `apps/api/prisma/schema.prisma:773`

`rg` over `apps/api/prisma/migrations` found no corresponding migration SQL for `rootParticipantId`, `lineage`, or `depth`. This is why Prompt 7 proves current-code behavior with `db push` but marks the result conditional and recommends migration-history reconciliation next.

## DB-Backed Claim

The Prompt 7 scope tests are not mocked Prisma tests. They execute real service methods against real PostgreSQL rows in an isolated temp database.

