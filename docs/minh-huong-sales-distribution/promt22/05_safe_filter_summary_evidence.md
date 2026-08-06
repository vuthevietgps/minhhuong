# Safe Filter Summary Evidence

## Allowed Fields

Audit metadata stores only whitelisted report filters:

- `participantId`
- `agencyId`
- `agencyMemberId`
- `affiliateLinkId`
- `affiliateQrAssetId`
- `clickId`
- `campaign`
- `channel`
- `placement`
- `packageCode`
- `createdFrom`
- `createdTo`
- `clickFrom`
- `clickTo`
- `orderStatus`
- `groupBy`
- `sortBy`
- `sortDirection`
- `limit`

## Code Evidence

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:982` implements `safeAffiliateReportFilterSummary`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:989` includes `orderStatus`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:990` includes `groupBy`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:991` includes `sortBy`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:992` includes `sortDirection`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:993` includes `limit`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1000` stores only normalized safe string fields.

## Test Evidence

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:962` sends unsafe `Authorization` data in a report query.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:963` sends unsafe cookie data in a report query.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:964` sends unsafe raw IP data in a report query.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:966` sends payment proof decoy data in a report query.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1061` and following assertions verify unsafe values are not stored in audit rows.
