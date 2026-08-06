# 09 Affiliate QR Attribution Gap

## Canonical BA Situation

- [MISSING] BA v1.1 affiliate-QR canonical file not found.
- [MISSING] Affiliate/QR addendum not found.
- [DIRECT] `C:\Users\PC\Downloads\bromt1.md` requires audit of `AffiliateLink`, `AffiliateQrAsset`, `AffiliateClickEvent`, `AppInstallAttribution`, `CustomerAttribution`, `/r/:linkCode`, mobile first-open attribution, and funnel reporting.

## Search Evidence

Search command:

```text
rg -n "AffiliateLink|AffiliateQrAsset|AffiliateClickEvent|AppInstallAttribution|CustomerAttribution|SalesAttributionSnapshot|linkCode|installReferrer|affiliate|QR|qr|referralCode|referral" apps/api/src apps/api/prisma apps/web/src docs packages
```

Findings:

- [DIRECT] `apps/api/prisma/schema.prisma:575` - `AgencyMember.referralCode`.
- [DIRECT] `apps/api/prisma/seed.ts:280-312` - demo referral codes.
- [DIRECT] `apps/api/src/activation-orders/dto/create-self-service-activation-order.dto.ts:24-31` - self-service accepts optional `referralCode`.
- [DIRECT] `apps/api/src/activation-orders/activation-orders.service.ts:1105-1158` - resolves normalized code against `ChannelParticipant`, `AgencyMember.referralCode`, or `Agency.code`.
- [DIRECT] `apps/web/src/app/admin/channel/page.tsx:518-660` - UI manages referral codes for channel/member accounts.

## Missing Affiliate/QR Requirements

| Requirement | Status | Evidence |
|---|---|---|
| `AffiliateLink` entity | missing | [MISSING] no model/source match. |
| `AffiliateQrAsset` entity | missing | [MISSING] no model/source match. |
| `AffiliateClickEvent` entity | missing | [MISSING] no model/source match. |
| `AppInstallAttribution` entity | missing | [MISSING] no model/source match. |
| `CustomerAttribution` entity | missing | [MISSING] no model/source match. |
| `SalesAttributionSnapshot` with affiliate fields | missing | [MISSING] no model/source match. |
| Public redirect `/r/:linkCode` | missing | [MISSING] no controller route. |
| Link/QR create/report API | missing | [MISSING] no controller/service. |
| Mobile first-open/install referrer | missing | [MISSING] no mobile app code or install referrer handling. |
| Affiliate funnel report | missing | [MISSING] no event data model or report. |
| Rule click/install/register creates no revenue | unknown/missing | No implementation to enforce. |
| Attribution window, first/last click, override, dispute/hold | missing | No implementation. |

## Distinction From Referral Code

Current referral code is not affiliate tracking:

- It attaches a code to order attribution when the order is created.
- It does not record clicks/scans, QR assets, installs, first-open, registration attribution windows, or funnel analytics.
- It does not preserve attribution disputes/overrides.

## Verdict

Status: missing.

Priority: P2 after P0 order/subscription/commission/payout tests.

Recommended next action: do not implement affiliate/QR in `bromt2`. First harden P0 commercial flows and create canonical BA v1.1/addendum or copy them into repo docs.

