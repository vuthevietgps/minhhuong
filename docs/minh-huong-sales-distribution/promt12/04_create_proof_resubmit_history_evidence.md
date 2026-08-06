# Create Proof Resubmit History Evidence

## Create Events

Self-service create:

- Service evidence: `CREATE_SELF_SERVICE` nested history near `apps/api/src/activation-orders/activation-orders.service.ts:612`.
- Test evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:307`.
- Metadata includes package code/name, amount, requested duration, and whether transfer content exists.

Sale-assisted create:

- Service evidence: `CREATE_SALE_ASSISTED` nested history near `apps/api/src/activation-orders/activation-orders.service.ts:336`.
- Test evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:611`.
- Metadata includes package, amount, duration, attribution ids, and optional sale invoice storage key.

## Payment Proof Upload

- Service evidence: status claim near `apps/api/src/activation-orders/activation-orders.service.ts:684`; `UPLOAD_PAYMENT_PROOF` history near line 708.
- Test evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:359`.
- Metadata includes previous status and proof file storage metadata.

## Resubmit

- Service evidence: `REJECTED` claim near `apps/api/src/activation-orders/activation-orders.service.ts:410`; `RESUBMIT` history near line 436.
- Test evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:794` and `:833`.
- Metadata includes previous review notes and replacement invoice metadata when supplied.

