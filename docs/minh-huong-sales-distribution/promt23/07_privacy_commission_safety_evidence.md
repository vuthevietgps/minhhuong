# Privacy Commission Safety Evidence

## Sanitized Proof

The resolver copies only the allowed attribution fields from the order snapshot.

It does not copy:

- raw IP
- raw User-Agent
- `ipHash`
- `userAgentHash`
- device hint
- cookies
- Authorization
- customer email/phone
- payment proof data
- report/export body

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:1995`
- `apps/api/src/activation-orders/activation-orders.service.ts:2048`

## Test

The commission proof test injects sensitive and mutable fields into the order snapshot and asserts the commission metadata does not contain them.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:661`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:736`
