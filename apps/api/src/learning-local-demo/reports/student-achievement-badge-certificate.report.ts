import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningAchievementRecordRow,
  DemoLearningBadgeAward,
  DemoLearningBadgeAwardRow,
  DemoLearningCertificateFixture,
  DemoLearningCertificateFixtureRow,
  DemoLearningCoreFixture,
  DemoLearningMilestone,
  DemoLearningMilestoneRow,
  DemoLearningRecognitionSummaryRow,
  DemoLearningParentGuardian,
  DemoLearningStudentAchievementBadgeCertificateReport,
  DemoLearningStudentAchievementBadgeCertificateStatusCounts,
  DemoLearningStudentAchievementSummaryRow,
} from '../learning-local-demo.types';
import {
  countByStatus,
  groupBy,
  requireAchievementRecord,
  requireAiTutorSupportRecommendation,
  requireClass,
  requireCourseById,
  requireDailyPlan,
  requireEnrollment,
  requireGuardian,
  requireGuardianByChildProfileId,
  requireLearningPath,
  requireLesson,
  requireStudentById,
} from './shared';

export const achievementKinds = [
  'LESSON_MASTERY',
  'PRACTICE_STREAK',
  'ASSESSMENT_SCORE',
  'SAFE_TUTOR_USE',
  'COURSE_COMPLETION',
] as const;

export const badgeAwardStatuses = [
  'AWARDED',
  'HELD_FOR_TEACHER_REVIEW',
] as const;

export const certificateFixtureStatuses = [
  'READY',
  'PENDING',
  'HELD_FOR_REVIEW',
] as const;

export const milestoneStatuses = ['COMPLETED', 'PENDING'] as const;

export const recognitionAudiences = ['PARENT', 'TEACHER'] as const;

export const recognitionStatuses = [
  'PARENT_VISIBLE',
  'TEACHER_REVIEW',
  'ENCOURAGEMENT_NEEDED',
] as const;

export function buildStudentAchievementBadgeCertificateReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningStudentAchievementBadgeCertificateReport {
  const studentsById = new Map(
    fixture.students.map((student) => [student.id, student]),
  );
  const coursesById = new Map(
    fixture.courses.map((course) => [course.id, course]),
  );
  const enrollmentsById = new Map(
    fixture.enrollments.map((enrollment) => [enrollment.id, enrollment]),
  );
  const enrollmentsByStudentId = new Map(
    fixture.enrollments.map((enrollment) => [enrollment.studentId, enrollment]),
  );
  const classesById = new Map(
    fixture.classes.map((classCohort) => [classCohort.id, classCohort]),
  );
  const lessonsById = new Map(
    fixture.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const assignmentsById = new Map(
    fixture.assignments.map((assignment) => [assignment.id, assignment]),
  );
  const progressById = new Map(
    fixture.progress.map((progress) => [progress.id, progress]),
  );
  const progressByStudentId = new Map(
    fixture.progress.map((progress) => [progress.studentId, progress]),
  );
  const pathsById = new Map(
    fixture.learningPaths.map((path) => [path.id, path]),
  );
  const dailyPlansById = new Map(
    fixture.dailyPlans.map((plan) => [plan.id, plan]),
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
  const achievementRecordsById = new Map(
    fixture.achievementRecords.map((record) => [record.id, record]),
  );
  const badgeAwardsById = new Map(
    fixture.badgeAwards.map((badge) => [badge.id, badge]),
  );
  const certificateFixturesById = new Map(
    fixture.certificateFixtures.map((certificate) => [
      certificate.id,
      certificate,
    ]),
  );
  const milestonesById = new Map(
    fixture.milestones.map((milestone) => [milestone.id, milestone]),
  );
  const supportRecommendationsById = new Map(
    fixture.aiTutorSupportRecommendations.map((recommendation) => [
      recommendation.id,
      recommendation,
    ]),
  );

  const achievementRows = fixture.achievementRecords
    .map((record) => {
      const enrollment = requireEnrollment(
        enrollmentsById,
        record.enrollmentId,
      );
      const student = requireStudentById(studentsById, record.studentId);
      const course = requireCourseById(coursesById, record.courseId);
      const classCohort = requireClass(classesById, record.classId);
      const lesson = requireLesson(lessonsById, record.lessonId);
      const dailyPlan = requireDailyPlan(dailyPlansById, record.dailyPlanId);
      const progress = progressById.get(record.progressId);
      if (!progress) {
        throw new Error(
          `Missing local demo progress record for ${record.progressId}`,
        );
      }
      const assignment = record.assignmentId
        ? assignmentsById.get(record.assignmentId)
        : undefined;
      if (record.assignmentId && !assignment) {
        throw new Error(
          `Missing local demo assignment for ${record.assignmentId}`,
        );
      }
      if (record.aiTutorSupportRecommendationId) {
        requireAiTutorSupportRecommendation(
          supportRecommendationsById,
          record.aiTutorSupportRecommendationId,
        );
      }
      if (
        enrollment.studentId !== student.id ||
        course.id !== enrollment.courseId ||
        classCohort.id !== dailyPlan.classId ||
        lesson.id !== dailyPlan.lessonId
      ) {
        throw new Error(
          `Mismatched local demo achievement fixture for ${record.id}`,
        );
      }

      return {
        achievementRecordId: record.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        lessonCode: lesson.code,
        lessonTitle: lesson.title,
        dailyPlanTitle: dailyPlan.title,
        assignmentTitle: assignment?.title ?? null,
        progressStatus: progress.status,
        achievementKind: record.achievementKind,
        earnedAt: record.earnedAt,
        evidenceScorePercent: record.evidenceScorePercent ?? null,
        points: record.points,
        aiTutorSupportRecommendationId:
          record.aiTutorSupportRecommendationId ?? null,
        evidenceSummary: record.evidenceSummary,
      } satisfies DemoLearningAchievementRecordRow;
    })
    .sort((left, right) =>
      [left.studentName, left.earnedAt, left.achievementRecordId]
        .join('|')
        .localeCompare(
          [right.studentName, right.earnedAt, right.achievementRecordId].join(
            '|',
          ),
        ),
    );

  const badgeRows = fixture.badgeAwards
    .map((badge) => {
      const enrollment = requireEnrollment(enrollmentsById, badge.enrollmentId);
      const student = requireStudentById(studentsById, badge.studentId);
      const course = requireCourseById(coursesById, badge.courseId);
      const classCohort = requireClass(classesById, badge.classId);
      for (const achievementRecordId of badge.achievementRecordIds) {
        requireAchievementRecord(achievementRecordsById, achievementRecordId);
      }
      if (enrollment.studentId !== student.id) {
        throw new Error(`Mismatched local demo badge fixture for ${badge.id}`);
      }

      return {
        badgeAwardId: badge.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        badgeCode: badge.badgeCode,
        badgeName: badge.badgeName,
        status: badge.status,
        awardedAt: badge.awardedAt,
        achievementRecordCount: badge.achievementRecordIds.length,
        pointsRequired: badge.pointsRequired,
        badgeSummary: badge.badgeSummary,
      } satisfies DemoLearningBadgeAwardRow;
    })
    .sort((left, right) =>
      [left.studentName, left.awardedAt, left.badgeAwardId]
        .join('|')
        .localeCompare(
          [right.studentName, right.awardedAt, right.badgeAwardId].join('|'),
        ),
    );

  const certificateRows = fixture.certificateFixtures
    .map((certificate) => {
      const enrollment = requireEnrollment(
        enrollmentsById,
        certificate.enrollmentId,
      );
      const student = requireStudentById(studentsById, certificate.studentId);
      const course = requireCourseById(coursesById, certificate.courseId);
      const classCohort = requireClass(classesById, certificate.classId);
      const learningPath = requireLearningPath(
        pathsById,
        certificate.learningPathId,
      );
      for (const badgeAwardId of certificate.completedBadgeAwardIds) {
        requireBadgeAward(badgeAwardsById, badgeAwardId);
      }
      for (const milestoneId of certificate.pendingMilestoneIds) {
        requireMilestone(milestonesById, milestoneId);
      }
      if (enrollment.studentId !== student.id) {
        throw new Error(
          `Mismatched local demo certificate fixture for ${certificate.id}`,
        );
      }

      return {
        certificateFixtureId: certificate.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        learningPathTitle: learningPath.title,
        certificateTitle: certificate.certificateTitle,
        status: certificate.status,
        eligibleAt: certificate.eligibleAt ?? null,
        heldReason: certificate.heldReason ?? 'NONE',
        completedBadgeAwardCount: certificate.completedBadgeAwardIds.length,
        pendingMilestoneCount: certificate.pendingMilestoneIds.length,
        certificatePreviewRef: certificate.certificatePreviewRef,
      } satisfies DemoLearningCertificateFixtureRow;
    })
    .sort((left, right) =>
      [left.status, left.studentName, left.certificateFixtureId]
        .join('|')
        .localeCompare(
          [right.status, right.studentName, right.certificateFixtureId].join(
            '|',
          ),
        ),
    );

  const milestoneRows = fixture.milestones
    .map((milestone) => {
      const enrollment = requireEnrollment(
        enrollmentsById,
        milestone.enrollmentId,
      );
      const student = requireStudentById(studentsById, milestone.studentId);
      const course = requireCourseById(coursesById, milestone.courseId);
      const classCohort = requireClass(classesById, milestone.classId);
      const learningPath = requireLearningPath(
        pathsById,
        milestone.learningPathId,
      );
      const dailyPlan = requireDailyPlan(dailyPlansById, milestone.dailyPlanId);
      const lesson = requireLesson(lessonsById, milestone.lessonId);
      if (enrollment.studentId !== student.id) {
        throw new Error(
          `Mismatched local demo milestone fixture for ${milestone.id}`,
        );
      }

      return {
        milestoneId: milestone.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        learningPathTitle: learningPath.title,
        dailyPlanTitle: dailyPlan.title,
        lessonCode: lesson.code,
        title: milestone.title,
        status: milestone.status,
        completedAt: milestone.completedAt ?? null,
        pendingReason: milestone.pendingReason ?? 'NONE',
      } satisfies DemoLearningMilestoneRow;
    })
    .sort((left, right) =>
      [left.studentName, left.status, left.milestoneId]
        .join('|')
        .localeCompare(
          [right.studentName, right.status, right.milestoneId].join('|'),
        ),
    );

  const recognitionRows = fixture.recognitionSummaries
    .map((recognition) => {
      const student = requireStudentById(studentsById, recognition.studentId);
      const guardian = requireGuardian(
        guardiansById,
        recognition.parentGuardianId,
      );
      const course = requireCourseById(coursesById, recognition.courseId);
      const classCohort = requireClass(classesById, recognition.classId);
      if (recognition.sourceBadgeAwardId) {
        requireBadgeAward(badgeAwardsById, recognition.sourceBadgeAwardId);
      }
      if (recognition.sourceCertificateFixtureId) {
        requireCertificateFixture(
          certificateFixturesById,
          recognition.sourceCertificateFixtureId,
        );
      }
      if (recognition.sourceAiTutorSupportRecommendationId) {
        requireAiTutorSupportRecommendation(
          supportRecommendationsById,
          recognition.sourceAiTutorSupportRecommendationId,
        );
      }

      return {
        recognitionSummaryId: recognition.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        parentGuardianName: guardian.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        audience: recognition.audience,
        status: recognition.status,
        parentVisible: recognition.parentVisible,
        teacherReviewRequired: recognition.teacherReviewRequired,
        encouragementNeeded: recognition.encouragementNeeded,
        sourceBadgeAwardId: recognition.sourceBadgeAwardId ?? null,
        sourceCertificateFixtureId:
          recognition.sourceCertificateFixtureId ?? null,
        sourceAiTutorSupportRecommendationId:
          recognition.sourceAiTutorSupportRecommendationId ?? null,
        createdAt: recognition.createdAt,
        summary: recognition.summary,
      } satisfies DemoLearningRecognitionSummaryRow;
    })
    .sort((left, right) =>
      [left.studentName, left.audience, left.createdAt]
        .join('|')
        .localeCompare(
          [right.studentName, right.audience, right.createdAt].join('|'),
        ),
    );

  const badgeRowsByStudentId = groupBy(badgeRows, (row) => row.studentId);
  const achievementRowsByStudentId = groupBy(
    achievementRows,
    (row) => row.studentId,
  );
  const certificateRowsByStudentId = groupBy(
    certificateRows,
    (row) => row.studentId,
  );
  const milestoneRowsByStudentId = groupBy(
    milestoneRows,
    (row) => row.studentId,
  );
  const recognitionRowsByStudentId = groupBy(
    recognitionRows,
    (row) => row.studentId,
  );

  const studentRows = fixture.students
    .map((student) => {
      const enrollment = enrollmentsByStudentId.get(student.id);
      if (!enrollment) {
        throw new Error(`Missing local demo enrollment for ${student.id}`);
      }
      const progress = progressByStudentId.get(student.id);
      if (!progress) {
        throw new Error(`Missing local demo progress for ${student.id}`);
      }
      const course = requireCourseById(coursesById, enrollment.courseId);
      const classCohort = requireClass(classesById, progress.classId);
      const guardian = requireGuardianByChildProfileId(
        guardianByChildProfileId,
        student.childProfileId,
      );
      const studentAchievements =
        achievementRowsByStudentId.get(student.id) ?? [];
      const studentBadges = badgeRowsByStudentId.get(student.id) ?? [];
      const studentCertificates =
        certificateRowsByStudentId.get(student.id) ?? [];
      const studentMilestones = milestoneRowsByStudentId.get(student.id) ?? [];
      const studentRecognitions =
        recognitionRowsByStudentId.get(student.id) ?? [];
      const firstCertificate = studentCertificates[0];

      return {
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        parentEmail: student.parentEmail,
        parentGuardianName: guardian.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        teacherName: classCohort.teacherName,
        progressStatus: progress.status,
        completionPercent: progress.completionPercent,
        achievementRecordCount: studentAchievements.length,
        badgeAwardCount: studentBadges.filter(
          (badge) => badge.status === 'AWARDED',
        ).length,
        completedMilestoneCount: studentMilestones.filter(
          (milestone) => milestone.status === 'COMPLETED',
        ).length,
        pendingMilestoneCount: studentMilestones.filter(
          (milestone) => milestone.status === 'PENDING',
        ).length,
        certificateStatus: firstCertificate?.status ?? 'NONE',
        parentVisibleRecognitionCount: studentRecognitions.filter(
          (recognition) => recognition.parentVisible,
        ).length,
        teacherReviewItemCount: studentRecognitions.filter(
          (recognition) => recognition.teacherReviewRequired,
        ).length,
        nearCertificate: studentCertificates.some(
          (certificate) => certificate.status === 'PENDING',
        ),
        needsEncouragement: studentRecognitions.some(
          (recognition) => recognition.encouragementNeeded,
        ),
      } satisfies DemoLearningStudentAchievementSummaryRow;
    })
    .sort((left, right) =>
      [left.studentName, left.studentId]
        .join('|')
        .localeCompare([right.studentName, right.studentId].join('|')),
    );

  const statusCounts =
    buildStudentAchievementBadgeCertificateStatusCounts(fixture);
  const studentsWithBadges = new Set(
    badgeRows
      .filter((row) => row.status === 'AWARDED')
      .map((row) => row.studentId),
  ).size;
  const studentsNearCertificate = new Set(
    certificateRows
      .filter((row) => row.status === 'PENDING')
      .map((row) => row.studentId),
  ).size;
  const studentsNeedingEncouragement = new Set(
    recognitionRows
      .filter((row) => row.encouragementNeeded)
      .map((row) => row.studentId),
  ).size;

  return {
    reportName:
      'Learning local demo Student Achievement -> Badge -> Certificate -> Recognition Report',
    generatedFor: 'local-demo-student-achievement-badge-certificate-report',
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
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      achievementRecords: fixture.achievementRecords.length,
      badgeAwards: fixture.badgeAwards.length,
      certificateFixtures: fixture.certificateFixtures.length,
      milestonesCompleted: statusCounts.milestoneStatus.COMPLETED,
      milestonesPending: statusCounts.milestoneStatus.PENDING,
      recognitionSummaries: fixture.recognitionSummaries.length,
      parentVisibleRecognitions: recognitionRows.filter(
        (row) => row.parentVisible,
      ).length,
      teacherReviewItems: recognitionRows.filter(
        (row) => row.teacherReviewRequired,
      ).length,
      studentsWithBadges,
      studentsNearCertificate,
      studentsNeedingEncouragement,
    },
    statusCounts,
    studentRows,
    achievementRows,
    badgeRows,
    certificateRows,
    milestoneRows,
    recognitionRows,
  };
}

export function toStudentAchievementBadgeCertificateMarkdown(
  report: DemoLearningStudentAchievementBadgeCertificateReport,
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
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Achievement records: ${report.totals.achievementRecords}`,
    `- Badge awards: ${report.totals.badgeAwards}`,
    `- Certificate fixtures: ${report.totals.certificateFixtures}`,
    `- Milestones completed: ${report.totals.milestonesCompleted}`,
    `- Milestones pending: ${report.totals.milestonesPending}`,
    `- Recognition summaries: ${report.totals.recognitionSummaries}`,
    `- Parent-visible recognitions: ${report.totals.parentVisibleRecognitions}`,
    `- Teacher review items: ${report.totals.teacherReviewItems}`,
    `- Students with badges: ${report.totals.studentsWithBadges}`,
    `- Students near certificate: ${report.totals.studentsNearCertificate}`,
    `- Students needing encouragement: ${report.totals.studentsNeedingEncouragement}`,
    '',
    '## Student Achievement Summary Rows',
    '',
    '| Student | Course | Class | Progress | Achievements | Badges | Completed milestones | Pending milestones | Certificate | Parent visible | Teacher review | Near certificate | Encouragement |',
    '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- | --- |',
    ...report.studentRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.classCode,
          row.progressStatus,
          String(row.achievementRecordCount),
          String(row.badgeAwardCount),
          String(row.completedMilestoneCount),
          String(row.pendingMilestoneCount),
          row.certificateStatus,
          String(row.parentVisibleRecognitionCount),
          String(row.teacherReviewItemCount),
          row.nearCertificate ? 'YES' : 'NO',
          row.needsEncouragement ? 'YES' : 'NO',
        ].join(' | ')} |`,
    ),
    '',
    '## Milestone Rows',
    '',
    '| Student | Course | Lesson | Daily plan | Milestone | Status | Completed at | Pending reason |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.milestoneRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.lessonCode,
          row.dailyPlanTitle,
          row.title,
          row.status,
          row.completedAt ?? 'n/a',
          row.pendingReason,
        ].join(' | ')} |`,
    ),
    '',
    '## Achievement Rows',
    '',
    '| Student | Course | Class | Lesson | Daily plan | Assignment | Kind | Score | Points | AI support | Evidence |',
    '| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- |',
    ...report.achievementRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.classCode,
          row.lessonCode,
          row.dailyPlanTitle,
          row.assignmentTitle ?? 'n/a',
          row.achievementKind,
          row.evidenceScorePercent === null
            ? 'n/a'
            : String(row.evidenceScorePercent),
          String(row.points),
          row.aiTutorSupportRecommendationId ?? 'n/a',
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Badge Award Rows',
    '',
    '| Student | Course | Class | Badge | Status | Achievements | Points required | Awarded at | Summary |',
    '| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |',
    ...report.badgeRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.classCode,
          `${row.badgeName} (${row.badgeCode})`,
          row.status,
          String(row.achievementRecordCount),
          String(row.pointsRequired),
          row.awardedAt,
          row.badgeSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Certificate Fixture Rows',
    '',
    '| Certificate | Student | Course | Class | Title | Status | Eligible at | Badges | Pending milestones | Preview ref | Held reason |',
    '| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- |',
    ...report.certificateRows.map(
      (row) =>
        `| ${[
          row.certificateFixtureId,
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.classCode,
          row.certificateTitle,
          row.status,
          row.eligibleAt ?? 'n/a',
          String(row.completedBadgeAwardCount),
          String(row.pendingMilestoneCount),
          row.certificatePreviewRef,
          row.heldReason,
        ].join(' | ')} |`,
    ),
    '',
    '## Recognition Summary Rows',
    '',
    '| Student | Parent | Course | Audience | Status | Parent visible | Teacher review | Encouragement | Badge | Certificate | AI support | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.recognitionRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.parentGuardianName,
          `${row.courseCode} / ${row.classCode}`,
          row.audience,
          row.status,
          row.parentVisible ? 'YES' : 'NO',
          row.teacherReviewRequired ? 'YES' : 'NO',
          row.encouragementNeeded ? 'YES' : 'NO',
          row.sourceBadgeAwardId ?? 'n/a',
          row.sourceCertificateFixtureId ?? 'n/a',
          row.sourceAiTutorSupportRecommendationId ?? 'n/a',
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildStudentAchievementBadgeCertificateStatusCounts(
  fixture: DemoLearningCoreFixture,
): DemoLearningStudentAchievementBadgeCertificateStatusCounts {
  return {
    achievementKind: countByStatus(
      achievementKinds,
      fixture.achievementRecords,
      (record) => record.achievementKind,
    ),
    badgeAwardStatus: countByStatus(
      badgeAwardStatuses,
      fixture.badgeAwards,
      (badge) => badge.status,
    ),
    certificateStatus: countByStatus(
      certificateFixtureStatuses,
      fixture.certificateFixtures,
      (certificate) => certificate.status,
    ),
    milestoneStatus: countByStatus(
      milestoneStatuses,
      fixture.milestones,
      (milestone) => milestone.status,
    ),
    recognitionAudience: countByStatus(
      recognitionAudiences,
      fixture.recognitionSummaries,
      (recognition) => recognition.audience,
    ),
    recognitionStatus: countByStatus(
      recognitionStatuses,
      fixture.recognitionSummaries,
      (recognition) => recognition.status,
    ),
  };
}

export function requireBadgeAward(
  badgeAwardsById: Map<string, DemoLearningBadgeAward>,
  badgeAwardId: string,
) {
  const badgeAward = badgeAwardsById.get(badgeAwardId);
  if (!badgeAward) {
    throw new Error(`Missing local demo badge award for ${badgeAwardId}`);
  }

  return badgeAward;
}

export function requireCertificateFixture(
  certificateFixturesById: Map<string, DemoLearningCertificateFixture>,
  certificateFixtureId: string,
) {
  const certificateFixture = certificateFixturesById.get(certificateFixtureId);
  if (!certificateFixture) {
    throw new Error(
      `Missing local demo certificate fixture for ${certificateFixtureId}`,
    );
  }

  return certificateFixture;
}

export function requireMilestone(
  milestonesById: Map<string, DemoLearningMilestone>,
  milestoneId: string,
) {
  const milestone = milestonesById.get(milestoneId);
  if (!milestone) {
    throw new Error(`Missing local demo milestone for ${milestoneId}`);
  }

  return milestone;
}
