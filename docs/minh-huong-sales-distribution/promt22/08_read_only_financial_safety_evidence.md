# Read Only Financial Safety Evidence

## Allowed Write

Prompt 22 writes only to the existing `AuditLog` table.

Code evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:971` writes `auditLog.create`.

## Prohibited Writes

Prompt 22 does not create/update/delete:

- `ActivationOrder`
- `AffiliateClickEvent`
- `Payment`
- `Subscription`
- `WalletLedgerEntry`
- `CommissionEarning`
- `CommissionLedgerEntry`
- `PayoutRequest`
- entitlement/subscription/payment records

## Counter Test

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:956` captures financial counters before report/export access and audit read.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1115` asserts financial counters are unchanged after all audited access plus audit read.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1798` defines financial counters.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1810` counts subscriptions.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1811` counts wallet ledger entries.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1812` counts commission earnings.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1813` counts commission ledger entries.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1814` counts payout requests.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1815` counts payments.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1816` counts affiliate click events.
