# Tests Or Commands Run

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| Copy canonical BA files from zip to `docs/minh-huong-sales-distribution/ba/` | passed | Source/target SHA256 matched. |
| Read copied BA docs | passed | Main BA v1.1 and affiliate addendum were inspected before readiness analysis. |
| `rg -n "Affiliate|affiliate|Referral|referral|Qr|QR|linkCode|installReferrer|Attribution|attribution|CustomerAttribution|SalesAttribution|click|first-open|firstOpen" apps/api apps/web packages docs` | timed out | Broad search included noisy dependency/package-lock content. |
| `rg -n "...same affiliate/referral/attribution pattern..." apps/api apps/web packages docs -g "!**/node_modules/**" -g "!**/dist/**" -g "!**/.next/**"` | passed | Confirmed referral/order foundations exist and affiliate-link/QR implementation is missing. |
| `rg -n "AffiliateLink|AffiliateQrAsset|AffiliateClickEvent|AppInstallAttribution|CustomerAttribution|SalesAttributionSnapshot|model Affiliate|/r/:linkCode|first-open|channel-affiliate" apps/api apps/web packages -g "!**/node_modules/**" -g "!**/dist/**" -g "!**/.next/**"` | passed | No product implementation matches found. |
| `rg -n "model AgencyMember|referralCode|model ChannelParticipant|model ActivationOrder|channelParticipantId|referrerMemberId|entitlementSnapshotJson|model CommissionEarning" apps/api/prisma/schema.prisma` | passed | Current foundation fields confirmed. |
| `rg -n "resolveChannelAttribution|referralCode|channelParticipantId|referrerMemberId|approve|commission" apps/api/src/activation-orders/activation-orders.service.ts` | passed | Current referral/order approval paths confirmed. |
| `Get-Content ...ketqua_promt_quanly_minhhuong_15_fix.json -Raw \| ConvertFrom-Json` | passed | JSON parsed successfully; verdict is `CONDITIONAL`. |
| `git status --short` | failed | `fatal: not a git repository (or any of the parent directories): .git` |

## Product Tests

Product tests were not run.

Reason: this was a no-code BA sync/spec task. No product source, schema, migration, frontend, or runtime files were changed.

## JSON Validation

`ketqua_promt_quanly_minhhuong_15_fix.json` was validated with PowerShell `ConvertFrom-Json`.
