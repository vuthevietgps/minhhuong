# 04 Gap Matrix P0-P3

## P0 Gaps

| Gap | Evidence | Risk | Recommended Action |
|---|---|---|---|
| Missing commercial smoke tests for order -> approve -> subscription and sale order -> commission -> payout | [MISSING] `rg -n "ActivationOrder|activation-orders|commission|payout" apps/api/src apps/api/test -g '*spec.ts'` found no activation-orders/channel-finance spec; [DIRECT] tests passed only existing suites. | Regression in paid flow can ship unnoticed. | `bromt2.md` should add tests before implementation. |
| No order status history entity/API | [MISSING] search for `OrderStatusHistory`, `fromStatus`, `toStatus` returned no implementation. | Disputes/audit cannot reconstruct transitions beyond current row + AuditLog. | Specify and implement status history after test baseline. |
| Approve/payment proof lacks explicit idempotency key/event | [DIRECT] approve transaction exists at `apps/api/src/activation-orders/activation-orders.service.ts:614-677`; [MISSING] search for `idempot` in commercial source returned no implementation. | Double submit/race can create duplicate payment/subscription if concurrency bypasses pre-check. | Add idempotency contract and tests. |
| Subscription lacks package/source-order contract fields | [DIRECT] `apps/api/prisma/schema.prisma:516-532`; [DIRECT] approve stores order id in `providerRef` at `apps/api/src/activation-orders/activation-orders.service.ts:635-643`. | Commercial traceability relies on overloaded providerRef and order package snapshot only. | Add explicit `sourceOrderId`, `packageId` or equivalent spec. |
| Package entitlement missing | [MISSING] search for `PackageEntitlement`, entitlement keys, `courseAccess`, `AI quota` returned no model/API. | Learning cannot enforce package-level feature/course/quota rights. | Technical spec for entitlement and snapshot. |
| Payout paid idempotency/concurrency unproven | [DIRECT] `apps/api/src/channel-finance/channel-finance.service.ts:688-742`; no test around repeated pay. | Concurrent pay can create duplicate ledger if race is not guarded inside transaction. | Add transactional status update guard and test. |
| Scope/RBAC has no commercial tests | [DIRECT] scope code uses lineage in `apps/api/src/channel-finance/channel-finance.service.ts:980-1011`; [MISSING] no scope tests for activation-orders/channel-finance. | Data leakage across sales subtree. | Add sale/agency/director scope tests. |

## P1 Gaps

| Gap | Evidence | Risk | Recommended Action |
|---|---|---|---|
| Lead CRM missing | [MISSING] search for `model Lead`, `sales/leads`, lead status fields found no implementation. | Sales follow-up and lost reason not tracked. | Add lightweight Lead after P0. |
| Commission policy version/snapshot missing | [DIRECT] `CommissionPolicy` fields at `apps/api/prisma/schema.prisma:621-638`; [DIRECT] commission calculation ignores policy rows at `apps/api/src/activation-orders/activation-orders.service.ts:1500-1502`. | Policy changes can be disputed; formula not traceable. | Add policy version/snapshot design. |
| `AgencyMember` legacy still active beside `ChannelParticipant` | [DIRECT] `apps/api/prisma/schema.prisma:568-619`; [DIRECT] channel service still creates agency memberships at `apps/api/src/channel-admin/channel-admin.service.ts:313-326`. | Scope and attribution ambiguity. | Plan compatibility cleanup. |
| Renewal opportunity missing | [MISSING] search for `RenewalOpportunity` returned no implementation; [DIRECT] reminder only sends emails at `apps/api/src/notifications/renewal-reminder.job.ts:41-83`. | Renewal pipeline cannot be owned by sale/agency. | Add RenewalOpportunity spec. |
| Payout status history/approval step missing | [DIRECT] payout controller has pay/reject only at `apps/api/src/channel-finance/channel-finance.controller.ts:134-159`; [MISSING] no status history model. | Finance operations less auditable. | Decide one-step pay vs approve + pay. |

## P2 Gaps

| Gap | Evidence | Risk | Recommended Action |
|---|---|---|---|
| Affiliate link/QR module missing | [MISSING] no `AffiliateLink`, `AffiliateQrAsset`, `AffiliateClickEvent`, `AppInstallAttribution`, `CustomerAttribution`, `/r/:linkCode`. | Cannot run affiliate/QR acquisition. | Implement only after P0 hardening. |
| Payment gateway/webhook/reconciliation missing | [DIRECT] `Payment` model exists at `apps/api/prisma/schema.prisma:534-547`; [MISSING] no `PaymentTransaction`, `PaymentWebhookEvent`, `ReconciliationBatch`. | Manual ops will not scale. | Technical spec for provider idempotency/reconciliation. |
| Affiliate funnel report missing | [DIRECT] channel report exists; [MISSING] no affiliate event models. | Cannot measure click/install/register/order/approved. | Add after affiliate data model. |

## P3 Gaps

| Gap | Evidence | Risk | Recommended Action |
|---|---|---|---|
| Advanced reporting/churn/renewal rate absent | [DIRECT] report covers current channel finance at `apps/api/src/channel-finance/channel-finance.service.ts:83-120`; [MISSING] no churn/renewal opportunity model. | Limited executive analytics. | Build after renewal model. |
| Payout batch/accounting export absent | [DIRECT] CSV is approved-orders only at `apps/api/src/channel-finance/channel-finance.controller.ts:90-101`. | Finance ops remain manual. | Add accounting export after ledger semantics are locked. |
| Anti-fraud/duplicate advanced checks absent | [DIRECT] duplicate guard is narrow at `apps/api/src/activation-orders/activation-orders.service.ts:215-232`. | Fraud/manual duplicate risk. | Add after core idempotency. |

