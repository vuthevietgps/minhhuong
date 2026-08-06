# ketquabromt1 - Sales Distribution Audit

Ngay audit: 2026-06-14

## 1. Executive Summary

Verdict: CONDITIONAL.

Repo hien co nen tang MVP thuong mai kha ro: package co gia/thoi han, self-service order, sale-assisted order, operations approve/reject/cancel/revoke, child subscription/access guard, channel tree theo lineage, commission pending/release, wallet ledger, payout va report co evidence truc tiep. Tuy nhien chua dat BA muc tieu day du vi thieu BA canonical v1.1 affiliate-QR, thieu affiliate/QR implementation, thieu package entitlement/snapshot, thieu order status history, thieu idempotency event/key, thieu commission policy version/snapshot, va thieu test P0 cho commercial flows.

Ket luan app: co the pilot noi bo/co kiem soat cho manual sales operation, chua nen mo rong affiliate/payment gateway/scale finance truoc khi harden P0 bang tests.

## 2. Repo/App Stack Detected

- [DIRECT] `package.json` - npm monorepo with API/web scripts.
- [DIRECT] `apps/api/package.json` - NestJS 11, Prisma 7, PostgreSQL adapter, Jest, Schedule, Swagger, JWT/passport, nodemailer.
- [DIRECT] `apps/web/package.json` - Next.js 16, React 19, Tailwind, lucide-react.
- [DIRECT] `apps/api/src/app.module.ts:23-46` - modules include ActivationOrders, ChannelAdmin, ChannelFinance, Billing, Parent, Learning, Notification.
- [DIRECT] `apps/api/prisma/schema.prisma:504-814` - commercial schema models.

## 3. BA Canonical Files Found/Missing

- [MISSING] `ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614-v1.1-affiliate-qr.md` - searched repo and `C:\Users\PC\Downloads`, not found.
- [MISSING] `ba-bo-sung-affiliate-link-qr-minh-huong-learning-platform-20260614.md` - searched repo and `C:\Users\PC\Downloads`, not found.
- [DIRECT] `C:\Users\PC\Downloads\ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614.md` - nearest BA found, version v1.0.
- [DIRECT] `C:\Users\PC\Downloads\bromt1.md` - requires audit against v1.1 affiliate/QR scope; this audit treats affiliate/QR as target scope from prompt and records missing canonical BA.

## 4. Current Commercial Capability Score

| Layer | Score | Status | Rationale |
|---|---:|---|---|
| Product & Pricing | 2/5 | partial | `ActivationPackage` CRUD exists; entitlement/snapshot missing. |
| Customer & Lead | 2/5 | partial | Parent/child/customer order data exists; Lead CRM missing. |
| Order & Payment | 3/5 | partial | Manual order/proof/approval works; idempotency/gateway/status history missing. |
| Subscription & Entitlement | 3/5 | partial | Child subscription and learning access guard exist; entitlement/source/package contract missing. |
| Channel & Attribution | 3/5 | partial | Channel tree/scope exists; legacy `AgencyMember` and snapshot gaps remain. |
| Affiliate Link & QR | 0/5 | missing | No affiliate entities/routes/events. |
| Commission & Wallet | 3/5 | partial | Chain earnings/release/ledger exist; policy version/snapshot/tests missing. |
| Payout | 3/5 | partial | HOLD/pay/reject ledger exists; no approval step/status history/idempotency test. |
| Reporting & Audit | 3/5 | partial | Channel report/CSV/AuditLog exist; renewal/affiliate/status history gaps. |
| Notification & Cron | 3/5 | partial | Order emails, expiry reminder 7/3, digest, hourly commission release; renewal opportunity/payout notification missing. |
| Test Coverage | 1/5 | partial | Existing tests pass but do not cover commercial P0 flows. |

## 5. Current Capability Matrix

