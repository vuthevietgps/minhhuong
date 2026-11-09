import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningClassCohort,
  DemoLearningCoreFixture,
  DemoLearningCourse,
  DemoLearningPathStatus,
  DemoLearningParentTeacherAlertReasonSummaryRow,
  DemoLearningParentTeacherLearnerSummaryRow,
  DemoLearningParentTeacherProgressAlertInterventionReport,
  DemoLearningParentTeacherProgressAlertRow,
  DemoLearningParentTeacherProgressAlertStatusCounts,
  DemoLearningStudent,
  DemoLearningProgressAlertFollowUpStatus,
  DemoLearningProgressAlertReason,
  DemoLearningProgressAlertSeverity,
  DemoLearningProgressRecord,
} from '../learning-local-demo.types';
import { buildLearningPathDailyPlanVideoPracticeEvidenceReport } from './learning-path-daily-plan-video-practice-evidence.report';
import {
  averagePracticeScorePercent,
  countAttendanceStatuses,
  countByStatus,
  countDailyPlanStatuses,
  countSubmissionStatuses,
  countVideoEvidenceStatuses,
  groupBy,
  percent,
  requireClass,
  requireCourseById,
  requireEnrollment,
  requireProgress,
  requireStudent,
} from './shared';

export const progressAlertSeverities = ['HIGH', 'MEDIUM'] as const;

export const progressAlertReasons = [
  'MISSING_SUBMISSIONS',
  'LOW_PRACTICE_SCORE',
  'SKIPPED_VIDEO',
  'ATTENDANCE_SESSION_GAP',
  'STALLED_DAILY_PLAN',
] as const;

export const progressAlertFollowUpStatuses = [
  'OPEN',
  'SCHEDULED',
  'RESOLVED',
  'MONITORING',
] as const;

export type ParentTeacherProgressAlertContext = {
  learningPathId: string;
  enrollmentId: string;
  student: DemoLearningStudent;
  course: DemoLearningCourse;
  classCohort: DemoLearningClassCohort;
  progress: DemoLearningProgressRecord;
  pathStatus: DemoLearningPathStatus;
  progressPercent: number;
  attendanceRatePercent: number;
  absentAttendanceCount: number;
  missingSubmissionCount: number;
  skippedVideoCount: number;
  incompleteVideoCount: number;
  blockedDailyPlanCount: number;
  skippedDailyPlanCount: number;
  incompleteDailyPlanCount: number;
  averagePracticeScorePercent: number;
};

export function buildParentTeacherProgressAlertInterventionReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningParentTeacherProgressAlertInterventionReport {
  const pathReport = buildLearningPathDailyPlanVideoPracticeEvidenceReport(
    fixture,
    generatedAt,
  );
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
  const progressByEnrollmentId = new Map(
    fixture.progress.map((progress) => [progress.enrollmentId, progress]),
  );
  const submissionsByEnrollmentId = groupBy(
    fixture.submissions,
    (submission) => submission.enrollmentId,
  );
  const attendanceByEnrollmentId = groupBy(
    fixture.attendance,
    (attendance) => attendance.enrollmentId,
  );
  const dailyPlansByPathId = groupBy(
    fixture.dailyPlans,
    (plan) => plan.learningPathId,
  );
  const videoEvidenceByPathId = groupBy(
    fixture.videoEvidence,
    (evidence) => evidence.learningPathId,
  );
  const practiceAttemptsByPathId = groupBy(
    fixture.practiceAttempts,
    (attempt) => attempt.learningPathId,
  );

  const contexts = pathReport.learningPathRows.map((pathRow) => {
    const enrollment = requireEnrollment(enrollmentsById, pathRow.enrollmentId);
    const student = requireStudent(studentsById, enrollment);
    const course = requireCourseById(coursesById, pathRow.courseId);
    const classCohort = requireClass(classesById, pathRow.classId);
    const progress = requireProgress(
      progressByEnrollmentId,
      pathRow.enrollmentId,
    );
    const submissions = submissionsByEnrollmentId.get(enrollment.id) ?? [];
    const submissionCounts = countSubmissionStatuses(submissions);
    const attendance = attendanceByEnrollmentId.get(enrollment.id) ?? [];
    const attendanceCounts = countAttendanceStatuses(attendance);
    const dailyPlans = dailyPlansByPathId.get(pathRow.learningPathId) ?? [];
    const dailyPlanCounts = countDailyPlanStatuses(dailyPlans);
    const videoEvidence =
      videoEvidenceByPathId.get(pathRow.learningPathId) ?? [];
    const videoEvidenceCounts = countVideoEvidenceStatuses(videoEvidence);
    const practiceAttempts =
      practiceAttemptsByPathId.get(pathRow.learningPathId) ?? [];

    return {
      learningPathId: pathRow.learningPathId,
      enrollmentId: pathRow.enrollmentId,
      student,
      course,
      classCohort,
      progress,
      pathStatus: pathRow.pathStatus,
      progressPercent: pathRow.progressPercent,
      attendanceRatePercent: percent(
        attendanceCounts.PRESENT + attendanceCounts.LATE,
        attendance.length,
      ),
      absentAttendanceCount: attendanceCounts.ABSENT,
      missingSubmissionCount: submissionCounts.MISSING,
      skippedVideoCount: videoEvidenceCounts.SKIPPED,
      incompleteVideoCount: videoEvidenceCounts.INCOMPLETE,
      blockedDailyPlanCount: dailyPlanCounts.BLOCKED,
      skippedDailyPlanCount: dailyPlanCounts.SKIPPED,
      incompleteDailyPlanCount: dailyPlans.length - dailyPlanCounts.COMPLETED,
      averagePracticeScorePercent:
        averagePracticeScorePercent(practiceAttempts),
    } satisfies ParentTeacherProgressAlertContext;
  });

  const alertRows = contexts
    .flatMap((context) => buildParentTeacherProgressAlertRows(context))
    .sort((left, right) =>
      [
        left.alertSeverity === 'HIGH' ? '0' : '1',
        left.classCode,
        left.studentName,
        left.alertReason,
      ]
        .join('|')
        .localeCompare(
          [
            right.alertSeverity === 'HIGH' ? '0' : '1',
            right.classCode,
            right.studentName,
            right.alertReason,
          ].join('|'),
        ),
    );
  const alertsByEnrollmentId = groupBy(alertRows, (row) => row.enrollmentId);
  const learnerSummaries = contexts
    .map((context) =>
      buildParentTeacherLearnerSummaryRow(
        context,
        alertsByEnrollmentId.get(context.enrollmentId) ?? [],
      ),
    )
    .sort((left, right) =>
      [left.classCode, left.studentName, left.learningPathId]
        .join('|')
        .localeCompare(
          [right.classCode, right.studentName, right.learningPathId].join('|'),
        ),
    );
  const statusCounts = buildParentTeacherProgressAlertStatusCounts(alertRows);
  const resolvedAlertCount = statusCounts.followUpStatus.RESOLVED;

  return {
    reportName:
      'Learning local demo Parent/Teacher Progress Alert -> Intervention -> Parent Summary Report',
    generatedFor:
      'local-demo-parent-teacher-progress-alert-intervention-report',
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
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      studentCount: new Set(learnerSummaries.map((row) => row.studentId)).size,
      courseCount: new Set(learnerSummaries.map((row) => row.courseId)).size,
      learnerProgressSummaryCount: learnerSummaries.length,
      alertCount: alertRows.length,
      highRiskAlertCount: statusCounts.alertSeverity.HIGH,
      mediumRiskAlertCount: statusCounts.alertSeverity.MEDIUM,
      resolvedAlertCount,
      followUpNeededAlertCount: alertRows.length - resolvedAlertCount,
      teacherInterventionRecommendationCount: alertRows.length,
      parentSummaryCount: alertRows.length,
      openFollowUpCount: statusCounts.followUpStatus.OPEN,
      scheduledFollowUpCount: statusCounts.followUpStatus.SCHEDULED,
      resolvedFollowUpCount: statusCounts.followUpStatus.RESOLVED,
      monitoringFollowUpCount: statusCounts.followUpStatus.MONITORING,
    },
    statusCounts,
    topAlertReasons: buildTopAlertReasonRows(statusCounts.alertReason),
    learnerSummaries,
    alertRows,
  };
}

