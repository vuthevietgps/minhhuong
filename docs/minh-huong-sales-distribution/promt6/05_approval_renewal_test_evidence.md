# Approval And Renewal Test Evidence

## Tests Added Or Updated

File:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts`

Coverage:

| Behavior | Classification | Evidence |
| --- | --- | --- |
| Newly approved order creates subscription with `sourceOrderId = order.id` | DIRECT | assertions at `:361` and `:416`. |
| Newly approved order stores `activationPackageId` when package resolves | DIRECT | assertions at `:362` and `:452`. |
| Unresolved package does not break approval | DIRECT | test starts at `:390`; asserts `activationPackageId: null` at `:417`. |
| `providerRef` is retained | DIRECT | assertions at `:360`, `:415`, `:450`, and `:498`. |
| Renewal stacking remains unchanged | DIRECT | test starts at `:423`; asserts `currentPeriodStart` and `currentPeriodEnd` at `:448-449`. |
| Same-key approve replay does not duplicate subscription | DIRECT | test starts at `:458`; `subscription.create` called once at `:505`. |
| Same-key different payload conflicts | DIRECT | test starts at `:512`. |
| Stale repeated approval does not duplicate subscription | DIRECT | test starts at `:718`; `subscription.create` called once in assertions. |

## Prompt 4 Idempotency Compatibility

Prompt 4 idempotency behavior is preserved:

- same idempotency key and same payload replays stored response;
- same key and different payload conflicts;
- transaction claim blocks stale duplicate side effects.

