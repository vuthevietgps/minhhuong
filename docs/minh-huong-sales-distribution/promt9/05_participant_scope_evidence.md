# Participant Scope Evidence

## Current Seam

There is no explicit `listParticipants` service/controller route. Prompt 9 covers participant visibility through:

- `ChannelAdminService.getSummary`, which uses `participantScopeWhere`;
- `ChannelAdminService.listUsers`, which returns each user's `channelParticipant` payload.

## Service Evidence

- `getSummary` calls `participantScopeWhere`: `apps/api/src/channel-admin/channel-admin.service.ts:32-35`
- scoped participant count: `apps/api/src/channel-admin/channel-admin.service.ts:64-66`
- `participantScopeWhere` uses actor lineage prefix: `apps/api/src/channel-admin/channel-admin.service.ts:839-854`
- `listUsers` includes channel participant payload through `userSelect`: `apps/api/src/channel-admin/channel-admin.service.ts:1337-1359`

## DB-Backed Test Evidence

In `apps/api/src/channel-admin/channel-admin-scope.integration.spec.ts`:

- manager A summary expects `activeMembers: 4` and `saleUsers: 2`: lines 115-122
- agency A owner summary expects `activeMembers: 2` and `saleUsers: 1`: lines 123-132
- unscoped summary expects zero participant/member counts: lines 133-140
- manager A `listUsers` participant payload includes manager A, agency A, sale A, and sale A direct participants: lines 163-176

## Result

Participant visibility is DB-backed through the stable current seams and sibling subtree rows are present.

