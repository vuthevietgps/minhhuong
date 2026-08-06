# Learning Local Demo Auth Session Smoke Matrix

Generated at: 2026-07-01T01:30:00.000Z

Endpoint: /v1/learning-local-demo/auth-session-smoke-matrix-report
JSON export: exports/learning-local-demo-auth-session-smoke-matrix-report.json
Markdown export: exports/learning-local-demo-auth-session-smoke-matrix-report.md
Dashboard: /admin/learning-local-demo#auth-session-smoke-matrix

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
- realLearningMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Smoke cases: 9
- Role coverage: 5/5
- Scenario coverage: 5/5
- Login success: 5
- Logout/session end denied: 1
- Expired token denied: 1
- Revoked session/device denied: 1
- Wrong-role access denied: 1
- Allowed cases: 5
- Denied cases: 4
- Negative permission cases: 1
- Safety gates closed: 10/10
- Open safety gates: 0

## Smoke Cases

| Case | Role | Scenario | Surface | Expected | Decision | Token/session | Reason | Summary |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| auth-smoke-student-login-success | STUDENT (student@demo.local) | LOGIN_SUCCESS | /me/dashboard | 200 | ALLOWED | VALID/ACTIVE | none | Student demo login issues a valid bearer token and active local session for dashboard access. |
| auth-smoke-parent-login-success | PARENT (parent@demo.local) | LOGIN_SUCCESS | /me/dashboard | 200 | ALLOWED | VALID/ACTIVE | none | Parent demo login issues a valid bearer token and active local session for guardian dashboard access. |
| auth-smoke-teacher-login-success | TEACHER (teacher@demo.local) | LOGIN_SUCCESS | /me/dashboard | 200 | ALLOWED | VALID/ACTIVE | none | Teacher demo login issues a valid bearer token and active local session for teacher dashboard access. |
| auth-smoke-admin-login-success | ADMIN (admin@demo.local) | LOGIN_SUCCESS | /me/admin-surface | 200 | ALLOWED | VALID/ACTIVE | none | Admin demo login issues a valid bearer token and passes the admin/director role guard surface. |
| auth-smoke-support-login-success | SUPPORT (support@demo.local) | LOGIN_SUCCESS | /me/dashboard | 200 | ALLOWED | VALID/ACTIVE | none | Support demo login issues a valid bearer token for support dashboard access without admin privileges. |
| auth-smoke-teacher-logout-session-end-denied | TEACHER (teacher@demo.local) | LOGOUT_SESSION_END | /me/dashboard | 401 | DENIED | ENDED/ENDED | Session has ended | Teacher token is denied after logout ends the local auth session. |
| auth-smoke-student-expired-token-denied | STUDENT (student@demo.local) | EXPIRED_TOKEN_DENIAL | /me/dashboard | 401 | DENIED | EXPIRED/ACTIVE | Invalid or expired token | Expired student bearer token is rejected before dashboard access. |
| auth-smoke-parent-revoked-device-denied | PARENT (parent@demo.local) | REVOKED_SESSION_DEVICE_DENIAL | /me/dashboard | 401 | DENIED | REVOKED/REVOKED | Session has been revoked | Parent token is denied after the local demo device/session is revoked. |
| auth-smoke-support-wrong-role-admin-surface-denied | SUPPORT (support@demo.local) | WRONG_ROLE_ACCESS_DENIAL | /me/admin-surface | 403 | DENIED | VALID/ACTIVE | Insufficient role | Support role is authenticated but denied on admin/director-only surface. |

## Evidence Rows

| Evidence | Count | IDs | Summary |
| --- | ---: | --- | --- |
| LOGIN_SUCCESS | 5 | auth-smoke-student-login-success<br>auth-smoke-parent-login-success<br>auth-smoke-teacher-login-success<br>auth-smoke-admin-login-success<br>auth-smoke-support-login-success | 5 fixture-only login_success smoke case(s). |
| LOGOUT_SESSION_END | 1 | auth-smoke-teacher-logout-session-end-denied | 1 fixture-only logout_session_end smoke case(s). |
| EXPIRED_TOKEN_DENIAL | 1 | auth-smoke-student-expired-token-denied | 1 fixture-only expired_token_denial smoke case(s). |
| REVOKED_SESSION_DEVICE_DENIAL | 1 | auth-smoke-parent-revoked-device-denied | 1 fixture-only revoked_session_device_denial smoke case(s). |
| WRONG_ROLE_ACCESS_DENIAL | 1 | auth-smoke-support-wrong-role-admin-surface-denied | 1 fixture-only wrong_role_access_denial smoke case(s). |
| ROLE_COVERAGE | 5 | STUDENT<br>PARENT<br>TEACHER<br>ADMIN<br>SUPPORT | Student, parent, teacher, admin, and support demo roles are covered by the auth smoke matrix. |
| SAFETY_GATE | 10 | productionDbUsed=false<br>noProductionDbRead=true<br>providerApiUsed=false<br>paymentProviderUsed=false<br>notificationProviderUsed=false<br>aiProviderExecutionUsed=false<br>realAuthMutationUsed=false<br>realSessionMutationUsed=false<br>realLearningMutationUsed=false<br>secretsRequired=false | Auth/session smoke evidence uses local demo fixtures and in-process test state only. |
