# Existing Policy Preservation Evidence

## Preserved

- Rate formula remains `Math.round(4000 * Math.pow(0.4, depth))`.
- Base amount remains `order.amountCents`.
- Currency remains `order.currency`.
- Amount remains `Math.round(baseAmountCents * rateBps / 10000)`.
- Commission status remains `PENDING` at creation.
- Availability date remains the existing approval `trialEndsAt`.
- Release/revoke/payout ledger paths are unchanged.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:2379`
- `apps/api/src/activation-orders/activation-orders.service.ts:2381`
- `apps/api/src/activation-orders/activation-orders.service.ts:2483`
- `apps/api/src/activation-orders/activation-orders.service.ts:2503`
- `apps/api/src/activation-orders/activation-orders.service.ts:2585`
- `apps/api/src/activation-orders/activation-orders.service.ts:2708`

## Tests

- Non-affiliate assisted sale still creates sale and manager commissions as before.
- Affiliate chain snapshot approval asserts unchanged amount/rate/currency.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:775`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:1447`
