# Commission Policy Version And Snapshot Design

## Current State

- `CommissionPolicy` exists at `apps/api/prisma/schema.prisma:621`.
- `CommissionEarning.policyId` exists at `apps/api/prisma/schema.prisma:640`.
- Current calculation uses a hardcoded depth formula in `apps/api/src/activation-orders/activation-orders.service.ts:1512`.

## Decision

Keep `CommissionPolicy` as the policy family/header. Add `CommissionPolicyVersion` for immutable effective rules. Do not replace current earning/ledger models.

## Proposed Schema

### `CommissionPolicyVersion`

- `id`
- `policyId` -> `CommissionPolicy.id`
- `version`
- `effectiveFrom`
- `effectiveTo` nullable
- `status` (`DRAFT`, `ACTIVE`, `RETIRED`)
- `rulesJson`
- `createdById` nullable -> `User.id`
- `createdAt`

Recommended indexes:

- unique `(policyId, version)`.
- index `(status, effectiveFrom, effectiveTo)`.

### `CommissionEarning` Extensions

- `policyVersionId` nullable -> `CommissionPolicyVersion.id`
- `policySnapshotJson`
- `calculationBasisJson`
- `uplineSnapshotJson`

## Snapshot Content

`policySnapshotJson`:

```json
{
  "policyCode": "default-chain",
  "version": 1,
  "rules": {
    "type": "DEPTH_RATE",
    "maxDepth": 4,
    "ratesBpsByDepth": [4000, 1600, 640, 256]
  }
}
```

`calculationBasisJson`:

```json
{
  "activationOrderId": "order_...",
  "baseAmountCents": 10000000,
  "currency": "VND",
  "depth": 1,
  "rateBps": 1600,
  "amountCents": 1600000
}
```

`uplineSnapshotJson`:

```json
{
  "participantId": "node_...",
  "type": "MANAGER",
  "userId": "user_...",
  "agencyId": null,
  "lineage": "/root/manager/sale/",
  "depthAtApproval": 1
}
```

## Default Version For Existing Formula

Create a default policy version equivalent to current code:

- depth 0: 4000 bps.
- depth 1: 1600 bps.
- depth 2: 640 bps.
- depth 3: 256 bps.
- max depth: 4.

This can be represented explicitly in `rulesJson` rather than recomputed from code. The service should read the active version at approval time and copy the rule snapshot to every earning.

## Multi-Level Future Support

Future rules should support:

- depth-based rates.
- participant-type-specific rates.
- agency overrides.
- fixed amount bonuses.
- caps/floors.
- hold period per policy.
- eligibility filters.

Do not implement a complex engine in the first slice. Start by snapshotting the current equivalent policy.

## Revoke, Refund, Clawback

- Earning snapshots must never change after order approval.
- Revoke/refund uses the original earning rows and snapshots to calculate reversal/clawback.
- If the commission has already been paid out, Prompt 4+ should create explicit clawback ledger entries rather than mutating original earned rows.

## Acceptance Criteria

- Changing active policy does not alter old earnings.
- Every new earning has `policyVersionId` or a legacy-null reason.
- Every new earning has policy, calculation, and upline snapshots.
- Commission release reads earning amount, not current policy.
- Revoke/clawback can explain why the amount was created.
