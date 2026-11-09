import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningParentTeacherWeeklyDigestActionRow,
  DemoLearningParentTeacherWeeklyDigestReport,
  DemoLearningParentTeacherWeeklyDigestRow,
  DemoLearningParentTeacherWeeklyDigestStatusCounts,
  DemoLearningParentTeacherWeeklyDigestStudentRow,
  DemoLearningWeeklyDigestActionStatus,
  DemoLearningWeeklyDigestAudience,
  DemoLearningWeeklyDigestDeliveryStatus,
} from '../learning-local-demo.types';
import { buildAiTutorChatSafetyTeacherReviewReport } from './ai-tutor-chat-safety-teacher-review.report';
import { buildClassSessionAttendanceProgressReport } from './class-session-attendance-progress.report';
import { buildLearningPathDailyPlanVideoPracticeEvidenceReport } from './learning-path-daily-plan-video-practice-evidence.report';
import { buildLessonAssignmentAssessmentProgressReport } from './lesson-assignment-assessment-progress.report';
import { buildParentTeacherProgressAlertInterventionReport } from './parent-teacher-progress-alert-intervention.report';
import {
  countByStatus,
  groupBy,
  requireClass,
  requireCourseById,
  requireEnrollment,
  requireGuardian,
  requireStudentById,
  requireWeeklyDigest,
  weeklyDigestActionOwners,
  weeklyDigestActionPriorities,
} from './shared';
import { buildStudentAchievementBadgeCertificateReport } from './student-achievement-badge-certificate.report';

export const weeklyDigestAudiences: readonly DemoLearningWeeklyDigestAudience[] =
  ['PARENT', 'TEACHER'];

export const weeklyDigestDeliveryStatuses = [
  'READY_TO_SEND',
  'TEACHER_REVIEW',
  'HELD_WITHDRAWN',
] as readonly DemoLearningWeeklyDigestDeliveryStatus[];

export const weeklyDigestActionStatuses = [
  'RECOMMENDED',
  'SCHEDULED',
  'COMPLETED',
  'HELD',
] as readonly DemoLearningWeeklyDigestActionStatus[];

export function buildParentTeacherWeeklyDigestReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningParentTeacherWeeklyDigestReport {
  const progressReport = buildClassSessionAttendanceProgressReport(
    fixture,
    generatedAt,
  );
  const assessmentReport = buildLessonAssignmentAssessmentProgressReport(
    fixture,
    generatedAt,
  );
  const learningPathReport =
    buildLearningPathDailyPlanVideoPracticeEvidenceReport(fixture, generatedAt);
  const parentTeacherAlertReport =
    buildParentTeacherProgressAlertInterventionReport(fixture, generatedAt);
  const aiTutorReport = buildAiTutorChatSafetyTeacherReviewReport(
    fixture,
    generatedAt,
  );
  const achievementReport = buildStudentAchievementBadgeCertificateReport(
    fixture,
    generatedAt,
  );

  const studentsById = new Map(
    fixture.students.map((student) => [student.id, student]),
  );
  const enrollmentsById = new Map(
    fixture.enrollments.map((enrollment) => [enrollment.id, enrollment]),
  );
  const coursesById = new Map(
    fixture.courses.map((course) => [course.id, course]),
  );
  const classesById = new Map(
    fixture.classes.map((classCohort) => [classCohort.id, classCohort]),
  );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );
  const progressRowsByEnrollmentId = new Map(
    progressReport.learnerRows.map((row) => [row.enrollmentId, row]),
  );
  const assessmentRowsByEnrollmentId = new Map(
    assessmentReport.learnerRows.map((row) => [row.enrollmentId, row]),
  );
  const learningPathRowsByEnrollmentId = new Map(
    learningPathReport.learningPathRows.map((row) => [row.enrollmentId, row]),
  );
  const achievementRowsByStudentId = new Map(
    achievementReport.studentRows.map((row) => [row.studentId, row]),
  );
  const alertRowsById = new Map(
    parentTeacherAlertReport.alertRows.map((row) => [row.alertId, row]),
  );
  const recognitionRowsById = new Map(
    achievementReport.recognitionRows.map((row) => [
      row.recognitionSummaryId,
      row,
    ]),
  );
  const teacherReviewRowsById = new Map(
    aiTutorReport.teacherReviewRows.map((row) => [
      row.teacherReviewItemId,
      row,
    ]),
  );
  const certificateRowsById = new Map(
    achievementReport.certificateRows.map((row) => [
      row.certificateFixtureId,
      row,
    ]),
  );
  const digestActionsByDigestId = groupBy(
    fixture.weeklyDigestActions,
    (action) => action.digestId,
  );
  const digestById = new Map(
    fixture.weeklyDigests.map((digest) => [digest.id, digest]),
  );

  const digestRows = fixture.weeklyDigests
    .map((digest) => {
      const enrollment = requireEnrollment(
        enrollmentsById,
        digest.enrollmentId,
      );
      const student = requireStudentById(studentsById, digest.studentId);
      const course = requireCourseById(coursesById, digest.courseId);
      const classCohort = requireClass(classesById, digest.classId);
      const guardian = requireGuardian(guardiansById, digest.parentGuardianId);
      const progressRow = progressRowsByEnrollmentId.get(enrollment.id);
      if (!progressRow) {
        throw new Error(
          `Missing local demo weekly digest progress for ${digest.id}`,
        );
      }
      const assessmentRow = assessmentRowsByEnrollmentId.get(enrollment.id);
      if (!assessmentRow) {
        throw new Error(
          `Missing local demo weekly digest assessment for ${digest.id}`,
        );
      }
      const learningPathRow = learningPathRowsByEnrollmentId.get(enrollment.id);
      if (!learningPathRow) {
        throw new Error(
          `Missing local demo weekly digest learning path for ${digest.id}`,
        );
      }
      const achievementRow = achievementRowsByStudentId.get(student.id);
      if (!achievementRow) {
        throw new Error(
          `Missing local demo weekly digest achievement row for ${digest.id}`,
        );
      }
      const alertRows = digest.sourceAlertIds.map((alertId) => {
        const alertRow = alertRowsById.get(alertId);
        if (!alertRow) {
          throw new Error(`Missing local demo weekly digest alert ${alertId}`);
        }
        return alertRow;
      });
      const recognitionRows = digest.sourceRecognitionSummaryIds.map(
        (recognitionSummaryId) => {
          const recognitionRow = recognitionRowsById.get(recognitionSummaryId);
          if (!recognitionRow) {
            throw new Error(
              `Missing local demo weekly digest recognition ${recognitionSummaryId}`,
            );
          }
          return recognitionRow;
        },
      );
      for (const teacherReviewItemId of digest.sourceAiTutorTeacherReviewItemIds) {
        if (!teacherReviewRowsById.has(teacherReviewItemId)) {
          throw new Error(
            `Missing local demo weekly digest AI tutor review ${teacherReviewItemId}`,
          );
        }
      }
      if (
        digest.sourceCertificateFixtureId &&
        !certificateRowsById.has(digest.sourceCertificateFixtureId)
      ) {
        throw new Error(
          `Missing local demo weekly digest certificate ${digest.sourceCertificateFixtureId}`,
        );
      }
      if (
        enrollment.studentId !== student.id ||
        enrollment.courseId !== course.id ||
        classCohort.courseId !== course.id ||
        !guardian.childProfileIds.includes(student.childProfileId)
      ) {
        throw new Error(
          `Mismatched local demo weekly digest fixture for ${digest.id}`,
        );
      }

      const digestActions = digestActionsByDigestId.get(digest.id) ?? [];

      return {
        digestId: digest.id,
        weekStart: digest.weekStart,
        weekEnd: digest.weekEnd,
        audience: digest.audience,
        deliveryStatus: digest.deliveryStatus,
        parentVisible: digest.parentVisible,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        parentGuardianName: guardian.displayName,
        parentEmail: student.parentEmail,
        courseCode: course.code,
        classCode: classCohort.code,
        teacherName: classCohort.teacherName,
        progressStatus: progressRow.progressStatus,
        completionPercent: progressRow.completionPercent,
        attendanceRatePercent: progressRow.attendanceRatePercent,
        assignmentCompletionPercent: assessmentRow.assignmentCompletionPercent,
        averagePracticeScorePercent:
          learningPathRow.averagePracticeScorePercent,
        alertCount: alertRows.length,
        highRiskAlertCount: alertRows.filter(
          (alert) => alert.alertSeverity === 'HIGH',
        ).length,
        followUpNeededAlertCount: alertRows.filter(
          (alert) => alert.followUpStatus !== 'RESOLVED',
        ).length,
        achievementRecordCount: achievementRow.achievementRecordCount,
        badgeAwardCount: achievementRow.badgeAwardCount,
        certificateStatus: achievementRow.certificateStatus,
        recognitionSummaryCount: recognitionRows.length,
        parentVisibleRecognitionCount: recognitionRows.filter(
          (recognition) => recognition.parentVisible,
        ).length,
        actionCount: digestActions.length,
        highPriorityActionCount: digestActions.filter(
          (action) => action.priority === 'HIGH',
        ).length,
        sourceAlertIds: [...digest.sourceAlertIds],
        sourceRecognitionSummaryIds: [...digest.sourceRecognitionSummaryIds],
        sourceAiTutorTeacherReviewItemIds: [
          ...digest.sourceAiTutorTeacherReviewItemIds,
        ],
        sourceCertificateFixtureId: digest.sourceCertificateFixtureId ?? null,
        highlight: digest.highlight,
        riskSummary: digest.riskSummary,
        parentSummary: digest.parentSummary,
        teacherNote: digest.teacherNote,
      } satisfies DemoLearningParentTeacherWeeklyDigestRow;
    })
    .sort((left, right) =>
      [left.weekStart, left.studentName, left.audience, left.digestId]
        .join('|')
        .localeCompare(
          [
            right.weekStart,
            right.studentName,
            right.audience,
            right.digestId,
          ].join('|'),
        ),
    );

  const actionRows = fixture.weeklyDigestActions
    .map((action) => {
      const digest = requireWeeklyDigest(digestById, action.digestId);
      const student = requireStudentById(studentsById, action.studentId);
      const enrollment = requireEnrollment(
        enrollmentsById,
        digest.enrollmentId,
      );
      const course = requireCourseById(coursesById, digest.courseId);
      const classCohort = requireClass(classesById, digest.classId);
      const guardian = requireGuardian(guardiansById, digest.parentGuardianId);
      if (action.sourceAlertId && !alertRowsById.has(action.sourceAlertId)) {
        throw new Error(
          `Missing local demo weekly digest action alert ${action.sourceAlertId}`,
        );
      }
      if (
        action.sourceRecognitionSummaryId &&
        !recognitionRowsById.has(action.sourceRecognitionSummaryId)
      ) {
        throw new Error(
          `Missing local demo weekly digest action recognition ${action.sourceRecognitionSummaryId}`,
        );
      }
      if (
        enrollment.studentId !== student.id ||
        digest.studentId !== student.id ||
        !guardian.childProfileIds.includes(student.childProfileId)
      ) {
        throw new Error(
          `Mismatched local demo weekly digest action fixture for ${action.id}`,
        );
      }

      return {
        actionId: action.id,
        digestId: digest.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        parentGuardianName: guardian.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        owner: action.owner,
        priority: action.priority,
        status: action.status,
        dueAt: action.dueAt,
        sourceAlertId: action.sourceAlertId ?? null,
        sourceRecognitionSummaryId: action.sourceRecognitionSummaryId ?? null,
        actionSummary: action.actionSummary,
      } satisfies DemoLearningParentTeacherWeeklyDigestActionRow;
    })
    .sort((left, right) =>
      [left.dueAt, left.studentName, left.actionId]
        .join('|')
        .localeCompare(
          [right.dueAt, right.studentName, right.actionId].join('|'),
        ),
    );

  const digestRowsByStudentId = groupBy(digestRows, (row) => row.studentId);
  const actionRowsByStudentId = groupBy(actionRows, (row) => row.studentId);
  const studentRows = [...digestRowsByStudentId.entries()]
    .map(([studentId, studentDigestRows]) => {
      const first = studentDigestRows[0];
      const studentActions = actionRowsByStudentId.get(studentId) ?? [];
      const nextActionDueAt =
        studentActions
          .filter((action) => action.status !== 'COMPLETED')
          .map((action) => action.dueAt)
          .sort((left, right) => left.localeCompare(right))[0] ?? null;

      return {
        studentId,
        childProfileId: first.childProfileId,
        studentName: first.studentName,
        parentGuardianName: first.parentGuardianName,
        courseCode: first.courseCode,
        classCode: first.classCode,
        parentDigestCount: studentDigestRows.filter(
          (row) => row.audience === 'PARENT',
        ).length,
        teacherDigestCount: studentDigestRows.filter(
          (row) => row.audience === 'TEACHER',
        ).length,
        readyToSendDigestCount: studentDigestRows.filter(
          (row) => row.deliveryStatus === 'READY_TO_SEND',
        ).length,
        teacherReviewDigestCount: studentDigestRows.filter(
          (row) => row.deliveryStatus === 'TEACHER_REVIEW',
        ).length,
        heldWithdrawnDigestCount: studentDigestRows.filter(
          (row) => row.deliveryStatus === 'HELD_WITHDRAWN',
        ).length,
        actionCount: studentActions.length,
        highPriorityActionCount: studentActions.filter(
          (action) => action.priority === 'HIGH',
        ).length,
        completedActionCount: studentActions.filter(
          (action) => action.status === 'COMPLETED',
        ).length,
        nextActionDueAt,
        weeklySummary: buildWeeklyDigestStudentSummary(
          first.studentName,
          studentDigestRows,
          studentActions,
        ),
      } satisfies DemoLearningParentTeacherWeeklyDigestStudentRow;
    })
    .sort((left, right) =>
      [left.studentName, left.studentId]
        .join('|')
        .localeCompare([right.studentName, right.studentId].join('|')),
    );

  const statusCounts = buildParentTeacherWeeklyDigestStatusCounts(fixture);
  const studentsNeedingTeacherReview = new Set(
    digestRows
      .filter((row) => row.deliveryStatus !== 'READY_TO_SEND')
      .map((row) => row.studentId),
  ).size;
  const studentsReadyForParentSend = new Set(
    digestRows
      .filter(
        (row) =>
          row.audience === 'PARENT' &&
          row.parentVisible &&
          row.deliveryStatus === 'READY_TO_SEND',
      )
      .map((row) => row.studentId),
  ).size;

  return {
    reportName: 'Learning local demo Parent/Teacher Weekly Digest Report',
    generatedFor: 'local-demo-parent-teacher-weekly-digest-report',
    generatedAt,
    currency: fixture.currency,
    safety: {
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      aiProviderExecutionUsed: false,
      certificateIssuerProviderUsed: false,
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
      realAiChatMutationUsed: false,
      realAiModerationMutationUsed: false,
      realLearningSupportMutationUsed: false,
      realAchievementMutationUsed: false,
      realBadgeMutationUsed: false,
      realCertificateMutationUsed: false,
      realCredentialIssuanceUsed: false,
      realRecognitionNotificationMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realWeeklyDigestNotificationMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      digestCount: fixture.weeklyDigests.length,
      parentDigestCount: statusCounts.audience.PARENT,
      teacherDigestCount: statusCounts.audience.TEACHER,
      readyToSendDigestCount: statusCounts.deliveryStatus.READY_TO_SEND,
      teacherReviewDigestCount: statusCounts.deliveryStatus.TEACHER_REVIEW,
      heldWithdrawnDigestCount: statusCounts.deliveryStatus.HELD_WITHDRAWN,
      parentVisibleDigestCount: digestRows.filter((row) => row.parentVisible)
        .length,
      teacherOnlyDigestCount: digestRows.filter((row) => !row.parentVisible)
        .length,
      actionCount: fixture.weeklyDigestActions.length,
      highPriorityActionCount: statusCounts.actionPriority.HIGH,
      scheduledActionCount: statusCounts.actionStatus.SCHEDULED,
      completedActionCount: statusCounts.actionStatus.COMPLETED,
      studentsCovered: studentRows.length,
      studentsNeedingTeacherReview,
      studentsReadyForParentSend,
    },
    statusCounts,
    studentRows,
    digestRows,
    actionRows,
  };
}

