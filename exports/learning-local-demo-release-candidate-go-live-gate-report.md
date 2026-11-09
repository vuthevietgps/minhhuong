# Learning Release Candidate Go-Live Gate

Generated: 2026-07-10T10:00:00.000Z

## Decision

- release_candidate_status=ISOLATED_STAGING_REHEARSAL_EVIDENCE_READY
- go_live_decision=GO_LIVE_BLOCKED
- approval_gate_decision=STAGING_REHEARSAL_APPROVED_WITH_CONDITIONS
- auto_loop_decision=STOP_FOR_SEPARATE_FINAL_RELEASE_DECISION
- staging_execution_authorized=true
- production_execution_authorized=false
- production_ready=false
- production_enabled=false
- manual_go_live_approval_required=true
- approval_code=MH_RC_V3_USER_DELEGATED_STAGING_CONDITIONAL_20260710_01
- approval_scope=staging_dry_run
- approved_target=minhhuong-staging-rc-v3-local
- staging_rehearsal_evidence=PASS

## Coverage

- Roles complete: 8/8
- Synthetic role/scenario fixtures: 32
- Resolved journey fixtures: 32
- Role journeys: 32
- Happy/denied/inactive/permission-negative: 8/8/8/8
- Local smoke pass: 6
- Staging smoke blockers: 0
- Staging smoke pass: 2
- Production blockers: 7
- Required approvals: 6
- Pending approvals: 0
- Approved staging-scope approvals: 6
- Staging approval blockers: 0
- Evidence integrity: PASS_LOCAL
- Unique repo-relative evidence paths: 45
- Unsafe evidence paths: 0

## Demo Role Scenario Fixtures

