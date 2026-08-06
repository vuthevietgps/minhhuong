# Learning local demo MVP End-to-End Readiness Trace Report

Generated at: 2026-06-30T04:59:00.000Z

Endpoint: /v1/learning-local-demo/mvp-end-to-end-readiness-trace-report
JSON export: exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json
Markdown export: exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.md
Dashboard: /admin/learning-local-demo#mvp-end-to-end-readiness-trace

## Safety

- Fixture-only local demo data.
- production_ready=false
- productionDbUsed=false
- noProductionDbRead=true
- providerApiUsed=false
- aiProviderExecutionUsed=false
- paymentProviderUsed=false
- notificationProviderUsed=false
- liveAdsExecuted=false
- realStudentMutationUsed=false
- realCourseMutationUsed=false
- realEnrollmentMutationUsed=false
- realSubscriptionMutationUsed=false
- realLearningMutationUsed=false
- realTeacherInterventionMutationUsed=false
- realRemedialRetryUnresolvedAttemptMutationUsed=false
- realTeacherEscalationMutationUsed=false
- realTeacherReviewedEscalationMutationUsed=false
- realAdjustedSupportRetryCompletionMutationUsed=false
- realResolvedSupportOutcomeMutationUsed=false
- realParentClosureSummaryMutationUsed=false
- realTeacherClosureNoteMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Students: 1
- Courses: 1
- Enrollment/subscription links: 1
- Payment/refund/commission fixture evidence: 1
- Entitlement/daily plan evidence: 1
- Practice progress/completion evidence: 1
- Parent/teacher report evidence: 1
- Permission/redaction evidence: 1
- Approved delivery/read receipt evidence: 1
- Aligned approved delivery student/course path rows: 1
- Screen-time guard evidence: 1
- Teacher intervention evidence: 1
- Remedial retry/escalation evidence: 1
- Escalation resolution evidence: 1
- Stable end-to-end traces: 1
- Deterministic status/reason/action/owner rows: 1
- Same student/course path rows: 1
- Safety gates closed: 58/58
- Open safety gates: 0

## Trace Rows

| Trace | Student | Course | Enrollment/subscription | Entitlement/daily plan | Practice | Reporting/privacy | Read receipt | Guard | Intervention | Retry/escalation | Resolution | Status | Owner | Trace key |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mvp-end-to-end-readiness-trace-minh-a1-2026-06-09 | Minh Tran (child-minh-demo) | MH-A1-STARTER (course-a1-starter) | enroll-minh-a1-pending / sub-minh-a1-trialing / pay-minh-a1-pending | entitlement-sub-minh-a1-trialing / plan-minh-a1-day-02 / BLOCKED_PENDING_PAYMENT | progress-rollup-learning-session-evidence-gate-minh-a1-day-01 / practice-minh-a1-day-01 / PASSED / 72% | parent-access-summary-guardian-minh-parent-enroll-minh-a1-pending / permission-case-teacher-mai-assigned-a1 / field-visibility-permission-case-teacher-mai-assigned-a1-guardianEmail | read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved (student-minh/course-a1-starter) | daily-plan-guard-gate-minh-a1-day-01 / ALLOWED_SESSION | teacher-intervention-review-progress-rollup-learning-session-evidence-gate-minh-a1-day-01 / support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01 / remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01 | remedial-retry-unresolved-minh-colors-2026-06-08 / unresolved-support-outcome-minh-colors-retry / teacher-escalation-minh-colors-retry | teacher-escalation-followup-resolution-minh-colors-2026-06-09 / resolved-support-outcome-minh-colors-adjusted-retry / RESOLVED | LOCAL_DEMO_READY_WITH_NOTES: Fixture-only MVP readiness trace links all accepted learning-core slices and keeps production_ready=false.; Review the trace evidence locally; do not run providers, sends, schedulers, or live mutations. | TEACHER | student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->pay-minh-a1-pending->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02->progress-rollup-learning-session-evidence-gate-minh-a1-day-01->parent-access-summary-guardian-minh-parent-enroll-minh-a1-pending->permission-case-teacher-mai-assigned-a1->field-visibility-permission-case-teacher-mai-assigned-a1-guardianEmail->parent-inbox-item-message-preview-minh-a1-parent-progress-approved->read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved->daily-plan-guard-gate-minh-a1-day-01->teacher-intervention-review-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->remedial-retry-unresolved-minh-colors-2026-06-08->teacher-escalation-minh-colors-retry->support-adjustment-minh-colors-retry->teacher-escalation-followup-resolution-minh-colors-2026-06-09->resolved-support-outcome-minh-colors-adjusted-retry |

## Evidence Rows

