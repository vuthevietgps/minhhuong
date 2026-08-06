# Prompt 26 Chain Ledger

Accepted baseline: Prompt 25.

Prompt 26 adds only a read-only affiliate commission aggregate JSON report.

Preserved chain:

- Prompt 16 affiliate links and QR assets.
- Prompt 17 public redirect and click tracking.
- Prompt 18 immutable order attribution snapshot.
- Prompt 19 order attribution list report.
- Prompt 20 order attribution aggregate report.
- Prompt 21 order attribution CSV exports.
- Prompt 22 safe report access audit.
- Prompt 23 approve-time `CommissionEarning.attributionSnapshotJson`.
- Prompt 24 frozen `ActivationOrder.commissionChainSnapshotJson`.
- Prompt 25 commission list report.

New in Prompt 26:

- `GET /v1/channel-affiliate/commissions/aggregates`
- report type `AFFILIATE_COMMISSION_AGGREGATE`
- no CSV/export, payout, payment, subscription, or backfill behavior.
