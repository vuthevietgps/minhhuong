# Scope RBAC Evidence

## Controller RBAC

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:60` exposes the aggregate route.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:61` uses `channelAffiliateViewRoles`, matching the Prompt 19 list endpoint.

## Service Scope

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:331` reuses `affiliateOrderAttributionWhere`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:667` loads `participantScopeWhere`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:669` ANDs the channel participant subtree scope into the activation order query.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:672` and following lines add user filters after scope, so filters cannot bypass scope.

## Scope Test

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:630` starts the aggregate scope test.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:637` verifies sale A sees only sale A.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:646` verifies sale B sees only sale B.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:654` verifies manager A sees only subtree A.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:662` verifies director sees both sale A and sale B.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:671` verifies admin sees both sale A and sale B.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:679` verifies an out-of-scope participant filter returns no data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:690` verifies an unscoped non-admin user receives no data.
