# Audit Schema Or Reuse Inventory

## Inventory

Existing generic audit infrastructure was found:

- `apps/api/prisma/schema.prisma:1257` defines `AuditLog`.
- `apps/api/prisma/schema.prisma:1269` has `@@index([action, createdAt])`.
- `apps/api/src/channel-admin/channel-admin.controller.ts:102` exposes existing admin audit logs.
- `apps/api/src/channel-admin/channel-admin.service.ts:1399` implements existing audit log listing.
- `apps/api/src/channel-admin/channel-admin.service.ts:1524` writes existing audit rows.
- `apps/api/src/activation-orders/activation-orders.service.ts:2299` and `apps/api/src/admin-content/admin-content.service.ts:1017` also use `auditLog.create`.

## Decision

Reused `AuditLog` instead of adding a new Prisma model.

Reason:

- existing table already supports actor, action, entity type, metadata, and timestamp
- existing index supports action/time filtering
- Prompt 22 only needs a narrow operational audit slice
- no schema migration was necessary

## New Audit Convention

Prompt 22 uses:

- `action`: `channel_affiliate.report_access`
- `entityType`: `AffiliateReportAccessAudit`
- `entityId`: `{REPORT_TYPE}:{FORMAT}`
- `metadata`: safe whitelist only

Code evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:173` defines the action constant.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:971` writes `AuditLog` rows.
