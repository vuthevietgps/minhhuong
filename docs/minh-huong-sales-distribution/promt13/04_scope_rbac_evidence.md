# Scope RBAC Evidence

## Runtime Rules

History read access first passes `activationOrderViewRoles`, then service-level visibility:

- `ADMIN` and `OPERATIONS`: global.
- active channel participant: channel subtree by `lineage` plus orders created by current user.
- non-channel user with id: own created orders only, matching existing list behavior.
- demo/no id: no rows.
- invisible or missing order: `NotFoundException`.

## Unit Evidence

`apps/api/src/activation-orders/activation-orders.service.spec.ts:354`

Verifies an inaccessible order returns `NotFoundException` and does not query `orderStatusHistory.findMany`.

## DB-Backed Evidence

`apps/api/src/channel-finance/channel-scope.integration.spec.ts:149`

Verifies:

- sale A can read sale A order history.
- manager A can read sale A subtree order history.
- operations can read sale B order history globally.
- sibling sale B cannot read sale A history.
- sibling manager B cannot read sale A history.
- sibling agency B owner cannot read sale A history.
- unscoped sale user cannot read sale A history.

The same file keeps the existing list-order scope test and now asserts list rows do not include `statusHistory`.

