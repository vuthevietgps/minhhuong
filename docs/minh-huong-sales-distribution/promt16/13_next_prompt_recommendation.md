# Next Prompt Recommendation

## Recommended Prompt 17

Implement public redirect and click/scan event foundation only.

## Include

- `AffiliateClickEvent` schema/migration
- public `GET /r/:linkCode`
- active/paused/expired/revoked link handling for redirect
- QR scans recorded as click events with QR asset metadata when `qr` query param is present
- privacy-safe fields only:
  - IP hash
  - user-agent hash
  - device hint
  - landing URL
  - campaign/channel/placement snapshots
- click ID generation
- dedupe/idempotency guard for repeated events where practical
- scope-safe readback for management/report seed data if needed

## Exclude

- install/deferred attribution
- mobile first-open/register endpoints
- `CustomerAttribution`
- activation order attribution snapshot
- commission/reporting changes
- frontend/UI

## Acceptance Focus

- public redirect never leaks internal participant IDs
- paused/expired/revoked link behavior is deterministic
- click/scan creates attribution signal only
- click/scan creates no order, subscription, payment, commission, or ledger rows
- sibling scope remains blocked for any management/readback endpoint