| Evidence | Count | IDs | Summary |
| --- | ---: | --- | --- |
| STUDENT_COURSE_ENROLLMENT_SUBSCRIPTION | 1 | student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing | The trace starts from deterministic student, course, enrollment, and subscription fixture IDs. |
| PAYMENT_REFUND_COMMISSION_FIXTURE | 1 | pay-minh-a1-pending | Payment/refund/commission evidence is fixture-only; no provider or live financial mutation is used. |
| ENTITLEMENT_DAILY_PLAN | 1 | entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02 | Entitlement and daily plan IDs connect the learner path into local-demo access evidence. |
| PRACTICE_PROGRESS_COMPLETION | 1 | progress-rollup-learning-session-evidence-gate-minh-a1-day-01->practice-minh-a1-day-01:72 | Practice progress rows carry deterministic status and score evidence. |
| PARENT_TEACHER_REPORTING | 1 | parent-access-summary-guardian-minh-parent-enroll-minh-a1-pending | Parent/teacher reporting evidence is read-only fixture summary data. |
| PERMISSION_REDACTION | 1 | permission-case-teacher-mai-assigned-a1->field-visibility-permission-case-teacher-mai-assigned-a1-guardianEmail | Permission and redaction references prove privacy handling remains fixture-only and reviewable. |
| APPROVED_DELIVERY_READ_RECEIPT | 1 | read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved | Aligned Minh/course A1 approved parent inbox read/ack evidence is referenced without notification delivery or parent-message mutation. |
| SCREEN_TIME_GUARD | 1 | daily-plan-guard-gate-minh-a1-day-01->ALLOWED_SESSION | Screen-time guard evidence links the daily plan path to read-only parent-control fixture decisions. |
| TEACHER_INTERVENTION | 1 | teacher-intervention-review-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01 | Teacher intervention evidence links needs-support progress to support plan and remedial assignment rows. |
| REMEDIAL_RETRY_OR_ESCALATION | 1 | remedial-retry-unresolved-minh-colors-2026-06-08->unresolved-support-outcome-minh-colors-retry->teacher-escalation-minh-colors-retry | Remedial retry escalation evidence carries deterministic retry status, unresolved outcome, and teacher escalation IDs. |
| ESCALATION_RESOLUTION | 1 | teacher-escalation-followup-resolution-minh-colors-2026-06-09->resolved-support-outcome-minh-colors-adjusted-retry->RESOLVED | Teacher escalation resolution closes the local-demo journey with resolved support outcome evidence. |
| STABLE_END_TO_END_TRACE | 1 | student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->pay-minh-a1-pending->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02->progress-rollup-learning-session-evidence-gate-minh-a1-day-01->parent-access-summary-guardian-minh-parent-enroll-minh-a1-pending->permission-case-teacher-mai-assigned-a1->field-visibility-permission-case-teacher-mai-assigned-a1-guardianEmail->parent-inbox-item-message-preview-minh-a1-parent-progress-approved->read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved->daily-plan-guard-gate-minh-a1-day-01->teacher-intervention-review-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->remedial-retry-unresolved-minh-colors-2026-06-08->teacher-escalation-minh-colors-retry->support-adjustment-minh-colors-retry->teacher-escalation-followup-resolution-minh-colors-2026-06-09->resolved-support-outcome-minh-colors-adjusted-retry | Stable trace keys connect accepted learning-core slice IDs into one reviewable MVP readiness path. |
| SAFETY_GATE | 58 | productionReady=false<br>fixtureOnly=true<br>productionDbUsed=false<br>noProductionDbRead=true<br>providerApiUsed=false<br>aiProviderUsed=false<br>aiProviderExecutionUsed=false<br>paymentProviderUsed=false<br>notificationProviderUsed=false<br>liveAdsExecuted=false<br>realStudentMutationUsed=false<br>realParentMutationUsed=false<br>realCourseMutationUsed=false<br>realEnrollmentMutationUsed=false<br>realSubscriptionMutationUsed=false<br>realClassMutationUsed=false<br>realSessionMutationUsed=false<br>realAttendanceMutationUsed=false<br>realProgressMutationUsed=false<br>realLessonMutationUsed=false<br>realAssignmentMutationUsed=false<br>realAssessmentMutationUsed=false<br>realLearningPathMutationUsed=false<br>realDailyPlanMutationUsed=false<br>realVideoEvidenceMutationUsed=false<br>realPracticeMutationUsed=false<br>realParentGuardianMutationUsed=false<br>realScreenTimePolicyMutationUsed=false<br>realLearningSessionGateMutationUsed=false<br>realScreenTimeGrantMutationUsed=false<br>realDailyPlanAccessMutationUsed=false<br>realLearningMutationUsed=false<br>realLearningSessionCompletionMutationUsed=false<br>realParentProgressSummaryMutationUsed=false<br>realTeacherProgressSummaryMutationUsed=false<br>realParentMessageMutationUsed=false<br>realTeacherInterventionMutationUsed=false<br>realTeacherInterventionReviewMutationUsed=false<br>realRemedialAssignmentMutationUsed=false<br>realSupportPlanMutationUsed=false<br>realParentSupportSummaryMutationUsed=false<br>realTeacherNextActionMutationUsed=false<br>realPaymentMutationUsed=false<br>realRefundMutationUsed=false<br>realCommissionMutationUsed=false<br>realErpMutationUsed=false<br>secretsRequired=false<br>realRemedialRetryUnresolvedAttemptMutationUsed=false<br>realUnresolvedSupportOutcomeMutationUsed=false<br>realTeacherEscalationMutationUsed=false<br>realSupportAdjustmentMutationUsed=false<br>realParentEscalationSummaryMutationUsed=false<br>realTeacherEscalationNextActionMutationUsed=false<br>realTeacherReviewedEscalationMutationUsed=false<br>realAdjustedSupportRetryCompletionMutationUsed=false<br>realResolvedSupportOutcomeMutationUsed=false<br>realParentClosureSummaryMutationUsed=false<br>realTeacherClosureNoteMutationUsed=false | All production, provider, payment, notification, AI, scheduler, learning mutation, and ERP gates remain closed. |
