# Scope And Baseline

Baseline: Prompt 25 accepted with `GET /v1/channel-affiliate/commissions`.

Prompt 26 scope:

- add one read-only JSON aggregate endpoint;
- reuse Prompt 25 filters and commission scope;
- audit report access with safe metadata;
- preserve all previous tests.

Commission scope remains stricter than order attribution scope:

- scope by `CommissionEarning.participant.lineage`;
- proof filters are ANDed with scope;
- admin and operations can see all;
- scoped channel users see only commission rows in their subtree;
- unscoped non-admin users receive empty data by existing convention.
