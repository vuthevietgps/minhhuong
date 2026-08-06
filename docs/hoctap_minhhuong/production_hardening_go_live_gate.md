# Minh Huong Learning - Production Hardening And Go-Live Gate

Updated: 2026-07-10

This document is the source of truth for the phase that starts after the learning-core MVP/local-demo loop passes while `production_ready=false`.

The phase is safe for Codex auto-loop only when it stays in repo-local, hardening-local, staging dry-run, staging read-only, or production-readiness-audit scope. It must not deploy production, read/write production DB, call live providers, mutate payment/refund, send live notifications, execute live AI provider calls, or mutate real user/customer data.

## 1. Required Next Job Family

When the latest MVP/local-demo job is `PASS` or `PASS_WITH_NOTES`, and there is no blocking local-demo slice left, ChatGPT Web should create the next Codex job in this family:

```text
LEARNING_CORE_PRODUCTION_HARDENING_GO_LIVE_GATE
```

Recommended first job:

```text
codex_job_minhhuong_XXXXX_learning_core_production_hardening_go_live_gate
```

Recommended safe scope:

```text
production_readiness_audit
```

Allowed fallback scopes:

```text
hardening_local_only
repo_local_only
code_and_tests_only
staging_dry_run
staging_readonly
evidence_only
```

`production_ready` must remain `false` unless a separate manual go-live approval exists.

## 2. Immutable Test Standard

Codex and ChatGPT Web must preserve the current test standard.

Hard rules:

- Do not delete, skip, relax, rename, or rewrite an existing test/acceptance criterion just to pass.
- If a test fails, fix code, data, fixture, config, or evidence first.
- Only change a test when it is demonstrably wrong against BA/truc/current product facts.
- Any proposed test standard change must create `TEST_STANDARD_CHANGE_REQUEST.md`.
- New tests may be added to increase coverage.
- Existing coverage must not be reduced.

Every hardening job must record:

- Commands run.
- Tests passed.
- Tests failed.
- Tests skipped and why.
- Remaining risk.
- Whether any test standard was changed.

## 3. Demo Data Completeness Matrix

The demo dataset must support full role journeys and negative cases, not just API 200 smoke.

| Role          | Required Sample Data                                                                   | Required Positive Cases                                                         | Required Negative/Edge Cases                                                        |
| ------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Parent        | At least 2 children: active entitlement and expired/no entitlement                     | View approved report, read/ack inbox, grant screen time, see daily plan         | Cannot see another parent's child, hidden held preview, expired entitlement blocked |
| Child/Student | Course enrollment, subscription fixture, daily plan, progress, practice, support state | Start allowed plan, complete lesson/practice, generate progress/report evidence | Blocked by entitlement, blocked by screen time, stale/invalid plan, failed retry    |
| Teacher       | Assigned course/class, report review queue, intervention, remedial/support plan        | Review/approve report preview, create support path evidence, close escalation   | Cannot access unassigned student/course, held preview stays hidden                  |
| Admin         | System/report/audit visibility                                                         | Review readiness, inspect safety gates, see demo data/report evidence           | No production mutation, no provider/payment execution                               |
| Support/Ops   | Issue/escalation/read-only monitoring fixtures                                         | Inspect parent/student issue and support outcome                                | Cannot bypass privacy/redaction without audit                                       |
| Sales/Channel | Lead/order/subscription/payment/refund/commission fixtures if enabled                  | Trace subscription/payment/refund/commission evidence                           | No live payment/refund/provider mutation                                            |

Minimum lifecycle states:

- Active.
- Trialing/pending payment where relevant.
- Expired.
- Revoked/cancelled where relevant.
- Refunded where relevant.
- Needs support.
- Unresolved support.
- Escalated.
- Resolved/closed.

## 4. Required Test Matrix

The first hardening job should inventory existing tests and add missing tests without weakening current ones.

Required areas:

| Area                    | Required Coverage                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Auth/session            | Login, logout, expired token, revoked session/device, wrong role                                                       |
| RBAC/data permission    | Parent-child ownership, teacher assigned scope, admin/support audit access, forbidden cross-tenant/cross-parent access |
| Enrollment/subscription | Active, trialing, pending payment, expired, revoked, refunded entitlement outcomes                                     |
| Daily plan/screen time  | Allowed, blocked by entitlement, blocked by screen-time cap, parent grant, stale/invalid plan                          |
| Learning evidence       | Lesson/video/practice completion, retry completion, unresolved retry, support plan, escalation, resolution             |
| Parent/teacher reports  | Approved preview visible, held preview hidden, read/ack trace, privacy redaction                                       |
| AI Buddy                | Mock/dev boundary, moderation/safety, quota/cost ledger, no false production-AI claim                                  |
| Payment/refund/provider | Fixture-only evidence, idempotency/reconciliation design, no live mutation in auto-loop                                |
| API contract/error      | Validation, forbidden, not found, conflict/idempotency where relevant, consistent error shape                          |
| Build/smoke             | `npm run seed:demo`, `npm run report:demo`, `npm run test:learning-local`, build/lint where in scope                   |

## 5. Required Outputs

Each hardening Codex job must produce the standard output contract plus the relevant hardening artifacts.

Standard output contract:

```text
CHATGPT_REVIEW_BUNDLE.md
RESULT.md
RESULT.json
REVIEW_PACKET.md
MANIFEST.json
FILES_CHANGED.md
TESTS_RUN.md
RISKS_AND_GAPS.md
NEXT_CONTEXT_PACKET.md
NEXT_CONTEXT_INDEX.json
CONTEXT_DELTA.md
```

Hardening artifacts:

```text
PRODUCTION_HARDENING_PLAN.md
DEMO_DATA_MATRIX.md
ROLE_PERMISSION_TEST_MATRIX.md
E2E_SMOKE_TEST_MATRIX.md
DEPLOY_READINESS_GAPS.md
GO_LIVE_GATE_REPORT.md
TEST_STANDARD_CHANGE_REQUEST.md
```

`TEST_STANDARD_CHANGE_REQUEST.md` is only required when Codex proposes changing a test/acceptance standard.

## 6. Go-Live Gate Criteria

Production can be considered only after all criteria below have evidence:

