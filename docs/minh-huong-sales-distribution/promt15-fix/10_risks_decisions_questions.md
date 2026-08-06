# Risks, Decisions, Questions

## Risks

- Treating install/register as revenue would violate the BA. Only approved orders can create revenue/commission.
- Public link tracking can create privacy risk if raw IP/user-agent/device IDs are stored. Store hashes and define retention.
- QR codes printed offline can remain in circulation after campaign changes, so paused/revoked behavior must be clear.
- Deferred attribution on mobile can be platform-limited; app-store install matching should be best effort, not a financial source of truth.
- Last-click attribution may create disputes unless override and audit rules are explicit.
- Adding affiliate order snapshots too early can destabilize commission/reporting paths if the owner model is not stable.

## Decisions For This Prompt

- Accept copied BA files as canonical because source and target SHA256 match.
- Keep this run no-code.
- Mark result `CONDITIONAL` only because `git status --short` cannot run in the non-git workspace.
- Recommend Prompt 16 as `AffiliateLink` + `AffiliateQrAsset` foundation only.
- Defer click/install/customer/order attribution until after link/QR ownership and scope are implemented.

## Open Questions For Product/BA

- What is the exact renewal ownership lock window around subscription expiry?
- Should conflict resolution use last-click by default for all orders, or vary by package/campaign?
- What is the inactive sale/agency transfer rule: upline agency, company pool, or manual reassignment?
- What public base URL should production use for affiliate links?
- Should QR assets include generated image storage now, or only encoded URL until frontend/reporting needs images?
- What is the retention policy for click/install/device attribution records?
- Is commission based on gross paid amount, net paid amount, or package list price?
- Are coupon codes part of attribution priority?
- What self-referral and household anti-abuse rules apply?
