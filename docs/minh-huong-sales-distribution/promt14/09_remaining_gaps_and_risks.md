# Remaining Gaps And Risks

## Nullable Display Name

`actor.displayName` can be `null` because `Profile.displayName` is nullable and `User` has no direct display name.

## Customer-Facing History Deferred

`GET /me/activation-orders` remains a customer own-order list without status history or actor summaries.

## Existing Warning Remains

DB-backed channel tests still emit the existing non-failing `pg` deprecation warning. This is why the Prompt 14 verdict is `CONDITIONAL`.

## Git Status Unavailable

`git status --short` cannot run because `C:\Users\PC\Documents\code\minhhuong` is not a git repository.

