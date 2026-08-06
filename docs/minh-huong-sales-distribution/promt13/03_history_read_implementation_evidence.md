# History Read Implementation Evidence

## Route

`apps/api/src/activation-orders/activation-orders.controller.ts:99`

Adds:

- `GET /activation-orders/:orderId/status-history`
- guarded with `activationOrderViewRoles`
- delegates to `ActivationOrdersService.getStatusHistory`

## Service Method

`apps/api/src/activation-orders/activation-orders.service.ts:133`

`getStatusHistory`:

1. builds the same order visibility predicate used by `listOrders`.
2. verifies the requested order is visible with `activationOrder.findFirst`.
3. throws `NotFoundException` if not visible.
4. reads `OrderStatusHistory` rows.
5. orders rows by `createdAt ASC`, then `id ASC`.
6. selects only safe row fields.
7. sanitizes `metadataJson` before returning.

## Shared Scope Helper

`apps/api/src/activation-orders/activation-orders.service.ts:1486`

`orderVisibilityWhere` is now used by both:

- `listOrders`
- `getStatusHistory`

This avoids drift between list visibility and history visibility.