- Full demo data matrix exists and passes smoke.
- Existing tests are preserved.
- Required missing tests are implemented or listed as blocking gaps.
- Role permission negative tests exist for parent/child and teacher scope.
- Auth/session/revocation model is implemented or marked as blocking gap.
- Environment separation is documented.
- Migration/deploy/rollback runbook exists.
- Backup/restore runbook exists.
- Monitoring/health/error logging/audit evidence exists.
- Payment/refund/provider/live notification/AI provider gates are explicit.
- Privacy/redaction/audit behavior has tests or blocking gaps.
- `production_ready=false` remains false until manual approval.

## 7. ChatGPT Web Review Rule

ChatGPT Web should review hardening outputs with the same rule as product work:

- PASS only if evidence exists.
- PASS_WITH_NOTES only if no blocking hardening gate is violated.
- FAIL/BLOCKED if a hard-stop is crossed, test standards were weakened, demo data is incomplete for claimed coverage, or production readiness is claimed without evidence.
- `NO_NEXT_JOB` is valid only when the hardening gate is complete or no safe non-production work remains.

## 8. Current Hardening Baseline - Job 00034

Updated: 2026-06-30

The first production hardening gate pass is repo-local and evidence-only. It does not claim production readiness.

Current verified local-demo evidence:

- MVP role journey entrypoints exist for student, parent, teacher, and admin/operator on the same Minh/course A1 path.
- Demo data covers 4 students, 4 enrollments, 4 subscriptions, 4 fixture payments, 1 fixture refund, and 4 fixture commission rows.
- Entitlement evidence covers unlocked, pending-payment blocked, and refunded blocked access.
- Screen-time evidence covers allowed and blocked daily-plan sessions with blocked reasons and next safe actions.
- Permission evidence covers owning-parent allow, non-owning-parent deny, assigned-teacher allow, admin read-only class scope, and redacted/denied field reasons.
- AI Buddy evidence is mock/dev-only and covers blocked safety topics with teacher review and parent summaries.
- Acceptance traceability remains mapped for the local-demo MVP slices with `production_ready=false`.

Blocking gaps before any production claim:

- Teacher unassigned-class denial is not yet represented as an automated permission case.
- Expired and revoked entitlement lifecycle states are not yet present in the current hardening fixture matrix.
- Support/ops audit access is represented only indirectly through admin/operator evidence and still needs explicit support/ops negative and audit rows.
- Auth/session hardening lacks refresh token, device/session revocation, expired token, and wrong-role smoke evidence.
- Deployment, rollback, backup/restore, monitoring, privacy retention, payment provider, notification provider, and AI provider gates remain documentation gaps until supported by staging or read-only evidence.

Required status until those gaps are closed:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 9. Role Permission And Entitlement Lifecycle Hardening - Job 00035

Updated: 2026-06-30

This slice closes the repo-local evidence gaps called out by job 00034 without changing production readiness.

Verified fixture-only additions:

- Entitlement lifecycle hardening matrix now includes 5 deterministic rows: active, pending payment, refunded, expired snapshot, and revoked snapshot.
- Expired entitlement evidence is represented by `entitlement-lifecycle-sub-ava-a1-expired-snapshot` with `BLOCKED_EXPIRED`.
- Revoked entitlement evidence is represented by `entitlement-lifecycle-sub-khoa-a1-revoked-snapshot` with `BLOCKED_REVOKED`.
- Teacher negative permission matrix now includes `permission-case-teacher-mai-unassigned-phonics-denied`.
- Support/ops audited read-only access is explicit through `permission-case-support-ops-lan-audit-read-only`, including a denied `liveMutation` field.
- Seed/report console evidence now prints lifecycle expired/revoked counts plus teacher-unassigned and support/ops audit counts.

Closed local-demo hardening gaps:

- Teacher unassigned-class denial is represented as an automated permission case.
- Expired and revoked entitlement lifecycle states are represented in the hardening fixture matrix.
- Support/ops audit access is explicit as read-only with mutation denial evidence.

Remaining blockers before any production claim:

- Auth/session hardening still lacks refresh token, device/session revocation, expired token, and wrong-role smoke evidence.
- Production deploy readiness remains open for environment separation, migration/deploy/rollback, backup/restore, monitoring, privacy retention, payment provider, notification provider, and AI provider gates.
- All evidence is still repo-local fixture evidence; no production DB, provider, payment/refund, notification, AI, deploy, or real student/customer/order mutation was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 10. Persistent Auth Session And Refresh Lifecycle - Job 00037

Updated: 2026-07-01

This slice extends the repo-local auth/session hardening evidence without changing production readiness.

Verified fixture-only additions:

- `AuthSessionService` now uses a store abstraction through `AUTH_SESSION_STORE`, backed in local demo by `FixtureBackedAuthSessionStore`.
- Fixture-backed session lookup is shared across service instances, proving the local persistent lookup seam without a production database.
- Login now issues an additive refresh token, and `POST /auth/refresh` rotates it while preserving the existing access-token/session response surface.
- Rotated refresh tokens are denied on replay.
- Reused refresh tokens are marked `REUSED`, denied, audited, and revoke the related local-demo session.
- Cross-device revocation can revoke other sessions for the same user while keeping the current session active.
- Expired session and refresh-token cleanup is represented by local fixture-store cleanup evidence.
- Admin/support read-only audit visibility is explicit; learner roles receive no audit event rows.
- Seed/report evidence now exports `learning-local-demo-auth-refresh-lifecycle-matrix-report.json` and `.md`.

Closed local-demo hardening gaps:

- Persistent auth session lookup seam is represented by a fixture-backed store abstraction.
- Refresh token rotation and reuse denial have automated local tests and report rows.
- Cross-device revocation and expiry cleanup have automated local tests and report rows.
- Admin/support auth lifecycle audit visibility has automated local tests and report rows.

Remaining blockers before any production claim:

- The auth session store is still fixture-backed; production-grade database persistence, distributed cross-instance revocation, retention policy, monitoring, and security review remain open.
- Deployment, rollback, backup/restore, payment provider, notification provider, AI provider, and live operations gates remain open.
- All evidence remains repo-local fixture evidence; no production DB, provider API, payment/refund, notification, AI, deploy, or real student/customer/order mutation was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 11. Auth Persistence Security Gate Design - Job 00038

Updated: 2026-07-01

This slice adds repo-local design evidence for the production auth persistence gate without changing production readiness.

