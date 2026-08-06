# Scope RBAC Evidence

Scope model:

- admin and operations: global access;
- channel users: subtree access via `CommissionEarning.participant.lineage`;
- out-of-scope filters cannot bypass scope;
- unscoped non-admin actor returns empty result.

Evidence:

- shared commission where builder: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1293`
- participant scope filter: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2521`
- aggregate scope tests: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1554`

Tested actors:

- sale A sees only sale A commission rows;
- sale B sees only sale B commission rows;
- manager A sees sale A subtree plus manager A row;
- director and operations see all scoped rows;
- out-of-scope participant filter returns empty.
