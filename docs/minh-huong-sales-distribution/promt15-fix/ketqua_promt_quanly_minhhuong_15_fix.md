# Prompt 15 Fix Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: no-code / BA-sync / affiliate-QR readiness spec  
Verdict: CONDITIONAL

## Conditional Reason

The canonical affiliate-link/QR BA files were found in the supplied zip bundle, copied into the repo BA directory, and verified by SHA256 checksum. The readiness review and technical spec are complete.

The result is `CONDITIONAL` only because `git status --short` cannot run in this workspace:

```text
fatal: not a git repository (or any of the parent directories): .git
```

No product code was changed, so no product test suite was run.

## Canonical BA Sync

Copied and verified:

- `docs/minh-huong-sales-distribution/ba/ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614-v1.1-affiliate-qr.md`
- `docs/minh-huong-sales-distribution/ba/ba-bo-sung-affiliate-link-qr-minh-huong-learning-platform-20260614.md`

Both target files match the zip source by size and SHA256:

- main BA v1.1: `158989748b2e9c1a706807693bac070d7bce957b46daea8c0176094ffffaf9cb`
- affiliate addendum: `38cd980c128b1129a594f7e93a921f5fef033d3e978d399bea608d2a0a617d29`

## Current Readiness Summary

The repo has usable commercial-distribution foundations:

- `AgencyMember.referralCode` exists and is unique.
- `ChannelParticipant` hierarchy and scope foundations exist.
- `ActivationOrder` stores `channelParticipantId`, `agencyId`, and `referrerMemberId`.
- Self-service activation order creation accepts `referralCode`.
- Existing order approval is the commercial event that drives commission behavior.
- Prompt 12-14 lifecycle/history/read-scope foundations are in place.

The repo does not yet have the BA-required affiliate-link/QR layer:

- no `AffiliateLink`
- no `AffiliateQrAsset`
- no `AffiliateClickEvent`
- no `AppInstallAttribution`
- no `CustomerAttribution`
- no public `/r/:linkCode` redirect/tracking path
- no mobile first-open/register attribution endpoints
- no affiliate funnel report
- no order attribution snapshot fields for link/QR/click/install/campaign/model

## BA Target Summary

The BA defines affiliate link and QR as attribution entry points for sale, agency owner, and agency manager workflows. Clicks, scans, installs, registrations, and package selections are attribution signals only. Revenue and commission must be created only when an activation order is approved/paid.

Default attribution target:

- most recent valid click/scan before order
- configurable 30-day window
- QR attribution is the same as link attribution, with QR-specific placement/campaign metadata
- order stores an immutable snapshot
- expired/paused links do not create new attribution
- admin/operations manual override requires reason and audit

## Recommended Prompt 16 Slice

Implement the smallest safe foundation slice:

1. Add `AffiliateLink` and `AffiliateQrAsset` schema/migration.
2. Add scoped channel affiliate APIs for link list/create/update and QR asset creation.
3. Generate canonical encoded public URL strings using `linkCode`.
4. Enforce sale/agency/director/admin visibility using existing channel scope patterns.
5. Add service/controller tests and Prisma generation/migration checks.

Do not include click tracking, install attribution, customer attribution, order snapshot changes, commission changes, or public redirect behavior in Prompt 16. Those should follow after the link/QR owner model is stable.

## Packet

This result packet was written under:

- `docs/minh-huong-sales-distribution/promt15-fix/`

Files:

- `00_chain_ledger.md`
- `01_scope_and_baseline.md`
- `02_canonical_ba_sync_evidence.md`
- `03_affiliate_qr_ba_target_extract.md`
- `04_current_repo_affiliate_gap_inventory.md`
- `05_affiliate_qr_readiness_matrix.md`
- `06_affiliate_qr_technical_spec.md`
- `07_prompt16_slice_recommendation.md`
- `08_files_changed.md`
- `09_tests_or_commands_run.md`
- `10_risks_decisions_questions.md`
- `ketqua_promt_quanly_minhhuong_15_fix.json`
- `ketqua_promt_quanly_minhhuong_15_fix.md`
