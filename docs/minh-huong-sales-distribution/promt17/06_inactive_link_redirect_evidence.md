# Inactive Link Redirect Evidence

## Inactive Rules

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- inactive check starts at `isLinkActiveForRedirect`: line 620
- non-`ACTIVE` status is rejected: lines 625-627
- inactive participant is rejected: lines 628-630
- future `startsAt` is rejected: lines 633-635
- past/equal `expiresAt` is rejected: lines 636-638

## Redirect Behavior

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- missing link fallback: line 306 and 326
- inactive fallback: line 334
- fallback URL includes only generic reason and safe destination: line 708

## Tests

`apps/api/src/channel-affiliate/channel-affiliate-redirect.integration.spec.ts`

- missing, paused, revoked, expired status, expired date, and future date all redirect without event: lines 229-257
- test asserts no internal participant/link IDs leak in fallback URL: lines 252-253

## Decision

Inactive links do not create new attribution events, matching BA guidance that expired/paused links do not create new attribution.
