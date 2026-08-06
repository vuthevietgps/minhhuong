# Learning local demo Follow-up Action Outcome Report

Generated at: 2026-06-30T09:00:00.000Z

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
- realWeeklyDigestNotificationMutationUsed=false
- realFollowUpActionOutcomeMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Follow-up outcomes: 6
- Completed outcomes: 1
- Verified outcomes: 1
- Scheduled outcomes: 1
- Monitoring outcomes: 2
- Held outcomes: 1
- Parent-visible outcomes: 2
- Teacher-only outcomes: 4
- Positive outcomes: 2
- Needs-support outcomes: 2
- No-send outcomes: 1
- Linked daily plans: 6
- Linked support recommendations: 5
- Linked achievements: 4
- Linked parent summaries: 3
- Linked teacher reviews: 3
- Students covered: 4
- Students completed or verified: 2
- Students with open outcomes: 3

## Student Outcome Rows

| Student | Course | Outcomes | Done/verified | Scheduled/monitoring | Held | Needs support | Parent visible | Next review | Summary |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Ava Nguyen (child-ava-demo) | MH-A1-STARTER / MH-A1-JUN-WEEKDAY | 2 | 1 | 1 | 0 | 0 | 1 | 2026-06-07T09:00:00.000Z | Ava Nguyen has 1 completed or verified follow-up outcome. |
| Khoa Le (child-khoa-demo) | MH-A1-STARTER / MH-A1-JUN-WEEKDAY | 1 | 0 | 0 | 1 | 0 | 0 | n/a | Khoa Le has a held teacher-only outcome with no parent send from fixture evidence. |
| Linh Pham (child-linh-demo) | MH-PHONICS-BOOSTER / MH-PHONICS-MAY | 1 | 1 | 0 | 0 | 0 | 1 | n/a | Linh Pham has 1 completed or verified follow-up outcome. |
| Minh Tran (child-minh-demo) | MH-A1-STARTER / MH-A1-JUN-WEEKDAY | 2 | 0 | 2 | 0 | 2 | 0 | 2026-06-07T11:00:00.000Z | Minh Tran has 2 needs-support outcome and remains in teacher follow-up review. |

## Outcome Rows

| Outcome | Student | Action | Owner | Priority | Action status | Outcome | Impact | Visible | Daily plan | Support | Achievement | Parent summary | Teacher review | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| followup-outcome-linh-parent-celebrate | Linh Pham (child-linh-demo) | digest-action-linh-parent-celebrate | PARENT | LOW | COMPLETED | COMPLETED | POSITIVE | parent-visible | plan-linh-phonics-day-02 / COMPLETED | n/a | achievement-linh-short-e-course-complete / COURSE_COMPLETION | ai-parent-summary-linh-phonics | n/a | Linh parent celebration completed after the phonics course completion achievement and allowed tutor parent summary. |
| followup-outcome-khoa-teacher-hold | Khoa Le (child-khoa-demo) | digest-action-khoa-teacher-hold | TEACHER | HIGH | HELD | HELD | NO_SEND | teacher-only | plan-khoa-a1-day-01 / COMPLETED | ai-support-khoa-access-parent-check / MONITORING | achievement-khoa-prewithdrawal-greetings / LESSON_MASTERY | n/a | ai-review-khoa-account-access / OPEN | Teacher held Khoa follow-up because the enrollment is withdrawn, access remains blocked, and no parent digest should be sent. |
| followup-outcome-ava-teacher-certificate-check | Ava Nguyen (child-ava-demo) | digest-action-ava-teacher-certificate-check | TEACHER | MEDIUM | SCHEDULED | VERIFIED | POSITIVE | teacher-only | plan-ava-a1-day-02 / COMPLETED | ai-support-ava-privacy-reminder / COMPLETED | achievement-ava-colors-practice / PRACTICE_STREAK | n/a | ai-review-ava-personal-data / REVIEWED | Teacher Mai verified the privacy reminder and colors achievement evidence before the final family preview check. |
| followup-outcome-ava-parent-family-preview | Ava Nguyen (child-ava-demo) | digest-action-ava-parent-family-preview | PARENT | MEDIUM | RECOMMENDED | MONITORING | STABLE | parent-visible | plan-ava-a1-day-03 / IN_PROGRESS | ai-support-ava-privacy-reminder / COMPLETED | n/a | ai-parent-summary-ava-colors | n/a | Ava parent protected the fixture practice window, but the family preview daily plan remains in progress. |
| followup-outcome-minh-teacher-recovery-plan | Minh Tran (child-minh-demo) | digest-action-minh-teacher-recovery-plan | TEACHER | HIGH | SCHEDULED | SCHEDULED | NEEDS_SUPPORT | teacher-only | plan-minh-a1-day-02 / BLOCKED | ai-support-minh-colors-redirect / RECOMMENDED | achievement-minh-greetings-catchup / SAFE_TUTOR_USE | n/a | ai-review-minh-off-topic-game / OPEN | Teacher recovery plan is scheduled from the blocked colors daily plan, open AI tutor review, and Minh greetings catch-up evidence. |
| followup-outcome-minh-parent-practice-window | Minh Tran (child-minh-demo) | digest-action-minh-parent-practice-window | PARENT | MEDIUM | RECOMMENDED | MONITORING | NEEDS_SUPPORT | teacher-only | plan-minh-a1-day-02 / BLOCKED | ai-support-minh-colors-redirect / RECOMMENDED | n/a | ai-parent-summary-minh-colors | n/a | Parent practice window is recorded as pending because colors practice remains blocked and the parent summary is held for teacher review. |
