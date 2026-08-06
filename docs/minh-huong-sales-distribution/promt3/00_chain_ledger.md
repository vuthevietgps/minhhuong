# Chain Ledger - Prompt 3

Date: 2026-06-14

## Input Chain

- Prompt 1 audit verdict was `CONDITIONAL`: MVP commercial skeleton exists, but entitlement, status history, idempotency, subscription traceability, commission policy versioning, affiliate/QR, and DB-backed scope tests were missing.
- Prompt 2 verdict was `PASS`: service-level tests were added and small P0 duplicate side-effect fixes were made for activation approval and payout review.
- Prompt 3 input files from `docs/minh-huong-sales-distribution/promt2/` were found and read.
- Prompt 1 cross-check files from `docs/minh-huong-sales-distribution/bromt1/` were found and read where required.

## Current Evidence Chain

- Core commercial schema exists in `apps/api/prisma/schema.prisma`.
- Order routes exist in `apps/api/src/activation-orders/activation-orders.controller.ts:78`.
- Finance routes exist in `apps/api/src/channel-finance/channel-finance.controller.ts:70`.
- Channel admin routes exist in `apps/api/src/channel-admin/channel-admin.controller.ts:37`.
- Learning access reads active child subscription in `apps/api/src/learning/learning.service.ts:1091`.

## Prompt 3 Decision Chain

- Do not rename `ActivationPackage` in the next implementation slice.
- Add extensions and snapshots instead of large rewrites.
- Treat `ActivationOrder` as the commercial order source.
- Treat `Subscription` as the learning access source.
- Keep all wallet/balance changes ledger-based.
- Keep affiliate/QR deferred until canonical BA v1.1/addendum docs are present.

## Prompt 3 Output Chain

- All Prompt 3 outputs are documentation only under `docs/minh-huong-sales-distribution/promt3/`.
- No product source, Prisma schema, migration, service, controller, or frontend file was changed in Prompt 3.
