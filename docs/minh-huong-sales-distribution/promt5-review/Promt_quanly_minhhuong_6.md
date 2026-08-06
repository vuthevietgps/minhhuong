# Promt_quanly_minhhuong_6.md

Date created: 2026-06-14  
Purpose: Fix blocker after Prompt 5 review FAIL / MISSING_OUTPUTS.  
Mode: implementation-narrow-slice.

## 1. Role

You are Codex working inside the local repo.

Implement the missing subscription traceability slice that Prompt 5 was expected to deliver. Do not treat Prompt 5 as completed. Prompt 6 is a corrective implementation prompt, not a new feature prompt.

## 2. Source Of Truth To Read First

Read these files before editing:

- `docs/minh-huong-sales-distribution/promt5-review/review_ketqua_promt_quanly_minhhuong_5.md`
- `docs/minh-huong-sales-distribution/promt4/ketqua_promt_quanly_minhhuong_4.md`
- `docs/minh-huong-sales-distribution/promt4/ketqua_promt_quanly_minhhuong_4.json`
- `docs/minh-huong-sales-distribution/promt4/04_idempotency_contract_evidence.md`
- `docs/minh-huong-sales-distribution/promt4/05_activation_approval_idempotency_evidence.md`
- `docs/minh-huong-sales-distribution/promt4/07_tests_run.md`
- `docs/minh-huong-sales-distribution/promt3/06_subscription_traceability_design.md`
- `docs/minh-huong-sales-distribution/promt3/10_migration_implementation_plan.md`
- `docs/minh-huong-sales-distribution/promt3/11_acceptance_test_plan.md`
- `docs/minh-huong-sales-distribution/promt2/03_order_subscription_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/04_commission_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/05_payout_scope_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/07_tests_run.md`

## 3. Hard Scope

Implement only subscription traceability:

- `Subscription.sourceOrderId`
- `Subscription.activationPackageId`
- relation/index/migration/backfill needed for those fields
- approval writes those fields on newly created subscriptions
- compatibility with existing `providerRef`
- tests and reports

Do not implement:

- affiliate/QR
- payment gateway/webhook/reconciliation
- package entitlement/snapshot
- entitlement enforcement
- commission policy version engine
- frontend rewrite
- Lead CRM
- RenewalOpportunity
- `AgencyMember` cleanup
- broad model rename or commercial architecture rewrite

## 4. Required Implementation

### 4.1 Schema and Migration

Update Prisma schema so `Subscription` has nullable backward-compatible trace fields:

- `sourceOrderId String?`
- relation from `Subscription.sourceOrderId` to `ActivationOrder.id`
- `activationPackageId String?`
- relation from `Subscription.activationPackageId` to `ActivationPackage.id`
- index for `activationPackageId`
- keep `providerRef String?`

Prefer a nullable unique guard on `sourceOrderId` if it is safe for existing data. If duplicate legacy rows make that risky, document the reason and enforce duplicate prevention in approval logic/tests instead.

Migration rules:

- add fields as nullable first;
- do not drop or rename existing commercial models;
- do not remove `providerRef`;
- backfill `sourceOrderId` only when `Subscription.providerRef = ActivationOrder.id`;
- backfill `activationPackageId` only through `ActivationOrder.packageCode = ActivationPackage.code`;
- leave non-matching rows null;
- do not use fuzzy matching by email, name, price, phone, child, or dates.

### 4.2 Approval Flow

When approving an activation order and creating/updating the subscription:

- keep the current renewal stacking behavior;
- keep `providerRef` behavior compatible with existing code;
- set `sourceOrderId = order.id`;
- set `activationPackageId` when `order.packageCode` resolves to an `ActivationPackage`;
- if package code does not resolve, approval must still succeed with `activationPackageId = null`;
- same-key idempotency replay must not create duplicate subscriptions;
- stale/different-key retry after approval must not create duplicate subscriptions.

### 4.3 Learning Access Compatibility

Learning access must not require the new trace fields.

Tests must prove:

- active legacy subscription with null trace fields still grants access;
- active traced subscription grants access;
- expired/canceled behavior remains unchanged.

If there is no existing learning access test seam, add the narrowest targeted test around the existing service/helper that decides access.

## 5. Required Tests

Run and report at minimum:

```bash
npm --prefix apps/api run prisma:generate
npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts
npm --prefix apps/api test -- --runInBand
npm --prefix apps/api run test:e2e -- --runInBand
npm --prefix apps/api run build
```

Add targeted tests covering:

- newly approved order creates subscription with `sourceOrderId`;
- newly approved order stores `activationPackageId` when package resolves;
- unresolved package does not break approval and leaves `activationPackageId` null;
- `providerRef` is retained;
- renewal stacking is unchanged;
- same-key approve replay does not duplicate subscriptions;
- stale/different-key approve does not duplicate subscriptions;
- legacy and traced learning access both work.

If a command cannot run, report the exact blocker and do not mark Prompt 6 PASS.

## 6. Required Result Packet

Create:

- `docs/minh-huong-sales-distribution/promt6/ketqua_promt_quanly_minhhuong_6.md`
- `docs/minh-huong-sales-distribution/promt6/ketqua_promt_quanly_minhhuong_6.json`
- `docs/minh-huong-sales-distribution/promt6/00_chain_ledger.md`
- `docs/minh-huong-sales-distribution/promt6/01_scope_and_baseline.md`
- `docs/minh-huong-sales-distribution/promt6/02_schema_migration_inventory.md`
- `docs/minh-huong-sales-distribution/promt6/03_subscription_traceability_evidence.md`
- `docs/minh-huong-sales-distribution/promt6/04_backfill_migration_evidence.md`
- `docs/minh-huong-sales-distribution/promt6/05_approval_renewal_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt6/06_learning_access_compatibility_evidence.md`
- `docs/minh-huong-sales-distribution/promt6/07_tests_run.md`
- `docs/minh-huong-sales-distribution/promt6/08_files_changed.md`
- `docs/minh-huong-sales-distribution/promt6/09_bugs_found_and_fixes.md`
- `docs/minh-huong-sales-distribution/promt6/10_remaining_gaps_and_risks.md`
- `docs/minh-huong-sales-distribution/promt6/11_next_prompt_recommendation.md`

The JSON result must be valid JSON and must honestly report tests, files changed, remaining risks, and any skipped/deferred item.

## 7. Acceptance Bar

Prompt 6 can be marked PASS only if:

- source contains both trace fields and compatible relations/migration;
- approval writes trace fields correctly;
- legacy `providerRef` compatibility remains;
- backfill is direct and non-fuzzy;
- learning access remains compatible;
- Prompt 2/4 regression tests pass;
- no hard-banned scope creep is introduced;
- result packet is complete.

