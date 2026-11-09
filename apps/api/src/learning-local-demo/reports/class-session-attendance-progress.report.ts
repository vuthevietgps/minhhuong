import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningAttendanceRecord,
  DemoLearningClassAggregateRow,
  DemoLearningClassCohort,
  DemoLearningClassSessionAttendanceProgressReport,
  DemoLearningClassSessionStatusCounts,
  DemoLearningCoreFixture,
  DemoLearningCourse,
  DemoLearningLearnerProgressRow,
  DemoLearningSession,
  DemoLearningSessionReportRow,
} from '../learning-local-demo.types';
import {
  averagePercent,
  countAttendanceStatuses,
  countByStatus,
  groupBy,
  percent,
  progressStatuses,
  requireClass,
  requireCourseById,
  requireEnrollment,
  requireStudent,
} from './shared';

export const classStatuses = ['ACTIVE', 'COMPLETED'] as const;

export const sessionStatuses = ['SCHEDULED', 'COMPLETED'] as const;

export function buildClassSessionAttendanceProgressReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningClassSessionAttendanceProgressReport {
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
  const sessionsByClassId = groupBy(
    fixture.sessions,
    (session) => session.classId,
  );
  const attendanceByEnrollmentId = groupBy(
    fixture.attendance,
    (attendance) => attendance.enrollmentId,
  );
  const attendanceBySessionId = groupBy(
    fixture.attendance,
    (attendance) => attendance.sessionId,
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
      const classSessions = sessionsByClassId.get(classCohort.id) ?? [];
      const attendanceRecords =
        attendanceByEnrollmentId.get(enrollment.id) ?? [];
      const attendanceCounts = countAttendanceStatuses(attendanceRecords);
      const attendedAttendanceCount =
        attendanceCounts.PRESENT + attendanceCounts.LATE;

      return {
        enrollmentId: enrollment.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        classId: classCohort.id,
        classCode: classCohort.code,
        classTitle: classCohort.title,
        totalSessions: classSessions.length,
        completedSessions: classSessions.filter(
          (session) => session.status === 'COMPLETED',
        ).length,
        attendanceRecordCount: attendanceRecords.length,
        presentAttendanceCount: attendanceCounts.PRESENT,
        lateAttendanceCount: attendanceCounts.LATE,
        absentAttendanceCount: attendanceCounts.ABSENT,
        excusedAttendanceCount: attendanceCounts.EXCUSED,
        attendedAttendanceCount,
        attendanceRatePercent: percent(
          attendedAttendanceCount,
          attendanceRecords.length,
        ),
        progressStatus: progress.status,
        completedLessonCount: progress.completedLessonCount,
        totalLessonCount: progress.totalLessonCount,
        completionPercent: progress.completionPercent,
        completedSessionIds: [...progress.completedSessionIds],
        lastActivityAt: progress.lastActivityAt,
      } satisfies DemoLearningLearnerProgressRow;
    })
    .sort((left, right) =>
      [left.classCode, left.studentName, left.enrollmentId]
        .join('|')
        .localeCompare(
          [right.classCode, right.studentName, right.enrollmentId].join('|'),
        ),
    );

  const sessionRows = fixture.sessions
    .map((session) =>
      buildSessionRow({
        session,
        classCohort: requireClass(classesById, session.classId),
        course: requireCourseById(coursesById, session.courseId),
        attendance: attendanceBySessionId.get(session.id) ?? [],
      }),
    )
    .sort((left, right) =>
      [left.classCode, String(left.sequence), left.sessionId]
        .join('|')
        .localeCompare(
          [right.classCode, String(right.sequence), right.sessionId].join('|'),
        ),
    );

  const statusCounts = buildClassSessionStatusCounts(fixture);
  const completedLessonCount = learnerRows.reduce(
    (sum, row) => sum + row.completedLessonCount,
    0,
  );
  const totalLessonCount = learnerRows.reduce(
    (sum, row) => sum + row.totalLessonCount,
    0,
  );
  const attendedAttendanceCount =
    statusCounts.attendance.PRESENT + statusCounts.attendance.LATE;

  return {
    reportName:
      'Learning local demo Class -> Session -> Attendance -> Progress Report',
    generatedFor: 'local-demo-class-session-attendance-progress-report',
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
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      studentCount: new Set(learnerRows.map((row) => row.studentId)).size,
      courseCount: new Set(learnerRows.map((row) => row.courseId)).size,
      classCount: fixture.classes.length,
      activeClassCount: statusCounts.class.ACTIVE,
      completedClassCount: statusCounts.class.COMPLETED,
      sessionCount: fixture.sessions.length,
      completedSessionCount: statusCounts.session.COMPLETED,
      scheduledSessionCount: statusCounts.session.SCHEDULED,
      attendanceRecordCount: fixture.attendance.length,
      presentAttendanceCount: statusCounts.attendance.PRESENT,
      lateAttendanceCount: statusCounts.attendance.LATE,
      absentAttendanceCount: statusCounts.attendance.ABSENT,
      excusedAttendanceCount: statusCounts.attendance.EXCUSED,
      attendedAttendanceCount,
      attendanceRatePercent: percent(
        attendedAttendanceCount,
        fixture.attendance.length,
      ),
      progressRecordCount: fixture.progress.length,
      completedProgressCount: statusCounts.progress.COMPLETED,
      inProgressCount: statusCounts.progress.IN_PROGRESS,
      needsSupportCount: statusCounts.progress.NEEDS_SUPPORT,
      withdrawnProgressCount: statusCounts.progress.WITHDRAWN,
      completedLessonCount,
      totalLessonCount,
      overallCompletionPercent: percent(completedLessonCount, totalLessonCount),
      averageLearnerCompletionPercent: averagePercent(
        learnerRows.map((row) => row.completionPercent),
      ),
    },
    statusCounts,
    classAggregates: buildClassAggregates({
      classes: fixture.classes,
      coursesById,
      learnerRows,
      sessionRows,
    }),
    sessionRows,
    learnerRows,
  };
}

