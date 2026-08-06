# Learning local demo AI Tutor Chat -> Safety Guard -> Teacher Review -> Parent Summary -> Learning Support Report

Generated at: 2026-06-30T06:00:00.000Z

## Safety

- Fixture-only local demo data.
- productionDbUsed=false
- noProductionDbRead=true
- providerApiUsed=false
- aiProviderUsed=false
- aiProviderExecutionUsed=false
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
- realParentMessageMutationUsed=false
- realTeacherInterventionMutationUsed=false
- realLearningSupportMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Chat sessions: 4
- Messages: 12
- Allowed messages: 8
- Blocked messages: 4
- Safety flags: 4
- Blocked topics: 4
- Teacher review items: 4
- Reviewed teacher review items: 2
- Parent summaries: 3
- Students needing support: 3
- Topic categories: 8
- Support recommendations: 4

## Chat Session Rows

| Session | Student | Course | Class | Daily plan | Lesson | Status | Messages | Blocked | Safety flags | Review | Support | Parent summary |
| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| ai-chat-ava-colors-privacy | Ava Nguyen (child-ava-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Watch colors video and retry objects practice | A1-L02 | ESCALATED | 3 | 1 | 1 | 1 | 1 | READY |
| ai-chat-khoa-withdrawn-access | Khoa Le (child-khoa-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Complete first A1 video before cancellation | A1-L01 | ESCALATED | 3 | 2 | 2 | 2 | 2 | NOT_READY |
| ai-chat-linh-phonics-short-e | Linh Pham (child-linh-demo) | MH-PHONICS-BOOSTER | MH-PHONICS-MAY | Short E blending video and recording practice | PH-L02 | CLOSED | 3 | 0 | 0 | 0 | 0 | READY |
| ai-chat-minh-colors-off-topic | Minh Tran (child-minh-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Repeat colors video and practice with parent support | A1-L02 | ESCALATED | 3 | 1 | 1 | 1 | 1 | READY |

## Message Rows

| Student | Seq | Role | Topic | Guard | Blocked | Preview |
| --- | ---: | --- | --- | --- | --- | --- |
| Ava Nguyen (child-ava-demo) | 1 | STUDENT | LESSON_HELP | ALLOWED | NO | Can you help me spell red, blue, and yellow? |
| Ava Nguyen (child-ava-demo) | 2 | AI_TUTOR | LESSON_HELP | ALLOWED | NO | Synthetic tutor hint: say each color, then match it to a classroom object. |
| Ava Nguyen (child-ava-demo) | 3 | STUDENT | PERSONAL_DATA | BLOCKED | YES | Student asks whether to type a home address into the chat. |
| Khoa Le (child-khoa-demo) | 1 | STUDENT | ACCOUNT_ACCESS | BLOCKED | YES | Withdrawn learner asks how to bypass account access after cancellation. |
| Khoa Le (child-khoa-demo) | 2 | AI_TUTOR | SAFETY_REDIRECT | ALLOWED | NO | Synthetic tutor redirects the learner to a parent or teacher for access questions. |
| Khoa Le (child-khoa-demo) | 3 | STUDENT | ACADEMIC_INTEGRITY | BLOCKED | YES | Student asks for direct quiz answers instead of a learning hint. |
| Linh Pham (child-linh-demo) | 1 | STUDENT | PRACTICE_HINT | ALLOWED | NO | Can I practice short E words before recording? |
| Linh Pham (child-linh-demo) | 2 | AI_TUTOR | PRACTICE_HINT | ALLOWED | NO | Synthetic tutor hint: read bed, pen, and ten, then record one sentence. |
| Linh Pham (child-linh-demo) | 3 | STUDENT | STUDY_PLANNING | ALLOWED | NO | Add short E review to my next practice plan. |
| Minh Tran (child-minh-demo) | 1 | STUDENT | PRACTICE_HINT | ALLOWED | NO | I missed the color object worksheet. Give me one hint. |
| Minh Tran (child-minh-demo) | 2 | AI_TUTOR | PRACTICE_HINT | ALLOWED | NO | Synthetic tutor hint: name the object first, then choose the color adjective. |
| Minh Tran (child-minh-demo) | 3 | STUDENT | OFF_TOPIC_GAMING | BLOCKED | YES | Student asks the tutor for game cheat codes instead of lesson help. |

## Safety Flag Rows

| Student | Topic | Severity | Guard | Blocked | Reason |
| --- | --- | --- | --- | --- | --- |
| Ava Nguyen (child-ava-demo) | PERSONAL_DATA | MEDIUM | BLOCKED | YES | Fixture safety guard blocked personal address sharing in a child chat. |
| Khoa Le (child-khoa-demo) | ACCOUNT_ACCESS | HIGH | BLOCKED | YES | Fixture safety guard blocked account bypass guidance for a withdrawn learner. |
| Khoa Le (child-khoa-demo) | ACADEMIC_INTEGRITY | MEDIUM | BLOCKED | YES | Fixture safety guard blocked direct answer-seeking and required hint-only support. |
| Minh Tran (child-minh-demo) | OFF_TOPIC_GAMING | LOW | BLOCKED | YES | Fixture topic guard blocked off-topic gaming content and kept the chat on lesson practice. |

## Teacher Review Queue

| Student | Class | Lesson | Topic | Severity | Status | Teacher | Parent summary | Support | Action |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| Khoa Le (child-khoa-demo) | MH-A1-JUN-WEEKDAY | A1-L01 | ACCOUNT_ACCESS | HIGH | OPEN | Teacher Mai | NOT_READY | 1 | Teacher should confirm withdrawn access remains blocked and parent support is offline. |
| Minh Tran (child-minh-demo) | MH-A1-JUN-WEEKDAY | A1-L02 | OFF_TOPIC_GAMING | LOW | OPEN | Teacher Mai | READY | 1 | Teacher should redirect Minh to the blocked colors daily plan and worksheet. |
| Khoa Le (child-khoa-demo) | MH-A1-JUN-WEEKDAY | A1-L01 | ACADEMIC_INTEGRITY | MEDIUM | RESOLVED | Teacher Mai | NOT_READY | 1 | Teacher marks the answer request resolved with hint-only support guidance. |
| Ava Nguyen (child-ava-demo) | MH-A1-JUN-WEEKDAY | A1-L02 | PERSONAL_DATA | MEDIUM | REVIEWED | Teacher Mai | READY | 1 | Teacher confirms privacy reminder and keeps the colors practice visible. |

## Parent Summary Rows

| Parent | Student | Course | Class | Created at | Summary |
| --- | --- | --- | --- | --- | --- |
| Ava Parent | Ava Nguyen (child-ava-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | 2026-06-03T15:05:00.000Z | Ava received colors practice help. A synthetic privacy guard blocked address sharing and Teacher Mai reviewed the reminder. |
| Linh Parent | Linh Pham (child-linh-demo) | MH-PHONICS-BOOSTER | MH-PHONICS-MAY | 2026-05-22T15:20:00.000Z | Linh practiced short E sounds with allowed hint-only tutor support and no safety flag. |
| Minh Parent | Minh Tran (child-minh-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | 2026-06-03T16:35:00.000Z | Minh received one colors worksheet hint. A synthetic topic guard blocked off-topic gaming and queued teacher review. |

## Learning Support Recommendation Rows

| Student | Course | Class | Daily plan | Priority | Status | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| Khoa Le (child-khoa-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Complete first A1 video before cancellation | HIGH | MONITORING | Keep withdrawn access blocked and route any access question to offline parent support. |
| Minh Tran (child-minh-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Repeat colors video and practice with parent support | HIGH | RECOMMENDED | Teacher should reopen colors object practice with a short focus prompt before chat access. |
| Ava Nguyen (child-ava-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Watch colors video and retry objects practice | MEDIUM | COMPLETED | Add a short privacy reminder before the next AI tutor chat and continue colors practice. |
| Khoa Le (child-khoa-demo) | MH-A1-STARTER | MH-A1-JUN-WEEKDAY | Complete first A1 video before cancellation | MEDIUM | COMPLETED | Use hint-only language for any future review and do not expose quiz answers. |
