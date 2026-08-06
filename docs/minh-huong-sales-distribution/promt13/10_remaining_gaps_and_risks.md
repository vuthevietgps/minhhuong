# Remaining Gaps And Risks

## Customer-Facing History Deferred

`GET /me/activation-orders` remains a customer own-order list without lifecycle history. Prompt 13 intentionally did not add customer-facing history because the commercial audit requirement is satisfied through the scoped commercial backend endpoint.

## Actor Summary Deferred

History rows return `actorUserId`. They do not join actor email/display name. This keeps the endpoint minimal and avoids widening PII exposure.

## Action Is Still String

`OrderStatusHistory.action` remains a string field. Prompt 13 did not add an enum or migration.

## Existing Warning Remains

DB-backed channel tests still emit the existing non-failing `pg` deprecation warning.

## Git Status Unavailable

`git status --short` cannot run because `C:\Users\PC\Documents\code\minhhuong` is not a git repository.

