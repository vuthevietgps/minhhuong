# Learning local demo Parent/Teacher Report Permission Privacy Redaction Report

Generated at: 2026-06-30T13:30:00.000Z

## Current Status

- Status: LOCAL_DEMO_READY_WITH_NOTES
- Summary: Parent/teacher report permission and privacy redaction evidence is fixture-only, read-only, and deterministic.
- Endpoint: /v1/learning-local-demo/parent-teacher-report-permission-privacy-redaction-report
- Dashboard evidence: /admin/learning-local-demo#parent-teacher-report-permission-privacy-redaction
- JSON export: exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json
- Markdown export: exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.md

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
- Support/ops actors: 1
- Courses: 2
- Report permission cases: 6
- Allowed cases: 4
- Denied cases: 2
- Teacher unassigned denied cases: 1
- Support/ops audit read-only cases: 1
- Visible fields: 15
- Redacted fields: 2
- Denied fields: 7
- Parent-visible fields: 4
- Teacher/admin-visible fields: 8
- Support/ops-visible fields: 3
- Support/ops denied fields: 1
- Permission traces: 6
- Cases with trace: 6
- Denied/redacted cases with reason: 5
- Redacted/denied fields with reason: 9
- Production-ready claims: 0
- Safety gates closed: 19/19
- Open safety gates: 0

## Remaining Local-Demo Notes

- Report permission rows are fixture-only and do not alter production authentication, authorization, or privacy policy.
- Parent and teacher/admin actors use existing local-demo guardians and content owners; support/ops audit uses a deterministic read-only fixture actor.
- Denied and redacted rows expose reasons for review while hiding field values from out-of-scope actors.

## Evidence Rows

| Evidence | Count | Fixture IDs | Summary |
| --- | ---: | --- | --- |
| PARENT_ALLOWED_REPORT_SCOPE | 1 | guardian-ava-parent->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active->permission-allowed-own-child | Owning parent can see parent-facing child report fields through guardian-child fixture links. |
| PARENT_DENIED_NON_OWNER_SCOPE | 1 | guardian-minh-parent->student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->permission-denied-non-owner | Non-owning parent request is denied with explicit local-demo relationship reason. |
| TEACHER_ASSIGNED_CLASS_SCOPE | 1 | content-owner-teacher-mai->class-a1-june-weekday->course-a1-starter->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-assigned-class | Assigned teacher sees class progress report fields while guardian private contact is redacted. |
| TEACHER_DENIED_UNASSIGNED_CLASS_SCOPE | 1 | content-owner-teacher-mai->class-phonics-may-booster->teacher-access-summary-content-owner-teacher-hanh-class-phonics-may-booster->permission-denied-unassigned-class | Unassigned teacher request is denied with explicit class-scope reason and denied field rows. |
| ADMIN_CLASS_SCOPE | 1 | content-owner-admin-hoa->class-phonics-may-booster->course-phonics-booster->teacher-access-summary-content-owner-admin-hoa-class-phonics-may-booster->permission-allowed-admin-class | Fixture admin sees read-only class report fields through existing content owner class scope. |
| SUPPORT_OPS_AUDIT_READ_ONLY_SCOPE | 1 | support-ops-auditor-lan->class-a1-june-weekday->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-support-ops-audit-read-only | Support/ops actor has explicit audited read-only report scope and denied mutation evidence. |
| FIELD_VISIBILITY_REDACTION | 9 | field-visibility-permission-case-parent-ava-own-child-teacherInternalSummary, field-visibility-permission-case-teacher-mai-assigned-a1-guardianEmail, field-visibility-permission-case-parent-minh-non-owning-ava-studentName, field-visibility-permission-case-parent-minh-non-owning-ava-courseCode, field-visibility-permission-case-parent-minh-non-owning-ava-completionPercent, field-visibility-permission-case-teacher-mai-unassigned-phonics-denied-classCode, field-visibility-permission-case-teacher-mai-unassigned-phonics-denied-studentCount, field-visibility-permission-case-teacher-mai-unassigned-phonics-denied-progressSummaryIds, field-visibility-permission-case-support-ops-lan-audit-read-only-liveMutation | Every redacted or denied field row carries a stable trace key and reason. |
| SAFETY_GATE | 19 | productionReady=false, fixtureOnly=true, productionDbUsed=false, noProductionDbRead=true, providerApiUsed=false, paymentProviderUsed=false, aiProviderExecutionUsed=false, notificationProviderUsed=false, liveAdsExecuted=false, realStudentMutationUsed=false, realCourseMutationUsed=false, realEnrollmentMutationUsed=false, realSubscriptionMutationUsed=false, realPaymentMutationUsed=false, realRefundMutationUsed=false, realCommissionMutationUsed=false, realLearningMutationUsed=false, realErpMutationUsed=false, secretsRequired=false | All production DB, provider, payment, notification, learning mutation, and ERP mutation gates remain closed. |

