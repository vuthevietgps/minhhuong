# Aggregate Implementation Evidence

Implementation entrypoint:

- `listCommissionAggregates`: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:622`
- `buildCommissionAggregates`: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:637`

Bucket behavior:

- `key`
- `totalCommissions`
- `countByStatus`
- `pendingCommissions`
- `releasedCommissions`
- `revokedCommissions`
- `availableCommissions`
- currency maps for total, pending, released, and available amounts
- `totalAmountCents` only when one currency is present
- first/last commission created timestamps

Status mapping:

- `PENDING` -> `pendingCommissions`
- `AVAILABLE` -> `releasedCommissions` and `availableCommissions`
- `CANCELED` -> `revokedCommissions`

No payout state is changed by this mapping.
