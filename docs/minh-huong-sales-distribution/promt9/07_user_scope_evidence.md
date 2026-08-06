# User Scope Evidence

## Service Evidence

- `listUsers`: `apps/api/src/channel-admin/channel-admin.service.ts:370-393`
- `userScopeWhere`: `apps/api/src/channel-admin/channel-admin.service.ts:877-911`
- user scope covers users with channel participant lineage or activation orders in lineage: `apps/api/src/channel-admin/channel-admin.service.ts:889-909`

## DB-Backed Test Evidence

In `apps/api/src/channel-admin/channel-admin-scope.integration.spec.ts`:

- manager A sees manager A, agency A owner, sale A, and sale A direct: lines 144-154
- manager A excludes manager B, agency B owner, sale B, and sale B direct: lines 155-162
- agency A owner sees agency A owner and sale A: lines 178-186
- agency A owner excludes sale A direct and sale B: lines 187-192
- director/root sees A and B subtree users: lines 194-204
- admin sees global users including admin, ops, unscoped, sale A, and sale B: lines 206-217
- unscoped non-admin receives empty user list: lines 219-222

## Result

User list scope is DB-backed and proves sibling user rows are present and excluded.

