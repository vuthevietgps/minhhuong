# Prisma Auth Session Store Local/Staging Matrix

Generated: 2026-07-10T04:00:00.000Z

Decision: LOCAL_IMPLEMENTATION_VERIFIED_GO_LIVE_BLOCKED

- production_ready=false
- production_enabled=false
- productionDbUsed=false
- realSessionMutationUsed=false
- plaintextRefreshTokenPersisted=false
- malformedRefreshTokenHashAccepted=false

## Totals

- Evidence rows: 8
- Implemented: 3
- Disposable-local verified: 4
- Staging blockers: 1
- Open local safety gates: 0

## Evidence

| Control | Status | Production blocker | Verification |
| --- | --- | --- | --- |
| AUTH_SESSION_STORE provider selection | IMPLEMENTED | NO | Local demo defaults to fixture, explicit local/staging Prisma is allowed, and production fixture fallback is rejected. |
| Prisma AuthSessionStore repository | IMPLEMENTED | NO | Sessions, refresh-token hashes, and append-only audit events persist behind the async AuthSessionStore seam. |
| Refresh-token SHA-256 persistence integrity | VERIFIED_DISPOSABLE_LOCAL | NO | Repository reads/writes reject malformed hashes; a validated PostgreSQL constraint enforces lowercase SHA-256, and the disposable forward repair revokes, tombstones, and audits malformed rows without exporting their values. |
| Migration deploy and schema validation | VERIFIED_DISPOSABLE_LOCAL | NO | migrate deploy creates three tables, foreign keys, and lookup indexes in a random disposable localhost database. |
| Repository outage and inconsistent-row denial | IMPLEMENTED | NO | Repository transport and integrity failures become controlled service-unavailable denials before protected access. |
| Shared two-instance termination and revocation contract | VERIFIED_DISPOSABLE_LOCAL | NO | Session-row locking serializes refresh issuance/rotation with atomic logout and revocation; two independent Prisma clients run six rotate/revoke and six rotate/logout races, all ending with a denied session and zero active refresh tokens. |
| Pre-activation rollback and forward repair | VERIFIED_DISPOSABLE_LOCAL | NO | Disposable test drops only new auth objects, preserves the base schema, reapplies reviewed migrations, rehearses constraint-only rollback, and verifies all auth tables and hash integrity return. |
| Staging backup, restore, monitoring, and incident rehearsal | BLOCKED_PENDING_STAGING | YES | No staging infrastructure or production credentials were used in this repo-local job. |
