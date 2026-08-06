# Scope RBAC Evidence

## RBAC

Both export routes use the same view roles as the JSON reports:

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:70` applies `channelAffiliateViewRoles` to list export.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:93` applies `channelAffiliateViewRoles` to aggregate export.

## Scope

Both exports reuse `affiliateOrderAttributionWhere`:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:367` list export calls `affiliateOrderAttributionWhere`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:397` aggregate JSON, reused by aggregate CSV, calls `affiliateOrderAttributionWhere`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:749` defines `affiliateOrderAttributionWhere`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:757` loads `participantScopeWhere`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:759` ANDs channel participant subtree scope into the order query.

## Scope Tests

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:849` starts the CSV scope test.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:859` verifies sale A list export includes sale A data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:860` verifies sale A list export excludes sale B data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:866` verifies sale B list export includes sale B data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:867` verifies sale B list export excludes sale A data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:875` verifies manager A aggregate export includes sale A.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:876` verifies manager A aggregate export excludes sale B.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:884` verifies director aggregate export sees both.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:889` verifies admin list export sees sale A.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:890` verifies admin list export sees sale B.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:899` verifies out-of-scope filters return header-only CSV.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:906` verifies unscoped non-admin aggregate export returns header-only CSV.
