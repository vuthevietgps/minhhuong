# Scope RBAC Regression Evidence

## Runtime Contract

Actor summaries are returned only after order visibility is proven:

- route role guard: `activationOrderViewRoles`
- service visibility: same `orderVisibilityWhere` helper as `listOrders`
- out-of-scope orders return `NotFoundException`
- actor relation is selected only in the status history query after the order visibility check

## Unit Evidence

`apps/api/src/activation-orders/activation-orders.service.spec.ts:354`

Verifies inaccessible order reads throw `NotFoundException` and do not call `orderStatusHistory.findMany`, so actor lookup cannot leak user existence.

## DB-Backed Evidence

`apps/api/src/channel-finance/channel-scope.integration.spec.ts:149`

Still verifies:

- sale A can read sale A history.
- manager A can read sale A subtree history.
- operations can read sale B globally.
- sibling sale B cannot read sale A history.
- sibling manager B cannot read sale A history.
- sibling agency B owner cannot read sale A history.
- unscoped sale cannot read sale A history.

`apps/api/src/channel-finance/channel-scope.integration.spec.ts:103` still verifies order list rows do not include `statusHistory`.

