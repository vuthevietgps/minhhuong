# Channel Scope Regression Evidence

## Test File

File: `apps/api/src/channel-finance/channel-scope.integration.spec.ts`

The same DB-backed Prompt 7 scope fixture now runs after `migrate deploy`.

## Activation Order Scope

Evidence: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:97-145`

Covered:

- sale A sees only own order;
- manager A sees A subtree rows;
- manager A excludes manager B subtree rows;
- director/root sees both A and B;
- admin sees global rows;
- operations sees global rows;
- unscoped non-admin user gets no rows.

## Finance, Wallet, Payout, CSV Scope

Evidence: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:147-214`

Covered:

- manager A report and overview include only A subtree rows;
- manager A report excludes B orders and payouts;
- manager A wallet includes A ledger entries;
- manager A wallet excludes B ledger entries;
- manager A payout list excludes B payout;
- manager A CSV excludes B orders.

## Admin/Ops And Empty Participant

Evidence: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:216-248`

Covered:

- admin global finance overview includes all seeded rows;
- operations global finance overview includes all seeded rows;
- unscoped non-admin overview returns zero commercial data;
- admin CSV includes A and B rows.

## Result

Final direct run:

```text
npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts
Test Suites: 1 passed, 1 total
Tests: 3 passed, 3 total
```

