# Package Entitlement Model Evidence

## Model

`PackageEntitlement` fields:

- `id`
- `packageId`
- `entitlementKey`
- `valueJson`
- `status`
- `createdAt`
- `updatedAt`

Relations:

- belongs to `ActivationPackage`;
- cascades delete when package is deleted.

Constraints/indexes:

- index on `packageId`;
- index on `(entitlementKey, status)`;
- partial unique SQL index for active `(packageId, entitlementKey)`.

## Admin Backend

Added channel-admin backend methods and routes for:

- list entitlement rows for a package;
- create entitlement row;
- update entitlement row.

Package version increments when package fields or entitlement rows change.

Evidence:

- `apps/api/src/channel-admin/dto/agency.dto.ts:40`
- `apps/api/src/channel-admin/dto/agency.dto.ts:397`
- `apps/api/src/channel-admin/channel-admin.controller.ts:216`
- `apps/api/src/channel-admin/channel-admin.service.ts:806`
- `apps/api/src/channel-admin/channel-admin.service.ts:814`
- `apps/api/src/channel-admin/channel-admin.service.ts:846`

## Tests

`channel-admin.service.spec.ts` covers entitlement create/update and version bump.
