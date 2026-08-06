# Reject Cancel Revoke History Evidence

## Reject

- Service evidence: `WAITING_PAYMENT`/`PENDING_REVIEW` claim near `apps/api/src/activation-orders/activation-orders.service.ts:1040`; `REJECT` history near line 1062.
- Test evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:852` and `:882`.
- Metadata includes previous status. Review notes are stored as `reason`.

## Cancel

- Service evidence: cancelable status claim near `apps/api/src/activation-orders/activation-orders.service.ts:496`; `CANCEL` history near line 511.
- Test evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:918` and `:939`.
- Metadata includes previous status and actor roles.

## Revoke

- Service evidence: `APPROVED` claim near `apps/api/src/activation-orders/activation-orders.service.ts:1111`; commission cancel near line 1133; subscription cancel near line 1156; `REVOKE` history near line 1176.
- Test evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:979` and `:1033`.
- Metadata includes canceled commission count, reversed commission count, canceled subscription count, and whether a revoke reason was present.

## Side Effect Ordering

`REVOKE` history is written in the same transaction after the status claim and after commission/subscription cancellation calls. If the status claim fails, no commission cancellation, subscription cancellation, or history write happens.