Verified fixture-only additions:

- `learning-local-demo-auth-persistence-security-gate-matrix-report.json` and `.md` now document six auth persistence security design gates.
- The matrix covers production schema/repository contract design for `AuthSessionStore` without reading or connecting to a production database.
- The distributed revocation contract documents expected cross-instance denial behavior and fail-closed expectations for JWT/session checks.
- The refresh-token retention/reuse policy documents hash-only retention, replay denial, session-family revocation, and dry-run cleanup expectations.
- The audit retention/export policy documents append-only audit events, admin/support read-only export, and redaction requirements.
- The rate-limit/monitoring hook gate documents login/refresh throttling, replay alerts, repository error metrics, and audit export counters.
- The rollback/migration notes document staged migration, feature flag, backup/restore, rollback, and manual approval requirements.
- Seed/report console evidence now prints auth persistence security gate counts, production blocker counts, and local safety gate counts.

Closed local-demo hardening gaps:

- Production DB schema/repository contract evidence is now structured and reviewable while remaining fixture-only.
- Distributed revocation, retention/reuse response, audit export, monitoring/rate-limit, and rollback/migration notes are represented in the local security gate matrix.

Remaining blockers before any production claim:

- The production auth session repository is not implemented or enabled.
- Cross-instance revocation has not been staged against multiple API instances.
- Rate limiting, monitoring provider hooks, backup/restore rehearsal, migration dry-run, and external security review remain open.
- All evidence remains repo-local fixture evidence; no production DB, provider API, payment/refund, notification, AI, deploy, or real student/customer/order mutation was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 12. Production Runtime Environment Separation - Job 00058

Updated: 2026-07-10

This repo-local slice closes two code-enforceable environment-separation gaps without enabling production.

Verified additions:

- Production bootstrap now fails closed when the JWT secret is missing, short, or a documented placeholder.
- Credentialed production CORS now requires an explicit non-local HTTPS allowlist; wildcard, HTTP, and localhost origins are rejected.
- Production public API/web URLs and PostgreSQL URL must be non-local; local demo database credentials are rejected.
- `learning-local-demo/*` and `erp-local-demo/*` controllers now return not found in production through a shared guard.
- Seed/report commands export `learning-local-demo-production-runtime-gate-matrix-report.json` and `.md`.
- The executable matrix records 9 gates: 2 closed by code and 7 blocked pending staging or manual evidence.

Remaining blockers before any production claim:

- Staging migration/rollback and backup/restore rehearsals.
- Production monitoring, alerting, incident ownership, privacy/audit retention, and distributed auth persistence evidence.
- Separately approved live-provider safety, reconciliation, loss limits, kill switches, and manual go-live approval.
- No production deploy, production DB access, provider call, or real learner/payment/refund/payout mutation was performed.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 13. Prisma Auth Session Store Local/Staging - Job 00059

Updated: 2026-07-10

This repo-local implementation slice replaces the fixture-only production design gap with executable Prisma repository code and disposable-local database evidence. It does not enable production.

Verified additions:

- `PrismaAuthSessionStore` implements the existing `AUTH_SESSION_STORE` seam for sessions, hashed refresh tokens, and append-only audit events.
- The store contract is asynchronous so JWT checks, refresh, logout, revocation, audit, and cleanup wait for the central repository result.
- Local demo remains fixture-backed by default; explicit Prisma selection is supported for disposable local/staging, while production rejects fixture or missing provider configuration.
- Repository outage and inconsistent-row behavior fails closed with a controlled service-unavailable response.
- A migration creates `auth_sessions`, `auth_refresh_tokens`, and `auth_session_audit_events` with foreign keys and lookup/expiry indexes.
- Disposable-local migration tests use a random localhost database, two independent Prisma clients, hash-only refresh persistence, cross-instance revocation denial, pre-activation rollback, forward repair, and exact fixture cleanup.
- Seed/report export `learning-local-demo-prisma-auth-session-store-matrix-report.json` and `.md`.

Remaining blockers before any production claim:

- Approved staging migration, backup/restore, and two-process API rehearsal.
- Monitoring, alert routing, incident ownership, retention approval, and external security review.
- Separate manual go-live approval. No production database or real session was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 14. Auth Rate Limit And Operational Monitoring Hooks - Job 00060

Updated: 2026-07-10

This repo-local implementation slice adds deterministic auth throttling and operational counters behind an injectable seam. It does not connect to an external monitoring provider or enable production.

Verified additions:

- Login identities and refresh-token fingerprints are SHA-256 keyed before local rate-window storage; snapshots contain no raw credential or refresh token.
- Repeated login and refresh attempts return HTTP 429 with a retry interval.
- Rate-limit control outage fails login/refresh closed with a controlled service-unavailable response.
- Counters cover login/refresh success, denial and throttle; refresh replay; repository outage; expired session/token cleanup; and admin/support versus learner audit export.
- Seed/report export `learning-local-demo-auth-operational-control-matrix-report.json` and `.md` with seven local verified rows, one shared-control blocker, and zero open local safety gates.

Remaining blockers before any production claim:

- A shared multi-instance rate-limit and metrics adapter, dashboards, alert routing, and approved retention policy.
- Approved staging migration, backup/restore, two-process API smoke, incident rehearsal, and external security review.
- Separate manual go-live approval. No production DB, external monitoring provider, provider API, or real session/learner/payment mutation was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 15. Disposable Auth Session Backup/Restore And Two-Process Smoke - Job 00061

Updated: 2026-07-10

This repo-local implementation slice adds a real two-process API and PostgreSQL backup/restore rehearsal around the Prisma auth-session repository. It does not access staging or production and does not enable production.

Verified additions:

- A localhost-only harness creates random source/restore databases, migrates synthetic fixtures, starts two independent Nest API processes, and uses refresh replay to revoke the shared session family.
- An access token accepted by process B before revocation is denied by process B after process A persists the replay revocation.
- Repository unavailability is forced by disabling the random source database; protected access returns service unavailable rather than accepting the token.
- `pg_dump`/`pg_restore` preserves the revoked session, two hashed refresh-token rows, and append-only audit rows with a matching deterministic digest.
- Evidence records the local backup window, observed snapshot-age RPO, restore-plus-validation RTO, hash-only persistence, and exact cleanup.
- AuthModule now wires option-bearing fixture classes with explicit zero-argument factories so a real Nest process can bootstrap; a focused DI regression test protects the wiring.

