# Public Redirect Implementation Evidence

## Route

`apps/api/src/channel-affiliate/channel-affiliate.controller.ts`

- public controller prefix `r`: line 79
- `GET :linkCode`: line 85
- `VERSION_NEUTRAL`: line 86
- redirects with HTTP 302: line 108

This route has no `UseGuards` or `Roles` decorator.

## Request Data Used

`apps/api/src/channel-affiliate/channel-affiliate.controller.ts`

- IP source uses `x-forwarded-for` or `request.ip`: line 96
- dedupe headers include `x-affiliate-dedupe-key` and `idempotency-key`: lines 102-103

## Service

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- public redirect resolver: line 300
- missing link fallback: lines 306 and 326
- inactive link fallback: line 334
- QR resolution: line 340
- click event creation path: line 364
- fallback redirect URL: line 708

## Tests

`apps/api/src/channel-affiliate/channel-affiliate-redirect.integration.spec.ts`

- active redirect creates privacy-safe click event: line 137
- inactive/missing deterministic redirect with no event: line 229
- public controller redirects without auth guards: line 285
