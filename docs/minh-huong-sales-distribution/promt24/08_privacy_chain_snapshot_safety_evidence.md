# Privacy Chain Snapshot Safety Evidence

## Snapshot Safety

The chain snapshot builder copies only participant chain fields needed for commission:

- participant ids
- beneficiary type/id
- depth
- rate
- agency/member ids where already part of attribution/channel context
- parent participant id

It does not copy:

- raw IP
- raw User-Agent
- IP/User-Agent hashes
- device hint
- cookies
- Authorization
- customer email/phone
- payment proof
- raw headers
- report/export body

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:2038`
- `apps/api/src/activation-orders/activation-orders.service.ts:2088`

## Tests

- Self-service affiliate order creation asserts chain snapshot has no hashes, device hint, cookies, Authorization, or customer email.
- Pending creation still creates no financial side effects.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:966`
