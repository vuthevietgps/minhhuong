# Learning local demo MVP Readiness Overview Report

Generated at: 2026-06-30T10:00:00.000Z

Overview endpoint: /v1/learning-local-demo/mvp-readiness-overview-report

## Safety

- Fixture-only local demo data.
- production_ready=false
- productionDbUsed=false
- noProductionDbRead=true
- providerApiUsed=false
- aiProviderUsed=false
- aiProviderExecutionUsed=false
- certificateIssuerProviderUsed=false
- paymentProviderUsed=false
- notificationProviderUsed=false
- liveAdsExecuted=false
- realStudentMutationUsed=false
- realCourseMutationUsed=false
- realEnrollmentMutationUsed=false
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
- realAiChatMutationUsed=false
- realAiModerationMutationUsed=false
- realLearningSupportMutationUsed=false
- realAchievementMutationUsed=false
- realBadgeMutationUsed=false
- realCertificateMutationUsed=false
- realCredentialIssuanceUsed=false
- realRecognitionNotificationMutationUsed=false
- realParentSummaryMutationUsed=false
- realParentMessageMutationUsed=false
- realTeacherInterventionMutationUsed=false
- realTeacherInterventionReviewMutationUsed=false
- realRemedialAssignmentMutationUsed=false
- realSupportPlanMutationUsed=false
- realParentSupportSummaryMutationUsed=false
- realTeacherNextActionMutationUsed=false
- realRemedialRetryCompletionMutationUsed=false
- realSupportOutcomeEvidenceMutationUsed=false
- realParentFollowupSummaryMutationUsed=false
- realTeacherFollowupSummaryMutationUsed=false
- realRemedialRetryUnresolvedAttemptMutationUsed=false
- realUnresolvedSupportOutcomeMutationUsed=false
- realTeacherEscalationMutationUsed=false
- realSupportAdjustmentMutationUsed=false
- realParentEscalationSummaryMutationUsed=false
- realTeacherEscalationNextActionMutationUsed=false
- realTeacherReviewedEscalationMutationUsed=false
- realAdjustedSupportRetryCompletionMutationUsed=false
- realResolvedSupportOutcomeMutationUsed=false
- realParentClosureSummaryMutationUsed=false
- realTeacherClosureNoteMutationUsed=false
- realWeeklyDigestNotificationMutationUsed=false
- realFollowUpActionOutcomeMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- MVP readiness slices: 20
- Local-demo ready slices: 19
- Needs local-demo fix slices: 0
- Production-ready slices: 0
- Readiness score: 100%
- Evidence endpoints: 18
- JSON exports: 18
- Markdown exports: 18
- Safety gates closed: 65/65
- Students: 4
- Enrollments: 4
- Subscriptions: 4
- Refund rows: 1
- Commission rows: 4
- Daily plans: 10
- Lessons: 5
- Assignments: 6
- Progress records: 4
- AI tutor chat sessions: 4
- Achievement records: 6
- Teacher intervention reviews: 1
- Remedial assignments: 1
- Support plans: 1
- Remedial retry completions: 1
- Support outcome evidence rows: 1
- Unresolved remedial retry attempts: 1
- Unresolved support outcome rows: 1
- Teacher escalations: 1
- Parent escalation summaries: 1
- Teacher escalation next actions: 1
- Teacher-reviewed escalations: 1
- Adjusted retry completions: 1
- Resolved support outcomes: 1
- Parent closure summaries: 1
- Teacher closure notes: 1
- Stable end-to-end traces: 1
- Weekly digests: 5
- Follow-up outcomes: 6

## MVP Readiness Rows

