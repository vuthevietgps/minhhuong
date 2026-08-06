# Remaining Gaps And Risks

## Conditional Result Items

- `git status --short` still cannot run because this workspace is not a git repository.
- DB-backed suites still emit the known non-failing `pg` deprecation warning.

## Product/Policy Gaps Left Intentionally

- Prompt 23 does not snapshot the full upline commission chain. Existing commission policy still walks current active parent participants during approval.
- Prompt 23 does not add payout execution or payout dispute controls.
- Prompt 23 does not add first-click/last-click conflict resolution.
- Prompt 23 does not backfill old commission rows.

## Risk

If the business requires fully immutable upline chain attribution, a future prompt should add a dedicated order-time commission policy/chain snapshot. That is broader than Prompt 23 and was not implemented.
