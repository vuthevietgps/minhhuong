import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
  DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow,
  DemoLearningParentScreenTimeGrantDailyPlanGuardEvidenceRow,
  DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow,
  DemoLearningParentScreenTimeGrantDailyPlanGuardReport,
  DemoLearningParentScreenTimeGrantDailyPlanGuardSafety,
  DemoLearningParentScreenTimeGrantDailyPlanGuardSessionEvidenceRow,
  DemoLearningParentScreenTimeGrantDailyPlanGuardStatusCounts,
  DemoLearningScreenTimeGrantRequest,
  DemoLearningSessionGate,
} from '../learning-local-demo.types';
import {
  countByStatus,
  dailyPlanGuardAccessResults,
  groupBy,
  requireClass,
  requireCourseById,
  requireDailyPlan,
  requireEnrollment,
  requireGuardian,
  requireLearningPath,
  requireLesson,
  requireScreenTimePolicy,
  requireStudentById,
  screenTimeGrantDecisions,
  screenTimePolicyStatuses,
  sessionGateDecisions,
} from './shared';

export function buildParentScreenTimeGrantDailyPlanGuardReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningParentScreenTimeGrantDailyPlanGuardReport {
  const studentsById = new Map(
    fixture.students.map((student) => [student.id, student]),
  );
  const coursesById = new Map(
    fixture.courses.map((course) => [course.id, course]),
  );
  const enrollmentsById = new Map(
    fixture.enrollments.map((enrollment) => [enrollment.id, enrollment]),
  );
  const classesById = new Map(
    fixture.classes.map((classCohort) => [classCohort.id, classCohort]),
  );
  const lessonsById = new Map(
    fixture.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const learningPathsById = new Map(
    fixture.learningPaths.map((path) => [path.id, path]),
  );
  const dailyPlansById = new Map(
    fixture.dailyPlans.map((plan) => [plan.id, plan]),
  );
  const policiesById = new Map(
    fixture.screenTimePolicies.map((policy) => [policy.id, policy]),
  );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );
  const grantsBySessionGateId = groupBy(
    fixture.screenTimeGrantRequests,
    (grant) => grant.sessionGateId,
  );

  const accessRows: DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow[] =
    fixture.sessionGates
      .map((gate) => {
        const dailyPlan = requireDailyPlan(dailyPlansById, gate.dailyPlanId);
        const learningPath = requireLearningPath(
          learningPathsById,
          gate.learningPathId,
        );
        requireEnrollment(enrollmentsById, gate.enrollmentId);
        const student = requireStudentById(studentsById, gate.studentId);
        const course = requireCourseById(coursesById, dailyPlan.courseId);
        const classCohort = requireClass(classesById, dailyPlan.classId);
        const lesson = requireLesson(lessonsById, dailyPlan.lessonId);
        const policy = requireScreenTimePolicy(policiesById, gate.policyId);
        const guardian = requireGuardian(guardiansById, policy.guardianId);
        const grant = grantsBySessionGateId.get(gate.id)?.[0] ?? null;
        const accessResult: DemoLearningParentScreenTimeDailyPlanGuardAccessResult =
          gate.decision === 'BLOCKED' ? 'BLOCKED_SESSION' : 'ALLOWED_SESSION';
        const blockedReason = buildDailyPlanGuardBlockedReason(
          gate.blockedReason,
        );
        const nextSafeActionLabel = buildDailyPlanGuardNextAction({
          gate,
          grant,
        });
        const learningSessionEvidenceId = `learning-session-evidence-${gate.id}`;
        const sessionGuardTraceIds = [
          guardian.id,
          student.childProfileId,
          student.id,
          course.id,
          dailyPlan.id,
          policy.id,
          grant?.id ?? `no-parent-grant-${gate.id}`,
          gate.id,
          accessResult,
          learningSessionEvidenceId,
        ];

        return {
          accessCaseId: `daily-plan-guard-${gate.id}`,
          sessionGuardTraceKey: sessionGuardTraceIds.join('->'),
          sessionGuardTraceIds,
          parentGuardianId: guardian.id,
          parentGuardianName: guardian.displayName,
          parentGuardianEmail: guardian.email,
          relationship: guardian.relationship,
          studentId: student.id,
          childProfileId: student.childProfileId,
          studentName: student.displayName,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          classId: classCohort.id,
          classCode: classCohort.code,
          teacherName: classCohort.teacherName,
          learningPathId: learningPath.id,
          learningPathTitle: learningPath.title,
          learningPathStatus: learningPath.status,
          dailyPlanId: dailyPlan.id,
          dailyPlanTitle: dailyPlan.title,
          dailyPlanStatus: dailyPlan.status,
          lessonId: lesson.id,
          lessonCode: lesson.code,
          sessionId: lesson.sessionId,
          screenTimePolicyId: policy.id,
          screenTimePolicyStatus: policy.status,
          dailyAllowedMinutes: policy.dailyAllowedMinutes,
          safeLearningWindowStart: policy.safeLearningWindowStart,
          safeLearningWindowEnd: policy.safeLearningWindowEnd,
          parentGrantRuleId: grant?.id ?? null,
          parentGrantDecision: grant?.decision ?? 'NONE',
          parentGrantRuleApplied: grant !== null,
          grantedMinutes: grant?.grantedMinutes ?? 0,
          requestedAt: gate.requestedAt,
          requestedMinutes: gate.requestedMinutes,
          usedMinutesBeforeSession: gate.usedMinutesBeforeSession,
          totalAllowedMinutesForCase:
            policy.dailyAllowedMinutes + (grant?.grantedMinutes ?? 0),
          accessDecision: gate.decision,
          accessResult,
          blockedReasonCode: gate.blockedReason ?? 'NONE',
          blockedReason,
          nextSafeActionLabel,
          learningSessionEvidenceId,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            accessResult === 'ALLOWED_SESSION'
              ? `${student.displayName} can open ${dailyPlan.id} through ${gate.decision.toLowerCase()} fixture guard evidence.`
              : `${student.displayName} is blocked from ${dailyPlan.id}: ${blockedReason}.`,
        } satisfies DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow;
      })
      .sort((left, right) =>
        [left.courseCode, left.studentName, left.requestedAt, left.accessCaseId]
          .join('|')
          .localeCompare(
            [
              right.courseCode,
              right.studentName,
              right.requestedAt,
              right.accessCaseId,
            ].join('|'),
          ),
      );

  const grantRuleRows: DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow[] =
    fixture.screenTimeGrantRequests
      .map((grant) => {
        const gate = fixture.sessionGates.find(
          (candidate) => candidate.id === grant.sessionGateId,
        );
        if (!gate) {
          throw new Error(
            `Missing local demo session gate for grant ${grant.id}`,
          );
        }
        const dailyPlan = requireDailyPlan(dailyPlansById, gate.dailyPlanId);
        const guardian = requireGuardian(guardiansById, grant.guardianId);
        const student = requireStudentById(studentsById, grant.studentId);
        const ruleTraceKey = [
          guardian.id,
          student.childProfileId,
          dailyPlan.id,
          grant.id,
          gate.id,
          grant.decision,
        ].join('->');

        return {
          grantRuleId: grant.id,
          sessionGateId: grant.sessionGateId,
          parentGuardianId: guardian.id,
          parentGuardianName: guardian.displayName,
          studentId: student.id,
          childProfileId: student.childProfileId,
          studentName: student.displayName,
          dailyPlanId: dailyPlan.id,
          dailyPlanTitle: dailyPlan.title,
          requestedExtraMinutes: grant.requestedExtraMinutes,
          grantedMinutes: grant.grantedMinutes,
          requestedAt: grant.requestedAt,
          decidedAt: grant.decidedAt ?? null,
          decision: grant.decision,
          allowsDailyPlanAccess: grant.decision === 'APPROVED',
          decisionReason: grant.decisionReason,
          ruleTraceKey,
        } satisfies DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow;
      })
      .sort((left, right) =>
        [left.studentName, left.requestedAt, left.grantRuleId]
          .join('|')
          .localeCompare(
            [right.studentName, right.requestedAt, right.grantRuleId].join('|'),
          ),
      );

  const sessionEvidenceRows: DemoLearningParentScreenTimeGrantDailyPlanGuardSessionEvidenceRow[] =
    accessRows.map((row) => ({
      learningSessionEvidenceId: row.learningSessionEvidenceId,
      sessionGuardTraceKey: row.sessionGuardTraceKey,
      sessionGateId: row.sessionGuardTraceIds[7],
      dailyPlanId: row.dailyPlanId,
      dailyPlanTitle: row.dailyPlanTitle,
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      courseCode: row.courseCode,
      requestedAt: row.requestedAt,
      accessResult: row.accessResult,
      accessDecision: row.accessDecision,
      sessionStarted: row.accessResult === 'ALLOWED_SESSION',
      sessionDurationMinutes:
        row.accessResult === 'ALLOWED_SESSION' ? row.requestedMinutes : 0,
      blockedReason: row.blockedReason,
      nextSafeActionLabel: row.nextSafeActionLabel,
      evidenceSummary:
        row.accessResult === 'ALLOWED_SESSION'
          ? `${row.learningSessionEvidenceId} records read-only allowed access for ${row.dailyPlanId}.`
          : `${row.learningSessionEvidenceId} records read-only blocked access for ${row.dailyPlanId}.`,
    }));

  const allowedRows = accessRows.filter(
    (row) => row.accessResult === 'ALLOWED_SESSION',
  );
  const blockedRows = accessRows.filter(
    (row) => row.accessResult === 'BLOCKED_SESSION',
  );
  const blockedOrLimitedRows = accessRows.filter(
    (row) =>
      row.accessResult === 'BLOCKED_SESSION' || row.parentGrantRuleApplied,
  );
  const rowsWithStableTrace = accessRows.filter((row) =>
    [
      row.parentGuardianId,
      row.childProfileId,
      row.courseId,
      row.dailyPlanId,
      row.screenTimePolicyId,
      row.sessionGuardTraceIds[7],
      row.learningSessionEvidenceId,
    ].every((id) => row.sessionGuardTraceKey.includes(id)),
  );
  const remainingLocalDemoNotes = [
    'Parent grant rules and screen-time policies are fixture rows only; no parent-control mutation is executed.',
    'Allowed and blocked learning session evidence is generated from deterministic local session gate fixtures.',
    'Production parent controls, notification delivery, daily plan access writes, provider calls, and real learner mutations remain out of scope.',
  ];
  const safety = {
    productionReady: false,
    fixtureOnly: true,
    productionDbUsed: false,
    noProductionDbRead: true,
    providerApiUsed: false,
    aiProviderUsed: false,
    aiProviderExecutionUsed: false,
    paymentProviderUsed: false,
    notificationProviderUsed: false,
    liveAdsExecuted: false,
    realStudentMutationUsed: false,
    realParentMutationUsed: false,
    realCourseMutationUsed: false,
    realEnrollmentMutationUsed: false,
    realSubscriptionMutationUsed: false,
    realClassMutationUsed: false,
    realSessionMutationUsed: false,
    realAttendanceMutationUsed: false,
    realProgressMutationUsed: false,
    realLessonMutationUsed: false,
    realAssignmentMutationUsed: false,
    realAssessmentMutationUsed: false,
    realLearningPathMutationUsed: false,
    realDailyPlanMutationUsed: false,
    realVideoEvidenceMutationUsed: false,
    realPracticeMutationUsed: false,
    realParentGuardianMutationUsed: false,
    realScreenTimePolicyMutationUsed: false,
    realLearningSessionGateMutationUsed: false,
    realScreenTimeGrantMutationUsed: false,
    realDailyPlanAccessMutationUsed: false,
    realLearningMutationUsed: false,
    realParentMessageMutationUsed: false,
    realTeacherInterventionMutationUsed: false,
    realPaymentMutationUsed: false,
    realRefundMutationUsed: false,
    realCommissionMutationUsed: false,
    realErpMutationUsed: false,
    secretsRequired: false,
  } satisfies DemoLearningParentScreenTimeGrantDailyPlanGuardSafety;
  const safetyEntries = Object.entries(safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (
      gate === 'fixtureOnly' ||
      gate === 'noProductionDbRead' ||
      gate === 'productionReady'
    ) {
      return gate === 'productionReady' ? value !== false : value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;
  const statusCounts: DemoLearningParentScreenTimeGrantDailyPlanGuardStatusCounts =
    {
      policyStatus: countByStatus(
        screenTimePolicyStatuses,
        fixture.screenTimePolicies,
        (policy) => policy.status,
      ),
      gateDecision: countByStatus(
        sessionGateDecisions,
        fixture.sessionGates,
        (gate) => gate.decision,
      ),
      grantDecision: countByStatus(
        screenTimeGrantDecisions,
        fixture.screenTimeGrantRequests,
        (grant) => grant.decision,
      ),
      accessResult: countByStatus(
        dailyPlanGuardAccessResults,
        accessRows,
        (row) => row.accessResult,
      ),
    };
  const evidenceRows: DemoLearningParentScreenTimeGrantDailyPlanGuardEvidenceRow[] =
    [
      {
        evidenceKind: 'PARENT_CHILD_COURSE_PLAN_TRACE',
        evidenceCount: accessRows.length,
        stableFixtureIds: accessRows.map((row) => row.sessionGuardTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Trace keys connect parent -> child -> course/daily plan -> screen-time/grant rule -> access result -> learning session evidence.',
      },
      {
        evidenceKind: 'PARENT_GRANT_RULE',
        evidenceCount: grantRuleRows.length,
        stableFixtureIds: grantRuleRows.map((row) => row.ruleTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Fixture parent grant rules include approved and denied decisions linked to daily plan guard cases.',
      },
      {
        evidenceKind: 'SCREEN_TIME_RULE',
        evidenceCount: fixture.screenTimePolicies.length,
        stableFixtureIds: fixture.screenTimePolicies.map((policy) => policy.id),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Screen-time rules are deterministic fixture policies with no live parent-control writes.',
      },
      {
        evidenceKind: 'ALLOWED_LEARNING_SESSION',
        evidenceCount: allowedRows.length,
        stableFixtureIds: allowedRows.map(
          (row) => row.learningSessionEvidenceId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Allowed rows record read-only learning session evidence, including parent-grant override access.',
      },
      {
        evidenceKind: 'BLOCKED_LEARNING_SESSION',
        evidenceCount: blockedRows.length,
        stableFixtureIds: blockedRows.map(
          (row) => row.learningSessionEvidenceId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Blocked rows include clear reasons and safe next-action labels without mutating daily plan access.',
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
          'All production, provider, payment, notification, AI, learning mutation, and ERP mutation gates remain closed.',
      },
    ];

  return {
    reportName:
      'Learning local demo Parent Screen-Time Grant -> Daily Plan Guard Report',
    generatedFor: 'local-demo-parent-screen-time-grant-daily-plan-guard-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#parent-screen-time-grant-daily-plan-guard',
    jsonExportPath:
      'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.json',
    markdownExportPath:
      'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'The local-demo daily plan guard derives allowed and blocked child learning session evidence from parent grants, screen-time rules, and session gate fixtures.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: new Set(accessRows.map((row) => row.studentId)).size,
      parentGuardianCount: new Set(
        accessRows.map((row) => row.parentGuardianId),
      ).size,
      courseCount: new Set(accessRows.map((row) => row.courseId)).size,
      dailyPlanAccessCaseCount: accessRows.length,
      parentGrantRuleCount: grantRuleRows.length,
      screenTimeRuleCount: fixture.screenTimePolicies.length,
      allowedSessionCount: allowedRows.length,
      blockedSessionCount: blockedRows.length,
      blockedReasonCount: blockedRows.filter((row) =>
        Boolean(row.blockedReason),
      ).length,
      safeNextActionCount: accessRows.filter((row) =>
        Boolean(row.nextSafeActionLabel),
      ).length,
      blockedOrLimitedCaseWithSafeNextActionCount: blockedOrLimitedRows.filter(
        (row) => Boolean(row.nextSafeActionLabel),
      ).length,
      sessionGuardTraceCount: rowsWithStableTrace.length,
      accessCasesWithStableTraceCount: rowsWithStableTrace.length,
      allowedCasesWithStableTraceCount: rowsWithStableTrace.filter(
        (row) => row.accessResult === 'ALLOWED_SESSION',
      ).length,
      blockedCasesWithStableTraceCount: rowsWithStableTrace.filter(
        (row) => row.accessResult === 'BLOCKED_SESSION',
      ).length,
      blockedCasesWithReasonAndNextActionCount: blockedRows.filter(
        (row) => Boolean(row.blockedReason) && Boolean(row.nextSafeActionLabel),
      ).length,
      learningSessionEvidenceCount: sessionEvidenceRows.length,
      allowedLearningSessionEvidenceCount: sessionEvidenceRows.filter(
        (row) => row.accessResult === 'ALLOWED_SESSION',
      ).length,
      blockedLearningSessionEvidenceCount: sessionEvidenceRows.filter(
        (row) => row.accessResult === 'BLOCKED_SESSION',
      ).length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    statusCounts,
    accessRows,
    grantRuleRows,
    sessionEvidenceRows,
    evidenceRows,
  };
}

export function toParentScreenTimeGrantDailyPlanGuardMarkdown(
  report: DemoLearningParentScreenTimeGrantDailyPlanGuardReport,
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
    '- aiProviderUsed=false',
    '- aiProviderExecutionUsed=false',
    '- paymentProviderUsed=false',
    '- notificationProviderUsed=false',
    '- liveAdsExecuted=false',
    '- realStudentMutationUsed=false',
    '- realParentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
    '- realSubscriptionMutationUsed=false',
    '- realLearningPathMutationUsed=false',
    '- realDailyPlanMutationUsed=false',
    '- realParentGuardianMutationUsed=false',
    '- realScreenTimePolicyMutationUsed=false',
    '- realLearningSessionGateMutationUsed=false',
    '- realScreenTimeGrantMutationUsed=false',
    '- realDailyPlanAccessMutationUsed=false',
    '- realLearningMutationUsed=false',
    '- realParentMessageMutationUsed=false',
    '- realTeacherInterventionMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Acceptance Counts',
    '',
    `- Students: ${report.totals.studentCount}`,
    `- Parent guardians: ${report.totals.parentGuardianCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Daily plan access cases: ${report.totals.dailyPlanAccessCaseCount}`,
    `- Parent grant rules: ${report.totals.parentGrantRuleCount}`,
    `- Screen-time rules: ${report.totals.screenTimeRuleCount}`,
    `- Allowed sessions: ${report.totals.allowedSessionCount}`,
    `- Blocked sessions: ${report.totals.blockedSessionCount}`,
    `- Blocked reasons: ${report.totals.blockedReasonCount}`,
    `- Safe next-action labels: ${report.totals.safeNextActionCount}`,
    `- Blocked/limited cases with safe next action: ${report.totals.blockedOrLimitedCaseWithSafeNextActionCount}`,
    `- Session guard traces: ${report.totals.sessionGuardTraceCount}`,
    `- Stable trace cases: ${report.totals.accessCasesWithStableTraceCount}`,
    `- Blocked cases with reason and next action: ${report.totals.blockedCasesWithReasonAndNextActionCount}`,
    `- Learning session evidence rows: ${report.totals.learningSessionEvidenceCount}`,
    `- Allowed learning session evidence: ${report.totals.allowedLearningSessionEvidenceCount}`,
    `- Blocked learning session evidence: ${report.totals.blockedLearningSessionEvidenceCount}`,
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
    '## Daily Plan Guard Rows',
    '',
    '| Child | Guardian | Daily plan | Rule | Grant | Result | Reason | Next action | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.accessRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          `${row.parentGuardianName} (${row.relationship})`,
          `${row.courseCode} / ${row.dailyPlanTitle}`,
          `${row.screenTimePolicyStatus} ${row.usedMinutesBeforeSession}+${row.requestedMinutes}/${row.totalAllowedMinutesForCase}`,
          row.parentGrantRuleId
            ? `${row.parentGrantRuleId} ${row.parentGrantDecision}`
            : 'NONE',
          `${row.accessDecision} / ${row.accessResult}`,
          row.blockedReason
            ? `${row.blockedReasonCode}: ${row.blockedReason}`
            : row.blockedReasonCode,
          row.nextSafeActionLabel,
          row.sessionGuardTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Parent Grant Rule Rows',
    '',
    '| Grant | Child | Daily plan | Requested | Decision | Granted | Allows access | Reason | Trace |',
    '| --- | --- | --- | ---: | --- | ---: | --- | --- | --- |',
    ...report.grantRuleRows.map(
      (row) =>
        `| ${[
          row.grantRuleId,
          `${row.studentName} (${row.childProfileId})`,
          row.dailyPlanTitle,
          String(row.requestedExtraMinutes),
          row.decision,
          String(row.grantedMinutes),
          row.allowsDailyPlanAccess ? 'yes' : 'no',
          row.decisionReason,
          row.ruleTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Learning Session Evidence Rows',
    '',
    '| Evidence | Child | Daily plan | Result | Started | Minutes | Reason | Next action | Trace |',
    '| --- | --- | --- | --- | --- | ---: | --- | --- | --- |',
    ...report.sessionEvidenceRows.map(
      (row) =>
        `| ${[
          row.learningSessionEvidenceId,
          `${row.studentName} (${row.childProfileId})`,
          row.dailyPlanTitle,
          `${row.accessDecision} / ${row.accessResult}`,
          row.sessionStarted ? 'yes' : 'no',
          String(row.sessionDurationMinutes),
          row.blockedReason ?? 'NONE',
          row.nextSafeActionLabel,
          row.sessionGuardTraceKey,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildDailyPlanGuardBlockedReason(
  blockedReason: DemoLearningSessionGate['blockedReason'],
) {
  if (!blockedReason) {
    return null;
  }

  if (blockedReason === 'DAILY_LIMIT_EXCEEDED') {
    return 'Daily screen-time limit would be exceeded by the requested fixture learning session.';
  }

  if (blockedReason === 'GUARDIAN_DENIED_GRANT') {
    return 'Parent/guardian denied the fixture extra-time grant for this daily plan session.';
  }

  return 'Screen-time policy is disabled because the fixture enrollment is withdrawn.';
}

export function buildDailyPlanGuardNextAction(input: {
  gate: DemoLearningSessionGate;
  grant: DemoLearningScreenTimeGrantRequest | null;
}) {
  if (input.gate.decision === 'ALLOWED') {
    return 'Allow fixture session and continue read-only daily plan evidence';
  }

  if (input.gate.decision === 'OVERRIDE_ALLOWED') {
    return 'Allow fixture session through approved parent grant and keep the next session inside the daily plan window';
  }

  if (input.gate.blockedReason === 'DAILY_LIMIT_EXCEEDED') {
    return 'Keep blocked until the next fixture learning window or a reviewed parent grant';
  }

  if (input.gate.blockedReason === 'GUARDIAN_DENIED_GRANT') {
    return 'Keep blocked and schedule teacher/guardian review before retrying the daily plan';
  }

  if (input.gate.blockedReason === 'POLICY_DISABLED_WITHDRAWN') {
    return 'Keep blocked because the fixture enrollment is withdrawn';
  }

  if (input.grant?.decision === 'DENIED') {
    return 'Keep blocked after denied fixture parent grant';
  }

  return 'Keep blocked until a safe local-demo review clears the session';
}
