# Remaining Gaps And Risks

## Remaining Gaps

- No CSV/export endpoint.
- No frontend report UI.
- No drill-down endpoint beyond the existing Prompt 19 list report.
- No dedicated database-level aggregate indexes beyond existing JSON path usage.
- No currency-specific sort parameter. `approvedAmountCents` sort is rejected when a result contains multiple currencies.

## Residual Risks

- Large datasets aggregate in service memory after scoped filtering. This is acceptable for the narrow Prompt 20 slice, but should be revisited before high-volume production reporting.
- JSON path filters depend on snapshot field consistency from Prompt 18.
- The workspace is not a git repo, so change status cannot be captured with `git status --short`.

## Accepted For This Slice

These are acceptable because Prompt 20 requested a narrow, read-only foundation endpoint and explicitly excluded broader reporting, finance redesign, frontend, and attribution-engine work.
