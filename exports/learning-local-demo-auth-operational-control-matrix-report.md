# Auth Rate Limit And Operational Monitoring Matrix

Generated: 2026-07-10T05:00:00.000Z

Decision: LOCAL_AUTH_CONTROLS_VERIFIED_GO_LIVE_BLOCKED

- production_ready=false
- production_enabled=false
- externalMonitoringProviderUsed=false
- rawCredentialOrRefreshTokenExported=false

## Totals

- Evidence rows: 9
- Local verified: 7
- Disposable-local shared control verified: 1
- Production-approval blockers: 1
- Open local safety gates: 0

## Evidence

| Control | Fixture case | Status | Production blocker | Verification |
| --- | --- | --- | --- | --- |
| Login attempt throttling | unknown@demo.local repeated invalid password | VERIFIED_LOCAL | NO | A deterministic per-identity window permits the configured attempts, returns 429 afterward, and stores only a SHA-256 rate-limit key. |
| Refresh-token attempt throttling | repeated invalid.token refresh fingerprint | VERIFIED_LOCAL | NO | Repeated attempts for the same refresh-token fingerprint return 429 inside the local window; raw tokens are absent from snapshots. |
| Rate-limit control outage behavior | fixture operational control unavailable | VERIFIED_LOCAL | NO | Login returns service unavailable before credential/session processing when the rate-limit seam is unavailable. |
| Refresh replay denial counter | rotated parent refresh token replay | VERIFIED_LOCAL | NO | Refresh replay revokes the session family and increments REFRESH_REPLAY_DENIED without exporting the raw token. |
| Auth-session repository outage counter | findSessionById repository outage | VERIFIED_LOCAL | NO | Repository failure remains fail closed and increments SESSION_REPOSITORY_ERROR. |
| Expired session/token cleanup counters | one expired session and one expired refresh token | VERIFIED_LOCAL | NO | Cleanup run, expired-session, and expired-refresh-token counters match deterministic fixture outcomes. |
| Role-scoped auth audit export counters | ADMIN read and STUDENT denied audit export | VERIFIED_LOCAL | NO | Admin/support reads count exported rows while learner-role requests count denied exports and receive no audit rows. |
| Shared atomic Prisma rate-limit and metric backend | 12 concurrent login and 16 concurrent refresh requests across two API processes | VERIFIED_DISPOSABLE_LOCAL | NO | One random localhost PostgreSQL database atomically admits exactly 5 login and 10 refresh attempts across two processes, aggregates counters, HMAC-protects persisted keys, expires bounded rows, and fails login closed with HTTP 503 during adapter outage. |
| Production dashboards, alerts, retention, and incident approval | not exercised; repo-local scope forbids external monitoring and production activation | BLOCKED_PENDING_PRODUCTION_APPROVAL | YES | Production bootstrap rejects both local providers until retention ownership, dashboards, alert routing, incident rehearsal, staging migration, security review, and manual go-live approval exist. |
