# Learning local demo Parent/Teacher Report Review Queue Message Preview Report

Generated at: 2026-06-30T13:45:00.000Z

## Current Status

- Status: LOCAL_DEMO_READY_WITH_NOTES
- Summary: Parent-facing report preview review queue is fixture-only, read-only, and references permission/redaction evidence before approval.
- Endpoint: /v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report
- Dashboard evidence: /admin/learning-local-demo#parent-teacher-report-review-queue-message-preview
- JSON export: exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.json
- Markdown export: exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.md

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
- Report summaries: 1
- Permission/redaction references: 2
- Review queue items: 2
- Message previews: 2
- Approved previews: 1
- Held previews: 1
- Redaction-aware previews: 2
- Review decision traces: 2
- Cases with stable relationship trace: 2
- Held/needs-edit with reason: 1
- Approved with permission/redaction evidence: 1
- Production-ready claims: 0
- Safety gates closed: 19/19
- Open safety gates: 0

## Remaining Local-Demo Notes

- Review queue and preview rows are deterministic local-demo evidence, not persisted workflow state.
- Approved previews require an allowed permission case and referenced redaction evidence before any parent-facing text is marked approved.
- Held previews carry explicit reasons and do not call notification, AI, production DB, or parent-message delivery paths.

## Evidence Rows

| Evidence | Count | Fixture IDs | Summary |
| --- | ---: | --- | --- |
| REPORT_SUMMARY_SOURCE | 1 | student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->report-summary-parent-facing-preview | Parent-facing preview rows are generated from the existing Ava progress access report summary. |
| PERMISSION_REDACTION_REFERENCE | 2 | student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->report-summary-parent-facing-preview->permission-case-parent-ava-own-child->ALLOWED->permission-redaction-reference, student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->report-summary-parent-facing-preview->permission-case-parent-minh-non-owning-ava->DENIED->permission-redaction-reference | Each preview decision references an allowed or denied permission case plus redacted or denied field evidence. |
| REVIEW_QUEUE_DECISION | 2 | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->permission-redaction-reference-permission-case-parent-ava-own-child->review-queue-ava-a1-parent-progress-preview-approve, student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->permission-redaction-reference-permission-case-parent-minh-non-owning-ava->review-queue-ava-a1-non-owner-preview-held | Teacher/admin queue items link student, course, report summary, permission evidence, and review decision. |
| APPROVED_PARENT_PREVIEW | 1 | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->permission-redaction-reference-permission-case-parent-ava-own-child->review-queue-ava-a1-parent-progress-preview-approve->preview-decision-ava-a1-parent-progress-approved->message-preview-ava-a1-parent-progress-approved | Approved parent-facing preview remains fixture-only and references redaction evidence before approval. |
| HELD_PARENT_PREVIEW | 1 | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->permission-redaction-reference-permission-case-parent-minh-non-owning-ava->review-queue-ava-a1-non-owner-preview-held->preview-decision-ava-a1-non-owner-held->message-preview-ava-a1-non-owner-held | Held preview has an explicit reason and no parent notification or message delivery. |
| SAFETY_GATE | 19 | productionReady=false, fixtureOnly=true, productionDbUsed=false, noProductionDbRead=true, providerApiUsed=false, paymentProviderUsed=false, aiProviderExecutionUsed=false, notificationProviderUsed=false, liveAdsExecuted=false, realStudentMutationUsed=false, realCourseMutationUsed=false, realEnrollmentMutationUsed=false, realSubscriptionMutationUsed=false, realPaymentMutationUsed=false, realRefundMutationUsed=false, realCommissionMutationUsed=false, realLearningMutationUsed=false, realErpMutationUsed=false, secretsRequired=false | All production DB, provider, payment, notification, learning mutation, and ERP mutation gates remain closed. |

## Report Summary Rows

| Summary | Student | Course | Parent | Source progress | Trace |
| --- | --- | --- | --- | --- | --- |
| report-summary-preview-progress-access-enroll-ava-a1-active | Ava Nguyen (child-ava-demo) | MH-A1-STARTER / MH-A1-JUN-WEEKDAY | Ava Parent | progress-access-enroll-ava-a1-active | student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->report-summary-parent-facing-preview |

## Permission Redaction References

| Reference | Permission case | Decision | Fields | Reason | Trace |
| --- | --- | --- | --- | --- | --- |
| permission-redaction-reference-permission-case-parent-ava-own-child | permission-case-parent-ava-own-child | ALLOWED / OWN_CHILD | 4 visible / 1 redacted / 0 denied | Fixture guardian is linked to child-ava-demo; parent-facing fields are visible while teacher-internal fields stay redacted. | student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->report-summary-parent-facing-preview->permission-case-parent-ava-own-child->ALLOWED->permission-redaction-reference |
| permission-redaction-reference-permission-case-parent-minh-non-owning-ava | permission-case-parent-minh-non-owning-ava | DENIED / NON_OWNING_CHILD | 0 visible / 0 redacted / 3 denied | Fixture guardian guardian-minh-parent is not linked to child-ava-demo, so Ava report fields are denied. | student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->report-summary-parent-facing-preview->permission-case-parent-minh-non-owning-ava->DENIED->permission-redaction-reference |

## Review Queue Rows

| Queue item | Student | Parent | Reviewer | Decision | Reason | Trace |
| --- | --- | --- | --- | --- | --- | --- |
| review-queue-ava-a1-parent-progress-preview-approve | Ava Nguyen (child-ava-demo) | Ava Parent | Teacher Mai (TEACHER) | APPROVED | Teacher review approved the parent-facing preview because the owning-parent permission case is allowed and teacher-internal notes are redacted. | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->permission-redaction-reference-permission-case-parent-ava-own-child->review-queue-ava-a1-parent-progress-preview-approve |
| review-queue-ava-a1-non-owner-preview-held | Ava Nguyen (child-ava-demo) | Minh Parent | Admin Hoa (ADMIN) | HELD_NEEDS_EDIT | Admin review held the preview because the requested guardian is not linked to child-ava-demo and all parent-facing fields are denied. | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->permission-redaction-reference-permission-case-parent-minh-non-owning-ava->review-queue-ava-a1-non-owner-preview-held |

## Message Preview Rows

| Preview | Student | Parent | Decision | Permission | Evidence | Reason | Message preview | Trace |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| message-preview-ava-a1-parent-progress-approved | Ava Nguyen (child-ava-demo) | Ava Parent | APPROVED | ALLOWED | permission=YES redaction=YES | Teacher review approved the parent-facing preview because the owning-parent permission case is allowed and teacher-internal notes are redacted. | Ava is on track in A1 English with 86% completion. Teacher-only notes remain redacted in this local-demo preview. | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->permission-redaction-reference-permission-case-parent-ava-own-child->review-queue-ava-a1-parent-progress-preview-approve->preview-decision-ava-a1-parent-progress-approved->message-preview-ava-a1-parent-progress-approved |
| message-preview-ava-a1-non-owner-held | Ava Nguyen (child-ava-demo) | Minh Parent | HELD_NEEDS_EDIT | DENIED | permission=YES redaction=YES | Admin review held the preview because the requested guardian is not linked to child-ava-demo and all parent-facing fields are denied. | HELD_LOCAL_DEMO: no parent-facing message is sent or shown until the guardian-child relationship is corrected in fixture evidence. | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->permission-redaction-reference-permission-case-parent-minh-non-owning-ava->review-queue-ava-a1-non-owner-preview-held->preview-decision-ava-a1-non-owner-held->message-preview-ava-a1-non-owner-held |
