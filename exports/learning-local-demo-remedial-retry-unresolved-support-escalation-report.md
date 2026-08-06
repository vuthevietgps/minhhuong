# Learning local demo Remedial Retry Unresolved -> Support Escalation Report

Generated at: 2026-06-30T04:55:00.000Z

Endpoint: /v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report

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
- realParentMutationUsed=false
- realCourseMutationUsed=false
- realEnrollmentMutationUsed=false
- realSubscriptionMutationUsed=false
- realClassMutationUsed=false
- realSessionMutationUsed=false
- realAttendanceMutationUsed=false
- realProgressMutationUsed=false
- realLessonMutationUsed=false
- realAssignmentMutationUsed=false
- realAssessmentMutationUsed=false
- realLearningPathMutationUsed=false
- realDailyPlanMutationUsed=false
- realVideoEvidenceMutationUsed=false
- realPracticeMutationUsed=false
- realParentGuardianMutationUsed=false
- realScreenTimePolicyMutationUsed=false
- realLearningSessionGateMutationUsed=false
- realScreenTimeGrantMutationUsed=false
- realDailyPlanAccessMutationUsed=false
- realLearningMutationUsed=false
- realLearningSessionCompletionMutationUsed=false
- realParentProgressSummaryMutationUsed=false
- realTeacherProgressSummaryMutationUsed=false
- realParentMessageMutationUsed=false
- realTeacherInterventionMutationUsed=false
- realTeacherInterventionReviewMutationUsed=false
- realRemedialAssignmentMutationUsed=false
- realSupportPlanMutationUsed=false
- realParentSupportSummaryMutationUsed=false
- realTeacherNextActionMutationUsed=false
- realRemedialRetryUnresolvedAttemptMutationUsed=false
- realUnresolvedSupportOutcomeMutationUsed=false
- realTeacherEscalationMutationUsed=false
- realSupportAdjustmentMutationUsed=false
- realParentEscalationSummaryMutationUsed=false
- realTeacherEscalationNextActionMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Students: 1
- Teachers: 1
- Courses: 1
- Support plan references: 1
- Remedial assignment references: 1
- Remedial retry attempts: 1
- Failed or incomplete retries: 1
- Unresolved support outcomes: 1
- Teacher escalations: 1
- Support adjustments: 1
- Parent-visible escalation summaries: 1
- Teacher-visible escalation next actions: 1
- Safe next actions: 1
- Stable traces: 1
- Complete unresolved retry links: 1
- Outcomes with deterministic status/reason/action: 1
- Attempts with deterministic status/score: 1
- Safety gates closed: 53/53
- Open safety gates: 0

## Retry Attempt Rows

| Retry attempt | Student | Teacher | Support plan | Remedial assignment | Status | Reason | Score | Outcome | Escalation | Next action | Trace |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| remedial-retry-unresolved-minh-colors-2026-06-08 | Minh Tran (child-minh-demo) | Teacher Mai | support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01 | remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01 | INCOMPLETE | RETRY_INCOMPLETE | 58% / 45% | unresolved-support-outcome-minh-colors-retry / UNRESOLVED | teacher-escalation-minh-colors-retry / support-adjustment-minh-colors-retry | Schedule a teacher-led micro-review before any parent-facing next retry. | student-minh->course-a1-starter->progress-rollup-learning-session-evidence-gate-minh-a1-day-01->teacher-intervention-review-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01->plan-minh-a1-day-02->practice-minh-a1-day-02->remedial-retry-unresolved-minh-colors-2026-06-08->unresolved-support-outcome-minh-colors-retry->teacher-escalation-minh-colors-retry->support-adjustment-minh-colors-retry->parent-escalation-summary-minh-colors-retry->teacher-escalation-next-action-minh-colors-retry |

## Unresolved Outcome Rows

| Outcome | Retry attempt | Student | Status | Reason | Score | Visibility | Next action | Summary |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| unresolved-support-outcome-minh-colors-retry | remedial-retry-unresolved-minh-colors-2026-06-08 | Minh Tran (child-minh-demo) | UNRESOLVED | RETRY_INCOMPLETE | 58% / 45% | parent-visible / teacher-visible | Schedule a teacher-led micro-review before any parent-facing next retry. | The retry is incomplete; Teacher Mai should adjust the support plan and keep parent messaging escalation-focused but non-alarming. |

## Teacher Escalation Rows

| Escalation | Support adjustment | Teacher | Student | Status | Reason | Next action | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| teacher-escalation-minh-colors-retry | support-adjustment-minh-colors-retry | Teacher Mai (teacher.mai@example.test) | Minh Tran (child-minh-demo) | SCHEDULED / ADJUSTED | RETRY_INCOMPLETE | Schedule a teacher-led micro-review before any parent-facing next retry. | Teacher Mai schedules a micro-review and checks the blocked colors practice evidence before assigning another retry. Support adjustment narrows the colors task to one vocabulary group and keeps the practice window parent-supported. |

## Parent Escalation Summary Rows

| Parent summary | Parent | Student | Status | Reason | Score | Next action | Summary |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| parent-escalation-summary-minh-colors-retry | Minh Parent (parent.minh@example.test) | Minh Tran (child-minh-demo) | INCOMPLETE / UNRESOLVED | RETRY_INCOMPLETE | 58% / 45% | Schedule a teacher-led micro-review before any parent-facing next retry. | Minh needs one short teacher-guided colors review before the next parent-supported retry window. |

## Teacher Escalation Next Action Rows

| Teacher next action | Teacher | Student | Status | Reason | Next action | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| teacher-escalation-next-action-minh-colors-retry | Teacher Mai (teacher.mai@example.test) | Minh Tran (child-minh-demo) | INCOMPLETE / UNRESOLVED | RETRY_INCOMPLETE | Schedule a teacher-led micro-review before any parent-facing next retry. | Teacher Mai reviews the colors retry evidence, confirms the reduced task, and records fixture-only next action evidence. |