## Permission Case Rows

| Case | Actor | Scope | Decision | Target | Fields | Reason | Trace |
| --- | --- | --- | --- | --- | --- | --- | --- |
| permission-case-parent-ava-own-child | Ava Parent (PARENT_GUARDIAN) | OWN_CHILD | ALLOWED | Ava Nguyen | 4 visible / 1 redacted / 0 denied | Fixture guardian is linked to child-ava-demo; parent-facing fields are visible while teacher-internal fields stay redacted. | guardian-ava-parent->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active->permission-allowed-own-child |
| permission-case-parent-minh-non-owning-ava | Minh Parent (PARENT_GUARDIAN) | NON_OWNING_CHILD | DENIED | Ava Nguyen | 0 visible / 0 redacted / 3 denied | Fixture guardian guardian-minh-parent is not linked to child-ava-demo, so Ava report fields are denied. | guardian-minh-parent->student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->permission-denied-non-owner |
| permission-case-teacher-mai-assigned-a1 | Teacher Mai (TEACHER) | ASSIGNED_CLASS | ALLOWED | MH-A1-JUN-WEEKDAY | 4 visible / 1 redacted / 0 denied | Fixture teacher is assigned to class-a1-june-weekday; class report fields are visible while guardian private contact is redacted. | content-owner-teacher-mai->class-a1-june-weekday->course-a1-starter->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-assigned-class |
| permission-case-teacher-mai-unassigned-phonics-denied | Teacher Mai (TEACHER) | UNASSIGNED_CLASS | DENIED | MH-PHONICS-MAY | 0 visible / 0 redacted / 3 denied | Fixture teacher content-owner-teacher-mai is not assigned to class-phonics-may-booster, so phonics class report fields are denied. | content-owner-teacher-mai->class-phonics-may-booster->teacher-access-summary-content-owner-teacher-hanh-class-phonics-may-booster->permission-denied-unassigned-class |
| permission-case-admin-hoa-phonics-class | Admin Hoa (ADMIN) | ADMIN_CLASS | ALLOWED | MH-PHONICS-MAY | 4 visible / 0 redacted / 0 denied | Fixture admin has local-demo class scope for class-phonics-may-booster and sees read-only class report fields. | content-owner-admin-hoa->class-phonics-may-booster->course-phonics-booster->teacher-access-summary-content-owner-admin-hoa-class-phonics-may-booster->permission-allowed-admin-class |
| permission-case-support-ops-lan-audit-read-only | Support Ops Lan (SUPPORT_OPS) | SUPPORT_AUDIT_READ_ONLY | ALLOWED | MH-A1-JUN-WEEKDAY | 3 visible / 0 redacted / 1 denied | Fixture support/ops actor can inspect read-only audit fields for class-a1-june-weekday while live mutations remain denied. | support-ops-auditor-lan->class-a1-june-weekday->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-support-ops-audit-read-only |

## Field Visibility Rows

