# Learning local demo Parent/Teacher Weekly Digest Report

Generated at: 2026-06-30T08:00:00.000Z

## Safety

- Fixture-only local demo data.
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
- realParentMessageMutationUsed=false
- realTeacherInterventionMutationUsed=false
- realWeeklyDigestNotificationMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Weekly digests: 5
- Parent digests: 3
- Teacher digests: 2
- Ready to send: 2
- Teacher review: 2
- Held withdrawn: 1
- Parent-visible digests: 2
- Teacher-only digests: 3
- Digest actions: 6
- High-priority actions: 2
- Scheduled actions: 2
- Completed actions: 1
- Students covered: 4
- Students needing teacher review: 3
- Students ready for parent send: 2

## Student Weekly Digest Rows

| Student | Course | Parent digests | Teacher digests | Ready | Review | Held | Actions | High priority | Completed | Next action | Summary |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Ava Nguyen (child-ava-demo) | MH-A1-STARTER / MH-A1-JUN-WEEKDAY | 1 | 1 | 1 | 1 | 0 | 2 | 0 | 0 | 2026-06-06T09:00:00.000Z | Ava Nguyen has 1 digest pending teacher review and 0 high-priority action. |
| Khoa Le (child-khoa-demo) | MH-A1-STARTER / MH-A1-JUN-WEEKDAY | 0 | 1 | 0 | 0 | 1 | 1 | 1 | 0 | 2026-06-01T15:00:00.000Z | Khoa Le has a teacher-only weekly digest held because the fixture enrollment is withdrawn. |
| Linh Pham (child-linh-demo) | MH-PHONICS-BOOSTER / MH-PHONICS-MAY | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 1 | n/a | Linh Pham has 1 parent-ready weekly digest and 1 fixture action. |
| Minh Tran (child-minh-demo) | MH-A1-STARTER / MH-A1-JUN-WEEKDAY | 1 | 0 | 0 | 1 | 0 | 2 | 1 | 0 | 2026-06-06T11:00:00.000Z | Minh Tran has 1 digest pending teacher review and 1 high-priority action. |

## Weekly Digest Rows

| Digest | Week | Student | Audience | Status | Parent visible | Progress | Attendance | Assignments | Practice | Alerts | Actions | Certificate | Highlight | Risk |
| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| digest-linh-parent-2026-w21 | 2026-05-18 to 2026-05-24 | Linh Pham (child-linh-demo) | PARENT | READY_TO_SEND | YES | COMPLETED 100% | 100 | 100 | 94 | 0 | 1 | READY | Linh completed the phonics booster path and has a read-only certificate preview ready. | No open weekly risk remains in the synthetic evidence for this completed booster path. |
| digest-ava-parent-2026-w23 | 2026-06-01 to 2026-06-07 | Ava Nguyen (child-ava-demo) | PARENT | READY_TO_SEND | YES | IN_PROGRESS 67% | 100 | 100 | 88 | 1 | 1 | PENDING | Ava earned two A1 badges and completed the greetings and colors milestones. | Family preview remains in progress, so the digest asks the parent to protect one short practice window. |
| digest-ava-teacher-2026-w23 | 2026-06-01 to 2026-06-07 | Ava Nguyen (child-ava-demo) | TEACHER | TEACHER_REVIEW | NO | IN_PROGRESS 67% | 100 | 100 | 88 | 1 | 1 | PENDING | Ava has enough badge evidence for a near-ready certificate preview. | Teacher review is required because the family milestone and privacy reminder are still open. |
| digest-khoa-teacher-2026-w23 | 2026-06-01 to 2026-06-07 | Khoa Le (child-khoa-demo) | TEACHER | HELD_WITHDRAWN | NO | WITHDRAWN 33% | 50 | 25 | 80 | 1 | 1 | HELD_FOR_REVIEW | Khoa has pre-withdrawal achievement evidence but no parent digest should be sent. | The digest is held because the local-demo enrollment is canceled and refunded. |
| digest-minh-parent-2026-w23 | 2026-06-01 to 2026-06-07 | Minh Tran (child-minh-demo) | PARENT | TEACHER_REVIEW | NO | NEEDS_SUPPORT 33% | 50 | 25 | 65 | 3 | 2 | NONE | Minh completed a greetings catch-up and can recover the colors plan with parent support. | The digest is held for teacher review because submissions, practice score, and daily plan blockers all need follow-up. |

## Action Rows

| Action | Student | Owner | Priority | Status | Due at | Alert | Recognition | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| digest-action-linh-parent-celebrate | Linh Pham (child-linh-demo) | PARENT | LOW | COMPLETED | 2026-05-24T11:00:00.000Z | n/a | recognition-linh-parent-certificate | Parent receives the completion celebration and certificate preview link in fixture evidence. |
| digest-action-khoa-teacher-hold | Khoa Le (child-khoa-demo) | TEACHER | HIGH | HELD | 2026-06-01T15:00:00.000Z | alert-student-khoa-skipped-video | recognition-khoa-withdrawn-hold | Teacher keeps the weekly digest held because the enrollment is withdrawn and refunded. |
| digest-action-ava-parent-family-preview | Ava Nguyen (child-ava-demo) | PARENT | MEDIUM | RECOMMENDED | 2026-06-06T09:00:00.000Z | alert-student-ava-stalled-daily-plan | recognition-ava-parent-colors | Parent protects a 15-minute family words preview before the next class. |
| digest-action-ava-teacher-certificate-check | Ava Nguyen (child-ava-demo) | TEACHER | MEDIUM | SCHEDULED | 2026-06-06T10:00:00.000Z | alert-student-ava-stalled-daily-plan | recognition-ava-teacher-certificate-check | Teacher checks the family preview and privacy reminder before marking the certificate preview ready. |
| digest-action-minh-teacher-recovery-plan | Minh Tran (child-minh-demo) | TEACHER | HIGH | SCHEDULED | 2026-06-06T11:00:00.000Z | alert-student-minh-missing-submissions | recognition-minh-parent-encouragement | Teacher prepares a three-task colors recovery checklist and parent encouragement note. |
| digest-action-minh-parent-practice-window | Minh Tran (child-minh-demo) | PARENT | MEDIUM | RECOMMENDED | 2026-06-06T13:00:00.000Z | alert-student-minh-stalled-daily-plan | recognition-minh-parent-encouragement | Parent confirms a quiet practice window for the colors retry after teacher review. |
