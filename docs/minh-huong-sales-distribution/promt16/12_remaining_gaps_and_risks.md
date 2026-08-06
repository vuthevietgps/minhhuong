# Remaining Gaps And Risks

## Deliberately Deferred

Prompt 16 did not implement:

- public redirect `/r/:linkCode`
- click/scan event persistence
- `AffiliateClickEvent`
- install/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- activation order attribution snapshot
- commission/reporting changes
- frontend link/QR management UI
- QR image rendering

## Remaining Risks

- Public link redirect in the next slice must hash privacy-sensitive data and avoid durable raw IP/user-agent storage.
- QR codes printed offline need clear paused/revoked redirect behavior in Prompt 17.
- Full attribution should not affect revenue/commission until order snapshot and approval rules are explicitly implemented and tested.
- The fallback public base URL is safe for dev but production should set `AFFILIATE_PUBLIC_BASE_URL`.
- Dynamic QR image generation remains deferred; Prompt 16 stores `encodedUrl` only.

## Open Business Decisions

- exact attribution window beyond the default BA recommendation
- first-click/last-click dispute handling
- inactive sale/agency transfer policy
- retention policy for click/device attribution records
- gross vs net revenue basis for later affiliate reports