| Scenario fixture | Source actor | Role | Scenario | Lifecycle | Scope | Expected decision | Credentials | Real-person data |
| --- | --- | --- | --- | --- | --- | --- | ---: | ---: |
| rc-fixture-student-happy-path | student-ava | STUDENT | HAPPY_PATH | ACTIVE | AUTHORIZED | ALLOWED_FIXTURE_ONLY | no | no |
| rc-fixture-student-denied-path | student-ava | STUDENT | DENIED_PATH | ACTIVE | ACTION_DENIED | DENIED | no | no |
| rc-fixture-student-inactive-or-expired-path | student-ava | STUDENT | INACTIVE_OR_EXPIRED_PATH | EXPIRED_OR_INACTIVE | ACTION_DENIED | BLOCKED | no | no |
| rc-fixture-student-permission-negative-path | student-ava | STUDENT | PERMISSION_NEGATIVE_PATH | ACTIVE | OUT_OF_SCOPE | DENIED | no | no |
| rc-fixture-parent-happy-path | guardian-ava-parent | PARENT | HAPPY_PATH | ACTIVE | AUTHORIZED | ALLOWED_FIXTURE_ONLY | no | no |
| rc-fixture-parent-denied-path | guardian-ava-parent | PARENT | DENIED_PATH | ACTIVE | ACTION_DENIED | DENIED | no | no |
| rc-fixture-parent-inactive-or-expired-path | guardian-ava-parent | PARENT | INACTIVE_OR_EXPIRED_PATH | EXPIRED_OR_INACTIVE | ACTION_DENIED | BLOCKED | no | no |
| rc-fixture-parent-permission-negative-path | guardian-ava-parent | PARENT | PERMISSION_NEGATIVE_PATH | ACTIVE | OUT_OF_SCOPE | DENIED | no | no |
| rc-fixture-teacher-happy-path | content-owner-teacher-mai | TEACHER | HAPPY_PATH | ACTIVE | AUTHORIZED | ALLOWED_FIXTURE_ONLY | no | no |
| rc-fixture-teacher-denied-path | content-owner-teacher-mai | TEACHER | DENIED_PATH | ACTIVE | ACTION_DENIED | DENIED | no | no |
| rc-fixture-teacher-inactive-or-expired-path | content-owner-teacher-mai | TEACHER | INACTIVE_OR_EXPIRED_PATH | EXPIRED_OR_INACTIVE | ACTION_DENIED | BLOCKED | no | no |
| rc-fixture-teacher-permission-negative-path | content-owner-teacher-mai | TEACHER | PERMISSION_NEGATIVE_PATH | ACTIVE | OUT_OF_SCOPE | DENIED | no | no |
| rc-fixture-admin-happy-path | content-owner-admin-hoa | ADMIN | HAPPY_PATH | ACTIVE | AUTHORIZED | ALLOWED_FIXTURE_ONLY | no | no |
| rc-fixture-admin-denied-path | content-owner-admin-hoa | ADMIN | DENIED_PATH | ACTIVE | ACTION_DENIED | DENIED | no | no |
| rc-fixture-admin-inactive-or-expired-path | content-owner-admin-hoa | ADMIN | INACTIVE_OR_EXPIRED_PATH | EXPIRED_OR_INACTIVE | ACTION_DENIED | BLOCKED | no | no |
| rc-fixture-admin-permission-negative-path | content-owner-admin-hoa | ADMIN | PERMISSION_NEGATIVE_PATH | ACTIVE | OUT_OF_SCOPE | DENIED | no | no |
| rc-fixture-support-happy-path | support-ops-auditor-lan | SUPPORT | HAPPY_PATH | ACTIVE | AUTHORIZED | ALLOWED_FIXTURE_ONLY | no | no |
| rc-fixture-support-denied-path | support-ops-auditor-lan | SUPPORT | DENIED_PATH | ACTIVE | ACTION_DENIED | DENIED | no | no |
| rc-fixture-support-inactive-or-expired-path | support-ops-auditor-lan | SUPPORT | INACTIVE_OR_EXPIRED_PATH | EXPIRED_OR_INACTIVE | ACTION_DENIED | BLOCKED | no | no |
| rc-fixture-support-permission-negative-path | support-ops-auditor-lan | SUPPORT | PERMISSION_NEGATIVE_PATH | ACTIVE | OUT_OF_SCOPE | DENIED | no | no |
| rc-fixture-sales-happy-path | demo-sale-lan | SALES | HAPPY_PATH | ACTIVE | AUTHORIZED | ALLOWED_FIXTURE_ONLY | no | no |
| rc-fixture-sales-denied-path | demo-sale-lan | SALES | DENIED_PATH | ACTIVE | ACTION_DENIED | DENIED | no | no |
| rc-fixture-sales-inactive-or-expired-path | demo-sale-lan | SALES | INACTIVE_OR_EXPIRED_PATH | EXPIRED_OR_INACTIVE | ACTION_DENIED | BLOCKED | no | no |
| rc-fixture-sales-permission-negative-path | demo-sale-lan | SALES | PERMISSION_NEGATIVE_PATH | ACTIVE | OUT_OF_SCOPE | DENIED | no | no |
| rc-fixture-channel-happy-path | demo-agency-hcm | CHANNEL | HAPPY_PATH | ACTIVE | AUTHORIZED | ALLOWED_FIXTURE_ONLY | no | no |
| rc-fixture-channel-denied-path | demo-agency-hcm | CHANNEL | DENIED_PATH | ACTIVE | ACTION_DENIED | DENIED | no | no |
| rc-fixture-channel-inactive-or-expired-path | demo-agency-hcm | CHANNEL | INACTIVE_OR_EXPIRED_PATH | EXPIRED_OR_INACTIVE | ACTION_DENIED | BLOCKED | no | no |
| rc-fixture-channel-permission-negative-path | demo-agency-hcm | CHANNEL | PERMISSION_NEGATIVE_PATH | ACTIVE | OUT_OF_SCOPE | DENIED | no | no |
| rc-fixture-finance-happy-path | demo-finance-manager | FINANCE | HAPPY_PATH | ACTIVE | AUTHORIZED | ALLOWED_FIXTURE_ONLY | no | no |
| rc-fixture-finance-denied-path | demo-finance-manager | FINANCE | DENIED_PATH | ACTIVE | ACTION_DENIED | DENIED | no | no |
| rc-fixture-finance-inactive-or-expired-path | demo-finance-manager | FINANCE | INACTIVE_OR_EXPIRED_PATH | EXPIRED_OR_INACTIVE | ACTION_DENIED | BLOCKED | no | no |
| rc-fixture-finance-permission-negative-path | demo-finance-manager | FINANCE | PERMISSION_NEGATIVE_PATH | ACTIVE | OUT_OF_SCOPE | DENIED | no | no |

## Role Journeys

