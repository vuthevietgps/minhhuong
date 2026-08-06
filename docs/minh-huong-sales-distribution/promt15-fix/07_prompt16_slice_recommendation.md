# Prompt 16 Slice Recommendation

## Recommended Slice

Implement backend foundation for affiliate link and QR asset management only.

## Include

1. Prisma schema and migration:
   - `AffiliateLink`
   - `AffiliateQrAsset`
   - status enums
   - indexes and relations to `ChannelParticipant`, `AgencyMember` where needed, and `User` creator
2. Backend module:
   - `channel-affiliate` controller/service
   - scoped list endpoint
   - create link endpoint
   - update status/metadata endpoint
   - create QR asset endpoint
3. URL generation:
   - generate canonical `encodedUrl` using a public base URL config
   - include `linkCode`, optional package, campaign, channel, placement
4. Scope:
   - reuse current channel participant visibility rules
   - sale can manage own links
   - agency manager/owner can manage allowed subtree where existing scope permits
   - admin/operations can inspect/manage globally
5. Tests:
   - Prisma generate
   - migration deploy on test DB if available
   - service tests for create/list/update/QR
   - RBAC tests for own, subtree, sibling denied, admin allowed
   - no commission/order side effects

## Exclude

- public `/r/:linkCode` redirect
- click/scan event persistence
- install/deferred attribution
- customer attribution state
- activation order attribution snapshot changes
- commission policy changes
- finance report changes
- frontend implementation
- QR image rendering library unless the repo already has a safe existing dependency

## Acceptance Criteria

- A sale/channel participant can create a named affiliate link.
- Created link has a unique `linkCode`.
- Link can be paused/revoked without deleting existing rows.
- QR asset creation stores `encodedUrl` that points at the future public link URL.
- Link and QR list endpoints respect channel scope.
- Sibling participant cannot read or mutate another participant's link.
- Admin/operations can read/manage all links.
- No order, subscription, commission, payment, or entitlement behavior changes.
- Tests prove no commission is created by link or QR creation.

## Why This Slice First

The BA target is larger than the current repo surface. Implementing full click/install/customer/order attribution in one step would mix public tracking, financial attribution, mobile behavior, and reporting. A link/QR foundation slice gives later prompts a stable owner model and keeps Prompt 16 free from commercial side effects.
