# Remaining Gaps And Risks

## Prompt 9

1. The initial `prisma:generate` anomaly should be watched, although final validate/generate/test/build passed.
2. The DB-backed channel-admin tests emitted a `pg` deprecation warning during service calls. This is not a failing behavior today, but should be watched before pg v9.

## Carried Forward

1. `ChannelParticipant_parentParticipantId_fkey` remains `NOT VALID` from Prompt 8 and needs a later data-quality/constraint validation pass.
2. `Subscription.sourceOrderId` uniqueness remains deferred pending legacy duplicate audit.
3. OrderStatusHistory lifecycle expansion beyond approval remains deferred.
4. Package entitlement/snapshot remains deferred.
5. Commission policy version/snapshot remains deferred.
6. Affiliate/QR remains blocked until canonical BA docs are synced.

## Risk Assessment

Channel-admin core visibility and action boundaries are now covered by DB-backed tests with sibling rows present. The remaining commercial risks are no longer from untested channel-admin visibility, but from deferred data-quality, entitlement/snapshot, commission policy snapshot, history lifecycle, and BA docs sync work.

