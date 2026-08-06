# Evidence

## Scope And Baseline

Baseline: Prompt 26 accepted.

Prompt 27 adds only read-only CSV export endpoints for affiliate commission list and aggregate reports. It preserves Prompt 25/26 JSON reports, order attribution reports/exports, audit behavior, and financial safety.

## Endpoint Contract

New routes:

- `GET /v1/channel-affiliate/commissions/export.csv`
- `GET /v1/channel-affiliate/commissions/aggregates/export.csv`

Evidence:

- Controller routes and CSV headers: `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:84`
- Attachment filenames:
  - `affiliate-commissions.csv`
  - `affiliate-commission-aggregates.csv`

## Source Of Truth

List CSV reads:

- `CommissionEarning`
- `CommissionEarning.attributionSnapshotJson`
- safe `ActivationOrder` status/date/chain fields

Aggregate CSV reuses the Prompt 26 aggregate builder.

It does not recompute attribution from mutable `AffiliateLink`, and does not recompute commission chain from current hierarchy.

Evidence:

- list export query: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:680`
- aggregate export builder reuse: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:755`
- proof serializer whitelist: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2223`

## CSV Serialization

CSV behavior:

- fixed deterministic headers;
- existing `toCsv` serializer;
- cells with comma, quote, CR, or LF are quoted;
- embedded quotes are doubled;
- CRLF line separators;
- `Content-Type: text/csv; charset=utf-8`;
- `Content-Disposition: attachment`.

`CommissionEarning` has no `updatedAt`; list CSV exports `updatedAt` as literal `null`.

Evidence:

- list headers: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:318`
- aggregate headers: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:357`
- serializer: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2998`
- flatten list row: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2321`
- CSV escaping tests: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1710`

## Filter Sort Limit

List CSV:

- reuses Prompt 25 filters and safe sort model;
- default export limit 500, max 1000.

Aggregate CSV:

- reuses Prompt 26 groupBy/filter/sort/limit model;
- default limit 50, max 100;
- preserves `sortBy=totalAmountCents` currency-filter requirement.

Evidence:

- export DTO limit: `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:413`
- shared commission where: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1453`
- export limit helper: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2982`
- invalid query tests: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1964`

## Scope RBAC

Scope model preserved:

- admin/operations can export all scoped rows;
- channel users export only `CommissionEarning.participant.lineage` subtree rows;
- proof filters are ANDed with scope;
- out-of-scope filters return header-only CSV;
- unscoped non-admin aggregate export returns header-only CSV.

Evidence:

- shared participant scope: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2887`
- scope tests: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1901`

## Privacy

CSV and audit metadata exclude:

- customer email/phone;
- raw IP/User-Agent;
- `ipHash` / `userAgentHash`;
- device hint;
- cookies;
- Authorization;
- raw headers;
- payment proof;
- payout execution data;
- wallet ledger details beyond commission report fields;
- CSV/report body in audit.

Evidence:

- audit metadata safe summary: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1640`
- response and audit privacy tests: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1748`

## Currency Safety

Aggregate CSV serializes currency maps as deterministic JSON strings:

- `countByStatus`
- `totalAmountCentsByCurrency`
- `pendingAmountCentsByCurrency`
- `releasedAmountCentsByCurrency`
- `availableAmountCentsByCurrency`

`totalAmountCents` remains `null` for multi-currency aggregates.

Evidence:

- aggregate CSV row mapping: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:757`
- stable JSON helper: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:3016`
- multi-currency CSV tests: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1768`

## Read Only Financial Safety

Endpoints only read report data and create safe audit rows.

They do not create/update/delete:

- `ActivationOrder`
- `AffiliateClickEvent`
- `CommissionEarning`
- `CommissionLedgerEntry`
- `Payment`
- `Subscription`
- `WalletLedgerEntry`
- `PayoutRequest`
- entitlement/subscription/payment records

Evidence:

- read-only financial counter assertion: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1897`

## Hard Ban Scan

No implementation was added for:

- payout processing/execution;
- payout request workflow;
- payment gateway/webhook/reconciliation;
- commission policy redesign;
- new commission tiers;
- frontend/UI;
- mobile/customer attribution;
- `AppInstallAttribution`;
- `CustomerAttribution`;
- first-click/last-click engine;
- override/dispute workflow;
- coupon/discount/fraud;
- renewal ownership;
- QR image rendering;
- async export job/object storage;
- materialized report redesign;
- backfill.

The only new export work is synchronous CSV response generation with fixed limits.
