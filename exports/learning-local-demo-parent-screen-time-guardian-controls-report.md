# Learning local demo Parent/Guardian Screen Time -> Session Gate -> Grant -> Controls Report

Generated at: 2026-06-30T04:00:00.000Z

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
- realParentGuardianMutationUsed=false
- realScreenTimePolicyMutationUsed=false
- realLearningSessionGateMutationUsed=false
- realScreenTimeGrantMutationUsed=false
- realDailyPlanAccessMutationUsed=false
- realParentMessageMutationUsed=false
- realTeacherInterventionMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Parents/guardians: 4
- Children: 4
- Active screen-time policies: 3
- Allowed minutes: 155
- Used minutes: 121
- Remaining minutes: 34
- Grant requests: 2
- Grant decisions: 2
- Approved grants: 1
- Denied grants: 1
- Allowed sessions: 5
- Blocked sessions: 4
- Override sessions: 1
- Children needing parent attention: 2

## Child Controls Rows

| Child | Guardian | Courses | Policy | Minutes used | Grants | Sessions | Attention |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Ava Nguyen (child-ava-demo) | Ava Parent (MOTHER) | MH-A1-STARTER | ACTIVE 45+15 | 53/60 remaining 7 | 1/1 | allowed 2, blocked 0, override 1 | No |
| Khoa Le (child-khoa-demo) | Khoa Parent (GUARDIAN) | MH-A1-STARTER | DISABLED 0+0 | 0/0 remaining 0 | 0/0 | allowed 0, blocked 2, override 0 | 2 blocked session gate rows need parent review. |
| Linh Pham (child-linh-demo) | Linh Parent (MOTHER) | MH-PHONICS-BOOSTER | ACTIVE 60+0 | 52/60 remaining 8 | 0/0 | allowed 2, blocked 0, override 0 | No |
| Minh Tran (child-minh-demo) | Minh Parent (FATHER) | MH-A1-STARTER | ACTIVE 35+0 | 16/35 remaining 19 | 1/1 | allowed 1, blocked 2, override 0 | 1 denied grant and 2 blocked session gate rows need parent review. |

## Learning Session Gate Rows

| Child | Daily plan | Course | Teacher | Decision | Requested | Used before | Blocked reason | Access |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |
| Ava Nguyen (child-ava-demo) | Watch greetings video and complete quick check | MH-A1-STARTER | Teacher Mai | ALLOWED | 18 | 0 | NONE | safe daily plan access |
| Ava Nguyen (child-ava-demo) | Watch colors video and retry objects practice | MH-A1-STARTER | Teacher Mai | ALLOWED | 20 | 18 | NONE | safe daily plan access |
| Ava Nguyen (child-ava-demo) | Preview family words video before live class | MH-A1-STARTER | Teacher Mai | OVERRIDE_ALLOWED | 15 | 38 | NONE | safe daily plan access |
| Khoa Le (child-khoa-demo) | Complete first A1 video before cancellation | MH-A1-STARTER | Teacher Mai | BLOCKED | 15 | 0 | POLICY_DISABLED_WITHDRAWN | blocked |
| Khoa Le (child-khoa-demo) | Skipped colors plan after synthetic withdrawal | MH-A1-STARTER | Teacher Mai | BLOCKED | 12 | 0 | POLICY_DISABLED_WITHDRAWN | blocked |
| Linh Pham (child-linh-demo) | Short A video evidence and decoding practice | MH-PHONICS-BOOSTER | Teacher Hanh | ALLOWED | 25 | 0 | NONE | safe daily plan access |
| Linh Pham (child-linh-demo) | Short E blending video and recording practice | MH-PHONICS-BOOSTER | Teacher Hanh | ALLOWED | 27 | 25 | NONE | safe daily plan access |
| Minh Tran (child-minh-demo) | Complete greetings catch-up after late attendance | MH-A1-STARTER | Teacher Mai | ALLOWED | 16 | 0 | NONE | safe daily plan access |
| Minh Tran (child-minh-demo) | Repeat colors video and practice with parent support | MH-A1-STARTER | Teacher Mai | BLOCKED | 22 | 16 | DAILY_LIMIT_EXCEEDED | blocked |
| Minh Tran (child-minh-demo) | Skip family preview until payment follow-up clears | MH-A1-STARTER | Teacher Mai | BLOCKED | 18 | 16 | GUARDIAN_DENIED_GRANT | blocked |

## Parent Grant Rows

| Child | Guardian | Requested extra | Decision | Granted | Reason |
| --- | --- | ---: | --- | ---: | --- |
| Ava Nguyen (child-ava-demo) | Ava Parent | 15 | APPROVED | 15 | Fixture parent approved a short family-word preview after class homework was complete. |
| Minh Tran (child-minh-demo) | Minh Parent | 20 | DENIED | 0 | Fixture parent denied extra minutes until the blocked colors plan is reviewed with the teacher. |
