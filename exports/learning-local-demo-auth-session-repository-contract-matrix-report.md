# Learning Local Demo Auth Session Repository Contract Matrix

Generated at: 2026-07-01T03:30:00.000Z

Endpoint: /v1/learning-local-demo/auth-session-repository-contract-matrix-report
JSON export: exports/learning-local-demo-auth-session-repository-contract-matrix-report.json
Markdown export: exports/learning-local-demo-auth-session-repository-contract-matrix-report.md
Dashboard: /admin/learning-local-demo#auth-session-repository-contract-matrix

## Safety

- Fixture-only local demo data.
- production_ready=false
- production_enabled=false
- productionDbUsed=false
- noProductionDbRead=true
- providerApiUsed=false
- paymentProviderUsed=false
- notificationProviderUsed=false
- aiProviderExecutionUsed=false
- realAuthMutationUsed=false
- realSessionMutationUsed=false
- realRefreshTokenMutationUsed=false
- realAuditMutationUsed=false
- realLearningMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false
- deployUsed=false

## Totals

- Schema surfaces: 3
- Schema fields: 34
- Session schema fields: 11
- Refresh-token schema fields: 13
- Audit schema fields: 10
- Refresh-token hash metadata fields: 5
- Actor/device context fields: 9
- Append-only audit context fields: 10
- Transition constraints: 6
- Create transitions: 1
- Rotate transitions: 1
- Revoke transitions: 1
- Expire transitions: 1
- Reuse-detection transitions: 1
- Fail-closed lookup transitions: 1
- Migration dry-run notes: 2
- Rollback notes: 2
- Safety gates closed: 16/16
- Open safety gates: 0

## Schema Fields

| Field | Surface | Type | Required | Indexed | Actor/device | Audit context | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | auth_sessions | uuid primary key | true | true | false | false | Stable session identifier used by JWT sid lookup. |
| userId | auth_sessions | uuid/text foreign key | true | true | true | false | Actor context for session ownership and fail-closed lookup. |
| email | auth_sessions | text | true | true | true | false | Actor email snapshot for audit and support review. |
| roles | auth_sessions | text array/json | true | false | true | false | Actor role snapshot used for authorization evidence. |
| deviceId | auth_sessions | text | true | true | true | false | Device context for cross-device revocation. |
| state | auth_sessions | ACTIVE | ENDED | REVOKED | EXPIRED | true | true | false | false | Session state must gate JWT acceptance. |
| issuedAt | auth_sessions | timestamp | true | true | false | false | Session issuance timestamp for lifecycle audit. |
| expiresAt | auth_sessions | timestamp | true | true | false | false | Session expiration timestamp for cleanup and fail-closed checks. |
| endedAt | auth_sessions | timestamp nullable | false | true | false | false | Logout or expiry end timestamp. |
| revokedAt | auth_sessions | timestamp nullable | false | true | false | false | Revocation timestamp for device and reuse response. |
| reason | auth_sessions | text nullable | false | false | false | false | Reason code for end, revoke, and expiry transitions. |
| id | auth_refresh_tokens | uuid primary key | true | true | false | false | Refresh-token identifier parsed from the presented token. |
| sessionId | auth_refresh_tokens | uuid/text foreign key | true | true | false | false | Links refresh-token state to the auth session. |
| userId | auth_refresh_tokens | uuid/text foreign key | true | true | true | false | Actor context for token ownership validation. |
| deviceId | auth_refresh_tokens | text | true | true | true | false | Device context copied from the session for revocation decisions. |
| tokenHash | auth_refresh_tokens | sha256 hex digest | true | true | false | false | Hashed refresh-token secret; raw refresh token must never be persisted. |
| state | auth_refresh_tokens | ACTIVE | ROTATED | REUSED | REVOKED | EXPIRED | true | true | false | false | Refresh-token state for rotation, replay detection, and cleanup. |
| issuedAt | auth_refresh_tokens | timestamp | true | true | false | false | Refresh-token issuance timestamp. |
| expiresAt | auth_refresh_tokens | timestamp | true | true | false | false | Refresh-token expiration timestamp. |
| rotatedAt | auth_refresh_tokens | timestamp nullable | false | true | false | false | Rotation timestamp for one-time use enforcement. |
| reusedAt | auth_refresh_tokens | timestamp nullable | false | true | false | false | Replay-detection timestamp. |
| revokedAt | auth_refresh_tokens | timestamp nullable | false | true | false | false | Revocation timestamp when a session family is revoked. |
| replacedByTokenId | auth_refresh_tokens | uuid/text nullable | false | true | false | false | Replacement token pointer for rotation lineage. |
| reason | auth_refresh_tokens | text nullable | false | false | false | false | Reason code for rotated, reused, revoked, or expired state. |
| id | auth_session_audit_events | uuid primary key | true | true | false | true | Append-only audit event identifier. |
| createdAt | auth_session_audit_events | timestamp | true | true | false | true | Append-only audit event creation timestamp. |
| action | auth_session_audit_events | session/refresh lifecycle enum | true | true | false | true | Lifecycle action for admin/support audit review. |
| sessionId | auth_session_audit_events | uuid/text nullable | false | true | false | true | Optional session reference for audit traceability. |
| refreshTokenId | auth_session_audit_events | uuid/text nullable | false | true | false | true | Optional refresh-token identifier; never stores raw token values. |
| userId | auth_session_audit_events | uuid/text nullable | false | true | true | true | Actor context for support audit traceability. |
| deviceId | auth_session_audit_events | text nullable | false | true | true | true | Device context for session-family investigations. |
| reason | auth_session_audit_events | text nullable | false | false | false | true | Reason code for denial, reuse, revocation, and cleanup events. |
| visibleToRoles | auth_session_audit_events | ADMIN | SUPPORT role list | true | true | true | true | Read-only visibility scope for admin/support audit export. |
| metadata | auth_session_audit_events | json nullable | false | false | false | true | Redacted event metadata for counts and replacement token ids. |

