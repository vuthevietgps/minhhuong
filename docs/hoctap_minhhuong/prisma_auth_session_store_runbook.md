# Prisma AuthSessionStore Local/Staging Runbook

Updated: 2026-07-10

Scope: disposable local or explicitly approved staging databases only. This runbook does not authorize production database access or production enablement. `production_ready=false` remains mandatory.

## Provider behavior

- Local demo/test defaults to `AUTH_SESSION_STORE_PROVIDER=fixture`.
- Disposable local/staging repository tests set `AUTH_SESSION_STORE_PROVIDER=prisma` and a non-production `DATABASE_URL`.
- Production configuration must explicitly select `prisma`; fixture or missing production configuration fails during module bootstrap.
- Repository transport errors and inconsistent persisted rows return a controlled service-unavailable denial. JWT/session validation never falls back to accepting a token.

## Migration rehearsal

1. Create a uniquely named disposable PostgreSQL database on localhost or an approved staging cluster.
2. Point `DATABASE_URL` only at that disposable database.
3. Run `npm --prefix apps/api run prisma:generate`.
4. Run `prisma migrate deploy --schema apps/api/prisma` through the repository-local Prisma CLI.
5. Verify `auth_sessions`, `auth_refresh_tokens`, and `auth_session_audit_events`, their foreign keys, expiry/state indexes, token-hash index, and validated `auth_refresh_tokens_token_hash_sha256_chk` constraint.
6. Create only synthetic users/sessions. Verify that raw refresh tokens are never stored and both repository code and PostgreSQL reject values outside lowercase 64-character SHA-256 form.
7. Use two independent Prisma clients: revoke through instance A, then prove instance B denies the session and refresh token. Race refresh rotation against revocation and verify every completed race leaves the session revoked and zero `ACTIVE` refresh tokens for that session.
8. Drop the disposable database after evidence capture.

The automated form is `apps/api/src/auth/prisma-auth-session.integration.spec.ts`. It refuses non-local database hosts.

### Atomic revocation and refresh serialization

- Prisma refresh issuance, refresh rotation, and session-family revocation lock the same `auth_sessions` row with `SELECT ... FOR UPDATE` before changing refresh-token state.
- Revocation changes the session and every currently active refresh token in one transaction. There is no successful response between a session-only write and later per-token writes.
- If rotation owns the lock first, its replacement token commits before revocation and is included in the atomic token update. If revocation owns the lock first, rotation observes the non-active session and cannot create a replacement.
- Repeating revocation preserves the first persisted revocation timestamp/reason while still denying any active token found under the locked session.
- Repository lock/query/update failure remains fail closed through the existing controlled service-unavailable mapping; no fixture fallback is used.

The disposable integration contract runs six concurrent rotate/revoke races through two independent Prisma clients and requires a revoked session plus zero active refresh tokens after every race. This is correctness evidence only, not staging capacity or latency evidence.

## Rollback

Before any real traffic or required auth rows exist, the disposable rehearsal may execute:

`apps/api/prisma/runbooks/20260710090000_prisma_auth_session_store_pre_activation_rollback.sql`

That script removes only the three new auth tables and their enum types. The integration test verifies the base application schema remains intact.

For a pre-activation rollback of only the hash-format constraint, execute `apps/api/prisma/runbooks/20260710140000_auth_refresh_token_hash_integrity_pre_activation_rollback.sql`. This preserves every session, token, and audit row. Application-level hash validation remains fail closed while the database constraint is temporarily absent.

After any persistent provider has served required traffic, do not run the destructive rollback script. Disable new login traffic, keep protected routes fail-closed, preserve session/token-hash/audit rows, take an approved backup, and roll the application provider/configuration forward or back under a manual incident decision.

## Forward repair

For the disposable pre-activation rehearsal only, reapply the reviewed base migration SQL with `prisma db execute --file apps/api/prisma/migrations/20260710090000_prisma_auth_session_store/migration.sql`, then apply `apps/api/prisma/migrations/20260710140000_auth_refresh_token_hash_integrity/migration.sql` and verify the three tables, indexes, and validated hash constraint return.

For staging or later environments with migration history, create a new reviewed forward-only repair migration. Never edit an already-applied migration, delete audit rows, restore raw refresh tokens, or mark a failed production migration successful without database-owner review.

### Refresh-token hash integrity repair

The forward-only constraint migration intentionally fails if an existing row contains anything other than lowercase 64-character SHA-256 form. Do not weaken or bypass the constraint. With database-owner approval, disabled login/refresh traffic, and an approved backup, run `apps/api/prisma/runbooks/20260710140000_auth_refresh_token_hash_integrity_forward_repair.sql` before retrying the migration.

