# Aggregate Implementation Evidence

## Service Method

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:323` implements `listOrderAttributionAggregates`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:327` resolves the snapshot field from `groupBy`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:328` validates aggregate `limit`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:329` validates `sortBy`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:330` validates `sortDirection`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:331` reuses `affiliateOrderAttributionWhere`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:333` reads `ActivationOrder` with `findMany`.

## GroupBy Mapping

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:130` defines the only accepted aggregate dimensions and maps them to snapshot fields.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:717` rejects missing or unsupported `groupBy`.

Mapping:

```text
participant       -> participantId
agency            -> agencyId
agencyMember      -> agencyMemberId
affiliateLink     -> affiliateLinkId
affiliateQrAsset  -> affiliateQrAssetId
campaign          -> campaign
channel           -> channel
placement         -> placement
package           -> packageCode
```

## Metrics

Each item includes:

- `key`
- `totalAttributedOrders`
- `approvedOrders`
- `countByStatus`
- `approvedAmountCentsByCurrency`
- `approvedAmountCents` only when not mixing currencies
- `firstOrderCreatedAt`
- `lastOrderCreatedAt`

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:359` creates aggregate buckets.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:375` increments total attributed orders.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:377` increments status counts.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:386` increments approved order counts.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:390` sums approved amount by currency.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:776` serializes aggregate items.
