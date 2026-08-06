# Remaining Gaps And Risks

Remaining gaps:

- no commission CSV/export endpoint yet;
- no payout request or payout execution flow;
- no frontend UI for commission aggregate reports;
- old commission rows without frozen chain snapshots remain `legacy_missing`.

Risk notes:

- Aggregate is computed in service memory for this narrow slice. This is acceptable for Prompt 26 but can be revisited if report volume grows.
- `git status --short` cannot be used for change inventory because this workspace is not a git repository.