export function toParentTeacherProgressAlertInterventionMarkdown(
  report: DemoLearningParentTeacherProgressAlertInterventionReport,
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
    `- Students/children: ${report.totals.studentCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Learner progress summaries: ${report.totals.learnerProgressSummaryCount}`,
    `- Alerts: ${report.totals.alertCount}`,
    `- High-risk alerts: ${report.totals.highRiskAlertCount}`,
    `- Medium-risk alerts: ${report.totals.mediumRiskAlertCount}`,
    `- Resolved alerts: ${report.totals.resolvedAlertCount}`,
    `- Follow-up-needed alerts: ${report.totals.followUpNeededAlertCount}`,
    `- Teacher intervention recommendations: ${report.totals.teacherInterventionRecommendationCount}`,
    `- Parent summaries: ${report.totals.parentSummaryCount}`,
    `- Follow-up status bands: open=${report.totals.openFollowUpCount}, scheduled=${report.totals.scheduledFollowUpCount}, resolved=${report.totals.resolvedFollowUpCount}, monitoring=${report.totals.monitoringFollowUpCount}`,
    '',
    '## Top Alert Reasons',
    '',
    '| Reason | Alerts |',
    '| --- | ---: |',
    ...report.topAlertReasons.map(
      (row) => `| ${row.reasonLabel} | ${row.alertCount} |`,
    ),
    '',
    '## Learner Progress Summaries',
    '',
    '| Student | Course | Class | Teacher | Progress | Attendance | Missing | Skipped videos | Blocked plans | Avg practice | Alerts | Follow-up needed | Highest risk |',
    '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
    ...report.learnerSummaries.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.classCode,
          row.teacherName,
          `${row.progressPercent}%`,
          `${row.attendanceRatePercent}%`,
          String(row.missingSubmissionCount),
          String(row.skippedVideoCount),
          String(row.blockedDailyPlanCount),
          `${row.averagePracticeScorePercent}%`,
          String(row.alertCount),
          String(row.followUpNeededAlertCount),
          row.highestAlertSeverity,
        ].join(' | ')} |`,
    ),
    '',
    '## Alert Intervention Rows',
    '',
    '| Student | Severity | Reason | Follow-up | Evidence | Teacher intervention | Parent summary |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.alertRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.alertSeverity,
          row.reasonLabel,
          `${row.followUpStatus} ${row.recommendedFollowUpAt}`,
          row.evidenceSummary,
          row.teacherInterventionRecommendation,
          row.parentSummary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildParentTeacherProgressAlertRows(
  context: ParentTeacherProgressAlertContext,
): DemoLearningParentTeacherProgressAlertRow[] {
  const rows: DemoLearningParentTeacherProgressAlertRow[] = [];
  const addAlert = (
    alertReason: DemoLearningProgressAlertReason,
    alertSeverity: DemoLearningProgressAlertSeverity,
    followUpStatus: DemoLearningProgressAlertFollowUpStatus,
    recommendedFollowUpAt: string,
  ) => {
    rows.push(
      buildParentTeacherProgressAlertRow({
        context,
        alertReason,
        alertSeverity,
        followUpStatus,
        recommendedFollowUpAt,
      }),
    );
  };

  if (
    context.pathStatus !== 'WITHDRAWN' &&
    context.missingSubmissionCount >= 2
  ) {
    addAlert('MISSING_SUBMISSIONS', 'HIGH', 'OPEN', '2026-06-06T09:00:00.000Z');
  }

  if (
    context.pathStatus !== 'WITHDRAWN' &&
    context.averagePracticeScorePercent > 0 &&
    context.averagePracticeScorePercent < 70
  ) {
    addAlert(
      'LOW_PRACTICE_SCORE',
      'HIGH',
      'SCHEDULED',
      '2026-06-06T10:00:00.000Z',
    );
  }

  if (context.skippedVideoCount > 0) {
    addAlert(
      'SKIPPED_VIDEO',
      'MEDIUM',
      context.pathStatus === 'WITHDRAWN' ? 'RESOLVED' : 'OPEN',
      context.pathStatus === 'WITHDRAWN'
        ? '2026-05-24T09:30:00.000Z'
        : '2026-06-06T11:00:00.000Z',
    );
  }

  if (
    context.pathStatus !== 'WITHDRAWN' &&
    context.absentAttendanceCount > 0 &&
    context.attendanceRatePercent < 75
  ) {
    addAlert(
      'ATTENDANCE_SESSION_GAP',
      'MEDIUM',
      'SCHEDULED',
      '2026-06-06T13:00:00.000Z',
    );
  }

  if (
    context.pathStatus !== 'WITHDRAWN' &&
    (context.blockedDailyPlanCount > 0 || context.incompleteDailyPlanCount > 0)
  ) {
    addAlert(
      'STALLED_DAILY_PLAN',
      'MEDIUM',
      context.blockedDailyPlanCount > 0 ? 'OPEN' : 'MONITORING',
      context.blockedDailyPlanCount > 0
        ? '2026-06-06T14:00:00.000Z'
        : '2026-06-07T09:00:00.000Z',
    );
  }

  return rows;
}

export function buildParentTeacherProgressAlertRow(input: {
  context: ParentTeacherProgressAlertContext;
  alertReason: DemoLearningProgressAlertReason;
  alertSeverity: DemoLearningProgressAlertSeverity;
  followUpStatus: DemoLearningProgressAlertFollowUpStatus;
  recommendedFollowUpAt: string;
}): DemoLearningParentTeacherProgressAlertRow {
  const copy = buildParentTeacherProgressAlertCopy(
    input.context,
    input.alertReason,
  );

  return {
    alertId: `alert-${input.context.student.id}-${input.alertReason
      .toLowerCase()
      .replace(/_/g, '-')}`,
    learningPathId: input.context.learningPathId,
    enrollmentId: input.context.enrollmentId,
    studentId: input.context.student.id,
    childProfileId: input.context.student.childProfileId,
    studentName: input.context.student.displayName,
    parentEmail: input.context.student.parentEmail,
    courseId: input.context.course.id,
    courseCode: input.context.course.code,
    courseTitle: input.context.course.title,
    classId: input.context.classCohort.id,
    classCode: input.context.classCohort.code,
    classTitle: input.context.classCohort.title,
    teacherName: input.context.classCohort.teacherName,
    alertSeverity: input.alertSeverity,
    alertReason: input.alertReason,
    reasonLabel: labelProgressAlertReason(input.alertReason),
    evidenceSummary: copy.evidenceSummary,
    progressPercent: input.context.progressPercent,
    attendanceRatePercent: input.context.attendanceRatePercent,
    missingSubmissionCount: input.context.missingSubmissionCount,
    skippedVideoCount: input.context.skippedVideoCount,
    blockedDailyPlanCount: input.context.blockedDailyPlanCount,
    averagePracticeScorePercent: input.context.averagePracticeScorePercent,
    teacherInterventionRecommendation: copy.teacherInterventionRecommendation,
    parentSummary: copy.parentSummary,
    followUpStatus: input.followUpStatus,
    recommendedFollowUpAt: input.recommendedFollowUpAt,
  };
}

export function buildParentTeacherProgressAlertCopy(
  context: ParentTeacherProgressAlertContext,
  reason: DemoLearningProgressAlertReason,
) {
  switch (reason) {
    case 'MISSING_SUBMISSIONS':
      return {
        evidenceSummary: `${context.missingSubmissionCount} missing submissions with ${context.progressPercent}% path progress.`,
        teacherInterventionRecommendation:
          'Teacher reviews missed tasks, assigns a short catch-up checklist, and records parent call outcome in local-demo notes.',
        parentSummary: `${context.student.displayName} needs parent support to complete ${context.missingSubmissionCount} missing assignments before the next fixture session.`,
      };
    case 'LOW_PRACTICE_SCORE':
      return {
        evidenceSummary: `${context.averagePracticeScorePercent}% average practice score across scored fixture attempts.`,
        teacherInterventionRecommendation:
          'Teacher schedules a 15-minute remedial practice block using the existing colors and objects exercise.',
        parentSummary: `${context.student.displayName} should retry the practice set with teacher guidance because the score is below the 70% support threshold.`,
      };
    case 'SKIPPED_VIDEO':
      if (context.pathStatus === 'WITHDRAWN') {
        return {
          evidenceSummary: `${context.skippedVideoCount} skipped video after the local-demo withdrawal/refund state.`,
          teacherInterventionRecommendation:
            'Teacher marks the skipped-video item resolved because this learner is withdrawn in synthetic fixtures.',
          parentSummary: `${context.student.displayName}'s skipped-video follow-up is resolved in the local-demo withdrawal fixture.`,
        };
      }

      return {
        evidenceSummary: `${context.skippedVideoCount} skipped video and ${context.incompleteVideoCount} incomplete video records.`,
        teacherInterventionRecommendation:
          'Teacher reopens the skipped video and asks the parent to confirm a home viewing window.',
        parentSummary: `${context.student.displayName} needs to watch the skipped fixture video before continuing the daily plan.`,
      };
    case 'ATTENDANCE_SESSION_GAP':
      return {
        evidenceSummary: `${context.attendanceRatePercent}% attendance rate with ${context.absentAttendanceCount} absent session record.`,
        teacherInterventionRecommendation:
          'Teacher schedules an attendance check-in and shares the catch-up lesson sequence with the parent.',
        parentSummary: `${context.student.displayName} missed a fixture session and needs a catch-up plan for the next class.`,
      };
    case 'STALLED_DAILY_PLAN':
      return {
        evidenceSummary: `${context.blockedDailyPlanCount} blocked, ${context.skippedDailyPlanCount} skipped, and ${context.incompleteDailyPlanCount} incomplete daily plans.`,
        teacherInterventionRecommendation:
          context.blockedDailyPlanCount > 0
            ? 'Teacher unblocks the current daily plan with one guided retry and checks parent availability.'
            : 'Teacher monitors the open daily plan and reminds the parent to finish the video/practice pair.',
        parentSummary:
          context.blockedDailyPlanCount > 0
            ? `${context.student.displayName} has a blocked fixture daily plan that needs teacher and parent follow-up.`
            : `${context.student.displayName} is on track but should finish the open fixture daily plan.`,
      };
  }
}