| Journey | Role | Scenario | Decision | Reason | Actor | Target | Fixture refs | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rc-student-happy-path | STUDENT | HAPPY_PATH | ALLOWED_FIXTURE_ONLY | MATCHED_ACTIVE_ROLE_FIXTURE | student-ava | /v1/learning/children/child-ava-demo/today-plan | rc-fixture-student-happy-path<br>enroll-ava-a1-active<br>sub-ava-a1-active<br>plan-ava-a1-day-02<br>student-khoa<br>sub-khoa-a1-canceled | The active student follows the published daily plan through video, practice, progress, and report evidence. |
| rc-student-denied-path | STUDENT | DENIED_PATH | DENIED | ACTION_DENIED_BY_FIXTURE_POLICY | student-ava | /v1/learning/children/child-ava-demo/today-plan | rc-fixture-student-denied-path<br>enroll-ava-a1-active<br>sub-ava-a1-active<br>plan-ava-a1-day-02<br>student-khoa<br>sub-khoa-a1-canceled | A stale, unpublished, or screen-time-blocked plan cannot be started. |
| rc-student-inactive-or-expired-path | STUDENT | INACTIVE_OR_EXPIRED_PATH | BLOCKED | EXPIRED_OR_INACTIVE_FIXTURE | student-ava | /v1/learning/children/child-ava-demo/today-plan | rc-fixture-student-inactive-or-expired-path<br>enroll-ava-a1-active<br>sub-ava-a1-active<br>plan-ava-a1-day-02<br>student-khoa<br>sub-khoa-a1-canceled | Expired and revoked entitlement snapshots block learning access with explicit reasons. |
| rc-student-permission-negative-path | STUDENT | PERMISSION_NEGATIVE_PATH | DENIED | ROLE_SCOPE_MISMATCH | student-ava | /v1/learning/children/child-ava-demo/today-plan | rc-fixture-student-permission-negative-path<br>enroll-ava-a1-active<br>sub-ava-a1-active<br>plan-ava-a1-day-02<br>student-khoa<br>sub-khoa-a1-canceled | A student cannot select another child profile or enter teacher/admin surfaces. |
| rc-parent-happy-path | PARENT | HAPPY_PATH | ALLOWED_FIXTURE_ONLY | MATCHED_ACTIVE_ROLE_FIXTURE | guardian-ava-parent | /v1/parent/children/child-ava-demo/learning-summary | rc-fixture-parent-happy-path<br>guardian-ava-parent<br>guardian-minh-parent<br>student-ava<br>student-khoa<br>permission-case-parent-minh-non-owning-ava | The owning parent sees an approved report, reads the inbox, and grants fixture screen time. |
| rc-parent-denied-path | PARENT | DENIED_PATH | DENIED | ACTION_DENIED_BY_FIXTURE_POLICY | guardian-ava-parent | /v1/parent/children/child-ava-demo/learning-summary | rc-fixture-parent-denied-path<br>guardian-ava-parent<br>guardian-minh-parent<br>student-ava<br>student-khoa<br>permission-case-parent-minh-non-owning-ava | Held previews remain hidden and a non-owning parent receives no child evidence. |
| rc-parent-inactive-or-expired-path | PARENT | INACTIVE_OR_EXPIRED_PATH | BLOCKED | EXPIRED_OR_INACTIVE_FIXTURE | guardian-ava-parent | /v1/parent/children/child-ava-demo/learning-summary | rc-fixture-parent-inactive-or-expired-path<br>guardian-ava-parent<br>guardian-minh-parent<br>student-ava<br>student-khoa<br>permission-case-parent-minh-non-owning-ava | A refunded, revoked, or expired child entitlement stays visible as blocked evidence without granting learning access. |
| rc-parent-permission-negative-path | PARENT | PERMISSION_NEGATIVE_PATH | DENIED | ROLE_SCOPE_MISMATCH | guardian-ava-parent | /v1/parent/children/child-ava-demo/learning-summary | rc-fixture-parent-permission-negative-path<br>guardian-ava-parent<br>guardian-minh-parent<br>student-ava<br>student-khoa<br>permission-case-parent-minh-non-owning-ava | Parent ownership is enforced and no parent can read another family child profile. |
| rc-teacher-happy-path | TEACHER | HAPPY_PATH | ALLOWED_FIXTURE_ONLY | MATCHED_ACTIVE_ROLE_FIXTURE | content-owner-teacher-mai | /v1/teacher/classes/class-a1-june-weekday/review-queue | rc-fixture-teacher-happy-path<br>class-a1-june-weekday<br>class-phonics-may-booster<br>permission-case-teacher-mai-assigned-a1<br>permission-case-teacher-mai-unassigned-phonics-denied<br>teacher-escalation-followup-resolution-minh-colors-2026-06-09 | The assigned teacher reviews learning evidence, applies the support plan, and closes the fixture escalation. |
| rc-teacher-denied-path | TEACHER | DENIED_PATH | DENIED | ACTION_DENIED_BY_FIXTURE_POLICY | content-owner-teacher-mai | /v1/teacher/classes/class-a1-june-weekday/review-queue | rc-fixture-teacher-denied-path<br>class-a1-june-weekday<br>class-phonics-may-booster<br>permission-case-teacher-mai-assigned-a1<br>permission-case-teacher-mai-unassigned-phonics-denied<br>teacher-escalation-followup-resolution-minh-colors-2026-06-09 | The teacher cannot read or change an unassigned class or its student evidence. |
| rc-teacher-inactive-or-expired-path | TEACHER | INACTIVE_OR_EXPIRED_PATH | BLOCKED | EXPIRED_OR_INACTIVE_FIXTURE | content-owner-teacher-mai | /v1/teacher/classes/class-a1-june-weekday/review-queue | rc-fixture-teacher-inactive-or-expired-path<br>class-a1-june-weekday<br>class-phonics-may-booster<br>permission-case-teacher-mai-assigned-a1<br>permission-case-teacher-mai-unassigned-phonics-denied<br>teacher-escalation-followup-resolution-minh-colors-2026-06-09 | Withdrawn learner evidence is retained read-only and cannot restart a learning path. |
| rc-teacher-permission-negative-path | TEACHER | PERMISSION_NEGATIVE_PATH | DENIED | ROLE_SCOPE_MISMATCH | content-owner-teacher-mai | /v1/teacher/classes/class-a1-june-weekday/review-queue | rc-fixture-teacher-permission-negative-path<br>class-a1-june-weekday<br>class-phonics-may-booster<br>permission-case-teacher-mai-assigned-a1<br>permission-case-teacher-mai-unassigned-phonics-denied<br>teacher-escalation-followup-resolution-minh-colors-2026-06-09 | Assigned-class scope is required before report, intervention, or content actions. |
| rc-admin-happy-path | ADMIN | HAPPY_PATH | ALLOWED_FIXTURE_ONLY | MATCHED_ACTIVE_ROLE_FIXTURE | content-owner-admin-hoa | /v1/learning-local-demo/release-candidate-go-live-gate-matrix-report | rc-fixture-admin-happy-path<br>permission-case-admin-hoa-phonics-class<br>runtime-config-fail-closed<br>manual-go-live-approval | Admin reads release-candidate, audit, runtime-safety, and fixture evidence only. |
| rc-admin-denied-path | ADMIN | DENIED_PATH | DENIED | ACTION_DENIED_BY_FIXTURE_POLICY | content-owner-admin-hoa | /v1/learning-local-demo/release-candidate-go-live-gate-matrix-report | rc-fixture-admin-denied-path<br>permission-case-admin-hoa-phonics-class<br>runtime-config-fail-closed<br>manual-go-live-approval | Admin cannot use this local-demo surface for a production mutation or go-live enablement. |
| rc-admin-inactive-or-expired-path | ADMIN | INACTIVE_OR_EXPIRED_PATH | BLOCKED | EXPIRED_OR_INACTIVE_FIXTURE | content-owner-admin-hoa | /v1/learning-local-demo/release-candidate-go-live-gate-matrix-report | rc-fixture-admin-inactive-or-expired-path<br>permission-case-admin-hoa-phonics-class<br>runtime-config-fail-closed<br>manual-go-live-approval | An expired or revoked admin session is denied before readiness evidence is returned. |
| rc-admin-permission-negative-path | ADMIN | PERMISSION_NEGATIVE_PATH | DENIED | ROLE_SCOPE_MISMATCH | content-owner-admin-hoa | /v1/learning-local-demo/release-candidate-go-live-gate-matrix-report | rc-fixture-admin-permission-negative-path<br>permission-case-admin-hoa-phonics-class<br>runtime-config-fail-closed<br>manual-go-live-approval | Admin visibility does not override provider, production database, or manual approval gates. |
| rc-support-happy-path | SUPPORT | HAPPY_PATH | ALLOWED_FIXTURE_ONLY | MATCHED_ACTIVE_ROLE_FIXTURE | support-ops-auditor-lan | /v1/auth/operational-alert-audits/incident-export | rc-fixture-support-happy-path<br>permission-case-support-ops-lan-audit-read-only<br>followup-outcome-minh-parent-practice-window<br>auth-alert-audit-support-read-only | Support inspects redacted issue, escalation, and audit evidence without changing learner or money state. |
| rc-support-denied-path | SUPPORT | DENIED_PATH | DENIED | ACTION_DENIED_BY_FIXTURE_POLICY | support-ops-auditor-lan | /v1/auth/operational-alert-audits/incident-export | rc-fixture-support-denied-path<br>permission-case-support-ops-lan-audit-read-only<br>followup-outcome-minh-parent-practice-window<br>auth-alert-audit-support-read-only | Support cannot bypass privacy redaction, teacher scope, or mutation restrictions. |
| rc-support-inactive-or-expired-path | SUPPORT | INACTIVE_OR_EXPIRED_PATH | BLOCKED | EXPIRED_OR_INACTIVE_FIXTURE | support-ops-auditor-lan | /v1/auth/operational-alert-audits/incident-export | rc-fixture-support-inactive-or-expired-path<br>permission-case-support-ops-lan-audit-read-only<br>followup-outcome-minh-parent-practice-window<br>auth-alert-audit-support-read-only | An expired or revoked support session is denied before audit repository access. |
| rc-support-permission-negative-path | SUPPORT | PERMISSION_NEGATIVE_PATH | DENIED | ROLE_SCOPE_MISMATCH | support-ops-auditor-lan | /v1/auth/operational-alert-audits/incident-export | rc-fixture-support-permission-negative-path<br>permission-case-support-ops-lan-audit-read-only<br>followup-outcome-minh-parent-practice-window<br>auth-alert-audit-support-read-only | Support access is read-only, audited, bounded, and excludes identity/token/rate-key fields. |
| rc-sales-happy-path | SALES | HAPPY_PATH | ALLOWED_FIXTURE_ONLY | MATCHED_ACTIVE_ROLE_FIXTURE | demo-sale-lan | /fixture/subscription-payment-commission-trace | rc-fixture-sales-happy-path<br>enroll-ava-a1-active<br>pay-ava-a1-succeeded<br>commission-ava-sale-pending<br>commission-khoa-sale-canceled | Sales traces the fixture order, payment, entitlement, refund-window, and pending commission evidence. |
| rc-sales-denied-path | SALES | DENIED_PATH | DENIED | ACTION_DENIED_BY_FIXTURE_POLICY | demo-sale-lan | /fixture/subscription-payment-commission-trace | rc-fixture-sales-denied-path<br>enroll-ava-a1-active<br>pay-ava-a1-succeeded<br>commission-ava-sale-pending<br>commission-khoa-sale-canceled | Sales cannot approve payout, issue a provider refund, or unlock an unpaid entitlement. |
| rc-sales-inactive-or-expired-path | SALES | INACTIVE_OR_EXPIRED_PATH | BLOCKED | EXPIRED_OR_INACTIVE_FIXTURE | demo-sale-lan | /fixture/subscription-payment-commission-trace | rc-fixture-sales-inactive-or-expired-path<br>enroll-ava-a1-active<br>pay-ava-a1-succeeded<br>commission-ava-sale-pending<br>commission-khoa-sale-canceled | Refunded/canceled fixture business closes entitlement and cancels the related commission. |
| rc-sales-permission-negative-path | SALES | PERMISSION_NEGATIVE_PATH | DENIED | ROLE_SCOPE_MISMATCH | demo-sale-lan | /fixture/subscription-payment-commission-trace | rc-fixture-sales-permission-negative-path<br>enroll-ava-a1-active<br>pay-ava-a1-succeeded<br>commission-ava-sale-pending<br>commission-khoa-sale-canceled | Sales evidence excludes finance approval and unrelated learner/private report access. |
| rc-channel-happy-path | CHANNEL | HAPPY_PATH | ALLOWED_FIXTURE_ONLY | MATCHED_ACTIVE_ROLE_FIXTURE | demo-agency-hcm | /fixture/channel-commission-trace | rc-fixture-channel-happy-path<br>enroll-linh-phonics-active<br>pay-linh-phonics-succeeded<br>commission-linh-agency-payable<br>commission-khoa-sale-canceled | Channel reads its payable fixture commission after the refund window without executing payout. |
| rc-channel-denied-path | CHANNEL | DENIED_PATH | DENIED | ACTION_DENIED_BY_FIXTURE_POLICY | demo-agency-hcm | /fixture/channel-commission-trace | rc-fixture-channel-denied-path<br>enroll-linh-phonics-active<br>pay-linh-phonics-succeeded<br>commission-linh-agency-payable<br>commission-khoa-sale-canceled | Channel cannot inspect another beneficiary ledger or bypass a commission hold/cancellation. |
| rc-channel-inactive-or-expired-path | CHANNEL | INACTIVE_OR_EXPIRED_PATH | BLOCKED | EXPIRED_OR_INACTIVE_FIXTURE | demo-agency-hcm | /fixture/channel-commission-trace | rc-fixture-channel-inactive-or-expired-path<br>enroll-linh-phonics-active<br>pay-linh-phonics-succeeded<br>commission-linh-agency-payable<br>commission-khoa-sale-canceled | A refunded subscription keeps the canceled commission unavailable for payout. |
| rc-channel-permission-negative-path | CHANNEL | PERMISSION_NEGATIVE_PATH | DENIED | ROLE_SCOPE_MISMATCH | demo-agency-hcm | /fixture/channel-commission-trace | rc-fixture-channel-permission-negative-path<br>enroll-linh-phonics-active<br>pay-linh-phonics-succeeded<br>commission-linh-agency-payable<br>commission-khoa-sale-canceled | Channel scope is limited to its fixture beneficiary evidence and never exposes child learning details. |
| rc-finance-happy-path | FINANCE | HAPPY_PATH | ALLOWED_FIXTURE_ONLY | MATCHED_ACTIVE_ROLE_FIXTURE | demo-finance-manager | /fixture/refund-commission-payout-safety-trace | rc-fixture-finance-happy-path<br>pay-khoa-a1-refunded<br>refund-khoa-a1-succeeded<br>commission-khoa-sale-canceled<br>commission-linh-sale-approved | Finance reviews fixture payment/refund/commission evidence and the invoice/available-balance payout gate. |
| rc-finance-denied-path | FINANCE | DENIED_PATH | DENIED | ACTION_DENIED_BY_FIXTURE_POLICY | demo-finance-manager | /fixture/refund-commission-payout-safety-trace | rc-fixture-finance-denied-path<br>pay-khoa-a1-refunded<br>refund-khoa-a1-succeeded<br>commission-khoa-sale-canceled<br>commission-linh-sale-approved | No provider payment, refund, commission release, or payout mutation is available in this local gate. |
| rc-finance-inactive-or-expired-path | FINANCE | INACTIVE_OR_EXPIRED_PATH | BLOCKED | EXPIRED_OR_INACTIVE_FIXTURE | demo-finance-manager | /fixture/refund-commission-payout-safety-trace | rc-fixture-finance-inactive-or-expired-path<br>pay-khoa-a1-refunded<br>refund-khoa-a1-succeeded<br>commission-khoa-sale-canceled<br>commission-linh-sale-approved | Refunded payment and canceled commission remain non-payable and preserve the audit trace. |
| rc-finance-permission-negative-path | FINANCE | PERMISSION_NEGATIVE_PATH | DENIED | ROLE_SCOPE_MISMATCH | demo-finance-manager | /fixture/refund-commission-payout-safety-trace | rc-fixture-finance-permission-negative-path<br>pay-khoa-a1-refunded<br>refund-khoa-a1-succeeded<br>commission-khoa-sale-canceled<br>commission-linh-sale-approved | Finance approval cannot set production_ready or bypass separate provider and manual go-live approvals. |

