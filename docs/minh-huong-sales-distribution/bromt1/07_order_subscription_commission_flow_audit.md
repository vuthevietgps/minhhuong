# 07 Order Subscription Commission Flow Audit

## Self-Service Order Flow

- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:390-403` - active packages loaded from `ActivationPackage`, fallback packages if DB empty.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:405-425` - parent account and first child profile are created/fetched.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:427-450` - manual bank transfer info and unique transfer content are stored on order.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:431-452` - order is created as `SELF_SERVICE` + `WAITING_PAYMENT`.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:478-524` - proof upload requires file, email match, self-service source, and changes status to `PENDING_REVIEW`.
- [MISSING] No self-service duplicate pending order guard was found.

Status: partial.

## Sale-Assisted Order Flow

- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:215-232` - duplicate guard blocks same creator/customer email in WAITING/PENDING within 48 hours.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:234-247` - existing user is reused without password reset; new account gets generated or supplied password.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:248-267` - channel/agency/referrer attribution resolved into order fields.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:261-288` - order created as `SALE_ASSISTED` + `PENDING_REVIEW`.
- [DIRECT] `apps/api/src/activation-orders/dto/create-activation-order.dto.ts:14-70` - amount, phone, package, agency code, duration and notes are accepted.

Status: partial.

Gaps: no order status history, no idempotency key, custom amount/duration reason is not strongly modeled.

## Approval Flow

- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:527-535` - approve requires operation invoice.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:572-576` - only `PENDING_REVIEW` order can be approved.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:601-611` - renewal starts from latest active subscription expiry if present, otherwise now.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:614-677` - approval runs in Prisma transaction; activates user, creates `Payment`, creates `Subscription`, creates `WalletLedgerEntry`, creates commission entries, updates order to `APPROVED`.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:679-690` - audit and approved email are sent.

Status: partial.

Gaps: no explicit idempotency key/test; subscription source is `providerRef`, not `sourceOrderId`; no entitlement/package relation on subscription.

## Reject/Cancel/Revoke

- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:700-724` - reject only WAITING/PENDING and writes audit.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:352-379` - cancel allowed for WAITING/PENDING/REJECTED with ownership/scope checks.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:736-824` - revoke requires APPROVED, cancels commission earnings, debits available commission ledger, cancels subscription created from order, marks order REVOKED and emails customer.

Status: partial.

Gaps: no REFUNDED path; no clawback entity; no status history; concurrent edge cases untested.

## Commission Creation

- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1182-1225` - commission entry creation is skipped if earnings already exist for order.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1227-1260` - chain follows participant parent up to 4 levels and creates earnings by depth.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1289-1303` - earnings start `PENDING` with `availableAt`.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1500-1502` - commission rate is hardcoded as `4000 * 0.4^depth`.
- [INFERRED] `CommissionPolicy` exists, but current approval calculation does not use policy version/snapshot evidence. Confidence: high.

Status: partial.

## Commission Release

- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1381-1394` - finds due pending earnings.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1399-1406` - cancels due earnings if order no longer approved.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1409-1434` - transaction conditionally updates `PENDING` to `AVAILABLE`; only if update count > 0, creates ledger `CREDIT`.
- [DIRECT] `apps/api/src/activation-orders/commission-release.job.ts:13` - hourly cron calls release.

Status: partial.

Gap: idempotency design is promising but lacks tests.

## Learning Access Contract

- [DIRECT] `apps/api/src/learning/learning.service.ts:1091-1135` - parent/student access checks child profile ownership and active subscription dates/status.
- [DIRECT] `apps/api/src/auth/auth.service.ts:236-305` - student login checks child subscriptions and expires/suspends user if expired.

Status: partial.

Gap: no package entitlement contract; admin/director/teacher/content/support bypass learning access.

