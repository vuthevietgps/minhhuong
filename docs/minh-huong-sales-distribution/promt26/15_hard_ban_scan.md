# Hard Ban Scan

Scan result:

- no commission CSV export route was added;
- no payout request workflow was added;
- no payout execution was added;
- no payment gateway/webhook/reconciliation was added;
- no frontend/UI was added;
- no mobile/customer attribution was added;
- no first-click/last-click engine was added;
- no coupon/discount/fraud workflow was added;
- no QR rendering was added;
- no async export/object storage was added;
- no materialized reporting redesign or backfill was added.

Code scan notes:

- `payoutInvoiceUrl` appears only in privacy assertions proving it does not leak.
- `payoutRequest.count()` appears only in the existing read-only financial counter helper.
- `AFFILIATE_COMMISSION_AGGREGATE` appears only in DTO/service/test/report audit paths for the new JSON report.