## E2E / Smoke Matrix

| Smoke | Level | Status | Journey | Command/evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| rc-smoke-auth-session-negative-matrix | AUTOMATED_UNIT | PASS_LOCAL | login -> logout -> expired token -> revoked session -> wrong role | npm run test:learning-local | All required auth/session denial scenarios remain covered. |
| rc-smoke-parent-child-learning-flow | FIXTURE_REPORT | PASS_LOCAL | parent -> owned child -> active entitlement -> daily plan -> video -> practice -> approved report | npm run seed:demo && npm run report:demo | The preserved fixture journey is complete and parent-owned. |
| rc-smoke-role-permission-negative-paths | AUTOMATED_UNIT | PASS_LOCAL | non-owning parent + unassigned teacher + learner wrong role + support mutation denial | npm run test:learning-local | Every required role has a permission-negative fixture row. |
| rc-smoke-entitlement-lifecycle | AUTOMATED_UNIT | PASS_LOCAL | active + pending payment + refunded + expired + revoked | npm run test:learning-local | Only active entitlement unlocks the learning fixture. |
| rc-smoke-refund-commission-payout-safety | AUTOMATED_UNIT | PASS_LOCAL | fixture payment -> 10-day refund window -> commission hold/release -> refund clawback -> payout guards | npm --prefix apps/api run test -- activation-orders.service entitlement.service.spec.ts package-entitlement-order-flow.spec.ts package-entitlement-snapshot.spec.ts channel-finance.service.spec.ts --runInBand | Fixture-only money policy remains preserved with no provider call. |
| rc-smoke-local-demo-production-containment | AUTOMATED_UNIT | PASS_LOCAL | production environment -> local-demo route -> not found | npm run test:learning-local | Fixture routes cannot be exposed in production mode. |
| rc-smoke-staging-release-rehearsal | STAGING_REQUIRED | PASS_ISOLATED_STAGING | backup -> migrate -> smoke -> rollback/forward repair -> restore verify | npm --prefix apps/api run rehearse:staging | Named owners approve RPO/RTO, rollback, and restore evidence. |
| rc-smoke-observability-incident-drill | STAGING_REQUIRED | PASS_ISOLATED_STAGING | health/error/latency alert -> correlation -> owner ack -> containment | npm --prefix apps/api run rehearse:staging | Dashboards, routing, thresholds, and incident drill are accepted. |

