# Data Quality Audit Evidence

## Local Configured Database Audit

The configured local database was audited before adding the validation migration.

Result:

```json
{
  "tableExists": true,
  "missingParentCount": 0,
  "selfParentCount": 0,
  "cycleCount": 0,
  "constraint": [
    {
      "conname": "ChannelParticipant_parentParticipantId_fkey",
      "convalidated": false,
      "table_name": "ChannelParticipant",
      "definition": "FOREIGN KEY (\"parentParticipantId\") REFERENCES \"ChannelParticipant\"(id) ON UPDATE CASCADE ON DELETE SET NULL NOT VALID"
    }
  ]
}
```

Interpretation:

- no missing parent references were found;
- no row was self-parented;
- no cycle was found by the recursive parent walk;
- the FK existed but was not yet validated on the local configured DB before Prompt 10 migration.

## Missing Parent Query

```sql
SELECT child.id AS child_id, child."parentParticipantId" AS missing_parent_id
FROM "ChannelParticipant" child
LEFT JOIN "ChannelParticipant" parent
  ON parent.id = child."parentParticipantId"
WHERE child."parentParticipantId" IS NOT NULL
  AND parent.id IS NULL;
```

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:125`

## Self-Parent Query

```sql
SELECT id
FROM "ChannelParticipant"
WHERE "parentParticipantId" = id;
```

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:134`

## Cycle Query

The DB-backed proof includes a bounded recursive parent walk. It reports any start row whose parent chain loops back into its visited path. The walk is capped at 50 levels to keep the proof focused and safe for the current channel hierarchy.

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:140`
- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:179`

## Temp DB Audit Result

After `migrate deploy` and valid tree seeding, the DB-backed proof asserted:

```json
{
  "missingParentCount": 0,
  "selfParentCount": 0,
  "cycleCount": 0
}
```

Implementation reference:

- `apps/api/src/channel-admin/channel-participant-fk.integration.spec.ts:90`
