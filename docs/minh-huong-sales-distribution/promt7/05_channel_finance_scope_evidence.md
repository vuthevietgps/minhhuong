# Channel Finance Scope Evidence

## Service Under Test

Core channel finance methods all route through `scopeFor(user)`.

Evidence:

- `getOverview`: `apps/api/src/channel-finance/channel-finance.service.ts:52`
- `getReport`: `apps/api/src/channel-finance/channel-finance.service.ts:90`
- `getWallet`: `apps/api/src/channel-finance/channel-finance.service.ts:430`
- `listPayoutRequests`: `apps/api/src/channel-finance/channel-finance.service.ts:607`
- `scopeFor`: `apps/api/src/channel-finance/channel-finance.service.ts:1124`
- manager/sale subtree scope by `lineage startsWith`: `apps/api/src/channel-finance/channel-finance.service.ts:1146`
- order scope covers participant subtree or actor-created rows: `apps/api/src/channel-finance/channel-finance.service.ts:1149-1154`
- earning, ledger, and payout scopes use participant subtree: `apps/api/src/channel-finance/channel-finance.service.ts:1155-1165`

## DB-Backed Test Claims

Test: `filters finance report, overview, wallet, payouts, and CSV by channel subtree`

Evidence: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:146-214`

Covered claims:

- manager A report approved revenue is exactly three A-subtree orders totaling 550000;
- manager A recent approved orders include A rows;
- manager A recent approved orders exclude B sibling rows;
- manager A recent payouts exclude B sibling payout;
- manager A overview reports 3 orders, 3 approved orders, and 550000 approved revenue;
- manager A wallet includes A ledger entries;
- manager A wallet excludes B ledger entries;
- manager A payout list includes A payout requests;
- manager A payout list excludes B payout requests.

Test: `keeps admin/operations global finance scope and empty participant scope safe`

Evidence: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:216-248`

Covered claims:

- admin overview sees all five seeded orders and 1000000 approved revenue;
- operations overview sees all five seeded orders and 1000000 approved revenue;
- unscoped non-admin overview returns zero orders, zero approved orders, zero approved revenue, and zero pending payout count.

## Result

Finance overview/report, wallet/ledger, payout list, admin/ops global behavior, and empty participant safety are covered by DB-backed tests.

