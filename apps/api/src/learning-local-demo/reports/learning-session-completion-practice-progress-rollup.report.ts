import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningDailyPlan,
  DemoLearningPracticeAttempt,
  DemoLearningSessionCompletionPracticeProgressEvidenceRow,
  DemoLearningSessionCompletionPracticeProgressParentSummaryRow,
  DemoLearningSessionCompletionPracticeProgressRollupReport,
  DemoLearningSessionCompletionPracticeProgressRollupRow,
  DemoLearningSessionCompletionPracticeProgressRollupSafety,
  DemoLearningSessionCompletionPracticeProgressRollupStatus,
  DemoLearningSessionCompletionPracticeProgressRollupStatusCounts,
  DemoLearningSessionCompletionPracticeProgressTeacherSummaryRow,
  DemoLearningProgressRecord,
  DemoLearningVideoEvidence,
} from '../learning-local-demo.types';
import { buildParentScreenTimeGrantDailyPlanGuardReport } from './parent-screen-time-grant-daily-plan-guard.report';
import {
  averagePercent,
  countByStatus,
  dailyPlanGuardAccessResults,
  dailyPlanStatuses,
  percent,
  practiceAttemptStatuses,
  requireClass,
  requireCourseById,
  requireDailyPlan,
  requireEnrollment,
  requireGuardian,
  requireLearningPath,
  requireLesson,
  requirePracticeAttempt,
  requireProgress,
  requireVideoEvidence,
} from './shared';

export const sessionCompletionPracticeProgressRollupStatuses: readonly DemoLearningSessionCompletionPracticeProgressRollupStatus[] =
  ['COMPLETED', 'ON_TRACK', 'NEEDS_SUPPORT', 'IN_PROGRESS'];

