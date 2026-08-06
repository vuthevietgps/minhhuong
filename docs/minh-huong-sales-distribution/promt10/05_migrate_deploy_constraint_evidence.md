# Migrate Deploy Constraint Evidence

## Direct Proof Test

File:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts`

The spec creates a temporary PostgreSQL database and runs Prisma migrations through:

```text
prisma migrate deploy
```

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:22`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:31`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:34`

## Temp DB Guard

The test confirms the active connection is the generated temp database before assertions run.

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:54`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:57`

## Constraint Assertions

The test asserts:

- FK row exists in `pg_constraint`;
- `convalidated = true`;
- table is `ChannelParticipant`;
- definition contains `FOREIGN KEY ("parentParticipantId")`.

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:70`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:79`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:86`

## Valid Tree And Invalid Write Proof

The proof seeds:

- `p10-root`
- `p10-manager`
- `p10-sale`

Then it verifies:

- missing parent count is `0`;
- self-parent count is `0`;
- cycle count is `0`;
- an invalid insert with `parentParticipantId = p10-missing-parent` is rejected.

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:90`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:97`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:193`
