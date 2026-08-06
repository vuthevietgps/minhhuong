# Schema Migration Diff Audit

## Current Schema Fields Used By Scope Foundation

Current schema includes:

- `ChannelParticipant.parentParticipantId`: `apps/api/prisma/schema.prisma:715`
- `ChannelParticipant.rootParticipantId`: `apps/api/prisma/schema.prisma:716`
- `ChannelParticipant.lineage`: `apps/api/prisma/schema.prisma:717`
- `ChannelParticipant.depth`: `apps/api/prisma/schema.prisma:718`
- parent relation: `apps/api/prisma/schema.prisma:728`
- indexes on parent/root/lineage: `apps/api/prisma/schema.prisma:736-738`
- `CommissionEarning.depth`: `apps/api/prisma/schema.prisma:773`
- `CommissionEarning.availableAt`: `apps/api/prisma/schema.prisma:774`
- `CommissionEarning.releasedAt`: `apps/api/prisma/schema.prisma:775`
- `CommissionEarning.status/availableAt` index: `apps/api/prisma/schema.prisma:787`
- `ActivationOrder.trialEndsAt`: `apps/api/prisma/schema.prisma:878`
- `ActivationOrder.trialEndsAt` index: `apps/api/prisma/schema.prisma:904`
- `ChannelParticipantType` values `DIRECTOR`, `MANAGER`, `AGENCY`, `SALE`: `apps/api/prisma/schema.prisma:144-149`

## Migration History Before Prompt 8

The original channel participant migration created:

- enum `ChannelParticipantType` with only `SALE` and `AGENCY`: `apps/api/prisma/migrations/20260527103000_channel_participants_compensation/migration.sql:2`
- `ChannelParticipant` table without parent/root/lineage/depth: `apps/api/prisma/migrations/20260527103000_channel_participants_compensation/migration.sql:5-22`
- participant IDs on commercial tables: `apps/api/prisma/migrations/20260527103000_channel_participants_compensation/migration.sql:29-32`
- participant indexes and FKs: `apps/api/prisma/migrations/20260527103000_channel_participants_compensation/migration.sql:159-173`

`CommissionEarning` was originally created without `depth`, `availableAt`, or `releasedAt`: `apps/api/prisma/migrations/20260526143424_finance_channels_commissions/migration.sql:63-78`.

`ActivationOrder.trialEndsAt` was absent from existing migration SQL and surfaced as an actual `migrate deploy` test failure before final fix.

## Missing Items Reconciled

Prompt 8 added a migration for:

- enum values `DIRECTOR` and `MANAGER`;
- `ChannelParticipant.parentParticipantId`;
- `ChannelParticipant.rootParticipantId`;
- `ChannelParticipant.lineage`;
- `ChannelParticipant.depth`;
- indexes on parent/root/lineage;
- guarded self-FK for parent participant;
- `CommissionEarning.depth`;
- `CommissionEarning.availableAt`;
- `CommissionEarning.releasedAt`;
- `CommissionEarning_status_availableAt_idx`;
- `CommissionEarning.status` default alignment to `PENDING`;
- `ActivationOrder.trialEndsAt`;
- `ActivationOrder_trialEndsAt_idx`.

