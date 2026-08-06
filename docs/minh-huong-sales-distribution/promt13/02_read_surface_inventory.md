# Read Surface Inventory

## Existing Activation Order Read Surfaces

Before Prompt 13:

- `GET /activation-orders`: commercial order list, scoped by `ActivationOrdersService.listOrders`.
- `GET /activation-orders/my-customers`: sales customer summary for orders created by current user.
- `GET /me/activation-orders`: parent/customer own-order list.
- no activation order detail endpoint by id.
- no status history read endpoint.
- `orderInclude()` did not include `statusHistory`.

## Decision

Prompt 13 adds:

- `GET /activation-orders/:orderId/status-history`

Reason:

- There was no safe scoped detail endpoint to extend.
- Adding full history to `GET /activation-orders` would put audit rows into a high-volume list payload.
- Customer-facing `/me` history was not necessary for commercial operator audit usability and was intentionally left untouched.

## List Payload Check

DB-backed test `channel-scope.integration.spec.ts:103` asserts existing order list rows do not include `statusHistory`.

