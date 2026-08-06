# 02 BA Target Map

## BA Inputs

| BA/Input | Status | Evidence |
|---|---|---|
| BA v1.1 affiliate QR canonical | missing | [MISSING] searched repo and `C:\Users\PC\Downloads`; no `ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614-v1.1-affiliate-qr.md`. |
| Affiliate/QR addendum | missing | [MISSING] searched repo and `C:\Users\PC\Downloads`; no `ba-bo-sung-affiliate-link-qr-minh-huong-learning-platform-20260614.md`. |
| Nearest BA | found | [DIRECT] `C:\Users\PC\Downloads\ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614.md` - v1.0. |
| Prompt 1 | found | [DIRECT] `C:\Users\PC\Downloads\bromt1.md` - audit requires v1.1 affiliate/QR scope. |
| ChatGPT review prompt | found | [DIRECT] `C:\Users\PC\Downloads\bromtchatgptweb1.md`. |

## BA Layers Audited

1. Product & Pricing Layer.
2. Customer & Lead Layer.
3. Order & Payment Layer.
4. Subscription & Entitlement Layer.
5. Channel & Attribution Layer.
6. Affiliate Link & QR Attribution Module.
7. Commission & Wallet Layer.
8. Payout Layer.
9. Reporting & Audit Layer.
10. Notification & Cron Layer.
11. Test Coverage.

## BA Acceptance Highlights

| Requirement Theme | Target |
|---|---|
| Product/package | Package has price, duration, visibility, entitlement; order/subscription keeps price/entitlement snapshot. |
| Customer/lead | Parent/customer/child plus lead CRM, owner, duplicate phone/email guard, follow-up status. |
| Order/payment | Self-service and sale-assisted order, proof/invoice, status flow, manual bank transfer, idempotency. |
| Subscription/access | Child subscription, source order/package trace, renewal adds from `max(now,currentExpiresAt)`, learning branch only reads subscription/entitlement. |
| Channel/scope | Multi-level participant tree, subtree RBAC, referral code, sales attribution snapshot, hierarchy audit. |
| Affiliate/QR | Link, QR asset, click, install, customer attribution, `/r/:linkCode`, first-open attribution, funnel report. |
| Commission/wallet | Policy version/snapshot, pending to available release, clawback, ledger-only balance. |
| Payout | Request, hold, approve/reject/mark-paid, proof/status history, no double debit. |
| Reporting/audit | Pipeline/revenue/commission/payout/renewal/affiliate funnel/audit/export. |
| Cron/notification | Order lifecycle, expiry reminders, renewal opportunity, commission release, payout notifications. |
| Tests | P0 smoke flows and idempotency/scope tests. |

