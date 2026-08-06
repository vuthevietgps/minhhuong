# Activation Order Scope Evidence

## Service Under Test

`ActivationOrdersService.listOrders` builds scope from the authenticated user and actor channel participant.

Evidence:

- method entry: `apps/api/src/activation-orders/activation-orders.service.ts:73`
- admin/operations global branch: `apps/api/src/activation-orders/activation-orders.service.ts:74-77`
- actor participant branch and `lineage startsWith`: `apps/api/src/activation-orders/activation-orders.service.ts:82-91`
- created-by fallback for actor user: `apps/api/src/activation-orders/activation-orders.service.ts:92`
- no participant fallback: `apps/api/src/activation-orders/activation-orders.service.ts:96-97`

## DB-Backed Test Claims

Test: `filters activation orders by sale, manager, director, and admin/ops scopes`

Evidence: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:96-144`

Covered claims:

- sale A sees only `p7-order-sale-a`;
- sale A does not see sale B sibling rows;
- manager A sees `p7-order-agency-a`, `p7-order-sale-a`, and `p7-order-sale-a-direct`;
- manager A does not see `p7-order-sale-b` or `p7-order-agency-b`;
- director/root sees all A and B seeded orders;
- admin sees all A and B seeded orders;
- operations sees all A and B seeded orders;
- unscoped non-admin user receives an empty order list.

## Result

Activation order subtree visibility is covered by a real PostgreSQL test with seeded sibling rows present and excluded.

