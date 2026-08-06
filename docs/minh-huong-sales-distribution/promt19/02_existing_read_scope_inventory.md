# Existing Read Scope Inventory

## Activation Order Read Pattern

`apps/api/src/activation-orders/activation-orders.service.ts`

- existing `listOrders` uses `orderVisibilityWhere` and returns paginated order data.
- existing order include exposes safe order/account fields to scoped roles.

## Channel Affiliate Scope Pattern

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- existing `listLinks` uses `participantScopeWhere`.
- `participantScopeWhere` uses current `ChannelParticipant.lineage`.
- `ADMIN` and `OPERATIONS` are global.
- scoped roles see only subtree rows.
- unscoped non-admin users get an empty scope.

## Prompt 19 Route Placement

The new endpoint is placed under `channel-affiliate` because:

- it reads affiliate attribution data;
- it uses existing channel affiliate view roles;
- it uses existing affiliate lineage scope helpers;
- it avoids modifying general activation order list behavior.
