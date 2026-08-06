# Learning local demo Parent/Teacher Progress Alert -> Intervention -> Parent Summary Report

Generated at: 2026-06-30T03:00:00.000Z

## Safety

- Fixture-only local demo data.
- productionDbUsed=false
- noProductionDbRead=true
- providerApiUsed=false
- aiProviderUsed=false
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
- realParentMessageMutationUsed=false
- realTeacherInterventionMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Students/children: 4
- Courses: 2
- Learner progress summaries: 4
- Alerts: 7
- High-risk alerts: 2
- Medium-risk alerts: 5
- Resolved alerts: 1
- Follow-up-needed alerts: 6
- Teacher intervention recommendations: 7
- Parent summaries: 7
- Follow-up status bands: open=3, scheduled=2, resolved=1, monitoring=1

## Top Alert Reasons

| Reason | Alerts |
| --- | ---: |
| Skipped video | 2 |
| Stalled daily plan | 2 |
| Attendance/session gap | 1 |
| Low practice score | 1 |
| Missing submissions | 1 |

## Learner Progress Summaries

| Student | Course | Class | Teacher | Progress | Attendance | Missing | Skipped videos | Blocked plans | Avg practice | Alerts | Follow-up needed | Highest risk |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Ava Nguyen (child-ava-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Teacher Mai | 67% | 100% | 0 | 0 | 0 | 88% | 1 | 1 | MEDIUM |
| Khoa Le (child-khoa-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Teacher Mai | 50% | 50% | 3 | 1 | 0 | 80% | 1 | 0 | MEDIUM |
| Minh Tran (child-minh-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Teacher Mai | 33% | 50% | 3 | 1 | 1 | 65% | 5 | 5 | HIGH |
| Linh Pham (child-linh-demo) | MH-PHONICS-BOOSTER | MH-PHONICS-MAY | Teacher Hanh | 100% | 100% | 0 | 0 | 0 | 94% | 0 | 0 | NONE |

## Alert Intervention Rows

| Student | Severity | Reason | Follow-up | Evidence | Teacher intervention | Parent summary |
| --- | --- | --- | --- | --- | --- | --- |
| Minh Tran (child-minh-demo) | HIGH | Low practice score | SCHEDULED 2026-06-06T10:00:00.000Z | 65% average practice score across scored fixture attempts. | Teacher schedules a 15-minute remedial practice block using the existing colors and objects exercise. | Minh Tran should retry the practice set with teacher guidance because the score is below the 70% support threshold. |
| Minh Tran (child-minh-demo) | HIGH | Missing submissions | OPEN 2026-06-06T09:00:00.000Z | 3 missing submissions with 33% path progress. | Teacher reviews missed tasks, assigns a short catch-up checklist, and records parent call outcome in local-demo notes. | Minh Tran needs parent support to complete 3 missing assignments before the next fixture session. |
| Ava Nguyen (child-ava-demo) | MEDIUM | Stalled daily plan | MONITORING 2026-06-07T09:00:00.000Z | 0 blocked, 0 skipped, and 1 incomplete daily plans. | Teacher monitors the open daily plan and reminds the parent to finish the video/practice pair. | Ava Nguyen is on track but should finish the open fixture daily plan. |
| Khoa Le (child-khoa-demo) | MEDIUM | Skipped video | RESOLVED 2026-05-24T09:30:00.000Z | 1 skipped video after the local-demo withdrawal/refund state. | Teacher marks the skipped-video item resolved because this learner is withdrawn in synthetic fixtures. | Khoa Le's skipped-video follow-up is resolved in the local-demo withdrawal fixture. |
| Minh Tran (child-minh-demo) | MEDIUM | Attendance/session gap | SCHEDULED 2026-06-06T13:00:00.000Z | 50% attendance rate with 1 absent session record. | Teacher schedules an attendance check-in and shares the catch-up lesson sequence with the parent. | Minh Tran missed a fixture session and needs a catch-up plan for the next class. |
| Minh Tran (child-minh-demo) | MEDIUM | Skipped video | OPEN 2026-06-06T11:00:00.000Z | 1 skipped video and 1 incomplete video records. | Teacher reopens the skipped video and asks the parent to confirm a home viewing window. | Minh Tran needs to watch the skipped fixture video before continuing the daily plan. |
| Minh Tran (child-minh-demo) | MEDIUM | Stalled daily plan | OPEN 2026-06-06T14:00:00.000Z | 1 blocked, 1 skipped, and 2 incomplete daily plans. | Teacher unblocks the current daily plan with one guided retry and checks parent availability. | Minh Tran has a blocked fixture daily plan that needs teacher and parent follow-up. |
