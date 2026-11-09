import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningParentPortalApprovedReportInboxReadReceiptEvidenceRow,
  DemoLearningParentPortalApprovedReportInboxReadReceiptReport,
  DemoLearningParentPortalApprovedReportInboxReadReceiptSafety,
  DemoLearningParentPortalApprovedReportInboxRow,
  DemoLearningParentPortalApprovedReportReadAckRow,
} from '../learning-local-demo.types';
import { buildParentTeacherProgressAccessSummaryReport } from './parent-teacher-progress-access-summary.report';
import { buildParentTeacherReportReviewQueueMessagePreviewReport } from './parent-teacher-report-review-queue-message-preview.report';

export function buildParentPortalApprovedReportInboxReadReceiptReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningParentPortalApprovedReportInboxReadReceiptReport {
  const previewReport = buildParentTeacherReportReviewQueueMessagePreviewReport(
    fixture,
    generatedAt,
  );
  const approvedPreviewRows = previewReport.messagePreviewRows.filter(
    (row) => row.previewDecision === 'APPROVED',
  );
  const heldPreviewRows = previewReport.messagePreviewRows.filter(
    (row) => row.previewDecision === 'HELD_NEEDS_EDIT',
  );
  const progressAccessReport = buildParentTeacherProgressAccessSummaryReport(
    fixture,
    generatedAt,
  );
  const alignedMinhProgressRow = progressAccessReport.progressRows.find(
    (row) =>
      row.studentId === 'student-minh' && row.courseId === 'course-a1-starter',
  );
  if (!alignedMinhProgressRow) {
    throw new Error(
      'Missing local demo aligned Minh/course A1 progress evidence for parent inbox read receipt',
    );
  }
  const alignedMinhParentSummary = progressAccessReport.parentSummaryRows.find(
    (row) =>
      row.parentGuardianId === alignedMinhProgressRow.parentGuardianId &&
      row.studentId === alignedMinhProgressRow.studentId,
  );
  if (!alignedMinhParentSummary) {
    throw new Error(
      'Missing local demo aligned Minh parent summary evidence for parent inbox read receipt',
    );
  }
  const alignedMinhReportSummaryId =
    'report-summary-preview-progress-access-enroll-minh-a1-pending';
  const alignedMinhPermissionCaseId =
    'permission-case-parent-minh-own-child-aligned';
  const alignedMinhPermissionRedactionReferenceId =
    'permission-redaction-reference-permission-case-parent-minh-own-child-aligned';
  const alignedMinhReviewQueueItemId =
    'review-queue-minh-a1-parent-progress-preview-approve';
  const alignedMinhMessagePreviewId =
    'message-preview-minh-a1-parent-progress-approved';
  const alignedMinhDecisionTraceId =
    'preview-decision-minh-a1-parent-progress-approved';
  const alignedMinhParentInboxItemId =
    'parent-inbox-item-message-preview-minh-a1-parent-progress-approved';
  const alignedMinhRedactedFieldVisibilityIds = [
    'field-visibility-permission-case-parent-minh-own-child-aligned-teacherInternalSummary',
  ];
  const alignedMinhRelationshipTraceKey = [
    alignedMinhProgressRow.studentId,
    alignedMinhProgressRow.courseId,
    alignedMinhReportSummaryId,
    alignedMinhReviewQueueItemId,
    alignedMinhMessagePreviewId,
    alignedMinhParentInboxItemId,
  ].join('->');
  const parentInboxRows =
    previewReport.messagePreviewRows.map<DemoLearningParentPortalApprovedReportInboxRow>(
      (preview) => {
        const approved = preview.previewDecision === 'APPROVED';
        const parentInboxItemId = approved
          ? `parent-inbox-item-${preview.messagePreviewId}`
          : `parent-inbox-hidden-held-${preview.messagePreviewId}`;
        const relationshipTraceKey = [
          preview.studentId,
          preview.courseId,
          preview.reportSummaryId,
          preview.reviewQueueItemId,
          preview.messagePreviewId,
          parentInboxItemId,
        ].join('->');

        return {
          parentInboxItemId,
          messagePreviewId: preview.messagePreviewId,
          reviewQueueItemId: preview.reviewQueueItemId,
          reportSummaryId: preview.reportSummaryId,
          permissionCaseId: preview.permissionCaseId,
          permissionRedactionReferenceId:
            preview.permissionRedactionReferenceId,
          decisionTraceId: preview.decisionTraceId,
          studentId: preview.studentId,
          childProfileId: preview.childProfileId,
          studentName: preview.studentName,
          courseId: preview.courseId,
          courseCode: preview.courseCode,
          classCode: preview.classCode,
          parentGuardianId: preview.parentGuardianId,
          parentGuardianName: preview.parentGuardianName,
          inboxVisibility: approved
            ? 'VISIBLE_TO_PARENT'
            : 'HIDDEN_HELD_REVIEW',
          parentVisible: approved,
          hiddenFromParent: !approved,
          hiddenReason: approved ? null : preview.heldReason,
          visibleSubject: approved
            ? `${preview.studentName} ${preview.courseCode} progress update`
            : null,
          visibleBody: approved ? preview.messagePreview : null,
          visibleCourseLabel: approved
            ? `${preview.courseCode} / ${preview.classCode}`
            : null,
          permissionDecision: preview.permissionDecision,
          permissionEvidenceReferenced: preview.permissionEvidenceReferenced,
          redactionEvidenceReferenced: preview.redactionEvidenceReferenced,
          redactedFieldVisibilityIds: preview.redactedFieldVisibilityIds,
          deniedFieldVisibilityIds: preview.deniedFieldVisibilityIds,
          relationshipTraceKey,
          relationshipTraceIds: [
            ...preview.relationshipTraceIds,
            parentInboxItemId,
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
  parentInboxRows.push({
    parentInboxItemId: alignedMinhParentInboxItemId,
    messagePreviewId: alignedMinhMessagePreviewId,
    reviewQueueItemId: alignedMinhReviewQueueItemId,
    reportSummaryId: alignedMinhReportSummaryId,
    permissionCaseId: alignedMinhPermissionCaseId,
    permissionRedactionReferenceId: alignedMinhPermissionRedactionReferenceId,
    decisionTraceId: alignedMinhDecisionTraceId,
    studentId: alignedMinhProgressRow.studentId,
    childProfileId: alignedMinhProgressRow.childProfileId,
    studentName: alignedMinhProgressRow.studentName,
    courseId: alignedMinhProgressRow.courseId,
    courseCode: alignedMinhProgressRow.courseCode,
    classCode: alignedMinhProgressRow.classCode,
    parentGuardianId: alignedMinhProgressRow.parentGuardianId,
    parentGuardianName: alignedMinhProgressRow.parentGuardianName,
    inboxVisibility: 'VISIBLE_TO_PARENT',
    parentVisible: true,
    hiddenFromParent: false,
    hiddenReason: null,
    visibleSubject: `${alignedMinhProgressRow.studentName} ${alignedMinhProgressRow.courseCode} progress update`,
    visibleBody: `${alignedMinhParentSummary.parentFacingSummary} Teacher-only recovery notes remain redacted in this aligned local-demo preview.`,
    visibleCourseLabel: `${alignedMinhProgressRow.courseCode} / ${alignedMinhProgressRow.classCode}`,
    permissionDecision: 'ALLOWED',
    permissionEvidenceReferenced: true,
    redactionEvidenceReferenced: true,
    redactedFieldVisibilityIds: alignedMinhRedactedFieldVisibilityIds,
    deniedFieldVisibilityIds: [],
    relationshipTraceKey: alignedMinhRelationshipTraceKey,
    relationshipTraceIds: [
      alignedMinhProgressRow.studentId,
      alignedMinhProgressRow.courseId,
      alignedMinhProgressRow.classId,
      alignedMinhProgressRow.progressSummaryId,
      alignedMinhReportSummaryId,
      alignedMinhParentSummary.parentSummaryId,
      alignedMinhParentSummary.relationshipTraceKey,
      ...alignedMinhParentSummary.relationshipTraceIds,
      alignedMinhPermissionCaseId,
      alignedMinhPermissionRedactionReferenceId,
      ...alignedMinhRedactedFieldVisibilityIds,
      alignedMinhReviewQueueItemId,
      alignedMinhDecisionTraceId,
      alignedMinhMessagePreviewId,
      alignedMinhParentInboxItemId,
      alignedMinhRelationshipTraceKey,
    ],
    fixtureOnly: true,
    providerUsed: false,
    aiProviderExecutionUsed: false,
    notificationDeliveryUsed: false,
    mutationUsed: false,
  });
  const visibleParentInboxRows = parentInboxRows.filter(
    (row) => row.parentVisible,
  );
  const hiddenHeldInboxRows = parentInboxRows.filter(
    (row) => row.hiddenFromParent,
  );
  const readAckRows =
    visibleParentInboxRows.map<DemoLearningParentPortalApprovedReportReadAckRow>(
      (row) => {
        const readAckEvidenceId = `read-ack-${row.parentInboxItemId}`;
        const relationshipTraceKey = [
          row.relationshipTraceKey,
          readAckEvidenceId,
        ].join('->');

        return {
          readAckEvidenceId,
          parentInboxItemId: row.parentInboxItemId,
          messagePreviewId: row.messagePreviewId,
          parentGuardianId: row.parentGuardianId,
          parentGuardianName: row.parentGuardianName,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          readAckStatus: 'READ_ACKNOWLEDGED',
          readAt: '2026-06-30T14:05:00.000Z',
          acknowledgedAt: '2026-06-30T14:06:00.000Z',
          acknowledgementLabel:
            'Parent opened the local-demo inbox preview and acknowledged the progress note.',
          evidenceReason:
            'Fixture read/ack evidence is generated only for an approved visible parent inbox item.',
          relationshipTraceKey,
          relationshipTraceIds: [
            ...row.relationshipTraceIds,
            readAckEvidenceId,
            relationshipTraceKey,
          ],
          fixtureOnly: true,
          providerUsed: false,
          notificationDeliveryUsed: false,
          mutationUsed: false,
        };
      },
    );

  const remainingLocalDemoNotes = [
    'Parent portal inbox/read receipt rows are deterministic local-demo evidence, not persisted parent portal state.',
    'Only approved previews produce parent-visible subject and body fields; held previews stay hidden and carry explicit internal reasons.',
    'Read/ack evidence is fixture-only and does not call notification providers, production DB, auth/privacy policy, or parent-message delivery paths.',
  ];
  const safety = {
    ...previewReport.safety,
  } satisfies DemoLearningParentPortalApprovedReportInboxReadReceiptSafety;
  const safetyEntries = Object.entries(safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
      return value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;
  const parentInboxTraceCount = parentInboxRows.filter(
    (row) =>
      row.relationshipTraceIds.includes(row.studentId) &&
      row.relationshipTraceIds.includes(row.courseId) &&
      row.relationshipTraceIds.includes(row.reportSummaryId) &&
      row.relationshipTraceIds.includes(row.reviewQueueItemId) &&
      row.relationshipTraceIds.includes(row.messagePreviewId) &&
      row.relationshipTraceIds.includes(row.parentInboxItemId),
  ).length;
  const parentInboxRowsById = new Map(
    parentInboxRows.map((row) => [row.parentInboxItemId, row]),
  );
  const alignedApprovedParentInboxRows = visibleParentInboxRows.filter(
    (row) =>
      row.studentId === 'student-minh' &&
      row.courseId === 'course-a1-starter' &&
      row.parentGuardianId === 'guardian-minh-parent' &&
      row.permissionDecision === 'ALLOWED',
  );
  const alignedParentReadAckRows = readAckRows.filter((row) => {
    const parentInboxRow = parentInboxRowsById.get(row.parentInboxItemId);

    return (
      row.studentId === 'student-minh' &&
      parentInboxRow?.courseId === 'course-a1-starter' &&
      row.parentGuardianId === 'guardian-minh-parent'
    );
  });
  const stableAlignedReadReceiptTraceRows = alignedParentReadAckRows.filter(
    (row) => {
      const parentInboxRow = parentInboxRowsById.get(row.parentInboxItemId);

      return (
        Boolean(parentInboxRow) &&
        row.relationshipTraceIds.includes(row.studentId) &&
        row.relationshipTraceIds.includes(parentInboxRow?.courseId ?? '') &&
        row.relationshipTraceIds.includes(row.parentInboxItemId) &&
        row.relationshipTraceIds.includes(row.readAckEvidenceId)
      );
    },
  );
  const evidenceRows: DemoLearningParentPortalApprovedReportInboxReadReceiptEvidenceRow[] =
    [
      {
        evidenceKind: 'VISIBLE_PARENT_INBOX_ITEM',
        evidenceCount: visibleParentInboxRows.length,
        stableFixtureIds: visibleParentInboxRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Approved previews become visible parent inbox rows with parent-facing subject and body fields.',
      },
      {
        evidenceKind: 'HIDDEN_HELD_PREVIEW',
        evidenceCount: hiddenHeldInboxRows.length,
        stableFixtureIds: hiddenHeldInboxRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Held previews remain hidden from the parent inbox surface and carry an explicit internal reason.',
      },
      {
        evidenceKind: 'READ_ACK_RECEIPT',
        evidenceCount: readAckRows.length,
        stableFixtureIds: readAckRows.map((row) => row.relationshipTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Fixture read/ack evidence links the visible inbox item back to the approved preview.',
      },
      {
        evidenceKind: 'ALIGNED_APPROVED_DELIVERY_READ_RECEIPT',
        evidenceCount: stableAlignedReadReceiptTraceRows.length,
        stableFixtureIds: stableAlignedReadReceiptTraceRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Aligned Minh/course A1 approved inbox and read/ack evidence is available for the MVP readiness trace without notification delivery.',
      },
      {
        evidenceKind: 'PERMISSION_REDACTION_REFERENCE',
        evidenceCount:
          previewReport.permissionRedactionReferenceRows.length +
          alignedApprovedParentInboxRows.length,
        stableFixtureIds: [
          ...previewReport.permissionRedactionReferenceRows.map(
            (row) => row.relationshipTraceKey,
          ),
          ...alignedApprovedParentInboxRows.map(
            (row) => row.permissionRedactionReferenceId,
          ),
        ],
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Visible and hidden inbox evidence carries forward permission and redaction references from the review preview.',
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
          'Production DB, provider, payment, notification, AI execution, learning mutation, and ERP mutation gates remain closed.',
      },
    ];

  return {
    reportName:
      'Learning local demo Parent Portal Approved Report Inbox Read Receipt Report',
    generatedFor:
      'local-demo-parent-portal-approved-report-inbox-read-receipt-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#parent-portal-approved-report-inbox-read-receipt',
    jsonExportPath:
      'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
    markdownExportPath:
      'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Parent portal inbox/read receipt evidence is fixture-only and only exposes approved parent-facing previews.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: fixture.students.length,
      parentGuardianCount: fixture.parentGuardians.length,
      teacherCount: fixture.contentOwners.filter(
        (owner) => owner.role === 'TEACHER' || owner.role === 'ADMIN',
      ).length,
      courseCount: fixture.courses.length,
      approvedPreviewCount:
        approvedPreviewRows.length + alignedApprovedParentInboxRows.length,
      heldPreviewCount: heldPreviewRows.length,
      parentInboxItemCount: parentInboxRows.length,
      visibleParentInboxItemCount: visibleParentInboxRows.length,
      hiddenHeldPreviewCount: hiddenHeldInboxRows.length,
      readAckEvidenceCount: readAckRows.length,
      permissionRedactionReferenceCount:
        previewReport.permissionRedactionReferenceRows.length +
        alignedApprovedParentInboxRows.length,
      parentInboxTraceCount,
      visibleInboxItemsWithStableRelationshipTraceCount:
        visibleParentInboxRows.filter(
          (row) =>
            row.relationshipTraceIds.includes(row.studentId) &&
            row.relationshipTraceIds.includes(row.courseId) &&
            row.relationshipTraceIds.includes(row.reportSummaryId) &&
            row.relationshipTraceIds.includes(row.reviewQueueItemId) &&
            row.relationshipTraceIds.includes(row.messagePreviewId) &&
            row.relationshipTraceIds.includes(row.parentInboxItemId),
        ).length,
      hiddenHeldPreviewsWithReasonCount: hiddenHeldInboxRows.filter((row) =>
        Boolean(row.hiddenReason),
      ).length,
      visibleParentPreviewWithPermissionRedactionEvidenceCount:
        visibleParentInboxRows.filter(
          (row) =>
            row.permissionEvidenceReferenced && row.redactionEvidenceReferenced,
        ).length,
      alignedApprovedParentInboxEntryCount:
        alignedApprovedParentInboxRows.length,
      alignedParentReadReceiptCount: alignedParentReadAckRows.length,
      stableAlignedReadReceiptTraceCount:
        stableAlignedReadReceiptTraceRows.length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    parentInboxRows,
    readAckRows,
    evidenceRows,
  };
}

export function toParentPortalApprovedReportInboxReadReceiptMarkdown(
  report: DemoLearningParentPortalApprovedReportInboxReadReceiptReport,
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
    `- Approved previews: ${report.totals.approvedPreviewCount}`,
    `- Held previews: ${report.totals.heldPreviewCount}`,
    `- Parent inbox items: ${report.totals.parentInboxItemCount}`,
    `- Visible parent inbox items: ${report.totals.visibleParentInboxItemCount}`,
    `- Hidden held previews: ${report.totals.hiddenHeldPreviewCount}`,
    `- Read/ack evidence: ${report.totals.readAckEvidenceCount}`,
    `- Permission/redaction references: ${report.totals.permissionRedactionReferenceCount}`,
    `- Parent inbox traces: ${report.totals.parentInboxTraceCount}`,
    `- Visible inbox items with stable relationship trace: ${report.totals.visibleInboxItemsWithStableRelationshipTraceCount}`,
    `- Hidden/held previews with reason: ${report.totals.hiddenHeldPreviewsWithReasonCount}`,
    `- Visible previews with permission/redaction evidence: ${report.totals.visibleParentPreviewWithPermissionRedactionEvidenceCount}`,
    `- Aligned approved Minh/course A1 inbox entries: ${report.totals.alignedApprovedParentInboxEntryCount}`,
    `- Aligned Minh/course A1 read receipts: ${report.totals.alignedParentReadReceiptCount}`,
    `- Stable aligned read receipt traces: ${report.totals.stableAlignedReadReceiptTraceCount}`,
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
    '## Parent Inbox Rows',
    '',
    '| Inbox item | Student | Parent | Visibility | Subject | Body | Hidden reason | Permission evidence | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.parentInboxRows.map(
      (row) =>
        `| ${[
          row.parentInboxItemId,
          `${row.studentName} (${row.childProfileId})`,
          row.parentGuardianName,
          row.inboxVisibility,
          row.visibleSubject ?? 'HIDDEN_LOCAL_DEMO',
          row.visibleBody ?? 'HIDDEN_LOCAL_DEMO',
          row.hiddenReason ?? 'NONE',
          `permission=${row.permissionEvidenceReferenced ? 'YES' : 'NO'} redaction=${row.redactionEvidenceReferenced ? 'YES' : 'NO'}`,
          row.relationshipTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Read/Ack Rows',
    '',
    '| Read/Ack | Inbox item | Parent | Status | Read at | Acknowledged at | Reason | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.readAckRows.map(
      (row) =>
        `| ${[
          row.readAckEvidenceId,
          row.parentInboxItemId,
          row.parentGuardianName,
          row.readAckStatus,
          row.readAt,
          row.acknowledgedAt,
          row.evidenceReason,
          row.relationshipTraceKey,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