Remaining blockers before any production claim:

- Database-owner-approved staging backup/restore, accepted staging RPO/RTO, and staging incident rehearsal.
- Shared multi-instance rate-limit/metrics adapter, dashboards, alert routing, incident ownership, retention approval, and external security review.
- Separate manual go-live approval. Local timing evidence is not a production SLA, and no production/staging database or real account/session was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 16. Shared Auth Operational Control Disposable Local - Job 00062

Updated: 2026-07-10

This repo-local slice implements the shared `AuthOperationalControl` adapter named by job 00061's reviewed next-context packet. The incoming transport retained an older manual-paid-pilot title, but the canonical axis records that Prompt 15B was already closed; this slice does not reopen payment/refund/commission behavior.

Verified additions:

- `PrismaAuthOperationalControl` persists only HMAC-SHA256 rate keys and uses PostgreSQL transaction advisory locks for atomic login/refresh admission across processes.
- Metric increments use shared database upserts; snapshots aggregate unexpired hourly buckets without raw keys or tokens.
- Rate-attempt rows expire at their policy window, metric buckets have a bounded 30-day technical default, and an hourly cleanup job deletes only expired rows.
- Explicit `AUTH_OPERATIONAL_CONTROL_PROVIDER=prisma` is allowed only outside production and requires a server-side secret of at least 32 characters. Production rejects both local providers pending separate approval.
- A random localhost PostgreSQL harness starts two independent Nest processes and proves exact concurrent outcomes: login 5 denied/7 throttled and refresh 10 denied/6 throttled, with matching shared counters.
- The harness proves expired-row cleanup, preservation of current rows, adapter-outage HTTP 503 denial, exact process/database/temp cleanup, and no raw rate key or token export.
- Seed/report evidence updates the canonical auth operational-control matrix: the shared adapter is disposable-local verified, while production observability approval remains blocked.

Remaining blockers before any production claim:

- Database-owner-approved staging migration and two-process rehearsal.
- Production dashboards, alert routing, log/trace correlation, incident ownership/drill, approved retention policy, and external security review.
- Separate manual go-live approval. The local 30-day technical default is not an approved privacy or operations policy.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 17. Auth Operational Alert Policy Local - Job 00063

Updated: 2026-07-10

This repo-local slice adds a read-only alert-policy evaluator over the existing shared auth operational snapshot. It does not call an alert/notification provider, access staging or production, or enable production.

Verified additions:

- Four explicit policy thresholds cover login throttling, refresh throttling, refresh-token replay denial, and auth-session repository errors.
- Stable policy fingerprints and bounded cooldowns suppress repeated candidates without exporting rate keys, identities, access tokens, or refresh tokens.
- `GET /auth/operational-alerts` is JWT and role guarded for `ADMIN` and `SUPPORT`; the service repeats the role check before snapshot access and returns no actor identity.
- Learner/parent inspection is denied before the operational snapshot is read.
- Snapshot failure returns service unavailable instead of an empty or healthy alert response.
- The evaluator marks every candidate `NOT_SENT_LOCAL_POLICY_ONLY`; external alert delivery and live notifications remain disabled.
- Seed/report export a deterministic auth alert-policy matrix with 4 initial open candidates, 4 cooldown suppressions, 2 allowed read-only roles, 2 denied roles, and one fail-closed outage case.

Remaining blockers before any production claim:

- Cooldown state is process-local; production requires an approved shared deduplication store.
- Thresholds currently evaluate retained snapshot totals; staging calibration and approved time-window semantics remain open.
- Dashboards, log/trace correlation, external alert routing, on-call ownership, incident rehearsal, retention approval, capacity evidence, and external security review remain open.
- Separate manual go-live approval. No production/staging DB, deploy, provider, notification, payment/refund/payout, live AI, or real account/session was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 18. Prisma Auth Refresh-Token Hash Integrity - Job 00064

Updated: 2026-07-10

The incoming enforced runner contract repeats the Prisma `AuthSessionStore` local/staging slice already implemented in jobs 00059 and 00061. This repo-local hardening increment closes a concrete persistence-integrity gap without enabling production.

Verified additions:

- `PrismaAuthSessionStore` rejects refresh-token reads, creates, updates, and rotations unless the stored value is a lowercase 64-character SHA-256 hash.
- A forward-only PostgreSQL migration adds and validates `auth_refresh_tokens_token_hash_sha256_chk`; malformed existing rows make migration validation fail closed.
- The reviewed repair runbook revokes malformed synthetic/local/staging tokens, writes `ADMIN`/`SUPPORT` audit evidence, replaces the invalid value with a non-authenticating tombstone hash, and never exports or restores the invalid value.
- Disposable-local integration evidence covers full pre-activation rollback, malformed-row forward repair, constraint-only rollback/reactivation, database rejection of a new raw-token-like value, and the existing two-client shared revocation contract.
- Seed/report evidence records eight Prisma auth-session controls, four disposable-local verified rows, one staging blocker, and zero open local safety gates.

Remaining blockers before any production claim:

- Database-owner-approved staging migration, backup/restore, forward-repair rehearsal, accepted RPO/RTO, and incident rehearsal.
- Production dashboards, alert routing/correlation, on-call ownership, retention/privacy approval, capacity evidence, and external security review.
- Separate manual go-live approval. No staging/production database, real account/session, provider, payment/refund/payout, notification, or live AI action was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 19. Shared Auth Alert State And Rolling Window - Job 00065

Updated: 2026-07-10

The incoming transport retained the completed manual-paid-pilot title, while the reviewed next context names the concrete L6 blocker: shared alert cooldown state and explicit rolling-window inputs. This repo-local slice follows that blocker and does not change subscription, refund, commission, payout, or other real-money behavior.

Verified additions:

- `AUTH_OPERATIONAL_ALERT_STATE` provides fixture and Prisma implementations behind a production-blocked provider seam.
- `PrismaAuthOperationalAlertState` uses a PostgreSQL transaction advisory lock so concurrent processes produce whole, non-interleaved candidate sets and persist only stable redacted fingerprints/codes and cooldown timestamps.
- Alert inspection requests an explicit rolling 60-minute operational snapshot and returns requested/effective boundaries plus bucket resolution instead of evaluating all retained totals.
- Snapshot and alert-state outage both fail closed; ADMIN/SUPPORT-only read-only inspection and identity/token/rate-key redaction remain enforced.
- Hourly cleanup removes only state whose cooldown/expiry has elapsed.
- A random localhost PostgreSQL harness starts two independent Nest processes and proves exactly one four-candidate OPEN set plus one four-candidate cooldown-suppressed set, two expired rows removed with four current rows preserved, provider/HTTP outage denial, and exact process/database/temp cleanup.
- Seed/report and disposable smoke export reviewer-readable and machine-readable evidence without calling any external alert or notification provider.

Remaining blockers before any production claim:

- Database-owner-approved staging migration, two-process rehearsal, threshold/window calibration, and capacity evidence.
- Production dashboards, log/trace correlation, external routing, on-call ownership/drill, retention/privacy approval, and external security review.
- Separate manual go-live approval. No staging/production DB, deploy, provider, notification, payment/refund/commission/payout, live AI, or real account/session was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 20. Redacted Auth Alert Evaluation Audit And Local Contention - Job 00066

Updated: 2026-07-10

This repo-local slice follows job 00065's reviewed next context. It adds an append-only redacted evaluation-audit/correlation trail and measured disposable-local advisory-lock contention without enabling production or external delivery.

Verified additions:

- `operational_auth_alert_evaluation_audits` stores only a server-generated UUID correlation, SHA-256 input digest, redacted decision rows/counts, and timestamps. It has no identity, rate-key, credential, access-token, or refresh-token fields.
- Alert-state decisions and their audit row commit atomically under the existing PostgreSQL transaction advisory lock. An audit write failure rolls the state decision back and fails inspection closed.
- Exact correlation replay returns the original decision without rewriting state or audit; conflicting correlation reuse fails closed.
- The 30-day evaluation-audit retention is a bounded disposable-local technical default, not an approved production privacy/operations policy. Hourly cleanup deletes exactly expired state and audit rows.
- One random localhost PostgreSQL harness runs eight concurrent inspections across two independent Nest processes behind a deliberate 500 ms lock hold. It proves one whole OPEN set plus seven whole suppressed sets and records lock-wait/evaluation/client durations below a 5,000 ms local technical threshold.
- The same harness proves eight unique response correlations, append-only persisted audits, one-row idempotent replay, exact two-state/two-audit expiry cleanup, snapshot/state/audit outage denial, redaction, and exact database/process/temp cleanup.
- Seed/report evidence now records audit-outage, correlation, append-only retention, and local contention contracts while external alert delivery remains disabled.

Remaining blockers before any production claim:

- Database-owner-approved staging migration, two-process rehearsal, threshold/window calibration, and production-like load/capacity evidence.
- Production dashboard and log/trace integration, external routing, on-call ownership/drill, retention/privacy approval, and external security review.
- Separate manual go-live approval. No staging/production DB, deploy, provider, notification, payment/refund/commission/payout, live AI, or real account/session was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 21. Atomic Cross-Instance Auth Session Revocation - Job 00067

Updated: 2026-07-10

The enforced runner contract repeats the Prisma `AuthSessionStore` slice already implemented in jobs 00059, 00061, and 00064. This repo-local hardening increment closes a concrete cross-instance race without enabling production.

Verified additions:

- `AuthSessionStore` now exposes atomic session-family revocation; the fixture and Prisma providers both revoke the session plus all active refresh tokens as one provider operation.
- The Prisma provider locks the session row before refresh issuance, rotation, or revocation. Rotation and revocation therefore serialize on the same database row instead of relying on a stale service-level read.
- A rotation that commits first has its replacement included by the following revoke; a revoke that commits first prevents creation of a replacement token.
- Repeated revocation preserves the first persisted revocation reason/timestamp and protected access continues to fail closed.
- Disposable-local integration evidence runs six concurrent rotate/revoke races through two independent Prisma clients and proves every final session is revoked with zero active refresh tokens.
- Existing migration/rollback/forward-repair, hash-only persistence, repository-outage denial, local two-process backup/restore smoke, learning flow, and paid-pilot safety behavior remain preserved.

Remaining blockers before any production claim:

- Database-owner-approved staging migration, backup/restore, forward-repair, and multi-instance race rehearsal.
- Production dashboards/log/trace correlation, alert routing, on-call incident drill, retention/privacy approval, capacity/failover evidence, and external security review.
- Separate manual go-live approval. No staging/production database, real account/session, provider, payment/refund/payout, notification, or live AI action was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 22. Redacted Auth Alert Audit Read Model - Job 00068

Updated: 2026-07-10

The incoming transport retained the completed manual-paid-pilot title, while its enforced requirement and job 00067's reviewed next context name the concrete L6 slice: ADMIN/SUPPORT-only auth-alert evaluation-audit correlation lookup and bounded incident export. Subscription, 10-day refund-window, commission release, revoke/clawback, and payout behavior remain unchanged.

Verified additions:

- `GET /v1/auth/operational-alert-audits/:correlationId` provides exact retained correlation lookup; `GET /v1/auth/operational-alert-audits/incident-export` provides paginated JSON incident evidence.
- Incident queries require an explicit positive window of at most seven days and use a maximum 100-row page. Ordering is deterministic by evaluation timestamp then correlation, both descending, with an opaque compound cursor.
- Controller guards and service-level checks restrict both reads to `ADMIN` and `SUPPORT`; `STUDENT` and `PARENT` tests prove denial before repository access.
- The response excludes identity, rate-key, credential, access/refresh-token, input-digest, and internal-fingerprint fields. No actor identity is returned.
- Retention is enforced at read time, and repository/integrity outage returns HTTP 503 instead of a false empty/healthy result.
- A composite PostgreSQL index supports deterministic pagination without adding identity-bearing data.
- One random localhost PostgreSQL rehearsal runs two Nest processes and proves exact lookup, three pages covering nine unique rows, stable ordering, overlong-window rejection, redaction, lookup/export outage denial, and exact database/process/temp cleanup.
- Synthetic seed/report evidence records the new role, bound, pagination, redaction, and outage contracts. No external export delivery or alert/notification provider is used.

Remaining blockers before any production claim:

