# Files Changed

## Source

- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`
  - added report access audit query DTO and enums

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts`
  - added `GET /channel-affiliate/report-access-audits`
  - restricted audit read to `ADMIN` and `OPERATIONS`

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts`
  - added audit constants
  - added audit writes for four report/export access paths
  - added safe filter summary allowlist
  - added admin/operations audit read method
  - added audit response whitelist serialization
  - refactored aggregate computation into internal builder to avoid double audit rows for aggregate CSV

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`
  - added Prompt 22 audit write/read/privacy/RBAC/financial-safety tests
  - added invalid audit query tests
  - added audit helper filtered by Prompt 22 campaign

## Evidence Packet

- `docs/minh-huong-sales-distribution/promt22/*`

## Schema

No Prisma schema change was made. Existing `AuditLog` was reused.
