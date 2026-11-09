import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningClassCohort,
  DemoLearningCoreFixture,
  DemoLearningCourse,
  DemoLearningDailyPlan,
  DemoLearningEnrollment,
  DemoLearningLesson,
  DemoLearningParentGuardian,
  DemoLearningParentScreenTimeChildControlsRow,
  DemoLearningParentScreenTimeGateRow,
  DemoLearningParentScreenTimeGrantRow,
  DemoLearningParentScreenTimeGuardianControlsReport,
  DemoLearningParentScreenTimeGuardianControlsStatusCounts,
  DemoLearningScreenTimeGrantRequest,
  DemoLearningSessionGate,
  DemoLearningStudent,
} from '../learning-local-demo.types';
import {
  countByStatus,
  groupBy,
  requireClass,
  requireCourseById,
  requireDailyPlan,
  requireEnrollment,
  requireGuardian,
  requireGuardianByChildProfileId,
  requireLesson,
  requireScreenTimePolicy,
  requireStudentById,
  screenTimeGrantDecisions,
  screenTimePolicyStatuses,
  sessionGateDecisions,
} from './shared';

export function buildParentScreenTimeGuardianControlsReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningParentScreenTimeGuardianControlsReport {
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
  const dailyPlansById = new Map(
    fixture.dailyPlans.map((plan) => [plan.id, plan]),
  );
  const policiesById = new Map(
    fixture.screenTimePolicies.map((policy) => [policy.id, policy]),
  );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );
  const guardianByChildProfileId = new Map<
    string,
    DemoLearningParentGuardian
  >();
  for (const guardian of fixture.parentGuardians) {
    for (const childProfileId of guardian.childProfileIds) {
      guardianByChildProfileId.set(childProfileId, guardian);
    }
  }
  const policiesByStudentId = groupBy(
    fixture.screenTimePolicies,
    (policy) => policy.studentId,
  );
  const gatesByStudentId = groupBy(
    fixture.sessionGates,
    (gate) => gate.studentId,
  );
  const grantsByStudentId = groupBy(
    fixture.screenTimeGrantRequests,
    (grant) => grant.studentId,
  );

  const gateRows = fixture.sessionGates
    .map((gate) => {
      const dailyPlan = requireDailyPlan(dailyPlansById, gate.dailyPlanId);
      const policy = requireScreenTimePolicy(policiesById, gate.policyId);
      const enrollment = requireEnrollment(enrollmentsById, gate.enrollmentId);

      return buildParentScreenTimeGateRow({
        gate,
        dailyPlan,
        guardian: requireGuardian(guardiansById, policy.guardianId),
        enrollment,
        student: requireStudentById(studentsById, gate.studentId),
        course: requireCourseById(coursesById, dailyPlan.courseId),
        classesById,
        lessonsById,
      });
    })
    .sort((left, right) =>
      [left.studentName, left.requestedAt, left.gateId]
        .join('|')
        .localeCompare(
          [right.studentName, right.requestedAt, right.gateId].join('|'),
        ),
    );

  const grantRows = fixture.screenTimeGrantRequests
    .map((grant) =>
      buildParentScreenTimeGrantRow({
        grant,
        guardian: requireGuardian(guardiansById, grant.guardianId),
        student: requireStudentById(studentsById, grant.studentId),
      }),
    )
    .sort((left, right) =>
      [left.studentName, left.requestedAt, left.grantRequestId]
        .join('|')
        .localeCompare(
          [right.studentName, right.requestedAt, right.grantRequestId].join(
            '|',
          ),
        ),
    );

  const childRows = fixture.students
    .map((student) => {
      const guardian = requireGuardianByChildProfileId(
        guardianByChildProfileId,
        student.childProfileId,
      );
      const policies = policiesByStudentId.get(student.id) ?? [];
      const activePolicy =
        policies.find((policy) => policy.status === 'ACTIVE') ?? null;
      const displayPolicy = activePolicy ?? policies[0] ?? null;
      const studentGates = gatesByStudentId.get(student.id) ?? [];
      const studentGrants = grantsByStudentId.get(student.id) ?? [];
      const enrollmentRows = fixture.enrollments.filter(
        (enrollment) => enrollment.studentId === student.id,
      );
      const courseIds = [
        ...new Set(enrollmentRows.map((enrollment) => enrollment.courseId)),
      ];
      const courseCodes = courseIds.map(
        (courseId) => requireCourseById(coursesById, courseId).code,
      );
      const approvedGrantMinutes = studentGrants.reduce(
        (sum, grant) =>
          grant.decision === 'APPROVED' ? sum + grant.grantedMinutes : sum,
        0,
      );
      const totalAllowedMinutes =
        (activePolicy?.dailyAllowedMinutes ?? 0) + approvedGrantMinutes;
      const usedMinutes = studentGates.reduce(
        (sum, gate) =>
          gate.decision === 'BLOCKED' ? sum : sum + gate.requestedMinutes,
        0,
      );
      const blockedSessionCount = studentGates.filter(
        (gate) => gate.decision === 'BLOCKED',
      ).length;
      const deniedGrantCount = studentGrants.filter(
        (grant) => grant.decision === 'DENIED',
      ).length;
      const needsParentAttention =
        blockedSessionCount > 0 || deniedGrantCount > 0;

      return {
        guardianId: guardian.id,
        guardianName: guardian.displayName,
        guardianEmail: guardian.email,
        relationship: guardian.relationship,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        courseIds,
        courseCodes,
        activePolicyId: activePolicy?.id ?? null,
        policyStatus: displayPolicy?.status ?? 'DISABLED',
        dailyAllowedMinutes: activePolicy?.dailyAllowedMinutes ?? 0,
        approvedGrantMinutes,
        totalAllowedMinutes,
        usedMinutes,
        remainingMinutes: Math.max(totalAllowedMinutes - usedMinutes, 0),
        grantRequestCount: studentGrants.length,
        grantDecisionCount: studentGrants.filter(
          (grant) => grant.decision !== 'PENDING',
        ).length,
        allowedSessionCount: studentGates.filter(
          (gate) => gate.decision === 'ALLOWED',
        ).length,
        blockedSessionCount,
        overrideSessionCount: studentGates.filter(
          (gate) => gate.decision === 'OVERRIDE_ALLOWED',
        ).length,
        needsParentAttention,
        parentAttentionReason: needsParentAttention
          ? buildParentScreenTimeAttentionReason({
              studentGates,
              deniedGrantCount,
            })
          : 'No parent action needed in the synthetic controls fixture.',
      } satisfies DemoLearningParentScreenTimeChildControlsRow;
    })
    .sort((left, right) => left.studentName.localeCompare(right.studentName));

  const statusCounts =
    buildParentScreenTimeGuardianControlsStatusCounts(fixture);
  const allowedMinutes = childRows.reduce(
    (sum, row) => sum + row.totalAllowedMinutes,
    0,
  );
  const usedMinutes = childRows.reduce((sum, row) => sum + row.usedMinutes, 0);
  const grantDecisionCount =
    statusCounts.grantDecision.APPROVED + statusCounts.grantDecision.DENIED;

  return {
    reportName:
      'Learning local demo Parent/Guardian Screen Time -> Session Gate -> Grant -> Controls Report',
    generatedFor: 'local-demo-parent-screen-time-guardian-controls-report',
    generatedAt,
    currency: fixture.currency,
    safety: {
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      paymentProviderUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
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
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      parentGuardianCount: fixture.parentGuardians.length,
      childCount: childRows.length,
      activeScreenTimePolicyCount: statusCounts.policyStatus.ACTIVE,
      allowedMinutes,
      usedMinutes,
      remainingMinutes: Math.max(allowedMinutes - usedMinutes, 0),
      grantRequestCount: fixture.screenTimeGrantRequests.length,
      grantDecisionCount,
      approvedGrantCount: statusCounts.grantDecision.APPROVED,
      deniedGrantCount: statusCounts.grantDecision.DENIED,
      allowedSessionCount: statusCounts.gateDecision.ALLOWED,
      blockedSessionCount: statusCounts.gateDecision.BLOCKED,
      overrideSessionCount: statusCounts.gateDecision.OVERRIDE_ALLOWED,
      childrenNeedingParentAttentionCount: childRows.filter(
        (row) => row.needsParentAttention,
      ).length,
    },
    statusCounts,
    childRows,
    gateRows,
    grantRows,
  };
}