| BA requirement | Current evidence | Status | Gap | Priority | Recommended next action |
|---|---|---|---|---|---|
| Admin package CRUD and public package options | [DIRECT] `apps/api/prisma/schema.prisma:785-798`; [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:747-789`; [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:53-63` | partial | No entitlement model, no true archive/public/private beyond `isActive`. | P0 | Specify package entitlement + snapshot. |
| Self-service order | [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:390-476`; [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:478-524` | implemented | Missing duplicate guard/idempotency/affiliate attribution. | P0 | Add tests and idempotency. |
| Sale-assisted order | [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:208-297` | partial | No status history/idempotency key; custom overrides under-modeled. | P0 | Add smoke tests. |
| Approve creates payment/subscription/commission | [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:527-677`; [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1182-1304` | partial | No explicit idempotency test; subscription lacks source/package contract. | P0 | Test and harden. |
| Learning access reads subscription | [DIRECT] `apps/api/src/learning/learning.service.ts:1091-1135`; [DIRECT] `apps/api/src/auth/auth.service.ts:236-305` | partial | Entitlement and quota not enforced. | P0 | Add entitlement spec later. |
| Channel tree and scope | [DIRECT] `apps/api/prisma/schema.prisma:587-619`; [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:1031-1183`; [DIRECT] `apps/api/src/channel-finance/channel-finance.service.ts:980-1011` | partial | No tests; legacy `AgencyMember` still active. | P0/P1 | Add scope tests and cleanup plan. |
| Referral code | [DIRECT] `apps/api/src/activation-orders/dto/create-self-service-activation-order.dto.ts:24-31`; [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1105-1158` | partial | Referral is not affiliate funnel tracking; no attribution snapshot. | P1 | Add sales attribution snapshot. |
| Affiliate link/QR | [MISSING] no affiliate link/QR/click/install/customer attribution models/routes | missing | Entire module absent. | P2 | Defer until P0 hardening. |
| Commission release | [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1381-1434`; [DIRECT] `apps/api/src/activation-orders/commission-release.job.ts:13` | partial | Idempotency promising but untested; policy version missing. | P0/P1 | Add release tests and policy spec. |
| Payout | [DIRECT] `apps/api/src/channel-finance/channel-finance.service.ts:631-784` | partial | No approve step/status history; double debit race untested. | P0 | Add payout tests and conditional update guard if needed. |
| Reports/audit | [DIRECT] `apps/api/src/channel-finance/channel-finance.controller.ts:75-107`; [DIRECT] `apps/api/prisma/schema.prisma:835-847`; [DIRECT] `apps/web/src/app/admin/audit/page.tsx:64-75` | partial | No affiliate/renewal/status history reports. | P1/P2 | Expand after data models. |

Full matrix: `03_current_capability_matrix.md`.

## 6. P0 Gap List

1. Commercial P0 tests missing: no activation-orders/channel-finance smoke/idempotency/scope specs.
2. Order status history missing.
3. Explicit idempotency for order create/proof/approve missing.
4. Subscription lacks explicit `sourceOrderId`/`packageId`/entitlement snapshot.
5. Package entitlement model missing.
6. Payout paid idempotency/concurrency unproven.
7. Channel subtree scope has no direct tests.

## 7. P1/P2/P3 Gap List

P1:

- Lead CRM missing.
- Commission policy version/snapshot missing.
- Renewal opportunity missing.
- `AgencyMember` legacy cleanup unresolved.
- Payout status history/approve step missing.

P2:

- Affiliate link/QR module missing.
- Payment gateway/webhook/reconciliation missing.
- Affiliate funnel report missing.

P3:

- Advanced churn/renewal analytics missing.
- Payout batch/accounting export missing.
- Advanced anti-fraud duplicate detection missing.

## 8. Affiliate Link/QR Gap

Status: missing.

Evidence:

- [MISSING] no `AffiliateLink`, `AffiliateQrAsset`, `AffiliateClickEvent`, `AppInstallAttribution`, `CustomerAttribution`, `SalesAttributionSnapshot`, `linkCode`, `installReferrer`, or `/r/:linkCode`.
- [DIRECT] only referral evidence exists: `apps/api/prisma/schema.prisma:575`, `apps/api/src/activation-orders/activation-orders.service.ts:1105-1158`.

Conclusion: current referral code is not affiliate/QR attribution. It attaches attribution at order creation, but does not capture clicks/scans/install/register/order funnel.

## 9. Channel Hierarchy/Scope Gap

Status: partial.

Evidence:

- [DIRECT] `apps/api/prisma/schema.prisma:587-619` - participant tree fields.
- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.ts:1031-1183` - recruit rules and lineage generation.
- [DIRECT] `apps/api/src/channel-finance/channel-finance.service.ts:980-1011` - report/wallet/payout scoped by subtree.
- [MISSING] no tests for sibling/out-of-scope access.
- [DIRECT] `apps/api/prisma/schema.prisma:568-585` and `apps/api/src/channel-admin/channel-admin.service.ts:313-326` - `AgencyMember` remains active.

## 10. Commission/Wallet/Payout Gap

Status: partial.

Evidence:

- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1182-1304` - pending commission chain.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1381-1434` - release job logic with conditional update before ledger credit.
- [DIRECT] `apps/api/src/channel-finance/channel-finance.service.ts:789-824` - wallet summary from ledger entries.
- [DIRECT] `apps/api/src/channel-finance/channel-finance.service.ts:631-784` - payout HOLD, pay RELEASE/DEBIT, reject RELEASE.

Gaps:

- No policy version/effective date/snapshot.
- No direct tests for release idempotency or payout idempotency.
- No payout status history.
- Legacy `WalletLedgerEntry` and commission ledger coexist; naming needs documentation.

## 11. Subscription/Access Contract Gap

Status: partial.

Evidence:

- [DIRECT] `apps/api/prisma/schema.prisma:516-532` - child-based Subscription.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:601-644` - approve creates subscription from current expiry or now.
- [DIRECT] `apps/api/src/learning/learning.service.ts:1091-1135` - learning access requires active child subscription.

Gaps:

- No package entitlement model.
- No source order relation except overloaded `providerRef`.
- No package relation on subscription.
- No AI/course/daily minutes/teacher grading/offline entitlement enforcement.

## 12. Test Coverage And Commands Run

- [DIRECT] `npm --prefix apps/api test -- --runInBand` - passed 6 suites, 20 tests.
- [DIRECT] `npm --prefix apps/api run test:e2e -- --runInBand` - passed 1 suite, 1 test.
- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.spec.ts:24-71` - only pagination in channel-admin.
- [DIRECT] `apps/api/src/learning/learning.service.spec.ts:176-225` - learning subscription/device tests.
- [MISSING] no activation-orders/channel-finance commercial tests.
- [SKIPPED] lint not run because script uses `--fix` and can edit source.

## 13. Risk Register

See `11_risks_decisions_questions.md`.

Top risks:

1. Missing commercial tests.
2. Missing BA v1.1/addendum.
3. Missing affiliate/QR module.
4. Missing entitlement and status history.
5. Unproven idempotency in order approval/payout.

## 14. Business Decisions Still Needed

1. ActivationPackage vs ProductPackage canonical naming.
2. Package entitlement keys and enforcement point.
3. Subscription trace fields.
4. Commission policy versioning vs fixed chain formula.
5. Payout approve/pay policy.
6. Revoke after paid commission policy.
7. Channel parent mutation rules.
8. Affiliate attribution rule and window.

## 15. Proposed Implementation Roadmap

1. `bromt2`: test-hardening for P0 commercial flows.
2. `bromt3`: technical spec for entitlement, status history, source order/package, idempotency.
3. `bromt4`: implement smallest P0 hardening slice.
4. `bromt5`: affiliate/QR spec after canonical BA v1.1/addendum is present.

## 16. Recommended `bromt2.md` Direction

Recommended type: `test-hardening`.

Scope:

- self-service order -> proof -> approve -> child subscription;
- sale order -> approve -> pending commission;
- commission release idempotency;
- payout hold/pay/reject ledger;
- channel subtree scope tests.

Reason: code has functional implementation, but finance/order correctness is not proven by tests. Affiliate/QR should wait.

## 17. Files Created/Changed By This Audit

Created under `docs/minh-huong-sales-distribution/bromt1/`:

- `ketquabromt1.md`
- `ketquabromt1.json`
- `00_chain_ledger.md`
- `01_repo_map.md`
- `02_ba_target_map.md`
- `03_current_capability_matrix.md`
- `04_gap_matrix_p0_p1_p2_p3.md`
- `05_api_route_inventory.md`
- `06_db_entity_schema_inventory.md`
- `07_order_subscription_commission_flow_audit.md`
- `08_channel_scope_rbac_audit.md`
- `09_affiliate_qr_attribution_gap.md`
- `10_tests_run.md`
- `11_risks_decisions_questions.md`
- `12_next_bromt_recommendation.md`

No product source, schema, migration, or test file was edited.

## 18. Git Status Before/After

- Before: [DIRECT] command `git status --short` failed with `fatal: not a git repository (or any of the parent directories): .git`.
- After: [DIRECT] command `git status --short` failed with `fatal: not a git repository (or any of the parent directories): .git`.
