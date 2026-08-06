# Bugs Found And Fixes

No pre-existing blocking bug was found.

Implementation decisions made during Prompt 26:

- Added a deterministic rejection for `sortBy=totalAmountCents` unless a `currency` filter is present.
- Kept Prompt 25 commission scope strict by using `CommissionEarning.participant.lineage`.
- Mapped existing statuses safely: `AVAILABLE` contributes to released/available aggregate counters, and `CANCELED` contributes to revoked aggregate counters.
