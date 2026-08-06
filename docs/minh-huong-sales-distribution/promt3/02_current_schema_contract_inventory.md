# Current Schema And Contract Inventory

Classification values:

- `PRESENT_AND_KEEP`: existing contract is acceptable as foundation.
- `PRESENT_BUT_NEEDS_EXTENSION`: keep existing object but extend later.
- `LEGACY_COMPATIBILITY`: keep for compatibility, do not expand as new canonical path.
- `MISSING_TARGET`: target capability does not exist.
- `DO_NOT_TOUCH_IN_PROMPT4`: avoid in the next narrow implementation slice.

## Models And Enums

| Item | Evidence | Classification | Notes |
|---|---|---|---|
| `ActivationPackage` | `apps/api/prisma/schema.prisma:785` | `PRESENT_BUT_NEEDS_EXTENSION` | Keep name for MVP. Add entitlement relation/snapshot support later. |
| `ActivationOrder` | `apps/api/prisma/schema.prisma:723` | `PRESENT_BUT_NEEDS_EXTENSION` | Core order source. Needs entitlement snapshot, package relation/id, status history, and idempotency linkage. |
| `ActivationOrderStatus` | `apps/api/prisma/schema.prisma:85` | `PRESENT_BUT_NEEDS_EXTENSION` | Has waiting, pending, approved, rejected, canceled, revoked. Future refund may need `REFUNDED` or refund event status. |
| `Subscription` | `apps/api/prisma/schema.prisma:516` | `PRESENT_BUT_NEEDS_EXTENSION` | Child-based source for learning access. Needs `sourceOrderId`, `activationPackageId`, entitlement snapshot. |
| `Payment` | `apps/api/prisma/schema.prisma:534` | `PRESENT_BUT_NEEDS_EXTENSION` | Manual payment rows exist. Gateway/webhook/reconciliation remains out of Prompt 4A. |
| `ChannelParticipant` | `apps/api/prisma/schema.prisma:587` | `PRESENT_AND_KEEP` | Canonical channel tree and scope source via parent/root/lineage/depth. |
| `AgencyMember` | `apps/api/prisma/schema.prisma:568` | `LEGACY_COMPATIBILITY` | Still used for referral/agency compatibility. Do not expand as canonical tree. |
| `CommissionPolicy` | `apps/api/prisma/schema.prisma:621` | `PRESENT_BUT_NEEDS_EXTENSION` | Add version/effective rules. Current commission calculation does not use version snapshot. |
| `CommissionEarning` | `apps/api/prisma/schema.prisma:640` | `PRESENT_BUT_NEEDS_EXTENSION` | Needs `policyVersionId`, policy/calculation/upline snapshots. |
| `CommissionLedgerEntry` | `apps/api/prisma/schema.prisma:670` | `PRESENT_AND_KEEP` | Ledger-backed commission wallet. Keep as balance source. |
| `PayoutRequest` | `apps/api/prisma/schema.prisma:691` | `PRESENT_BUT_NEEDS_EXTENSION` | Needs status history and idempotency linkage. |
| `AuditLog` | `apps/api/prisma/schema.prisma:835` | `PRESENT_AND_KEEP` | Generic audit. Do not use as the only lifecycle trail. |
| `PackageEntitlement` | missing | `MISSING_TARGET` | Needed for commercial package rights. |
| `OrderStatusHistory` | missing | `MISSING_TARGET` | Needed for reconstructing order lifecycle. |
| `IdempotencyRecord` | missing | `MISSING_TARGET` | Needed for explicit replay/race contract. |
| `CommissionPolicyVersion` | missing | `MISSING_TARGET` | Needed for non-disputable commission calculations. |
| Affiliate/QR models | missing | `DO_NOT_TOUCH_IN_PROMPT4` | Wait for canonical BA v1.1/addendum. |

## API And Service Contracts

| Area | Evidence | Classification | Notes |
|---|---|---|---|
| Activation order routes | `apps/api/src/activation-orders/activation-orders.controller.ts:78` | `PRESENT_BUT_NEEDS_EXTENSION` | Routes cover list/create/resubmit/approve/reject/cancel/revoke. Add idempotency headers later. |
| Self-service routes | `apps/api/src/activation-orders/activation-orders.controller.ts:168` | `PRESENT_BUT_NEEDS_EXTENSION` | Options/create/proof upload exist. Add public idempotency contract later. |
| Activation order service | `apps/api/src/activation-orders/activation-orders.service.ts:207`, `:390`, `:478`, `:527`, `:703`, `:744` | `PRESENT_BUT_NEEDS_EXTENSION` | Prompt 2 fixed claim guards. Add history/idempotency/snapshot later. |
| Commission release | `apps/api/src/activation-orders/activation-orders.service.ts:1389` | `PRESENT_AND_KEEP` | Conditional update already protects CREDIT idempotency. Add policy snapshot before complex policy changes. |
| Channel finance routes | `apps/api/src/channel-finance/channel-finance.controller.ts:70` | `PRESENT_BUT_NEEDS_EXTENSION` | Overview/report/wallet/payout flows exist. Add status history/idempotency later. |
| Payout service | `apps/api/src/channel-finance/channel-finance.service.ts:631`, `:678`, `:754` | `PRESENT_BUT_NEEDS_EXTENSION` | Prompt 2 fixed pay/reject claims. Add explicit idempotency record later. |
| Finance scope | `apps/api/src/channel-finance/channel-finance.service.ts:986` | `PRESENT_AND_KEEP` | Uses `ChannelParticipant.lineage`. Needs DB-backed tests. |
| Channel admin routes | `apps/api/src/channel-admin/channel-admin.controller.ts:37` | `PRESENT_AND_KEEP` | Supports agencies, sale users, policies, packages. |
| Learning access | `apps/api/src/learning/learning.service.ts:1091` | `PRESENT_BUT_NEEDS_EXTENSION` | Reads active subscription. Add entitlement checks after snapshot exists. |

## Prompt 4 Guardrails

- Do not rename `ActivationPackage`.
- Do not remove `AgencyMember`.
- Do not implement affiliate/QR.
- Do not add payment gateway/webhook.
- Prefer a small slice: status history plus idempotency for approve/payout, or subscription traceability.
