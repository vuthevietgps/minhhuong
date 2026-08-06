# Learning local demo Parent/Teacher Progress Access Summary Report

Generated at: 2026-06-30T13:00:00.000Z

## Current Status

- Status: LOCAL_DEMO_READY_WITH_NOTES
- Summary: Parent and teacher read-only summaries compose fixture entitlement access, blocked reasons, and progress evidence without production data or mutations.
- Endpoint: /v1/learning-local-demo/parent-teacher-progress-access-summary-report
- Dashboard evidence: /admin/learning-local-demo#parent-teacher-progress-access-summary
- JSON export: exports/learning-local-demo-parent-teacher-progress-access-summary-report.json
- Markdown export: exports/learning-local-demo-parent-teacher-progress-access-summary-report.md

## Safety

- production_ready=false
- fixtureOnly=true
- productionDbUsed=false
- noProductionDbRead=true
- providerApiUsed=false
- paymentProviderUsed=false
- aiProviderExecutionUsed=false
- notificationProviderUsed=false
- liveAdsExecuted=false
- realStudentMutationUsed=false
- realCourseMutationUsed=false
- realEnrollmentMutationUsed=false
- realSubscriptionMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realLearningMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Acceptance Counts

- Students: 4
- Parent guardians: 4
- Teachers/admins: 3
- Courses: 2
- Enrollments: 4
- Entitlements: 4
- Daily plan access cases: 4
- Unlocked access: 2
- Blocked access: 2
- Blocked reasons: 2
- Progress summaries: 4
- Parent summaries: 4
- Teacher summaries: 4
- Parent summaries with trace: 4
- Teacher summaries with trace: 4
- Blocked access in summaries with reason: 2
- Production-ready claims: 0
- Safety gates closed: 19/19
- Open safety gates: 0

## Remaining Local-Demo Notes

- Parent summaries are read-only views over guardian, entitlement, daily plan, and progress fixtures.
- Teacher/admin summaries aggregate existing fixture access rows by assigned class and course without writing learning records.
- Production parent messaging, teacher interventions, entitlement sync, payment handling, and progress mutations are out of scope.

## Evidence Rows

| Evidence | Count | Fixture IDs | Summary |
| --- | ---: | --- | --- |
| PARENT_GUARDIAN_LINK | 4 | guardian-ava-parent->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active, guardian-khoa-parent->student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02->progress-access-enroll-khoa-a1-canceled, guardian-minh-parent->student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02->progress-access-enroll-minh-a1-pending, guardian-linh-parent->student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active->entitlement-sub-linh-phonics-active->plan-linh-phonics-day-01->progress-access-enroll-linh-phonics-active | Each parent summary links a fixture guardian to child, course entitlement, daily plan access, and progress evidence. |
| TEACHER_COURSE_LINK | 4 | content-owner-admin-hoa->class-a1-june-weekday->course-a1-starter, content-owner-admin-hoa->class-phonics-may-booster->course-phonics-booster, content-owner-teacher-hanh->class-phonics-may-booster->course-phonics-booster, content-owner-teacher-mai->class-a1-june-weekday->course-a1-starter | Teacher/admin summaries use content owner class assignments to aggregate course access and progress rows. |
| PROGRESS_ACCESS_SUMMARY | 4 | student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-ava-a1->video-ava-a1-day-03->practice-ava-a1-day-03, student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02->progress-khoa-a1->video-khoa-a1-day-02->practice-khoa-a1-day-02, student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02->progress-minh-a1->video-minh-a1-day-02->practice-minh-a1-day-02, student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active->entitlement-sub-linh-phonics-active->plan-linh-phonics-day-01->progress-linh-phonics->video-linh-phonics-day-01->practice-linh-phonics-day-01 | Progress rows connect entitlement access to progress, video, and practice evidence for unlocked and blocked cases. |
| BLOCKED_REASON_SUMMARY | 2 | student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02, student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02 | Blocked access rows are surfaced to parent and teacher summaries with explicit local-demo reasons. |
| SAFETY_GATE | 19 | productionReady=false, fixtureOnly=true, productionDbUsed=false, noProductionDbRead=true, providerApiUsed=false, paymentProviderUsed=false, aiProviderExecutionUsed=false, notificationProviderUsed=false, liveAdsExecuted=false, realStudentMutationUsed=false, realCourseMutationUsed=false, realEnrollmentMutationUsed=false, realSubscriptionMutationUsed=false, realPaymentMutationUsed=false, realRefundMutationUsed=false, realCommissionMutationUsed=false, realLearningMutationUsed=false, realErpMutationUsed=false, secretsRequired=false | All production, provider, payment, notification, learning mutation, and ERP mutation gates remain closed. |

## Parent Summary Rows