The repair is fail-closed and preserves evidence:

1. Lock the refresh-token table against concurrent writes.
2. Append an `ADMIN`/`SUPPORT` audit event for every malformed row without copying the malformed value into audit metadata.
3. Mark each affected token `REVOKED` with reason `MALFORMED_TOKEN_HASH_FORWARD_REPAIR`.
4. Replace its malformed value with a deterministic 64-character non-authenticating tombstone hash so no raw or ambiguous credential remains.
5. Apply and validate `auth_refresh_tokens_token_hash_sha256_chk`.
6. Keep protected routes fail closed until repository reads, two-instance revocation, and audit inspection pass.

The disposable integration test rehearses malformed-row repair, constraint-only rollback, constraint reactivation, and database rejection of a new raw-token-like value. It never deletes audit rows or attempts to reconstruct a refresh token.

## Safe fixture cleanup

- The integration test uses a random database named `auth_session_store_<uuid>`.
- Cleanup disconnects both client instances, drops only that exact database with `WITH (FORCE)`, and leaves the configured base database untouched.
- Synthetic identities use the `.example.test` domain.
- No production/customer/student account, session, token, payment, notification, or AI provider is used.

## Disposable backup/restore and two-process API rehearsal

The automated localhost-only harness is:

`npm --prefix apps/api run smoke:auth-session-disposable`

Prerequisites are a compiled API (`npm run build:api`) and the repository's portable localhost PostgreSQL runtime (`npm run db:local:start`). The harness refuses `NODE_ENV=production`, refuses non-local database hosts, and creates only two random databases matching `auth_session_smoke_source_<uuid>` and `auth_session_smoke_restore_<uuid>`.

The rehearsal performs these checks without exporting raw access or refresh tokens:

1. Migrate a random source database and create one synthetic `@example.test` admin account.
2. Start two independent Nest API operating-system processes with the Prisma session provider and one shared JWT secret.
3. Log in through process A and prove the access token is accepted through process B.
4. Rotate and replay the original refresh token through process A. Replay must return 401 and persist a revoked session family; process B must then deny the original access token with 401.
5. Create a custom-format `pg_dump`, restore it to the second random database with `pg_restore`, and compare deterministic SHA-256 digests of all session, refresh-token-hash, and audit rows.
6. Disable connections to the source database and terminate its connections. A protected request through process B must return 503, proving repository outage denial remains fail closed.
7. Re-enable connections, stop both API processes, drop both exact random databases with `WITH (FORCE)`, delete the temporary dump, and query `pg_database` to prove no matching databases remain.

Generated evidence is written to:

- `exports/learning-local-demo-auth-session-disposable-smoke-report.json`
- `exports/learning-local-demo-auth-session-disposable-smoke-report.md`

Measurement definitions:

- `backupWindowMs`: elapsed local `pg_dump` time.
- `observedLocalRpoMs`: time from the latest included auth audit row to dump completion. This is a measured local snapshot-age observation, not an approved production RPO.
- `restoreAndValidationRtoMs`: elapsed time from `pg_restore` start until restored auth-row digest validation completes. This is a local rehearsal result, not an approved staging or production RTO.

Do not retain the generated dump, reuse the synthetic credentials, reinterpret the local timing as an SLA, or point this command at staging/production. Staging execution still requires separate database-owner approval, secrets handling, monitoring, incident ownership, and rollback authorization.

## Rate-limit and monitoring hooks

- `AUTH_OPERATIONAL_CONTROL` is an injectable seam shared by `AuthService` and `AuthSessionService`.
- Non-production defaults to `AUTH_OPERATIONAL_CONTROL_PROVIDER=fixture`. Disposable local/staging proof may explicitly select `prisma` with `AUTH_OPERATIONAL_CONTROL_KEY_SECRET` set to at least 32 random server-side characters.
- Production bootstrap rejects both local providers until staging migration, retention ownership, dashboards, alert routing, incident rehearsal, security review, and manual go-live approval are recorded.
- The repo-local fixture hashes login identities and refresh-token fingerprints before keeping rate-window state; snapshots never expose the raw email, credential, or refresh token.
- The Prisma adapter HMAC-SHA256 protects normalized rate keys, uses a PostgreSQL transaction advisory lock for atomic multi-process admission, stores minute metric buckets with a bounded 30-day technical default, and runs expiry cleanup hourly.
- Login and refresh checks fail closed with a controlled service-unavailable response when the rate-limit seam is unavailable. Exceeded local windows return HTTP 429 with a retry interval.
- Local counters cover login/refresh attempts, successes, denials and throttles; refresh replay; auth-session repository errors; cleanup outcomes; and role-scoped audit exports.
- Metric recording is advisory after a decision has been made, so a metric sink error cannot turn a persisted session into a partial login response. Repository and rate-limit authorization checks remain fail closed.
- `apps/api/src/auth/auth-operational-control.spec.ts` is the deterministic fixture proof. `apps/api/src/auth/prisma-auth-operational-control.spec.ts` and the disposable smoke below cover the shared adapter. `learning-local-demo-auth-operational-control-matrix-report.json` and `.md` are the canonical matrix evidence.

