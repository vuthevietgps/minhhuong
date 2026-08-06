# Order Create Input Contract Evidence

## Sale-Assisted DTO

`apps/api/src/activation-orders/dto/create-activation-order.dto.ts`

- `affiliateClickId?: string`: line 56

Behavior:

- optional field
- public `AffiliateClickEvent.clickId`, not DB primary key
- accepts only `clk_` plus 24 hex characters through DTO validation
- old clients can omit it

## Self-Service DTO

`apps/api/src/activation-orders/dto/create-self-service-activation-order.dto.ts`

- `affiliateClickId?: string`: line 40

## Service-Level Guard

`apps/api/src/activation-orders/activation-orders.service.ts`

- sale-assisted passes `dto.affiliateClickId` to resolver: lines 345-346
- self-service passes `dto.affiliateClickId` to resolver: lines 633-634
- service validates token shape before querying DB: line 1750

## Deterministic Invalid Behavior

Invalid/missing behavior is covered in `apps/api/src/activation-orders/activation-orders.service.spec.ts`:

- malformed/not-found/expired/inactive click test: line 711
- no `affiliateClickId` keeps old self-service behavior and does not query click events: lines 514 and 573
