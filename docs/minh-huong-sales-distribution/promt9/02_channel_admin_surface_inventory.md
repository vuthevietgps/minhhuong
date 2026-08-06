# Channel Admin Surface Inventory

## Controller Routes

Relevant channel-admin routes:

- `GET /channel-admin/summary` -> `ChannelAdminService.getSummary`
- `GET /channel-admin/agencies` -> `ChannelAdminService.listAgencies`
- `GET /channel-admin/users` -> `ChannelAdminService.listUsers`
- `PATCH /channel-admin/users/:userId/status` -> `ChannelAdminService.updateUserStatus`
- `POST /channel-admin/users/:userId/reset-password` -> `ChannelAdminService.resetUserPassword`
- `POST /channel-admin/agencies/:agencyId/members` -> `ChannelAdminService.addAgencyMember`
- `PATCH /channel-admin/members/:memberId` -> `ChannelAdminService.updateAgencyMember`

## Service Scope Predicates

Evidence in `apps/api/src/channel-admin/channel-admin.service.ts`:

- `getSummary`: lines 32-120
- `listAgencies`: lines 122-149
- `listUsers`: lines 370-393
- `updateUserStatus`: lines 395-427
- `resetUserPassword`: lines 489-503
- `updateAgencyMember`: lines 577-624
- `participantScopeWhere`: lines 839-854
- `agencyScopeWhere`: lines 856-875
- `userScopeWhere`: lines 877-911
- `assertCanManageAgency`: lines 973-997
- `assertCanManageUser`: lines 999-1029

## Chosen Stable Seams

Prompt 9 tests these stable seams:

- `listAgencies` for agency visibility;
- `listUsers` for user visibility and participant payload visibility;
- `getSummary` for participant scoped count visibility;
- `updateUserStatus`, `resetUserPassword`, and `updateAgencyMember` for sibling/non-descendant action rejection.

There is no explicit `listParticipants` controller route in the current code. Participant visibility is therefore covered through `getSummary.activeMembers/saleUsers` and the `channelParticipant` payload returned by `listUsers`.