export function toParentTeacherWeeklyDigestMarkdown(
  report: DemoLearningParentTeacherWeeklyDigestReport,
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
    '- aiProviderExecutionUsed=false',
    '- certificateIssuerProviderUsed=false',
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
    '- realAiChatMutationUsed=false',
    '- realAiModerationMutationUsed=false',
    '- realLearningSupportMutationUsed=false',
    '- realAchievementMutationUsed=false',
    '- realBadgeMutationUsed=false',
    '- realCertificateMutationUsed=false',
    '- realCredentialIssuanceUsed=false',
    '- realRecognitionNotificationMutationUsed=false',
    '- realParentMessageMutationUsed=false',
    '- realTeacherInterventionMutationUsed=false',
    '- realWeeklyDigestNotificationMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Weekly digests: ${report.totals.digestCount}`,
    `- Parent digests: ${report.totals.parentDigestCount}`,
    `- Teacher digests: ${report.totals.teacherDigestCount}`,
    `- Ready to send: ${report.totals.readyToSendDigestCount}`,
    `- Teacher review: ${report.totals.teacherReviewDigestCount}`,
    `- Held withdrawn: ${report.totals.heldWithdrawnDigestCount}`,
    `- Parent-visible digests: ${report.totals.parentVisibleDigestCount}`,
    `- Teacher-only digests: ${report.totals.teacherOnlyDigestCount}`,
    `- Digest actions: ${report.totals.actionCount}`,
    `- High-priority actions: ${report.totals.highPriorityActionCount}`,
    `- Scheduled actions: ${report.totals.scheduledActionCount}`,
    `- Completed actions: ${report.totals.completedActionCount}`,
    `- Students covered: ${report.totals.studentsCovered}`,
    `- Students needing teacher review: ${report.totals.studentsNeedingTeacherReview}`,
    `- Students ready for parent send: ${report.totals.studentsReadyForParentSend}`,
    '',
    '## Student Weekly Digest Rows',
    '',
    '| Student | Course | Parent digests | Teacher digests | Ready | Review | Held | Actions | High priority | Completed | Next action | Summary |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |',
    ...report.studentRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          `${row.courseCode} / ${row.classCode}`,
          String(row.parentDigestCount),
          String(row.teacherDigestCount),
          String(row.readyToSendDigestCount),
          String(row.teacherReviewDigestCount),
          String(row.heldWithdrawnDigestCount),
          String(row.actionCount),
          String(row.highPriorityActionCount),
          String(row.completedActionCount),
          row.nextActionDueAt ?? 'n/a',
          row.weeklySummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Weekly Digest Rows',
    '',
    '| Digest | Week | Student | Audience | Status | Parent visible | Progress | Attendance | Assignments | Practice | Alerts | Actions | Certificate | Highlight | Risk |',
    '| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |',
    ...report.digestRows.map(
      (row) =>
        `| ${[
          row.digestId,
          `${row.weekStart} to ${row.weekEnd}`,
          `${row.studentName} (${row.childProfileId})`,
          row.audience,
          row.deliveryStatus,
          row.parentVisible ? 'YES' : 'NO',
          `${row.progressStatus} ${row.completionPercent}%`,
          String(row.attendanceRatePercent),
          String(row.assignmentCompletionPercent),
          String(row.averagePracticeScorePercent),
          String(row.alertCount),
          String(row.actionCount),
          row.certificateStatus,
          row.highlight,
          row.riskSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Action Rows',
    '',
    '| Action | Student | Owner | Priority | Status | Due at | Alert | Recognition | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.actionRows.map(
      (row) =>
        `| ${[
          row.actionId,
          `${row.studentName} (${row.childProfileId})`,
          row.owner,
          row.priority,
          row.status,
          row.dueAt,
          row.sourceAlertId ?? 'n/a',
          row.sourceRecognitionSummaryId ?? 'n/a',
          row.actionSummary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildParentTeacherWeeklyDigestStatusCounts(
  fixture: DemoLearningCoreFixture,
): DemoLearningParentTeacherWeeklyDigestStatusCounts {
  return {
    audience: countByStatus(
      weeklyDigestAudiences,
      fixture.weeklyDigests,
      (digest) => digest.audience,
    ),
    deliveryStatus: countByStatus(
      weeklyDigestDeliveryStatuses,
      fixture.weeklyDigests,
      (digest) => digest.deliveryStatus,
    ),
    actionPriority: countByStatus(
      weeklyDigestActionPriorities,
      fixture.weeklyDigestActions,
      (action) => action.priority,
    ),
    actionStatus: countByStatus(
      weeklyDigestActionStatuses,
      fixture.weeklyDigestActions,
      (action) => action.status,
    ),
    actionOwner: countByStatus(
      weeklyDigestActionOwners,
      fixture.weeklyDigestActions,
      (action) => action.owner,
    ),
  };
}

export function buildWeeklyDigestStudentSummary(
  studentName: string,
  digestRows: DemoLearningParentTeacherWeeklyDigestRow[],
  actionRows: DemoLearningParentTeacherWeeklyDigestActionRow[],
) {
  const ready = digestRows.filter(
    (row) => row.deliveryStatus === 'READY_TO_SEND',
  ).length;
  const review = digestRows.filter(
    (row) => row.deliveryStatus === 'TEACHER_REVIEW',
  ).length;
  const held = digestRows.filter(
    (row) => row.deliveryStatus === 'HELD_WITHDRAWN',
  ).length;
  const highPriority = actionRows.filter(
    (row) => row.priority === 'HIGH',
  ).length;

  if (held > 0) {
    return `${studentName} has a teacher-only weekly digest held because the fixture enrollment is withdrawn.`;
  }

  if (review > 0) {
    return `${studentName} has ${review} digest pending teacher review and ${highPriority} high-priority action.`;
  }

  return `${studentName} has ${ready} parent-ready weekly digest and ${actionRows.length} fixture action.`;
}