## Transition Constraints

| Transition | Kind | Methods | Precondition | State change | Audit | Failure mode | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| auth-session-contract-create-active-session | CREATE_SESSION | createSession<br>appendAuditEvent | Authenticated actor passes login checks. | Insert ACTIVE session with actor roles, device id, issuedAt, and expiresAt. | Append SESSION_CREATED audit row visible to ADMIN and SUPPORT. | Repository write failure must deny session issuance and return no token. | Fixture contract creates an ACTIVE session and append-only SESSION_CREATED audit evidence. |
| auth-session-contract-rotate-refresh-token | ROTATE_REFRESH_TOKEN | findRefreshTokenById<br>createRefreshToken<br>updateRefreshToken<br>appendAuditEvent | Refresh token hash matches an ACTIVE unexpired token. | Insert replacement ACTIVE refresh-token hash, mark old token ROTATED, and set replacedByTokenId. | Append REFRESH_TOKEN_ISSUED and REFRESH_TOKEN_ROTATED audit rows. | Any mismatch, missing token, or inactive token must deny refresh. | Fixture contract proves one-time refresh-token rotation and replacement metadata. |
| auth-session-contract-revoke-session-family | REVOKE_SESSION | endSessionAtomically<br>revokeSessionAtomically<br>appendAuditEvent | Session exists and must be ended or revoked. | Mark session REVOKED or ENDED and mark active refresh tokens REVOKED with a reason. | Append SESSION_REVOKED or SESSION_ENDED audit row. | Missing session returns false and must not create a replacement session. | Fixture and Prisma contracts terminate the session and active refresh-token family in one locked provider transaction with audit visibility. |
| auth-session-contract-expire-session-and-refresh-token | EXPIRE_SESSION | cleanupExpired<br>updateSession<br>updateRefreshToken<br>appendAuditEvent | Session or refresh token expires before or at cleanup time. | Mark eligible ACTIVE sessions and refresh tokens EXPIRED with stable reason codes. | Append SESSION_CLEANUP_EXPIRED when cleanup changes session or token state. | Expired rows must be denied by guard/refresh paths before any protected action. | Fixture contract expires sessions and refresh tokens without deleting audit history. |
| auth-session-contract-refresh-reuse-detection | REUSE_DETECTION | findRefreshTokenById<br>updateRefreshToken<br>updateSession<br>appendAuditEvent | A presented refresh token resolves to ROTATED, REUSED, REVOKED, or EXPIRED state. | Mark token REUSED once, revoke the related session family, and deny refresh. | Append REFRESH_TOKEN_REUSE_DENIED and SESSION_REVOKED audit rows. | Replay must fail closed with Unauthorized and no new refresh token. | Fixture contract captures replay denial, REUSED state, and session-family revocation. |
| auth-session-contract-fail-closed-lookup | FAIL_CLOSED_LOOKUP | findSessionById<br>findRefreshTokenById | Session lookup, token lookup, or ownership check returns missing/mismatched state. | No new session or refresh-token row is created; protected route or refresh request is denied. | Append REFRESH_TOKEN_DENIED for invalid refresh-token lookup when a token id is present. | Lookup gaps must deny access instead of allowing a stateless JWT fallback. | Fixture contract requires missing repository rows to fail closed. |

## Migration And Rollback Notes

