# Remaining Gaps And Risks

## Deferred By Prompt 4 Scope

- Order history for create, proof upload, reject, cancel, revoke.
- Payout lifecycle history.
- Subscription traceability: `sourceOrderId`, `activationPackageId`, backfill from `providerRef`.
- Package entitlement and entitlement snapshots.
- Commission policy version/snapshot.
- DB-backed channel scope integration tests.
- Affiliate/QR, blocked by missing canonical BA v1.1/addendum docs.

## Risks

- Idempotency replay stores JSON-safe response. Replayed dates are JSON values, not live Date objects inside service-level replay.
- Concurrent same-key first requests can still rely on the database unique constraint to prevent duplicate records; tests cover replay after success and different-payload conflict.
- Migration file was created and Prisma generated, but migration was not applied to a live database in this prompt.

## Compatibility

- `Idempotency-Key` is optional.
- Existing clients continue using no-key behavior.
- Prompt 2 conditional status claims are still the fallback protection.