| Slice | Status | Primary metric | Secondary metric | Coverage | Endpoint | Exports | Evidence | Risk note |
| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- |
| Student enrollment (ENROLLMENT) | LOCAL_DEMO_READY | 4 Enrollments | 2 Active enrollments | 4 Students covered | /v1/learning-local-demo/student-course-enrollment-subscription-report | exports/learning-local-demo-student-course-enrollment-subscription-report.json; exports/learning-local-demo-student-course-enrollment-subscription-report.md | 4 students, 2 courses, 4 enrollment rows. | Local-demo fixture only; production enrollment lifecycle remains out of scope. |
| Subscription fixture (SUBSCRIPTION_FIXTURE) | LOCAL_DEMO_READY | 4 Subscriptions | 3 Active or trialing | 4 Enrollment rows | /v1/learning-local-demo/student-course-enrollment-subscription-report | exports/learning-local-demo-student-course-enrollment-subscription-report.json; exports/learning-local-demo-student-course-enrollment-subscription-report.md | 4 synthetic subscriptions with 1 pending payment fixture. | Provider-backed subscription creation and renewal are intentionally not executed. |
| Refunds and commission fixture (REFUNDS_COMMISSION_FIXTURE) | LOCAL_DEMO_READY | 4 Commission rows | 1 Refund rows | 600000000 Net revenue cents | /v1/learning-local-demo/student-course-enrollment-subscription-report | exports/learning-local-demo-student-course-enrollment-subscription-report.json; exports/learning-local-demo-student-course-enrollment-subscription-report.md | 1 refund and 4 commission fixtures reconcile to 600000000 net revenue cents. | Refund and commission states are fixture evidence only; no payment provider mutation is used. |
| Daily plan and practice evidence (DAILY_PLAN) | LOCAL_DEMO_READY | 10 Daily plans | 6 Completed plans | 4 Learning paths | /v1/learning-local-demo/learning-path-daily-plan-video-practice-evidence-report | exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.json; exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.md | 6/10 daily plans complete with 6 passed practice attempts. | Video and practice completion are deterministic evidence rows only. |
| Lesson and assignment evidence (LESSON_ASSIGNMENT) | LOCAL_DEMO_READY | 6 Assignments | 5 Lessons | 14 Expected submissions | /v1/learning-local-demo/lesson-assignment-assessment-progress-report | exports/learning-local-demo-lesson-assignment-assessment-progress-report.json; exports/learning-local-demo-lesson-assignment-assessment-progress-report.md | 6 assignment or quiz items produce 14 submission fixture rows. | Assessment scoring and feedback remain local fixture evidence only. |
| Attendance and progress (PROGRESS) | LOCAL_DEMO_READY | 4 Progress records | 1 Needs support | 8 Attendance rows | /v1/learning-local-demo/class-session-attendance-progress-report | exports/learning-local-demo-class-session-attendance-progress-report.json; exports/learning-local-demo-class-session-attendance-progress-report.md | 4 progress rows, 8 attendance records, and 75% attendance. | Attendance and progress rows are read-only snapshots, not learner mutations. |
| Report review queue and message preview (REPORT_REVIEW_PREVIEW) | LOCAL_DEMO_READY | 2 Review items | 1 Approved previews | 1 Held previews | /v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report | exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.json; exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.md | 2 review queue items produce 1 approved and 1 held parent-facing previews. | Review decisions and parent-facing previews are read-only fixture evidence; no notification or parent-message delivery is executed. |
| Parent portal inbox and read receipt (PARENT_PORTAL_INBOX_READ_RECEIPT) | LOCAL_DEMO_READY | 3 Parent inbox items | 2 Read/ack evidence | 1 Hidden held previews | /v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report | exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json; exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.md | 2 approved preview is visible in the parent inbox, 1 held preview remains hidden, and 2 read/ack row is traced. | Parent inbox and read/ack rows are fixture evidence only; no production portal state, notification delivery, or parent-message mutation is used. |
| Parent screen-time daily plan guard (PARENT_SCREEN_TIME_DAILY_PLAN_GUARD) | LOCAL_DEMO_READY | 10 Daily plan guard cases | 4 Blocked sessions | 10 Session guard traces | /v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report | exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.json; exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.md | 6 allowed and 4 blocked learning session evidence rows trace parent -> child -> course/daily plan -> rule -> result. | Parent grants, screen-time rules, and session guard evidence are fixture-only; no daily plan access or parent-control mutation is executed. |
| Learning session completion practice rollup (SESSION_COMPLETION_PRACTICE_ROLLUP) | LOCAL_DEMO_READY | 6 Progress rollups | 6 Parent summaries | 6 Stable traces | /v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report | exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.json; exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.md | 6 allowed daily plan sessions roll up lesson/video completion, practice score, and progress evidence into 6 parent and 6 teacher summaries. | Completion, practice, parent summary, and teacher summary rows are read-only fixture evidence only. |
| Teacher intervention remedial support plan (TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN) | LOCAL_DEMO_READY | 1 Teacher reviews | 1 Support plans | 1 Stable traces | /v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report | exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json; exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.md | 1 needs-support progress rollup creates 1 teacher review, 1 remedial assignment, 1 support plan, 1 parent summary, and 1 teacher next action. | Teacher interventions, remedial assignments, support plans, parent summaries, and teacher next actions are read-only fixture evidence only. |
| Remedial retry completion support outcome follow-up (REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP) | LOCAL_DEMO_READY | 1 Retry completions | 1 Support outcomes | 1 Stable traces | /v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report | exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.json; exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.md | 1 remedial retry completion links 1 support plan, 1 support outcome, 1 parent follow-up summary, and 1 teacher follow-up summary. | Retry completions, support outcomes, and parent/teacher follow-up summaries are read-only fixture evidence only. |
| Remedial retry unresolved support escalation (REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION) | LOCAL_DEMO_READY | 1 Unresolved retry attempts | 1 Teacher escalations | 1 Stable traces | /v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report | exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.json; exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.md | 1 incomplete or failed remedial retry links 1 support plan, 1 unresolved outcome, 1 teacher escalation, 1 parent escalation summary, and 1 teacher next action. | Unresolved retry attempts, support outcomes, teacher escalations, support adjustments, parent summaries, and teacher next actions are read-only fixture evidence only. |
| Teacher escalation follow-up resolution (TEACHER_ESCALATION_FOLLOWUP_RESOLUTION) | LOCAL_DEMO_READY | 1 Resolved follow-ups | 1 Adjusted retry completions | 1 Stable traces | /v1/learning-local-demo/teacher-escalation-followup-resolution-report | exports/learning-local-demo-teacher-escalation-followup-resolution-report.json; exports/learning-local-demo-teacher-escalation-followup-resolution-report.md | 1 unresolved escalation reference links 1 teacher review, 1 adjusted retry completion, 1 resolved outcome, 1 parent closure summary, and 1 teacher closure note. | Teacher-reviewed escalation resolution, adjusted retry completion, parent closure summaries, and teacher closure notes are read-only fixture evidence only. |
| MVP end-to-end readiness trace (MVP_END_TO_END_READINESS_TRACE) | LOCAL_DEMO_READY | 1 Stable traces | 1 Resolution evidence | 58 Safety gates closed | /v1/learning-local-demo/mvp-end-to-end-readiness-trace-report | exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json; exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.md | 1 stable end-to-end trace links enrollment/subscription, entitlement, practice progress, reporting/privacy, inbox read/ack evidence, screen-time guard, teacher intervention, remedial escalation, and teacher escalation resolution. | End-to-end readiness is a local-demo evidence trace only; no production orchestration, provider call, notification send, scheduler, or live learner mutation is used. |
| MVP role journey entrypoints (MVP_ROLE_JOURNEY_ENTRYPOINTS) | LOCAL_DEMO_READY_WITH_NOTES | 4 Role entrypoints | 1 Stable role traces | 4 Same-path rows | /v1/learning-local-demo/mvp-role-journey-entrypoints-report | exports/learning-local-demo-mvp-role-journey-entrypoints-report.json; exports/learning-local-demo-mvp-role-journey-entrypoints-report.md | 4 role entrypoints link student, parent, teacher, and admin/operator journeys to 1 stable Minh/course A1 trace with 0 open safety gates. | Role entrypoints are local-demo navigation evidence only; no production route state, authorization mutation, provider call, notification send, scheduler, or live learner mutation is used. |
| AI tutor safety evidence (AI_TUTOR_EVIDENCE) | LOCAL_DEMO_READY | 4 Chat sessions | 4 Safety flags | 4 Teacher reviews | /v1/learning-local-demo/ai-tutor-chat-safety-teacher-review-report | exports/learning-local-demo-ai-tutor-chat-safety-teacher-review-report.json; exports/learning-local-demo-ai-tutor-chat-safety-teacher-review-report.md | 4 chat sessions, 4 blocked messages, and 4 support recommendations. | No AI provider execution is used; messages and guard decisions are fixture rows. |
| Achievements and certificates (ACHIEVEMENTS) | LOCAL_DEMO_READY | 6 Achievement records | 4 Badge awards | 3 Certificate fixtures | /v1/learning-local-demo/student-achievement-badge-certificate-report | exports/learning-local-demo-student-achievement-badge-certificate-report.json; exports/learning-local-demo-student-achievement-badge-certificate-report.md | 6 achievement rows, 4 badges, and 3 certificate fixtures. | Certificates are previews only; no credential issuer or notification provider is called. |
| Parent and teacher weekly digest (WEEKLY_DIGEST) | LOCAL_DEMO_READY | 5 Weekly digests | 6 Digest actions | 4 Students covered | /v1/learning-local-demo/parent-teacher-weekly-digest-report | exports/learning-local-demo-parent-teacher-weekly-digest-report.json; exports/learning-local-demo-parent-teacher-weekly-digest-report.md | 5 digests include 6 actions and 2 ready-to-send rows. | Digest delivery is readiness evidence only; no notification provider send is executed. |
| Follow-up outcomes (FOLLOW_UP_OUTCOMES) | LOCAL_DEMO_READY | 6 Follow-up outcomes | 2 Done or verified | 4 Students covered | /v1/learning-local-demo/followup-action-outcome-report | exports/learning-local-demo-followup-action-outcome-report.json; exports/learning-local-demo-followup-action-outcome-report.md | 6 outcomes link 6 daily plans and 5 support recommendations. | Outcomes are report rows only; parent messages, teacher interventions, and follow-up mutations are disabled. |
