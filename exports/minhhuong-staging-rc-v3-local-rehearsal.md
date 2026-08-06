# Isolated Staging Rehearsal Report

Generated: 2026-07-10T13:47:22.901Z

- Target: `minhhuong-staging-rc-v3-local`
- Classification: `isolated_nonproduction_local_staging`
- Status: **PASS**
- Approval: `MH_RC_V3_USER_DELEGATED_STAGING_CONDITIONAL_20260710_01` scoped to `staging_dry_run`
- Production ready: **false**
- Production enabled: **false**
- External providers: mock/fixture only

## Gate Checks

| Check | Status |
| --- | --- |
| migrationRollbackForwardRepair | PASS |
| backupChecksumRestore | PASS |
| stagingRpoObjective | PASS |
| stagingRtoObjective | PASS |
| twoProcessSession | PASS |
| twoProcessOperational | PASS |
| twoProcessAlert | PASS |
| privacyRedactionAccessExport | PASS |
| privacyExactRetentionCleanup | PASS |
| incidentDrill | PASS |
| resourceHeadroom | PASS |
| exactCleanup | PASS |

## Measured Evidence

- Migration/rollback/forward-repair command: 21903 ms
- Backup window: 394 ms
- Observed local RPO: 655 ms (objective <= 86400000 ms)
- Restore plus validation RTO: 1175 ms (objective <= 14400000 ms)
- Backup/restore digest match: true
- Minimum host free-memory headroom: 34.09% (required >= 30%)
- Alert contention maximum/P95: 516.1400000000003/516.1400000000003 ms

## Commands

| Slice | Status | Duration ms | Tests | Command |
| --- | --- | ---: | ---: | --- |
| migration-rollback-forward-repair | PASS | 21903 | 5 | `npm --prefix apps/api run test -- prisma-auth-session.integration.spec.ts --runInBand` |
| two-process-session-backup-restore | PASS | 15634 | n/a | `npm --prefix apps/api run smoke:auth-session-disposable` |
| two-process-operational-control | PASS | 15779 | n/a | `npm --prefix apps/api run smoke:auth-operational-control-disposable` |
| two-process-alert-state-privacy | PASS | 16117 | n/a | `npm --prefix apps/api run smoke:auth-operational-alert-state-disposable` |

## Timed Synthetic Incident Drill

- Correlation: `staging-incident:36e8470a-4500-4d5d-836d-486e731a7c3f`
- Acknowledgement: 72462 ms / 900000 ms
- Containment decision: 72462 ms / 1800000 ms
- Provider kill switch: true
- Decision: KEEP_PRODUCTION_DISABLED_AND_ROLL_BACK_TO_CLEAN_DISPOSABLE_STATE
- Recovery: true
- External alert delivery used: false

## Privacy And Retention

- Synthetic/pseudonymized fixtures only: true
- Read-only access and bounded export: true
- Redaction: true
- Exact expired-row deletion: true
- Default evidence retention: 30 days, expires 2026-08-09T13:47:22.901Z
- Raw identity/token/rate key/secret stored: false

## Exact Cleanup

- Matching random databases: 0
- Matching rehearsal processes: 0
- Matching listeners: 0
- Matching temporary artifacts: 0

## Truthful Limitations

- This is isolated localhost staging evidence, not hosted staging or production capacity evidence.
- Resource headroom is a host free-memory snapshot, not a production load or failover benchmark.
- External providers remained disabled; sandbox credentials were not supplied to this lane.
- A separate final release-owner decision is required before any production action.