export function toParentScreenTimeGuardianControlsMarkdown(
  report: DemoLearningParentScreenTimeGuardianControlsReport,
) {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Safety',
    '',
    '- Fixture-only local demo data.',
    '- productionDbUsed=false',
    '- noProductionDbRead=true',
    '- providerApiUsed=false',
    '- aiProviderUsed=false',
    '- paymentProviderUsed=false',
    '- notificationProviderUsed=false',
    '- liveAdsExecuted=false',
    '- realStudentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
    '- realClassMutationUsed=false',
    '- realSessionMutationUsed=false',
    '- realAttendanceMutationUsed=false',
    '- realProgressMutationUsed=false',
    '- realLessonMutationUsed=false',
    '- realAssignmentMutationUsed=false',
    '- realAssessmentMutationUsed=false',
    '- realLearningPathMutationUsed=false',
    '- realDailyPlanMutationUsed=false',
    '- realVideoEvidenceMutationUsed=false',
    '- realPracticeMutationUsed=false',
    '- realParentGuardianMutationUsed=false',
    '- realScreenTimePolicyMutationUsed=false',
    '- realLearningSessionGateMutationUsed=false',
    '- realScreenTimeGrantMutationUsed=false',
    '- realDailyPlanAccessMutationUsed=false',
    '- realParentMessageMutationUsed=false',
    '- realTeacherInterventionMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Parents/guardians: ${report.totals.parentGuardianCount}`,
    `- Children: ${report.totals.childCount}`,
    `- Active screen-time policies: ${report.totals.activeScreenTimePolicyCount}`,
    `- Allowed minutes: ${report.totals.allowedMinutes}`,
    `- Used minutes: ${report.totals.usedMinutes}`,
    `- Remaining minutes: ${report.totals.remainingMinutes}`,
    `- Grant requests: ${report.totals.grantRequestCount}`,
    `- Grant decisions: ${report.totals.grantDecisionCount}`,
    `- Approved grants: ${report.totals.approvedGrantCount}`,
    `- Denied grants: ${report.totals.deniedGrantCount}`,
    `- Allowed sessions: ${report.totals.allowedSessionCount}`,
    `- Blocked sessions: ${report.totals.blockedSessionCount}`,
    `- Override sessions: ${report.totals.overrideSessionCount}`,
    `- Children needing parent attention: ${report.totals.childrenNeedingParentAttentionCount}`,
    '',
    '## Child Controls Rows',
    '',
    '| Child | Guardian | Courses | Policy | Minutes used | Grants | Sessions | Attention |',
    '| --- | --- | --- | --- | ---: | ---: | ---: | --- |',
    ...report.childRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          `${row.guardianName} (${row.relationship})`,
          row.courseCodes.join(', '),
          `${row.policyStatus} ${row.dailyAllowedMinutes}+${row.approvedGrantMinutes}`,
          `${row.usedMinutes}/${row.totalAllowedMinutes} remaining ${row.remainingMinutes}`,
          `${row.grantDecisionCount}/${row.grantRequestCount}`,
          `allowed ${row.allowedSessionCount}, blocked ${row.blockedSessionCount}, override ${row.overrideSessionCount}`,
          row.needsParentAttention ? row.parentAttentionReason : 'No',
        ].join(' | ')} |`,
    ),
    '',
    '## Learning Session Gate Rows',
    '',
    '| Child | Daily plan | Course | Teacher | Decision | Requested | Used before | Blocked reason | Access |',
    '| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |',
    ...report.gateRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.dailyPlanTitle,
          row.courseCode,
          row.teacherName,
          row.decision,
          String(row.requestedMinutes),
          String(row.usedMinutesBeforeSession),
          row.blockedReason,
          row.safeDailyPlanAccess ? 'safe daily plan access' : 'blocked',
        ].join(' | ')} |`,
    ),
    '',
    '## Parent Grant Rows',
    '',
    '| Child | Guardian | Requested extra | Decision | Granted | Reason |',
    '| --- | --- | ---: | --- | ---: | --- |',
    ...report.grantRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.guardianName,
          String(row.requestedExtraMinutes),
          row.decision,
          String(row.grantedMinutes),
          row.decisionReason,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildParentScreenTimeGateRow(input: {
  gate: DemoLearningSessionGate;
  dailyPlan: DemoLearningDailyPlan;
  guardian: DemoLearningParentGuardian;
  enrollment: DemoLearningEnrollment;
  student: DemoLearningStudent;
  course: DemoLearningCourse;
  classesById: Map<string, DemoLearningClassCohort>;
  lessonsById: Map<string, DemoLearningLesson>;
}): DemoLearningParentScreenTimeGateRow {
  const classCohort = requireClass(input.classesById, input.dailyPlan.classId);
  const lesson = requireLesson(input.lessonsById, input.dailyPlan.lessonId);
  const safeDailyPlanAccess =
    input.gate.decision !== 'BLOCKED' &&
    input.gate.accessMode === 'SAFE_DAILY_PLAN';

  return {
    gateId: input.gate.id,
    dailyPlanId: input.dailyPlan.id,
    learningPathId: input.gate.learningPathId,
    enrollmentId: input.enrollment.id,
    studentId: input.student.id,
    childProfileId: input.student.childProfileId,
    studentName: input.student.displayName,
    guardianId: input.guardian.id,
    guardianName: input.guardian.displayName,
    courseId: input.course.id,
    courseCode: input.course.code,
    courseTitle: input.course.title,
    classId: classCohort.id,
    classCode: classCohort.code,
    teacherName: classCohort.teacherName,
    lessonId: lesson.id,
    lessonCode: lesson.code,
    dailyPlanTitle: input.dailyPlan.title,
    requestedAt: input.gate.requestedAt,
    requestedMinutes: input.gate.requestedMinutes,
    usedMinutesBeforeSession: input.gate.usedMinutesBeforeSession,
    sessionUsedMinutes: safeDailyPlanAccess ? input.gate.requestedMinutes : 0,
    decision: input.gate.decision,
    blockedReason: input.gate.blockedReason ?? 'NONE',
    decidedBy: input.gate.decidedBy,
    accessMode: input.gate.accessMode,
    safeDailyPlanAccess,
  };
}

