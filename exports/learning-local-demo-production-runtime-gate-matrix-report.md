# Learning Production Runtime Gate Matrix

Generated: 2026-07-10T03:00:00.000Z

## Decision

- decision=GO_LIVE_BLOCKED
- production_ready=false
- production_enabled=false
- fixture_only=true
- manual_go_live_approval_required=true

## Totals

- Gates: 9
- Closed by code: 2
- Pending staging: 5
- Pending manual approval: 2
- Production blockers: 7

## Gates

| Gate | Area | Decision | Production blocker | Current evidence | Required next evidence | Rollback / containment |
|---|---|---|---:|---|---|---|
| runtime-config-fail-closed | ENVIRONMENT_SEPARATION | CLOSED_BY_CODE | no | Production bootstrap rejects insecure JWT, permissive/non-HTTPS CORS, local public URLs, local demo database credentials, an explicit local-demo route enable flag, and filesystem upload configurations that claim more than one API replica. All upload surfaces and static serving resolve through one UPLOADS_PATH contract, and readiness proves the path is writable. Paths: apps/api/src/runtime-safety/production-runtime-safety.ts, apps/api/src/main.ts, apps/api/src/auth/auth.module.ts, apps/api/src/upload-storage/filesystem-upload-storage.ts, apps/api/src/health/dependency-readiness.service.ts, exports/learning-local-demo-upload-storage-hardening-matrix-report.json | None; local control closed. | Rollback may revert the release artifact, but must never restore placeholder production secrets or credentialed wildcard CORS. |
| local-demo-route-containment | LOCAL_DEMO_CONTAINMENT | CLOSED_BY_CODE | no | Learning and ERP local-demo controllers use a shared guard that returns not found whenever NODE_ENV=production. Paths: apps/api/src/runtime-safety/local-demo-only.guard.ts, apps/api/src/learning-local-demo/learning-local-demo.controller.ts, apps/api/src/erp-local-demo/erp-local-demo.controller.ts | None; local control closed. | Keep demo seed/report generation as an offline command; never re-enable HTTP demo routes in production. |
| migration-and-rollback-rehearsal | MIGRATION_ROLLBACK | BLOCKED_PENDING_STAGING | yes | Prisma migrations and local recovery evidence exist, but there is no current staging migrate/rollback rehearsal for this release candidate. Paths: apps/api/prisma/migrations, audit-output/promt_hoctap_minhhuong_4B_db_migration_recovery/promt_hoctap_minhhuong_4B_db_recovery_report.md | Disposable staging migration dry-run with schema diff approval. Timed rollback rehearsal that preserves append-only audit data. | Disable new release writes first; use forward repair after data writes rather than destructive schema rollback. |
| backup-and-restore-rehearsal | BACKUP_RESTORE | BLOCKED_PENDING_STAGING | yes | No current staging backup artifact, restore checksum, recovery point, or recovery time evidence is present. Paths: docs/hoctap_minhhuong/production_hardening_go_live_gate.md | Encrypted staging backup with retention owner and checksum. Restore rehearsal with measured RPO/RTO and data integrity checks. | Keep production_enabled=false until restore success is independently verified. |
| monitoring-alerting-and-incident-runbook | MONITORING_INCIDENT | BLOCKED_PENDING_STAGING | yes | GET /health, local container healthchecks, and a disposable-local shared Prisma auth limiter/counter adapter exist; production dashboards, alerts, log correlation, on-call owner, retention approval, and incident rehearsal do not. Paths: apps/api/src/health/health.controller.ts, apps/api/src/auth/auth-operational-control.ts, apps/api/src/learning-local-demo/auth-operational-control-matrix.ts, docker-compose.yml | Shared multi-instance rate-limit/metrics adapter plus staging health, error-rate, latency, auth-denial, refund, and payout alert smoke. Incident response and rollback owner acknowledgement. | Use a release kill switch and stop new writes when health or reconciliation alerts breach approved thresholds. |
| privacy-audit-and-retention | PRIVACY_AUDIT_RETENTION | BLOCKED_PENDING_STAGING | yes | Fixture permission/redaction and append-only audit expectations exist; approved retention, deletion, export, and incident access evidence does not. Paths: apps/api/src/learning-local-demo/learning-local-demo.production-hardening.spec.ts, apps/api/src/learning-local-demo/auth-persistence-security-gate-matrix.ts | Approved child-data, AI transcript, auth audit, and upload retention schedule. Staging redaction/export/deletion dry-run with support access audit. | Disable exports/provider sends without deleting append-only audit records needed for investigation. |
| auth-persistence-and-distributed-revocation | AUTH_PERSISTENCE | BLOCKED_PENDING_STAGING | yes | Prisma auth persistence, atomic refresh rotation, replay denial, repository fail-closed behavior, and two-client shared revocation are disposable-local verified; approved staging rehearsal is absent. Paths: apps/api/src/learning-local-demo/auth-refresh-lifecycle-matrix.ts, apps/api/src/learning-local-demo/auth-session-repository-contract-matrix.ts, apps/api/src/auth/prisma-auth-session.store.ts, apps/api/src/auth/prisma-auth-session.integration.spec.ts | Approved staging migration, backup/restore, and retention evidence for the implemented persistent AuthSessionStore. Two-process staging API revocation and repository outage smoke. | Disable new sessions and preserve token/audit hashes if the persistent store or distributed revocation layer fails. |
| live-provider-execution-gates | LIVE_PROVIDER_EXECUTION | BLOCKED_PENDING_MANUAL_APPROVAL | yes | Payment, refund, payout, notification, and AI behavior is local-fixture/mock-only; no live provider call is authorized. Paths: docs/hoctap_minhhuong/production_hardening_go_live_gate.md, apps/api/src/ai-chat/ai-chat.service.ts | Approved secret-store, webhook verification, idempotency, reconciliation, rate/loss limit, and kill-switch design per provider. Staging-only provider smoke with explicit human approval. | Keep provider modes disabled and retain manual, fixture-only evidence until each provider has a separately approved rollback plan. |
| manual-go-live-approval | MANUAL_GO_LIVE_APPROVAL | BLOCKED_PENDING_MANUAL_APPROVAL | yes | The canonical BA and hardening source of truth explicitly require production_ready=false and a separate manual approval. Paths: docs/hoctap_minhhuong/00_truc_lamviec_hoctap_minhhuong.md, docs/hoctap_minhhuong/production_hardening_go_live_gate.md | Named approver, timestamp, release version, accepted residual risks, rollback owner, and production enablement record. | No automatic loop may set production_ready or production_enabled to true. |

## Safety

- productionDbUsed=false
- providerApiUsed=false
- paymentMutationUsed=false
- refundMutationUsed=false
- payoutMutationUsed=false
- notificationDeliveryUsed=false
- liveAiProviderUsed=false
- realStudentMutationUsed=false
- productionDeployUsed=false
- plaintextSecretsIncluded=false
