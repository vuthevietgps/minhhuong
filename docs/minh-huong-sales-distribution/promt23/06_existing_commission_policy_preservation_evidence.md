# Existing Commission Policy Preservation Evidence

## Preserved Policy

- No new commission rates were added.
- Existing depth policy remains `Math.round(4000 * Math.pow(0.4, depth))`.
- Base amount remains `order.amountCents`.
- Currency remains `order.currency`.
- Amount remains `Math.round(baseAmountCents * rateBps / 10000)`.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:2126`
- `apps/api/src/activation-orders/activation-orders.service.ts:2127`
- `apps/api/src/activation-orders/activation-orders.service.ts:2128`
- `apps/api/src/activation-orders/activation-orders.service.ts:2156`
- `apps/api/src/activation-orders/activation-orders.service.ts:2381`

## Tests

- Affiliate commission proof test asserts `baseAmountCents: 10000000`, `rateBps: 4000`, `amountCents: 4000000`, and `currency: VND`.
- Non-affiliate assisted sale still creates two commission entries for sale and manager depths.
- Non-affiliate entries do not receive `attributionSnapshotJson`.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:708`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1172`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1191`
