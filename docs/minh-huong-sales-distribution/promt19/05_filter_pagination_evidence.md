# Filter Pagination Evidence

## Filters

`apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`

- `participantId`: line 56
- `agencyId`: line 61
- `agencyMemberId`: line 66
- `affiliateLinkId`: line 71
- `affiliateQrAssetId`: line 76
- `clickId`: line 81
- `campaign`: line 86
- `channel`: line 91
- `placement`: line 96
- `packageCode`: line 101
- `orderStatus`: line 105
- `createdFrom`: line 109
- `createdTo`: line 113
- `clickFrom`: line 117
- `clickTo`: line 121
- `page`: line 128
- `pageSize`: line 135

## Service Filtering

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- builds report where clause: line 465
- applies participant scope before user filters: line 475
- applies click date JSON path filter: lines 512-513
- applies JSON path equality filters: line 539

## Pagination

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- page/pageSize parsed: lines 185-186
- skip/take applied: lines 187 and 205
- total pages returned: line 235
- helper validation:
  - `pageNumber`: line 1066
  - `pageSize`: line 1076

## Test Evidence

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- pagination with `pageSize: 1`: lines 268 and 273
- total pages assertion: line 277
- clickId filter: line 290
- participant/link/channel/placement/package/click date filters: lines 300-310
- invalid date/page/pageSize tests: lines 411-432
