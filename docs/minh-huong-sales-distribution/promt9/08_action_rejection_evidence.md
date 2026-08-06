# Action Rejection Evidence

## Service Evidence

- `updateUserStatus` calls `assertCanManageUser`: `apps/api/src/channel-admin/channel-admin.service.ts:395-400`
- `resetUserPassword` calls `assertCanManageUser`: `apps/api/src/channel-admin/channel-admin.service.ts:489-494`
- `updateAgencyMember` calls `assertCanManageAgency`: `apps/api/src/channel-admin/channel-admin.service.ts:577-591`
- `assertCanManageAgency` checks actor lineage against target agency participant lineage: `apps/api/src/channel-admin/channel-admin.service.ts:973-997`
- `assertCanManageUser` checks target lineage starts with actor lineage and target depth is below actor depth: `apps/api/src/channel-admin/channel-admin.service.ts:999-1029`

## DB-Backed Test Evidence

In `apps/api/src/channel-admin/channel-admin-scope.integration.spec.ts`:

- positive: manager A updates in-scope sale A status: lines 226-232
- rejection: manager A cannot update sale B status: lines 234-240
- unchanged sibling assertion: sale B remains `ACTIVE`: lines 241-246
- positive: agency A owner resets in-scope sale A password: lines 248-254
- rejection: agency A owner cannot reset sale B password: lines 256-262
- positive: manager A updates agency A sale member: lines 264-270
- rejection: manager A cannot update agency B sale member: lines 272-278
- unchanged sibling assertion: sale B member title remains unchanged: lines 279-285

## Result

Sibling/non-descendant action rejection is DB-backed and includes positive in-scope controls.

