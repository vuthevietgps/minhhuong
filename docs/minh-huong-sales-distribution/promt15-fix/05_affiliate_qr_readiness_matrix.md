# Affiliate QR Readiness Matrix

| Area | BA target | Current repo evidence | Status | Gap | Priority | Recommended next slice |
| --- | --- | --- | --- | --- | --- | --- |
| Affiliate link ownership | Sale/agency creates scoped link with campaign/package/status | Referral code and channel participant exist | partial | No `AffiliateLink` | P0 | Prompt 16 schema/API |
| QR asset | QR encodes affiliate link and stores placement/campaign metadata | none | missing | No `AffiliateQrAsset` | P0 | Prompt 16 schema/API |
| Public link URL | `/r/:linkCode` resolves link and redirects | none | missing | No public controller | P0 | Prompt 17 after link model |
| Click/scan event | Click/scan stored as attribution signal | none | missing | No `AffiliateClickEvent` | P0 | Prompt 17 |
| Order snapshot | Order stores immutable selected attribution | `ActivationOrder` has channel/member fields | partial | No affiliate link/QR/click/install/campaign/model snapshot | P0/P1 | Prompt 18 |
| Commission gating | Commission only on approved orders | existing approval path | partial ready | Need affiliate snapshot input before applying to affiliate | P0/P1 | Prompt 18 |
| App install attribution | Match install/first open back to click when possible | none | missing | No `AppInstallAttribution` or mobile API | P1 | Prompt 19 |
| Customer attribution | User registration preserves attribution state | none | missing | No `CustomerAttribution` | P1 | Prompt 19 |
| Renewal ownership | Existing owner vs new link by conflict policy | subscription traceability exists | partial | Exact X-day lock/open rules missing | P1 | after business decision |
| Reports | Funnel click -> install -> register -> order -> approved -> commission | channel finance/order reports exist | partial | No affiliate funnel metrics | P1/P2 | after click/order snapshot |
| Manual override | Admin/ops override with reason and audit | audit/status history foundations exist | partial | No attribution override model/API | P1 | after snapshot |
| Scope/RBAC | Sale own, agency subtree, director/admin scoped reads | channel scope patterns exist | partial ready | Need affiliate queries wired to scope | P0 | Prompt 16 |
| Privacy/fraud | Hash IP/user-agent/device, dedupe events, flag abuse | none specific | missing | No click privacy/fraud controls | P1/P2 | with click event slice |
| Frontend | Channel actors manage links/QR and inspect reports | current page only shows referral code | missing | No affiliate management UI | P2 | after backend APIs |

## Readiness Conclusion

The repo is ready for a narrow backend foundation slice, but not ready for full end-to-end affiliate attribution in one prompt. The safest sequence is:

1. link/QR owner model and scoped CRUD
2. public redirect and click/scan events
3. order attribution snapshot integration
4. mobile/customer attribution
5. reporting, override, fraud, and frontend
