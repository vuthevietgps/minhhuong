# Learning local demo Parent Portal Approved Report Inbox Read Receipt Report

Generated at: 2026-06-30T14:00:00.000Z

## Current Status

- Status: LOCAL_DEMO_READY_WITH_NOTES
- Summary: Parent portal inbox/read receipt evidence is fixture-only and only exposes approved parent-facing previews.
- Endpoint: /v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report
- Dashboard evidence: /admin/learning-local-demo#parent-portal-approved-report-inbox-read-receipt
- JSON export: exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json
- Markdown export: exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.md

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
- Approved previews: 2
- Held previews: 1
- Parent inbox items: 3
- Visible parent inbox items: 2
- Hidden held previews: 1
- Read/ack evidence: 2
- Permission/redaction references: 3
- Parent inbox traces: 3
- Visible inbox items with stable relationship trace: 2
- Hidden/held previews with reason: 1
- Visible previews with permission/redaction evidence: 2
- Aligned approved Minh/course A1 inbox entries: 1
- Aligned Minh/course A1 read receipts: 1
- Stable aligned read receipt traces: 1
- Production-ready claims: 0
- Safety gates closed: 19/19
- Open safety gates: 0

## Remaining Local-Demo Notes

- Parent portal inbox/read receipt rows are deterministic local-demo evidence, not persisted parent portal state.
- Only approved previews produce parent-visible subject and body fields; held previews stay hidden and carry explicit internal reasons.
- Read/ack evidence is fixture-only and does not call notification providers, production DB, auth/privacy policy, or parent-message delivery paths.

## Evidence Rows

| Evidence | Count | Fixture IDs | Summary |
| --- | ---: | --- | --- |
| VISIBLE_PARENT_INBOX_ITEM | 2 | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->review-queue-ava-a1-parent-progress-preview-approve->message-preview-ava-a1-parent-progress-approved->parent-inbox-item-message-preview-ava-a1-parent-progress-approved, student-minh->course-a1-starter->report-summary-preview-progress-access-enroll-minh-a1-pending->review-queue-minh-a1-parent-progress-preview-approve->message-preview-minh-a1-parent-progress-approved->parent-inbox-item-message-preview-minh-a1-parent-progress-approved | Approved previews become visible parent inbox rows with parent-facing subject and body fields. |
| HIDDEN_HELD_PREVIEW | 1 | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->review-queue-ava-a1-non-owner-preview-held->message-preview-ava-a1-non-owner-held->parent-inbox-hidden-held-message-preview-ava-a1-non-owner-held | Held previews remain hidden from the parent inbox surface and carry an explicit internal reason. |
| READ_ACK_RECEIPT | 2 | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->review-queue-ava-a1-parent-progress-preview-approve->message-preview-ava-a1-parent-progress-approved->parent-inbox-item-message-preview-ava-a1-parent-progress-approved->read-ack-parent-inbox-item-message-preview-ava-a1-parent-progress-approved, student-minh->course-a1-starter->report-summary-preview-progress-access-enroll-minh-a1-pending->review-queue-minh-a1-parent-progress-preview-approve->message-preview-minh-a1-parent-progress-approved->parent-inbox-item-message-preview-minh-a1-parent-progress-approved->read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved | Fixture read/ack evidence links the visible inbox item back to the approved preview. |
| ALIGNED_APPROVED_DELIVERY_READ_RECEIPT | 1 | student-minh->course-a1-starter->report-summary-preview-progress-access-enroll-minh-a1-pending->review-queue-minh-a1-parent-progress-preview-approve->message-preview-minh-a1-parent-progress-approved->parent-inbox-item-message-preview-minh-a1-parent-progress-approved->read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved | Aligned Minh/course A1 approved inbox and read/ack evidence is available for the MVP readiness trace without notification delivery. |
| PERMISSION_REDACTION_REFERENCE | 3 | student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->report-summary-parent-facing-preview->permission-case-parent-ava-own-child->ALLOWED->permission-redaction-reference, student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->report-summary-parent-facing-preview->permission-case-parent-minh-non-owning-ava->DENIED->permission-redaction-reference, permission-redaction-reference-permission-case-parent-minh-own-child-aligned | Visible and hidden inbox evidence carries forward permission and redaction references from the review preview. |
| SAFETY_GATE | 19 | productionReady=false, fixtureOnly=true, productionDbUsed=false, noProductionDbRead=true, providerApiUsed=false, paymentProviderUsed=false, aiProviderExecutionUsed=false, notificationProviderUsed=false, liveAdsExecuted=false, realStudentMutationUsed=false, realCourseMutationUsed=false, realEnrollmentMutationUsed=false, realSubscriptionMutationUsed=false, realPaymentMutationUsed=false, realRefundMutationUsed=false, realCommissionMutationUsed=false, realLearningMutationUsed=false, realErpMutationUsed=false, secretsRequired=false | Production DB, provider, payment, notification, AI execution, learning mutation, and ERP mutation gates remain closed. |

