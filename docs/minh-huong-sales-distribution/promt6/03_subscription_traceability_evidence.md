# Subscription Traceability Evidence

## Approval Source Writes

| Claim | Classification | Evidence |
| --- | --- | --- |
| Approval resolves package by exact code | DIRECT | `apps/api/src/activation-orders/activation-orders.service.ts:616-620` uses `activationPackage.findUnique({ where: { code: order.packageCode } })`. |
| Approval retains `providerRef` | DIRECT | `apps/api/src/activation-orders/activation-orders.service.ts:722` writes `providerRef: order.id`. |
| Approval writes `sourceOrderId` | DIRECT | `apps/api/src/activation-orders/activation-orders.service.ts:723` writes `sourceOrderId: order.id`. |
| Approval writes `activationPackageId` when resolved | DIRECT | `apps/api/src/activation-orders/activation-orders.service.ts:724` writes `activationPackageId: activationPackage?.id ?? null`. |
| Revocation remains compatible with legacy and traced rows | DIRECT | `apps/api/src/activation-orders/activation-orders.service.ts:898` cancels by `OR: [{ sourceOrderId: orderId }, { providerRef: orderId }]`. |

## Test Evidence

| Claim | Classification | Evidence |
| --- | --- | --- |
| New approval writes source and package trace fields | DIRECT | `activation-orders.service.spec.ts:361-362`. |
| Package miss does not break approval | DIRECT | `activation-orders.service.spec.ts:390-421`. |
| Renewal stacking keeps future subscription end | DIRECT | `activation-orders.service.spec.ts:423-456`. |
| Same-key replay creates no duplicate subscription | DIRECT | `activation-orders.service.spec.ts:458-507`. |
| Stale repeated approval creates no duplicate subscription | DIRECT | `activation-orders.service.spec.ts:718` test and duplicate call assertions below it. |

## Coverage Summary

- `ActivationOrder -> Subscription`: covered by `sourceOrderId`.
- `Subscription -> ActivationPackage`: covered when package code resolves.
- Legacy `providerRef`: retained and still written.
- Package miss: allowed, with `activationPackageId = null`.

