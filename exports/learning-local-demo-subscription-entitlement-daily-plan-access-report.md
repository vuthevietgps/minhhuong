# Learning local demo Subscription Entitlement -> Daily Plan Access Gate Report

Generated at: 2026-06-30T12:30:00.000Z

## Current Status

- Status: LOCAL_DEMO_READY_WITH_NOTES
- Summary: The local-demo access gate derives course entitlements from fixture enrollment, subscription, payment, refund, learning path, and daily plan rows.
- Endpoint: /v1/learning-local-demo/subscription-entitlement-daily-plan-access-report
- Dashboard evidence: /admin/learning-local-demo#subscription-entitlement-daily-plan-access
- JSON export: exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json
- Markdown export: exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.md

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
- Entitlements: 4
- Daily plan access cases: 4
- Unlocked access: 2
- Blocked access: 2
- Blocked pending payment: 1
- Blocked expired: 1
- Blocked revoked: 1
- Blocked refunded: 1
- Blocked canceled: 0
- Lifecycle rows: 5
- Lifecycle expired rows: 1
- Lifecycle revoked rows: 1
- Lifecycle rows with reason: 5
- Relationship traces: 4
- Blocked access with reason: 2
- Production-ready claims: 0
- Safety gates closed: 19/19
- Open safety gates: 0

## Remaining Local-Demo Notes

- Entitlements are derived from fixture enrollment, subscription, payment, refund, learning path, and daily plan rows only.
- Blocked rows explain the local-demo reason and next safe action without calling providers or mutating learning access.
- Lifecycle hardening rows add expired and revoked entitlement audit coverage as fixture-only snapshots over stable local-demo IDs.
- Production entitlement sync, subscription lifecycle, payment capture, refund mutation, and learner access writes are out of scope.

## Evidence Rows

| Evidence | Count | Fixture IDs | Summary |
| --- | ---: | --- | --- |
| COURSE_ENTITLEMENT | 4 | entitlement-sub-ava-a1-active, entitlement-sub-khoa-a1-canceled, entitlement-sub-minh-a1-trialing, entitlement-sub-linh-phonics-active | Each entitlement is a deterministic local-demo ID derived from the fixture subscription ID. |
| UNLOCKED_DAILY_PLAN_ACCESS | 2 | student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03, student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active->entitlement-sub-linh-phonics-active->plan-linh-phonics-day-01 | Active paid fixture subscriptions unlock representative learning path and daily plan access. |
| BLOCKED_DAILY_PLAN_ACCESS | 2 | student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02, student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02 | Non-active or refunded fixture subscriptions are blocked with explicit reasons and safe next actions. |
| ENTITLEMENT_LIFECYCLE_HARDENING | 5 | entitlement-lifecycle-sub-ava-a1-active->entitlement-sub-ava-a1-active->ACTIVE->UNLOCKED, entitlement-lifecycle-sub-minh-a1-pending-payment->entitlement-sub-minh-a1-trialing->PENDING_PAYMENT->BLOCKED_PENDING_PAYMENT, entitlement-lifecycle-sub-khoa-a1-refunded->entitlement-sub-khoa-a1-canceled->REFUNDED->BLOCKED_REFUNDED, entitlement-lifecycle-sub-ava-a1-expired-snapshot->entitlement-sub-ava-a1-active->EXPIRED->BLOCKED_EXPIRED, entitlement-lifecycle-sub-khoa-a1-revoked-snapshot->entitlement-sub-khoa-a1-canceled->REVOKED->BLOCKED_REVOKED | Lifecycle matrix covers active, pending payment, refunded, expired, and revoked entitlement outcomes without provider calls or access mutations. |
| RELATIONSHIP_TRACE | 4 | student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03, student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02, student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02, student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active->entitlement-sub-linh-phonics-active->plan-linh-phonics-day-01 | Relationship keys trace student -> course -> enrollment -> subscription -> entitlement -> daily plan. |
| SAFETY_GATE | 19 | productionReady=false, fixtureOnly=true, productionDbUsed=false, noProductionDbRead=true, providerApiUsed=false, paymentProviderUsed=false, aiProviderExecutionUsed=false, notificationProviderUsed=false, liveAdsExecuted=false, realStudentMutationUsed=false, realCourseMutationUsed=false, realEnrollmentMutationUsed=false, realSubscriptionMutationUsed=false, realPaymentMutationUsed=false, realRefundMutationUsed=false, realCommissionMutationUsed=false, realLearningMutationUsed=false, realErpMutationUsed=false, secretsRequired=false | All production, provider, payment, notification, learning mutation, and ERP mutation gates remain closed. |

## Access Case Rows