export function buildParentTeacherLearnerSummaryRow(
  context: ParentTeacherProgressAlertContext,
  alerts: DemoLearningParentTeacherProgressAlertRow[],
): DemoLearningParentTeacherLearnerSummaryRow {
  const highRiskAlertCount = alerts.filter(
    (alert) => alert.alertSeverity === 'HIGH',
  ).length;
  const mediumRiskAlertCount = alerts.filter(
    (alert) => alert.alertSeverity === 'MEDIUM',
  ).length;
  const resolvedAlertCount = alerts.filter(
    (alert) => alert.followUpStatus === 'RESOLVED',
  ).length;

  return {
    learningPathId: context.learningPathId,
    enrollmentId: context.enrollmentId,
    studentId: context.student.id,
    childProfileId: context.student.childProfileId,
    studentName: context.student.displayName,
    parentEmail: context.student.parentEmail,
    courseId: context.course.id,
    courseCode: context.course.code,
    courseTitle: context.course.title,
    classId: context.classCohort.id,
    classCode: context.classCohort.code,
    classTitle: context.classCohort.title,
    teacherName: context.classCohort.teacherName,
    progressStatus: context.progress.status,
    progressPercent: context.progressPercent,
    attendanceRatePercent: context.attendanceRatePercent,
    missingSubmissionCount: context.missingSubmissionCount,
    skippedVideoCount: context.skippedVideoCount,
    blockedDailyPlanCount: context.blockedDailyPlanCount,
    averagePracticeScorePercent: context.averagePracticeScorePercent,
    alertCount: alerts.length,
    highRiskAlertCount,
    mediumRiskAlertCount,
    followUpNeededAlertCount: alerts.length - resolvedAlertCount,
    highestAlertSeverity:
      highRiskAlertCount > 0
        ? 'HIGH'
        : mediumRiskAlertCount > 0
          ? 'MEDIUM'
          : 'NONE',
  };
}

