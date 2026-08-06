# Affiliate Click Event Evidence

## Event Creation

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- `createClickEventWithUniqueId`: line 398
- unique `clickId` generated before create: line 421
- event write includes link, participant, agency/member snapshot, clickId, hashes, redirect URL, campaign/channel/placement/package: lines 427-451
- clickId collision retry and dedupe conflict handling: lines 457-483

## Snapshot Fields

Event stores:

- `affiliateLinkId`
- `affiliateQrAssetId` when valid
- `participantId`
- `agencyId`
- `agencyMemberId`
- `referralCode`
- `clickId`
- `dedupeKeyHash`
- `ipHash`
- `userAgentHash`
- `deviceHint`
- `redirectUrl`
- `campaign`
- `channel`
- `placement`
- `packageCode`

## Tests

`apps/api/src/channel-affiliate/channel-affiliate-redirect.integration.spec.ts`

- active link event has expected snapshot fields and clickId pattern: lines 137-186
- explicit dedupe prevents duplicate event creation: lines 260-281

## Financial Boundary

The event is an attribution signal only. It does not write order, subscription, payment, commission, ledger, or payout rows.
