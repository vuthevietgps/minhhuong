# Learning local demo Parent Screen-Time Grant -> Daily Plan Guard Report

Generated at: 2026-06-30T04:15:00.000Z

## Current Status

- Status: LOCAL_DEMO_READY_WITH_NOTES
- Summary: The local-demo daily plan guard derives allowed and blocked child learning session evidence from parent grants, screen-time rules, and session gate fixtures.
- Endpoint: /v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report
- Dashboard evidence: /admin/learning-local-demo#parent-screen-time-grant-daily-plan-guard
- JSON export: exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.json
- Markdown export: exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.md

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
- realLearningPathMutationUsed=false
- realDailyPlanMutationUsed=false
- realParentGuardianMutationUsed=false
- realScreenTimePolicyMutationUsed=false
- realLearningSessionGateMutationUsed=false
- realScreenTimeGrantMutationUsed=false
- realDailyPlanAccessMutationUsed=false
- realLearningMutationUsed=false
- realParentMessageMutationUsed=false
- realTeacherInterventionMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Acceptance Counts

- Students: 4
- Parent guardians: 4
- Courses: 2
- Daily plan access cases: 10
- Parent grant rules: 2
- Screen-time rules: 4
- Allowed sessions: 6
- Blocked sessions: 4
- Blocked reasons: 4
- Safe next-action labels: 10
- Blocked/limited cases with safe next action: 5
- Session guard traces: 10
- Stable trace cases: 10
- Blocked cases with reason and next action: 4
- Learning session evidence rows: 10
- Allowed learning session evidence: 6
- Blocked learning session evidence: 4
- Production-ready claims: 0
- Safety gates closed: 39/39
- Open safety gates: 0

## Remaining Local-Demo Notes

- Parent grant rules and screen-time policies are fixture rows only; no parent-control mutation is executed.
- Allowed and blocked learning session evidence is generated from deterministic local session gate fixtures.
- Production parent controls, notification delivery, daily plan access writes, provider calls, and real learner mutations remain out of scope.

## Evidence Rows

