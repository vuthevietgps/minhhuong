# Read Only Financial Safety Evidence

## Read Only

The endpoint uses:

- `commissionEarning.count`;
- `commissionEarning.findMany`;
- `auditLog.create` only for safe report access audit.

It does not create/update/delete:

- activation orders;
- affiliate click events;
- commission earnings;
- commission ledger entries;
- payments;
- subscriptions;
- wallet ledger entries;
- payout requests.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:486`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:503`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1335`

## Tests

Financial counters are captured before report calls and verified unchanged after.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1158`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1381`
