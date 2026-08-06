# Learning local demo Student -> Course -> Enrollment -> Subscription/Payment fixture -> Refund/Commission fixture Flow Report

Generated at: 2026-06-30T12:00:00.000Z

## Current Status

- Status: LOCAL_DEMO_READY_WITH_NOTES
- Summary: The local-demo spine connects fixture students, courses, enrollments, subscriptions, payment statuses, refund evidence, and commission evidence without production or provider access.
- Endpoint: /v1/learning-local-demo/student-course-enrollment-subscription-flow-report
- Dashboard evidence: /admin/learning-local-demo#student-course-enrollment-subscription-flow
- JSON export: exports/learning-local-demo-student-course-enrollment-subscription-flow-report.json
- Markdown export: exports/learning-local-demo-student-course-enrollment-subscription-flow-report.md

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
- Courses: 2
- Enrollments: 4
- Subscriptions: 4
- Fixture payment evidence: 4
- Refund evidence: 1
- Commission evidence: 4
- Relationship traces: 4
- Production-ready claims: 0
- Safety gates closed: 19/19
- Open safety gates: 0

## Remaining Local-Demo Notes

- Production enrollment, subscription lifecycle, payment provider capture, refund mutation, and commission payout are out of scope.
- Provider refs are fixture_manual_bank_transfer identifiers only; no provider API read or mutation is executed.
- Dashboard and exports are read-only evidence for local-demo review.

## Evidence Rows

| Evidence | Count | Fixture IDs | Summary |
| --- | ---: | --- | --- |
| STUDENT_PROFILE | 4 | student-ava, student-minh, student-linh, student-khoa | Fixture student profiles use stable child profile and parent email IDs only. |
| COURSE_PACKAGE | 2 | course-a1-starter, course-phonics-booster | Fixture courses expose course code, level, package code, and package name. |
| ENROLLMENT_SUBSCRIPTION | 4 | student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active, student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled, student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing, student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active | Each enrollment row has one traceable fixture subscription and payment row. |
| PAYMENT_FIXTURE | 4 | pay-ava-a1-succeeded, pay-minh-a1-pending, pay-linh-phonics-succeeded, pay-khoa-a1-refunded | Payment evidence is fixture_manual_bank_transfer status data only. |
| REFUND_FIXTURE | 1 | refund-khoa-a1-succeeded | Refund evidence is a deliberate synthetic cancellation example with no real refund mutation. |
| COMMISSION_FIXTURE | 4 | commission-ava-sale-pending, commission-linh-sale-approved, commission-linh-agency-payable, commission-khoa-sale-canceled | Commission evidence includes pending, payable, approved, and canceled fixture rows with no payout mutation. |

## Relationship Trace Rows

| Student | Course | Enrollment | Subscription | Payment | Refunds | Commissions | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ava Nguyen (student-ava) | MH-A1-STARTER (course-a1-starter) | enroll-ava-a1-active ACTIVE | sub-ava-a1-active ACTIVE | pay-ava-a1-succeeded SUCCEEDED | NONE | commission-ava-sale-pending | Ava Nguyen links MH-A1-STARTER through enroll-ava-a1-active, sub-ava-a1-active, pay-ava-a1-succeeded, 0 refund fixture, and 1 commission fixture rows. |
| Khoa Le (student-khoa) | MH-A1-STARTER (course-a1-starter) | enroll-khoa-a1-canceled CANCELED | sub-khoa-a1-canceled CANCELED | pay-khoa-a1-refunded REFUNDED | refund-khoa-a1-succeeded | commission-khoa-sale-canceled | Khoa Le links MH-A1-STARTER through enroll-khoa-a1-canceled, sub-khoa-a1-canceled, pay-khoa-a1-refunded, 1 refund fixture, and 1 commission fixture rows. |
| Minh Tran (student-minh) | MH-A1-STARTER (course-a1-starter) | enroll-minh-a1-pending PENDING | sub-minh-a1-trialing TRIALING | pay-minh-a1-pending PENDING | NONE | NONE | Minh Tran links MH-A1-STARTER through enroll-minh-a1-pending, sub-minh-a1-trialing, pay-minh-a1-pending, 0 refund fixture, and 0 commission fixture rows. |
| Linh Pham (student-linh) | MH-PHONICS-BOOSTER (course-phonics-booster) | enroll-linh-phonics-active ACTIVE | sub-linh-phonics-active ACTIVE | pay-linh-phonics-succeeded SUCCEEDED | NONE | commission-linh-sale-approved, commission-linh-agency-payable | Linh Pham links MH-PHONICS-BOOSTER through enroll-linh-phonics-active, sub-linh-phonics-active, pay-linh-phonics-succeeded, 0 refund fixture, and 2 commission fixture rows. |
