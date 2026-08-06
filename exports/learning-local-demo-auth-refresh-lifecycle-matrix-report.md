# Learning Local Demo Auth Refresh Lifecycle Matrix

Generated at: 2026-07-01T02:15:00.000Z

Endpoint: /v1/learning-local-demo/auth-refresh-lifecycle-matrix-report
JSON export: exports/learning-local-demo-auth-refresh-lifecycle-matrix-report.json
Markdown export: exports/learning-local-demo-auth-refresh-lifecycle-matrix-report.md
Dashboard: /admin/learning-local-demo#auth-refresh-lifecycle-matrix

## Safety

- Fixture-only local demo data.
- production_ready=false
- productionDbUsed=false
- noProductionDbRead=true
- providerApiUsed=false
- paymentProviderUsed=false
- notificationProviderUsed=false
- aiProviderExecutionUsed=false
- realAuthMutationUsed=false
- realSessionMutationUsed=false
- realRefreshTokenMutationUsed=false
- realLearningMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Lifecycle cases: 6
- Persistent session lookup: 1
- Refresh-token rotation denied: 1
- Reused refresh-token denied: 1
- Cross-device revocation: 1
- Session cleanup/expiry: 1
- Admin/support audit visibility: 1
- Admin/support audit roles: 2
- Denied cases: 3
- Cleaned-up cases: 1
- Read-only visible cases: 1
- Safety gates closed: 11/11
- Open safety gates: 0

## Lifecycle Cases

| Case | Role | Scenario | Surface | Expected | Decision | Token/refresh/session | Audit | Reason | Summary |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| auth-refresh-persistent-session-store-lookup | STUDENT (student@demo.local) | PERSISTENT_SESSION_LOOKUP | AuthSessionService.getSession | 200 | ALLOWED | VALID/ACTIVE/ACTIVE | ADMIN,SUPPORT | none | A session created through one service instance is readable through another service instance sharing the fixture-backed store. |
| auth-refresh-rotated-token-denied | PARENT (parent@demo.local) | REFRESH_TOKEN_ROTATION_DENIAL | POST /auth/refresh | 401 | DENIED | ROTATED/ROTATED/ACTIVE | ADMIN,SUPPORT | Refresh token reuse denied | A refresh token is rotated after first use and the old token is denied on replay. |
| auth-refresh-reused-token-denied-and-audited | PARENT (parent@demo.local) | REUSED_REFRESH_TOKEN_DENIAL | POST /auth/refresh | 401 | DENIED | REUSED/REUSED/REVOKED | ADMIN,SUPPORT | Refresh token reuse denied | A replayed rotated token is marked reused, denied, and tied to admin/support audit visibility. |
| auth-refresh-cross-device-session-revoked | TEACHER (teacher@demo.local) | CROSS_DEVICE_REVOCATION | AuthSessionService.revokeOtherSessions | 401 | DENIED | REVOKED/REVOKED/REVOKED | ADMIN,SUPPORT | Session has been revoked | A teacher session on a second fixture device is revoked while the current device remains active. |
| auth-refresh-session-cleanup-expiry | STUDENT (student@demo.local) | SESSION_CLEANUP_EXPIRY | AuthSessionService.cleanupExpiredSessions | 401 | CLEANED_UP | EXPIRED/EXPIRED/EXPIRED | ADMIN,SUPPORT | Invalid or expired token | Expired sessions and active refresh tokens attached to them are cleaned up by the fixture-backed store. |
| auth-refresh-admin-support-read-only-audit-visible | SUPPORT (support@demo.local) | ADMIN_SUPPORT_AUDIT_READ_ONLY | AuthSessionService.listAuditEventsForRoles | 200 | READ_ONLY_VISIBLE | VALID/NOT_REQUIRED/ACTIVE | ADMIN,SUPPORT | none | Admin and support roles can read fixture audit events while learner roles receive no audit event rows. |

## Evidence Rows

| Evidence | Count | IDs | Summary |
| --- | ---: | --- | --- |
| PERSISTENT_SESSION_LOOKUP | 1 | auth-refresh-persistent-session-store-lookup | 1 fixture-only persistent_session_lookup case(s). |
| REFRESH_TOKEN_ROTATION_DENIAL | 1 | auth-refresh-rotated-token-denied | 1 fixture-only refresh_token_rotation_denial case(s). |
| REUSED_REFRESH_TOKEN_DENIAL | 1 | auth-refresh-reused-token-denied-and-audited | 1 fixture-only reused_refresh_token_denial case(s). |
| CROSS_DEVICE_REVOCATION | 1 | auth-refresh-cross-device-session-revoked | 1 fixture-only cross_device_revocation case(s). |
| SESSION_CLEANUP_EXPIRY | 1 | auth-refresh-session-cleanup-expiry | 1 fixture-only session_cleanup_expiry case(s). |
| ADMIN_SUPPORT_AUDIT_READ_ONLY | 1 | auth-refresh-admin-support-read-only-audit-visible | 1 fixture-only admin_support_audit_read_only case(s). |
| STORE_ABSTRACTION | 1 | FixtureBackedAuthSessionStore<br>AUTH_SESSION_STORE | AuthSessionService uses a store abstraction backed by a repo-local fixture store for this hardening slice. |
| SAFETY_GATE | 11 | productionDbUsed=false<br>noProductionDbRead=true<br>providerApiUsed=false<br>paymentProviderUsed=false<br>notificationProviderUsed=false<br>aiProviderExecutionUsed=false<br>realAuthMutationUsed=false<br>realSessionMutationUsed=false<br>realRefreshTokenMutationUsed=false<br>realLearningMutationUsed=false<br>secretsRequired=false | Refresh/session lifecycle evidence uses local demo fixtures and fixture-backed store state only. |
