# Auth Operational Alert Policy Matrix

Generated: 2026-07-10T06:00:00.000Z

Decision: AUTH_ALERT_AUDIT_READ_MODEL_DISPOSABLE_LOCAL_VERIFIED

- production_ready=false
- production_enabled=false
- disposableLocalOnly=true
- externalAlertProviderUsed=false
- liveNotificationUsed=false

## Threshold And Cooldown Evidence

| Alert | Metric | Severity | Threshold | Observed | Initial | Repeated inside cooldown |
| --- | --- | --- | ---: | ---: | --- | --- |
| LOGIN_THROTTLE_THRESHOLD | LOGIN_THROTTLED | WARNING | 5 | 7 | OPEN | SUPPRESSED_COOLDOWN |
| REFRESH_THROTTLE_THRESHOLD | REFRESH_THROTTLED | WARNING | 5 | 6 | OPEN | SUPPRESSED_COOLDOWN |
| REFRESH_REPLAY_DETECTED | REFRESH_REPLAY_DENIED | CRITICAL | 1 | 2 | OPEN | SUPPRESSED_COOLDOWN |
| SESSION_REPOSITORY_ERROR_DETECTED | SESSION_REPOSITORY_ERROR | CRITICAL | 1 | 1 | OPEN | SUPPRESSED_COOLDOWN |

## Inspection Permission Evidence

| Role | Decision | Snapshot read attempted | Actor identity exposed |
| --- | --- | --- | --- |
| ADMIN | ALLOWED_READ_ONLY | YES | NO |
| SUPPORT | ALLOWED_READ_ONLY | YES | NO |
| STUDENT | DENIED_BEFORE_SNAPSHOT | NO | NO |
| PARENT | DENIED_BEFORE_SNAPSHOT | NO | NO |

## Audit Correlation Lookup And Incident Export

- Fixture correlations: 3
- Expected page sizes: 2, 1
- Deterministic order: evaluatedAt_DESC_correlationId_DESC
- Maximum window days: 7
- Maximum page size: 100
- Allowed roles: ADMIN, SUPPORT
- Denied before repository read: STUDENT, PARENT
- Repository outage HTTP status: 503
- External delivery used: false
- Excluded field families: identity, rate-key, credential, access-token, refresh-token, input-digest, fingerprint

## Snapshot Outage

- Expected HTTP status: 503
- Fail closed: true
- State outage expected HTTP status: 503
- State outage fail closed: true
- Audit outage expected HTTP status: 503
- Audit outage fail closed: true

## Disposable Shared-State Smoke Contract

- Independent Nest processes: 2
- Random localhost PostgreSQL databases: 1
- Concurrent evaluations: 8
- OPEN candidate sets: 1
- Cooldown-suppressed candidate sets: 7
- Exact expired-state cleanup: true
- Append-only audit: true
- Idempotent redacted correlation: true
- Exact expired-audit cleanup: true
- Lock contention measured: true
- Local technical threshold (ms): 5000

## Production Blockers

- External alert routing and delivery are not implemented or called.
- Shared Prisma cooldown/audit state and explicit rolling windows are disposable-local verified only; approved staging migration and calibration remain open.
- Local redacted correlation and contention evidence do not replace production dashboards, log/trace integration, capacity testing, or approved on-call thresholds.
- The audit lookup/export is a bounded JSON read model only; incident ownership, approved retention/export handling, security review, and manual go-live approval remain open.
