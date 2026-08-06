# Remaining Gaps And Risks

## Prompt 7 Gaps

1. Channel-admin participant/agency/user DB-backed scope tests remain missing.
2. Prisma migration history must be reconciled for channel hierarchy fields before relying on migration deployment for this scope foundation.

## Carried Forward From Prompt 6 And Earlier

1. `Subscription.sourceOrderId` uniqueness remains deferred until legacy duplicate data can be audited.
2. OrderStatusHistory lifecycle expansion beyond approval remains deferred.
3. Package entitlement/snapshot remains deferred.
4. Commission policy version/snapshot remains deferred.
5. Affiliate/QR remains blocked.

## Risk Assessment

Current-code scope behavior for the tested commercial surfaces is materially safer after Prompt 7 because sibling A/B rows are present in the same database and asserted excluded.

The deploy risk is still conditional because `migrate deploy` cannot be treated as proven for the current channel hierarchy schema until migration history is reconciled.

