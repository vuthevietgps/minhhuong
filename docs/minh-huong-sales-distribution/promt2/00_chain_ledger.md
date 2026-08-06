# Chain Ledger - Prompt 2

## Input Chain

1. Prompt 1 established that the app already has a commercial MVP skeleton but lacks P0 test coverage for activation orders, subscription creation, commission release, payout ledger transitions, and channel scope.
2. Prompt 2 used those Prompt 1 reports as required context.
3. No Prompt 1 input file was missing.

## Work Chain

1. Baseline repo/test state was checked.
2. Service-level tests were added for commercial P0 flows.
3. Minimal source fixes were made only where tests and audit evidence showed clear duplicate-side-effect risk.
4. Targeted tests, full API tests, e2e tests, and build were run after changes.
5. This report set was created under `docs/minh-huong-sales-distribution/promt2/`.

## Decision Ledger

- Kept `ActivationOrder` as the main commercial order source.
- Kept `Subscription` as the learning-access source.
- Kept all financial balance changes ledger-backed.
- Did not implement affiliate/QR, payment gateway, frontend rewrite, schema migration, model rename, Lead CRM, RenewalOpportunity, or AI learning/game features.
- Used service-level unit tests because the target risk is in service orchestration and Prisma side effects.

## Output Chain

- Test files: `apps/api/src/activation-orders/activation-orders.service.spec.ts`, `apps/api/src/channel-finance/channel-finance.service.spec.ts`.
- Source fixes: `apps/api/src/activation-orders/activation-orders.service.ts`, `apps/api/src/channel-finance/channel-finance.service.ts`.
- Report files: this `promt2` directory.
