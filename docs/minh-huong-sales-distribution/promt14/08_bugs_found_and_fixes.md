# Bugs Found And Fixes

## Actor Summary Missing From Prompt 13

Prompt 13 intentionally returned `actorUserId` only. Prompt 14 adds a safe actor summary so operators no longer need a separate user lookup for common audit review.

## Display Field Decision

`User` has no direct `displayName`. The safe display field is `Profile.displayName`, which is already exposed by existing admin/operator user surfaces. Actor `displayName` may therefore be `null` if a user has no profile display name.

## No Write Bug Fixed

No lifecycle write behavior was changed.

