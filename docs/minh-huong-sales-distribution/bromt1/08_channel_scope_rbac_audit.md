# 08 Channel Scope RBAC Audit

## Role Guards

- [DIRECT] `apps/api/src/auth/roles.guard.ts:17-39` - endpoint roles are enforced by `@Roles`.
- [DIRECT] `apps/api/src/auth/permissions.ts:17-45` - activation order create/view/review roles.
- [DIRECT] `apps/api/src/auth/permissions.ts:47-82` - channel finance/admin/member roles.

Assessment: RBAC exists at route layer.

## Channel Tree

- [DIRECT] `apps/api/prisma/schema.prisma:587-619` - `ChannelParticipant` stores type, user/agency, parent/root, lineage, depth.
- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:1031-1071` - role recruitment rules: director -> manager/agency/sale, manager -> agency/sale, agency -> sale.
- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:1074-1108` - parent participant is selected from parentCode for global manager or actor participant for scoped recruiter.
- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:1125-1136` - allowed parent/child channel types are enforced.
- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:1142-1183` - lineage/root/depth generated when participant is created.

Assessment: core tree model is partial-to-strong.

## Scope Filters

- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:66-120` - non-admin/non-operations list orders by actor participant subtree or createdBy.
- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:841-904` - participants/agencies/users scoped by lineage startsWith.
- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:1010-1028` - target channel user must be descendant and lower depth.
- [DIRECT] `apps/api/src/channel-finance/channel-finance.service.ts:980-1011` - finance scope filters orders, earnings, ledger, payout by participant subtree.
- [DIRECT] `apps/api/src/channel-finance/channel-finance.service.ts:1030-1051` - agency payout access checks agency participant lineage inside actor lineage.

Assessment: code uses subtree/lineage for scope, but commercial scope tests are missing.

## Legacy Compatibility Risk

- [DIRECT] `apps/api/prisma/schema.prisma:568-585` - `AgencyMember` still stores role/referral and related orders.
- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:313-326` - creating channel user may also create `AgencyMember`.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1126-1139` - referral code can resolve through `AgencyMember`.

Assessment: `ChannelParticipant` is source for tree/scope, but `AgencyMember` remains in attribution and management. This is `legacy_unclear` for BA target if no cleanup policy is locked.

## Tests

- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.spec.ts:24-71` - current channel-admin test covers cursor pagination only.
- [MISSING] No test found for director/manager/agency/sale scope, sibling blocking, or order/finance subtree filters.

## Verdict

Status: partial.

Recommended next action: add scope tests before changing channel hierarchy or affiliate attribution.