## Parent Inbox Rows

| Inbox item | Student | Parent | Visibility | Subject | Body | Hidden reason | Permission evidence | Trace |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| parent-inbox-item-message-preview-ava-a1-parent-progress-approved | Ava Nguyen (child-ava-demo) | Ava Parent | VISIBLE_TO_PARENT | Ava Nguyen MH-A1-STARTER progress update | Ava is on track in A1 English with 86% completion. Teacher-only notes remain redacted in this local-demo preview. | NONE | permission=YES redaction=YES | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->review-queue-ava-a1-parent-progress-preview-approve->message-preview-ava-a1-parent-progress-approved->parent-inbox-item-message-preview-ava-a1-parent-progress-approved |
| parent-inbox-hidden-held-message-preview-ava-a1-non-owner-held | Ava Nguyen (child-ava-demo) | Minh Parent | HIDDEN_HELD_REVIEW | HIDDEN_LOCAL_DEMO | HIDDEN_LOCAL_DEMO | Admin review held the preview because the requested guardian is not linked to child-ava-demo and all parent-facing fields are denied. | permission=YES redaction=YES | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->review-queue-ava-a1-non-owner-preview-held->message-preview-ava-a1-non-owner-held->parent-inbox-hidden-held-message-preview-ava-a1-non-owner-held |
| parent-inbox-item-message-preview-minh-a1-parent-progress-approved | Minh Tran (child-minh-demo) | Minh Parent | VISIBLE_TO_PARENT | Minh Tran MH-A1-STARTER progress update | Minh Tran cannot open plan-minh-a1-day-02; Fixture subscription or enrollment is not active paid; wait for the local-demo payment confirmation before unlocking learning access. Teacher-only recovery notes remain redacted in this aligned local-demo preview. | NONE | permission=YES redaction=YES | student-minh->course-a1-starter->report-summary-preview-progress-access-enroll-minh-a1-pending->review-queue-minh-a1-parent-progress-preview-approve->message-preview-minh-a1-parent-progress-approved->parent-inbox-item-message-preview-minh-a1-parent-progress-approved |

## Read/Ack Rows

| Read/Ack | Inbox item | Parent | Status | Read at | Acknowledged at | Reason | Trace |
| --- | --- | --- | --- | --- | --- | --- | --- |
| read-ack-parent-inbox-item-message-preview-ava-a1-parent-progress-approved | parent-inbox-item-message-preview-ava-a1-parent-progress-approved | Ava Parent | READ_ACKNOWLEDGED | 2026-06-30T14:05:00.000Z | 2026-06-30T14:06:00.000Z | Fixture read/ack evidence is generated only for an approved visible parent inbox item. | student-ava->course-a1-starter->report-summary-preview-progress-access-enroll-ava-a1-active->review-queue-ava-a1-parent-progress-preview-approve->message-preview-ava-a1-parent-progress-approved->parent-inbox-item-message-preview-ava-a1-parent-progress-approved->read-ack-parent-inbox-item-message-preview-ava-a1-parent-progress-approved |
| read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved | parent-inbox-item-message-preview-minh-a1-parent-progress-approved | Minh Parent | READ_ACKNOWLEDGED | 2026-06-30T14:05:00.000Z | 2026-06-30T14:06:00.000Z | Fixture read/ack evidence is generated only for an approved visible parent inbox item. | student-minh->course-a1-starter->report-summary-preview-progress-access-enroll-minh-a1-pending->review-queue-minh-a1-parent-progress-preview-approve->message-preview-minh-a1-parent-progress-approved->parent-inbox-item-message-preview-minh-a1-parent-progress-approved->read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved |
