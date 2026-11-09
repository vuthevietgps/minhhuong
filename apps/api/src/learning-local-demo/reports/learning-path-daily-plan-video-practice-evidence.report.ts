import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningClassCohort,
  DemoLearningCoreFixture,
  DemoLearningCourse,
  DemoLearningDailyPlan,
  DemoLearningDailyPlanEvidenceRow,
  DemoLearningEnrollment,
  DemoLearningPath,
  DemoLearningPathDailyPlanVideoPracticeEvidenceReport,
  DemoLearningPathDailyPlanVideoPracticeStatusCounts,
  DemoLearningPathEvidenceRow,
  DemoLearningPathLearnerBand,
  DemoLearningPathStatus,
  DemoLearningPracticeAttempt,
  DemoLearningPracticeAttemptStatus,
  DemoLearningLesson,
  DemoLearningStudent,
  DemoLearningVideoEvidence,
} from '../learning-local-demo.types';
import {
  averagePercent,
  averagePracticeScorePercent,
  countByStatus,
  countDailyPlanStatuses,
  countVideoEvidenceStatuses,
  groupBy,
  percent,
  practiceAttemptStatuses,
  requireClass,
  requireCourseById,
  requireEnrollment,
  requireLearningPath,
  requireLesson,
  requirePracticeAttempt,
  requireStudent,
  requireVideoEvidence,
} from './shared';

export const learningPathStatuses = [
  'ACTIVE',
  'COMPLETED',
  'NEEDS_SUPPORT',
  'WITHDRAWN',
] as const;

export const learningPathLearnerBands = [
  'ON_TRACK',
  'NEEDS_SUPPORT',
  'INACTIVE',
  'WITHDRAWN',
] as const;

export function buildLearningPathDailyPlanVideoPracticeEvidenceReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningPathDailyPlanVideoPracticeEvidenceReport {
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
  const pathsById = new Map(
    fixture.learningPaths.map((path) => [path.id, path]),
  );
  const dailyPlansByPathId = groupBy(
    fixture.dailyPlans,
    (plan) => plan.learningPathId,
  );
  const videoEvidenceByDailyPlanId = new Map(
    fixture.videoEvidence.map((evidence) => [evidence.dailyPlanId, evidence]),
  );
  const practiceAttemptByDailyPlanId = new Map(
    fixture.practiceAttempts.map((attempt) => [attempt.dailyPlanId, attempt]),
  );

  const dailyPlanRows = fixture.dailyPlans
    .map((plan) => {
      const learningPath = requireLearningPath(pathsById, plan.learningPathId);
      const enrollment = requireEnrollment(enrollmentsById, plan.enrollmentId);
      const student = requireStudent(studentsById, enrollment);
      const course = requireCourseById(coursesById, plan.courseId);
      const classCohort = requireClass(classesById, plan.classId);
      const lesson = requireLesson(lessonsById, plan.lessonId);
      const videoEvidence = requireVideoEvidence(
        videoEvidenceByDailyPlanId,
        plan.id,
      );
      const practiceAttempt = requirePracticeAttempt(
        practiceAttemptByDailyPlanId,
        plan.id,
      );

      return buildDailyPlanEvidenceRow({
        plan,
        learningPath,
        enrollment,
        student,
        course,
        classCohort,
        lesson,
        videoEvidence,
        practiceAttempt,
      });
    })
    .sort((left, right) =>
      [
        left.classCode,
        left.studentName,
        String(left.sequence),
        left.dailyPlanId,
      ]
        .join('|')
        .localeCompare(
          [
            right.classCode,
            right.studentName,
            String(right.sequence),
            right.dailyPlanId,
          ].join('|'),
        ),
    );

  const learningPathRows = fixture.learningPaths
    .map((learningPath) => {
      const enrollment = requireEnrollment(
        enrollmentsById,
        learningPath.enrollmentId,
      );
      const student = requireStudent(studentsById, enrollment);
      const course = requireCourseById(coursesById, learningPath.courseId);
      const classCohort = requireClass(classesById, learningPath.classId);
      const dailyPlans = dailyPlansByPathId.get(learningPath.id) ?? [];
      const videoEvidence = dailyPlans.map((plan) =>
        requireVideoEvidence(videoEvidenceByDailyPlanId, plan.id),
      );
      const practiceAttempts = dailyPlans.map((plan) =>
        requirePracticeAttempt(practiceAttemptByDailyPlanId, plan.id),
      );

      return buildLearningPathEvidenceRow({
        learningPath,
        enrollment,
        student,
        course,
        classCohort,
        dailyPlans,
        videoEvidence,
        practiceAttempts,
      });
    })
    .sort((left, right) =>
      [left.classCode, left.studentName, left.learningPathId]
        .join('|')
        .localeCompare(
          [right.classCode, right.studentName, right.learningPathId].join('|'),
        ),
    );

  const statusCounts = buildLearningPathDailyPlanVideoPracticeStatusCounts(
    fixture,
    learningPathRows,
  );
  const completedDailyPlanCount = statusCounts.dailyPlan.COMPLETED;
  const scoredPracticeAttempts = fixture.practiceAttempts.filter(
    (attempt) => attempt.scorePercent !== undefined,
  );

  return {
    reportName:
      'Learning local demo Learning Path -> Daily Plan -> Video Evidence -> Practice Attempt -> Progress Report',
    generatedFor:
      'local-demo-learning-path-daily-plan-video-practice-evidence-report',
    generatedAt,
    currency: fixture.currency,
    safety: {
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
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
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      studentCount: new Set(fixture.learningPaths.map((path) => path.studentId))
        .size,
      courseCount: new Set(fixture.learningPaths.map((path) => path.courseId))
        .size,
      learningPathCount: fixture.learningPaths.length,
      activeLearningPathCount: statusCounts.learningPath.ACTIVE,
      completedLearningPathCount: statusCounts.learningPath.COMPLETED,
      needsSupportLearningPathCount: statusCounts.learningPath.NEEDS_SUPPORT,
      withdrawnLearningPathCount: statusCounts.learningPath.WITHDRAWN,
      dailyPlanCount: fixture.dailyPlans.length,
      completedDailyPlanCount,
      inProgressDailyPlanCount: statusCounts.dailyPlan.IN_PROGRESS,
      blockedDailyPlanCount: statusCounts.dailyPlan.BLOCKED,
      skippedDailyPlanCount: statusCounts.dailyPlan.SKIPPED,
      assignedDailyPlanCount: statusCounts.dailyPlan.ASSIGNED,
      blockedSkippedIncompleteDailyPlanCount:
        fixture.dailyPlans.length - completedDailyPlanCount,
      videoEvidenceCount: fixture.videoEvidence.length,
      completedVideoCount: statusCounts.videoEvidence.COMPLETED,
      incompleteVideoCount: statusCounts.videoEvidence.INCOMPLETE,
      skippedVideoCount: statusCounts.videoEvidence.SKIPPED,
      practiceAttemptCount: fixture.practiceAttempts.length,
      passedPracticeCount: statusCounts.practiceAttempt.PASSED,
      needsRetryPracticeCount: statusCounts.practiceAttempt.NEEDS_RETRY,
      incompletePracticeCount: statusCounts.practiceAttempt.INCOMPLETE,
      skippedPracticeCount: statusCounts.practiceAttempt.SKIPPED,
      averagePracticeScorePercent: averagePercent(
        scoredPracticeAttempts.map((attempt) => attempt.scorePercent ?? 0),
      ),
      overallDailyPlanCompletionPercent: percent(
        completedDailyPlanCount,
        fixture.dailyPlans.length,
      ),
      averageLearnerProgressPercent: averagePercent(
        learningPathRows.map((row) => row.progressPercent),
      ),
      onTrackLearnerCount: statusCounts.learnerBand.ON_TRACK,
      needsSupportLearnerCount: statusCounts.learnerBand.NEEDS_SUPPORT,
      inactiveLearnerCount: statusCounts.learnerBand.INACTIVE,
      withdrawnLearnerCount: statusCounts.learnerBand.WITHDRAWN,
    },
    statusCounts,
    learningPathRows,
    dailyPlanRows,
  };
}

export function toLearningPathDailyPlanVideoPracticeEvidenceMarkdown(
  report: DemoLearningPathDailyPlanVideoPracticeEvidenceReport,
) {
  const score = (value: number | null) =>
    value === null ? 'n/a' : `${value}%`;
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
    '- paymentProviderUsed=false',
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
    `- Learning paths: ${report.totals.learningPathCount}`,
    `- Daily plans: ${report.totals.dailyPlanCount}`,
    `- Completed daily plans: ${report.totals.completedDailyPlanCount}`,
    `- Blocked/skipped/incomplete daily plans: ${report.totals.blockedSkippedIncompleteDailyPlanCount}`,
    `- Video evidence records: ${report.totals.videoEvidenceCount}`,
    `- Completed videos: ${report.totals.completedVideoCount}`,
    `- Incomplete videos: ${report.totals.incompleteVideoCount}`,
    `- Skipped videos: ${report.totals.skippedVideoCount}`,
    `- Practice attempts: ${report.totals.practiceAttemptCount}`,
    `- Passed practice attempts: ${report.totals.passedPracticeCount}`,
    `- Needs-retry practice attempts: ${report.totals.needsRetryPracticeCount}`,
    `- Incomplete practice attempts: ${report.totals.incompletePracticeCount}`,
    `- Skipped practice attempts: ${report.totals.skippedPracticeCount}`,
    `- Average practice score: ${report.totals.averagePracticeScorePercent}%`,
    `- Overall daily-plan completion: ${report.totals.overallDailyPlanCompletionPercent}%`,
    `- Average learner progress: ${report.totals.averageLearnerProgressPercent}%`,
    `- Learner bands: onTrack=${report.totals.onTrackLearnerCount}, needsSupport=${report.totals.needsSupportLearnerCount}, inactive=${report.totals.inactiveLearnerCount}, withdrawn=${report.totals.withdrawnLearnerCount}`,
    '',
    '## Learning Path Rows',
    '',
    '| Student | Course | Class | Path | Status | Plans | Videos complete | Practice passed | Avg practice | Progress | Band |',
    '| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...report.learningPathRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.classCode,
          row.title,
          row.pathStatus,
          `${row.completedDailyPlanCount}/${row.dailyPlanCount}`,
          String(row.completedVideoCount),
          String(row.passedPracticeCount),
          `${row.averagePracticeScorePercent}%`,
          `${row.progressPercent}%`,
          row.learnerStatusBand,
        ].join(' | ')} |`,
    ),
    '',
    '## Daily Plan Video Practice Rows',
    '',
    '| Student | Date | Lesson | Daily plan | Plan status | Video evidence | Watch | Practice attempt | Score |',
    '| --- | --- | --- | --- | --- | --- | ---: | --- | ---: |',
    ...report.dailyPlanRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.planDate,
          row.lessonCode,
          row.title,
          row.dailyPlanStatus,
          row.videoEvidenceStatus,
          `${row.videoCompletionPercent}%`,
          row.practiceAttemptStatus,
          score(row.practiceScorePercent),
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildLearningPathEvidenceRow(input: {
  learningPath: DemoLearningPath;
  enrollment: DemoLearningEnrollment;
  student: DemoLearningStudent;
  course: DemoLearningCourse;
  classCohort: DemoLearningClassCohort;
  dailyPlans: DemoLearningDailyPlan[];
  videoEvidence: DemoLearningVideoEvidence[];
  practiceAttempts: DemoLearningPracticeAttempt[];
}): DemoLearningPathEvidenceRow {
  const dailyPlanCounts = countDailyPlanStatuses(input.dailyPlans);
  const videoEvidenceCounts = countVideoEvidenceStatuses(input.videoEvidence);
  const practiceAttemptCounts = countPracticeAttemptStatuses(
    input.practiceAttempts,
  );
  const completedDailyPlanCount = dailyPlanCounts.COMPLETED;
  const progressPercent = percent(
    completedDailyPlanCount,
    input.dailyPlans.length,
  );

  return {
    learningPathId: input.learningPath.id,
    enrollmentId: input.enrollment.id,
    studentId: input.student.id,
    childProfileId: input.student.childProfileId,
    studentName: input.student.displayName,
    courseId: input.course.id,
    courseCode: input.course.code,
    courseTitle: input.course.title,
    classId: input.classCohort.id,
    classCode: input.classCohort.code,
    classTitle: input.classCohort.title,
    title: input.learningPath.title,
    pathStatus: input.learningPath.status,
    dailyPlanCount: input.dailyPlans.length,
    completedDailyPlanCount,
    blockedDailyPlanCount: dailyPlanCounts.BLOCKED,
    skippedDailyPlanCount: dailyPlanCounts.SKIPPED,
    completedVideoCount: videoEvidenceCounts.COMPLETED,
    passedPracticeCount: practiceAttemptCounts.PASSED,
    averagePracticeScorePercent: averagePracticeScorePercent(
      input.practiceAttempts,
    ),
    progressPercent,
    learnerStatusBand: buildLearningPathLearnerBand({
      pathStatus: input.learningPath.status,
      dailyPlanCount: input.dailyPlans.length,
      progressPercent,
      skippedDailyPlanCount: dailyPlanCounts.SKIPPED,
      blockedDailyPlanCount: dailyPlanCounts.BLOCKED,
    }),
  };
}

export function buildDailyPlanEvidenceRow(input: {
  plan: DemoLearningDailyPlan;
  learningPath: DemoLearningPath;
  enrollment: DemoLearningEnrollment;
  student: DemoLearningStudent;
  course: DemoLearningCourse;
  classCohort: DemoLearningClassCohort;
  lesson: DemoLearningLesson;
  videoEvidence: DemoLearningVideoEvidence;
  practiceAttempt: DemoLearningPracticeAttempt;
}): DemoLearningDailyPlanEvidenceRow {
  return {
    dailyPlanId: input.plan.id,
    learningPathId: input.learningPath.id,
    enrollmentId: input.enrollment.id,
    studentId: input.student.id,
    childProfileId: input.student.childProfileId,
    studentName: input.student.displayName,
    courseCode: input.course.code,
    classCode: input.classCohort.code,
    lessonId: input.lesson.id,
    lessonCode: input.lesson.code,
    lessonTitle: input.lesson.title,
    sequence: input.plan.sequence,
    planDate: input.plan.planDate,
    title: input.plan.title,
    dailyPlanStatus: input.plan.status,
    videoEvidenceStatus: input.videoEvidence.status,
    watchedSeconds: input.videoEvidence.watchedSeconds,
    requiredVideoSeconds: input.videoEvidence.requiredSeconds,
    videoCompletionPercent: percent(
      input.videoEvidence.watchedSeconds,
      input.videoEvidence.requiredSeconds,
    ),
    practiceAttemptStatus: input.practiceAttempt.status,
    practiceAttemptNumber: input.practiceAttempt.attemptNumber,
    practiceScorePercent: input.practiceAttempt.scorePercent ?? null,
  };
}

export function buildLearningPathDailyPlanVideoPracticeStatusCounts(
  fixture: DemoLearningCoreFixture,
  learningPathRows: DemoLearningPathEvidenceRow[],
): DemoLearningPathDailyPlanVideoPracticeStatusCounts {
  return {
    learningPath: countByStatus(
      learningPathStatuses,
      fixture.learningPaths,
      (path) => path.status,
    ),
    dailyPlan: countDailyPlanStatuses(fixture.dailyPlans),
    videoEvidence: countVideoEvidenceStatuses(fixture.videoEvidence),
    practiceAttempt: countPracticeAttemptStatuses(fixture.practiceAttempts),
    learnerBand: countByStatus(
      learningPathLearnerBands,
      learningPathRows,
      (row) => row.learnerStatusBand,
    ),
  };
}

export function countPracticeAttemptStatuses(
  records: DemoLearningPracticeAttempt[],
): Record<DemoLearningPracticeAttemptStatus, number> {
  return countByStatus(
    practiceAttemptStatuses,
    records,
    (record) => record.status,
  );
}

export function buildLearningPathLearnerBand(input: {
  pathStatus: DemoLearningPathStatus;
  dailyPlanCount: number;
  progressPercent: number;
  skippedDailyPlanCount: number;
  blockedDailyPlanCount: number;
}): DemoLearningPathLearnerBand {
  if (input.pathStatus === 'WITHDRAWN') {
    return 'WITHDRAWN';
  }

  if (input.dailyPlanCount === 0 || input.progressPercent === 0) {
    return 'INACTIVE';
  }

  if (
    input.pathStatus === 'NEEDS_SUPPORT' ||
    input.blockedDailyPlanCount > 0 ||
    input.skippedDailyPlanCount > 1
  ) {
    return 'NEEDS_SUPPORT';
  }

  return 'ON_TRACK';
}
