# Chain Ledger - bromt1

Ngay tao: 2026-06-14

## 1. Project And Branch

- Project: Minh Huong Learning Platform.
- Branch nghiep vu: Commercial Distribution Branch.
- Pham vi dai han: ban truc tiep, sale noi bo, dai ly nhieu cap, affiliate link/QR, order, payment, subscription, commission, wallet, payout, renewal, report, audit.

## 2. Canonical BA Used

- [MISSING] `ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614-v1.1-affiliate-qr.md` - da tim trong repo va `C:\Users\PC\Downloads`, chua thay file v1.1.
- [MISSING] `ba-bo-sung-affiliate-link-qr-minh-huong-learning-platform-20260614.md` - da tim trong repo va `C:\Users\PC\Downloads`, chua thay addendum rieng.
- [DIRECT] `C:\Users\PC\Downloads\ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614.md` - BA gan nhat tim thay, version v1.0.
- [DIRECT] `C:\Users\PC\Downloads\bromt1.md` - prompt audit yeu cau them pham vi affiliate/QR v1.1; audit nay doi chieu v1.0 + pham vi affiliate/QR trong prompt.
- [DIRECT] `C:\Users\PC\Downloads\bromtchatgptweb1.md` - review rule cho ket qua bromt1.

## 3. Prompt 1 Scope

No-code audit. Khong sua source, migration, schema, route, test san pham. Chi tao file report trong `docs/minh-huong-sales-distribution/bromt1/`.

## 4. Repo/App Detected

- [DIRECT] `package.json` - root npm monorepo scripts cho api/web.
- [DIRECT] `apps/api/package.json` - NestJS 11, Prisma 7, Jest, PostgreSQL adapter, Schedule, Swagger.
- [DIRECT] `apps/web/package.json` - Next.js 16, React 19, Tailwind, lucide-react.
- [DIRECT] `apps/api/prisma/schema.prisma:77-162` - enums subscription/order/payment/channel/commission/payout.
- [DIRECT] `apps/api/src/app.module.ts:23-46` - modules: ActivationOrders, ChannelAdmin, ChannelFinance, Billing, Parent, Learning, Notification.

## 5. Modules With Direct Evidence

- Product/pricing: `ActivationPackage` + admin package APIs.
- Customer/parent/child: `User`, `ChildProfile`, parent APIs.
- Orders/payment: sale-assisted and self-service activation orders, manual bank transfer, proof/invoice upload.
- Subscription/access: order approval creates child subscription; learning guard reads subscription.
- Channel hierarchy/scope: `ChannelParticipant` tree with lineage/depth/subtree filters.
- Commission/wallet: `CommissionEarning`, `CommissionLedgerEntry`, release cron, wallet summary from ledger.
- Payout: `PayoutRequest`, hold/release/debit flow.
- Reporting/audit: channel report, CSV, audit log page/API.
- Notifications/cron: order lifecycle email, expiry reminder, weekly digest, hourly commission release.

## 6. Modules Missing Or Insufficient Evidence

- Affiliate link/QR tracking module: missing.
- Lead CRM: missing.
- Package entitlement model and entitlement snapshot: missing.
- Order status history entity/API: missing.
- Payment gateway/webhook/reconciliation/idempotency event: missing.
- Commission policy version/snapshot: missing.
- Renewal opportunity entity/cron/report: missing.
- Commercial smoke tests: missing.

## 7. Decisions Not To Break

1. Order is the commercial source of truth.
2. Subscription is the learning access source of truth.
3. Financial balance changes must flow through ledger entries.
4. Commission is generated only after order approval, not from click/install/register.
5. Channel scope must use participant subtree/lineage.
6. Prompt 1 is no-code; implementation belongs to later prompts.

## 8. Open Blockers / Business Questions

- Canonical BA v1.1 affiliate-QR file is absent.
- Addendum affiliate/QR is absent.
- Decide whether next prompt hardens P0 order/subscription/commission tests before affiliate implementation.
- Decide whether `AgencyMember` remains compatibility only or must be migrated out.
- Decide package entitlement scope: course access, AI quota, child count, daily minutes, teacher grading, offline access.

## 9. Recommended Prompt Sequence

1. `bromt2.md`: test-hardening/audit-fix for commercial P0 flows.
2. `bromt3.md`: technical spec for package entitlement + order status history + idempotency.
3. `bromt4.md`: implementation P0 hardening in a narrow slice.
4. Later: affiliate link/QR attribution after P0 order/subscription/commission/payout is proven by tests.

## 10. Files Created By Prompt 1

- `docs/minh-huong-sales-distribution/bromt1/ketquabromt1.md`
- `docs/minh-huong-sales-distribution/bromt1/ketquabromt1.json`
- `docs/minh-huong-sales-distribution/bromt1/00_chain_ledger.md`
- `docs/minh-huong-sales-distribution/bromt1/01_repo_map.md`
- `docs/minh-huong-sales-distribution/bromt1/02_ba_target_map.md`
- `docs/minh-huong-sales-distribution/bromt1/03_current_capability_matrix.md`
- `docs/minh-huong-sales-distribution/bromt1/04_gap_matrix_p0_p1_p2_p3.md`
- `docs/minh-huong-sales-distribution/bromt1/05_api_route_inventory.md`
- `docs/minh-huong-sales-distribution/bromt1/06_db_entity_schema_inventory.md`
- `docs/minh-huong-sales-distribution/bromt1/07_order_subscription_commission_flow_audit.md`
- `docs/minh-huong-sales-distribution/bromt1/08_channel_scope_rbac_audit.md`
- `docs/minh-huong-sales-distribution/bromt1/09_affiliate_qr_attribution_gap.md`
- `docs/minh-huong-sales-distribution/bromt1/10_tests_run.md`
- `docs/minh-huong-sales-distribution/bromt1/11_risks_decisions_questions.md`
- `docs/minh-huong-sales-distribution/bromt1/12_next_bromt_recommendation.md`

