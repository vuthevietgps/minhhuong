# Actor Summary Implementation Evidence

## Service Evidence

`apps/api/src/activation-orders/activation-orders.service.ts:133`

`getStatusHistory` still:

1. builds order visibility with `orderVisibilityWhere`.
2. verifies the requested order is visible.
3. throws `NotFoundException` before reading history if not visible.

Actor select was added to the status history query:

- `apps/api/src/activation-orders/activation-orders.service.ts:153`
- selects only `id`, `email`, and `profile.displayName`.

Actor mapping:

- `apps/api/src/activation-orders/activation-orders.service.ts:172`
- returns `{ id, displayName, email }` or `null`.

## Route Evidence

Route remains unchanged from Prompt 13:

- `apps/api/src/activation-orders/activation-orders.controller.ts:99`
- `GET /activation-orders/:orderId/status-history`

## Write Semantics

No Prompt 12 lifecycle write paths were changed.

