# Order And Subscription Test Evidence

## Self-Service Flow

Evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:249`

Covered behavior:

- Creates public self-service activation order with `WAITING_PAYMENT`.
- Uploads matching email payment proof and moves order to `PENDING_REVIEW`.
- Operations approval creates a child subscription with `childProfileId`, `status: ACTIVE`, and `providerRef` equal to the order id.
- Approval creates pending commission after order approval.

Source under test:

- `apps/api/src/activation-orders/activation-orders.service.ts:390` self-service order.
- `apps/api/src/activation-orders/activation-orders.service.ts:478` proof upload.
- `apps/api/src/activation-orders/activation-orders.service.ts:527` approval.

## Sale-Assisted Flow

Evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:362`

Covered behavior:

- Sale-assisted order is created as `SALE_ASSISTED` and `PENDING_REVIEW`.
- Duplicate creator/email/window guard rejects a second active order.
- Approval creates subscription and pending commission for closer and upline.

Source under test:

- `apps/api/src/activation-orders/activation-orders.service.ts:207` sale-assisted order.
- `apps/api/src/activation-orders/activation-orders.service.ts:1190` commission creation.

## Approval Idempotency Claim

Evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:543`

Fix evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:615` now claims `PENDING_REVIEW` inside the transaction before creating side effects.
- `apps/api/src/activation-orders/activation-orders.service.ts:681` returns the approved order after side effects.

Result: stale repeated approval fails before duplicate payment, subscription, or commission side effects.
