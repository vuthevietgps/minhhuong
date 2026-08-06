# Scope RBAC Evidence

## Scope Decision

Prompt 25 uses a stricter scope than affiliate order attribution reports:

- commission report scope is based on `CommissionEarning.participant.lineage`;
- affiliate proof filters are still ANDed with the scope;
- this prevents a lower sale from seeing upline commission rows merely because the affiliate attribution root is in that sale's subtree.

Admin and operations see all.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1118`

## RBAC

The endpoint uses existing `channelAffiliateViewRoles`.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:72`

## Tests

- sale A sees only sale A participant commission rows.
- sale B sees only sale B rows.
- manager sees subtree rows.
- director sees all subtree rows.
- operations sees all.
- out-of-scope participant filter cannot bypass scope.
- unscoped user receives empty data.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1266`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1273`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1280`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1294`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1309`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1314`