| Case | Actor | Field | Scope | Visibility | Value | Reason | Trace |
| --- | --- | --- | --- | --- | --- | --- | --- |
| permission-case-parent-ava-own-child | guardian-ava-parent (PARENT_GUARDIAN) | studentName | PARENT_VISIBLE | VISIBLE | Ava Nguyen | NONE | guardian-ava-parent->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active->permission-allowed-own-child->studentName->VISIBLE |
| permission-case-parent-ava-own-child | guardian-ava-parent (PARENT_GUARDIAN) | courseCode | PARENT_VISIBLE | VISIBLE | MH-A1-STARTER | NONE | guardian-ava-parent->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active->permission-allowed-own-child->courseCode->VISIBLE |
| permission-case-parent-ava-own-child | guardian-ava-parent (PARENT_GUARDIAN) | accessStatus | PARENT_VISIBLE | VISIBLE | UNLOCKED | NONE | guardian-ava-parent->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active->permission-allowed-own-child->accessStatus->VISIBLE |
| permission-case-parent-ava-own-child | guardian-ava-parent (PARENT_GUARDIAN) | completionPercent | PARENT_VISIBLE | VISIBLE | 67% | NONE | guardian-ava-parent->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active->permission-allowed-own-child->completionPercent->VISIBLE |
| permission-case-parent-ava-own-child | guardian-ava-parent (PARENT_GUARDIAN) | teacherInternalSummary | TEACHER_INTERNAL | REDACTED | REDACTED_LOCAL_DEMO | Parent report hides teacher/admin internal notes until a parent-facing digest is approved. | guardian-ava-parent->student-ava->course-a1-starter->enroll-ava-a1-active->sub-ava-a1-active->entitlement-sub-ava-a1-active->plan-ava-a1-day-03->progress-access-enroll-ava-a1-active->permission-allowed-own-child->teacherInternalSummary->REDACTED |
| permission-case-parent-minh-non-owning-ava | guardian-minh-parent (PARENT_GUARDIAN) | studentName | NON_OWNING_CHILD_PRIVATE | DENIED | DENIED_LOCAL_DEMO | Guardian childProfileIds does not include child-ava-demo. | guardian-minh-parent->student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->permission-denied-non-owner->studentName->DENIED |
| permission-case-parent-minh-non-owning-ava | guardian-minh-parent (PARENT_GUARDIAN) | courseCode | NON_OWNING_CHILD_PRIVATE | DENIED | DENIED_LOCAL_DEMO | Non-owning parent has no local-demo report scope for Ava course data. | guardian-minh-parent->student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->permission-denied-non-owner->courseCode->DENIED |
| permission-case-parent-minh-non-owning-ava | guardian-minh-parent (PARENT_GUARDIAN) | completionPercent | NON_OWNING_CHILD_PRIVATE | DENIED | DENIED_LOCAL_DEMO | Non-owning parent has no local-demo report scope for Ava progress data. | guardian-minh-parent->student-ava->course-a1-starter->progress-access-enroll-ava-a1-active->permission-denied-non-owner->completionPercent->DENIED |
| permission-case-teacher-mai-assigned-a1 | content-owner-teacher-mai (TEACHER) | classCode | TEACHER_VISIBLE | VISIBLE | MH-A1-JUN-WEEKDAY | NONE | content-owner-teacher-mai->class-a1-june-weekday->course-a1-starter->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-assigned-class->classCode->VISIBLE |
| permission-case-teacher-mai-assigned-a1 | content-owner-teacher-mai (TEACHER) | studentCount | TEACHER_VISIBLE | VISIBLE | 3 | NONE | content-owner-teacher-mai->class-a1-june-weekday->course-a1-starter->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-assigned-class->studentCount->VISIBLE |
| permission-case-teacher-mai-assigned-a1 | content-owner-teacher-mai (TEACHER) | blockedReasonCount | TEACHER_VISIBLE | VISIBLE | 2 | NONE | content-owner-teacher-mai->class-a1-june-weekday->course-a1-starter->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-assigned-class->blockedReasonCount->VISIBLE |
| permission-case-teacher-mai-assigned-a1 | content-owner-teacher-mai (TEACHER) | progressSummaryIds | TEACHER_VISIBLE | VISIBLE | progress-access-enroll-ava-a1-active, progress-access-enroll-khoa-a1-canceled, progress-access-enroll-minh-a1-pending | NONE | content-owner-teacher-mai->class-a1-june-weekday->course-a1-starter->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-assigned-class->progressSummaryIds->VISIBLE |
| permission-case-teacher-mai-assigned-a1 | content-owner-teacher-mai (TEACHER) | guardianEmail | GUARDIAN_PRIVATE | REDACTED | REDACTED_LOCAL_DEMO | Teacher class report redacts guardian email; contact workflows stay outside this local-demo evidence slice. | content-owner-teacher-mai->class-a1-june-weekday->course-a1-starter->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-assigned-class->guardianEmail->REDACTED |
| permission-case-teacher-mai-unassigned-phonics-denied | content-owner-teacher-mai (TEACHER) | classCode | UNASSIGNED_CLASS_PRIVATE | DENIED | DENIED_LOCAL_DEMO | Teacher Mai classIds does not include class-phonics-may-booster. | content-owner-teacher-mai->class-phonics-may-booster->teacher-access-summary-content-owner-teacher-hanh-class-phonics-may-booster->permission-denied-unassigned-class->classCode->DENIED |
| permission-case-teacher-mai-unassigned-phonics-denied | content-owner-teacher-mai (TEACHER) | studentCount | UNASSIGNED_CLASS_PRIVATE | DENIED | DENIED_LOCAL_DEMO | Unassigned teacher has no local-demo roster scope for the phonics class. | content-owner-teacher-mai->class-phonics-may-booster->teacher-access-summary-content-owner-teacher-hanh-class-phonics-may-booster->permission-denied-unassigned-class->studentCount->DENIED |
| permission-case-teacher-mai-unassigned-phonics-denied | content-owner-teacher-mai (TEACHER) | progressSummaryIds | UNASSIGNED_CLASS_PRIVATE | DENIED | DENIED_LOCAL_DEMO | Unassigned teacher cannot read phonics learner progress summaries in the fixture matrix. | content-owner-teacher-mai->class-phonics-may-booster->teacher-access-summary-content-owner-teacher-hanh-class-phonics-may-booster->permission-denied-unassigned-class->progressSummaryIds->DENIED |
| permission-case-admin-hoa-phonics-class | content-owner-admin-hoa (ADMIN) | classCode | ADMIN_VISIBLE | VISIBLE | MH-PHONICS-MAY | NONE | content-owner-admin-hoa->class-phonics-may-booster->course-phonics-booster->teacher-access-summary-content-owner-admin-hoa-class-phonics-may-booster->permission-allowed-admin-class->classCode->VISIBLE |
| permission-case-admin-hoa-phonics-class | content-owner-admin-hoa (ADMIN) | courseCode | ADMIN_VISIBLE | VISIBLE | MH-PHONICS-BOOSTER | NONE | content-owner-admin-hoa->class-phonics-may-booster->course-phonics-booster->teacher-access-summary-content-owner-admin-hoa-class-phonics-may-booster->permission-allowed-admin-class->courseCode->VISIBLE |
| permission-case-admin-hoa-phonics-class | content-owner-admin-hoa (ADMIN) | studentCount | ADMIN_VISIBLE | VISIBLE | 1 | NONE | content-owner-admin-hoa->class-phonics-may-booster->course-phonics-booster->teacher-access-summary-content-owner-admin-hoa-class-phonics-may-booster->permission-allowed-admin-class->studentCount->VISIBLE |
| permission-case-admin-hoa-phonics-class | content-owner-admin-hoa (ADMIN) | averageCompletionPercent | ADMIN_VISIBLE | VISIBLE | 100% | NONE | content-owner-admin-hoa->class-phonics-may-booster->course-phonics-booster->teacher-access-summary-content-owner-admin-hoa-class-phonics-may-booster->permission-allowed-admin-class->averageCompletionPercent->VISIBLE |
| permission-case-support-ops-lan-audit-read-only | support-ops-auditor-lan (SUPPORT_OPS) | classCode | SUPPORT_AUDIT_VISIBLE | VISIBLE | MH-A1-JUN-WEEKDAY | NONE | support-ops-auditor-lan->class-a1-june-weekday->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-support-ops-audit-read-only->classCode->VISIBLE |
| permission-case-support-ops-lan-audit-read-only | support-ops-auditor-lan (SUPPORT_OPS) | blockedReasonCount | SUPPORT_AUDIT_VISIBLE | VISIBLE | 2 | NONE | support-ops-auditor-lan->class-a1-june-weekday->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-support-ops-audit-read-only->blockedReasonCount->VISIBLE |
| permission-case-support-ops-lan-audit-read-only | support-ops-auditor-lan (SUPPORT_OPS) | auditTraceKey | SUPPORT_AUDIT_VISIBLE | VISIBLE | content-owner-teacher-mai->class-a1-june-weekday->course-a1-starter | NONE | support-ops-auditor-lan->class-a1-june-weekday->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-support-ops-audit-read-only->auditTraceKey->VISIBLE |
| permission-case-support-ops-lan-audit-read-only | support-ops-auditor-lan (SUPPORT_OPS) | liveMutation | SUPPORT_AUDIT_MUTATION | DENIED | DENIED_LOCAL_DEMO | Support/ops audit case is read-only and cannot mutate students, reports, entitlements, payments, or ERP records. | support-ops-auditor-lan->class-a1-june-weekday->teacher-access-summary-content-owner-teacher-mai-class-a1-june-weekday->permission-allowed-support-ops-audit-read-only->liveMutation->DENIED |
