# Mutable Hierarchy Independence Evidence

## End-To-End Test

The test:

- creates a self-service affiliate order;
- stores sale + manager commission chain snapshot at order creation;
- mutates current `channelParticipant.parentParticipantId` before approval;
- approves the order;
- asserts approval does not call `tx.channelParticipant.findUnique`;
- asserts commission rows are for frozen `sale-node-1` and `manager-node-1`, not mutated manager data.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1067`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1127`

## Direct Snapshot Approval Test

Another test approves from a frozen two-item chain and asserts recipients/depth/rates/amounts come from the snapshot.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:775`