export function buildLearningSessionCompletionPracticeProgressRollupReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningSessionCompletionPracticeProgressRollupReport {
  const guardReport = buildParentScreenTimeGrantDailyPlanGuardReport(
    fixture,
    generatedAt,
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
  const progressByEnrollmentId = new Map(
    fixture.progress.map((progress) => [progress.enrollmentId, progress]),
  );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );
  const videoEvidenceByDailyPlanId = new Map(
    fixture.videoEvidence.map((evidence) => [evidence.dailyPlanId, evidence]),
  );
  const practiceAttemptByDailyPlanId = new Map(
    fixture.practiceAttempts.map((attempt) => [attempt.dailyPlanId, attempt]),
  );
  const allowedAccessRows = guardReport.accessRows.filter(
    (row) => row.accessResult === 'ALLOWED_SESSION',
  );

  const progressRollupRows: DemoLearningSessionCompletionPracticeProgressRollupRow[] =
    allowedAccessRows
      .map((accessRow) => {
        const dailyPlan = requireDailyPlan(
          dailyPlansById,
          accessRow.dailyPlanId,
        );
        const learningPath = requireLearningPath(
          learningPathsById,
          accessRow.learningPathId,
        );
        const enrollment = requireEnrollment(
          enrollmentsById,
          accessRow.sessionGuardTraceIds[2] === accessRow.studentId
            ? dailyPlan.enrollmentId
            : learningPath.enrollmentId,
        );
        const course = requireCourseById(coursesById, accessRow.courseId);
        const classCohort = requireClass(classesById, dailyPlan.classId);
        const lesson = requireLesson(lessonsById, dailyPlan.lessonId);
        const progress = requireProgress(progressByEnrollmentId, enrollment.id);
        const guardian = requireGuardian(
          guardiansById,
          accessRow.parentGuardianId,
        );
        const videoEvidence = requireVideoEvidence(
          videoEvidenceByDailyPlanId,
          dailyPlan.id,
        );
        const practiceAttempt = requirePracticeAttempt(
          practiceAttemptByDailyPlanId,
          dailyPlan.id,
        );
        const progressRollupId = `progress-rollup-${accessRow.learningSessionEvidenceId}`;
        const parentVisibleProgressSummaryId = `parent-progress-summary-${accessRow.accessCaseId}`;
        const teacherVisibleProgressSummaryId = `teacher-progress-summary-${accessRow.accessCaseId}`;
        const lessonCompletionEvidenceId = `lesson-completion-${videoEvidence.id}`;
        const practiceScorePercent = practiceAttempt.scorePercent ?? 0;
        const rollupStatus = buildSessionCompletionPracticeProgressRollupStatus(
          {
            dailyPlan,
            videoEvidence,
            practiceAttempt,
            progress,
          },
        );
        const nextSafeActionLabel =
          buildSessionCompletionPracticeProgressNextAction({
            rollupStatus,
            practiceScorePercent,
          });
        const stableTraceIds = [
          accessRow.studentId,
          course.id,
          dailyPlan.id,
          accessRow.sessionId,
          lesson.id,
          accessRow.learningSessionEvidenceId,
          lessonCompletionEvidenceId,
          videoEvidence.id,
          practiceAttempt.id,
          progress.id,
          progressRollupId,
          parentVisibleProgressSummaryId,
          teacherVisibleProgressSummaryId,
        ];

        return {
          progressRollupId,
          stableTraceKey: stableTraceIds.join('->'),
          stableTraceIds,
          accessCaseId: accessRow.accessCaseId,
          learningSessionEvidenceId: accessRow.learningSessionEvidenceId,
          sessionGateId: accessRow.sessionGuardTraceIds[7],
          sessionId: accessRow.sessionId,
          studentId: accessRow.studentId,
          childProfileId: accessRow.childProfileId,
          studentName: accessRow.studentName,
          parentGuardianId: guardian.id,
          parentGuardianName: guardian.displayName,
          teacherName: classCohort.teacherName,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          classId: classCohort.id,
          classCode: classCohort.code,
          learningPathId: learningPath.id,
          dailyPlanId: dailyPlan.id,
          dailyPlanTitle: dailyPlan.title,
          dailyPlanStatus: dailyPlan.status,
          lessonId: lesson.id,
          lessonCode: lesson.code,
          lessonTitle: lesson.title,
          videoEvidenceId: videoEvidence.id,
          videoEvidenceStatus: videoEvidence.status,
          videoCompletionPercent: percent(
            videoEvidence.watchedSeconds,
            videoEvidence.requiredSeconds,
          ),
          lessonCompletionEvidenceId,
          lessonCompletionStatus: videoEvidence.status,
          practiceAttemptId: practiceAttempt.id,
          practiceAttemptStatus: practiceAttempt.status,
          practiceAttemptNumber: practiceAttempt.attemptNumber,
          practiceScorePercent,
          progressRecordId: progress.id,
          completionPercent: progress.completionPercent,
          progressStatus: progress.status,
          rollupStatus,
          parentVisibleProgressSummaryId,
          teacherVisibleProgressSummaryId,
          nextSafeActionLabel,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary: `${accessRow.studentName} allowed session ${accessRow.learningSessionEvidenceId} rolls up ${lesson.code}, video ${videoEvidence.status}, practice ${practiceAttempt.status} ${practiceScorePercent}%, and ${progress.completionPercent}% course progress.`,
        } satisfies DemoLearningSessionCompletionPracticeProgressRollupRow;
      })
      .sort((left, right) =>
        [
          left.courseCode,
          left.studentName,
          left.dailyPlanId,
          left.progressRollupId,
        ]
          .join('|')
          .localeCompare(
            [
              right.courseCode,
              right.studentName,
              right.dailyPlanId,
              right.progressRollupId,
            ].join('|'),
          ),
      );

  const parentSummaryRows: DemoLearningSessionCompletionPracticeProgressParentSummaryRow[] =
    progressRollupRows.map((row) => {
      const guardian = requireGuardian(guardiansById, row.parentGuardianId);

      return {
        parentVisibleProgressSummaryId: row.parentVisibleProgressSummaryId,
        progressRollupId: row.progressRollupId,
        stableTraceKey: row.stableTraceKey,
        parentGuardianId: guardian.id,
        parentGuardianName: guardian.displayName,
        parentGuardianEmail: guardian.email,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        courseCode: row.courseCode,
        dailyPlanId: row.dailyPlanId,
        dailyPlanTitle: row.dailyPlanTitle,
        completionPercent: row.completionPercent,
        practiceScorePercent: row.practiceScorePercent,
        rollupStatus: row.rollupStatus,
        nextSafeActionLabel: row.nextSafeActionLabel,
        parentVisible: true,
        summary: `${row.studentName} completed local-demo evidence for ${row.dailyPlanTitle}: ${row.completionPercent}% progress and ${row.practiceScorePercent}% practice score.`,
      } satisfies DemoLearningSessionCompletionPracticeProgressParentSummaryRow;
    });

  const teacherSummaryRows: DemoLearningSessionCompletionPracticeProgressTeacherSummaryRow[] =
    progressRollupRows.map((row) => ({
      teacherVisibleProgressSummaryId: row.teacherVisibleProgressSummaryId,
      progressRollupId: row.progressRollupId,
      stableTraceKey: row.stableTraceKey,
      teacherName: row.teacherName,
      classId: row.classId,
      classCode: row.classCode,
      courseCode: row.courseCode,
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      dailyPlanId: row.dailyPlanId,
      lessonCode: row.lessonCode,
      completionPercent: row.completionPercent,
      practiceScorePercent: row.practiceScorePercent,
      rollupStatus: row.rollupStatus,
      nextSafeActionLabel: row.nextSafeActionLabel,
      teacherVisible: true,
      summary: `${row.teacherName} can review ${row.studentName} from allowed session ${row.learningSessionEvidenceId}: ${row.rollupStatus.toLowerCase()} rollup with ${row.practiceScorePercent}% practice score.`,
    }));

  const statusCounts: DemoLearningSessionCompletionPracticeProgressRollupStatusCounts =
    {
      accessResult: countByStatus(
        dailyPlanGuardAccessResults,
        allowedAccessRows,
        (row) => row.accessResult,
      ),
      dailyPlanStatus: countByStatus(
        dailyPlanStatuses,
        progressRollupRows,
        (row) => row.dailyPlanStatus,
      ),
      practiceAttemptStatus: countByStatus(
        practiceAttemptStatuses,
        progressRollupRows,
        (row) => row.practiceAttemptStatus,
      ),
      rollupStatus: countByStatus(
        sessionCompletionPracticeProgressRollupStatuses,
        progressRollupRows,
        (row) => row.rollupStatus,
      ),
    };
  const rowsWithStableTrace = progressRollupRows.filter((row) =>
    [
      row.studentId,
      row.courseId,
      row.dailyPlanId,
      row.sessionId,
      row.lessonId,
      row.learningSessionEvidenceId,
      row.lessonCompletionEvidenceId,
      row.videoEvidenceId,
      row.practiceAttemptId,
      row.progressRecordId,
      row.progressRollupId,
      row.parentVisibleProgressSummaryId,
      row.teacherVisibleProgressSummaryId,
    ].every((id) => row.stableTraceKey.includes(id)),
  );
  const remainingLocalDemoNotes = [
    'Completion and practice rollups are derived from allowed session gate fixtures only.',
    'Parent and teacher summaries are read-only evidence rows; no parent delivery or teacher workflow mutation is executed.',
    'Production telemetry writes, persisted progress updates, notification delivery, provider calls, and real learner mutations remain out of scope.',
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
    realLearningSessionCompletionMutationUsed: false,
    realParentProgressSummaryMutationUsed: false,
    realTeacherProgressSummaryMutationUsed: false,
    realParentMessageMutationUsed: false,
    realTeacherInterventionMutationUsed: false,
    realPaymentMutationUsed: false,
    realRefundMutationUsed: false,
    realCommissionMutationUsed: false,
    realErpMutationUsed: false,
    secretsRequired: false,
  } satisfies DemoLearningSessionCompletionPracticeProgressRollupSafety;
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
  const evidenceRows: DemoLearningSessionCompletionPracticeProgressEvidenceRow[] =
    [
      {
        evidenceKind: 'ALLOWED_DAILY_PLAN_SESSION_REFERENCE',
        evidenceCount: allowedAccessRows.length,
        stableFixtureIds: allowedAccessRows.map(
          (row) => row.learningSessionEvidenceId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Allowed screen-time/grant session evidence is the source for completion rollups.',
      },
      {
        evidenceKind: 'LESSON_VIDEO_COMPLETION',
        evidenceCount: progressRollupRows.length,
        stableFixtureIds: progressRollupRows.map(
          (row) => row.lessonCompletionEvidenceId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Lesson/video completion IDs are derived from deterministic local LMS video evidence.',
      },
      {
        evidenceKind: 'PRACTICE_SCORE_ATTEMPT',
        evidenceCount: progressRollupRows.length,
        stableFixtureIds: progressRollupRows.map(
          (row) => `${row.practiceAttemptId}:${row.practiceScorePercent}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Practice attempts include deterministic status and score evidence for each rollup.',
      },
      {
        evidenceKind: 'PROGRESS_ROLLUP',
        evidenceCount: progressRollupRows.length,
        stableFixtureIds: progressRollupRows.map((row) => row.progressRollupId),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Progress rollups connect student, course, session, lesson, practice, and progress record IDs.',
      },
      {
        evidenceKind: 'PARENT_VISIBLE_SUMMARY',
        evidenceCount: parentSummaryRows.length,
        stableFixtureIds: parentSummaryRows.map(
          (row) => row.parentVisibleProgressSummaryId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Parent-visible summaries are local-demo report rows only and do not send notifications.',
      },
      {
        evidenceKind: 'TEACHER_VISIBLE_SUMMARY',
        evidenceCount: teacherSummaryRows.length,
        stableFixtureIds: teacherSummaryRows.map(
          (row) => row.teacherVisibleProgressSummaryId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher-visible summaries are local-demo report rows only and do not mutate teacher workflow state.',
      },
      {
        evidenceKind: 'SAFETY_GATE',
        evidenceCount: safetyGateCount,
        stableFixtureIds: safetyEntries.map(
          ([gate, value]) => `${gate}=${String(value)}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'All production, provider, payment, notification, AI, learning mutation, parent summary, teacher summary, and ERP mutation gates remain closed.',
      },
    ];

  return {
    reportName:
      'Learning local demo Learning Session Completion -> Practice Progress Rollup Report',
    generatedFor:
      'local-demo-learning-session-completion-practice-progress-rollup-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#learning-session-completion-practice-progress-rollup',
    jsonExportPath:
      'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.json',
    markdownExportPath:
      'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Allowed daily plan sessions roll up lesson/video completion and practice score evidence into parent- and teacher-visible read-only progress summaries.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: new Set(progressRollupRows.map((row) => row.studentId))
        .size,
      courseCount: new Set(progressRollupRows.map((row) => row.courseId)).size,
      dailyPlanSessionReferenceCount: allowedAccessRows.length,
      allowedDailyPlanSessionReferenceCount: allowedAccessRows.length,
      lessonCompletionEvidenceCount: progressRollupRows.length,
      practiceAttemptEvidenceCount: progressRollupRows.length,
      scoredPracticeAttemptEvidenceCount: progressRollupRows.filter(
        (row) => row.practiceScorePercent >= 0,
      ).length,
      progressRollupCount: progressRollupRows.length,
      parentVisibleProgressSummaryCount: parentSummaryRows.length,
      teacherVisibleProgressSummaryCount: teacherSummaryRows.length,
      stableTraceCount: rowsWithStableTrace.length,
      rollupsWithStudentCourseDailyPlanSessionCount: progressRollupRows.filter(
        (row) =>
          Boolean(row.studentId) &&
          Boolean(row.courseId) &&
          Boolean(row.dailyPlanId) &&
          Boolean(row.sessionId),
      ).length,
      rollupsWithLessonPracticeEvidenceCount: progressRollupRows.filter(
        (row) =>
          Boolean(row.lessonCompletionEvidenceId) &&
          Boolean(row.practiceAttemptId),
      ).length,
      rollupsWithParentTeacherSummaryCount: progressRollupRows.filter(
        (row) =>
          parentSummaryRows.some(
            (summary) =>
              summary.parentVisibleProgressSummaryId ===
              row.parentVisibleProgressSummaryId,
          ) &&
          teacherSummaryRows.some(
            (summary) =>
              summary.teacherVisibleProgressSummaryId ===
              row.teacherVisibleProgressSummaryId,
          ),
      ).length,
      practiceAttemptsWithDeterministicScoreStatusCount:
        progressRollupRows.filter(
          (row) =>
            row.practiceScorePercent >= 0 && Boolean(row.practiceAttemptStatus),
        ).length,
      rollupsWithCompletionPercentCount: progressRollupRows.filter(
        (row) => row.completionPercent >= 0,
      ).length,
      rollupsWithSafeNextActionLabelCount: progressRollupRows.filter((row) =>
        Boolean(row.nextSafeActionLabel),
      ).length,
      completedRollupCount: statusCounts.rollupStatus.COMPLETED,
      needsSupportRollupCount: statusCounts.rollupStatus.NEEDS_SUPPORT,
      averageCompletionPercent: averagePercent(
        progressRollupRows.map((row) => row.completionPercent),
      ),
      averagePracticeScorePercent: averagePercent(
        progressRollupRows.map((row) => row.practiceScorePercent),
      ),
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    statusCounts,
    progressRollupRows,
    parentSummaryRows,
    teacherSummaryRows,
    evidenceRows,
  };
}

export function toLearningSessionCompletionPracticeProgressRollupMarkdown(
  report: DemoLearningSessionCompletionPracticeProgressRollupReport,
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
    '- realLearningSessionGateMutationUsed=false',
    '- realDailyPlanAccessMutationUsed=false',
    '- realLearningSessionCompletionMutationUsed=false',
    '- realProgressMutationUsed=false',
    '- realVideoEvidenceMutationUsed=false',
    '- realPracticeMutationUsed=false',
    '- realParentProgressSummaryMutationUsed=false',
    '- realTeacherProgressSummaryMutationUsed=false',
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
    `- Courses: ${report.totals.courseCount}`,
    `- Daily plan session references: ${report.totals.dailyPlanSessionReferenceCount}`,
    `- Allowed daily plan session references: ${report.totals.allowedDailyPlanSessionReferenceCount}`,
    `- Lesson completion evidence: ${report.totals.lessonCompletionEvidenceCount}`,
    `- Practice attempt evidence: ${report.totals.practiceAttemptEvidenceCount}`,
    `- Progress rollups: ${report.totals.progressRollupCount}`,
    `- Parent-visible progress summaries: ${report.totals.parentVisibleProgressSummaryCount}`,
    `- Teacher-visible progress summaries: ${report.totals.teacherVisibleProgressSummaryCount}`,
    `- Stable traces: ${report.totals.stableTraceCount}`,
    `- Rollups with student/course/daily plan/session: ${report.totals.rollupsWithStudentCourseDailyPlanSessionCount}`,
    `- Rollups with lesson/practice evidence: ${report.totals.rollupsWithLessonPracticeEvidenceCount}`,
    `- Rollups with parent/teacher summaries: ${report.totals.rollupsWithParentTeacherSummaryCount}`,
    `- Practice attempts with deterministic score/status: ${report.totals.practiceAttemptsWithDeterministicScoreStatusCount}`,
    `- Rollups with completion percent: ${report.totals.rollupsWithCompletionPercentCount}`,
    `- Rollups with safe next action: ${report.totals.rollupsWithSafeNextActionLabelCount}`,
    `- Average completion: ${report.totals.averageCompletionPercent}%`,
    `- Average practice score: ${report.totals.averagePracticeScorePercent}%`,
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
    '## Progress Rollup Rows',
    '',
    '| Rollup | Child | Daily plan/session | Lesson/video | Practice | Progress | Parent summary | Teacher summary | Next action | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.progressRollupRows.map(
      (row) =>
        `| ${[
          `${row.progressRollupId} ${row.rollupStatus}`,
          `${row.studentName} (${row.childProfileId})`,
          `${row.dailyPlanTitle} / ${row.learningSessionEvidenceId}`,
          `${row.lessonCode} ${row.videoEvidenceStatus} ${row.videoCompletionPercent}%`,
          `${row.practiceAttemptStatus} ${row.practiceScorePercent}%`,
          `${row.progressStatus} ${row.completionPercent}%`,
          row.parentVisibleProgressSummaryId,
          row.teacherVisibleProgressSummaryId,
          row.nextSafeActionLabel,
          row.stableTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Parent Summary Rows',
    '',
    '| Parent summary | Child | Daily plan | Completion | Practice | Status | Next action |',
    '| --- | --- | --- | ---: | ---: | --- | --- |',
    ...report.parentSummaryRows.map(
      (row) =>
        `| ${[
          row.parentVisibleProgressSummaryId,
          `${row.studentName} (${row.childProfileId})`,
          row.dailyPlanTitle,
          `${row.completionPercent}%`,
          `${row.practiceScorePercent}%`,
          row.rollupStatus,
          row.nextSafeActionLabel,
        ].join(' | ')} |`,
    ),
    '',
    '## Teacher Summary Rows',
    '',
    '| Teacher summary | Teacher | Child | Class | Lesson | Completion | Practice | Status | Next action |',
    '| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |',
    ...report.teacherSummaryRows.map(
      (row) =>
        `| ${[
          row.teacherVisibleProgressSummaryId,
          row.teacherName,
          `${row.studentName} (${row.childProfileId})`,
          row.classCode,
          row.lessonCode,
          `${row.completionPercent}%`,
          `${row.practiceScorePercent}%`,
          row.rollupStatus,
          row.nextSafeActionLabel,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildSessionCompletionPracticeProgressRollupStatus(input: {
  dailyPlan: DemoLearningDailyPlan;
  videoEvidence: DemoLearningVideoEvidence;
  practiceAttempt: DemoLearningPracticeAttempt;
  progress: DemoLearningProgressRecord;
}): DemoLearningSessionCompletionPracticeProgressRollupStatus {
  if (
    input.dailyPlan.status === 'COMPLETED' &&
    input.videoEvidence.status === 'COMPLETED' &&
    input.practiceAttempt.status === 'PASSED' &&
    input.progress.completionPercent >= 80
  ) {
    return 'COMPLETED';
  }

  if (
    input.progress.status === 'NEEDS_SUPPORT' ||
    input.progress.status === 'WITHDRAWN' ||
    input.practiceAttempt.status === 'NEEDS_RETRY'
  ) {
    return 'NEEDS_SUPPORT';
  }

  if (
    input.dailyPlan.status === 'COMPLETED' ||
    input.videoEvidence.status === 'COMPLETED' ||
    input.practiceAttempt.status === 'PASSED'
  ) {
    return 'ON_TRACK';
  }

  return 'IN_PROGRESS';
}

export function buildSessionCompletionPracticeProgressNextAction(input: {
  rollupStatus: DemoLearningSessionCompletionPracticeProgressRollupStatus;
  practiceScorePercent: number;
}) {
  if (input.rollupStatus === 'COMPLETED') {
    return 'Show parent progress summary and open the next fixture daily plan';
  }

  if (input.rollupStatus === 'IN_PROGRESS') {
    return 'Complete the fixture lesson video before rolling up the next summary';
  }

  if (
    input.rollupStatus === 'NEEDS_SUPPORT' ||
    input.practiceScorePercent < 75
  ) {
    return 'Schedule teacher support before the next parent-visible progress update';
  }

  if (input.rollupStatus === 'ON_TRACK') {
    return 'Continue the next fixture practice item and monitor progress';
  }

  return 'Complete the fixture lesson video before rolling up the next summary';
}