- Database-owner-approved staging migration/read rehearsal, production-like audit volume/capacity, and accepted retention/export handling.
- Production dashboards/log/trace correlation, external routing, on-call ownership/drill, privacy approval, and external security review.
- Separate manual go-live approval. No staging/production DB, deploy, real account/session, payment/refund/commission/payout, provider, notification, or live AI action was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 23. Release-Candidate Role And Go-Live Gate Matrix - Job 00069

Updated: 2026-07-10

This repo-local slice consolidates the non-production release-candidate gate into executable fixture evidence. It does not access staging or production and does not enable go-live.

Verified additions:

- `GET /v1/learning-local-demo/release-candidate-go-live-gate-matrix-report` is protected by the existing production-blocked local-demo guard.
- The deterministic role matrix covers `STUDENT`, `PARENT`, `TEACHER`, `ADMIN`, `SUPPORT`, `SALES`, `CHANNEL`, and `FINANCE` with happy, denied, inactive/expired, and permission-negative paths: 32 journeys total.
- The smoke matrix links auth/session denial, parent-child learning, role-negative permission, entitlement lifecycle, fixture-only refund/commission/payout safety, and production route containment evidence. Staging release rehearsal and observability/incident drill remain explicitly blocked.
- The gate reuses the canonical nine-row runtime matrix, including migration/rollback, backup/restore, monitoring/incident, privacy/audit retention, auth persistence, live-provider, and manual approval requirements. Every row has rollback or containment guidance.
- The immutable test-standard record preserves the job 00068 learning-local baseline, records no deletion/skip/rename/relaxation, and requires additive verification.
- Seed/report export `learning-local-demo-release-candidate-go-live-gate-report.json` and `.md`; the result is `NON_PRODUCTION_RC_EVIDENCE_READY` but `GO_LIVE_BLOCKED`.

Remaining blockers before any production claim:

- Database-owner-approved staging migration/read/backup/restore rehearsal with accepted RPO/RTO, rollback, capacity, and failover criteria.
- Production dashboards/log/trace correlation, alert routing, incident ownership/drill, and accepted thresholds.
- Approved privacy/retention/export handling and external security review.
- Separately approved live-provider controls and a named manual go-live approval.
- No staging/production DB, deploy, real learner/customer/order/payment mutation, provider API, notification, or live AI action was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 24. Atomic Cross-Instance Logout Session-Family Termination - Job 00070

Updated: 2026-07-10

The enforced runner contract repeats the Prisma `AuthSessionStore` slice already implemented and hardened in jobs 00059, 00061, 00064, and 00067. This repo-local increment closes the remaining non-atomic logout path without enabling production.

Verified additions:

- `AuthSessionStore.endSessionAtomically` is implemented by both fixture and Prisma providers behind the existing provider seam.
- Prisma logout locks the shared session row, writes `ENDED`, and revokes every active refresh token in the same transaction. Refresh rotation uses the same lock.
- Six concurrent rotate/logout races across two independent Prisma clients always finish in a safe terminal state with zero active refresh tokens. A losing refresh may escalate `ENDED` to `REVOKED` as replay; protected access remains denied.
- The disposable localhost contract revalidates migration deploy, schema/index/foreign-key checks, hash-only persistence, outage denial, pre-activation rollback, malformed-hash forward repair, constraint reactivation, and exact random-database cleanup.
- The two-process API smoke still proves shared revocation, fail-closed repository outage, backup/restore integrity, and exact database/process/dump cleanup.
- No new schema migration is needed. The existing pre-activation rollback and forward-repair runbooks remain the reviewed database recovery path.

Remaining blockers before any production claim:

- Database-owner-approved staging migration, backup/restore, forward-repair, capacity/failover, and multi-instance logout/revocation rehearsal.
- Production dashboards/log/trace correlation, alert routing, on-call incident drill, retention/privacy approval, and external security review.
- Separate manual go-live approval. No staging/production database, real account/session, provider, payment/refund/payout, notification, or live AI action was used.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
```

## 25. Manual Staging And Go-Live Approval Gate - Job 00071

Updated: 2026-07-10

The incoming transport reused the completed Prompt 15B/manual-paid-pilot title. The canonical axis and job 00070 next-context packet identify a human approval boundary, not another automatic money-flow implementation. This repo-local slice makes that boundary executable and does not fabricate approvals, access staging, or enable production.

Verified additions:

- The release-candidate gate report now enumerates six required approval owners: database, privacy/retention, incident, security, provider, and named release owner.
- Every approval row defines acceptance criteria and required evidence for the relevant staging or production boundary, including migration/read/backup/restore/forward repair, capacity/failover, RPO/RTO, rollback, monitoring/correlation/incident, retention/deletion/export, provider reconciliation/limits/kill switch, residual risk, and release enablement.
- All six rows are explicitly `PENDING_HUMAN_APPROVAL`; approver, timestamp, and approval evidence fields remain empty. Five rows block their relevant staging activity and all six block production.
- The machine-readable decision is `NEEDS_HUMAN_APPROVAL` with `PAUSE_AUTO_LOOP`, `stagingExecutionAuthorized=false`, and `productionExecutionAuthorized=false`.
- The existing fixture-only 10-day refund window, commission hold/release, refund clawback, revoke, entitlement, and payout-safety verification remains part of the release-candidate smoke matrix.
- Seed/report exports contain the same pending approval gate; local-demo HTTP access remains production-blocked.

Required human actions before any relevant staging activity:

- Record named, timestamped, release-version-scoped approval from each applicable owner with the evidence listed in the generated gate report.
- Run only the separately approved staging rehearsal or provider smoke; local evidence and this Codex output are not authorization.
- Keep the auto-loop paused. Resume only after an external reviewer has attached authentic approval evidence and issued a new scoped job.

No staging or production database, deploy, real learner/customer/order/payment mutation, provider API, notification, payment/refund/commission/payout mutation, or live AI action was used. No approval was inferred from the runner's repo-local authorization.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
auto_loop_decision=PAUSE_AUTO_LOOP
```

## 26. Release-Candidate Fixture And Evidence Integrity Gate - Job 00072

Updated: 2026-07-10

The job 00071 approval boundary remains authoritative: no staging or production action is authorized. This repo-local slice closes an evidence-integrity defect in the release-candidate report without inventing approval evidence or enabling a provider.

Verified additions:

