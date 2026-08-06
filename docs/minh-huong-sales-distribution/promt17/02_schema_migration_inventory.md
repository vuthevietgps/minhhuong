# Schema Migration Inventory

## Prisma Schema Evidence

`apps/api/prisma/schema.prisma`

- `Agency.affiliateClickEvents`: line 834
- `AgencyMember.affiliateClickEvents`: line 853
- `ChannelParticipant.affiliateClickEvents`: line 888
- `AffiliateLink.clickEvents`: line 921
- `AffiliateQrAsset.clickEvents`: line 943
- `model AffiliateClickEvent`: line 950
- `dedupeKeyHash @unique`: line 959
- `ipHash`: line 960
- `userAgentHash`: line 961
- `redirectUrl`: line 963

## Migration Evidence

`apps/api/prisma/migrations/20260614213000_affiliate_click_event_redirect/migration.sql`

- create table `AffiliateClickEvent`: line 2
- unique `clickId`: line 27
- unique `dedupeKeyHash`: line 30
- index `(affiliateLinkId, createdAt)`: line 33
- index `(affiliateQrAssetId, createdAt)`: line 36
- index `(participantId, createdAt)`: line 39
- index `(campaign, createdAt)`: line 42
- FK to `AffiliateLink`: line 45
- FK to `AffiliateQrAsset`: line 48
- FK to `ChannelParticipant`: line 51
- FK to `Agency`: line 54
- FK to `AgencyMember`: line 57

## Migration Deploy Proof

`apps/api/src/channel-affiliate/channel-affiliate-redirect.integration.spec.ts`

- creates temp PostgreSQL DB and runs `prisma migrate deploy`: lines 31-53
- verifies table, unique indexes, regular indexes, and FKs: lines 88-134

## Data Safety

The migration creates only the new click event table and related indexes/FKs. It does not mutate existing order, subscription, payment, commission, payout, link, or QR rows.