## Deploy Readiness, Rollback, Backup, Monitoring, And Audit

| Gate | Area | Decision | Blocker | Required next evidence | Rollback / containment |
| --- | --- | --- | ---: | --- | --- |
| runtime-config-fail-closed | ENVIRONMENT_SEPARATION | CLOSED_BY_CODE | no | None; local code gate closed. | Rollback may revert the release artifact, but must never restore placeholder production secrets or credentialed wildcard CORS. |
| local-demo-route-containment | LOCAL_DEMO_CONTAINMENT | CLOSED_BY_CODE | no | None; local code gate closed. | Keep demo seed/report generation as an offline command; never re-enable HTTP demo routes in production. |
| migration-and-rollback-rehearsal | MIGRATION_ROLLBACK | BLOCKED_PENDING_STAGING | yes | Disposable staging migration dry-run with schema diff approval.<br>Timed rollback rehearsal that preserves append-only audit data. | Disable new release writes first; use forward repair after data writes rather than destructive schema rollback. |
| backup-and-restore-rehearsal | BACKUP_RESTORE | BLOCKED_PENDING_STAGING | yes | Encrypted staging backup with retention owner and checksum.<br>Restore rehearsal with measured RPO/RTO and data integrity checks. | Keep production_enabled=false until restore success is independently verified. |
| monitoring-alerting-and-incident-runbook | MONITORING_INCIDENT | BLOCKED_PENDING_STAGING | yes | Shared multi-instance rate-limit/metrics adapter plus staging health, error-rate, latency, auth-denial, refund, and payout alert smoke.<br>Incident response and rollback owner acknowledgement. | Use a release kill switch and stop new writes when health or reconciliation alerts breach approved thresholds. |
| privacy-audit-and-retention | PRIVACY_AUDIT_RETENTION | BLOCKED_PENDING_STAGING | yes | Approved child-data, AI transcript, auth audit, and upload retention schedule.<br>Staging redaction/export/deletion dry-run with support access audit. | Disable exports/provider sends without deleting append-only audit records needed for investigation. |
| auth-persistence-and-distributed-revocation | AUTH_PERSISTENCE | BLOCKED_PENDING_STAGING | yes | Approved staging migration, backup/restore, and retention evidence for the implemented persistent AuthSessionStore.<br>Two-process staging API revocation and repository outage smoke. | Disable new sessions and preserve token/audit hashes if the persistent store or distributed revocation layer fails. |
| live-provider-execution-gates | LIVE_PROVIDER_EXECUTION | BLOCKED_PENDING_MANUAL_APPROVAL | yes | Approved secret-store, webhook verification, idempotency, reconciliation, rate/loss limit, and kill-switch design per provider.<br>Staging-only provider smoke with explicit human approval. | Keep provider modes disabled and retain manual, fixture-only evidence until each provider has a separately approved rollback plan. |
| manual-go-live-approval | MANUAL_GO_LIVE_APPROVAL | BLOCKED_PENDING_MANUAL_APPROVAL | yes | Named approver, timestamp, release version, accepted residual risks, rollback owner, and production enablement record. | No automatic loop may set production_ready or production_enabled to true. |

