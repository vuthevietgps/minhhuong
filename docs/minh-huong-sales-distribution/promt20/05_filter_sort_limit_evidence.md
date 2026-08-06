# Filter Sort Limit Evidence

## Filter Reuse

- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:52` defines the shared filter DTO.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:659` changes `affiliateOrderAttributionWhere` to accept the shared filter DTO.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:331` calls the same helper from the aggregate method.

This keeps Prompt 19 list filters and Prompt 20 aggregate filters aligned.

## Filter Fields

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:672` filters `participantId`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:673` filters `agencyId`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:674` filters `agencyMemberId`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:675` filters `affiliateLinkId`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:676` filters `affiliateQrAssetId`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:681` filters `clickId`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:682` filters `campaign`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:683` filters `channel`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:684` filters `placement`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:685` filters `packageCode`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:687` filters order status.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:693` filters order created date.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:704` filters click date from the snapshot.

## Sort And Limit

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:732` validates `limit`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:742` validates `sortBy`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:760` validates `sortDirection`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:800` compares aggregate rows by the requested sort.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:420` applies the limit after sorting.

## Tests

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:457` uses `groupBy`, `campaign`, `sortBy`, `sortDirection`, and `limit`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:514` filters by `campaign` and `clickId`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:582` verifies `channel`, `placement`, and `packageCode` filters.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:705` verifies invalid aggregate queries are rejected.
