# Learning Access Compatibility Evidence

## Source Behavior

File:

- `apps/api/src/entitlement/entitlement.service.ts`

The active subscription query remains based on:

- `childProfileId`
- status in `TRIALING` or `ACTIVE`
- `currentPeriodStart <= now`
- `currentPeriodEnd > now`

Evidence:

- `apps/api/src/entitlement/entitlement.service.ts:44` status filter.

The query does not require `sourceOrderId` or `activationPackageId`.

## Tests

File:

- `apps/api/src/entitlement/entitlement.service.spec.ts`

| Behavior | Classification | Evidence |
| --- | --- | --- |
| Active legacy subscription with null trace fields grants access | DIRECT | test starts at `:65`; null fields at `:68-69`. |
| Active traced subscription grants access | DIRECT | test starts at `:83`; trace fields at `:86-87`. |
| Expired/canceled behavior remains filtered out | DIRECT | test starts at `:102`; query expects active statuses and date bounds at `:111-113`. |

## Result

Learning access remains compatible with both legacy and traced subscriptions. Trace fields are commercial audit links only; they are not required for learning entitlement in this slice.

