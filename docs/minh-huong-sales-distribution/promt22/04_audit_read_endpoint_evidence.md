# Audit Read Endpoint Evidence

## Route

Runtime route:

```text
GET /v1/channel-affiliate/report-access-audits
```

## Controller Evidence

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:107` declares `@Get('report-access-audits')`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:108` restricts the route to `ADMIN` and `OPERATIONS`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:109` defines `listReportAccessAudits`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:111` binds `ListAffiliateReportAccessAuditsQueryDto`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:113` calls service read method.

## DTO Evidence

- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:203` defines `ListAffiliateReportAccessAuditsQueryDto`.

Supported filters:

- `reportType`
- `format`
- `actorUserId`
- `createdFrom`
- `createdTo`
- `page`
- `pageSize`

## Service Evidence

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:597` implements `listReportAccessAudits`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:601` enforces admin/operations access in service code.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:645` counts matching rows.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:646` reads matching rows.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:661` serializes response whitelist.

## Test Evidence

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1076` reads audit rows as operations.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1109` verifies sale cannot read audit rows.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1112` verifies director cannot read audit rows.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1118` verifies invalid audit read query values are rejected.
