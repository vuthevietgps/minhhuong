# Remaining Gaps And Risks

## Prompt 8 Remaining Gaps

1. Channel-admin participant/agency/user DB-backed scope tests remain missing.
2. `ChannelParticipant_parentParticipantId_fkey` is added as `NOT VALID` for safer legacy migration. If any environment already has invalid parent references, a later data-quality pass should repair them before validating the constraint.

## Carried Forward

1. `Subscription.sourceOrderId` uniqueness remains deferred pending legacy duplicate audit.
2. OrderStatusHistory lifecycle expansion beyond approval remains deferred.
3. Package entitlement/snapshot remains deferred.
4. Commission policy version/snapshot remains deferred.
5. Affiliate/QR remains blocked.

## Risk Assessment

The specific Prompt 7 blocker is fixed: a fresh database built by `migrate deploy` now contains the required scope foundation and passes the DB-backed sibling subtree visibility tests.

The next highest commercial risk is channel-admin visibility because it can list or act on commercial users/agencies/participants.

