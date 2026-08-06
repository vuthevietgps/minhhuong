# Hard Ban Scan

## Command

```text
rg -n "paymentGateway|webhook|reconciliation|payout execution|first-click|last-click|CustomerAttribution|AppInstallAttribution|coupon|discount|renewal ownership|fraud|risk scoring|frontend|mobile first-open|deferred attribution|QR image|materialized view|object storage|backfill" apps/api/src/channel-affiliate/channel-affiliate.service.ts apps/api/src/channel-affiliate/channel-affiliate.controller.ts apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts
```

## Result

- No matches in changed application files.

## Manual Check

Not implemented:

- payout processing/execution;
- payout request workflow;
- payment gateway/webhook/reconciliation;
- broad commission redesign;
- new tiers;
- frontend/UI;
- mobile/customer attribution;
- first-click/last-click engine;
- override/dispute workflow;
- coupon/discount;
- renewal ownership;
- fraud/risk scoring;
- hierarchy redesign;
- QR rendering;
- async export job/object storage;
- materialized reporting redesign;
- backfill.
