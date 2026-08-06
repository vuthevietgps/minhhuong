# Order Status History Evidence

## Implemented

`OrderStatusHistory` is implemented for activation order approval.

Evidence:

- Schema model: `apps/api/prisma/schema.prisma:809`.
- Relation from order: `apps/api/prisma/schema.prisma:781`.
- Relation from actor user: `apps/api/prisma/schema.prisma:216`.
- Approval history write: `apps/api/src/activation-orders/activation-orders.service.ts:734`.
- Test assertion: `apps/api/src/activation-orders/activation-orders.service.spec.ts:374`.

## Contract

On successful approval:

- `fromStatus`: existing order status, expected `PENDING_REVIEW`.
- `toStatus`: `APPROVED`.
- `action`: `APPROVE`.
- `actorUserId`: operations/admin user id when not demo.
- `reason`: review notes.
- `metadataJson`: duration, expiry, operation invoice storage key, child profile id.

## Deferred

Prompt 4 does not write history for:

- order create;
- payment proof upload;
- reject;
- cancel;
- revoke.

These are explicitly marked deferred in the JSON result and should be implemented in a later lifecycle-history expansion.