export function buildParentTeacherProgressAlertStatusCounts(
  alertRows: DemoLearningParentTeacherProgressAlertRow[],
): DemoLearningParentTeacherProgressAlertStatusCounts {
  return {
    alertSeverity: countByStatus(
      progressAlertSeverities,
      alertRows,
      (row) => row.alertSeverity,
    ),
    alertReason: countByStatus(
      progressAlertReasons,
      alertRows,
      (row) => row.alertReason,
    ),
    followUpStatus: countByStatus(
      progressAlertFollowUpStatuses,
      alertRows,
      (row) => row.followUpStatus,
    ),
  };
}

export function buildTopAlertReasonRows(
  reasonCounts: Record<DemoLearningProgressAlertReason, number>,
): DemoLearningParentTeacherAlertReasonSummaryRow[] {
  return progressAlertReasons
    .map((alertReason) => ({
      alertReason,
      reasonLabel: labelProgressAlertReason(alertReason),
      alertCount: reasonCounts[alertReason],
    }))
    .filter((row) => row.alertCount > 0)
    .sort(
      (left, right) =>
        right.alertCount - left.alertCount ||
        left.reasonLabel.localeCompare(right.reasonLabel),
    );
}

export function labelProgressAlertReason(
  reason: DemoLearningProgressAlertReason,
) {
  switch (reason) {
    case 'MISSING_SUBMISSIONS':
      return 'Missing submissions';
    case 'LOW_PRACTICE_SCORE':
      return 'Low practice score';
    case 'SKIPPED_VIDEO':
      return 'Skipped video';
    case 'ATTENDANCE_SESSION_GAP':
      return 'Attendance/session gap';
    case 'STALLED_DAILY_PLAN':
      return 'Stalled daily plan';
  }
}
