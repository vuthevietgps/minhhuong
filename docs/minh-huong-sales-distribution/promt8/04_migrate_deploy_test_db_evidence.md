# Migrate Deploy Test DB Evidence

## Integration Harness

The DB-backed scope test now creates a temp PostgreSQL database and runs `prisma migrate deploy`.

Evidence:

- temp database prefix: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:34`
- DB creation: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:41-48`
- `migrate deploy`: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:51-65`
- current database assertion: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:71-74`
- migration schema assertion call: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:75`
- cleanup/drop: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:87-94`

## Schema Assertions

The test asserts migration-created schema contains:

- `ChannelParticipant.parentParticipantId`
- `ChannelParticipant.rootParticipantId`
- `ChannelParticipant.lineage`
- `ChannelParticipant.depth`
- `CommissionEarning.depth`
- `CommissionEarning.availableAt`
- `CommissionEarning.releasedAt`
- `ActivationOrder.trialEndsAt`
- enum values `DIRECTOR`, `MANAGER`, `AGENCY`, `SALE`
- required indexes
- `ChannelParticipant_parentParticipantId_fkey`

Evidence: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:264-334`

## Standalone Smoke Proof

A standalone temp DB smoke command also ran `migrate deploy` and queried the database directly.

Result summary:

```json
{
  "migration": [
    {
      "migration_name": "20260614170000_reconcile_channel_scope_history",
      "finished": true
    }
  ],
  "columns": [
    "ActivationOrder.trialEndsAt",
    "ChannelParticipant.depth",
    "ChannelParticipant.lineage",
    "ChannelParticipant.parentParticipantId",
    "ChannelParticipant.rootParticipantId",
    "CommissionEarning.availableAt",
    "CommissionEarning.depth",
    "CommissionEarning.releasedAt"
  ],
  "channelParticipantType": ["SALE", "AGENCY", "DIRECTOR", "MANAGER"],
  "indexes": [
    "ActivationOrder_trialEndsAt_idx",
    "ChannelParticipant_lineage_idx",
    "ChannelParticipant_parentParticipantId_idx",
    "ChannelParticipant_rootParticipantId_idx",
    "CommissionEarning_status_availableAt_idx"
  ]
}
```

The temp DB was dropped after the proof.