| Student | Course | Enrollment | Subscription | Entitlement | Learning path | Daily plan | Access | Blocked reason | Next safe action | Trace |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ava Nguyen (student-ava) | MH-A1-STARTER (course-a1-starter) | enroll-ava-a1-active ACTIVE | sub-ava-a1-active ACTIVE / pay-ava-a1-succeeded SUCCEEDED | entitlement-sub-ava-a1-active GRANTED | path-ava-a1-june ACTIVE | plan-ava-a1-day-03 IN_PROGRESS | UNLOCKED | NONE | Open local-demo daily plan | student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03 |
| Khoa Le (student-khoa) | MH-A1-STARTER (course-a1-starter) | enroll-khoa-a1-canceled CANCELED | sub-khoa-a1-canceled CANCELED / pay-khoa-a1-refunded REFUNDED | entitlement-sub-khoa-a1-canceled BLOCKED | path-khoa-a1-withdrawn WITHDRAWN | plan-khoa-a1-day-02 SKIPPED | BLOCKED_REFUNDED | Fixture payment was refunded; keep course path and daily plan access blocked in read-only evidence. | Keep blocked after synthetic refund | student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled->entitlement-sub-khoa-a1-canceled->plan-khoa-a1-day-02 |
| Minh Tran (student-minh) | MH-A1-STARTER (course-a1-starter) | enroll-minh-a1-pending PENDING | sub-minh-a1-trialing TRIALING / pay-minh-a1-pending PENDING | entitlement-sub-minh-a1-trialing BLOCKED | path-minh-a1-june NEEDS_SUPPORT | plan-minh-a1-day-02 BLOCKED | BLOCKED_PENDING_PAYMENT | Fixture subscription or enrollment is not active paid; wait for the local-demo payment confirmation before unlocking learning access. | Confirm fixture payment before unlocking | student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02 |
| Linh Pham (student-linh) | MH-PHONICS-BOOSTER (course-phonics-booster) | enroll-linh-phonics-active ACTIVE | sub-linh-phonics-active ACTIVE / pay-linh-phonics-succeeded SUCCEEDED | entitlement-sub-linh-phonics-active GRANTED | path-linh-phonics-may COMPLETED | plan-linh-phonics-day-01 COMPLETED | UNLOCKED | NONE | Open local-demo daily plan | student-linh->course-phonics-booster->enroll-linh-phonics-active->sub-linh-phonics-active->entitlement-sub-linh-phonics-active->plan-linh-phonics-day-01 |

## Lifecycle Hardening Rows

| Lifecycle | Student | Entitlement | Access | Reason | Next safe action | Audit trace |
| --- | --- | --- | --- | --- | --- | --- |
| ACTIVE (entitlement-lifecycle-sub-ava-a1-active) | Ava Nguyen (student-ava) | entitlement-sub-ava-a1-active GRANTED | UNLOCKED | Active paid fixture entitlement remains unlocked for the local-demo daily plan. | Allow read-only local-demo daily plan access | entitlement-lifecycle-sub-ava-a1-active->entitlement-sub-ava-a1-active->ACTIVE->UNLOCKED |
| PENDING_PAYMENT (entitlement-lifecycle-sub-minh-a1-pending-payment) | Minh Tran (student-minh) | entitlement-sub-minh-a1-trialing BLOCKED | BLOCKED_PENDING_PAYMENT | Pending fixture payment keeps learning access blocked until the local-demo payment evidence succeeds. | Keep blocked and review fixture payment evidence | entitlement-lifecycle-sub-minh-a1-pending-payment->entitlement-sub-minh-a1-trialing->PENDING_PAYMENT->BLOCKED_PENDING_PAYMENT |
| REFUNDED (entitlement-lifecycle-sub-khoa-a1-refunded) | Khoa Le (student-khoa) | entitlement-sub-khoa-a1-canceled BLOCKED | BLOCKED_REFUNDED | Refunded fixture payment keeps course path access blocked and review-only. | Keep blocked after synthetic refund | entitlement-lifecycle-sub-khoa-a1-refunded->entitlement-sub-khoa-a1-canceled->REFUNDED->BLOCKED_REFUNDED |
| EXPIRED (entitlement-lifecycle-sub-ava-a1-expired-snapshot) | Ava Nguyen (student-ava) | entitlement-sub-ava-a1-active BLOCKED | BLOCKED_EXPIRED | Expired fixture snapshot blocks the same Ava entitlement after the period end without changing the active base row. | Renew fixture subscription before unlocking | entitlement-lifecycle-sub-ava-a1-expired-snapshot->entitlement-sub-ava-a1-active->EXPIRED->BLOCKED_EXPIRED |
| REVOKED (entitlement-lifecycle-sub-khoa-a1-revoked-snapshot) | Khoa Le (student-khoa) | entitlement-sub-khoa-a1-canceled BLOCKED | BLOCKED_REVOKED | Revoked fixture snapshot documents support/ops manual entitlement removal after refund review, with no provider mutation. | Keep revoked until a new fixture entitlement exists | entitlement-lifecycle-sub-khoa-a1-revoked-snapshot->entitlement-sub-khoa-a1-canceled->REVOKED->BLOCKED_REVOKED |
