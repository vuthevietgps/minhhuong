# Learning local demo Learning Session Completion -> Practice Progress Rollup Report

Generated at: 2026-06-30T04:30:00.000Z

## Current Status

- Status: LOCAL_DEMO_READY_WITH_NOTES
- Summary: Allowed daily plan sessions roll up lesson/video completion and practice score evidence into parent- and teacher-visible read-only progress summaries.
- Endpoint: /v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report
- Dashboard evidence: /admin/learning-local-demo#learning-session-completion-practice-progress-rollup
- JSON export: exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.json
- Markdown export: exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.md

## Safety

- production_ready=false
- fixtureOnly=true
- productionDbUsed=false
- noProductionDbRead=true
- providerApiUsed=false
- aiProviderUsed=false
- aiProviderExecutionUsed=false
- paymentProviderUsed=false
- notificationProviderUsed=false
- liveAdsExecuted=false
- realStudentMutationUsed=false
- realParentMutationUsed=false
- realCourseMutationUsed=false
- realEnrollmentMutationUsed=false
- realSubscriptionMutationUsed=false
- realLearningSessionGateMutationUsed=false
- realDailyPlanAccessMutationUsed=false
- realLearningSessionCompletionMutationUsed=false
- realProgressMutationUsed=false
- realVideoEvidenceMutationUsed=false
- realPracticeMutationUsed=false
- realParentProgressSummaryMutationUsed=false
- realTeacherProgressSummaryMutationUsed=false
- realLearningMutationUsed=false
- realParentMessageMutationUsed=false
- realTeacherInterventionMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Acceptance Counts

- Students: 3
- Courses: 2
- Daily plan session references: 6
- Allowed daily plan session references: 6
- Lesson completion evidence: 6
- Practice attempt evidence: 6
- Progress rollups: 6
- Parent-visible progress summaries: 6
- Teacher-visible progress summaries: 6
- Stable traces: 6
- Rollups with student/course/daily plan/session: 6
- Rollups with lesson/practice evidence: 6
- Rollups with parent/teacher summaries: 6
- Practice attempts with deterministic score/status: 6
- Rollups with completion percent: 6
- Rollups with safe next action: 6
- Average completion: 72%
- Average practice score: 73%
- Production-ready claims: 0
- Safety gates closed: 42/42
- Open safety gates: 0

## Remaining Local-Demo Notes

- Completion and practice rollups are derived from allowed session gate fixtures only.
- Parent and teacher summaries are read-only evidence rows; no parent delivery or teacher workflow mutation is executed.
- Production telemetry writes, persisted progress updates, notification delivery, provider calls, and real learner mutations remain out of scope.

## Evidence Rows

