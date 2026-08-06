# Financial Safety Evidence

## Product Code Boundary

Prompt 17 changed only:

- affiliate schema/migration
- channel-affiliate controller/service/test
- `.env.example`
- result docs

It did not modify:

- `apps/api/src/activation-orders`
- `apps/api/src/channel-finance`
- `apps/api/src/entitlement`
- `apps/api/src/package-entitlement`
- `apps/web`

## Service Write Boundary

`ChannelAffiliateService.resolvePublicRedirect` writes only `AffiliateClickEvent`.

Hard-ban scan over `apps/api/src/channel-affiliate` found no references to:

- `ActivationOrder`
- `Subscription`
- `Payment`
- `CommissionEarning`
- `CommissionLedgerEntry`
- `PayoutRequest`
- mobile attribution
- customer attribution

## Test Evidence

`apps/api/src/channel-affiliate/channel-affiliate-redirect.integration.spec.ts`

- financial count helper covers activation orders, subscriptions, payments, commission earnings, commission ledger entries, and payout requests: lines 544-566
- active link click preserves financial counts: lines 137-186

## Regression Evidence

Existing commercial regressions all passed:

- activation-orders + channel-finance: 2 suites, 29 tests
- package-entitlement: 3 suites, 12 tests
- entitlement + learning: 2 suites, 21 tests
- channel FK/scope suites
- full API suite: 23 suites, 141 tests
- e2e: 4 suites, 10 tests