| Evidence | Count | Fixture IDs | Summary |
| --- | ---: | --- | --- |
| PARENT_CHILD_COURSE_PLAN_TRACE | 10 | guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-01->screen-policy-ava-a1->no-parent-grant-gate-ava-a1-day-01->gate-ava-a1-day-01->ALLOWED_SESSION->learning-session-evidence-gate-ava-a1-day-01, guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-02->screen-policy-ava-a1->no-parent-grant-gate-ava-a1-day-02->gate-ava-a1-day-02->ALLOWED_SESSION->learning-session-evidence-gate-ava-a1-day-02, guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-03->screen-policy-ava-a1->grant-ava-day-03-extra-time-approved->gate-ava-a1-day-03->ALLOWED_SESSION->learning-session-evidence-gate-ava-a1-day-03, guardian-khoa-parent->child-khoa-demo->student-khoa->course-a1-starter->plan-khoa-a1-day-01->screen-policy-khoa-withdrawn->no-parent-grant-gate-khoa-a1-day-01->gate-khoa-a1-day-01->BLOCKED_SESSION->learning-session-evidence-gate-khoa-a1-day-01, guardian-khoa-parent->child-khoa-demo->student-khoa->course-a1-starter->plan-khoa-a1-day-02->screen-policy-khoa-withdrawn->no-parent-grant-gate-khoa-a1-day-02->gate-khoa-a1-day-02->BLOCKED_SESSION->learning-session-evidence-gate-khoa-a1-day-02, guardian-minh-parent->child-minh-demo->student-minh->course-a1-starter->plan-minh-a1-day-01->screen-policy-minh-a1->no-parent-grant-gate-minh-a1-day-01->gate-minh-a1-day-01->ALLOWED_SESSION->learning-session-evidence-gate-minh-a1-day-01, guardian-minh-parent->child-minh-demo->student-minh->course-a1-starter->plan-minh-a1-day-02->screen-policy-minh-a1->no-parent-grant-gate-minh-a1-day-02->gate-minh-a1-day-02->BLOCKED_SESSION->learning-session-evidence-gate-minh-a1-day-02, guardian-minh-parent->child-minh-demo->student-minh->course-a1-starter->plan-minh-a1-day-03->screen-policy-minh-a1->grant-minh-day-03-extra-time-denied->gate-minh-a1-day-03->BLOCKED_SESSION->learning-session-evidence-gate-minh-a1-day-03, guardian-linh-parent->child-linh-demo->student-linh->course-phonics-booster->plan-linh-phonics-day-01->screen-policy-linh-phonics->no-parent-grant-gate-linh-phonics-day-01->gate-linh-phonics-day-01->ALLOWED_SESSION->learning-session-evidence-gate-linh-phonics-day-01, guardian-linh-parent->child-linh-demo->student-linh->course-phonics-booster->plan-linh-phonics-day-02->screen-policy-linh-phonics->no-parent-grant-gate-linh-phonics-day-02->gate-linh-phonics-day-02->ALLOWED_SESSION->learning-session-evidence-gate-linh-phonics-day-02 | Trace keys connect parent -> child -> course/daily plan -> screen-time/grant rule -> access result -> learning session evidence. |
| PARENT_GRANT_RULE | 2 | guardian-ava-parent->child-ava-demo->plan-ava-a1-day-03->grant-ava-day-03-extra-time-approved->gate-ava-a1-day-03->APPROVED, guardian-minh-parent->child-minh-demo->plan-minh-a1-day-03->grant-minh-day-03-extra-time-denied->gate-minh-a1-day-03->DENIED | Fixture parent grant rules include approved and denied decisions linked to daily plan guard cases. |
| SCREEN_TIME_RULE | 4 | screen-policy-ava-a1, screen-policy-minh-a1, screen-policy-linh-phonics, screen-policy-khoa-withdrawn | Screen-time rules are deterministic fixture policies with no live parent-control writes. |
| ALLOWED_LEARNING_SESSION | 6 | learning-session-evidence-gate-ava-a1-day-01, learning-session-evidence-gate-ava-a1-day-02, learning-session-evidence-gate-ava-a1-day-03, learning-session-evidence-gate-minh-a1-day-01, learning-session-evidence-gate-linh-phonics-day-01, learning-session-evidence-gate-linh-phonics-day-02 | Allowed rows record read-only learning session evidence, including parent-grant override access. |
| BLOCKED_LEARNING_SESSION | 4 | learning-session-evidence-gate-khoa-a1-day-01, learning-session-evidence-gate-khoa-a1-day-02, learning-session-evidence-gate-minh-a1-day-02, learning-session-evidence-gate-minh-a1-day-03 | Blocked rows include clear reasons and safe next-action labels without mutating daily plan access. |
| SAFETY_GATE | 39 | productionReady=false, fixtureOnly=true, productionDbUsed=false, noProductionDbRead=true, providerApiUsed=false, aiProviderUsed=false, aiProviderExecutionUsed=false, paymentProviderUsed=false, notificationProviderUsed=false, liveAdsExecuted=false, realStudentMutationUsed=false, realParentMutationUsed=false, realCourseMutationUsed=false, realEnrollmentMutationUsed=false, realSubscriptionMutationUsed=false, realClassMutationUsed=false, realSessionMutationUsed=false, realAttendanceMutationUsed=false, realProgressMutationUsed=false, realLessonMutationUsed=false, realAssignmentMutationUsed=false, realAssessmentMutationUsed=false, realLearningPathMutationUsed=false, realDailyPlanMutationUsed=false, realVideoEvidenceMutationUsed=false, realPracticeMutationUsed=false, realParentGuardianMutationUsed=false, realScreenTimePolicyMutationUsed=false, realLearningSessionGateMutationUsed=false, realScreenTimeGrantMutationUsed=false, realDailyPlanAccessMutationUsed=false, realLearningMutationUsed=false, realParentMessageMutationUsed=false, realTeacherInterventionMutationUsed=false, realPaymentMutationUsed=false, realRefundMutationUsed=false, realCommissionMutationUsed=false, realErpMutationUsed=false, secretsRequired=false | All production, provider, payment, notification, AI, learning mutation, and ERP mutation gates remain closed. |

## Daily Plan Guard Rows

