# 01 Repo Map

## Stack Detected

- [DIRECT] `package.json` - root npm scripts for API/web build, test, prisma and DB helpers.
- [DIRECT] `apps/api/package.json` - NestJS 11, Prisma 7, PostgreSQL adapter, Jest, Schedule, Swagger, JWT/passport, nodemailer.
- [DIRECT] `apps/web/package.json` - Next.js 16, React 19, Tailwind, lucide-react.
- [DIRECT] `docker-compose.yml` - PostgreSQL and Redis declared.
- [DIRECT] `apps/api/src/app.module.ts:23-46` - active API modules include ActivationOrders, Billing, ChannelAdmin, ChannelFinance, Parent, Learning, Notifications.

## Main App Areas

| Area | Evidence | Notes |
|---|---|---|
| API | [DIRECT] `apps/api/src/app.module.ts:23-46` | NestJS modular backend. |
| Web | [DIRECT] `apps/web/src/app/admin/orders/page.tsx:244-264`, `apps/web/src/app/admin/finance/page.tsx:188-205`, `apps/web/src/app/admin/packages/page.tsx:102-107` | Route-based admin portal for orders, finance, packages. |
| Database | [DIRECT] `apps/api/prisma/schema.prisma:504-814`, `apps/api/prisma/schema.prisma:835-847` | Prisma models cover billing/order/channel/finance/audit. |
| Docs | [DIRECT] `docs/ba-current-software-assessment.md`, `docs/channel-hierarchy-redesign.md` | Existing BA/current-state docs. |
| Tests | [DIRECT] `rg --files -g '*.spec.ts' -g '*.e2e-spec.ts'` found 7 test files | No direct activation-order/channel-finance spec found. |

## Commercial Modules

| Module | Source Files | Evidence |
|---|---|---|
| Activation orders | `apps/api/src/activation-orders/*` | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:78-183` |
| Channel admin | `apps/api/src/channel-admin/*` | [DIRECT] `apps/api/src/channel-admin/channel-admin.controller.ts:37-207` |
| Channel finance | `apps/api/src/channel-finance/*` | [DIRECT] `apps/api/src/channel-finance/channel-finance.controller.ts:70-160` |
| Billing legacy | `apps/api/src/billing/*` | [DIRECT] `apps/api/src/billing/billing.controller.ts:4-21`, `apps/api/src/billing/billing.service.ts:25-73` |
| Parent/child | `apps/api/src/parent/*` | [DIRECT] `apps/api/src/parent/parent.controller.ts:12-65`, `apps/api/src/parent/parent.service.ts:35-130` |
| Learning access | `apps/api/src/learning/learning.service.ts` | [DIRECT] `apps/api/src/learning/learning.service.ts:1091-1135` |
| Notifications/cron | `apps/api/src/notifications/*`, `apps/api/src/activation-orders/commission-release.job.ts` | [DIRECT] `apps/api/src/notifications/renewal-reminder.job.ts:35-88`, `apps/api/src/activation-orders/commission-release.job.ts:13` |

## Git Status

- [DIRECT] command: `git status --short` - failed with `fatal: not a git repository (or any of the parent directories): .git`.
- [UNKNOWN] Cannot report clean/dirty git status because `C:\Users\PC\Documents\code\minhhuong` is not a Git working tree.

