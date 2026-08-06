# Affiliate Link Model Evidence

## Model

`AffiliateLink` exists in `apps/api/prisma/schema.prisma:893`.

Key fields implemented:

- `participantId`
- `agencyId`
- `agencyMemberId`
- `createdById`
- `referralCode`
- `linkCode @unique`
- `name`
- `campaign`
- `channel`
- `placement`
- `packageCode`
- `packageScopeJson`
- `status`
- `startsAt`
- `expiresAt`
- `metadataJson`
- timestamps

## Relations

- `participant` -> `ChannelParticipant`
- `agency` -> `Agency`
- `agencyMember` -> `AgencyMember`
- `createdBy` -> `User`
- `qrAssets` -> `AffiliateQrAsset[]`

## Service Evidence

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- create link entry point: line 142
- target participant resolution: line 320
- linkCode generation: line 536
- unique code retry on `P2002`: lines 284-307
- link update path: line 182
- link create/update audit: lines 174 and 234

## Test Evidence

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- sale creates own link and unique `linkCode`: lines 154-195
- duplicate `linkCode` rejected by DB unique constraint: lines 182-193
- scoped update keeps row instead of deleting: lines 232-264
- admin can create for target participant: lines 304-310