## Manual Approval And Acceptance Gate

| Approval | Owner role | Status | Scope | Staging approval required | Acceptance criteria | Required evidence |
| --- | --- | --- | --- | ---: | --- | --- |
| release-approval-database-owner | DATABASE_OWNER | APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL | Staging migration, read validation, backup, restore, forward repair, rollback, capacity, failover, RPO, and RTO | yes | The target is an explicitly named non-production staging database with sanitized fixtures, least-privilege access, and an approved change window.<br>Migration, schema/read validation, backup checksum, restore integrity, forward repair, and rollback or containment steps have named stop conditions.<br>Numeric RPO/RTO, capacity, connection, concurrency, and failover thresholds are accepted before rehearsal. | Named database-owner approval with timestamp, staging target identifier, release version, and change window.<br>Migration/read/backup/restore/forward-repair rehearsal record with checksums, timings, abort criteria, and exact cleanup.<br>Accepted RPO/RTO, rollback, capacity, and failover evidence. |
| release-approval-privacy-retention-owner | PRIVACY_RETENTION_OWNER | APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL | Child data, auth/audit, upload, transcript, deletion, redaction, retention, and export handling | yes | Retention and deletion periods are approved for child data, auth/audit rows, uploads, exports, and any future AI transcript data.<br>Support access, privacy redaction, export purpose, incident access, and deletion exceptions are documented and auditable.<br>A staging-only export/deletion/redaction dry-run uses synthetic or sanitized data and has explicit cleanup criteria. | Named privacy/retention-owner approval with policy version and effective date.<br>Approved retention/deletion/export schedule and access-control matrix.<br>Synthetic staging dry-run evidence with redaction and access audit results. |
| release-approval-incident-owner | INCIDENT_OWNER | APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL | Monitoring, alert routing, log/trace correlation, incident response, rollback, and drill ownership | yes | Dashboards and alerts cover health, error rate, latency, auth denial/replay, refund, commission, payout, and repository failure signals.<br>Thresholds, routing, acknowledgement, escalation, containment, rollback, and recovery owners are named.<br>A staging incident drill proves alert-to-correlation-to-owner acknowledgement and safe containment within accepted targets. | Named incident-owner approval, on-call route, escalation path, and rollback owner.<br>Approved dashboard/alert threshold inventory with log/trace correlation fields.<br>Timed staging incident drill and after-action record. |
| release-approval-security-owner | SECURITY_OWNER | APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL | External security review, secret handling, least privilege, webhook verification, abuse controls, and residual findings | yes | Secrets remain in an approved secret store; staging and production credentials are separated and never exported in evidence.<br>Least-privilege access, webhook signature verification, idempotency, rate limiting, replay defense, and audit redaction are reviewed.<br>External security findings have severity, owner, due date, accepted residual risk, and release-blocking disposition. | Named security-owner approval and external review reference.<br>Threat model and access/secret/webhook control checklist for the release version.<br>Finding register showing closure or explicit risk acceptance for every release-relevant item. |
| release-approval-provider-owner | PROVIDER_OWNER | APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL | Payment, refund, payout, notification, and AI provider acceptance, reconciliation, loss limits, and kill switches | yes | Each provider has separately approved staging credentials, webhook verification, idempotency, reconciliation, rate/loss limits, and a tested kill switch.<br>Payment, 10-day refund, commission release/clawback, payout approval, notification, and AI boundaries have provider-specific rollback or containment criteria.<br>No live or production provider mode is enabled by the Codex auto-loop; every staging provider smoke requires explicit scoped approval. | Named owner approval per provider and explicitly scoped staging-smoke authorization.<br>Provider acceptance matrix covering secrets, webhooks, idempotency, reconciliation, limits, kill switch, rollback, and incident routing.<br>Staging-only smoke evidence with synthetic transactions and confirmed cleanup or reversal. |
| release-approval-release-owner | RELEASE_OWNER | STAGING_REHEARSAL_APPROVED_PRODUCTION_NOT_APPROVED | Named release decision, accepted residual risk, rollback ownership, and production enablement record | no | The named release owner reviews the exact release version, all prerequisite approvals, unresolved risks, and rollback or containment ownership.<br>The go-live decision records approver, timestamp, release version, accepted residual risks, enablement window, and rollback owner.<br>production_ready and production_enabled remain false until that separate signed decision exists; no auto-loop output can substitute for it. | Named release-owner approval referencing every prerequisite approval and the immutable release version.<br>Signed residual-risk acceptance and rollback/containment ownership record.<br>Separate production enablement record outside the Codex auto-loop. |

## Immutable Test Standard

- baseline_job=codex_job_minhhuong_00073_staging_rehearsal_conditional_approval
- baseline_learning_local_tests=118
- verification_command=npm run test:learning-local
- existing_tests_deleted=false
- existing_tests_skipped=false
- existing_tests_renamed=false
- assertions_relaxed=false
- acceptance_criteria_weakened=false
- new_tests_added=true
- test_standard_change_request_required=false

## Evidence Integrity

- status=PASS_LOCAL
- scenario_fixture_count=32
- unique_scenario_fixture_count=32
- resolved_journey_fixture_count=32
- role_mismatch_count=0
- unique_evidence_path_count=45
- unsafe_evidence_path_count=0

## Safety

- productionDbUsed=false
- stagingDbUsed=true
- providerApiUsed=false
- paymentProviderMutationUsed=false
- refundProviderMutationUsed=false
- payoutProviderMutationUsed=false
- notificationDeliveryUsed=false
- liveAiProviderUsed=false
- realCustomerOrStudentMutationUsed=false
- productionDeployUsed=false
- plaintextSecretsIncluded=false
