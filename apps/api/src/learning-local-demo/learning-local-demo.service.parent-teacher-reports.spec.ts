import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService (parent and teacher reports)', () => {
  const service = new LearningLocalDemoService();

  it('builds a fixture-only parent teacher progress access summary report', () => {
    const report = service.buildParentTeacherProgressAccessSummaryReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T13:00:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/parent-teacher-progress-access-summary-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#parent-teacher-progress-access-summary',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-progress-access-summary-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-progress-access-summary-report.md',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      parentGuardianCount: 4,
      teacherCount: 3,
      courseCount: 2,
      enrollmentCount: 4,
      subscriptionCount: 4,
      entitlementCount: 4,
      dailyPlanAccessCaseCount: 4,
      unlockedAccessCount: 2,
      blockedAccessCount: 2,
      blockedReasonCount: 2,
      progressSummaryCount: 4,
      parentSummaryCount: 4,
      teacherSummaryCount: 4,
      relationshipTraceCount: 4,
      parentSummaryWithTraceCount: 4,
      teacherSummaryWithTraceCount: 4,
      blockedAccessInSummariesWithReasonCount: 2,
      evidenceRowCount: 5,
      localDemoNoteCount: 3,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('surfaces parent and teacher summaries with trace IDs and blocked reasons', () => {
    const report = service.buildParentTeacherProgressAccessSummaryReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T13:00:00.000Z',
    );
    const minhParent = report.parentSummaryRows.find(
      (row) => row.studentId === 'student-minh',
    );
    const teacherMai = report.teacherSummaryRows.find(
      (row) => row.teacherOwnerId === 'content-owner-teacher-mai',
    );

    expect(minhParent).toEqual(
      expect.objectContaining({
        parentGuardianId: 'guardian-minh-parent',
        accessStatus: 'BLOCKED_PENDING_PAYMENT',
        progressStatus: 'NEEDS_SUPPORT',
        dailyPlanId: 'plan-minh-a1-day-02',
        completionPercent: 33,
        nextSafeActionLabel: 'Confirm fixture payment before unlocking',
      }),
    );
    expect(minhParent?.blockedReason).toContain('payment confirmation');
    expect(minhParent?.relationshipTraceKey).toContain(
      'guardian-minh-parent->student-minh->course-a1-starter',
    );
    expect(
      report.parentSummaryRows.every(
        (row) =>
          row.relationshipTraceIds.length >= 3 &&
          row.relationshipTraceKey.includes(row.parentGuardianId),
      ),
    ).toBe(true);
    expect(teacherMai).toEqual(
      expect.objectContaining({
        classCode: 'MH-A1-JUN-WEEKDAY',
        courseCode: 'MH-A1-STARTER',
        studentCount: 3,
        unlockedAccessCount: 1,
        blockedAccessCount: 2,
        blockedReasonCount: 2,
        averageCompletionPercent: 44,
      }),
    );
    expect(
      report.teacherSummaryRows.every(
        (row) =>
          row.relationshipTraceIds.length > 0 &&
          row.relationshipTraceKey.includes(row.teacherOwnerId),
      ),
    ).toBe(true);
    expect(report.totals.blockedAccessInSummariesWithReasonCount).toBe(
      report.totals.blockedAccessCount,
    );
  });

  it('renders parent teacher progress access summary Markdown evidence', () => {
    const report = service.buildParentTeacherProgressAccessSummaryReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T13:00:00.000Z',
    );
    const markdown =
      service.toParentTeacherProgressAccessSummaryMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Parent guardians: 4');
    expect(markdown).toContain('Teachers/admins: 3');
    expect(markdown).toContain('Progress summaries: 4');
    expect(markdown).toContain('Blocked access in summaries with reason: 2');
    expect(markdown).toContain('## Parent Summary Rows');
    expect(markdown).toContain('## Teacher Summary Rows');
    expect(markdown).toContain('BLOCKED_PENDING_PAYMENT');
    expect(markdown).toContain(
      '/v1/learning-local-demo/parent-teacher-progress-access-summary-report',
    );
  });

  it('builds a fixture-only parent teacher report permission privacy redaction report', () => {
    const report =
      service.buildParentTeacherReportPermissionPrivacyRedactionReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:30:00.000Z',
      );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/parent-teacher-report-permission-privacy-redaction-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#parent-teacher-report-permission-privacy-redaction',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.md',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      parentGuardianCount: 4,
      teacherCount: 3,
      supportOpsCount: 1,
      courseCount: 2,
      reportPermissionCaseCount: 6,
      allowedReportCaseCount: 4,
      deniedReportCaseCount: 2,
      teacherUnassignedDeniedCaseCount: 1,
      supportOpsAuditReadOnlyCaseCount: 1,
      visibleFieldCount: 15,
      redactedFieldCount: 2,
      deniedFieldCount: 7,
      parentVisibleFieldCount: 4,
      teacherVisibleFieldCount: 8,
      supportOpsVisibleFieldCount: 3,
      parentRedactedFieldCount: 1,
      teacherRedactedFieldCount: 1,
      supportOpsDeniedFieldCount: 1,
      permissionTraceCount: 6,
      casesWithTraceCount: 6,
      deniedOrRedactedCaseWithReasonCount: 5,
      redactedOrDeniedFieldWithReasonCount: 9,
      evidenceRowCount: 8,
      localDemoNoteCount: 3,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('traces allowed denied visible and redacted parent teacher report fields', () => {
    const report =
      service.buildParentTeacherReportPermissionPrivacyRedactionReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:30:00.000Z',
      );
    const owningParent = report.permissionCaseRows.find(
      (row) => row.permissionCaseId === 'permission-case-parent-ava-own-child',
    );
    const nonOwningParent = report.permissionCaseRows.find(
      (row) =>
        row.permissionCaseId === 'permission-case-parent-minh-non-owning-ava',
    );
    const teacher = report.permissionCaseRows.find(
      (row) =>
        row.permissionCaseId === 'permission-case-teacher-mai-assigned-a1',
    );
    const teacherUnassigned = report.permissionCaseRows.find(
      (row) =>
        row.permissionCaseId ===
        'permission-case-teacher-mai-unassigned-phonics-denied',
    );
    const supportOps = report.permissionCaseRows.find(
      (row) =>
        row.permissionCaseId ===
        'permission-case-support-ops-lan-audit-read-only',
    );
    const parentRedacted = report.fieldVisibilityRows.find(
      (row) =>
        row.permissionCaseId === 'permission-case-parent-ava-own-child' &&
        row.visibility === 'REDACTED',
    );
    const teacherRedacted = report.fieldVisibilityRows.find(
      (row) =>
        row.permissionCaseId === 'permission-case-teacher-mai-assigned-a1' &&
        row.visibility === 'REDACTED',
    );
    const deniedFields = report.fieldVisibilityRows.filter(
      (row) =>
        row.permissionCaseId === 'permission-case-parent-minh-non-owning-ava',
    );
    const teacherUnassignedDeniedFields = report.fieldVisibilityRows.filter(
      (row) =>
        row.permissionCaseId ===
        'permission-case-teacher-mai-unassigned-phonics-denied',
    );
    const supportOpsDeniedFields = report.fieldVisibilityRows.filter(
      (row) =>
        row.permissionCaseId ===
          'permission-case-support-ops-lan-audit-read-only' &&
        row.visibility === 'DENIED',
    );

    expect(owningParent).toEqual(
      expect.objectContaining({
        actorId: 'guardian-ava-parent',
        actorRole: 'PARENT_GUARDIAN',
        reportScope: 'OWN_CHILD',
        permissionDecision: 'ALLOWED',
        targetChildProfileId: 'child-ava-demo',
        progressSummaryId: 'progress-access-enroll-ava-a1-active',
        visibleFieldCount: 4,
        redactedFieldCount: 1,
      }),
    );
    expect(owningParent?.relationshipTraceKey).toContain('guardian-ava-parent');
    expect(nonOwningParent).toEqual(
      expect.objectContaining({
        actorId: 'guardian-minh-parent',
        reportScope: 'NON_OWNING_CHILD',
        permissionDecision: 'DENIED',
        targetChildProfileId: 'child-ava-demo',
        visibleFieldCount: 0,
        deniedFieldCount: 3,
      }),
    );
    expect(nonOwningParent?.decisionReason).toContain('not linked');
    expect(teacher).toEqual(
      expect.objectContaining({
        actorId: 'content-owner-teacher-mai',
        actorRole: 'TEACHER',
        reportScope: 'ASSIGNED_CLASS',
        permissionDecision: 'ALLOWED',
        targetClassId: 'class-a1-june-weekday',
        visibleFieldCount: 4,
        redactedFieldCount: 1,
      }),
    );
    expect(teacherUnassigned).toEqual(
      expect.objectContaining({
        actorId: 'content-owner-teacher-mai',
        actorRole: 'TEACHER',
        reportScope: 'UNASSIGNED_CLASS',
        permissionDecision: 'DENIED',
        targetClassId: 'class-phonics-may-booster',
        visibleFieldCount: 0,
        deniedFieldCount: 3,
      }),
    );
    expect(teacherUnassigned?.decisionReason).toContain('not assigned');
    expect(supportOps).toEqual(
      expect.objectContaining({
        actorId: 'support-ops-auditor-lan',
        actorRole: 'SUPPORT_OPS',
        reportScope: 'SUPPORT_AUDIT_READ_ONLY',
        permissionDecision: 'ALLOWED',
        targetClassId: 'class-a1-june-weekday',
        visibleFieldCount: 3,
        deniedFieldCount: 1,
      }),
    );
    expect(supportOps?.decisionReason).toContain('read-only');
    expect(parentRedacted).toEqual(
      expect.objectContaining({
        fieldKey: 'teacherInternalSummary',
        fieldScope: 'TEACHER_INTERNAL',
        visibility: 'REDACTED',
        redactedValue: 'REDACTED_LOCAL_DEMO',
      }),
    );
    expect(parentRedacted?.reason).toContain('Parent report hides');
    expect(teacherRedacted).toEqual(
      expect.objectContaining({
        fieldKey: 'guardianEmail',
        fieldScope: 'GUARDIAN_PRIVATE',
        visibility: 'REDACTED',
        redactedValue: 'REDACTED_LOCAL_DEMO',
      }),
    );
    expect(teacherRedacted?.reason).toContain('redacts guardian email');
    expect(deniedFields).toHaveLength(3);
    expect(deniedFields.every((row) => row.visibility === 'DENIED')).toBe(true);
    expect(deniedFields.every((row) => Boolean(row.reason))).toBe(true);
    expect(teacherUnassignedDeniedFields).toHaveLength(3);
    expect(
      teacherUnassignedDeniedFields.every(
        (row) => row.visibility === 'DENIED' && Boolean(row.reason),
      ),
    ).toBe(true);
    expect(supportOpsDeniedFields).toEqual([
      expect.objectContaining({
        fieldKey: 'liveMutation',
        fieldScope: 'SUPPORT_AUDIT_MUTATION',
        redactedValue: 'DENIED_LOCAL_DEMO',
      }),
    ]);
    expect(
      report.permissionCaseRows.every(
        (row) =>
          row.relationshipTraceIds.length > 0 &&
          row.relationshipTraceKey.includes(row.actorId),
      ),
    ).toBe(true);
    expect(
      report.fieldVisibilityRows
        .filter((row) => row.visibility !== 'VISIBLE')
        .every((row) => Boolean(row.reason)),
    ).toBe(true);
  });

  it('renders parent teacher report permission privacy redaction Markdown evidence', () => {
    const report =
      service.buildParentTeacherReportPermissionPrivacyRedactionReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:30:00.000Z',
      );
    const markdown =
      service.toParentTeacherReportPermissionPrivacyRedactionMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Support/ops actors: 1');
    expect(markdown).toContain('Report permission cases: 6');
    expect(markdown).toContain('Allowed cases: 4');
    expect(markdown).toContain('Denied cases: 2');
    expect(markdown).toContain('Teacher unassigned denied cases: 1');
    expect(markdown).toContain('Support/ops audit read-only cases: 1');
    expect(markdown).toContain('Redacted fields: 2');
    expect(markdown).toContain('Denied fields: 7');
    expect(markdown).toContain('Parent-visible fields: 4');
    expect(markdown).toContain('Teacher/admin-visible fields: 8');
    expect(markdown).toContain('Support/ops-visible fields: 3');
    expect(markdown).toContain('## Permission Case Rows');
    expect(markdown).toContain('## Field Visibility Rows');
    expect(markdown).toContain(
      'permission-case-teacher-mai-unassigned-phonics-denied',
    );
    expect(markdown).toContain(
      'permission-case-support-ops-lan-audit-read-only',
    );
    expect(markdown).toContain('REDACTED_LOCAL_DEMO');
    expect(markdown).toContain('DENIED_LOCAL_DEMO');
    expect(markdown).toContain(
      '/v1/learning-local-demo/parent-teacher-report-permission-privacy-redaction-report',
    );
  });

  it('builds a fixture-only parent teacher report review queue message preview report', () => {
    const report =
      service.buildParentTeacherReportReviewQueueMessagePreviewReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:45:00.000Z',
      );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#parent-teacher-report-review-queue-message-preview',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.md',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      parentGuardianCount: 4,
      teacherCount: 3,
      courseCount: 2,
      reportSummaryCount: 1,
      permissionRedactionReferenceCount: 2,
      reviewQueueItemCount: 2,
      messagePreviewCount: 2,
      approvedPreviewCount: 1,
      heldPreviewCount: 1,
      redactionAwarePreviewCount: 2,
      reviewDecisionTraceCount: 2,
      casesWithStableRelationshipTraceCount: 2,
      heldOrNeedsEditWithReasonCount: 1,
      approvedWithPermissionRedactionEvidenceCount: 1,
      evidenceRowCount: 6,
      localDemoNoteCount: 3,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('traces approved and held report preview decisions to permission redaction evidence', () => {
    const report =
      service.buildParentTeacherReportReviewQueueMessagePreviewReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:45:00.000Z',
      );
    const approved = report.messagePreviewRows.find(
      (row) => row.previewDecision === 'APPROVED',
    );
    const held = report.messagePreviewRows.find(
      (row) => row.previewDecision === 'HELD_NEEDS_EDIT',
    );

    expect(approved).toEqual(
      expect.objectContaining({
        messagePreviewId: 'message-preview-ava-a1-parent-progress-approved',
        reviewQueueItemId:
          'review-queue-ava-a1-parent-progress-preview-approve',
        permissionCaseId: 'permission-case-parent-ava-own-child',
        permissionDecision: 'ALLOWED',
        permissionEvidenceReferenced: true,
        redactionEvidenceReferenced: true,
        notificationDeliveryUsed: false,
        aiProviderExecutionUsed: false,
        mutationUsed: false,
      }),
    );
    expect(approved?.redactedFieldVisibilityIds).toContain(
      'field-visibility-permission-case-parent-ava-own-child-teacherInternalSummary',
    );
    expect(approved?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'student-ava',
        'course-a1-starter',
        'report-summary-preview-progress-access-enroll-ava-a1-active',
        'permission-case-parent-ava-own-child',
        'review-queue-ava-a1-parent-progress-preview-approve',
        'message-preview-ava-a1-parent-progress-approved',
      ]),
    );

    expect(held).toEqual(
      expect.objectContaining({
        messagePreviewId: 'message-preview-ava-a1-non-owner-held',
        reviewQueueItemId: 'review-queue-ava-a1-non-owner-preview-held',
        permissionCaseId: 'permission-case-parent-minh-non-owning-ava',
        permissionDecision: 'DENIED',
        previewDecision: 'HELD_NEEDS_EDIT',
        permissionEvidenceReferenced: true,
        redactionEvidenceReferenced: true,
        notificationDeliveryUsed: false,
        aiProviderExecutionUsed: false,
        mutationUsed: false,
      }),
    );
    expect(held?.heldReason).toContain('not linked');
    expect(held?.messagePreview).toContain('HELD_LOCAL_DEMO');
    expect(held?.deniedFieldVisibilityIds).toHaveLength(3);
    expect(
      report.reviewQueueRows.every(
        (row) =>
          row.relationshipTraceIds.includes(row.studentId) &&
          row.relationshipTraceIds.includes(row.courseId) &&
          row.relationshipTraceIds.includes(row.reportSummaryId) &&
          row.relationshipTraceIds.includes(row.permissionCaseId) &&
          row.relationshipTraceIds.includes(row.reviewQueueItemId),
      ),
    ).toBe(true);
  });

  it('renders parent teacher report review queue message preview Markdown evidence', () => {
    const report =
      service.buildParentTeacherReportReviewQueueMessagePreviewReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:45:00.000Z',
      );
    const markdown =
      service.toParentTeacherReportReviewQueueMessagePreviewMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Review queue items: 2');
    expect(markdown).toContain('Approved previews: 1');
    expect(markdown).toContain('Held previews: 1');
    expect(markdown).toContain(
      'Approved with permission/redaction evidence: 1',
    );
    expect(markdown).toContain('## Permission Redaction References');
    expect(markdown).toContain('## Review Queue Rows');
    expect(markdown).toContain('## Message Preview Rows');
    expect(markdown).toContain('HELD_LOCAL_DEMO');
    expect(markdown).toContain(
      '/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report',
    );
  });

  it('builds a fixture-only parent portal approved report inbox read receipt report', () => {
    const report =
      service.buildParentPortalApprovedReportInboxReadReceiptReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T14:00:00.000Z',
      );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#parent-portal-approved-report-inbox-read-receipt',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.md',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      parentGuardianCount: 4,
      teacherCount: 3,
      courseCount: 2,
      approvedPreviewCount: 2,
      heldPreviewCount: 1,
      parentInboxItemCount: 3,
      visibleParentInboxItemCount: 2,
      hiddenHeldPreviewCount: 1,
      readAckEvidenceCount: 2,
      permissionRedactionReferenceCount: 3,
      parentInboxTraceCount: 3,
      visibleInboxItemsWithStableRelationshipTraceCount: 2,
      hiddenHeldPreviewsWithReasonCount: 1,
      visibleParentPreviewWithPermissionRedactionEvidenceCount: 2,
      alignedApprovedParentInboxEntryCount: 1,
      alignedParentReadReceiptCount: 1,
      stableAlignedReadReceiptTraceCount: 1,
      evidenceRowCount: 6,
      localDemoNoteCount: 3,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('shows only approved previews in the parent inbox and keeps held previews hidden', () => {
    const report =
      service.buildParentPortalApprovedReportInboxReadReceiptReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T14:00:00.000Z',
      );
    const visible = report.parentInboxRows.find((row) => row.parentVisible);
    const hidden = report.parentInboxRows.find((row) => row.hiddenFromParent);
    const readAck = report.readAckRows[0];

    expect(visible).toEqual(
      expect.objectContaining({
        parentInboxItemId:
          'parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
        messagePreviewId: 'message-preview-ava-a1-parent-progress-approved',
        reviewQueueItemId:
          'review-queue-ava-a1-parent-progress-preview-approve',
        inboxVisibility: 'VISIBLE_TO_PARENT',
        parentVisible: true,
        hiddenFromParent: false,
        hiddenReason: null,
        permissionDecision: 'ALLOWED',
        permissionEvidenceReferenced: true,
        redactionEvidenceReferenced: true,
        notificationDeliveryUsed: false,
        aiProviderExecutionUsed: false,
        mutationUsed: false,
      }),
    );
    expect(visible?.visibleSubject).toContain('Ava');
    expect(visible?.visibleBody).toContain('Ava is on track');
    expect(visible?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'student-ava',
        'course-a1-starter',
        'report-summary-preview-progress-access-enroll-ava-a1-active',
        'review-queue-ava-a1-parent-progress-preview-approve',
        'message-preview-ava-a1-parent-progress-approved',
        'parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
      ]),
    );

    expect(hidden).toEqual(
      expect.objectContaining({
        parentInboxItemId:
          'parent-inbox-hidden-held-message-preview-ava-a1-non-owner-held',
        messagePreviewId: 'message-preview-ava-a1-non-owner-held',
        reviewQueueItemId: 'review-queue-ava-a1-non-owner-preview-held',
        inboxVisibility: 'HIDDEN_HELD_REVIEW',
        parentVisible: false,
        hiddenFromParent: true,
        visibleSubject: null,
        visibleBody: null,
        permissionDecision: 'DENIED',
      }),
    );
    expect(hidden?.hiddenReason).toContain('not linked');
    expect(hidden?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'permission-case-parent-minh-non-owning-ava',
        'message-preview-ava-a1-non-owner-held',
        'parent-inbox-hidden-held-message-preview-ava-a1-non-owner-held',
      ]),
    );

    expect(readAck).toEqual(
      expect.objectContaining({
        readAckEvidenceId:
          'read-ack-parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
        parentInboxItemId:
          'parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
        messagePreviewId: 'message-preview-ava-a1-parent-progress-approved',
        readAckStatus: 'READ_ACKNOWLEDGED',
        notificationDeliveryUsed: false,
        mutationUsed: false,
      }),
    );
    expect(readAck.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
        'read-ack-parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
      ]),
    );
  });

  it('adds an aligned Minh A1 approved parent inbox row and read receipt for the MVP trace', () => {
    const report =
      service.buildParentPortalApprovedReportInboxReadReceiptReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T14:00:00.000Z',
      );
    const alignedInbox = report.parentInboxRows.find(
      (row) =>
        row.studentId === 'student-minh' &&
        row.courseId === 'course-a1-starter' &&
        row.parentVisible,
    );
    const alignedReadAck = report.readAckRows.find(
      (row) => row.parentInboxItemId === alignedInbox?.parentInboxItemId,
    );

    expect(report.totals).toEqual(
      expect.objectContaining({
        alignedApprovedParentInboxEntryCount: 1,
        alignedParentReadReceiptCount: 1,
        stableAlignedReadReceiptTraceCount: 1,
      }),
    );
    expect(alignedInbox).toEqual(
      expect.objectContaining({
        parentInboxItemId:
          'parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
        messagePreviewId: 'message-preview-minh-a1-parent-progress-approved',
        reviewQueueItemId:
          'review-queue-minh-a1-parent-progress-preview-approve',
        reportSummaryId:
          'report-summary-preview-progress-access-enroll-minh-a1-pending',
        permissionCaseId: 'permission-case-parent-minh-own-child-aligned',
        studentId: 'student-minh',
        childProfileId: 'child-minh-demo',
        courseId: 'course-a1-starter',
        parentGuardianId: 'guardian-minh-parent',
        inboxVisibility: 'VISIBLE_TO_PARENT',
        permissionDecision: 'ALLOWED',
        permissionEvidenceReferenced: true,
        redactionEvidenceReferenced: true,
        notificationDeliveryUsed: false,
        mutationUsed: false,
      }),
    );
    expect(alignedInbox?.visibleBody).toContain('Minh Tran cannot open');
    expect(alignedInbox?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'student-minh',
        'course-a1-starter',
        'progress-access-enroll-minh-a1-pending',
        'parent-access-summary-guardian-minh-parent-enroll-minh-a1-pending',
        'permission-case-parent-minh-own-child-aligned',
        'parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
      ]),
    );
    expect(alignedReadAck).toEqual(
      expect.objectContaining({
        readAckEvidenceId:
          'read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
        studentId: 'student-minh',
        childProfileId: 'child-minh-demo',
        parentGuardianId: 'guardian-minh-parent',
        readAckStatus: 'READ_ACKNOWLEDGED',
        notificationDeliveryUsed: false,
        mutationUsed: false,
      }),
    );
    expect(alignedReadAck?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'student-minh',
        'course-a1-starter',
        'parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
        'read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
      ]),
    );
  });

  it('renders parent portal approved report inbox read receipt Markdown evidence', () => {
    const report =
      service.buildParentPortalApprovedReportInboxReadReceiptReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T14:00:00.000Z',
      );
    const markdown =
      service.toParentPortalApprovedReportInboxReadReceiptMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Parent inbox items: 3');
    expect(markdown).toContain('Visible parent inbox items: 2');
    expect(markdown).toContain('Hidden held previews: 1');
    expect(markdown).toContain('Read/ack evidence: 2');
    expect(markdown).toContain(
      'Aligned approved Minh/course A1 inbox entries: 1',
    );
    expect(markdown).toContain('Aligned Minh/course A1 read receipts: 1');
    expect(markdown).toContain('## Parent Inbox Rows');
    expect(markdown).toContain('## Read/Ack Rows');
    expect(markdown).toContain('HIDDEN_LOCAL_DEMO');
    expect(markdown).toContain(
      '/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report',
    );
  });
});
