# Scope RBAC Evidence

## Roles

`apps/api/src/channel-affiliate/channel-affiliate.controller.ts`

- endpoint uses `channelAffiliateViewRoles`: line 51

These roles include:

- `ADMIN`
- `DIRECTOR`
- `OPERATIONS`
- `SALE`
- `AGENCY_OWNER`
- `AGENCY_MANAGER`

## Scope

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- `listOrderAttributions` builds scoped where clause: line 184
- `participantScopeWhere` is applied to `channelParticipant`: line 475
- user filters are ANDed with scope, so filters cannot bypass scope

## Test Evidence

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- scoped report test starts: line 345
- sale A sees own order: lines 351-356
- sale B sees own order: lines 359-364
- manager A sees subtree order: lines 367-372
- director sees both branches: lines 375-381
- admin sees both branches: lines 384-389
- sale A filtering sale B participant returns empty: lines 392-399
- unscoped non-admin receives empty result: lines 402-407

## Decision

The report uses current channel lineage for visibility, while historical attribution values come from the immutable order snapshot.
