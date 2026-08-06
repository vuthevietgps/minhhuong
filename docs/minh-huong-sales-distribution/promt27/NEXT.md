# Next

## Remaining Gaps

- no payout request workflow;
- no payout execution;
- no frontend UI for commission reports/exports;
- old commission rows without frozen chain snapshot remain `legacy_missing`;
- no async export job or object storage export for very large datasets.

## Risks

- CSV exports are synchronous and capped by limits. This is appropriate for Prompt 27, but high-volume reporting may later need an async export job.
- `git status --short` cannot be used in this workspace because it is not a git repository.
- DB-backed tests still show the known non-failing `pg` deprecation warning.

## Next Prompt Recommendation

Recommended Prompt 28:

Add a read-only payout eligibility summary/foundation report without payout execution.

Suggested constraints:

- summarize eligible commission balances by participant/beneficiary/currency;
- read from existing commission and ledger state only;
- do not create payout requests;
- do not execute payouts;
- do not integrate payment gateways;
- keep audit/privacy/read-only guarantees from Prompts 22-27.
