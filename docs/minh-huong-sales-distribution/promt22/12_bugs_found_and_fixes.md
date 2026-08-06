# Bugs Found And Fixes

## Code Fixes During Implementation

No post-test functional bug fix was required.

Build passed before focused tests, and the focused migration spec passed after the audit implementation.

## Notable Design Adjustment

Aggregate CSV export now calls an internal aggregate builder instead of the public JSON aggregate method. This avoids creating both JSON and CSV audit rows for a single CSV export request.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:446` defines the internal aggregate builder.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:569` uses the internal builder from aggregate CSV export.

## Result

- channel-affiliate suite passed, 25 tests
- migration spec passed, 19 tests
- full Jest passed, 157 tests
- e2e passed, 12 tests
- final build passed
