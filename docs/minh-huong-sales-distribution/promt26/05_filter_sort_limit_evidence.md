# Filter Sort Limit Evidence

Filters reuse Prompt 25 commission filtering:

- `commissionStatus`
- `participantId`
- `beneficiaryType`
- `beneficiaryId`
- `activationOrderId`
- `affiliateLinkId`
- `affiliateQrAssetId`
- `agencyId`
- `agencyMemberId`
- `clickId`
- `campaign`
- `channel`
- `placement`
- `packageCode`
- `commissionChainSnapshotStatus`
- `currency`
- `createdFrom` / `createdTo`
- `availableFrom` / `availableTo`
- `approvedFrom` / `approvedTo`

Evidence:

- shared filter builder: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1293`
- aggregate limit max 100: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1733`
- commission aggregate sort validators: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1785`
- `sortBy=totalAmountCents` requires `currency`: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:647`

Test evidence:

- full filter AND case: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1447`
- sort/limit case: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1534`
- invalid query cases: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1705`
