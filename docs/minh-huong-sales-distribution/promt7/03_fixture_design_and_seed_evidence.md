# Fixture Design And Seed Evidence

## Required Tree

Prompt 7 seeds the required deterministic channel tree:

```text
director-root
|-- manager-A
|   |-- agency-A1
|   |   `-- sale-A
|   `-- sale-A-direct
`-- manager-B
    |-- agency-B1
    |   `-- sale-B
    `-- sale-B-direct
```

Seed evidence:

- fixture seed function starts at `channel-scope.integration.spec.ts:263`;
- actor/customer IDs are declared at `channel-scope.integration.spec.ts:264-293`;
- agencies A/B are created at `channel-scope.integration.spec.ts:317-332`;
- director root is created at `channel-scope.integration.spec.ts:334-348`;
- manager A/B are created at `channel-scope.integration.spec.ts:350-375`;
- agency participants A/B are created at `channel-scope.integration.spec.ts:377-404`;
- sale A/B and direct sale A/B are created at `channel-scope.integration.spec.ts:406-453`.

## Rows Per Subtree

Activation orders:

- A subtree: `p7-order-sale-a`, `p7-order-sale-a-direct`, `p7-order-agency-a`
- B subtree: `p7-order-sale-b`, `p7-order-agency-b`

Evidence: `channel-scope.integration.spec.ts:455-515`

Commission earnings:

- A subtree: `p7-earning-sale-a`, `p7-earning-sale-a-direct`, `p7-earning-agency-a`
- B subtree: `p7-earning-sale-b`, `p7-earning-agency-b`

Evidence: `channel-scope.integration.spec.ts:517-556`

Ledger entries:

- A subtree: `p7-ledger-sale-a-credit`, `p7-ledger-sale-a-hold`, `p7-ledger-agency-a-credit`, `p7-ledger-agency-a-release`
- B subtree: `p7-ledger-sale-b-credit`, `p7-ledger-agency-b-credit`

Evidence: `channel-scope.integration.spec.ts:558-575`

Payout requests:

- A subtree: `p7-payout-sale-a`, `p7-payout-agency-a`
- B subtree: `p7-payout-sale-b`

Evidence: `channel-scope.integration.spec.ts:577-588`

## Totals

Manager A approved revenue is seeded as:

- `p7-order-sale-a`: 100000
- `p7-order-sale-a-direct`: 300000
- `p7-order-agency-a`: 150000
- total: 550000

Global approved revenue is seeded as 1000000 across five approved orders.

Evidence: `channel-scope.integration.spec.ts:608-617`