| Note | Kind | Surface | Dry-run check | Rollback expectation | Summary |
| --- | --- | --- | --- | --- | --- |
| auth-session-repository-migration-dry-run-schema | MIGRATION_DRY_RUN | Prisma/PostgreSQL auth session migration draft | Verified non-production check: prisma migrate deploy plus schema/index/FK assertions against a random disposable localhost database. | Before production writes, rollback may drop draft tables; after writes, rollback must disable provider and preserve data. | The migration and Prisma repository are implemented and verified without production database access. |
| auth-session-repository-migration-dry-run-indexes | MIGRATION_DRY_RUN | Auth persistence indexes and constraints | Disposable-local integration verifies primary keys, tokenHash index, session/user/device/state/expiresAt indexes, and audit indexes. | Index rollback must be staged and measured before any production auth traffic depends on it. | Index and constraint checks ran only against a random localhost fixture database. |
| auth-session-repository-rollback-provider-flag | ROLLBACK_NOTE | AUTH_SESSION_STORE production repository provider flag | Provider tests prove local fixture default, explicit local/staging Prisma selection, and production rejection of fixture or missing configuration. | Rollback disables new persistent writes while preserving session, refresh-token hash, and audit rows for investigation. | Provider selection is implemented; post-activation rollback remains manual-gated and data-preserving. |
| auth-session-repository-rollback-backup-restore | ROLLBACK_NOTE | Backup and restore rehearsal for auth persistence tables | Disposable-local pre-activation rollback drops only the new auth objects and forward repair restores all three tables; staging backup/restore remains required. | Audit rows are append-only and must not be destructively rolled back after production enablement. | Backup/restore rehearsal remains a blocker before production_enabled can become true. |

## Evidence Rows

| Evidence | Count | IDs | Summary |
| --- | ---: | --- | --- |
| auth_sessions | 11 | auth-sessions-id<br>auth-sessions-user-id<br>auth-sessions-email<br>auth-sessions-roles<br>auth-sessions-device-id<br>auth-sessions-state<br>auth-sessions-issued-at<br>auth-sessions-expires-at<br>auth-sessions-ended-at<br>auth-sessions-revoked-at<br>auth-sessions-reason | 11 fixture-only auth_sessions schema contract field(s). |
| auth_refresh_tokens | 13 | auth-refresh-tokens-id<br>auth-refresh-tokens-session-id<br>auth-refresh-tokens-user-id<br>auth-refresh-tokens-device-id<br>auth-refresh-tokens-token-hash<br>auth-refresh-tokens-state<br>auth-refresh-tokens-issued-at<br>auth-refresh-tokens-expires-at<br>auth-refresh-tokens-rotated-at<br>auth-refresh-tokens-reused-at<br>auth-refresh-tokens-revoked-at<br>auth-refresh-tokens-replaced-by-token-id<br>auth-refresh-tokens-reason | 13 fixture-only auth_refresh_tokens schema contract field(s). |
| auth_session_audit_events | 10 | auth-audit-events-id<br>auth-audit-events-created-at<br>auth-audit-events-action<br>auth-audit-events-session-id<br>auth-audit-events-refresh-token-id<br>auth-audit-events-user-id<br>auth-audit-events-device-id<br>auth-audit-events-reason<br>auth-audit-events-visible-to-roles<br>auth-audit-events-metadata | 10 fixture-only auth_session_audit_events schema contract field(s). |
| CREATE_SESSION | 1 | auth-session-contract-create-active-session | 1 fixture-only create_session transition contract(s). |
| ROTATE_REFRESH_TOKEN | 1 | auth-session-contract-rotate-refresh-token | 1 fixture-only rotate_refresh_token transition contract(s). |
| REVOKE_SESSION | 1 | auth-session-contract-revoke-session-family | 1 fixture-only revoke_session transition contract(s). |
| EXPIRE_SESSION | 1 | auth-session-contract-expire-session-and-refresh-token | 1 fixture-only expire_session transition contract(s). |
| REUSE_DETECTION | 1 | auth-session-contract-refresh-reuse-detection | 1 fixture-only reuse_detection transition contract(s). |
| FAIL_CLOSED_LOOKUP | 1 | auth-session-contract-fail-closed-lookup | 1 fixture-only fail_closed_lookup transition contract(s). |
| MIGRATION_DRY_RUN | 2 | auth-session-repository-migration-dry-run-schema<br>auth-session-repository-migration-dry-run-indexes | 2 fixture-only migration_dry_run note(s). |
| ROLLBACK_NOTE | 2 | auth-session-repository-rollback-provider-flag<br>auth-session-repository-rollback-backup-restore | 2 fixture-only rollback_note note(s). |
| SAFETY_GATE | 16 | productionEnabled=false<br>productionDbUsed=false<br>noProductionDbRead=true<br>providerApiUsed=false<br>paymentProviderUsed=false<br>notificationProviderUsed=false<br>aiProviderExecutionUsed=false<br>liveAdsExecuted=false<br>realAuthMutationUsed=false<br>realSessionMutationUsed=false<br>realRefreshTokenMutationUsed=false<br>realAuditMutationUsed=false<br>realLearningMutationUsed=false<br>realErpMutationUsed=false<br>secretsRequired=false<br>deployUsed=false | Repository contract evidence is local-demo only and keeps production_ready=false and production_enabled=false. |
