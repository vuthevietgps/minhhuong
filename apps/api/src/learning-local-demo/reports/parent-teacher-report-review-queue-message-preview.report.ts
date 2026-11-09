import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningParentTeacherReportMessagePreviewRow,
  DemoLearningParentTeacherReportPermissionRedactionReferenceRow,
  DemoLearningParentTeacherReportPermissionCaseRow,
  DemoLearningParentTeacherReportReviewQueueMessagePreviewEvidenceRow,
  DemoLearningParentTeacherReportReviewQueueMessagePreviewReport,
  DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety,
  DemoLearningParentTeacherReportReviewQueueRow,
  DemoLearningParentTeacherReportReviewSummaryRow,
} from '../learning-local-demo.types';
import { buildParentTeacherReportPermissionPrivacyRedactionReport } from './parent-teacher-report-permission-privacy-redaction.report';
import {
  requireContentOwner,
  requireCourseById,
  requireGuardian,
} from './shared';

export function buildParentTeacherReportReviewQueueMessagePreviewReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningParentTeacherReportReviewQueueMessagePreviewReport {
  const permissionReport =
    buildParentTeacherReportPermissionPrivacyRedactionReport(
      fixture,
      generatedAt,
    );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );
  const contentOwnersById = new Map(
    fixture.contentOwners.map((owner) => [owner.id, owner]),
  );
  const coursesById = new Map(
    fixture.courses.map((course) => [course.id, course]),
  );

  const requirePermissionCase = (permissionCaseId: string) => {
    const permissionCase = permissionReport.permissionCaseRows.find(
      (row) => row.permissionCaseId === permissionCaseId,
    );
    if (!permissionCase) {
      throw new Error(
        `Missing local demo report permission case ${permissionCaseId}`,
      );
    }

    return permissionCase;
  };
  const requireCourseCode = (courseId: string | null) => {
    if (!courseId) {
      throw new Error('Missing local demo course id for report preview');
    }

    return requireCourseById(coursesById, courseId).code;
  };
  const requireStudentTarget = (
    permissionCase: DemoLearningParentTeacherReportPermissionCaseRow,
  ) => {
    if (
      !permissionCase.targetStudentId ||
      !permissionCase.targetChildProfileId ||
      !permissionCase.targetStudentName ||
      !permissionCase.targetCourseId ||
      !permissionCase.targetClassId ||
      !permissionCase.targetClassCode ||
      !permissionCase.progressSummaryId
    ) {
      throw new Error(
        `Missing local demo student report target for ${permissionCase.permissionCaseId}`,
      );
    }

    return {
      studentId: permissionCase.targetStudentId,
      childProfileId: permissionCase.targetChildProfileId,
      studentName: permissionCase.targetStudentName,
      courseId: permissionCase.targetCourseId,
      courseCode:
        permissionCase.targetCourseCode ??
        requireCourseCode(permissionCase.targetCourseId),
      classId: permissionCase.targetClassId,
      classCode: permissionCase.targetClassCode,
      progressSummaryId: permissionCase.progressSummaryId,
    };
  };

  const allowedParentCase = requirePermissionCase(
    'permission-case-parent-ava-own-child',
  );
  const deniedParentCase = requirePermissionCase(
    'permission-case-parent-minh-non-owning-ava',
  );
  const allowedTarget = requireStudentTarget(allowedParentCase);
  const deniedTarget = requireStudentTarget(deniedParentCase);
  const avaParent = requireGuardian(guardiansById, allowedParentCase.actorId);
  const minhParent = requireGuardian(guardiansById, deniedParentCase.actorId);
  const teacherMai = requireContentOwner(
    contentOwnersById,
    'content-owner-teacher-mai',
  );
  const adminHoa = requireContentOwner(
    contentOwnersById,
    'content-owner-admin-hoa',
  );

  const reportSummaryRows: DemoLearningParentTeacherReportReviewSummaryRow[] = [
    {
      reportSummaryId:
        'report-summary-preview-progress-access-enroll-ava-a1-active',
      sourceProgressSummaryId: allowedTarget.progressSummaryId,
      sourceParentSummaryId: allowedParentCase.sourceParentSummaryId,
      studentId: allowedTarget.studentId,
      childProfileId: allowedTarget.childProfileId,
      studentName: allowedTarget.studentName,
      courseId: allowedTarget.courseId,
      courseCode: allowedTarget.courseCode,
      classId: allowedTarget.classId,
      classCode: allowedTarget.classCode,
      parentGuardianId: avaParent.id,
      parentGuardianName: avaParent.displayName,
      relationshipTraceKey: [
        allowedTarget.studentId,
        allowedTarget.courseId,
        allowedTarget.progressSummaryId,
        'report-summary-parent-facing-preview',
      ].join('->'),
      relationshipTraceIds: [
        allowedTarget.studentId,
        allowedTarget.courseId,
        allowedTarget.classId,
        allowedTarget.progressSummaryId,
        allowedParentCase.sourceParentSummaryId ?? 'no-parent-summary',
        allowedParentCase.relationshipTraceKey,
      ],
      summary:
        'Ava A1 progress summary is the fixture source for a parent-facing message preview after permission and redaction checks.',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
    },
  ];
  const reportSummary = reportSummaryRows[0];

  const permissionRedactionReferenceRows = [
    allowedParentCase,
    deniedParentCase,
  ].map<DemoLearningParentTeacherReportPermissionRedactionReferenceRow>(
    (permissionCase) => {
      const fieldRows = permissionReport.fieldVisibilityRows.filter(
        (row) => row.permissionCaseId === permissionCase.permissionCaseId,
      );
      const redactedFieldVisibilityIds = fieldRows
        .filter((row) => row.visibility === 'REDACTED')
        .map((row) => row.fieldVisibilityId);
      const deniedFieldVisibilityIds = fieldRows
        .filter((row) => row.visibility === 'DENIED')
        .map((row) => row.fieldVisibilityId);
      const relationshipTraceKey = [
        reportSummary.relationshipTraceKey,
        permissionCase.permissionCaseId,
        permissionCase.permissionDecision,
        'permission-redaction-reference',
      ].join('->');

      return {
        permissionRedactionReferenceId: `permission-redaction-reference-${permissionCase.permissionCaseId}`,
        permissionCaseId: permissionCase.permissionCaseId,
        actorId: permissionCase.actorId,
        actorRole: permissionCase.actorRole,
        permissionDecision: permissionCase.permissionDecision,
        reportScope: permissionCase.reportScope,
        visibleFieldCount: permissionCase.visibleFieldCount,
        redactedFieldCount: permissionCase.redactedFieldCount,
        deniedFieldCount: permissionCase.deniedFieldCount,
        redactedFieldVisibilityIds,
        deniedFieldVisibilityIds,
        permissionReason: permissionCase.decisionReason,
        relationshipTraceKey,
        relationshipTraceIds: [
          ...reportSummary.relationshipTraceIds,
          permissionCase.permissionCaseId,
          permissionCase.relationshipTraceKey,
          ...fieldRows.map((row) => row.relationshipTraceKey),
        ],
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
      };
    },
  );
  const referencesByPermissionCaseId = new Map(
    permissionRedactionReferenceRows.map((row) => [row.permissionCaseId, row]),
  );
  const requireReference = (permissionCaseId: string) => {
    const reference = referencesByPermissionCaseId.get(permissionCaseId);
    if (!reference) {
      throw new Error(
        `Missing local demo permission redaction reference ${permissionCaseId}`,
      );
    }

    return reference;
  };
  const allowedReference = requireReference(allowedParentCase.permissionCaseId);
  const deniedReference = requireReference(deniedParentCase.permissionCaseId);

  const reviewQueueInputs = [
    {
      reviewQueueItemId: 'review-queue-ava-a1-parent-progress-preview-approve',
      permissionCase: allowedParentCase,
      target: allowedTarget,
      parentGuardian: avaParent,
      reviewer: teacherMai,
      reference: allowedReference,
      reviewStatus: 'APPROVED' as const,
      createdAt: '2026-06-30T13:40:00.000Z',
      reviewedAt: '2026-06-30T13:45:00.000Z',
      reviewReason:
        'Teacher review approved the parent-facing preview because the owning-parent permission case is allowed and teacher-internal notes are redacted.',
      messagePreviewId: 'message-preview-ava-a1-parent-progress-approved',
      decisionTraceId: 'preview-decision-ava-a1-parent-progress-approved',
      messagePreview:
        'Ava is on track in A1 English with 86% completion. Teacher-only notes remain redacted in this local-demo preview.',
    },
    {
      reviewQueueItemId: 'review-queue-ava-a1-non-owner-preview-held',
      permissionCase: deniedParentCase,
      target: deniedTarget,
      parentGuardian: minhParent,
      reviewer: adminHoa,
      reference: deniedReference,
      reviewStatus: 'HELD_NEEDS_EDIT' as const,
      createdAt: '2026-06-30T13:42:00.000Z',
      reviewedAt: '2026-06-30T13:48:00.000Z',
      reviewReason:
        'Admin review held the preview because the requested guardian is not linked to child-ava-demo and all parent-facing fields are denied.',
      messagePreviewId: 'message-preview-ava-a1-non-owner-held',
      decisionTraceId: 'preview-decision-ava-a1-non-owner-held',
      messagePreview:
        'HELD_LOCAL_DEMO: no parent-facing message is sent or shown until the guardian-child relationship is corrected in fixture evidence.',
    },
  ];

  const reviewQueueRows =
    reviewQueueInputs.map<DemoLearningParentTeacherReportReviewQueueRow>(
      (input) => {
        const relationshipTraceKey = [
          input.target.studentId,
          input.target.courseId,
          reportSummary.reportSummaryId,
          input.reference.permissionRedactionReferenceId,
          input.reviewQueueItemId,
        ].join('->');

        return {
          reviewQueueItemId: input.reviewQueueItemId,
          reportSummaryId: reportSummary.reportSummaryId,
          permissionCaseId: input.permissionCase.permissionCaseId,
          permissionRedactionReferenceId:
            input.reference.permissionRedactionReferenceId,
          studentId: input.target.studentId,
          childProfileId: input.target.childProfileId,
          studentName: input.target.studentName,
          courseId: input.target.courseId,
          courseCode: input.target.courseCode,
          classId: input.target.classId,
          classCode: input.target.classCode,
          parentGuardianId: input.parentGuardian.id,
          parentGuardianName: input.parentGuardian.displayName,
          reviewerId: input.reviewer.id,
          reviewerName: input.reviewer.displayName,
          reviewerRole: input.reviewer.role,
          reviewStatus: input.reviewStatus,
          createdAt: input.createdAt,
          reviewedAt: input.reviewedAt,
          reviewReason: input.reviewReason,
          relationshipTraceKey,
          relationshipTraceIds: [
            input.target.studentId,
            input.target.courseId,
            reportSummary.reportSummaryId,
            input.permissionCase.permissionCaseId,
            input.reference.permissionRedactionReferenceId,
            ...input.reference.relationshipTraceIds,
            input.reviewQueueItemId,
            relationshipTraceKey,
          ],
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
        };
      },
    );
  const reviewQueueRowsById = new Map(
    reviewQueueRows.map((row) => [row.reviewQueueItemId, row]),
  );

  const messagePreviewRows =
    reviewQueueInputs.map<DemoLearningParentTeacherReportMessagePreviewRow>(
      (input) => {
        const reviewQueueRow = reviewQueueRowsById.get(input.reviewQueueItemId);
        if (!reviewQueueRow) {
          throw new Error(
            `Missing local demo review queue row ${input.reviewQueueItemId}`,
          );
        }

        const relationshipTraceKey = [
          reviewQueueRow.relationshipTraceKey,
          input.decisionTraceId,
          input.messagePreviewId,
        ].join('->');
        const approved = input.reviewStatus === 'APPROVED';

        return {
          messagePreviewId: input.messagePreviewId,
          reviewQueueItemId: input.reviewQueueItemId,
          reportSummaryId: reportSummary.reportSummaryId,
          permissionCaseId: input.permissionCase.permissionCaseId,
          permissionRedactionReferenceId:
            input.reference.permissionRedactionReferenceId,
          previewDecision: input.reviewStatus,
          decisionTraceId: input.decisionTraceId,
          studentId: input.target.studentId,
          childProfileId: input.target.childProfileId,
          studentName: input.target.studentName,
          courseId: input.target.courseId,
          courseCode: input.target.courseCode,
          classCode: input.target.classCode,
          parentGuardianId: input.parentGuardian.id,
          parentGuardianName: input.parentGuardian.displayName,
          reviewerName: input.reviewer.displayName,
          permissionDecision: input.permissionCase.permissionDecision,
          permissionEvidenceReferenced: true,
          redactionEvidenceReferenced:
            input.reference.redactedFieldVisibilityIds.length > 0 ||
            input.reference.deniedFieldVisibilityIds.length > 0,
          redactedFieldVisibilityIds:
            input.reference.redactedFieldVisibilityIds,
          deniedFieldVisibilityIds: input.reference.deniedFieldVisibilityIds,
          heldReason: approved ? null : input.reviewReason,
          approvalReason: approved ? input.reviewReason : null,
          messagePreview: input.messagePreview,
          relationshipTraceKey,
          relationshipTraceIds: [
            ...reviewQueueRow.relationshipTraceIds,
            input.decisionTraceId,
            input.messagePreviewId,
            relationshipTraceKey,
          ],
          fixtureOnly: true,
          providerUsed: false,
          aiProviderExecutionUsed: false,
          notificationDeliveryUsed: false,
          mutationUsed: false,
        };
      },
    );

  const remainingLocalDemoNotes = [
    'Review queue and preview rows are deterministic local-demo evidence, not persisted workflow state.',
    'Approved previews require an allowed permission case and referenced redaction evidence before any parent-facing text is marked approved.',
    'Held previews carry explicit reasons and do not call notification, AI, production DB, or parent-message delivery paths.',
  ];
  const safety = {
    ...permissionReport.safety,
  } satisfies DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety;
  const safetyEntries = Object.entries(safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
      return value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;
  const approvedPreviewRows = messagePreviewRows.filter(
    (row) => row.previewDecision === 'APPROVED',
  );
  const heldPreviewRows = messagePreviewRows.filter(
    (row) => row.previewDecision === 'HELD_NEEDS_EDIT',
  );
  const evidenceRows: DemoLearningParentTeacherReportReviewQueueMessagePreviewEvidenceRow[] =
    [
      {
        evidenceKind: 'REPORT_SUMMARY_SOURCE',
        evidenceCount: reportSummaryRows.length,
        stableFixtureIds: reportSummaryRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Parent-facing preview rows are generated from the existing Ava progress access report summary.',
      },
      {
        evidenceKind: 'PERMISSION_REDACTION_REFERENCE',
        evidenceCount: permissionRedactionReferenceRows.length,
        stableFixtureIds: permissionRedactionReferenceRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Each preview decision references an allowed or denied permission case plus redacted or denied field evidence.',
      },
      {
        evidenceKind: 'REVIEW_QUEUE_DECISION',
        evidenceCount: reviewQueueRows.length,
        stableFixtureIds: reviewQueueRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher/admin queue items link student, course, report summary, permission evidence, and review decision.',
      },
      {
        evidenceKind: 'APPROVED_PARENT_PREVIEW',
        evidenceCount: approvedPreviewRows.length,
        stableFixtureIds: approvedPreviewRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Approved parent-facing preview remains fixture-only and references redaction evidence before approval.',
      },
      {
        evidenceKind: 'HELD_PARENT_PREVIEW',
        evidenceCount: heldPreviewRows.length,
        stableFixtureIds: heldPreviewRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Held preview has an explicit reason and no parent notification or message delivery.',
      },
      {
        evidenceKind: 'SAFETY_GATE',
        evidenceCount: safetyGateCount,
        stableFixtureIds: Object.entries(safety).map(
          ([gate, value]) => `${gate}=${String(value)}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'All production DB, provider, payment, notification, learning mutation, and ERP mutation gates remain closed.',
      },
    ];

  return {
    reportName:
      'Learning local demo Parent/Teacher Report Review Queue Message Preview Report',
    generatedFor:
      'local-demo-parent-teacher-report-review-queue-message-preview-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#parent-teacher-report-review-queue-message-preview',
    jsonExportPath:
      'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.json',
    markdownExportPath:
      'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Parent-facing report preview review queue is fixture-only, read-only, and references permission/redaction evidence before approval.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: fixture.students.length,
      parentGuardianCount: fixture.parentGuardians.length,
      teacherCount: fixture.contentOwners.filter(
        (owner) => owner.role === 'TEACHER' || owner.role === 'ADMIN',
      ).length,
      courseCount: fixture.courses.length,
      reportSummaryCount: reportSummaryRows.length,
      permissionRedactionReferenceCount:
        permissionRedactionReferenceRows.length,
      reviewQueueItemCount: reviewQueueRows.length,
      messagePreviewCount: messagePreviewRows.length,
      approvedPreviewCount: approvedPreviewRows.length,
      heldPreviewCount: heldPreviewRows.length,
      redactionAwarePreviewCount: messagePreviewRows.filter(
        (row) => row.redactionEvidenceReferenced,
      ).length,
      reviewDecisionTraceCount: messagePreviewRows.filter(
        (row) =>
          row.decisionTraceId.length > 0 &&
          row.relationshipTraceIds.includes(row.decisionTraceId),
      ).length,
      casesWithStableRelationshipTraceCount: messagePreviewRows.filter(
        (row) =>
          row.relationshipTraceIds.includes(row.studentId) &&
          row.relationshipTraceIds.includes(row.courseId) &&
          row.relationshipTraceIds.includes(reportSummary.reportSummaryId) &&
          row.relationshipTraceIds.includes(row.permissionCaseId) &&
          row.relationshipTraceIds.includes(row.reviewQueueItemId) &&
          row.relationshipTraceIds.includes(row.messagePreviewId),
      ).length,
      heldOrNeedsEditWithReasonCount: heldPreviewRows.filter((row) =>
        Boolean(row.heldReason),
      ).length,
      approvedWithPermissionRedactionEvidenceCount: approvedPreviewRows.filter(
        (row) =>
          row.permissionEvidenceReferenced && row.redactionEvidenceReferenced,
      ).length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    reportSummaryRows,
    permissionRedactionReferenceRows,
    reviewQueueRows,
    messagePreviewRows,
    evidenceRows,
  };
}

export function toParentTeacherReportReviewQueueMessagePreviewMarkdown(
  report: DemoLearningParentTeacherReportReviewQueueMessagePreviewReport,
) {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Current Status',
    '',
    `- Status: ${report.currentStatus.status}`,
    `- Summary: ${report.currentStatus.summary}`,
    `- Endpoint: ${report.endpointPath}`,
    `- Dashboard evidence: ${report.dashboardEvidencePath}`,
    `- JSON export: ${report.jsonExportPath}`,
    `- Markdown export: ${report.markdownExportPath}`,
    '',
    '## Safety',
    '',
    '- production_ready=false',
    '- fixtureOnly=true',
    '- productionDbUsed=false',
    '- noProductionDbRead=true',
    '- providerApiUsed=false',
    '- paymentProviderUsed=false',
    '- aiProviderExecutionUsed=false',
    '- notificationProviderUsed=false',
    '- liveAdsExecuted=false',
    '- realStudentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
    '- realSubscriptionMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realLearningMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Acceptance Counts',
    '',
    `- Students: ${report.totals.studentCount}`,
    `- Parent guardians: ${report.totals.parentGuardianCount}`,
    `- Teachers/admins: ${report.totals.teacherCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Report summaries: ${report.totals.reportSummaryCount}`,
    `- Permission/redaction references: ${report.totals.permissionRedactionReferenceCount}`,
    `- Review queue items: ${report.totals.reviewQueueItemCount}`,
    `- Message previews: ${report.totals.messagePreviewCount}`,
    `- Approved previews: ${report.totals.approvedPreviewCount}`,
    `- Held previews: ${report.totals.heldPreviewCount}`,
    `- Redaction-aware previews: ${report.totals.redactionAwarePreviewCount}`,
    `- Review decision traces: ${report.totals.reviewDecisionTraceCount}`,
    `- Cases with stable relationship trace: ${report.totals.casesWithStableRelationshipTraceCount}`,
    `- Held/needs-edit with reason: ${report.totals.heldOrNeedsEditWithReasonCount}`,
    `- Approved with permission/redaction evidence: ${report.totals.approvedWithPermissionRedactionEvidenceCount}`,
    `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Remaining Local-Demo Notes',
    '',
    ...report.currentStatus.remainingLocalDemoNotes.map((note) => `- ${note}`),
    '',
    '## Evidence Rows',
    '',
    '| Evidence | Count | Fixture IDs | Summary |',
    '| --- | ---: | --- | --- |',
    ...report.evidenceRows.map(
      (row) =>
        `| ${[
          row.evidenceKind,
          String(row.evidenceCount),
          row.stableFixtureIds.join(', '),
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Report Summary Rows',
    '',
    '| Summary | Student | Course | Parent | Source progress | Trace |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.reportSummaryRows.map(
      (row) =>
        `| ${[
          row.reportSummaryId,
          `${row.studentName} (${row.childProfileId})`,
          `${row.courseCode} / ${row.classCode}`,
          row.parentGuardianName,
          row.sourceProgressSummaryId,
          row.relationshipTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Permission Redaction References',
    '',
    '| Reference | Permission case | Decision | Fields | Reason | Trace |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.permissionRedactionReferenceRows.map(
      (row) =>
        `| ${[
          row.permissionRedactionReferenceId,
          row.permissionCaseId,
          `${row.permissionDecision} / ${row.reportScope}`,
          `${row.visibleFieldCount} visible / ${row.redactedFieldCount} redacted / ${row.deniedFieldCount} denied`,
          row.permissionReason,
          row.relationshipTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Review Queue Rows',
    '',
    '| Queue item | Student | Parent | Reviewer | Decision | Reason | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.reviewQueueRows.map(
      (row) =>
        `| ${[
          row.reviewQueueItemId,
          `${row.studentName} (${row.childProfileId})`,
          row.parentGuardianName,
          `${row.reviewerName} (${row.reviewerRole})`,
          row.reviewStatus,
          row.reviewReason,
          row.relationshipTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Message Preview Rows',
    '',
    '| Preview | Student | Parent | Decision | Permission | Evidence | Reason | Message preview | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.messagePreviewRows.map(
      (row) =>
        `| ${[
          row.messagePreviewId,
          `${row.studentName} (${row.childProfileId})`,
          row.parentGuardianName,
          row.previewDecision,
          row.permissionDecision,
          `permission=${row.permissionEvidenceReferenced ? 'YES' : 'NO'} redaction=${row.redactionEvidenceReferenced ? 'YES' : 'NO'}`,
          row.approvalReason ?? row.heldReason ?? 'NONE',
          row.messagePreview,
          row.relationshipTraceKey,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
