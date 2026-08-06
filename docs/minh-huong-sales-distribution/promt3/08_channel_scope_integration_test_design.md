# DB-Backed Channel Scope Integration Test Design

## Goal

Prompt 2 added service-level scope-shape tests. Prompt 4/5 should add DB-backed tests proving real rows from sibling subtrees are excluded across orders, finance reports, wallet, payouts, and CSV.

## Fixture Tree

```text
director-root
├─ manager-A
│  ├─ agency-A1
│  │  └─ sale-A
│  └─ sale-A-direct
└─ manager-B
   ├─ agency-B1
   │  └─ sale-B
   └─ sale-B-direct
```

## Users

- `adminUser`: global admin.
- `opsUser`: operations.
- `directorUser`: channel director/root.
- `managerAUser`, `managerBUser`.
- `agencyAOwnerUser`, `agencyBOwnerUser`.
- `saleAUser`, `saleBUser`.
- customer/parent users for each subtree.

## Data Rows Per Subtree

For subtree A and B:

- one self-service order with channel attribution.
- one sale-assisted order created by sale.
- one approved order.
- one pending/released commission earning.
- ledger entries: CREDIT, HOLD, RELEASE, DEBIT.
- payout requests in `PENDING_REVIEW`, `PAID`, and `REJECTED`.

## Test Targets

Activation orders:

- sale A sees own created orders and subtree-attributed orders only.
- sale A cannot see sale B sibling orders.
- manager A sees agency A1/sale A/sale A-direct.
- manager A cannot see manager B subtree.
- director sees both A and B under root.
- admin/operations see global.

Channel finance:

- overview totals include only scoped orders/payouts.
- report excludes sibling subtree rows.
- wallet excludes sibling ledger entries.
- payout list excludes sibling payout requests.
- CSV export excludes sibling approved orders.

Channel admin:

- participant list respects subtree.
- target detail blocks non-descendant lower/equal/sibling users.
- agency payout access rejects sibling agency.

## Suggested Test Files

- `apps/api/src/channel-finance/channel-finance.scope.integration.spec.ts`
- `apps/api/src/activation-orders/activation-orders.scope.integration.spec.ts`
- optionally `apps/api/src/channel-admin/channel-admin.scope.integration.spec.ts`

## Test DB Strategy

- Use a dedicated test database schema or transactional cleanup.
- Seed via Prisma service/factory helpers.
- Build deterministic lineage strings.
- Avoid relying on clock-sensitive data except where period filters are explicitly tested.

## Acceptance Criteria

- Sibling rows are present in the database and are not returned.
- Admin/operations global behavior is explicitly asserted.
- Empty participant case returns no data.
- CSV/report endpoints use the same scope as JSON report paths.
- Tests fail if any scope filter is removed or widened.
