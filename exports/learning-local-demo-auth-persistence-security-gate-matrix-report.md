# Learning Local Demo Auth Persistence Security Gate Matrix

Generated at: 2026-07-01T03:00:00.000Z

Endpoint: /v1/learning-local-demo/auth-persistence-security-gate-matrix-report
JSON export: exports/learning-local-demo-auth-persistence-security-gate-matrix-report.json
Markdown export: exports/learning-local-demo-auth-persistence-security-gate-matrix-report.md
Dashboard: /admin/learning-local-demo#auth-persistence-security-gate-matrix

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
- realAuditMutationUsed=false
- realLearningMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Security design gates: 6
- Schema/repository contract rows: 1
- Distributed revocation contract rows: 1
- Refresh retention/reuse policy rows: 1
- Audit retention/export policy rows: 1
- Rate-limit/monitoring hook rows: 1
- Rollback/migration note rows: 1
- Production blockers: 6
- Manual approvals required: 6
- Safety gates closed: 13/13
- Open safety gates: 0

## Security Gate Rows

| Gate | Kind | Contract surface | Required controls | Planned verification | Rollback/migration | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| auth-persistence-schema-repository-contract-design | SCHEMA_REPOSITORY_CONTRACT | AuthSessionStore production repository contract for auth_sessions, auth_refresh_tokens, and auth_session_audit_events. | Store only refresh-token hashes, never raw refresh tokens.<br>Use indexed session id, user id, device id, state, and expiresAt columns.<br>Constrain refresh-token state transitions to ACTIVE, ROTATED, REUSED, REVOKED, and EXPIRED.<br>Write audit events append-only with admin/support read filters. | Repository contract and migration/rollback tests pass against a disposable non-production database.<br>Staging migration diff, backup/restore, and security review remain required before any production deploy. | Add tables behind a repository provider flag; rollback before production writes may drop tables, while rollback after writes must disable the provider and preserve data for audit. | Production schema/repository design is documented as a contract only; no production DB was read or mutated. |
| auth-persistence-distributed-revocation-contract | DISTRIBUTED_REVOCATION_CONTRACT | Cross-instance session and refresh-token revocation behavior for JWT guard and refresh endpoint. | Central revocation version or updatedAt cursor checked by every instance.<br>Refresh-token reuse revokes the related session family across devices.<br>JWT guard must fail closed when repository lookup or revocation cache is unavailable. | Two-instance non-production smoke: revoke on instance A and deny on instance B.<br>Cache outage test proves fail-closed behavior for protected routes. | Distributed revocation must launch with a kill switch that reverts traffic to the current local/session guard behavior only in non-production until manual approval. | Distributed revocation is specified as an expected cross-instance contract and remains a production blocker until staged. |
| auth-persistence-refresh-retention-reuse-policy | REFRESH_RETENTION_REUSE_POLICY | Refresh-token retention, rotation, reuse response, and session-family revocation policy. | Retain inactive refresh-token hashes for at least 30 days, subject to legal/security review.<br>On reused token detection, mark token REUSED, revoke the session family, and emit an audit event.<br>Deny refresh for expired or non-active tokens with a stable unauthorized response. | Retention cleanup dry-run report shows deleted candidates without deleting production data.<br>Replay test proves reused token denial and session-family revocation. | Retention cleanup must run in dry-run mode first; rollback disables cleanup scheduling and preserves token hash rows. | Refresh-token retention and reuse response are policy evidence only; no production token data was accessed. |
| auth-persistence-audit-retention-read-only-export-policy | AUDIT_RETENTION_EXPORT_POLICY | Auth lifecycle audit retention, admin/support visibility, and read-only export policy. | Audit export must be read-only and scoped to admin/support roles.<br>Exports must redact token hashes and avoid raw IP/user-agent payloads unless approved.<br>Retention must be documented before production enablement. | Read-only export smoke proves admin/support can export and student cannot.<br>Audit payload scan proves no raw refresh tokens or secrets are present. | Audit tables are append-only; rollback may disable export endpoints but must not delete retained audit rows. | Audit retention/export policy is represented as read-only fixture evidence and remains production gated. |
| auth-persistence-rate-limit-monitoring-hooks | RATE_LIMIT_MONITORING_HOOKS | Login, refresh, logout, session revocation, audit export, and cleanup monitoring hooks. | Replace the process-local fixture with a shared multi-instance limiter keyed by approved actor, IP, and device signals.<br>Export the implemented counters through an approved metrics adapter and retention policy.<br>Route alerts for refresh-token replay spikes and repository lookup failures to an acknowledged incident owner. | Completed locally: deterministic tests verify counter names, hashed-key snapshots, and role-scoped audit export totals.<br>Completed locally: repeated login and refresh failures return 429; rate-limit seam outage returns service unavailable.<br>Still required: multi-process staging smoke proves shared windows, metric export, and alert routing. | Monitoring hooks must be additive; rollback removes dashboards/alerts before removing emitted metric names. | Rate-limit and monitoring hooks are implemented and fixture-verified without calling any live provider or exposing secrets; shared production controls remain blocked. |
| auth-persistence-rollback-migration-notes | ROLLBACK_MIGRATION_NOTES | Auth persistence migration, rollback, and production enablement runbook notes. | Run migration in staging with disposable fixtures before production.<br>Take and verify backup/restore evidence before enabling persistent auth sessions.<br>Keep production_ready=false until security review and manual go-live approval. | Staging migration dry-run and rollback rehearsal evidence.<br>Backup/restore rehearsal evidence tied to auth session tables. | Rollback after production writes must disable new writes and preserve tables; destructive rollback is allowed only before production enablement. | Rollback and migration notes are captured as local evidence; no deploy or production migration was run. |

## Evidence Rows

| Evidence | Count | IDs | Summary |
| --- | ---: | --- | --- |
| SCHEMA_REPOSITORY_CONTRACT | 1 | auth-persistence-schema-repository-contract-design | 1 fixture-only schema_repository_contract design evidence row(s). |
| DISTRIBUTED_REVOCATION_CONTRACT | 1 | auth-persistence-distributed-revocation-contract | 1 fixture-only distributed_revocation_contract design evidence row(s). |
| REFRESH_RETENTION_REUSE_POLICY | 1 | auth-persistence-refresh-retention-reuse-policy | 1 fixture-only refresh_retention_reuse_policy design evidence row(s). |
| AUDIT_RETENTION_EXPORT_POLICY | 1 | auth-persistence-audit-retention-read-only-export-policy | 1 fixture-only audit_retention_export_policy design evidence row(s). |
| RATE_LIMIT_MONITORING_HOOKS | 1 | auth-persistence-rate-limit-monitoring-hooks | 1 fixture-only rate_limit_monitoring_hooks design evidence row(s). |
| ROLLBACK_MIGRATION_NOTES | 1 | auth-persistence-rollback-migration-notes | 1 fixture-only rollback_migration_notes design evidence row(s). |
| SAFETY_GATE | 13 | productionDbUsed=false<br>noProductionDbRead=true<br>providerApiUsed=false<br>paymentProviderUsed=false<br>notificationProviderUsed=false<br>aiProviderExecutionUsed=false<br>liveAdsExecuted=false<br>realAuthMutationUsed=false<br>realSessionMutationUsed=false<br>realRefreshTokenMutationUsed=false<br>realAuditMutationUsed=false<br>realLearningMutationUsed=false<br>secretsRequired=false | Auth persistence security gate evidence is local-demo only and keeps production_ready=false. |
