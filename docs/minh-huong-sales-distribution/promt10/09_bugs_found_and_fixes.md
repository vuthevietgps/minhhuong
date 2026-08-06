# Bugs Found And Fixes

## Bug 1: Parent FK Was Still NOT VALID

Finding:

- `ChannelParticipant_parentParticipantId_fkey` existed, but the audited local configured database still had `convalidated = false`.

Impact:

- the schema had a parent self-FK for new writes, but the deployment chain did not yet prove legacy rows were validated against the FK.

Fix:

- added `apps/api/prisma/migrations/20260614173000_validate_channel_participant_parent_fk/migration.sql`;
- migration runs `VALIDATE CONSTRAINT "ChannelParticipant_parentParticipantId_fkey"`.

Proof:

- local audit found no missing parents, no self-parent rows, and no cycles;
- temp DB `migrate deploy` proof asserts `convalidated = true`;
- invalid missing-parent insert is rejected.

## Bugs Not Found

The audit did not find:

- missing parent references;
- self-parent rows;
- recursive parent cycles in the audited data.