- The executable gate report is now `learning-release-candidate-go-live-gate.v3`.
- All eight required roles have explicit synthetic fixtures for happy, denied, inactive/expired, and permission-negative scenarios: 32 role/scenario fixture rows total.
- Each journey resolves to exactly one fixture with the same actor, role, and scenario. The report records unique/resolved fixture counts, role mismatches, repo-relative evidence-path policy, and unsafe-path counts.
- Fixture evaluation fails unknown scenario identifiers and cross-role requests closed. Expired/inactive fixtures return `BLOCKED`; denied and out-of-scope fixtures return `DENIED`.
- Fixture rows contain no credentials and no real-person data. Production mutation remains false for every journey.
- The immutable learning-local baseline is advanced from reviewed job 00071 (`115` tests) to the current additive result (`117` tests). No existing test or acceptance standard was deleted, skipped, renamed, relaxed, or weakened.
- Seed/report exports show `scenarioFixtureCount=32`, `resolvedJourneyFixtureCount=32`, `evidenceIntegrity=PASS_LOCAL`, and zero unsafe evidence paths.

The six database, privacy/retention, incident, security, provider, and release-owner approvals remain `PENDING_HUMAN_APPROVAL`. No approver name, timestamp, signature, or evidence reference exists. Staging and production execution authorization remain false.

No staging/production DB, deploy, real learner/customer/order/payment mutation, provider API, payment/refund/commission/payout mutation, notification, or live AI action was used. The repo-local fixture gate is evidence, not authority.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
auto_loop_decision=PAUSE_AUTO_LOOP
```

## 27. Conditionally Approved Isolated Staging Rehearsal - Job 00073

Updated: 2026-07-10

The workspace owner supplied scoped approval `MH_RC_V3_USER_DELEGATED_STAGING_CONDITIONAL_20260710_01` for `minhhuong-staging-rc-v3-local`. The approval is limited to an isolated non-production local staging dry run; production remains unapproved.

Verified additions and evidence:

- A fail-closed rehearsal orchestrator validates the exact target, approval code, decision id, localhost PostgreSQL, six owner-decision rows, and non-production restrictions before any database action.
- One run reused the random-database migration/rollback/forward-repair, backup/restore, two-process session, operational-control, and alert-state harnesses. All 12 aggregate gates passed.
- Backup and restored auth snapshots had the same SHA-256 digest. Observed local RPO was 655 ms and restore-plus-validation RTO was 1,175 ms, within the approved staging objectives of 24 hours and 4 hours.
- Minimum observed host free-memory headroom was 34.09%, above the 30% rehearsal condition. This is a local host snapshot, not production capacity or failover proof.
- The timed synthetic incident recorded correlation, acknowledgement, fixture escalation, provider kill-switch confirmation, containment/rollback decision, and recovery within the approved 15/30 minute objectives. No external alert was sent.
- Privacy evidence proved ADMIN read-only bounded export, response redaction, 30-day evidence-retention metadata, exact expired-row deletion, and no raw identity, token, rate key, secret, or real-person data in the aggregate report.
- Final checks found zero matching disposable databases, rehearsal processes, listeners, or temporary artifacts. External providers remained fixture/mock-only because sandbox credentials were not supplied.
- The executable gate is now `learning-release-candidate-go-live-gate.v4`: conditional approvals are scoped to this staging rehearsal, the two staging smoke rows pass only when exact-cleanup evidence is accepted, and the post-pass decision is `STOP_FOR_SEPARATE_FINAL_RELEASE_DECISION`.
- Learning-local advanced additively from 117 to 118 tests; the preserved refund/commission/entitlement/payout suite remains 90/90 and the full Nest/Next build passes with 17 static pages.

Remaining blockers before any production claim:

- Hosted production-like load, capacity, failover, and environment-separation evidence.
- External monitoring/routing/on-call integration and an independent security review.
- Provider-specific sandbox/live credentials, webhook/reconciliation/limit evidence, and separate provider acceptance.
- A separate final release-owner production decision. The staging approval and local rehearsal cannot authorize production.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
auto_loop_decision=STOP_FOR_SEPARATE_FINAL_RELEASE_DECISION
```

## 28. Release-Candidate Evidence Manifest Integrity - Job 00074

Updated: 2026-07-10

This repo-local slice closes an evidence-integrity gap after the approved isolated staging rehearsal. The release gate previously rejected unsafe path syntax but did not prove that every referenced evidence file or directory existed or record immutable content digests. This job does not authorize another staging action or production.

Verified additions:

- `report:demo` now runs a fail-closed release-evidence manifest generator after the ERP and learning reports are complete.
- The generator collects role-journey, smoke, deploy-gate, approval, approval-scope, and staging-rehearsal references from the v4 release gate; de-duplicates them; rejects absolute paths, traversal, missing paths, symbolic links, and unsupported path types; and hashes regular files plus deterministic directory inventories with SHA-256.
- Generated evidence covers 101 references, 38 unique repo-local paths, 75 hashed files, and zero missing or unsafe paths. The machine artifact records per-path and aggregate SHA-256 digests without embedding its self-referential digest in canonical source files.
- Three additive tests prove stable file/directory hashing, fail-closed missing/traversal handling, and rejection of a `productionReady=true` gate even when referenced evidence exists.
- The reviewed job 00073 learning-local baseline of 118 tests is preserved and advanced additively to 121. The manual paid-pilot safety suite remains 90/90 and the full Nest/Next build passes with 17 static pages.

