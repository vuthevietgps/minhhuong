# History Write Implementation Evidence

## Source Evidence

`apps/api/src/activation-orders/activation-orders.service.ts`:

- Sale-assisted create writes `CREATE_SALE_ASSISTED` through nested `statusHistory.create` near line 336.
- Resubmit claims `REJECTED` with `updateMany` near lines 410-411 and writes `RESUBMIT` near lines 431-436.
- Cancel claims cancelable statuses with `updateMany` near lines 496-498 and writes `CANCEL` near lines 506-511.
- Self-service create writes `CREATE_SELF_SERVICE` through nested `statusHistory.create` near line 612.
- Payment proof upload claims `WAITING_PAYMENT`/`PENDING_REVIEW` near line 684 and writes `UPLOAD_PAYMENT_PROOF` near lines 703-708.
- Approval keeps the existing claim and `APPROVE` history near lines 888 and 958-963.
- Reject claims `WAITING_PAYMENT`/`PENDING_REVIEW` near lines 1040-1046 and writes `REJECT` near lines 1057-1062.
- Revoke claims `APPROVED` near lines 1111-1114, cancels commissions/subscription near lines 1133 and 1156, then writes `REVOKE` near lines 1171-1176.

## Transaction Behavior

Mutable lifecycle methods use this order:

1. Load current order and validate caller/status.
2. Start transaction.
3. Claim expected current status using `activationOrder.updateMany`.
4. If `count === 0`, throw before side effects/history.
5. Write order side effects and `OrderStatusHistory`.
6. Refetch with `findUniqueOrThrow`.

Create methods use one `activationOrder.create` call with nested status history so the initial row and initial history commit together.

