# CSV Serialization Evidence

## Deterministic Headers

List export header:

```text
orderId,orderStatus,orderCreatedAt,approvedAmountCents,approvedCurrency,clickId,affiliateLinkId,affiliateQrAssetId,participantId,agencyId,agencyMemberId,referralCode,campaign,channel,placement,packageCode,clickCreatedAt,orderSnapshottedAt,attributionModel,matchConfidence,attributionWindowDays
```

Aggregate export header:

```text
groupBy,snapshotField,key,totalAttributedOrders,approvedOrders,countByStatus,approvedAmountCentsByCurrency,approvedAmountCents,firstOrderCreatedAt,lastOrderCreatedAt
```

Code evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:172` defines the list export header.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:196` defines the aggregate export header.

## Serializer

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1578` serializes rows with deterministic headers.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1588` escapes CSV cells.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1596` serializes deterministic JSON record cells for aggregate maps.

Behavior:

- commas, quotes, CR, and LF are quoted
- embedded quotes are doubled
- output uses CRLF line separators
- null/undefined cells become empty cells, except aggregate `approvedAmountCents` uses explicit `null` when multi-currency would otherwise be mixed

## Escaping Test

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:755` seeds campaign value with comma, quote, and newline.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:794` asserts list CSV escaping.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:809` asserts aggregate CSV escaping.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:810` asserts deterministic `countByStatus` JSON CSV escaping.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:811` asserts deterministic currency map JSON CSV escaping.