The manifest is local evidence integrity, not a signature, trusted timestamp, hosted capacity/failover proof, external monitoring/on-call evidence, provider acceptance, independent security review, or production approval. All seven production-readiness blockers and the separate final release-owner decision remain open.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
auto_loop_decision=STOP_FOR_SEPARATE_FINAL_RELEASE_DECISION
```

## 29. Hosted-Staging Deployment Engineering Foundation - Job 00075

Updated: 2026-07-11

The workspace owner authorized repo-local deployment engineering and isolated synthetic container smoke only. This job creates a provider-neutral hosted-staging package; it does not select or mutate a hosting account, publish images, change DNS/TLS, access production data, or enable production.

Verified additions:

- Deterministic multi-stage Nest API, migration, and Next standalone container targets; API and web application processes run as `node` and expose explicit health checks.
- A repository Docker context policy that excludes secrets, runtime data, uploads, build output, evidence workspaces, and unnecessary documentation while retaining required manifests and Prisma build assets.
- A five-service hosted-staging reference topology for PostgreSQL, authenticated Redis, one-shot migration, API, and web. Data services are private, public binds default to localhost, all secrets are required environment references, and all live providers stay disabled.
- Hosted-staging runtime validation for public URLs, CORS, database/Redis, shared Prisma auth providers, auth operational secret, uploads, false production flags, and production denial of local-demo routes.
- Separate API liveness and database/Redis readiness, structured JSON startup/fatal logs, and a provider-neutral Prometheus text contract.
- A fail-closed migration runner that validates the environment, acquires a PostgreSQL advisory lock, creates and hashes a backup, uses `prisma migrate deploy`, checks status/readability, supports controlled rollback/restore hooks, and propagates failure.
- CI-ready contract, Prisma, focused regression, seed/report, learning-local, build, image-build, and isolated-smoke lanes plus a hosted-staging runbook.
- The final API runtime image omits the Prisma schema/migration source tree; those assets remain only in build and migration targets.

Local verification evidence:

- Deployment/migration contracts: 8/8 pass; focused runtime/health/auth-provider tests: 26/26 pass.
- Prisma generate and validate, synthetic seed/report, 123/123 learning-local tests, preserved 90/90 paid-pilot safety tests, and the full Nest/Next build pass.
- Both runtime images build. The isolated compose smoke passes API liveness and database/Redis readiness, web health, local-demo production denial, migration rerun, API restart, non-root/minimal image inspection, and exact cleanup with zero remaining containers, networks, volumes, or listeners.

Remaining blockers before any production claim:

- An explicitly approved hosting account/project, domain, DNS/TLS, managed PostgreSQL/Redis, and staging-only credentials.
- Object storage or accepted shared upload semantics before multi-instance/failover claims.
- Hosted capacity/failover, external monitoring/log routing/on-call, backup/restore acceptance, privacy/retention, and independent security evidence.
- Provider-specific sandbox/live acceptance and a separate named release-owner production decision.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
go_live_decision=GO_LIVE_BLOCKED
```

## 30. Upload Storage Consistency And Readiness Gate - Job 00076

Updated: 2026-07-11

This repo-local slice closes an upload-path and readiness defect in the hosted-staging foundation. It does not create object storage, access a hosted target, use real uploads, or enable production.

Verified additions:

- Admin content video, teacher content video, activation-order invoice/payment-proof, and channel-finance payout-invoice uploads use one filesystem storage resolver rooted at `UPLOADS_PATH`.
- Static `/uploads` serving resolves through the same root, so a custom mounted path cannot diverge from Multer destinations.
- Hosted staging accepts filesystem storage only with explicit `UPLOAD_STORAGE_TOPOLOGY=single-instance` and `API_REPLICA_COUNT=1`; missing or multi-replica topology is rejected during bootstrap.
- API readiness now checks database, Redis, and writable upload storage. The upload probe creates, syncs, closes, and deletes a private synthetic file and exposes no filesystem path.
- Deterministic fixture evidence covers four realistic upload surfaces and three fail-closed negative cases: multi-instance filesystem, undeclared topology, and unsupported object-provider configuration.

### 2026-07-11 object-storage foundation update

- All four upload surfaces now use one provider-neutral storage engine with filesystem local development and private S3-compatible hosted-staging implementations.
- Stored keys are deterministic/content-addressed, traversal-safe, and immutable; filesystem uses exclusive creation and S3 uses `If-None-Match: *`.
- Provider contracts cover put, authenticated read/proxy, head/exists, delete, MIME/size metadata, SHA-256/ETag evidence, timeout/retry bounds, and fail-closed configuration.
- Hosted staging requires S3 bucket/region/credential-reference configuration and `shared-object` topology. Filesystem is denied unless a separately authorized single-instance emergency override is explicit.
- Readiness exposes only provider kind, status, and duration. It does not expose bucket, endpoint, credentials, key prefix, or object names.
- Disposable MinIO smoke uses synthetic video/invoice objects, verifies an independent-client read and checksum, restarts the API, deletes exact objects, and removes all project containers/networks/volumes/listeners.
- No real provider, hosted bucket, learner media, invoice, customer data, external deployment, or production enablement was used. `production_ready=false` and `production_enabled=false` remain mandatory.
- Seed/report export `learning-local-demo-upload-storage-hardening-matrix-report.json` and `.md`; release evidence includes 41 paths and 78 files.
- Deployment contracts pass 9/9; learning-local advances additively from 123 to 128 tests; the preserved paid-pilot suite remains 90/90; full Nest/Next build, both images, and isolated container smoke pass.

### 2026-07-14 repo-local upload hardening follow-up

- Authenticated download now authorizes the exact referenced video or invoice before reading storage. Learner video access requires child ownership, active video entitlement, an assigned lesson, and published/ready content; teacher and commercial reads stay owner/scope constrained.
- Successful reads write redacted audit evidence with object-key and child-profile fingerprints. The web clients fetch protected files with the session token and reject cross-origin protected-file URLs.
- A localhost-only, production-denied inventory runner now classifies filesystem references, streams SHA-256, rejects unsafe MIME/size/metadata/key cases, fingerprints database record IDs, and reports zero database mutations and zero provider calls. It does not perform a backfill.
- Current repo-local verification passes deployment contracts 10/10, learning-local 128/128, focused upload/security tests 15/15, all 386 non-integration API tests, lint, and the full Nest/Next build. PostgreSQL integration suites still require a running disposable local PostgreSQL instance and a role allowed to create and drop test databases; the current local endpoint returns `ECONNREFUSED`.

Remaining blockers before any production claim:

- A separately authorized and reviewed real hosted object-storage target, staging-only credentials, and provider acceptance before any multi-instance/failover claim.
- Hosted storage capacity, backup/restore, retention/deletion, malware handling, private delivery, observability, and owner acceptance.
- Explicit hosted-target authorization, managed PostgreSQL/Redis and DNS/TLS ownership, independent security/privacy review, provider acceptance, and a separate named release-owner production decision.

Required status remains:

```text
production_ready=false
production_enabled=false
manual_go_live_approval_required=true
go_live_decision=GO_LIVE_BLOCKED
```