| Evidence | Count | Fixture IDs | Summary |
| --- | ---: | --- | --- |
| ALLOWED_DAILY_PLAN_SESSION_REFERENCE | 6 | learning-session-evidence-gate-ava-a1-day-01, learning-session-evidence-gate-ava-a1-day-02, learning-session-evidence-gate-ava-a1-day-03, learning-session-evidence-gate-minh-a1-day-01, learning-session-evidence-gate-linh-phonics-day-01, learning-session-evidence-gate-linh-phonics-day-02 | Allowed screen-time/grant session evidence is the source for completion rollups. |
| LESSON_VIDEO_COMPLETION | 6 | lesson-completion-video-ava-a1-day-01, lesson-completion-video-ava-a1-day-02, lesson-completion-video-ava-a1-day-03, lesson-completion-video-minh-a1-day-01, lesson-completion-video-linh-phonics-day-01, lesson-completion-video-linh-phonics-day-02 | Lesson/video completion IDs are derived from deterministic local LMS video evidence. |
| PRACTICE_SCORE_ATTEMPT | 6 | practice-ava-a1-day-01:90, practice-ava-a1-day-02:86, practice-ava-a1-day-03:0, practice-minh-a1-day-01:72, practice-linh-phonics-day-01:96, practice-linh-phonics-day-02:92 | Practice attempts include deterministic status and score evidence for each rollup. |
| PROGRESS_ROLLUP | 6 | progress-rollup-learning-session-evidence-gate-ava-a1-day-01, progress-rollup-learning-session-evidence-gate-ava-a1-day-02, progress-rollup-learning-session-evidence-gate-ava-a1-day-03, progress-rollup-learning-session-evidence-gate-minh-a1-day-01, progress-rollup-learning-session-evidence-gate-linh-phonics-day-01, progress-rollup-learning-session-evidence-gate-linh-phonics-day-02 | Progress rollups connect student, course, session, lesson, practice, and progress record IDs. |
| PARENT_VISIBLE_SUMMARY | 6 | parent-progress-summary-daily-plan-guard-gate-ava-a1-day-01, parent-progress-summary-daily-plan-guard-gate-ava-a1-day-02, parent-progress-summary-daily-plan-guard-gate-ava-a1-day-03, parent-progress-summary-daily-plan-guard-gate-minh-a1-day-01, parent-progress-summary-daily-plan-guard-gate-linh-phonics-day-01, parent-progress-summary-daily-plan-guard-gate-linh-phonics-day-02 | Parent-visible summaries are local-demo report rows only and do not send notifications. |
| TEACHER_VISIBLE_SUMMARY | 6 | teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-01, teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-02, teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-03, teacher-progress-summary-daily-plan-guard-gate-minh-a1-day-01, teacher-progress-summary-daily-plan-guard-gate-linh-phonics-day-01, teacher-progress-summary-daily-plan-guard-gate-linh-phonics-day-02 | Teacher-visible summaries are local-demo report rows only and do not mutate teacher workflow state. |
| SAFETY_GATE | 42 | productionReady=false, fixtureOnly=true, productionDbUsed=false, noProductionDbRead=true, providerApiUsed=false, aiProviderUsed=false, aiProviderExecutionUsed=false, paymentProviderUsed=false, notificationProviderUsed=false, liveAdsExecuted=false, realStudentMutationUsed=false, realParentMutationUsed=false, realCourseMutationUsed=false, realEnrollmentMutationUsed=false, realSubscriptionMutationUsed=false, realClassMutationUsed=false, realSessionMutationUsed=false, realAttendanceMutationUsed=false, realProgressMutationUsed=false, realLessonMutationUsed=false, realAssignmentMutationUsed=false, realAssessmentMutationUsed=false, realLearningPathMutationUsed=false, realDailyPlanMutationUsed=false, realVideoEvidenceMutationUsed=false, realPracticeMutationUsed=false, realParentGuardianMutationUsed=false, realScreenTimePolicyMutationUsed=false, realLearningSessionGateMutationUsed=false, realScreenTimeGrantMutationUsed=false, realDailyPlanAccessMutationUsed=false, realLearningMutationUsed=false, realLearningSessionCompletionMutationUsed=false, realParentProgressSummaryMutationUsed=false, realTeacherProgressSummaryMutationUsed=false, realParentMessageMutationUsed=false, realTeacherInterventionMutationUsed=false, realPaymentMutationUsed=false, realRefundMutationUsed=false, realCommissionMutationUsed=false, realErpMutationUsed=false, secretsRequired=false | All production, provider, payment, notification, AI, learning mutation, parent summary, teacher summary, and ERP mutation gates remain closed. |

## Progress Rollup Rows

