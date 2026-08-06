# Endpoint Contract Evidence

Route:

`GET /v1/channel-affiliate/commissions/aggregates`

Controller evidence:

- route declaration: `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:81`
- service call: `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:87`

DTO evidence:

- `AffiliateCommissionAggregateGroupByDto`: `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:258`
- `AffiliateCommissionAggregateSortByDto`: `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:275`
- `AffiliateCommissionAggregateQueryDto`: `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:413`

Supported groupBy values:

- `participant`
- `beneficiaryType`
- `beneficiary`
- `affiliateLink`
- `affiliateQrAsset`
- `agency`
- `agencyMember`
- `campaign`
- `channel`
- `placement`
- `package`
- `commissionStatus`
- `commissionChainSnapshotStatus`
- `currency`
