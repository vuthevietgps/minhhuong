# Affiliate QR Technical Spec

## Design Goal

Add affiliate link and QR attribution without changing the existing commercial rule that revenue and commission come from approved activation orders only.

The affiliate layer should produce attribution evidence. It should not itself create revenue, entitlement, commission, or payment state.

## Domain Model

### `AffiliateLink`

Purpose: public/linkable attribution entry owned by a channel participant.

Suggested fields:

- `id`
- `participantId` FK to `ChannelParticipant`
- `agencyId` optional snapshot or FK when available
- `agencyMemberId` optional FK for referral member owner compatibility
- `createdById` FK to `User`
- `referralCode` snapshot
- `linkCode` unique public code
- `name`
- `campaign`
- `channel`
- `placement`
- `packageCode` optional
- `packageScopeJson` optional
- `status` enum: `ACTIVE`, `PAUSED`, `EXPIRED`, `REVOKED`
- `startsAt`
- `expiresAt`
- `metadataJson`
- `createdAt`
- `updatedAt`

Indexes:

- unique `linkCode`
- `participantId, status`
- `agencyId, status`
- `campaign`
- `createdAt`

### `AffiliateQrAsset`

Purpose: QR wrapper for a normal affiliate link. QR must not create a separate attribution path.

Suggested fields:

- `id`
- `affiliateLinkId` FK to `AffiliateLink`
- `createdById` FK to `User`
- `label`
- `placement`
- `encodedUrl`
- `qrImageUrl` optional
- `status` enum: `ACTIVE`, `PAUSED`, `REVOKED`
- `metadataJson`
- `createdAt`
- `updatedAt`

Indexes:

- `affiliateLinkId, status`
- `placement`
- `createdAt`

### `AffiliateClickEvent`

Purpose: immutable click/scan signal.

Suggested fields:

- `id`
- `affiliateLinkId`
- `affiliateQrAssetId` optional
- `participantId` snapshot
- `referralCode` snapshot
- `clickId` unique public/session token
- `ipHash`
- `userAgentHash`
- `deviceHint`
- `landingUrl`
- `campaign`
- `channel`
- `placement`
- `metadataJson`
- `createdAt`

Rules:

- do not store raw IP or raw user-agent as durable data
- QR scans create the same event type with QR asset and placement metadata
- click events never create commission

### `AppInstallAttribution`

Purpose: best-effort install/first-open link to click event.

Suggested fields:

- `id`
- `clickId` optional
- `affiliateLinkId` optional
- `participantId`
- `deviceIdHash`
- `installSource`
- `installAt`
- `matchMethod` enum: `REFERRER`, `DEEP_LINK`, `SESSION_MATCH`, `MANUAL_CODE`, `UNKNOWN`
- `userId` optional
- `status` enum: `PENDING`, `LINKED_TO_USER`, `EXPIRED`, `REJECTED`
- `validUntil`
- `metadataJson`
- `createdAt`
- `updatedAt`

### `CustomerAttribution`

Purpose: user-level attribution state before order.

Suggested fields:

- `id`
- `userId`
- `participantId`
- `affiliateLinkId`
- `firstClickId`
- `lastClickId`
- `firstClickAt`
- `lastClickAt`
- `attributionModel` enum: `FIRST_CLICK`, `LAST_CLICK`, `MANUAL_OVERRIDE`
- `validUntil`
- `status` enum: `ACTIVE`, `EXPIRED`, `OVERRIDDEN`, `REJECTED`
- `overriddenById` optional
- `overrideReason` optional
- `metadataJson`
- `createdAt`
- `updatedAt`

### Order Attribution Snapshot

The eventual order integration should snapshot selected attribution onto `ActivationOrder`, either as dedicated columns or a JSON object.

Recommended pragmatic option:

- add `attributionSnapshotJson` to `ActivationOrder`

Suggested snapshot payload:

```json
{
  "source": "AFFILIATE_LINK",
  "participantId": "channel_participant_id",
  "agencyId": "agency_id",
  "referralCode": "DEMO-SALE",
  "affiliateLinkId": "affiliate_link_id",
  "affiliateQrAssetId": "affiliate_qr_asset_id",
  "clickId": "click_id",
  "installAttributionId": "install_attribution_id",
  "campaign": "summer2026",
  "channel": "offline",
  "placement": "school-poster",
  "attributionModel": "LAST_CLICK",
  "validUntil": "2026-07-14T00:00:00.000Z",
  "resolvedAt": "2026-06-14T00:00:00.000Z"
}
```

Snapshot rules:

- immutable after order creation except explicit admin override
- approval/commission reads the snapshot, not mutable link state
- link deletion/revocation must not rewrite existing order history

## API Surface

Prompt 16 foundation:

- `GET /v1/channel-affiliate/links`
- `POST /v1/channel-affiliate/links`
- `PATCH /v1/channel-affiliate/links/:id`
- `POST /v1/channel-affiliate/links/:id/qr`

Later slices:

- `GET /r/:linkCode`
- `POST /v1/mobile/attribution/first-open`
- `POST /v1/mobile/attribution/register`
- `POST /v1/orders/:id/attribution/resolve`
- `GET /v1/channel-affiliate/links/:id/report`
- `GET /v1/channel-affiliate/report`

## Scope And RBAC

Use existing channel scope behavior:

- sale: own links/QR only
- agency owner/manager: own agency/subtree links when current scope allows
- director/admin/operations: global or configured scope
- sibling participants: denied
- unauthenticated public traffic: only public redirect endpoint, never management APIs

## Financial Safety

The affiliate module must not directly create:

- commission earnings
- commission ledger entries
- subscription entitlement
- payment approval
- revenue report rows

Only approved activation orders can drive those outputs.

## Prompt 16 Technical Boundaries

Prompt 16 should not add click tracking, mobile attribution, customer attribution, order snapshot, or commission changes. It should only create the link/QR management foundation needed for the later attribution chain.