| Child | Guardian | Daily plan | Rule | Grant | Result | Reason | Next action | Trace |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ava Nguyen (child-ava-demo) | Ava Parent (MOTHER) | MH-A1-STARTER / Watch greetings video and complete quick check | ACTIVE 0+18/45 | NONE | ALLOWED / ALLOWED_SESSION | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-01->screen-policy-ava-a1->no-parent-grant-gate-ava-a1-day-01->gate-ava-a1-day-01->ALLOWED_SESSION->learning-session-evidence-gate-ava-a1-day-01 |
| Ava Nguyen (child-ava-demo) | Ava Parent (MOTHER) | MH-A1-STARTER / Watch colors video and retry objects practice | ACTIVE 18+20/45 | NONE | ALLOWED / ALLOWED_SESSION | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-02->screen-policy-ava-a1->no-parent-grant-gate-ava-a1-day-02->gate-ava-a1-day-02->ALLOWED_SESSION->learning-session-evidence-gate-ava-a1-day-02 |
| Ava Nguyen (child-ava-demo) | Ava Parent (MOTHER) | MH-A1-STARTER / Preview family words video before live class | ACTIVE 38+15/60 | grant-ava-day-03-extra-time-approved APPROVED | OVERRIDE_ALLOWED / ALLOWED_SESSION | NONE | Allow fixture session through approved parent grant and keep the next session inside the daily plan window | guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-03->screen-policy-ava-a1->grant-ava-day-03-extra-time-approved->gate-ava-a1-day-03->ALLOWED_SESSION->learning-session-evidence-gate-ava-a1-day-03 |
| Khoa Le (child-khoa-demo) | Khoa Parent (GUARDIAN) | MH-A1-STARTER / Complete first A1 video before cancellation | DISABLED 0+15/20 | NONE | BLOCKED / BLOCKED_SESSION | POLICY_DISABLED_WITHDRAWN: Screen-time policy is disabled because the fixture enrollment is withdrawn. | Keep blocked because the fixture enrollment is withdrawn | guardian-khoa-parent->child-khoa-demo->student-khoa->course-a1-starter->plan-khoa-a1-day-01->screen-policy-khoa-withdrawn->no-parent-grant-gate-khoa-a1-day-01->gate-khoa-a1-day-01->BLOCKED_SESSION->learning-session-evidence-gate-khoa-a1-day-01 |
| Khoa Le (child-khoa-demo) | Khoa Parent (GUARDIAN) | MH-A1-STARTER / Skipped colors plan after synthetic withdrawal | DISABLED 0+12/20 | NONE | BLOCKED / BLOCKED_SESSION | POLICY_DISABLED_WITHDRAWN: Screen-time policy is disabled because the fixture enrollment is withdrawn. | Keep blocked because the fixture enrollment is withdrawn | guardian-khoa-parent->child-khoa-demo->student-khoa->course-a1-starter->plan-khoa-a1-day-02->screen-policy-khoa-withdrawn->no-parent-grant-gate-khoa-a1-day-02->gate-khoa-a1-day-02->BLOCKED_SESSION->learning-session-evidence-gate-khoa-a1-day-02 |
| Minh Tran (child-minh-demo) | Minh Parent (FATHER) | MH-A1-STARTER / Complete greetings catch-up after late attendance | ACTIVE 0+16/35 | NONE | ALLOWED / ALLOWED_SESSION | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-minh-parent->child-minh-demo->student-minh->course-a1-starter->plan-minh-a1-day-01->screen-policy-minh-a1->no-parent-grant-gate-minh-a1-day-01->gate-minh-a1-day-01->ALLOWED_SESSION->learning-session-evidence-gate-minh-a1-day-01 |
| Minh Tran (child-minh-demo) | Minh Parent (FATHER) | MH-A1-STARTER / Repeat colors video and practice with parent support | ACTIVE 16+22/35 | NONE | BLOCKED / BLOCKED_SESSION | DAILY_LIMIT_EXCEEDED: Daily screen-time limit would be exceeded by the requested fixture learning session. | Keep blocked until the next fixture learning window or a reviewed parent grant | guardian-minh-parent->child-minh-demo->student-minh->course-a1-starter->plan-minh-a1-day-02->screen-policy-minh-a1->no-parent-grant-gate-minh-a1-day-02->gate-minh-a1-day-02->BLOCKED_SESSION->learning-session-evidence-gate-minh-a1-day-02 |
| Minh Tran (child-minh-demo) | Minh Parent (FATHER) | MH-A1-STARTER / Skip family preview until payment follow-up clears | ACTIVE 16+18/35 | grant-minh-day-03-extra-time-denied DENIED | BLOCKED / BLOCKED_SESSION | GUARDIAN_DENIED_GRANT: Parent/guardian denied the fixture extra-time grant for this daily plan session. | Keep blocked and schedule teacher/guardian review before retrying the daily plan | guardian-minh-parent->child-minh-demo->student-minh->course-a1-starter->plan-minh-a1-day-03->screen-policy-minh-a1->grant-minh-day-03-extra-time-denied->gate-minh-a1-day-03->BLOCKED_SESSION->learning-session-evidence-gate-minh-a1-day-03 |
| Linh Pham (child-linh-demo) | Linh Parent (MOTHER) | MH-PHONICS-BOOSTER / Short A video evidence and decoding practice | ACTIVE 0+25/60 | NONE | ALLOWED / ALLOWED_SESSION | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-linh-parent->child-linh-demo->student-linh->course-phonics-booster->plan-linh-phonics-day-01->screen-policy-linh-phonics->no-parent-grant-gate-linh-phonics-day-01->gate-linh-phonics-day-01->ALLOWED_SESSION->learning-session-evidence-gate-linh-phonics-day-01 |
| Linh Pham (child-linh-demo) | Linh Parent (MOTHER) | MH-PHONICS-BOOSTER / Short E blending video and recording practice | ACTIVE 25+27/60 | NONE | ALLOWED / ALLOWED_SESSION | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-linh-parent->child-linh-demo->student-linh->course-phonics-booster->plan-linh-phonics-day-02->screen-policy-linh-phonics->no-parent-grant-gate-linh-phonics-day-02->gate-linh-phonics-day-02->ALLOWED_SESSION->learning-session-evidence-gate-linh-phonics-day-02 |