| Rollup | Child | Daily plan/session | Lesson/video | Practice | Progress | Parent summary | Teacher summary | Next action | Trace |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| progress-rollup-learning-session-evidence-gate-ava-a1-day-01 ON_TRACK | Ava Nguyen (child-ava-demo) | Watch greetings video and complete quick check / learning-session-evidence-gate-ava-a1-day-01 | A1-L01 COMPLETED 100% | PASSED 90% | IN_PROGRESS 67% | parent-progress-summary-daily-plan-guard-gate-ava-a1-day-01 | teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-01 | Continue the next fixture practice item and monitor progress | student-ava->course-a1-starter->plan-ava-a1-day-01->session-a1-001-greetings->lesson-a1-001-greetings->learning-session-evidence-gate-ava-a1-day-01->lesson-completion-video-ava-a1-day-01->video-ava-a1-day-01->practice-ava-a1-day-01->progress-ava-a1->progress-rollup-learning-session-evidence-gate-ava-a1-day-01->parent-progress-summary-daily-plan-guard-gate-ava-a1-day-01->teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-01 |
| progress-rollup-learning-session-evidence-gate-ava-a1-day-02 ON_TRACK | Ava Nguyen (child-ava-demo) | Watch colors video and retry objects practice / learning-session-evidence-gate-ava-a1-day-02 | A1-L02 COMPLETED 100% | PASSED 86% | IN_PROGRESS 67% | parent-progress-summary-daily-plan-guard-gate-ava-a1-day-02 | teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-02 | Continue the next fixture practice item and monitor progress | student-ava->course-a1-starter->plan-ava-a1-day-02->session-a1-002-colors->lesson-a1-002-colors->learning-session-evidence-gate-ava-a1-day-02->lesson-completion-video-ava-a1-day-02->video-ava-a1-day-02->practice-ava-a1-day-02->progress-ava-a1->progress-rollup-learning-session-evidence-gate-ava-a1-day-02->parent-progress-summary-daily-plan-guard-gate-ava-a1-day-02->teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-02 |
| progress-rollup-learning-session-evidence-gate-ava-a1-day-03 IN_PROGRESS | Ava Nguyen (child-ava-demo) | Preview family words video before live class / learning-session-evidence-gate-ava-a1-day-03 | A1-L03 INCOMPLETE 40% | INCOMPLETE 0% | IN_PROGRESS 67% | parent-progress-summary-daily-plan-guard-gate-ava-a1-day-03 | teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-03 | Complete the fixture lesson video before rolling up the next summary | student-ava->course-a1-starter->plan-ava-a1-day-03->session-a1-003-family->lesson-a1-003-family->learning-session-evidence-gate-ava-a1-day-03->lesson-completion-video-ava-a1-day-03->video-ava-a1-day-03->practice-ava-a1-day-03->progress-ava-a1->progress-rollup-learning-session-evidence-gate-ava-a1-day-03->parent-progress-summary-daily-plan-guard-gate-ava-a1-day-03->teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-03 |
| progress-rollup-learning-session-evidence-gate-minh-a1-day-01 NEEDS_SUPPORT | Minh Tran (child-minh-demo) | Complete greetings catch-up after late attendance / learning-session-evidence-gate-minh-a1-day-01 | A1-L01 COMPLETED 100% | PASSED 72% | NEEDS_SUPPORT 33% | parent-progress-summary-daily-plan-guard-gate-minh-a1-day-01 | teacher-progress-summary-daily-plan-guard-gate-minh-a1-day-01 | Schedule teacher support before the next parent-visible progress update | student-minh->course-a1-starter->plan-minh-a1-day-01->session-a1-001-greetings->lesson-a1-001-greetings->learning-session-evidence-gate-minh-a1-day-01->lesson-completion-video-minh-a1-day-01->video-minh-a1-day-01->practice-minh-a1-day-01->progress-minh-a1->progress-rollup-learning-session-evidence-gate-minh-a1-day-01->parent-progress-summary-daily-plan-guard-gate-minh-a1-day-01->teacher-progress-summary-daily-plan-guard-gate-minh-a1-day-01 |
| progress-rollup-learning-session-evidence-gate-linh-phonics-day-01 COMPLETED | Linh Pham (child-linh-demo) | Short A video evidence and decoding practice / learning-session-evidence-gate-linh-phonics-day-01 | PH-L01 COMPLETED 100% | PASSED 96% | COMPLETED 100% | parent-progress-summary-daily-plan-guard-gate-linh-phonics-day-01 | teacher-progress-summary-daily-plan-guard-gate-linh-phonics-day-01 | Show parent progress summary and open the next fixture daily plan | student-linh->course-phonics-booster->plan-linh-phonics-day-01->session-phonics-001-short-a->lesson-phonics-001-short-a->learning-session-evidence-gate-linh-phonics-day-01->lesson-completion-video-linh-phonics-day-01->video-linh-phonics-day-01->practice-linh-phonics-day-01->progress-linh-phonics->progress-rollup-learning-session-evidence-gate-linh-phonics-day-01->parent-progress-summary-daily-plan-guard-gate-linh-phonics-day-01->teacher-progress-summary-daily-plan-guard-gate-linh-phonics-day-01 |
| progress-rollup-learning-session-evidence-gate-linh-phonics-day-02 COMPLETED | Linh Pham (child-linh-demo) | Short E blending video and recording practice / learning-session-evidence-gate-linh-phonics-day-02 | PH-L02 COMPLETED 100% | PASSED 92% | COMPLETED 100% | parent-progress-summary-daily-plan-guard-gate-linh-phonics-day-02 | teacher-progress-summary-daily-plan-guard-gate-linh-phonics-day-02 | Show parent progress summary and open the next fixture daily plan | student-linh->course-phonics-booster->plan-linh-phonics-day-02->session-phonics-002-short-e->lesson-phonics-002-short-e->learning-session-evidence-gate-linh-phonics-day-02->lesson-completion-video-linh-phonics-day-02->video-linh-phonics-day-02->practice-linh-phonics-day-02->progress-linh-phonics->progress-rollup-learning-session-evidence-gate-linh-phonics-day-02->parent-progress-summary-daily-plan-guard-gate-linh-phonics-day-02->teacher-progress-summary-daily-plan-guard-gate-linh-phonics-day-02 |

