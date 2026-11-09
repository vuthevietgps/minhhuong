import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningAssignment,
  DemoLearningAssignmentAssessmentRow,
  DemoLearningAssessmentBand,
  DemoLearningClassCohort,
  DemoLearningCoreFixture,
  DemoLearningCourse,
  DemoLearningEnrollment,
  DemoLearningFeedbackStatus,
  DemoLearningLearnerAssessmentRow,
  DemoLearningLesson,
  DemoLearningLessonAssignmentAssessmentProgressReport,
  DemoLearningLessonAssignmentAssessmentStatusCounts,
  DemoLearningLessonAssessmentRow,
  DemoLearningStudent,
  DemoLearningSubmission,
} from '../learning-local-demo.types';
import {
  averagePercent,
  countByStatus,
  countSubmissionStatuses,
  groupBy,
  percent,
  progressStatuses,
  requireClass,
  requireCourseById,
  requireEnrollment,
  requireLesson,
  requireStudent,
} from './shared';

export const lessonStatuses = ['PUBLISHED', 'SCHEDULED'] as const;

export const assignmentStatuses = ['OPEN', 'CLOSED'] as const;

export const feedbackStatuses = ['GIVEN', 'PENDING', 'NOT_REQUIRED'] as const;

export function buildLessonAssignmentAssessmentProgressReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningLessonAssignmentAssessmentProgressReport {
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
  const assignmentsByLessonId = groupBy(
    fixture.assignments,
    (assignment) => assignment.lessonId,
  );
  const submissionsByAssignmentId = groupBy(
    fixture.submissions,
    (submission) => submission.assignmentId,
  );
  const submissionsByEnrollmentId = groupBy(
    fixture.submissions,
    (submission) => submission.enrollmentId,
  );

  const assignmentRows = fixture.assignments
    .map((assignment) => {
      const lesson = requireLesson(lessonsById, assignment.lessonId);
      const classCohort = requireClass(classesById, assignment.classId);
      const course = requireCourseById(coursesById, assignment.courseId);
      const submissions = submissionsByAssignmentId.get(assignment.id) ?? [];

      return buildAssignmentAssessmentRow({
        assignment,
        lesson,
        classCohort,
        course,
        submissions,
      });
    })
    .sort((left, right) =>
      [left.classCode, left.lessonCode, left.kind, left.assignmentId]
        .join('|')
        .localeCompare(
          [
            right.classCode,
            right.lessonCode,
            right.kind,
            right.assignmentId,
          ].join('|'),
        ),
    );

  const lessonRows = fixture.lessons
    .map((lesson) => {
      const classCohort = requireClass(classesById, lesson.classId);
      const course = requireCourseById(coursesById, lesson.courseId);
      const assignments = assignmentsByLessonId.get(lesson.id) ?? [];
      const submissions = assignments.flatMap(
        (assignment) => submissionsByAssignmentId.get(assignment.id) ?? [],
      );

      return buildLessonAssessmentRow({
        lesson,
        classCohort,
        course,
        assignments,
        submissions,
      });
    })
    .sort((left, right) =>
      [left.classCode, String(left.sequence), left.lessonId]
        .join('|')
        .localeCompare(
          [right.classCode, String(right.sequence), right.lessonId].join('|'),
        ),
    );

  const learnerRows = fixture.progress
    .map((progress) => {
      const enrollment = requireEnrollment(
        enrollmentsById,
        progress.enrollmentId,
      );
      const student = requireStudent(studentsById, enrollment);
      const course = requireCourseById(coursesById, progress.courseId);
      const classCohort = requireClass(classesById, progress.classId);
      const classAssignments = fixture.assignments.filter(
        (assignment) => assignment.classId === classCohort.id,
      );
      const classAssignmentIds = new Set(
        classAssignments.map((assignment) => assignment.id),
      );
      const submissions = (
        submissionsByEnrollmentId.get(enrollment.id) ?? []
      ).filter((submission) => classAssignmentIds.has(submission.assignmentId));

      return buildLearnerAssessmentRow({
        enrollment,
        student,
        course,
        classCohort,
        progressStatus: progress.status,
        progressCompletionPercent: progress.completionPercent,
        expectedAssignmentCount: classAssignments.length,
        submissions,
      });
    })
    .sort((left, right) =>
      [left.classCode, left.studentName, left.enrollmentId]
        .join('|')
        .localeCompare(
          [right.classCode, right.studentName, right.enrollmentId].join('|'),
        ),
    );

  const statusCounts = buildLessonAssignmentAssessmentStatusCounts(fixture);
  const completedSubmissionCount =
    statusCounts.submission.SUBMITTED +
    statusCounts.submission.LATE +
    statusCounts.submission.RESUBMITTED;
  const scoreBandCounts = countScoreBands(fixture.submissions);
  const expectedSubmissionCount = assignmentRows.reduce(
    (sum, row) => sum + row.expectedSubmissionCount,
    0,
  );

  return {
    reportName:
      'Learning local demo Lesson -> Assignment/Quiz -> Submission -> Score/Feedback -> Progress Report',
    generatedFor: 'local-demo-lesson-assignment-assessment-progress-report',
    generatedAt,
    currency: fixture.currency,
    safety: {
      fixtureOnly: true,
      productionDbUsed: false,
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
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      studentCount: fixture.students.length,
      courseCount: fixture.courses.length,
      classCount: fixture.classes.length,
      lessonCount: fixture.lessons.length,
      publishedLessonCount: statusCounts.lesson.PUBLISHED,
      scheduledLessonCount: statusCounts.lesson.SCHEDULED,
      assignmentCount: fixture.assignments.length,
      quizCount: fixture.assignments.filter(
        (assignment) => assignment.kind === 'QUIZ',
      ).length,
      assignmentTaskCount: fixture.assignments.filter(
        (assignment) => assignment.kind === 'ASSIGNMENT',
      ).length,
      openAssignmentCount: statusCounts.assignment.OPEN,
      closedAssignmentCount: statusCounts.assignment.CLOSED,
      expectedSubmissionCount,
      submissionRecordCount: fixture.submissions.length,
      submittedSubmissionCount: statusCounts.submission.SUBMITTED,
      lateSubmissionCount: statusCounts.submission.LATE,
      missingSubmissionCount: statusCounts.submission.MISSING,
      resubmittedSubmissionCount: statusCounts.submission.RESUBMITTED,
      completedSubmissionCount,
      scoredSubmissionCount: countScoredSubmissions(fixture.submissions),
      feedbackGivenCount: statusCounts.feedback.GIVEN,
      pendingFeedbackCount: statusCounts.feedback.PENDING,
      feedbackNotRequiredCount: statusCounts.feedback.NOT_REQUIRED,
      excellentScoreCount: scoreBandCounts.EXCELLENT,
      onTrackScoreCount: scoreBandCounts.ON_TRACK,
      needsSupportScoreCount: scoreBandCounts.NEEDS_SUPPORT,
      missingScoreCount: scoreBandCounts.MISSING,
      averageScorePercent: averageSubmissionScorePercent(fixture.submissions),
      learnerAssessmentCount: learnerRows.length,
      excellentLearnerCount: learnerRows.filter(
        (row) => row.assessmentBand === 'EXCELLENT',
      ).length,
      onTrackLearnerCount: learnerRows.filter(
        (row) => row.assessmentBand === 'ON_TRACK',
      ).length,
      needsSupportLearnerCount: learnerRows.filter(
        (row) => row.assessmentBand === 'NEEDS_SUPPORT',
      ).length,
      missingLearnerCount: learnerRows.filter(
        (row) => row.assessmentBand === 'MISSING',
      ).length,
      withdrawnLearnerCount: learnerRows.filter(
        (row) => row.assessmentBand === 'WITHDRAWN',
      ).length,
      overallAssignmentCompletionPercent: percent(
        completedSubmissionCount,
        expectedSubmissionCount,
      ),
      averageLearnerScorePercent: averagePercent(
        learnerRows
          .filter((row) => row.scoredSubmissionCount > 0)
          .map((row) => row.averageScorePercent),
      ),
    },
    statusCounts,
    lessonRows,
    assignmentRows,
    learnerRows,
  };
}

