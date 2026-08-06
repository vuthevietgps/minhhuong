# Affiliate QR BA Target Extract

## Direct BA Requirements

The BA requires sale/agency actors to create affiliate links and QR assets that support end-to-end attribution from first contact to approved order.

Core flow:

1. Affiliate link or QR is created for a sale/agency participant.
2. Customer clicks the link or scans the QR.
3. System records the click/scan attribution signal.
4. Customer is routed to landing page, app store, deep link, or package selection.
5. App first open and registration preserve attribution when possible.
6. Order creation stores an immutable attribution snapshot.
7. Payment/approval creates the commercial event.
8. Commission/reporting use approved order revenue, not click/install/register events.

Required public link form:

- `https://go.minhhuong.app/r/{referralCode}`
- `https://go.minhhuong.app/r/{referralCode}?pkg=ENGLISH_BASIC_12M&campaign=summer2026`

Required link parameters:

- `referralCode`
- `linkId`
- `pkg`
- `campaign`
- `channel`
- `placement`

Required conceptual models:

- `AffiliateLink`
- `AffiliateQrAsset`
- `AffiliateClickEvent`
- `AppInstallAttribution`
- `CustomerAttribution`
- extended order attribution snapshot

Required APIs:

- `GET /v1/channel-affiliate/links`
- `POST /v1/channel-affiliate/links`
- `PATCH /v1/channel-affiliate/links/:id`
- `POST /v1/channel-affiliate/links/:id/qr`
- `GET /v1/channel-affiliate/links/:id/report`
- `GET /r/:linkCode`
- `POST /v1/mobile/attribution/first-open`
- `POST /v1/mobile/attribution/register`
- `POST /v1/orders/:id/attribution/resolve`
- `GET /v1/channel-affiliate/report`

## Commercial Rules

Events that must not create revenue or commission:

- click
- QR scan
- app install
- registration
- package selection
- pending payment/proof upload

Events that may create revenue or commission:

- approved/paid activation order
- approved renewal, if renewal policy allows

Attribution defaults:

- 30-day configurable attribution window from most recent click/scan
- last-click default before order when there is no dispute
- store all clicks, but snapshot the selected attribution on the order
- manual override only by admin/operations with reason and audit
- expired/paused links do not create new attribution
- old order snapshots remain immutable after link/participant changes

## Inferred Requirements From BA

These are not separate product desires; they are technical requirements implied by the BA contract:

- `linkCode` or click token must be unguessable enough for public URLs.
- QR attribution must not fork business logic; QR should encode a normal affiliate link plus QR placement metadata.
- Public click tracking must not store raw IP/user-agent as durable PII; store hashes or risk metadata only.
- Duplicate click/first-open events need idempotency or dedupe keys.
- Link and QR lifecycle changes need audit events.
- Link ownership should attach to `ChannelParticipant`, with optional referral/member/package/campaign fields.
- Package-scoped links should validate package code or scope against the current activation package catalog.

## Open Business Decisions

The BA leaves these policy values open:

- exact renewal owner lock window around subscription expiry
- final first-click vs last-click dispute policy beyond the default
- inactive sale/agency transfer rule
- app-store deferred attribution method per platform
- whether QR codes are static, dynamic, or both
- whether coupon/discount codes participate in attribution
- self-referral and household/family abuse rules
- gross vs net revenue basis for commission reporting
- retention window for click/install/device attribution records
