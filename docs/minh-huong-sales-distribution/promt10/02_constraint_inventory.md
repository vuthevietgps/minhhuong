# Constraint Inventory

## Constraint

Name:

- `ChannelParticipant_parentParticipantId_fkey`

Expected definition:

```sql
FOREIGN KEY ("parentParticipantId")
REFERENCES "ChannelParticipant"(id)
ON UPDATE CASCADE
ON DELETE SET NULL
```

Prompt 8 added this FK as `NOT VALID`. Prompt 10 validates it.

## Status Query

The DB-backed proof uses:

```sql
SELECT
  con.conname,
  con.convalidated,
  cls.relname AS table_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class cls ON cls.oid = con.conrelid
WHERE con.conname = 'ChannelParticipant_parentParticipantId_fkey';
```

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:70`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:114`

## Final Migrated Schema Result

The temp-DB proof after `prisma migrate deploy` asserted:

- `conname = ChannelParticipant_parentParticipantId_fkey`
- `convalidated = true`
- `table_name = ChannelParticipant`
- definition contains `FOREIGN KEY ("parentParticipantId")`

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:79`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:86`
