# Click Resolution Snapshot Evidence

## Resolver

`apps/api/src/activation-orders/activation-orders.service.ts`

- `resolveAffiliateClickAttribution`: line 1743
- reads normalized public click token: line 1750
- checks click usability: line 1781
- builds snapshot: line 1805

## Usability Rules

`isAffiliateClickEventUsable`: line 1813

The resolver requires:

- the click event exists
- the link is still usable
- the link still points to the event participant
- the participant is active
- agency is active when present
- agency member is active when present
- click is inside attribution window

## Snapshot Shape

`buildAffiliateAttributionSnapshot`: line 1857

The snapshot includes:

- `source = affiliate_click`
- `clickId`
- `affiliateClickEventId`
- `affiliateLinkId`
- `affiliateQrAssetId`
- `participantId`
- `agencyId`
- `agencyMemberId`
- `referralCode`
- `campaign`
- `channel`
- `placement`
- `packageCode`
- `clickCreatedAt`
- `orderSnapshottedAt`
- `attributionModel = explicit_click`
- `matchConfidence = high`
- `attributionWindowDays`

## Window Config

`AFFILIATE_ATTRIBUTION_WINDOW_DAYS`: `.env.example:14`

Service fallback is 30 days: `apps/api/src/activation-orders/activation-orders.service.ts:1900`.
