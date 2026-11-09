import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningParentTeacherReportFieldVisibilityRow,
  DemoLearningParentTeacherReportPermissionCaseRow,
  DemoLearningParentTeacherReportPermissionPrivacyRedactionEvidenceRow,
  DemoLearningParentTeacherReportPermissionPrivacyRedactionReport,
  DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety,
} from '../learning-local-demo.types';
import { buildParentTeacherProgressAccessSummaryReport } from './parent-teacher-progress-access-summary.report';
import { requireContentOwner, requireGuardian } from './shared';

export function buildParentTeacherReportPermissionPrivacyRedactionReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningParentTeacherReportPermissionPrivacyRedactionReport {
  const progressAccessReport = buildParentTeacherProgressAccessSummaryReport(
    fixture,
    generatedAt,
  );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );
  const contentOwnersById = new Map(
    fixture.contentOwners.map((owner) => [owner.id, owner]),
  );

  const requireProgressRow = (studentId: string) => {
    const row = progressAccessReport.progressRows.find(
      (progressRow) => progressRow.studentId === studentId,
    );
    if (!row) {
      throw new Error(
        `Missing local demo progress access row for ${studentId}`,
      );
    }

    return row;
  };
  const requireParentSummaryRow = (guardianId: string, studentId: string) => {
    const row = progressAccessReport.parentSummaryRows.find(
      (summaryRow) =>
        summaryRow.parentGuardianId === guardianId &&
        summaryRow.studentId === studentId,
    );
    if (!row) {
      throw new Error(
        `Missing local demo parent summary for ${guardianId} and ${studentId}`,
      );
    }

    return row;
  };
  const requireTeacherSummaryRow = (ownerId: string, classId: string) => {
    const row = progressAccessReport.teacherSummaryRows.find(
      (summaryRow) =>
        summaryRow.teacherOwnerId === ownerId && summaryRow.classId === classId,
    );
    if (!row) {
      throw new Error(
        `Missing local demo teacher summary for ${ownerId} and ${classId}`,
      );
    }

    return row;
  };

  const avaProgress = requireProgressRow('student-ava');
  const avaParent = requireGuardian(guardiansById, 'guardian-ava-parent');
  const minhParent = requireGuardian(guardiansById, 'guardian-minh-parent');
  const avaParentSummary = requireParentSummaryRow(
    avaParent.id,
    avaProgress.studentId,
  );
  const teacherMai = requireContentOwner(
    contentOwnersById,
    'content-owner-teacher-mai',
  );
  const teacherHanh = requireContentOwner(
    contentOwnersById,
    'content-owner-teacher-hanh',
  );
  const adminHoa = requireContentOwner(
    contentOwnersById,
    'content-owner-admin-hoa',
  );
  const teacherMaiSummary = requireTeacherSummaryRow(
    teacherMai.id,
    'class-a1-june-weekday',
  );
  const adminHoaSummary = requireTeacherSummaryRow(
    adminHoa.id,
    'class-phonics-may-booster',
  );
  const teacherHanhSummary = requireTeacherSummaryRow(
    teacherHanh.id,
    'class-phonics-may-booster',
  );
  const supportOpsAuditor = {
    id: 'support-ops-auditor-lan',
    displayName: 'Support Ops Lan',
    email: 'support.ops.lan@example.test',
  };

  const permissionCaseInputs = [
    {
      permissionCaseId: 'permission-case-parent-ava-own-child',
      actorId: avaParent.id,
      actorName: avaParent.displayName,
      actorEmail: avaParent.email,
      actorRole: 'PARENT_GUARDIAN' as const,
      reportScope: 'OWN_CHILD' as const,
      permissionDecision: 'ALLOWED' as const,
      decisionReason:
        'Fixture guardian is linked to child-ava-demo; parent-facing fields are visible while teacher-internal fields stay redacted.',
      targetStudentId: avaProgress.studentId,
      targetChildProfileId: avaProgress.childProfileId,
      targetStudentName: avaProgress.studentName,
      targetCourseId: avaProgress.courseId,
      targetCourseCode: avaProgress.courseCode,
      targetClassId: avaProgress.classId,
      targetClassCode: avaProgress.classCode,
      progressSummaryId: avaProgress.progressSummaryId,
      sourceParentSummaryId: avaParentSummary.parentSummaryId,
      sourceTeacherSummaryId: null,
      sourceAccessStatus: avaProgress.accessStatus,
      relationshipTraceKey: [
        avaParent.id,
        avaProgress.relationshipKey,
        avaProgress.progressSummaryId,
        'permission-allowed-own-child',
      ].join('->'),
      relationshipTraceIds: [
        avaParent.id,
        avaProgress.relationshipKey,
        avaProgress.progressEvidenceKey,
        avaParentSummary.relationshipTraceKey,
      ],
      caseSummary:
        'Ava Parent can see Ava report fields that are parent-facing; teacher-only narrative is redacted.',
      fields: [
        {
          fieldKey: 'studentName',
          fieldLabel: 'Student name',
          fieldScope: 'PARENT_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: avaProgress.studentName,
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'courseCode',
          fieldLabel: 'Course code',
          fieldScope: 'PARENT_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: avaProgress.courseCode,
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'accessStatus',
          fieldLabel: 'Daily plan access status',
          fieldScope: 'PARENT_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: avaProgress.accessStatus,
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'completionPercent',
          fieldLabel: 'Completion percent',
          fieldScope: 'PARENT_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: `${avaProgress.completionPercent}%`,
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'teacherInternalSummary',
          fieldLabel: 'Teacher internal summary',
          fieldScope: 'TEACHER_INTERNAL' as const,
          visibility: 'REDACTED' as const,
          visibleValue: null,
          redactedValue: 'REDACTED_LOCAL_DEMO',
          reason:
            'Parent report hides teacher/admin internal notes until a parent-facing digest is approved.',
        },
      ],
    },
    {
      permissionCaseId: 'permission-case-parent-minh-non-owning-ava',
      actorId: minhParent.id,
      actorName: minhParent.displayName,
      actorEmail: minhParent.email,
      actorRole: 'PARENT_GUARDIAN' as const,
      reportScope: 'NON_OWNING_CHILD' as const,
      permissionDecision: 'DENIED' as const,
      decisionReason:
        'Fixture guardian guardian-minh-parent is not linked to child-ava-demo, so Ava report fields are denied.',
      targetStudentId: avaProgress.studentId,
      targetChildProfileId: avaProgress.childProfileId,
      targetStudentName: avaProgress.studentName,
      targetCourseId: avaProgress.courseId,
      targetCourseCode: avaProgress.courseCode,
      targetClassId: avaProgress.classId,
      targetClassCode: avaProgress.classCode,
      progressSummaryId: avaProgress.progressSummaryId,
      sourceParentSummaryId: avaParentSummary.parentSummaryId,
      sourceTeacherSummaryId: null,
      sourceAccessStatus: 'DENIED_SCOPE' as const,
      relationshipTraceKey: [
        minhParent.id,
        avaProgress.studentId,
        avaProgress.courseId,
        avaProgress.progressSummaryId,
        'permission-denied-non-owner',
      ].join('->'),
      relationshipTraceIds: [
        minhParent.id,
        avaProgress.childProfileId,
        avaProgress.relationshipKey,
        avaProgress.progressSummaryId,
      ],
      caseSummary:
        'Minh Parent cannot see Ava report fields because there is no fixture child relationship.',
      fields: [
        {
          fieldKey: 'studentName',
          fieldLabel: 'Student name',
          fieldScope: 'NON_OWNING_CHILD_PRIVATE' as const,
          visibility: 'DENIED' as const,
          visibleValue: null,
          redactedValue: 'DENIED_LOCAL_DEMO',
          reason: 'Guardian childProfileIds does not include child-ava-demo.',
        },
        {
          fieldKey: 'courseCode',
          fieldLabel: 'Course code',
          fieldScope: 'NON_OWNING_CHILD_PRIVATE' as const,
          visibility: 'DENIED' as const,
          visibleValue: null,
          redactedValue: 'DENIED_LOCAL_DEMO',
          reason:
            'Non-owning parent has no local-demo report scope for Ava course data.',
        },
        {
          fieldKey: 'completionPercent',
          fieldLabel: 'Completion percent',
          fieldScope: 'NON_OWNING_CHILD_PRIVATE' as const,
          visibility: 'DENIED' as const,
          visibleValue: null,
          redactedValue: 'DENIED_LOCAL_DEMO',
          reason:
            'Non-owning parent has no local-demo report scope for Ava progress data.',
        },
      ],
    },
    {
      permissionCaseId: 'permission-case-teacher-mai-assigned-a1',
      actorId: teacherMai.id,
      actorName: teacherMai.displayName,
      actorEmail: teacherMai.email,
      actorRole: 'TEACHER' as const,
      reportScope: 'ASSIGNED_CLASS' as const,
      permissionDecision: 'ALLOWED' as const,
      decisionReason:
        'Fixture teacher is assigned to class-a1-june-weekday; class report fields are visible while guardian private contact is redacted.',
      targetStudentId: null,
      targetChildProfileId: null,
      targetStudentName: null,
      targetCourseId: teacherMaiSummary.courseId,
      targetCourseCode: teacherMaiSummary.courseCode,
      targetClassId: teacherMaiSummary.classId,
      targetClassCode: teacherMaiSummary.classCode,
      progressSummaryId: null,
      sourceParentSummaryId: null,
      sourceTeacherSummaryId: teacherMaiSummary.teacherSummaryId,
      sourceAccessStatus: 'CLASS_SCOPE' as const,
      relationshipTraceKey: [
        teacherMai.id,
        teacherMaiSummary.classId,
        teacherMaiSummary.courseId,
        teacherMaiSummary.teacherSummaryId,
        'permission-allowed-assigned-class',
      ].join('->'),
      relationshipTraceIds: [
        teacherMaiSummary.relationshipTraceKey,
        ...teacherMaiSummary.relationshipTraceIds,
      ],
      caseSummary:
        'Teacher Mai sees assigned A1 class progress evidence and blocked reasons; guardian private contact is redacted.',
      fields: [
        {
          fieldKey: 'classCode',
          fieldLabel: 'Class code',
          fieldScope: 'TEACHER_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: teacherMaiSummary.classCode,
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'studentCount',
          fieldLabel: 'Student count',
          fieldScope: 'TEACHER_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: String(teacherMaiSummary.studentCount),
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'blockedReasonCount',
          fieldLabel: 'Blocked reason count',
          fieldScope: 'TEACHER_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: String(teacherMaiSummary.blockedReasonCount),
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'progressSummaryIds',
          fieldLabel: 'Progress summary IDs',
          fieldScope: 'TEACHER_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: teacherMaiSummary.progressSummaryIds.join(', '),
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'guardianEmail',
          fieldLabel: 'Guardian email',
          fieldScope: 'GUARDIAN_PRIVATE' as const,
          visibility: 'REDACTED' as const,
          visibleValue: null,
          redactedValue: 'REDACTED_LOCAL_DEMO',
          reason:
            'Teacher class report redacts guardian email; contact workflows stay outside this local-demo evidence slice.',
        },
      ],
    },
    {
      permissionCaseId: 'permission-case-teacher-mai-unassigned-phonics-denied',
      actorId: teacherMai.id,
      actorName: teacherMai.displayName,
      actorEmail: teacherMai.email,
      actorRole: 'TEACHER' as const,
      reportScope: 'UNASSIGNED_CLASS' as const,
      permissionDecision: 'DENIED' as const,
      decisionReason:
        'Fixture teacher content-owner-teacher-mai is not assigned to class-phonics-may-booster, so phonics class report fields are denied.',
      targetStudentId: null,
      targetChildProfileId: null,
      targetStudentName: null,
      targetCourseId: teacherHanhSummary.courseId,
      targetCourseCode: teacherHanhSummary.courseCode,
      targetClassId: teacherHanhSummary.classId,
      targetClassCode: teacherHanhSummary.classCode,
      progressSummaryId: null,
      sourceParentSummaryId: null,
      sourceTeacherSummaryId: teacherHanhSummary.teacherSummaryId,
      sourceAccessStatus: 'DENIED_SCOPE' as const,
      relationshipTraceKey: [
        teacherMai.id,
        teacherHanhSummary.classId,
        teacherHanhSummary.teacherSummaryId,
        'permission-denied-unassigned-class',
      ].join('->'),
      relationshipTraceIds: [
        teacherMai.id,
        teacherHanh.id,
        teacherHanhSummary.relationshipTraceKey,
        ...teacherHanhSummary.relationshipTraceIds,
      ],
      caseSummary:
        'Teacher Mai cannot see Teacher Hanh phonics class report fields because the fixture class assignment is out of scope.',
      fields: [
        {
          fieldKey: 'classCode',
          fieldLabel: 'Class code',
          fieldScope: 'UNASSIGNED_CLASS_PRIVATE' as const,
          visibility: 'DENIED' as const,
          visibleValue: null,
          redactedValue: 'DENIED_LOCAL_DEMO',
          reason:
            'Teacher Mai classIds does not include class-phonics-may-booster.',
        },
        {
          fieldKey: 'studentCount',
          fieldLabel: 'Student count',
          fieldScope: 'UNASSIGNED_CLASS_PRIVATE' as const,
          visibility: 'DENIED' as const,
          visibleValue: null,
          redactedValue: 'DENIED_LOCAL_DEMO',
          reason:
            'Unassigned teacher has no local-demo roster scope for the phonics class.',
        },
        {
          fieldKey: 'progressSummaryIds',
          fieldLabel: 'Progress summary IDs',
          fieldScope: 'UNASSIGNED_CLASS_PRIVATE' as const,
          visibility: 'DENIED' as const,
          visibleValue: null,
          redactedValue: 'DENIED_LOCAL_DEMO',
          reason:
            'Unassigned teacher cannot read phonics learner progress summaries in the fixture matrix.',
        },
      ],
    },
    {
      permissionCaseId: 'permission-case-admin-hoa-phonics-class',
      actorId: adminHoa.id,
      actorName: adminHoa.displayName,
      actorEmail: adminHoa.email,
      actorRole: 'ADMIN' as const,
      reportScope: 'ADMIN_CLASS' as const,
      permissionDecision: 'ALLOWED' as const,
      decisionReason:
        'Fixture admin has local-demo class scope for class-phonics-may-booster and sees read-only class report fields.',
      targetStudentId: null,
      targetChildProfileId: null,
      targetStudentName: null,
      targetCourseId: adminHoaSummary.courseId,
      targetCourseCode: adminHoaSummary.courseCode,
      targetClassId: adminHoaSummary.classId,
      targetClassCode: adminHoaSummary.classCode,
      progressSummaryId: null,
      sourceParentSummaryId: null,
      sourceTeacherSummaryId: adminHoaSummary.teacherSummaryId,
      sourceAccessStatus: 'CLASS_SCOPE' as const,
      relationshipTraceKey: [
        adminHoa.id,
        adminHoaSummary.classId,
        adminHoaSummary.courseId,
        adminHoaSummary.teacherSummaryId,
        'permission-allowed-admin-class',
      ].join('->'),
      relationshipTraceIds: [
        adminHoaSummary.relationshipTraceKey,
        ...adminHoaSummary.relationshipTraceIds,
      ],
      caseSummary:
        'Admin Hoa sees the phonics class evidence in read-only local-demo scope.',
      fields: [
        {
          fieldKey: 'classCode',
          fieldLabel: 'Class code',
          fieldScope: 'ADMIN_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: adminHoaSummary.classCode,
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'courseCode',
          fieldLabel: 'Course code',
          fieldScope: 'ADMIN_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: adminHoaSummary.courseCode,
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'studentCount',
          fieldLabel: 'Student count',
          fieldScope: 'ADMIN_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: String(adminHoaSummary.studentCount),
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'averageCompletionPercent',
          fieldLabel: 'Average completion percent',
          fieldScope: 'ADMIN_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: `${adminHoaSummary.averageCompletionPercent}%`,
          redactedValue: null,
          reason: null,
        },
      ],
    },
    {
      permissionCaseId: 'permission-case-support-ops-lan-audit-read-only',
      actorId: supportOpsAuditor.id,
      actorName: supportOpsAuditor.displayName,
      actorEmail: supportOpsAuditor.email,
      actorRole: 'SUPPORT_OPS' as const,
      reportScope: 'SUPPORT_AUDIT_READ_ONLY' as const,
      permissionDecision: 'ALLOWED' as const,
      decisionReason:
        'Fixture support/ops actor can inspect read-only audit fields for class-a1-june-weekday while live mutations remain denied.',
      targetStudentId: null,
      targetChildProfileId: null,
      targetStudentName: null,
      targetCourseId: teacherMaiSummary.courseId,
      targetCourseCode: teacherMaiSummary.courseCode,
      targetClassId: teacherMaiSummary.classId,
      targetClassCode: teacherMaiSummary.classCode,
      progressSummaryId: null,
      sourceParentSummaryId: null,
      sourceTeacherSummaryId: teacherMaiSummary.teacherSummaryId,
      sourceAccessStatus: 'SUPPORT_AUDIT_SCOPE' as const,
      relationshipTraceKey: [
        supportOpsAuditor.id,
        teacherMaiSummary.classId,
        teacherMaiSummary.teacherSummaryId,
        'permission-allowed-support-ops-audit-read-only',
      ].join('->'),
      relationshipTraceIds: [
        supportOpsAuditor.id,
        teacherMaiSummary.relationshipTraceKey,
        ...teacherMaiSummary.relationshipTraceIds,
      ],
      caseSummary:
        'Support Ops Lan can review class-level blocked reason and trace evidence, but mutation/write controls are denied in local-demo scope.',
      fields: [
        {
          fieldKey: 'classCode',
          fieldLabel: 'Class code',
          fieldScope: 'SUPPORT_AUDIT_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: teacherMaiSummary.classCode,
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'blockedReasonCount',
          fieldLabel: 'Blocked reason count',
          fieldScope: 'SUPPORT_AUDIT_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: String(teacherMaiSummary.blockedReasonCount),
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'auditTraceKey',
          fieldLabel: 'Audit trace key',
          fieldScope: 'SUPPORT_AUDIT_VISIBLE' as const,
          visibility: 'VISIBLE' as const,
          visibleValue: teacherMaiSummary.relationshipTraceKey,
          redactedValue: null,
          reason: null,
        },
        {
          fieldKey: 'liveMutation',
          fieldLabel: 'Live mutation',
          fieldScope: 'SUPPORT_AUDIT_MUTATION' as const,
          visibility: 'DENIED' as const,
          visibleValue: null,
          redactedValue: 'DENIED_LOCAL_DEMO',
          reason:
            'Support/ops audit case is read-only and cannot mutate students, reports, entitlements, payments, or ERP records.',
        },
      ],
    },
  ];

  const fieldVisibilityRows =
    permissionCaseInputs.flatMap<DemoLearningParentTeacherReportFieldVisibilityRow>(
      (permissionCase) =>
        permissionCase.fields.map((field) => {
          const relationshipTraceKey = [
            permissionCase.relationshipTraceKey,
            field.fieldKey,
            field.visibility,
          ].join('->');

          return {
            fieldVisibilityId: `field-visibility-${permissionCase.permissionCaseId}-${field.fieldKey}`,
            permissionCaseId: permissionCase.permissionCaseId,
            actorId: permissionCase.actorId,
            actorRole: permissionCase.actorRole,
            fieldKey: field.fieldKey,
            fieldLabel: field.fieldLabel,
            fieldScope: field.fieldScope,
            visibility: field.visibility,
            visibleValue: field.visibleValue,
            redactedValue: field.redactedValue,
            reason: field.reason,
            relationshipTraceKey,
            relationshipTraceIds: [
              ...permissionCase.relationshipTraceIds,
              relationshipTraceKey,
            ],
            fixtureOnly: true,
            providerUsed: false,
            mutationUsed: false,
          } satisfies DemoLearningParentTeacherReportFieldVisibilityRow;
        }),
    );

  const permissionCaseRows =
    permissionCaseInputs.map<DemoLearningParentTeacherReportPermissionCaseRow>(
      (permissionCase) => {
        const caseFields = fieldVisibilityRows.filter(
          (field) => field.permissionCaseId === permissionCase.permissionCaseId,
        );

        return {
          permissionCaseId: permissionCase.permissionCaseId,
          actorId: permissionCase.actorId,
          actorName: permissionCase.actorName,
          actorEmail: permissionCase.actorEmail,
          actorRole: permissionCase.actorRole,
          reportScope: permissionCase.reportScope,
          permissionDecision: permissionCase.permissionDecision,
          decisionReason: permissionCase.decisionReason,
          targetStudentId: permissionCase.targetStudentId,
          targetChildProfileId: permissionCase.targetChildProfileId,
          targetStudentName: permissionCase.targetStudentName,
          targetCourseId: permissionCase.targetCourseId,
          targetCourseCode: permissionCase.targetCourseCode,
          targetClassId: permissionCase.targetClassId,
          targetClassCode: permissionCase.targetClassCode,
          progressSummaryId: permissionCase.progressSummaryId,
          sourceParentSummaryId: permissionCase.sourceParentSummaryId,
          sourceTeacherSummaryId: permissionCase.sourceTeacherSummaryId,
          sourceAccessStatus: permissionCase.sourceAccessStatus,
          relationshipTraceKey: permissionCase.relationshipTraceKey,
          relationshipTraceIds: permissionCase.relationshipTraceIds,
          visibleFieldCount: caseFields.filter(
            (field) => field.visibility === 'VISIBLE',
          ).length,
          redactedFieldCount: caseFields.filter(
            (field) => field.visibility === 'REDACTED',
          ).length,
          deniedFieldCount: caseFields.filter(
            (field) => field.visibility === 'DENIED',
          ).length,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          caseSummary: permissionCase.caseSummary,
        } satisfies DemoLearningParentTeacherReportPermissionCaseRow;
      },
    );

  const visibleFields = fieldVisibilityRows.filter(
    (field) => field.visibility === 'VISIBLE',
  );
  const redactedFields = fieldVisibilityRows.filter(
    (field) => field.visibility === 'REDACTED',
  );
  const deniedFields = fieldVisibilityRows.filter(
    (field) => field.visibility === 'DENIED',
  );
  const remainingLocalDemoNotes = [
    'Report permission rows are fixture-only and do not alter production authentication, authorization, or privacy policy.',
    'Parent and teacher/admin actors use existing local-demo guardians and content owners; support/ops audit uses a deterministic read-only fixture actor.',
    'Denied and redacted rows expose reasons for review while hiding field values from out-of-scope actors.',
  ];
  const safety = {
    ...progressAccessReport.safety,
  } satisfies DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety;
  const safetyEntries = Object.entries(safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
      return value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;
  const evidenceRows: DemoLearningParentTeacherReportPermissionPrivacyRedactionEvidenceRow[] =
    [
      {
        evidenceKind: 'PARENT_ALLOWED_REPORT_SCOPE',
        evidenceCount: permissionCaseRows.filter(
          (row) =>
            row.actorRole === 'PARENT_GUARDIAN' &&
            row.permissionDecision === 'ALLOWED',
        ).length,
        stableFixtureIds: permissionCaseRows
          .filter(
            (row) =>
              row.actorRole === 'PARENT_GUARDIAN' &&
              row.permissionDecision === 'ALLOWED',
          )
          .map((row) => row.relationshipTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Owning parent can see parent-facing child report fields through guardian-child fixture links.',
      },
      {
        evidenceKind: 'PARENT_DENIED_NON_OWNER_SCOPE',
        evidenceCount: permissionCaseRows.filter(
          (row) => row.reportScope === 'NON_OWNING_CHILD',
        ).length,
        stableFixtureIds: permissionCaseRows
          .filter((row) => row.reportScope === 'NON_OWNING_CHILD')
          .map((row) => row.relationshipTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Non-owning parent request is denied with explicit local-demo relationship reason.',
      },
      {
        evidenceKind: 'TEACHER_ASSIGNED_CLASS_SCOPE',
        evidenceCount: permissionCaseRows.filter(
          (row) => row.reportScope === 'ASSIGNED_CLASS',
        ).length,
        stableFixtureIds: permissionCaseRows
          .filter((row) => row.reportScope === 'ASSIGNED_CLASS')
          .map((row) => row.relationshipTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Assigned teacher sees class progress report fields while guardian private contact is redacted.',
      },
      {
        evidenceKind: 'TEACHER_DENIED_UNASSIGNED_CLASS_SCOPE',
        evidenceCount: permissionCaseRows.filter(
          (row) => row.reportScope === 'UNASSIGNED_CLASS',
        ).length,
        stableFixtureIds: permissionCaseRows
          .filter((row) => row.reportScope === 'UNASSIGNED_CLASS')
          .map((row) => row.relationshipTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Unassigned teacher request is denied with explicit class-scope reason and denied field rows.',
      },
      {
        evidenceKind: 'ADMIN_CLASS_SCOPE',
        evidenceCount: permissionCaseRows.filter(
          (row) => row.reportScope === 'ADMIN_CLASS',
        ).length,
        stableFixtureIds: permissionCaseRows
          .filter((row) => row.reportScope === 'ADMIN_CLASS')
          .map((row) => row.relationshipTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Fixture admin sees read-only class report fields through existing content owner class scope.',
      },
      {
        evidenceKind: 'SUPPORT_OPS_AUDIT_READ_ONLY_SCOPE',
        evidenceCount: permissionCaseRows.filter(
          (row) => row.reportScope === 'SUPPORT_AUDIT_READ_ONLY',
        ).length,
        stableFixtureIds: permissionCaseRows
          .filter((row) => row.reportScope === 'SUPPORT_AUDIT_READ_ONLY')
          .map((row) => row.relationshipTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Support/ops actor has explicit audited read-only report scope and denied mutation evidence.',
      },
      {
        evidenceKind: 'FIELD_VISIBILITY_REDACTION',
        evidenceCount: redactedFields.length + deniedFields.length,
        stableFixtureIds: [...redactedFields, ...deniedFields].map(
          (row) => row.fieldVisibilityId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Every redacted or denied field row carries a stable trace key and reason.',
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
      'Learning local demo Parent/Teacher Report Permission Privacy Redaction Report',
    generatedFor:
      'local-demo-parent-teacher-report-permission-privacy-redaction-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/parent-teacher-report-permission-privacy-redaction-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#parent-teacher-report-permission-privacy-redaction',
    jsonExportPath:
      'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json',
    markdownExportPath:
      'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Parent/teacher report permission and privacy redaction evidence is fixture-only, read-only, and deterministic.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: fixture.students.length,
      parentGuardianCount: fixture.parentGuardians.length,
      teacherCount: fixture.contentOwners.filter(
        (owner) => owner.role === 'TEACHER' || owner.role === 'ADMIN',
      ).length,
      supportOpsCount: permissionCaseRows.filter(
        (row) => row.actorRole === 'SUPPORT_OPS',
      ).length,
      courseCount: fixture.courses.length,
      reportPermissionCaseCount: permissionCaseRows.length,
      allowedReportCaseCount: permissionCaseRows.filter(
        (row) => row.permissionDecision === 'ALLOWED',
      ).length,
      deniedReportCaseCount: permissionCaseRows.filter(
        (row) => row.permissionDecision === 'DENIED',
      ).length,
      teacherUnassignedDeniedCaseCount: permissionCaseRows.filter(
        (row) =>
          row.actorRole === 'TEACHER' &&
          row.reportScope === 'UNASSIGNED_CLASS' &&
          row.permissionDecision === 'DENIED',
      ).length,
      supportOpsAuditReadOnlyCaseCount: permissionCaseRows.filter(
        (row) =>
          row.actorRole === 'SUPPORT_OPS' &&
          row.reportScope === 'SUPPORT_AUDIT_READ_ONLY' &&
          row.permissionDecision === 'ALLOWED',
      ).length,
      visibleFieldCount: visibleFields.length,
      redactedFieldCount: redactedFields.length,
      deniedFieldCount: deniedFields.length,
      parentVisibleFieldCount: visibleFields.filter(
        (row) => row.actorRole === 'PARENT_GUARDIAN',
      ).length,
      teacherVisibleFieldCount: visibleFields.filter(
        (row) => row.actorRole === 'TEACHER' || row.actorRole === 'ADMIN',
      ).length,
      supportOpsVisibleFieldCount: visibleFields.filter(
        (row) => row.actorRole === 'SUPPORT_OPS',
      ).length,
      parentRedactedFieldCount: redactedFields.filter(
        (row) => row.actorRole === 'PARENT_GUARDIAN',
      ).length,
      teacherRedactedFieldCount: redactedFields.filter(
        (row) => row.actorRole === 'TEACHER' || row.actorRole === 'ADMIN',
      ).length,
      supportOpsDeniedFieldCount: deniedFields.filter(
        (row) => row.actorRole === 'SUPPORT_OPS',
      ).length,
      permissionTraceCount: permissionCaseRows.filter(
        (row) => row.relationshipTraceIds.length > 0,
      ).length,
      casesWithTraceCount: permissionCaseRows.filter(
        (row) =>
          row.relationshipTraceIds.length > 0 &&
          row.relationshipTraceKey.includes(row.actorId),
      ).length,
      deniedOrRedactedCaseWithReasonCount: permissionCaseRows.filter(
        (row) =>
          (row.permissionDecision === 'DENIED' ||
            row.redactedFieldCount > 0 ||
            row.deniedFieldCount > 0) &&
          Boolean(row.decisionReason),
      ).length,
      redactedOrDeniedFieldWithReasonCount: [
        ...redactedFields,
        ...deniedFields,
      ].filter((field) => Boolean(field.reason)).length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    permissionCaseRows,
    fieldVisibilityRows,
    evidenceRows,
  };
}