### Disposable shared-control rehearsal

Run `npm --prefix apps/api run smoke:auth-operational-control-disposable` only after compiling the API and starting the repository localhost PostgreSQL runtime. The harness refuses production and non-local database hosts, creates one exact random `auth_operational_control_smoke_<uuid>` database, and:

1. Runs 12 concurrent login requests split across two Nest processes. Exactly 5 reach credential denial and 7 return 429.
2. Runs 16 concurrent refresh requests split across both processes. Exactly 10 reach token denial and 6 return 429.
3. Verifies shared database counters match those exact cross-process outcomes.
4. Verifies only 64-character HMAC-SHA256 rate keys are persisted; it exports no raw identity, key secret, access token, or refresh token.
5. Seeds expired rate/metric rows, removes the exact expired rows, and proves current rows remain.
6. Disables the random database and terminates its connections; login must fail closed with HTTP 503.
7. Stops both API processes, drops the exact random database, and removes its temporary directory.

Generated evidence:

- `exports/learning-local-demo-auth-operational-control-disposable-smoke-report.json`
- `exports/learning-local-demo-auth-operational-control-disposable-smoke-report.md`

The 30-day metric retention is a technical local default, not an approved legal/privacy/operations policy. Do not point the harness at staging or production without separate approval.

### Repo-local alert policy and inspection

- `AuthOperationalAlertPolicyService` reads only the redacted `AuthOperationalSnapshot`; it does not receive identities, rate-limit keys, access tokens, or refresh tokens.
- The policy requests an explicit rolling 60-minute snapshot and returns the requested/effective window boundaries plus metric-bucket resolution. It no longer evaluates all retained totals.
- The local policy opens candidates when the rolling-window counters reach these technical fixture thresholds: 5 login throttles, 5 refresh throttles, 1 refresh replay denial, or 1 auth-session repository error.
- Candidate fingerprints are stable policy codes. Repeated candidates are suppressed during a 15-minute throttle cooldown or a 60-minute replay/repository-error cooldown.
- `AUTH_OPERATIONAL_ALERT_STATE` is a separate provider seam. Non-production defaults to `AUTH_OPERATIONAL_ALERT_STATE_PROVIDER=fixture`; disposable-local/staging proof may explicitly select `prisma`. Production activation remains rejected pending separate approval.
- `PrismaAuthOperationalAlertState` serializes each candidate-set evaluation with a PostgreSQL transaction advisory lock, stores only stable policy fingerprints/codes and cooldown timestamps, and atomically returns one whole OPEN or cooldown-suppressed decision set across processes.
- The same transaction appends one redacted `operational_auth_alert_evaluation_audits` row. Its only correlation key is a server-generated `auth-alert-evaluation:<uuid>` value; it stores a SHA-256 input digest, redacted decision rows, counts, timestamps, and no identity, rate key, credential, access token, or refresh token.
- Replaying the same correlation and exact input returns the original decision without rewriting state or audit. Reusing a correlation with different input fails closed. Audit retention is bounded to a 30-day local technical default and the hourly cleanup deletes expired state and audit rows together.
- `GET /auth/operational-alerts` is guarded by JWT plus role checks and is restricted to `ADMIN` and `SUPPORT`. The service repeats that role check before reading the snapshot and never returns actor identity.
- Snapshot, alert-state, or evaluation-audit failure returns service unavailable. There is no fallback to empty/healthy alert state, process-local deduplication, or unaudited evaluation.
- This slice never sends an alert. `delivery=NOT_SENT_LOCAL_POLICY_ONLY`, `externalAlertProviderUsed=false`, and `liveNotificationUsed=false` are explicit evidence fields.
- Seed/report export `learning-local-demo-auth-operational-alert-policy-matrix-report.json` and `.md`, including threshold, cooldown, role-denial, outage, redaction, and safety evidence.

