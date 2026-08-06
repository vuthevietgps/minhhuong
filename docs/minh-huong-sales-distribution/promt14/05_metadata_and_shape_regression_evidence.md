# Metadata And Shape Regression Evidence

## Response Shape

Prompt 13 fields remain:

- `id`
- `orderId`
- `fromStatus`
- `toStatus`
- `action`
- `actorUserId`
- `reason`
- `metadataJson`
- `createdAt`

Prompt 14 adds:

- `actor`

Actor fields:

- `id`
- `displayName`
- `email`

## Sensitive Field Tests

Unit test `apps/api/src/activation-orders/activation-orders.service.spec.ts:274` injects extra sensitive actor fields into the mocked relation and verifies they do not appear:

- `passwordHash`
- `refreshToken`
- `roles`
- `avatarUrl`

DB-backed test `apps/api/src/channel-finance/channel-scope.integration.spec.ts:149` verifies serialized history does not include:

- `passwordHash`
- `roles`
- `childProfiles`
- `payments`

## Metadata Sanitization Regression

Prompt 13 metadata sanitization remains in place:

- storage keys/URLs reduce to filenames.
- raw file content is redacted.

Verified in:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:274`
- `apps/api/src/channel-finance/channel-scope.integration.spec.ts:149`

## Ordering Regression

Ordering remains:

- `createdAt ASC`
- `id ASC`

The existing DB-backed test continues to verify deterministic row id ordering for rows with the same timestamp.

