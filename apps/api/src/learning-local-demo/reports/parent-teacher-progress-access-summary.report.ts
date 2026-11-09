import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningContentOwner,
  DemoLearningCoreFixture,
  DemoLearningParentTeacherProgressAccessEvidenceRow,
  DemoLearningParentTeacherProgressAccessRow,
  DemoLearningParentTeacherProgressAccessSummaryReport,
  DemoLearningParentTeacherProgressAccessSummarySafety,
  DemoLearningParentTeacherProgressParentSummaryRow,
  DemoLearningParentTeacherProgressTeacherSummaryRow,
} from '../learning-local-demo.types';
import {
  averagePercent,
  requireClass,
  requireCourseById,
  requireDailyPlan,
  requireGuardian,
  requireGuardianByChildProfileId,
  requirePracticeAttempt,
  requireProgress,
  requireVideoEvidence,
} from './shared';
import { buildSubscriptionEntitlementDailyPlanAccessReport } from './subscription-entitlement-daily-plan-access.report';

export function buildParentTeacherProgressAccessSummaryReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = '2026-06-30T13:00:00.000Z',
): DemoLearningParentTeacherProgressAccessSummaryReport {
  const accessReport = buildSubscriptionEntitlementDailyPlanAccessReport(
    fixture,
    generatedAt,
  );
  const guardiansByChildProfileId = new Map(
    fixture.parentGuardians.flatMap((guardian) =>
      guardian.childProfileIds.map(
        (childProfileId) => [childProfileId, guardian] as const,
      ),
    ),
  );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );
  const classesById = new Map(
    fixture.classes.map((classCohort) => [classCohort.id, classCohort]),
  );
  const coursesById = new Map(
    fixture.courses.map((course) => [course.id, course]),
  );
  const progressByEnrollmentId = new Map(
    fixture.progress.map((progress) => [progress.enrollmentId, progress]),
  );
  const dailyPlansById = new Map(
    fixture.dailyPlans.map((plan) => [plan.id, plan]),
  );
  const videoEvidenceByDailyPlanId = new Map(
    fixture.videoEvidence.map((evidence) => [evidence.dailyPlanId, evidence]),
  );
  const practiceAttemptByDailyPlanId = new Map(
    fixture.practiceAttempts.map((attempt) => [attempt.dailyPlanId, attempt]),
  );
  const teacherOwners = fixture.contentOwners.filter(
    (owner) => owner.role === 'TEACHER' || owner.role === 'ADMIN',
  );
  const teacherOwnersByClassId = new Map<string, DemoLearningContentOwner[]>();

  for (const owner of teacherOwners) {
    for (const classId of owner.classIds) {
      const owners = teacherOwnersByClassId.get(classId) ?? [];
      owners.push(owner);
      teacherOwnersByClassId.set(classId, owners);
    }
  }

  const progressRows = accessReport.accessRows
    .map((accessRow) => {
      const guardian = requireGuardianByChildProfileId(
        guardiansByChildProfileId,
        accessRow.childProfileId,
      );
      const progress = requireProgress(
        progressByEnrollmentId,
        accessRow.enrollmentId,
      );
      const dailyPlan = requireDailyPlan(dailyPlansById, accessRow.dailyPlanId);
      const classCohort = requireClass(classesById, dailyPlan.classId);
      const videoEvidence = requireVideoEvidence(
        videoEvidenceByDailyPlanId,
        dailyPlan.id,
      );
      const practiceAttempt = requirePracticeAttempt(
        practiceAttemptByDailyPlanId,
        dailyPlan.id,
      );
      const owners = teacherOwnersByClassId.get(classCohort.id) ?? [];
      const progressSummaryId = `progress-access-${accessRow.enrollmentId}`;
      const progressEvidenceKey = [
        accessRow.relationshipKey,
        progress.id,
        videoEvidence.id,
        practiceAttempt.id,
      ].join('->');

      return {
        progressSummaryId,
        relationshipKey: accessRow.relationshipKey,
        progressEvidenceKey,
        parentGuardianId: guardian.id,
        parentGuardianName: guardian.displayName,
        parentGuardianEmail: guardian.email,
        teacherOwnerIds: owners.map((owner) => owner.id),
        teacherOwnerNames: owners.map((owner) => owner.displayName),
        studentId: accessRow.studentId,
        childProfileId: accessRow.childProfileId,
        studentName: accessRow.studentName,
        courseId: accessRow.courseId,
        courseCode: accessRow.courseCode,
        courseTitle: accessRow.courseTitle,
        classId: classCohort.id,
        classCode: classCohort.code,
        teacherName: classCohort.teacherName,
        enrollmentId: accessRow.enrollmentId,
        enrollmentStatus: accessRow.enrollmentStatus,
        subscriptionId: accessRow.subscriptionId,
        subscriptionStatus: accessRow.subscriptionStatus,
        paymentStatus: accessRow.paymentStatus,
        entitlementId: accessRow.entitlementId,
        entitlementStatus: accessRow.entitlementStatus,
        accessStatus: accessRow.accessStatus,
        blockedReason: accessRow.blockedReason,
        nextSafeActionLabel: accessRow.nextSafeActionLabel,
        learningPathId: accessRow.learningPathId,
        learningPathStatus: accessRow.learningPathStatus,
        dailyPlanId: dailyPlan.id,
        dailyPlanStatus: dailyPlan.status,
        progressId: progress.id,
        progressStatus: progress.status,
        completionPercent: progress.completionPercent,
        completedLessonCount: progress.completedLessonCount,
        totalLessonCount: progress.totalLessonCount,
        videoEvidenceId: videoEvidence.id,
        videoEvidenceStatus: videoEvidence.status,
        practiceAttemptId: practiceAttempt.id,
        practiceAttemptStatus: practiceAttempt.status,
        evidenceCoverageCount: 3,
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          accessRow.accessStatus === 'UNLOCKED'
            ? `${accessRow.studentName} has unlocked fixture access and ${progress.completionPercent}% progress evidence.`
            : `${accessRow.studentName} has blocked fixture access with progress evidence: ${accessRow.blockedReason}.`,
      } satisfies DemoLearningParentTeacherProgressAccessRow;
    })
    .sort((left, right) =>
      [left.courseCode, left.studentName, left.dailyPlanId]
        .join('|')
        .localeCompare(
          [right.courseCode, right.studentName, right.dailyPlanId].join('|'),
        ),
    );

  const parentSummaryRows = progressRows.map((row) => {
    const guardian = requireGuardian(guardiansById, row.parentGuardianId);
    const relationshipTraceKey = [
      guardian.id,
      row.relationshipKey,
      row.progressSummaryId,
    ].join('->');

    return {
      parentSummaryId: `parent-access-summary-${row.parentGuardianId}-${row.enrollmentId}`,
      relationshipTraceKey,
      relationshipTraceIds: [
        relationshipTraceKey,
        row.relationshipKey,
        row.progressEvidenceKey,
      ],
      parentGuardianId: guardian.id,
      parentGuardianName: guardian.displayName,
      parentGuardianEmail: guardian.email,
      relationship: guardian.relationship,
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      courseCode: row.courseCode,
      courseTitle: row.courseTitle,
      entitlementStatus: row.entitlementStatus,
      accessStatus: row.accessStatus,
      blockedReason: row.blockedReason,
      nextSafeActionLabel: row.nextSafeActionLabel,
      dailyPlanId: row.dailyPlanId,
      dailyPlanStatus: row.dailyPlanStatus,
      progressStatus: row.progressStatus,
      completionPercent: row.completionPercent,
      evidenceCoverageCount: row.evidenceCoverageCount,
      parentFacingSummary:
        row.accessStatus === 'UNLOCKED'
          ? `${row.studentName} can open ${row.dailyPlanId}; progress is ${row.progressStatus} at ${row.completionPercent}%.`
          : `${row.studentName} cannot open ${row.dailyPlanId}; ${row.blockedReason}`,
    } satisfies DemoLearningParentTeacherProgressParentSummaryRow;
  });

  const teacherSummaryRows = teacherOwners
    .flatMap((owner) =>
      owner.classIds.map((classId) => {
        const classCohort = requireClass(classesById, classId);
        const course = requireCourseById(coursesById, classCohort.courseId);
        const rows = progressRows.filter((row) => row.classId === classId);
        if (rows.length === 0) {
          return null;
        }

        const blockedRows = rows.filter(
          (row) => row.accessStatus !== 'UNLOCKED',
        );
        const relationshipTraceIds = rows.map((row) =>
          [owner.id, row.relationshipKey, row.progressSummaryId].join('->'),
        );
        const progressSummaryIds = rows.map((row) => row.progressSummaryId);
        const enrollmentIds = rows.map((row) => row.enrollmentId);
        const averageCompletionPercent = averagePercent(
          rows.map((row) => row.completionPercent),
        );

        return {
          teacherSummaryId: `teacher-access-summary-${owner.id}-${classId}`,
          relationshipTraceKey: [owner.id, classId, course.id].join('->'),
          relationshipTraceIds,
          blockedRelationshipTraceIds: blockedRows.map(
            (row) => row.relationshipKey,
          ),
          teacherOwnerId: owner.id,
          teacherName: owner.displayName,
          teacherEmail: owner.email,
          teacherRole: owner.role,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          classId: classCohort.id,
          classCode: classCohort.code,
          classTitle: classCohort.title,
          studentCount: new Set(rows.map((row) => row.studentId)).size,
          progressSummaryIds,
          enrollmentIds,
          unlockedAccessCount: rows.filter(
            (row) => row.accessStatus === 'UNLOCKED',
          ).length,
          blockedAccessCount: blockedRows.length,
          blockedReasonCount: blockedRows.filter((row) =>
            Boolean(row.blockedReason),
          ).length,
          averageCompletionPercent,
          completedProgressCount: rows.filter(
            (row) => row.progressStatus === 'COMPLETED',
          ).length,
          needsSupportProgressCount: rows.filter(
            (row) => row.progressStatus === 'NEEDS_SUPPORT',
          ).length,
          withdrawnProgressCount: rows.filter(
            (row) => row.progressStatus === 'WITHDRAWN',
          ).length,
          evidenceCoverageCount: rows.reduce(
            (sum, row) => sum + row.evidenceCoverageCount,
            0,
          ),
          teacherFacingSummary: `${owner.displayName} sees ${rows.length} fixture learner access summaries for ${classCohort.code}: ${blockedRows.length} blocked and ${averageCompletionPercent}% average progress.`,
        } satisfies DemoLearningParentTeacherProgressTeacherSummaryRow;
      }),
    )
    .filter(
      (row): row is DemoLearningParentTeacherProgressTeacherSummaryRow =>
        row !== null,
    )
    .sort((left, right) =>
      [left.teacherName, left.classCode, left.courseCode]
        .join('|')
        .localeCompare(
          [right.teacherName, right.classCode, right.courseCode].join('|'),
        ),
    );

  const blockedRows = progressRows.filter(
    (row) => row.accessStatus !== 'UNLOCKED',
  );
  const blockedRelationshipKeys = new Set(
    blockedRows.map((row) => row.relationshipKey),
  );
  const parentBlockedKeysWithReason = new Set(
    parentSummaryRows
      .filter(
        (row) => row.accessStatus !== 'UNLOCKED' && Boolean(row.blockedReason),
      )
      .map((row) => row.relationshipTraceIds[1]),
  );
  const teacherBlockedKeysWithReason = new Set(
    teacherSummaryRows.flatMap((row) => row.blockedRelationshipTraceIds),
  );
  const blockedAccessInSummariesWithReasonCount = [
    ...blockedRelationshipKeys,
  ].filter(
    (key) =>
      parentBlockedKeysWithReason.has(key) &&
      teacherBlockedKeysWithReason.has(key),
  ).length;
  const remainingLocalDemoNotes = [
    'Parent summaries are read-only views over guardian, entitlement, daily plan, and progress fixtures.',
    'Teacher/admin summaries aggregate existing fixture access rows by assigned class and course without writing learning records.',
    'Production parent messaging, teacher interventions, entitlement sync, payment handling, and progress mutations are out of scope.',
  ];
  const safety = {
    ...accessReport.safety,
  } satisfies DemoLearningParentTeacherProgressAccessSummarySafety;
  const safetyEntries = Object.entries(safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
      return value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;
  const evidenceRows: DemoLearningParentTeacherProgressAccessEvidenceRow[] = [
    {
      evidenceKind: 'PARENT_GUARDIAN_LINK',
      evidenceCount: parentSummaryRows.length,
      stableFixtureIds: parentSummaryRows.map(
        (row) => row.relationshipTraceKey,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Each parent summary links a fixture guardian to child, course entitlement, daily plan access, and progress evidence.',
    },
    {
      evidenceKind: 'TEACHER_COURSE_LINK',
      evidenceCount: teacherSummaryRows.length,
      stableFixtureIds: teacherSummaryRows.map(
        (row) => row.relationshipTraceKey,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Teacher/admin summaries use content owner class assignments to aggregate course access and progress rows.',
    },
    {
      evidenceKind: 'PROGRESS_ACCESS_SUMMARY',
      evidenceCount: progressRows.length,
      stableFixtureIds: progressRows.map((row) => row.progressEvidenceKey),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Progress rows connect entitlement access to progress, video, and practice evidence for unlocked and blocked cases.',
    },
    {
      evidenceKind: 'BLOCKED_REASON_SUMMARY',
      evidenceCount: blockedRows.length,
      stableFixtureIds: blockedRows.map((row) => row.relationshipKey),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Blocked access rows are surfaced to parent and teacher summaries with explicit local-demo reasons.',
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
        'All production, provider, payment, notification, learning mutation, and ERP mutation gates remain closed.',
    },
  ];

  return {
    reportName:
      'Learning local demo Parent/Teacher Progress Access Summary Report',
    generatedFor: 'local-demo-parent-teacher-progress-access-summary-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/parent-teacher-progress-access-summary-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#parent-teacher-progress-access-summary',
    jsonExportPath:
      'exports/learning-local-demo-parent-teacher-progress-access-summary-report.json',
    markdownExportPath:
      'exports/learning-local-demo-parent-teacher-progress-access-summary-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Parent and teacher read-only summaries compose fixture entitlement access, blocked reasons, and progress evidence without production data or mutations.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: fixture.students.length,
      parentGuardianCount: fixture.parentGuardians.length,
      teacherCount: teacherOwners.length,
      courseCount: fixture.courses.length,
      enrollmentCount: fixture.enrollments.length,
      subscriptionCount: fixture.subscriptions.length,
      entitlementCount: accessReport.totals.entitlementCount,
      dailyPlanAccessCaseCount: accessReport.totals.dailyPlanAccessCaseCount,
      unlockedAccessCount: accessReport.totals.unlockedAccessCount,
      blockedAccessCount: blockedRows.length,
      blockedReasonCount: blockedRows.filter((row) =>
        Boolean(row.blockedReason),
      ).length,
      progressSummaryCount: progressRows.length,
      parentSummaryCount: parentSummaryRows.length,
      teacherSummaryCount: teacherSummaryRows.length,
      relationshipTraceCount: progressRows.length,
      parentSummaryWithTraceCount: parentSummaryRows.filter(
        (row) =>
          row.relationshipTraceIds.length > 0 &&
          row.relationshipTraceKey.includes(row.parentGuardianId),
      ).length,
      teacherSummaryWithTraceCount: teacherSummaryRows.filter(
        (row) =>
          row.relationshipTraceIds.length > 0 &&
          row.relationshipTraceKey.includes(row.teacherOwnerId),
      ).length,
      blockedAccessInSummariesWithReasonCount,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    progressRows,
    parentSummaryRows,
    teacherSummaryRows,
    evidenceRows,
  };
}

export function toParentTeacherProgressAccessSummaryMarkdown(
  report: DemoLearningParentTeacherProgressAccessSummaryReport,
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
    `- Enrollments: ${report.totals.enrollmentCount}`,
    `- Entitlements: ${report.totals.entitlementCount}`,
    `- Daily plan access cases: ${report.totals.dailyPlanAccessCaseCount}`,
    `- Unlocked access: ${report.totals.unlockedAccessCount}`,
    `- Blocked access: ${report.totals.blockedAccessCount}`,
    `- Blocked reasons: ${report.totals.blockedReasonCount}`,
    `- Progress summaries: ${report.totals.progressSummaryCount}`,
    `- Parent summaries: ${report.totals.parentSummaryCount}`,
    `- Teacher summaries: ${report.totals.teacherSummaryCount}`,
    `- Parent summaries with trace: ${report.totals.parentSummaryWithTraceCount}`,
    `- Teacher summaries with trace: ${report.totals.teacherSummaryWithTraceCount}`,
    `- Blocked access in summaries with reason: ${report.totals.blockedAccessInSummariesWithReasonCount}`,
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
    '## Parent Summary Rows',
    '',
    '| Parent | Child | Course | Access | Progress | Blocked reason | Trace | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.parentSummaryRows.map(
      (row) =>
        `| ${[
          `${row.parentGuardianName} (${row.parentGuardianId})`,
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          `${row.accessStatus} / ${row.entitlementStatus}`,
          `${row.progressStatus} ${row.completionPercent}%`,
          row.blockedReason ?? 'NONE',
          row.relationshipTraceKey,
          row.parentFacingSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Teacher Summary Rows',
    '',
    '| Teacher | Class | Course | Students | Access | Progress | Blocked reasons | Trace IDs | Summary |',
    '| --- | --- | --- | ---: | --- | --- | ---: | --- | --- |',
    ...report.teacherSummaryRows.map(
      (row) =>
        `| ${[
          `${row.teacherName} (${row.teacherRole})`,
          row.classCode,
          row.courseCode,
          String(row.studentCount),
          `${row.unlockedAccessCount} unlocked / ${row.blockedAccessCount} blocked`,
          `${row.averageCompletionPercent}% average`,
          String(row.blockedReasonCount),
          row.relationshipTraceIds.join(', '),
          row.teacherFacingSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Progress Access Rows',
    '',
    '| Student | Daily plan | Access | Progress | Evidence | Blocked reason | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.progressRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.studentId})`,
          `${row.dailyPlanId} ${row.dailyPlanStatus}`,
          `${row.accessStatus} / ${row.entitlementStatus}`,
          `${row.progressStatus} ${row.completionPercent}%`,
          `${row.videoEvidenceId} ${row.videoEvidenceStatus}; ${row.practiceAttemptId} ${row.practiceAttemptStatus}`,
          row.blockedReason ?? 'NONE',
          row.progressEvidenceKey,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