## Parent Summary Rows

| Parent summary | Child | Daily plan | Completion | Practice | Status | Next action |
| --- | --- | --- | ---: | ---: | --- | --- |
| parent-progress-summary-daily-plan-guard-gate-ava-a1-day-01 | Ava Nguyen (child-ava-demo) | Watch greetings video and complete quick check | 67% | 90% | ON_TRACK | Continue the next fixture practice item and monitor progress |
| parent-progress-summary-daily-plan-guard-gate-ava-a1-day-02 | Ava Nguyen (child-ava-demo) | Watch colors video and retry objects practice | 67% | 86% | ON_TRACK | Continue the next fixture practice item and monitor progress |
| parent-progress-summary-daily-plan-guard-gate-ava-a1-day-03 | Ava Nguyen (child-ava-demo) | Preview family words video before live class | 67% | 0% | IN_PROGRESS | Complete the fixture lesson video before rolling up the next summary |
| parent-progress-summary-daily-plan-guard-gate-minh-a1-day-01 | Minh Tran (child-minh-demo) | Complete greetings catch-up after late attendance | 33% | 72% | NEEDS_SUPPORT | Schedule teacher support before the next parent-visible progress update |
| parent-progress-summary-daily-plan-guard-gate-linh-phonics-day-01 | Linh Pham (child-linh-demo) | Short A video evidence and decoding practice | 100% | 96% | COMPLETED | Show parent progress summary and open the next fixture daily plan |
| parent-progress-summary-daily-plan-guard-gate-linh-phonics-day-02 | Linh Pham (child-linh-demo) | Short E blending video and recording practice | 100% | 92% | COMPLETED | Show parent progress summary and open the next fixture daily plan |

## Teacher Summary Rows

| Teacher summary | Teacher | Child | Class | Lesson | Completion | Practice | Status | Next action |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |
| teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-01 | Teacher Mai | Ava Nguyen (child-ava-demo) | MH-A1-JUN-WEEKDAY | A1-L01 | 67% | 90% | ON_TRACK | Continue the next fixture practice item and monitor progress |
| teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-02 | Teacher Mai | Ava Nguyen (child-ava-demo) | MH-A1-JUN-WEEKDAY | A1-L02 | 67% | 86% | ON_TRACK | Continue the next fixture practice item and monitor progress |
| teacher-progress-summary-daily-plan-guard-gate-ava-a1-day-03 | Teacher Mai | Ava Nguyen (child-ava-demo) | MH-A1-JUN-WEEKDAY | A1-L03 | 67% | 0% | IN_PROGRESS | Complete the fixture lesson video before rolling up the next summary |
| teacher-progress-summary-daily-plan-guard-gate-minh-a1-day-01 | Teacher Mai | Minh Tran (child-minh-demo) | MH-A1-JUN-WEEKDAY | A1-L01 | 33% | 72% | NEEDS_SUPPORT | Schedule teacher support before the next parent-visible progress update |
| teacher-progress-summary-daily-plan-guard-gate-linh-phonics-day-01 | Teacher Hanh | Linh Pham (child-linh-demo) | MH-PHONICS-MAY | PH-L01 | 100% | 96% | COMPLETED | Show parent progress summary and open the next fixture daily plan |
| teacher-progress-summary-daily-plan-guard-gate-linh-phonics-day-02 | Teacher Hanh | Linh Pham (child-linh-demo) | MH-PHONICS-MAY | PH-L02 | 100% | 92% | COMPLETED | Show parent progress summary and open the next fixture daily plan |
