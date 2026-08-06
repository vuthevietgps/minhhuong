# Validation Or Remediation Evidence

## Decision

Validation was applied.

Reason:

- local configured DB audit had `0` missing parent references;
- local configured DB audit had `0` self-parent rows;
- local configured DB recursive cycle check returned `0`;
- the FK existed before validation;
- temp PostgreSQL proof with `migrate deploy` confirmed the final schema validates the FK.

## Migration

File:

- `apps/api/prisma/migrations/20260614173000_validate_channel_participant_parent_fk/migration.sql`

SQL:

```sql
ALTER TABLE "ChannelParticipant"
VALIDATE CONSTRAINT "ChannelParticipant_parentParticipantId_fkey";
```

Implementation reference:

- `apps/api/prisma/migrations/20260614173000_validate_channel_participant_parent_fk/migration.sql:5`

## Remediation Status

No remediation SQL was needed for the audited local configured DB because:

- invalid parent count was `0`;
- self-parent count was `0`;
- cycle count was `0`.

For any external or production legacy database that was not part of this local audit, run the audit queries from `03_data_quality_audit_evidence.md` before deploying the validation migration. If any rows are returned, fix those rows first; otherwise `VALIDATE CONSTRAINT` will fail during deployment.
