# Agency Scope Evidence

## Service Evidence

- `listAgencies`: `apps/api/src/channel-admin/channel-admin.service.ts:122-149`
- `agencyScopeWhere`: `apps/api/src/channel-admin/channel-admin.service.ts:856-875`
- agency scope uses channel participant lineage prefix: `apps/api/src/channel-admin/channel-admin.service.ts:868-874`

## DB-Backed Test Evidence

In `apps/api/src/channel-admin/channel-admin-scope.integration.spec.ts`:

- manager A sees only agency A: lines 84-85
- agency A owner sees own agency: lines 87-90
- director/root sees A and B agencies: lines 92-97
- admin global sees A and B agencies: lines 99-104
- operations global sees A and B agencies: lines 105-110
- unscoped non-admin receives empty agency list: lines 111-113

## Result

Agency list scope is covered with real A/B sibling agencies in a migration-created PostgreSQL database.

