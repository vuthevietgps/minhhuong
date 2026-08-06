# 12 Next Bromt Recommendation

## Recommended Next Prompt

Name: `bromt2.md`

Type: `test-hardening` with small audit-fix additions.

## Why This Direction

The repo already has a functional commercial MVP skeleton:

- [DIRECT] order routes and service: `apps/api/src/activation-orders/activation-orders.controller.ts:78-183`, `apps/api/src/activation-orders/activation-orders.service.ts:208-824`.
- [DIRECT] channel tree/scope: `apps/api/prisma/schema.prisma:587-619`, `apps/api/src/channel-admin/channel-admin.service.ts:1031-1183`.
- [DIRECT] commission and payout ledger flow: `apps/api/src/activation-orders/activation-orders.service.ts:1182-1434`, `apps/api/src/channel-finance/channel-finance.service.ts:631-824`.

But the biggest P0 risk is lack of tests proving this flow:

- [MISSING] no activation-order spec.
- [MISSING] no channel-finance payout/ledger spec.
- [MISSING] no subtree scope spec.

## Scope For `bromt2.md`

1. Read Prompt 1 outputs, especially `00_chain_ledger.md`, `03_current_capability_matrix.md`, `07_order_subscription_commission_flow_audit.md`, `08_channel_scope_rbac_audit.md`, `10_tests_run.md`.
2. Add focused tests only; no feature implementation unless required to make existing intended behavior testable.
3. Cover:
   - self-service create order -> upload proof -> approve creates child subscription;
   - sale-assisted create order -> approve creates pending commission entries;
   - commission release is idempotent;
   - payout request creates HOLD, pay creates RELEASE + DEBIT, repeated/concurrent pay is safe or exposes a failing test;
   - sale/agency scope blocks sibling data.
4. Update chain ledger with test outcomes and any discovered bugs.

## Hard Bans For `bromt2.md`

- Do not implement affiliate/QR yet.
- Do not rename data models.
- Do not add payment gateway.
- Do not rewrite frontend.
- Do not modify migrations unless a bug fix absolutely requires schema work and is explicitly within the prompt.

## Acceptance Criteria For `bromt2.md`

- New/updated tests compile and run with `npm --prefix apps/api test -- --runInBand`.
- Any failing test must be tied to a concrete bug/gap with file/line evidence.
- If implementation fixes are needed, they must be minimal and scoped to P0 commercial correctness.
- Ledger updated.

## Later Prompts

- `bromt3.md`: technical spec for package entitlement, order status history, subscription source order/package, idempotency.
- `bromt4.md`: implement the smallest P0 hardening slice from `bromt3`.
- `bromt5.md`: affiliate/QR technical spec after BA v1.1/addendum is present.

