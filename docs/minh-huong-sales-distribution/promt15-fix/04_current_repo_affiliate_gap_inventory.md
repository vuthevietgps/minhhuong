# Current Repo Affiliate Gap Inventory

## Present Or Partial Foundations

| Area | Evidence | Readiness |
| --- | --- | --- |
| Referral code | `apps/api/prisma/schema.prisma:829` has `AgencyMember.referralCode String? @unique` | partial |
| Channel hierarchy | `apps/api/prisma/schema.prisma:841` has `ChannelParticipant` | usable foundation |
| Order attribution | `apps/api/prisma/schema.prisma:984-986` has `channelParticipantId`, `agencyId`, `referrerMemberId` on `ActivationOrder` | partial |
| Order referral input | `apps/api/src/activation-orders/activation-orders.service.ts:615` resolves `dto.referralCode` for self-service order creation | partial |
| Order create snapshot metadata | `apps/api/src/activation-orders/activation-orders.service.ts:344-372` stores current channel attribution fields | partial |
| Attribution resolution | `apps/api/src/activation-orders/activation-orders.service.ts:1606` has `resolveChannelAttribution` | partial |
| Commission timing | `apps/api/src/activation-orders/activation-orders.service.ts:762` and later approval path keep commission tied to approved orders | usable foundation |
| Agency/member referral setup | `apps/api/src/channel-admin/channel-admin.service.ts:322-337`, `536-550`, `601-602` normalize/default referral codes | usable foundation |
| UI display | `apps/web/src/app/page.tsx:4715` shows agency/referral code text | partial display only |

## Missing Implementation Areas

| BA object/capability | Current status | Gap |
| --- | --- | --- |
| `AffiliateLink` | missing | No link owner/campaign/package/status model. |
| `AffiliateQrAsset` | missing | No QR asset, placement, encoded URL, or QR lifecycle model. |
| `AffiliateClickEvent` | missing | No click/scan event tracking. |
| `AppInstallAttribution` | missing | No first-open/install matching model. |
| `CustomerAttribution` | missing | No user-level attribution state. |
| `SalesAttributionSnapshot` extension | partial | Current order has channel/member fields but no affiliate link, QR, click, install, campaign, channel, placement, or attribution model snapshot. |
| Public redirect `/r/:linkCode` | missing | No public link resolution or redirect controller. |
| Mobile attribution APIs | missing | No `/v1/mobile/attribution/first-open` or register attribution endpoint. |
| Affiliate reports | missing | No click/install/register/order funnel by link/QR/campaign. |
| Override/dispute workflow | missing | No admin attribution override reason/audit workflow. |
| Fraud/privacy controls | missing | No click dedupe, IP/user-agent hashing, device hash retention, or suspicious-click flagging. |

## Inventory Command Notes

The first broad `rg` inventory included `node_modules/package-lock` noise and timed out. The narrowed inventory excluding `node_modules`, `dist`, and `.next` completed and confirmed that affiliate-link/QR models and endpoints are absent from product code.