export function toLessonAssignmentAssessmentProgressMarkdown(
  report: DemoLearningLessonAssignmentAssessmentProgressReport,
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
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Students: ${report.totals.studentCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Classes/cohorts: ${report.totals.classCount}`,
    `- Lessons: ${report.totals.lessonCount}`,
    `- Published lessons: ${report.totals.publishedLessonCount}`,
    `- Scheduled lessons: ${report.totals.scheduledLessonCount}`,
    `- Assignments/quizzes: ${report.totals.assignmentCount}`,
    `- Quizzes: ${report.totals.quizCount}`,
    `- Assignment tasks: ${report.totals.assignmentTaskCount}`,
    `- Expected submissions: ${report.totals.expectedSubmissionCount}`,
    `- Submission records: ${report.totals.submissionRecordCount}`,
    `- Submitted: ${report.totals.submittedSubmissionCount}`,
    `- Late: ${report.totals.lateSubmissionCount}`,
    `- Missing: ${report.totals.missingSubmissionCount}`,
    `- Resubmitted: ${report.totals.resubmittedSubmissionCount}`,
    `- Scored submissions: ${report.totals.scoredSubmissionCount}`,
    `- Feedback given: ${report.totals.feedbackGivenCount}`,
    `- Feedback pending: ${report.totals.pendingFeedbackCount}`,
    `- Average score: ${report.totals.averageScorePercent}%`,
    `- Assignment completion: ${report.totals.overallAssignmentCompletionPercent}%`,
    `- Learner assessments: ${report.totals.learnerAssessmentCount}`,
    `- Excellent learners: ${report.totals.excellentLearnerCount}`,
    `- On-track learners: ${report.totals.onTrackLearnerCount}`,
    `- Needs-support learners: ${report.totals.needsSupportLearnerCount}`,
    `- Withdrawn learners: ${report.totals.withdrawnLearnerCount}`,
    '',
    '## Lesson Rows',
    '',
    '| Lesson | Class | Status | Items | Expected submissions | Records | Missing | Average score |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |',
    ...report.lessonRows.map(
      (row) =>
        `| ${[
          `${row.lessonCode} ${row.lessonTitle}`,
          row.classCode,
          row.lessonStatus,
          String(row.assignmentCount),
          String(row.expectedSubmissionCount),
          String(row.submissionRecordCount),
          String(row.missingSubmissionCount),
          `${row.averageScorePercent}%`,
        ].join(' | ')} |`,
    ),
    '',
    '## Assignment Rows',
    '',
    '| Item | Lesson | Kind | Status | Expected | Submitted | Late | Missing | Resubmitted | Scored | Feedback pending | Avg score |',
    '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...report.assignmentRows.map(
      (row) =>
        `| ${[
          row.title,
          row.lessonCode,
          row.kind,
          row.status,
          String(row.expectedSubmissionCount),
          String(row.submittedSubmissionCount),
          String(row.lateSubmissionCount),
          String(row.missingSubmissionCount),
          String(row.resubmittedSubmissionCount),
          String(row.scoredSubmissionCount),
          String(row.pendingFeedbackCount),
          `${row.averageScorePercent}%`,
        ].join(' | ')} |`,
    ),
    '',
    '## Learner Assessment Rows',
    '',
    '| Student | Class | Progress | Expected | Submitted | Late | Missing | Resubmitted | Scored | Avg score | Assignment completion | Progress completion | Band |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
    ...report.learnerRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.classCode,
          row.progressStatus,
          String(row.expectedAssignmentCount),
          String(row.submittedSubmissionCount),
          String(row.lateSubmissionCount),
          String(row.missingSubmissionCount),
          String(row.resubmittedSubmissionCount),
          String(row.scoredSubmissionCount),
          `${row.averageScorePercent}%`,
          `${row.assignmentCompletionPercent}%`,
          `${row.progressCompletionPercent}%`,
          row.assessmentBand,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildLessonAssessmentRow(input: {
  lesson: DemoLearningLesson;
  classCohort: DemoLearningClassCohort;
  course: DemoLearningCourse;
  assignments: DemoLearningAssignment[];
  submissions: DemoLearningSubmission[];
}): DemoLearningLessonAssessmentRow {
  const submissionCounts = countSubmissionStatuses(input.submissions);

  return {
    lessonId: input.lesson.id,
    lessonCode: input.lesson.code,
    lessonTitle: input.lesson.title,
    lessonStatus: input.lesson.status,
    classId: input.classCohort.id,
    classCode: input.classCohort.code,
    courseCode: input.course.code,
    sequence: input.lesson.sequence,
    assignmentCount: input.assignments.length,
    quizCount: input.assignments.filter(
      (assignment) => assignment.kind === 'QUIZ',
    ).length,
    assignmentTaskCount: input.assignments.filter(
      (assignment) => assignment.kind === 'ASSIGNMENT',
    ).length,
    expectedSubmissionCount:
      input.assignments.length * input.classCohort.enrollmentIds.length,
    submissionRecordCount: input.submissions.length,
    missingSubmissionCount: submissionCounts.MISSING,
    averageScorePercent: averageSubmissionScorePercent(input.submissions),
  };
}

export function buildAssignmentAssessmentRow(input: {
  assignment: DemoLearningAssignment;
  lesson: DemoLearningLesson;
  classCohort: DemoLearningClassCohort;
  course: DemoLearningCourse;
  submissions: DemoLearningSubmission[];
}): DemoLearningAssignmentAssessmentRow {
  const submissionCounts = countSubmissionStatuses(input.submissions);
  const feedbackCounts = countFeedbackStatuses(input.submissions);

  return {
    assignmentId: input.assignment.id,
    lessonId: input.lesson.id,
    lessonCode: input.lesson.code,
    classId: input.classCohort.id,
    classCode: input.classCohort.code,
    courseCode: input.course.code,
    kind: input.assignment.kind,
    title: input.assignment.title,
    status: input.assignment.status,
    dueAt: input.assignment.dueAt,
    expectedSubmissionCount: input.classCohort.enrollmentIds.length,
    submittedSubmissionCount: submissionCounts.SUBMITTED,
    lateSubmissionCount: submissionCounts.LATE,
    missingSubmissionCount: submissionCounts.MISSING,
    resubmittedSubmissionCount: submissionCounts.RESUBMITTED,
    scoredSubmissionCount: countScoredSubmissions(input.submissions),
    feedbackGivenCount: feedbackCounts.GIVEN,
    pendingFeedbackCount: feedbackCounts.PENDING,
    averageScorePercent: averageSubmissionScorePercent(input.submissions),
  };
}

export function buildLearnerAssessmentRow(input: {
  enrollment: DemoLearningEnrollment;
  student: DemoLearningStudent;
  course: DemoLearningCourse;
  classCohort: DemoLearningClassCohort;
  progressStatus: DemoLearningLearnerAssessmentRow['progressStatus'];
  progressCompletionPercent: number;
  expectedAssignmentCount: number;
  submissions: DemoLearningSubmission[];
}): DemoLearningLearnerAssessmentRow {
  const submissionCounts = countSubmissionStatuses(input.submissions);
  const feedbackCounts = countFeedbackStatuses(input.submissions);
  const completedSubmissionCount =
    submissionCounts.SUBMITTED +
    submissionCounts.LATE +
    submissionCounts.RESUBMITTED;
  const scoredSubmissionCount = countScoredSubmissions(input.submissions);
  const averageScorePercent = averageSubmissionScorePercent(input.submissions);

  return {
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
    progressStatus: input.progressStatus,
    expectedAssignmentCount: input.expectedAssignmentCount,
    submittedSubmissionCount: submissionCounts.SUBMITTED,
    lateSubmissionCount: submissionCounts.LATE,
    missingSubmissionCount: submissionCounts.MISSING,
    resubmittedSubmissionCount: submissionCounts.RESUBMITTED,
    scoredSubmissionCount,
    feedbackPendingCount: feedbackCounts.PENDING,
    averageScorePercent,
    assignmentCompletionPercent: percent(
      completedSubmissionCount,
      input.expectedAssignmentCount,
    ),
    progressCompletionPercent: input.progressCompletionPercent,
    assessmentBand: buildAssessmentBand({
      progressStatus: input.progressStatus,
      expectedAssignmentCount: input.expectedAssignmentCount,
      missingSubmissionCount: submissionCounts.MISSING,
      scoredSubmissionCount,
      averageScorePercent,
    }),
  };
}

export function buildLessonAssignmentAssessmentStatusCounts(
  fixture: DemoLearningCoreFixture,
): DemoLearningLessonAssignmentAssessmentStatusCounts {
  return {
    lesson: countByStatus(
      lessonStatuses,
      fixture.lessons,
      (lesson) => lesson.status,
    ),
    assignment: countByStatus(
      assignmentStatuses,
      fixture.assignments,
      (assignment) => assignment.status,
    ),
    submission: countSubmissionStatuses(fixture.submissions),
    feedback: countFeedbackStatuses(fixture.submissions),
    progress: countByStatus(
      progressStatuses,
      fixture.progress,
      (progress) => progress.status,
    ),
  };
}

export function countFeedbackStatuses(
  records: DemoLearningSubmission[],
): Record<DemoLearningFeedbackStatus, number> {
  return countByStatus(
    feedbackStatuses,
    records,
    (record) => record.feedbackStatus,
  );
}

export function countScoredSubmissions(records: DemoLearningSubmission[]) {
  return records.filter((record) => record.scorePercent !== undefined).length;
}

export function averageSubmissionScorePercent(
  records: DemoLearningSubmission[],
) {
  const scores = records
    .map((record) => record.scorePercent)
    .filter((score): score is number => score !== undefined);

  return averagePercent(scores);
}

export function countScoreBands(records: DemoLearningSubmission[]) {
  return records.reduce(
    (totals, record) => {
      if (record.status === 'MISSING') {
        totals.MISSING += 1;
        return totals;
      }

      const score = record.scorePercent;
      if (score === undefined) {
        return totals;
      }
      if (score >= 90) {
        totals.EXCELLENT += 1;
        return totals;
      }
      if (score >= 75) {
        totals.ON_TRACK += 1;
        return totals;
      }

      totals.NEEDS_SUPPORT += 1;
      return totals;
    },
    {
      EXCELLENT: 0,
      ON_TRACK: 0,
      NEEDS_SUPPORT: 0,
      MISSING: 0,
    } satisfies Record<
      Exclude<DemoLearningAssessmentBand, 'WITHDRAWN'>,
      number
    >,
  );
}

export function buildAssessmentBand(input: {
  progressStatus: DemoLearningLearnerAssessmentRow['progressStatus'];
  expectedAssignmentCount: number;
  missingSubmissionCount: number;
  scoredSubmissionCount: number;
  averageScorePercent: number;
}): DemoLearningAssessmentBand {
  if (input.progressStatus === 'WITHDRAWN') {
    return 'WITHDRAWN';
  }

  if (
    input.scoredSubmissionCount === 0 ||
    input.missingSubmissionCount === input.expectedAssignmentCount
  ) {
    return 'MISSING';
  }

  if (input.averageScorePercent >= 90 && input.missingSubmissionCount === 0) {
    return 'EXCELLENT';
  }

  if (input.averageScorePercent >= 75 && input.missingSubmissionCount <= 1) {
    return 'ON_TRACK';
  }

  return 'NEEDS_SUPPORT';
}