export function toClassSessionAttendanceProgressMarkdown(
  report: DemoLearningClassSessionAttendanceProgressReport,
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
    `- Active classes: ${report.totals.activeClassCount}`,
    `- Completed classes: ${report.totals.completedClassCount}`,
    `- Sessions: ${report.totals.sessionCount}`,
    `- Completed sessions: ${report.totals.completedSessionCount}`,
    `- Scheduled sessions: ${report.totals.scheduledSessionCount}`,
    `- Attendance records: ${report.totals.attendanceRecordCount}`,
    `- Present attendance: ${report.totals.presentAttendanceCount}`,
    `- Late attendance: ${report.totals.lateAttendanceCount}`,
    `- Absent attendance: ${report.totals.absentAttendanceCount}`,
    `- Excused attendance: ${report.totals.excusedAttendanceCount}`,
    `- Attendance rate: ${report.totals.attendanceRatePercent}%`,
    `- Progress records: ${report.totals.progressRecordCount}`,
    `- Completed progress: ${report.totals.completedProgressCount}`,
    `- In-progress learners: ${report.totals.inProgressCount}`,
    `- Needs-support learners: ${report.totals.needsSupportCount}`,
    `- Withdrawn learners: ${report.totals.withdrawnProgressCount}`,
    `- Completed lessons: ${report.totals.completedLessonCount}`,
    `- Total lessons: ${report.totals.totalLessonCount}`,
    `- Overall completion: ${report.totals.overallCompletionPercent}%`,
    `- Average learner completion: ${report.totals.averageLearnerCompletionPercent}%`,
    '',
    '## Class Aggregates',
    '',
    '| Class | Course | Students | Sessions | Attendance | Present | Late | Absent | Excused | Attendance rate | Avg completion | Completed | Needs support |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...report.classAggregates.map(
      (row) =>
        `| ${[
          row.classCode,
          row.courseCode,
          String(row.studentCount),
          String(row.sessionCount),
          String(row.attendanceRecordCount),
          String(row.presentAttendanceCount),
          String(row.lateAttendanceCount),
          String(row.absentAttendanceCount),
          String(row.excusedAttendanceCount),
          `${row.attendanceRatePercent}%`,
          `${row.averageLearnerCompletionPercent}%`,
          String(row.completedProgressCount),
          String(row.needsSupportCount),
        ].join(' | ')} |`,
    ),
    '',
    '## Session Rows',
    '',
    '| Class | Lesson | Status | Attendance | Present | Late | Absent | Excused |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |',
    ...report.sessionRows.map(
      (row) =>
        `| ${[
          row.classCode,
          `${row.lessonCode} ${row.title}`,
          row.status,
          String(row.attendanceRecordCount),
          String(row.presentAttendanceCount),
          String(row.lateAttendanceCount),
          String(row.absentAttendanceCount),
          String(row.excusedAttendanceCount),
        ].join(' | ')} |`,
    ),
    '',
    '## Learner Progress Rows',
    '',
    '| Student | Class | Attendance | Present | Late | Absent | Excused | Progress | Lessons | Completion |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |',
    ...report.learnerRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.classCode,
          String(row.attendanceRecordCount),
          String(row.presentAttendanceCount),
          String(row.lateAttendanceCount),
          String(row.absentAttendanceCount),
          String(row.excusedAttendanceCount),
          row.progressStatus,
          `${row.completedLessonCount}/${row.totalLessonCount}`,
          `${row.completionPercent}%`,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildSessionRow(input: {
  session: DemoLearningSession;
  classCohort: DemoLearningClassCohort;
  course: DemoLearningCourse;
  attendance: DemoLearningAttendanceRecord[];
}): DemoLearningSessionReportRow {
  const attendanceCounts = countAttendanceStatuses(input.attendance);

  return {
    sessionId: input.session.id,
    classId: input.classCohort.id,
    classCode: input.classCohort.code,
    courseCode: input.course.code,
    sequence: input.session.sequence,
    lessonCode: input.session.lessonCode,
    title: input.session.title,
    status: input.session.status,
    scheduledStart: input.session.scheduledStart,
    attendanceRecordCount: input.attendance.length,
    presentAttendanceCount: attendanceCounts.PRESENT,
    lateAttendanceCount: attendanceCounts.LATE,
    absentAttendanceCount: attendanceCounts.ABSENT,
    excusedAttendanceCount: attendanceCounts.EXCUSED,
  };
}