export function buildParentScreenTimeGrantRow(input: {
  grant: DemoLearningScreenTimeGrantRequest;
  guardian: DemoLearningParentGuardian;
  student: DemoLearningStudent;
}): DemoLearningParentScreenTimeGrantRow {
  return {
    grantRequestId: input.grant.id,
    sessionGateId: input.grant.sessionGateId,
    guardianId: input.guardian.id,
    guardianName: input.guardian.displayName,
    studentId: input.student.id,
    childProfileId: input.student.childProfileId,
    studentName: input.student.displayName,
    requestedExtraMinutes: input.grant.requestedExtraMinutes,
    requestedAt: input.grant.requestedAt,
    decision: input.grant.decision,
    decidedAt: input.grant.decidedAt ?? null,
    grantedMinutes: input.grant.grantedMinutes,
    decisionReason: input.grant.decisionReason,
  };
}

export function buildParentScreenTimeGuardianControlsStatusCounts(
  fixture: DemoLearningCoreFixture,
): DemoLearningParentScreenTimeGuardianControlsStatusCounts {
  return {
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
  };
}

export function buildParentScreenTimeAttentionReason(input: {
  studentGates: DemoLearningSessionGate[];
  deniedGrantCount: number;
}) {
  const blockedSessionCount = input.studentGates.filter(
    (gate) => gate.decision === 'BLOCKED',
  ).length;

  if (input.deniedGrantCount > 0) {
    return `${input.deniedGrantCount} denied grant and ${blockedSessionCount} blocked session gate rows need parent review.`;
  }

  return `${blockedSessionCount} blocked session gate rows need parent review.`;
}