| Parent | Child | Course | Access | Progress | Blocked reason | Trace | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ava Parent (guardian-ava-parent) | Ava Nguyen (child-ava-demo) | MH-A1-STARTER | UNLOCKED / GRANTED | IN_PROGRESS 67% | NONE | guardian-ava-parent->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active | Ava Nguyen can open plan-ava-a1-day-03; progress is IN_PROGRESS at 67%. |
| Khoa Parent (guardian-khoa-parent) | Khoa Le (child-khoa-demo) | MH-A1-STARTER | BLOCKED_REFUNDED / BLOCKED | WITHDRAWN 33% | Fixture payment was refunded; keep course path and daily plan access blocked in read-only evidence. | guardian-khoa-parent->student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02->progress-access-enroll-khoa-a1-canceled | Khoa Le cannot open plan-khoa-a1-day-02; Fixture payment was refunded; keep course path and daily plan access blocked in read-only evidence. |
| Minh Parent (guardian-minh-parent) | Minh Tran (child-minh-demo) | MH-A1-STARTER | BLOCKED_PENDING_PAYMENT / BLOCKED | NEEDS_SUPPORT 33% | Fixture subscription or enrollment is not active paid; wait for the local-demo payment confirmation before unlocking learning access. | guardian-minh-parent->student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02->progress-access-enroll-minh-a1-pending | Minh Tran cannot open plan-minh-a1-day-02; Fixture subscription or enrollment is not active paid; wait for the local-demo payment confirmation before unlocking learning access. |
| Linh Parent (guardian-linh-parent) | Linh Pham (child-linh-demo) | MH-PHONICS-BOOSTER | UNLOCKED / GRANTED | COMPLETED 100% | NONE | guardian-linh-parent->student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active->entitlement-sub-linh-phonics-active->plan-linh-phonics-day-01->progress-access-enroll-linh-phonics-active | Linh Pham can open plan-linh-phonics-day-01; progress is COMPLETED at 100%. |

## Teacher Summary Rows

| Teacher | Class | Course | Students | Access | Progress | Blocked reasons | Trace IDs | Summary |
| --- | --- | --- | ---: | --- | --- | ---: | --- | --- |
| Admin Hoa (ADMIN) | MH-A1-JUN-WEEKDAY | MH-A1-STARTER | 3 | 1 unlocked / 2 blocked | 44% average | 2 | content-owner-admin-hoa->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active, content-owner-admin-hoa->student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02->progress-access-enroll-khoa-a1-canceled, content-owner-admin-hoa->student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02->progress-access-enroll-minh-a1-pending | Admin Hoa sees 3 fixture learner access summaries for MH-A1-JUN-WEEKDAY: 2 blocked and 44% average progress. |
| Admin Hoa (ADMIN) | MH-PHONICS-MAY | MH-PHONICS-BOOSTER | 1 | 1 unlocked / 0 blocked | 100% average | 0 | content-owner-admin-hoa->student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active->entitlement-sub-linh-phonics-active->plan-linh-phonics-day-01->progress-access-enroll-linh-phonics-active | Admin Hoa sees 1 fixture learner access summaries for MH-PHONICS-MAY: 0 blocked and 100% average progress. |
| Teacher Hanh (TEACHER) | MH-PHONICS-MAY | MH-PHONICS-BOOSTER | 1 | 1 unlocked / 0 blocked | 100% average | 0 | content-owner-teacher-hanh->student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active->entitlement-sub-linh-phonics-active->plan-linh-phonics-day-01->progress-access-enroll-linh-phonics-active | Teacher Hanh sees 1 fixture learner access summaries for MH-PHONICS-MAY: 0 blocked and 100% average progress. |
| Teacher Mai (TEACHER) | MH-A1-JUN-WEEKDAY | MH-A1-STARTER | 3 | 1 unlocked / 2 blocked | 44% average | 2 | content-owner-teacher-mai->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active, content-owner-teacher-mai->student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02->progress-access-enroll-khoa-a1-canceled, content-owner-teacher-mai->student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02->progress-access-enroll-minh-a1-pending | Teacher Mai sees 3 fixture learner access summaries for MH-A1-JUN-WEEKDAY: 2 blocked and 44% average progress. |

## Progress Access Rows

| Student | Daily plan | Access | Progress | Evidence | Blocked reason | Trace |
| --- | --- | --- | --- | --- | --- | --- |
| Ava Nguyen (student-ava) | plan-ava-a1-day-03 IN_PROGRESS | UNLOCKED / GRANTED | IN_PROGRESS 67% | video-ava-a1-day-03 INCOMPLETE; practice-ava-a1-day-03 INCOMPLETE | NONE | student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-ava-a1->video-ava-a1-day-03->practice-ava-a1-day-03 |
| Khoa Le (student-khoa) | plan-khoa-a1-day-02 SKIPPED | BLOCKED_REFUNDED / BLOCKED | WITHDRAWN 33% | video-khoa-a1-day-02 SKIPPED; practice-khoa-a1-day-02 SKIPPED | Fixture payment was refunded; keep course path and daily plan access blocked in read-only evidence. | student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02->progress-khoa-a1->video-khoa-a1-day-02->practice-khoa-a1-day-02 |
| Minh Tran (student-minh) | plan-minh-a1-day-02 BLOCKED | BLOCKED_PENDING_PAYMENT / BLOCKED | NEEDS_SUPPORT 33% | video-minh-a1-day-02 INCOMPLETE; practice-minh-a1-day-02 NEEDS_RETRY | Fixture subscription or enrollment is not active paid; wait for the local-demo payment confirmation before unlocking learning access. | student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02->progress-minh-a1->video-minh-a1-day-02->practice-minh-a1-day-02 |
| Linh Pham (student-linh) | plan-linh-phonics-day-01 COMPLETED | UNLOCKED / GRANTED | COMPLETED 100% | video-linh-phonics-day-01 COMPLETED; practice-linh-phonics-day-01 PASSED | NONE | student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active->entitlement-sub-linh-phonics-active->plan-linh-phonics-day-01->progress-linh-phonics->video-linh-phonics-day-01->practice-linh-phonics-day-01 |
