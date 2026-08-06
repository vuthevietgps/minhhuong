# Remaining Gaps And Risks

## Conditional Item

- `Subscription.sourceOrderId` is indexed but not unique. Reason: local repo has no live legacy duplicate audit, and a unique index could fail if prior duplicate `providerRef` rows exist. Approval status claim and idempotency tests prevent new duplicate side effects.

## Remaining Commercial Roadmap Gaps

- DB-backed channel scope integration tests are still missing.
- OrderStatusHistory currently covers approval only; create/proof/reject/cancel/revoke lifecycle expansion remains deferred.
- Package entitlement/snapshot remains deferred.
- Commission policy version/snapshot remains deferred.
- Affiliate/QR remains blocked until canonical BA v1.1/addendum docs are copied into repo docs.
- Payout lifecycle history remains deferred; Prompt 4 implemented payout idempotency only.

## Operational Risk

- Migration file was created and Prisma generate passed, but migration was not applied to a live database in this prompt.
- Initial full-unit test-run anomaly should be watched in the next run, although final full unit passed.