## Parent Grant Rule Rows

| Grant | Child | Daily plan | Requested | Decision | Granted | Allows access | Reason | Trace |
| --- | --- | --- | ---: | --- | ---: | --- | --- | --- |
| grant-ava-day-03-extra-time-approved | Ava Nguyen (child-ava-demo) | Preview family words video before live class | 15 | APPROVED | 15 | yes | Fixture parent approved a short family-word preview after class homework was complete. | guardian-ava-parent->child-ava-demo->plan-ava-a1-day-03->grant-ava-day-03-extra-time-approved->gate-ava-a1-day-03->APPROVED |
| grant-minh-day-03-extra-time-denied | Minh Tran (child-minh-demo) | Skip family preview until payment follow-up clears | 20 | DENIED | 0 | no | Fixture parent denied extra minutes until the blocked colors plan is reviewed with the teacher. | guardian-minh-parent->child-minh-demo->plan-minh-a1-day-03->grant-minh-day-03-extra-time-denied->gate-minh-a1-day-03->DENIED |

## Learning Session Evidence Rows

| Evidence | Child | Daily plan | Result | Started | Minutes | Reason | Next action | Trace |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| learning-session-evidence-gate-ava-a1-day-01 | Ava Nguyen (child-ava-demo) | Watch greetings video and complete quick check | ALLOWED / ALLOWED_SESSION | yes | 18 | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-01->screen-policy-ava-a1->no-parent-grant-gate-ava-a1-day-01->gate-ava-a1-day-01->ALLOWED_SESSION->learning-session-evidence-gate-ava-a1-day-01 |
| learning-session-evidence-gate-ava-a1-day-02 | Ava Nguyen (child-ava-demo) | Watch colors video and retry objects practice | ALLOWED / ALLOWED_SESSION | yes | 20 | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-02->screen-policy-ava-a1->no-parent-grant-gate-ava-a1-day-02->gate-ava-a1-day-02->ALLOWED_SESSION->learning-session-evidence-gate-ava-a1-day-02 |
| learning-session-evidence-gate-ava-a1-day-03 | Ava Nguyen (child-ava-demo) | Preview family words video before live class | OVERRIDE_ALLOWED / ALLOWED_SESSION | yes | 15 | NONE | Allow fixture session through approved parent grant and keep the next session inside the daily plan window | guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-03->screen-policy-ava-a1->grant-ava-day-03-extra-time-approved->gate-ava-a1-day-03->ALLOWED_SESSION->learning-session-evidence-gate-ava-a1-day-03 |
| learning-session-evidence-gate-khoa-a1-day-01 | Khoa Le (child-khoa-demo) | Complete first A1 video before cancellation | BLOCKED / BLOCKED_SESSION | no | 0 | Screen-time policy is disabled because the fixture enrollment is withdrawn. | Keep blocked because the fixture enrollment is withdrawn | guardian-khoa-parent->child-khoa-demo->student-khoa->course-a1-starter->plan-khoa-a1-day-01->screen-policy-khoa-withdrawn->no-parent-grant-gate-khoa-a1-day-01->gate-khoa-a1-day-01->BLOCKED_SESSION->learning-session-evidence-gate-khoa-a1-day-01 |
| learning-session-evidence-gate-khoa-a1-day-02 | Khoa Le (child-khoa-demo) | Skipped colors plan after synthetic withdrawal | BLOCKED / BLOCKED_SESSION | no | 0 | Screen-time policy is disabled because the fixture enrollment is withdrawn. | Keep blocked because the fixture enrollment is withdrawn | guardian-khoa-parent->child-khoa-demo->student-khoa->course-a1-starter->plan-khoa-a1-day-02->screen-policy-khoa-withdrawn->no-parent-grant-gate-khoa-a1-day-02->gate-khoa-a1-day-02->BLOCKED_SESSION->learning-session-evidence-gate-khoa-a1-day-02 |
| learning-session-evidence-gate-minh-a1-day-01 | Minh Tran (child-minh-demo) | Complete greetings catch-up after late attendance | ALLOWED / ALLOWED_SESSION | yes | 16 | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-minh-parent->child-minh-demo->student-minh->course-a1-starter->plan-minh-a1-day-01->screen-policy-minh-a1->no-parent-grant-gate-minh-a1-day-01->gate-minh-a1-day-01->ALLOWED_SESSION->learning-session-evidence-gate-minh-a1-day-01 |
| learning-session-evidence-gate-minh-a1-day-02 | Minh Tran (child-minh-demo) | Repeat colors video and practice with parent support | BLOCKED / BLOCKED_SESSION | no | 0 | Daily screen-time limit would be exceeded by the requested fixture learning session. | Keep blocked until the next fixture learning window or a reviewed parent grant | guardian-minh-parent->child-minh-demo->student-minh->course-a1-starter->plan-minh-a1-day-02->screen-policy-minh-a1->no-parent-grant-gate-minh-a1-day-02->gate-minh-a1-day-02->BLOCKED_SESSION->learning-session-evidence-gate-minh-a1-day-02 |
| learning-session-evidence-gate-minh-a1-day-03 | Minh Tran (child-minh-demo) | Skip family preview until payment follow-up clears | BLOCKED / BLOCKED_SESSION | no | 0 | Parent/guardian denied the fixture extra-time grant for this daily plan session. | Keep blocked and schedule teacher/guardian review before retrying the daily plan | guardian-minh-parent->child-minh-demo->student-minh->course-a1-starter->plan-minh-a1-day-03->screen-policy-minh-a1->grant-minh-day-03-extra-time-denied->gate-minh-a1-day-03->BLOCKED_SESSION->learning-session-evidence-gate-minh-a1-day-03 |
| learning-session-evidence-gate-linh-phonics-day-01 | Linh Pham (child-linh-demo) | Short A video evidence and decoding practice | ALLOWED / ALLOWED_SESSION | yes | 25 | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-linh-parent->child-linh-demo->student-linh->course-phonics-booster->plan-linh-phonics-day-01->screen-policy-linh-phonics->no-parent-grant-gate-linh-phonics-day-01->gate-linh-phonics-day-01->ALLOWED_SESSION->learning-session-evidence-gate-linh-phonics-day-01 |
| learning-session-evidence-gate-linh-phonics-day-02 | Linh Pham (child-linh-demo) | Short E blending video and recording practice | ALLOWED / ALLOWED_SESSION | yes | 27 | NONE | Allow fixture session and continue read-only daily plan evidence | guardian-linh-parent->child-linh-demo->student-linh->course-phonics-booster->plan-linh-phonics-day-02->screen-policy-linh-phonics->no-parent-grant-gate-linh-phonics-day-02->gate-linh-phonics-day-02->ALLOWED_SESSION->learning-session-evidence-gate-linh-phonics-day-02 |
