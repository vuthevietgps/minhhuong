# Bugs Found And Fixes

## Gap 1: No Read-Only Affiliate Commission Report

Before Prompt 25, operations/admin/channel roles could inspect order attribution reports but not commission rows from immutable commission proof.

Fix:

- Added `GET /v1/channel-affiliate/commissions`.

## Gap 2: Legacy Chain Status Was Not Reportable

Prompt 24 introduced `legacy_missing`, but there was no read surface to distinguish frozen vs legacy commission rows.

Fix:

- Exposed `affiliateProof.commissionChainSnapshotStatus`.
- Exposed `chainProof.snapshotStatus`.
- Added filter for `commissionChainSnapshotStatus`.

## Gap 3: Scope Ambiguity Between Attribution Root And Beneficiary Participant

Commission row participant may differ from affiliate attribution root for upline rows.

Fix:

- Endpoint scopes by `CommissionEarning.participant.lineage`, matching finance scope and preventing lower-level users from seeing upline commission rows.
- Affiliate proof filters remain ANDed with scope.
