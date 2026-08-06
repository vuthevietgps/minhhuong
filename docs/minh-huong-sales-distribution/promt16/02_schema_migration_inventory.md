# Schema Migration Inventory

## Prisma Schema Evidence

`apps/api/prisma/schema.prisma`

- `AffiliateLinkStatus`: line 161
- `AffiliateQrAssetStatus`: line 168
- `User.createdAffiliateLinks`: line 303
- `User.createdAffiliateQrAssets`: line 304
- `Agency.affiliateLinks`: line 833
- `AgencyMember.affiliateLinks`: line 851
- `ChannelParticipant.affiliateLinks`: line 885
- `model AffiliateLink`: line 893
- `model AffiliateQrAsset`: line 925

## Migration Evidence

`apps/api/prisma/migrations/20260614203000_affiliate_link_qr_foundation/migration.sql`

- create enum `AffiliateLinkStatus`: line 2
- create enum `AffiliateQrAssetStatus`: line 5
- create table `AffiliateLink`: line 8
- create table `AffiliateQrAsset`: line 33
- unique index `AffiliateLink_linkCode_key`: line 50
- index `AffiliateLink_participantId_status_idx`: line 53
- index `AffiliateLink_agencyId_status_idx`: line 56
- index `AffiliateQrAsset_affiliateLinkId_status_idx`: line 65
- FK `AffiliateLink_participantId_fkey`: line 74
- FK `AffiliateLink_createdById_fkey`: line 83
- FK `AffiliateQrAsset_affiliateLinkId_fkey`: line 86
- FK `AffiliateQrAsset_createdById_fkey`: line 89

## Migration Deploy Proof

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- creates temp PostgreSQL DB and runs `prisma migrate deploy`: lines 35-54
- checks enum values, tables, indexes, and FKs: lines 85-151

## Data Safety

The migration only creates new enums, tables, indexes, and foreign keys. It does not delete, rename, backfill, or mutate existing commercial tables.
