# Endpoint Contract Evidence

## Route

```text
GET /v1/channel-affiliate/commissions
```

Controller evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:71`

## DTO

Added `ListAffiliateCommissionsQueryDto`.

Supported filters:

- `commissionStatus`
- `participantId`
- `beneficiaryType`
- `beneficiaryId`
- `activationOrderId`
- affiliate proof fields
- `commissionChainSnapshotStatus`
- `currency`
- date ranges
- `page`, `pageSize`
- `sortBy`, `sortDirection`

Evidence:

- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:257`

## Response Shape

Each row includes:

- commission ids and financial row fields;
- safe order status/date fields;
- `affiliateProof`;
- `chainProof`;
- `updatedAt: null` because `CommissionEarning` has no `updatedAt` column.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1732`
