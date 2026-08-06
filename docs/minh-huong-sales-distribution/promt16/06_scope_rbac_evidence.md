# Scope RBAC Evidence

## Scope Strategy

Scope uses existing `ChannelParticipant.lineage` subtree semantics.

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- list scope calls `participantScopeWhere`: line 102
- `participantScopeWhere` uses `lineage startsWith actor.lineage`: lines 373-388
- target participant resolution checks subtree access: lines 320-360
- link mutation/QR creation uses `findAccessibleLink`: lines 309-318

Global actors:

- `ADMIN`
- `OPERATIONS`

Scoped actors:

- `DIRECTOR`
- `AGENCY_OWNER`
- `AGENCY_MANAGER`
- `SALE`

Unscoped non-admin actors get empty list and cannot create/manage links.

## Test Evidence

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- sale creates own link: lines 154-195
- sale list excludes sibling link: lines 199-208
- manager A list includes A subtree and excludes B subtree: lines 210-215
- director sees both branches: lines 216-220
- admin sees global rows: lines 221-225
- unscoped non-admin list returns empty: lines 226-228
- sibling update is forbidden: lines 243-251
- sibling QR creation is forbidden: lines 291-298
- admin creates link for target participant: lines 304-310
- unscoped creation is rejected: lines 312-327

## Security Decision

The service allows optional `participantId` owner override only when the target participant is inside the actor subtree, or when the actor is `ADMIN`/`OPERATIONS`.