### Disposable shared alert-state rehearsal

Run `npm --prefix apps/api run smoke:auth-operational-alert-state-disposable` only after compiling the API and starting the repository localhost PostgreSQL runtime. The harness refuses production and non-local database hosts, creates one exact random `auth_operational_alert_state_smoke_<uuid>` database, and:

1. Starts two independent Nest processes with Prisma session, operational-control, and alert-state providers.
2. Seeds four threshold metrics inside the explicit 60-minute window, deliberately holds the shared advisory lock for 500 ms, and runs eight concurrent inspections across both processes.
3. Proves the results are exactly one four-candidate OPEN set plus seven whole four-candidate cooldown-suppressed sets.
4. Records lock-wait, evaluation, and client-duration samples against a 5,000 ms disposable-local technical threshold. This is contention evidence, not a production SLA or load test.
5. Verifies eight unique redacted response correlations and eight append-only audit rows, then replays one direct correlation idempotently and proves exactly one row remains. A conflicting replay fails closed.
6. Verifies ADMIN read-only inspection, redacted persisted state/audit rows, and no actor identity, rate key, credential, access token, or refresh token in the response/evidence.
7. Adds two expired state rows plus two expired audit rows, deletes exactly those four expired rows, and preserves all four current policy rows plus nine current audit rows.
8. Disables the random database and proves snapshot, alert-state, and evaluation-audit access fail closed; HTTP inspection returns 503.
9. Stops both API processes, drops the exact random database, and removes the temporary directory.

Generated evidence:

- `exports/learning-local-demo-auth-operational-alert-state-disposable-smoke-report.json`
- `exports/learning-local-demo-auth-operational-alert-state-disposable-smoke-report.md`

### Redacted evaluation-audit lookup and incident export

- `GET /v1/auth/operational-alert-audits/:correlationId` returns one retained redacted append-only evaluation audit by its server-generated correlation.
- `GET /v1/auth/operational-alert-audits/incident-export` requires canonical `windowStartedAt` and `windowEndedAt` values, rejects windows longer than seven days, and caps each JSON page at 100 rows.
- Pages are ordered by `evaluatedAt DESC, correlationId DESC`. The opaque cursor carries both values so equal evaluation timestamps cannot create duplicates or omissions between pages.
- Both routes are JWT-protected and restricted to `ADMIN` and `SUPPORT`; the service repeats the role check before any repository read. Learner and parent roles are denied before lookup/export access.
- The read schema excludes actor/customer/learner identity, rate keys, credentials, access/refresh tokens, input digests, and internal policy fingerprints. It returns only correlation/timestamp, decision counts, redacted alert-code decisions, expiry, and append-only/redaction flags.
- Expired rows are not returned even when hourly physical cleanup has not run yet. Repository or persisted-row integrity failure returns HTTP 503; there is no empty-page or fixture fallback.
- The incident export is paginated JSON for repo-local incident rehearsal only. It does not route, notify, email, upload, or authorize external delivery.
- `op_auth_alert_eval_audits_page_idx` supports the deterministic evaluation-time/correlation ordering without adding an identity-bearing column.

The disposable two-process harness proves one correlation lookup plus three pages covering nine unique rows, stable ordering, seven-day-window rejection, response redaction, lookup/export outage denial, and exact database/process/temp cleanup.

The shared store, append-only audit, rolling-window contract, and measured contention are disposable-local evidence only. Before production consideration, database-owner-approved staging migration, threshold/window calibration, production dashboard/log/trace integration, external routing, on-call ownership, retention/privacy approval, production-like capacity evidence, security review, incident rehearsal, and manual go-live approval remain required.

## Remaining go-live blockers

- Approved staging backup/restore rehearsal and staging RPO/RTO acceptance; the localhost measurement is evidence only.
- Approved staging two-process API rehearsal and incident drill; the localhost two-process contract is now executable.
- Production dashboards, log/trace integration, external alert routing, incident owner/drill, retention/privacy approval, and security review. The shared adapter and correlation audit are verified only on disposable localhost infrastructure.
- Alert thresholds, role-scoped inspection, shared cooldown suppression, append-only audit correlation, explicit rolling-window inputs, exact cleanup, contention measurement, and snapshot/state/audit-outage denial are verified on disposable localhost infrastructure; staging calibration, production-like capacity, dashboard integration, and external delivery remain blocked.
- Separate manual go-live approval. Production stays disabled until those gates close.
