# Remaining Gaps And Risks

## Remaining Gaps

- No async export job.
- No object storage for large export files.
- No frontend report UI.
- No dedicated report read model table.
- No database materialized view for high-volume aggregates.
- No currency-specific aggregate sort parameter.

## Residual Risks

- List CSV export is sync and capped at 1000 rows.
- Aggregate export reuses in-memory aggregation from Prompt 20 after scoped filtering.
- Very large reporting volumes should get a separate optimized read model later.
- The workspace is not a git repository, so `git status --short` cannot provide a change summary.

## Accepted For This Slice

These are acceptable because Prompt 21 asked for a narrow sync CSV/read model layer and explicitly avoided async jobs unless a local pattern already existed.
