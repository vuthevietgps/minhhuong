# Remaining Gaps And Risks

## No Legacy Backfill

No historical `OrderStatusHistory` rows were generated for orders that already existed before Prompt 12. This is intentional for this narrow slice; old orders remain readable, but their early lifecycle events may be absent.

## Action Names Are Strings

`OrderStatusHistory.action` remains a string field. Prompt 12 did not introduce an enum or schema migration because the existing model was sufficient.

## Existing Test Warning

DB-backed channel tests still emit a non-failing `pg` deprecation warning about `client.query()` while a query is already executing. This was not introduced or fixed in Prompt 12.

## Git Status Unavailable

`git status --short` cannot report file status because `C:\Users\PC\Documents\code\minhhuong` is not a git repository.