export function buildClassAggregates(input: {
  classes: DemoLearningClassCohort[];
  coursesById: Map<string, DemoLearningCourse>;
  learnerRows: DemoLearningLearnerProgressRow[];
  sessionRows: DemoLearningSessionReportRow[];
}): DemoLearningClassAggregateRow[] {
  return input.classes
    .map((classCohort) => {
      const course = requireCourseById(input.coursesById, classCohort.courseId);
      const learnerRows = input.learnerRows.filter(
        (row) => row.classId === classCohort.id,
      );
      const sessionRows = input.sessionRows.filter(
        (row) => row.classId === classCohort.id,
      );
      const presentAttendanceCount = learnerRows.reduce(
        (sum, row) => sum + row.presentAttendanceCount,
        0,
      );
      const lateAttendanceCount = learnerRows.reduce(
        (sum, row) => sum + row.lateAttendanceCount,
        0,
      );
      const absentAttendanceCount = learnerRows.reduce(
        (sum, row) => sum + row.absentAttendanceCount,
        0,
      );
      const excusedAttendanceCount = learnerRows.reduce(
        (sum, row) => sum + row.excusedAttendanceCount,
        0,
      );
      const attendanceRecordCount = learnerRows.reduce(
        (sum, row) => sum + row.attendanceRecordCount,
        0,
      );

      return {
        classId: classCohort.id,
        classCode: classCohort.code,
        classTitle: classCohort.title,
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        teacherName: classCohort.teacherName,
        status: classCohort.status,
        studentCount: learnerRows.length,
        sessionCount: sessionRows.length,
        completedSessionCount: sessionRows.filter(
          (row) => row.status === 'COMPLETED',
        ).length,
        scheduledSessionCount: sessionRows.filter(
          (row) => row.status === 'SCHEDULED',
        ).length,
        attendanceRecordCount,
        presentAttendanceCount,
        lateAttendanceCount,
        absentAttendanceCount,
        excusedAttendanceCount,
        attendanceRatePercent: percent(
          presentAttendanceCount + lateAttendanceCount,
          attendanceRecordCount,
        ),
        averageLearnerCompletionPercent: averagePercent(
          learnerRows.map((row) => row.completionPercent),
        ),
        completedProgressCount: learnerRows.filter(
          (row) => row.progressStatus === 'COMPLETED',
        ).length,
        needsSupportCount: learnerRows.filter(
          (row) => row.progressStatus === 'NEEDS_SUPPORT',
        ).length,
      } satisfies DemoLearningClassAggregateRow;
    })
    .sort((left, right) => left.classCode.localeCompare(right.classCode));
}

export function buildClassSessionStatusCounts(
  fixture: DemoLearningCoreFixture,
): DemoLearningClassSessionStatusCounts {
  return {
    class: countByStatus(
      classStatuses,
      fixture.classes,
      (classCohort) => classCohort.status,
    ),
    session: countByStatus(
      sessionStatuses,
      fixture.sessions,
      (session) => session.status,
    ),
    attendance: countAttendanceStatuses(fixture.attendance),
    progress: countByStatus(
      progressStatuses,
      fixture.progress,
      (progress) => progress.status,
    ),
  };
}
