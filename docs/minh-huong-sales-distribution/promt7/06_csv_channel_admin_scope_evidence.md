# CSV And Channel Admin Scope Evidence

## CSV Export

CSV export is reachable directly through `ChannelFinanceService.getOrdersCsv`.

Evidence:

- method entry: `apps/api/src/channel-finance/channel-finance.service.ts:1288`
- scope resolution inside CSV export: `apps/api/src/channel-finance/channel-finance.service.ts:1290`
- approved-order scoped query: `apps/api/src/channel-finance/channel-finance.service.ts:1291-1299`

DB-backed CSV claims:

- manager A CSV contains `p7-order-sale-a`;
- manager A CSV contains `p7-order-agency-a`;
- manager A CSV excludes `p7-order-sale-b`;
- manager A CSV excludes `p7-order-agency-b`;
- admin CSV contains both A and B subtree rows.

Evidence:

- manager A CSV assertions: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:206-213`
- admin CSV assertions: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:242-247`

## Channel Admin

Channel-admin DB-backed scope coverage was deferred in Prompt 7.

Potential stable seams exist:

- `ChannelAdminService` class: `apps/api/src/channel-admin/channel-admin.service.ts:29`
- `listAgencies`: `apps/api/src/channel-admin/channel-admin.service.ts:122`
- `listUsers`: `apps/api/src/channel-admin/channel-admin.service.ts:370`
- `participantScopeWhere`: `apps/api/src/channel-admin/channel-admin.service.ts:839`
- `agencyScopeWhere`: `apps/api/src/channel-admin/channel-admin.service.ts:856`
- `userScopeWhere`: `apps/api/src/channel-admin/channel-admin.service.ts:877`
- `assertCanManageAgency`: `apps/api/src/channel-admin/channel-admin.service.ts:973`
- `assertCanManageUser`: `apps/api/src/channel-admin/channel-admin.service.ts:999`

This is the main optional-surface gap that keeps Prompt 7 at `CONDITIONAL` instead of `PASS`.

