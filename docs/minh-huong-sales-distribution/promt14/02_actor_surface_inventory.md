# Actor Surface Inventory

## User Model

`apps/api/prisma/schema.prisma`:

- `User.id`
- `User.email`
- `User.passwordHash`
- `User.status`
- `User.suspendReason`
- `User.profile`
- `User.roles`
- `User.childProfiles`
- `User.payments`
- `User.passwordResetTokens`

`User` has no direct `displayName` field.

## Profile Model

`Profile.displayName` is the nearest existing safe display field. It is nullable.

## Existing Admin/Operator Surfaces

Existing channel-admin and audit surfaces already expose safe user identity summaries:

- `id`
- `email`
- `profile.displayName`

Examples:

- `ChannelAdminService.userSelect()`
- `ChannelAdminService.listAuditLogs()`
- activation order `createdBy`/`reviewedBy` includes already expose email and, in some cases, profile display name.

## Prompt 14 Decision

Actor summary exposes only:

- `actor.id`
- `actor.email`
- `actor.displayName` from `Profile.displayName`

If there is no actor relation, `actor` is `null`.

