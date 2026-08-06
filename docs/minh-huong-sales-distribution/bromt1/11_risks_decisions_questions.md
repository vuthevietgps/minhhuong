# 11 Risks Decisions Questions

## Risk Register

| Risk | Severity | Evidence | Mitigation |
|---|---|---|---|
| Canonical BA v1.1/addendum absent | High | [MISSING] files not found in repo/Downloads | Copy canonical BA into repo docs before affiliate implementation. |
| Commercial flow lacks direct tests | High | [MISSING] no activation-orders/channel-finance spec | Make `bromt2` test-hardening. |
| Order approval idempotency not explicit | High | [DIRECT] transaction exists at `apps/api/src/activation-orders/activation-orders.service.ts:614-677`; [MISSING] no idempotency key/test | Add idempotency guard and tests. |
| Package entitlement absent | High | [MISSING] no `PackageEntitlement` model/API | Add entitlement technical spec. |
| Commission policy/version mismatch | High | [DIRECT] `CommissionPolicy` exists at `apps/api/prisma/schema.prisma:621-638`; [DIRECT] calculation hardcoded at `apps/api/src/activation-orders/activation-orders.service.ts:1500-1502` | Add version/snapshot or document fixed chain rule. |
| Payout double-debit race untested | High | [DIRECT] pay creates RELEASE/DEBIT then updates payout at `apps/api/src/channel-finance/channel-finance.service.ts:701-742` | Use conditional update inside transaction and tests. |
| AgencyMember and ChannelParticipant overlap | Medium | [DIRECT] `AgencyMember` and `ChannelParticipant` both present at `apps/api/prisma/schema.prisma:568-619` | Decide migration/compatibility policy. |
| Affiliate/QR absent | Medium | [MISSING] affiliate entities/routes absent | Implement later after P0. |
| Manual payment only | Medium | [DIRECT] manual provider at `apps/api/src/activation-orders/activation-orders.service.ts:620-632`; [MISSING] no webhook/reconciliation | Keep manual for pilot; plan P2 provider integration. |
| Audit lacks status history | Medium | [DIRECT] generic AuditLog exists; [MISSING] no OrderStatusHistory/Payout status history | Add status history entities. |

## Technical / Business Decisions Needed

1. Is `ActivationPackage` the canonical commercial package, or should it be renamed/split as `ProductPackage`?
2. What exact entitlement keys must be enforced in MVP: course access, AI quota, child count, daily minutes, teacher grading, offline?
3. Should subscription have explicit `sourceOrderId` and `packageId`, or is `providerRef` accepted as trace for MVP?
4. Is commission policy fixed chain 40% / 40% of lower-level commission, or admin-configurable policy version?
5. Is payout one-step `pay` acceptable, or must finance approve then mark-paid?
6. What is the rule for revoke after commission has already been paid out?
7. Can a `ChannelParticipant` parent be changed after orders exist?
8. Should `AgencyMember` be kept for compatibility or removed after `ChannelParticipant` migration?
9. Should self-service duplicate prevention include email/phone/package/window?
10. Which payment gateway/provider will be used first?
11. Who owns renewal opportunity: original closer, current agency, or reassignment queue?
12. What is canonical affiliate attribution rule: last-click, first-click, manual override, attribution window?

## Decision Locks For Next Prompt

- Do not start affiliate/QR implementation before P0 tests.
- Do not modify source during audit prompts.
- Do not treat referral code as full affiliate tracking.
- Do not claim policy versioning exists until schema/service has version/effective fields and earning snapshot.

