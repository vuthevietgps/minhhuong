# Files Changed

## Application

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts`
  - Added `GET /channel-affiliate/commissions`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts`
  - Added read-only commission report query, filters, sort, pagination, serialization, scope, and safe audit.
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`
  - Added `ListAffiliateCommissionsQueryDto`.
  - Added `AFFILIATE_COMMISSION_LIST` audit report type.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`
  - Added commission report coverage for filters, scope, privacy, read-only safety, legacy status, and audit.

## Packet

- `docs/minh-huong-sales-distribution/promt25/*`
