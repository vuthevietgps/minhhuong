import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningAiTutorChatMessageRow,
  DemoLearningAiTutorChatSafetyTeacherReviewReport,
  DemoLearningAiTutorChatSafetyTeacherReviewStatusCounts,
  DemoLearningAiTutorChatSession,
  DemoLearningAiTutorChatSessionRow,
  DemoLearningAiTutorParentSummaryRow,
  DemoLearningAiTutorSafetyFlag,
  DemoLearningAiTutorSafetyFlagRow,
  DemoLearningAiTutorSupportRecommendationRow,
  DemoLearningAiTutorTeacherReviewQueueRow,
  DemoLearningCoreFixture,
} from '../learning-local-demo.types';
import {
  countByStatus,
  groupBy,
  requireClass,
  requireCourseById,
  requireDailyPlan,
  requireEnrollment,
  requireGuardian,
  requireLearningPath,
  requireLesson,
  requireStudentById,
} from './shared';

export const aiTutorChatSessionStatuses = [
  'ACTIVE',
  'ESCALATED',
  'CLOSED',
] as const;

export const aiTutorMessageRoles = ['STUDENT', 'AI_TUTOR'] as const;

export const aiTutorGuardDecisions = ['ALLOWED', 'BLOCKED'] as const;

export const aiTutorTopicCategories = [
  'LESSON_HELP',
  'PRACTICE_HINT',
  'STUDY_PLANNING',
  'PERSONAL_DATA',
  'OFF_TOPIC_GAMING',
  'ACCOUNT_ACCESS',
  'SAFETY_REDIRECT',
  'ACADEMIC_INTEGRITY',
] as const;

export const aiTutorSafetySeverities = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const aiTutorTeacherReviewStatuses = [
  'OPEN',
  'REVIEWED',
  'RESOLVED',
] as const;

export const aiTutorSupportPriorities = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const aiTutorSupportRecommendationStatuses = [
  'RECOMMENDED',
  'MONITORING',
  'COMPLETED',
] as const;

export function buildAiTutorChatSafetyTeacherReviewReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningAiTutorChatSafetyTeacherReviewReport {
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
  const dailyPlansById = new Map(
    fixture.dailyPlans.map((plan) => [plan.id, plan]),
  );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );
  const sessionsById = new Map(
    fixture.aiTutorChatSessions.map((session) => [session.id, session]),
  );
  const safetyFlagsById = new Map(
    fixture.aiTutorSafetyFlags.map((flag) => [flag.id, flag]),
  );
  const messagesBySessionId = groupBy(
    fixture.aiTutorChatMessages,
    (message) => message.chatSessionId,
  );
  const safetyFlagsBySessionId = groupBy(
    fixture.aiTutorSafetyFlags,
    (flag) => flag.chatSessionId,
  );
  const reviewItemsBySessionId = groupBy(
    fixture.aiTutorTeacherReviewItems,
    (item) => item.chatSessionId,
  );
  const parentSummariesBySessionId = groupBy(
    fixture.aiTutorParentSummaries,
    (summary) => summary.chatSessionId,
  );
  const supportRecommendationsBySessionId = groupBy(
    fixture.aiTutorSupportRecommendations,
    (recommendation) => recommendation.chatSessionId,
  );
  const supportRecommendationsByReviewItemId = groupBy(
    fixture.aiTutorSupportRecommendations,
    (recommendation) => recommendation.teacherReviewItemId,
  );

  const chatSessionRows = fixture.aiTutorChatSessions
    .map((session) => {
      const enrollment = requireEnrollment(
        enrollmentsById,
        session.enrollmentId,
      );
      const student = requireStudentById(studentsById, session.studentId);
      const learningPath = requireLearningPath(
        pathsById,
        session.learningPathId,
      );
      const dailyPlan = requireDailyPlan(dailyPlansById, session.dailyPlanId);
      const lesson = requireLesson(lessonsById, session.lessonId);
      const course = requireCourseById(coursesById, enrollment.courseId);
      const classCohort = requireClass(classesById, learningPath.classId);
      const messages = messagesBySessionId.get(session.id) ?? [];
      const safetyFlags = safetyFlagsBySessionId.get(session.id) ?? [];
      const reviewItems = reviewItemsBySessionId.get(session.id) ?? [];
      const supportRecommendations =
        supportRecommendationsBySessionId.get(session.id) ?? [];

      return {
        chatSessionId: session.id,
        enrollmentId: enrollment.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        parentEmail: student.parentEmail,
        courseId: course.id,
        courseCode: course.code,
        classId: classCohort.id,
        classCode: classCohort.code,
        teacherName: classCohort.teacherName,
        learningPathId: learningPath.id,
        dailyPlanId: dailyPlan.id,
        dailyPlanTitle: dailyPlan.title,
        dailyPlanStatus: dailyPlan.status,
        lessonId: lesson.id,
        lessonCode: lesson.code,
        lessonTitle: lesson.title,
        sessionStatus: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt ?? null,
        messageCount: messages.length,
        allowedMessageCount: messages.filter(
          (message) => message.guardDecision === 'ALLOWED',
        ).length,
        blockedMessageCount: messages.filter(
          (message) => message.guardDecision === 'BLOCKED',
        ).length,
        safetyFlagCount: safetyFlags.length,
        teacherReviewItemCount: reviewItems.length,
        supportRecommendationCount: supportRecommendations.length,
        parentSummaryReady:
          (parentSummariesBySessionId.get(session.id) ?? []).length > 0,
      } satisfies DemoLearningAiTutorChatSessionRow;
    })
    .sort((left, right) =>
      [left.studentName, left.startedAt, left.chatSessionId]
        .join('|')
        .localeCompare(
          [right.studentName, right.startedAt, right.chatSessionId].join('|'),
        ),
    );

  const messageRows = fixture.aiTutorChatMessages
    .map((message) => {
      const session = requireAiTutorChatSession(
        sessionsById,
        message.chatSessionId,
      );
      const student = requireStudentById(studentsById, session.studentId);

      return {
        messageId: message.id,
        chatSessionId: session.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        sequence: message.sequence,
        role: message.role,
        sentAt: message.sentAt,
        topicCategory: message.topicCategory,
        guardDecision: message.guardDecision,
        blockedTopic: message.blockedTopic,
        messagePreview: message.messagePreview,
      } satisfies DemoLearningAiTutorChatMessageRow;
    })
    .sort((left, right) =>
      [left.studentName, left.sentAt, String(left.sequence), left.messageId]
        .join('|')
        .localeCompare(
          [
            right.studentName,
            right.sentAt,
            String(right.sequence),
            right.messageId,
          ].join('|'),
        ),
    );

  const safetyFlagRows = fixture.aiTutorSafetyFlags
    .map((flag) => {
      const session = requireAiTutorChatSession(
        sessionsById,
        flag.chatSessionId,
      );
      const student = requireStudentById(studentsById, flag.studentId);

      return {
        safetyFlagId: flag.id,
        chatSessionId: session.id,
        messageId: flag.messageId,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        topicCategory: flag.topicCategory,
        guardDecision: flag.guardDecision,
        severity: flag.severity,
        blockedTopic: flag.blockedTopic,
        reason: flag.reason,
      } satisfies DemoLearningAiTutorSafetyFlagRow;
    })
    .sort((left, right) =>
      [left.studentName, left.severity, left.safetyFlagId]
        .join('|')
        .localeCompare(
          [right.studentName, right.severity, right.safetyFlagId].join('|'),
        ),
    );

  const teacherReviewRows = fixture.aiTutorTeacherReviewItems
    .map((item) => {
      const flag = requireAiTutorSafetyFlag(safetyFlagsById, item.safetyFlagId);
      const session = requireAiTutorChatSession(
        sessionsById,
        item.chatSessionId,
      );
      const dailyPlan = requireDailyPlan(dailyPlansById, session.dailyPlanId);
      const student = requireStudentById(studentsById, item.studentId);
      const course = requireCourseById(coursesById, dailyPlan.courseId);
      const classCohort = requireClass(classesById, dailyPlan.classId);
      const lesson = requireLesson(lessonsById, dailyPlan.lessonId);

      return {
        teacherReviewItemId: item.id,
        chatSessionId: session.id,
        safetyFlagId: flag.id,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        lessonCode: lesson.code,
        dailyPlanTitle: dailyPlan.title,
        assignedTeacherName: item.assignedTeacherName,
        topicCategory: flag.topicCategory,
        severity: flag.severity,
        reviewStatus: item.status,
        createdAt: item.createdAt,
        reviewedAt: item.reviewedAt ?? null,
        actionSummary: item.actionSummary,
        parentSummaryReady:
          (parentSummariesBySessionId.get(session.id) ?? []).length > 0,
        supportRecommendationCount: (
          supportRecommendationsByReviewItemId.get(item.id) ?? []
        ).length,
      } satisfies DemoLearningAiTutorTeacherReviewQueueRow;
    })
    .sort((left, right) =>
      [left.reviewStatus, left.studentName, left.createdAt]
        .join('|')
        .localeCompare(
          [right.reviewStatus, right.studentName, right.createdAt].join('|'),
        ),
    );

  const parentSummaryRows = fixture.aiTutorParentSummaries
    .map((summary) => {
      const session = requireAiTutorChatSession(
        sessionsById,
        summary.chatSessionId,
      );
      const dailyPlan = requireDailyPlan(dailyPlansById, session.dailyPlanId);
      const student = requireStudentById(studentsById, summary.studentId);
      const guardian = requireGuardian(guardiansById, summary.parentGuardianId);
      const course = requireCourseById(coursesById, dailyPlan.courseId);
      const classCohort = requireClass(classesById, dailyPlan.classId);

      return {
        parentSummaryId: summary.id,
        chatSessionId: session.id,
        parentGuardianId: guardian.id,
        parentGuardianName: guardian.displayName,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        createdAt: summary.createdAt,
        summary: summary.summary,
      } satisfies DemoLearningAiTutorParentSummaryRow;
    })
    .sort((left, right) =>
      [left.studentName, left.createdAt, left.parentSummaryId]
        .join('|')
        .localeCompare(
          [right.studentName, right.createdAt, right.parentSummaryId].join('|'),
        ),
    );

  const supportRecommendationRows = fixture.aiTutorSupportRecommendations
    .map((recommendation) => {
      const session = requireAiTutorChatSession(
        sessionsById,
        recommendation.chatSessionId,
      );
      const dailyPlan = requireDailyPlan(
        dailyPlansById,
        recommendation.dailyPlanId,
      );
      const student = requireStudentById(
        studentsById,
        recommendation.studentId,
      );
      const course = requireCourseById(coursesById, dailyPlan.courseId);
      const classCohort = requireClass(classesById, dailyPlan.classId);

      return {
        supportRecommendationId: recommendation.id,
        chatSessionId: session.id,
        teacherReviewItemId: recommendation.teacherReviewItemId,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        dailyPlanTitle: dailyPlan.title,
        priority: recommendation.priority,
        status: recommendation.status,
        recommendation: recommendation.recommendation,
      } satisfies DemoLearningAiTutorSupportRecommendationRow;
    })
    .sort((left, right) =>
      [left.priority, left.studentName, left.supportRecommendationId]
        .join('|')
        .localeCompare(
          [
            right.priority,
            right.studentName,
            right.supportRecommendationId,
          ].join('|'),
        ),
    );

  const statusCounts = buildAiTutorChatSafetyTeacherReviewStatusCounts(fixture);
  const reviewedTeacherReviewItemCount =
    statusCounts.teacherReviewStatus.REVIEWED +
    statusCounts.teacherReviewStatus.RESOLVED;
  const studentsNeedingSupportCount = new Set(
    supportRecommendationRows
      .filter((row) => row.priority !== 'LOW')
      .map((row) => row.studentId),
  ).size;
  const topicCategoryCount = new Set(
    messageRows.map((row) => row.topicCategory),
  ).size;

  return {
    reportName:
      'Learning local demo AI Tutor Chat -> Safety Guard -> Teacher Review -> Parent Summary -> Learning Support Report',
    generatedFor: 'local-demo-ai-tutor-chat-safety-teacher-review-report',
    generatedAt,
    currency: fixture.currency,
    safety: {
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
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realLearningSupportMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      chatSessionCount: fixture.aiTutorChatSessions.length,
      messageCount: fixture.aiTutorChatMessages.length,
      allowedMessageCount: statusCounts.guardDecision.ALLOWED,
      blockedMessageCount: statusCounts.guardDecision.BLOCKED,
      safetyFlagCount: fixture.aiTutorSafetyFlags.length,
      blockedTopicCount: fixture.aiTutorChatMessages.filter(
        (message) => message.blockedTopic,
      ).length,
      teacherReviewItemCount: fixture.aiTutorTeacherReviewItems.length,
      reviewedTeacherReviewItemCount,
      parentSummaryCount: fixture.aiTutorParentSummaries.length,
      studentsNeedingSupportCount,
      topicCategoryCount,
      supportRecommendationCount: fixture.aiTutorSupportRecommendations.length,
    },
    statusCounts,
    chatSessionRows,
    messageRows,
    safetyFlagRows,
    teacherReviewRows,
    parentSummaryRows,
    supportRecommendationRows,
  };
}

export function toAiTutorChatSafetyTeacherReviewMarkdown(
  report: DemoLearningAiTutorChatSafetyTeacherReviewReport,
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
    '- realParentMessageMutationUsed=false',
    '- realTeacherInterventionMutationUsed=false',
    '- realLearningSupportMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Chat sessions: ${report.totals.chatSessionCount}`,
    `- Messages: ${report.totals.messageCount}`,
    `- Allowed messages: ${report.totals.allowedMessageCount}`,
    `- Blocked messages: ${report.totals.blockedMessageCount}`,
    `- Safety flags: ${report.totals.safetyFlagCount}`,
    `- Blocked topics: ${report.totals.blockedTopicCount}`,
    `- Teacher review items: ${report.totals.teacherReviewItemCount}`,
    `- Reviewed teacher review items: ${report.totals.reviewedTeacherReviewItemCount}`,
    `- Parent summaries: ${report.totals.parentSummaryCount}`,
    `- Students needing support: ${report.totals.studentsNeedingSupportCount}`,
    `- Topic categories: ${report.totals.topicCategoryCount}`,
    `- Support recommendations: ${report.totals.supportRecommendationCount}`,
    '',
    '## Chat Session Rows',
    '',
    '| Session | Student | Course | Class | Daily plan | Lesson | Status | Messages | Blocked | Safety flags | Review | Support | Parent summary |',
    '| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...report.chatSessionRows.map(
      (row) =>
        `| ${[
          row.chatSessionId,
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.classCode,
          row.dailyPlanTitle,
          row.lessonCode,
          row.sessionStatus,
          String(row.messageCount),
          String(row.blockedMessageCount),
          String(row.safetyFlagCount),
          String(row.teacherReviewItemCount),
          String(row.supportRecommendationCount),
          row.parentSummaryReady ? 'READY' : 'NOT_READY',
        ].join(' | ')} |`,
    ),
    '',
    '## Message Rows',
    '',
    '| Student | Seq | Role | Topic | Guard | Blocked | Preview |',
    '| --- | ---: | --- | --- | --- | --- | --- |',
    ...report.messageRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          String(row.sequence),
          row.role,
          row.topicCategory,
          row.guardDecision,
          row.blockedTopic ? 'YES' : 'NO',
          row.messagePreview,
        ].join(' | ')} |`,
    ),
    '',
    '## Safety Flag Rows',
    '',
    '| Student | Topic | Severity | Guard | Blocked | Reason |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.safetyFlagRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.topicCategory,
          row.severity,
          row.guardDecision,
          row.blockedTopic ? 'YES' : 'NO',
          row.reason,
        ].join(' | ')} |`,
    ),
    '',
    '## Teacher Review Queue',
    '',
    '| Student | Class | Lesson | Topic | Severity | Status | Teacher | Parent summary | Support | Action |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |',
    ...report.teacherReviewRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.classCode,
          row.lessonCode,
          row.topicCategory,
          row.severity,
          row.reviewStatus,
          row.assignedTeacherName,
          row.parentSummaryReady ? 'READY' : 'NOT_READY',
          String(row.supportRecommendationCount),
          row.actionSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Parent Summary Rows',
    '',
    '| Parent | Student | Course | Class | Created at | Summary |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.parentSummaryRows.map(
      (row) =>
        `| ${[
          row.parentGuardianName,
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.classCode,
          row.createdAt,
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
    '## Learning Support Recommendation Rows',
    '',
    '| Student | Course | Class | Daily plan | Priority | Status | Recommendation |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.supportRecommendationRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.classCode,
          row.dailyPlanTitle,
          row.priority,
          row.status,
          row.recommendation,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildAiTutorChatSafetyTeacherReviewStatusCounts(
  fixture: DemoLearningCoreFixture,
): DemoLearningAiTutorChatSafetyTeacherReviewStatusCounts {
  return {
    sessionStatus: countByStatus(
      aiTutorChatSessionStatuses,
      fixture.aiTutorChatSessions,
      (session) => session.status,
    ),
    messageRole: countByStatus(
      aiTutorMessageRoles,
      fixture.aiTutorChatMessages,
      (message) => message.role,
    ),
    guardDecision: countByStatus(
      aiTutorGuardDecisions,
      fixture.aiTutorChatMessages,
      (message) => message.guardDecision,
    ),
    topicCategory: countByStatus(
      aiTutorTopicCategories,
      fixture.aiTutorChatMessages,
      (message) => message.topicCategory,
    ),
    safetySeverity: countByStatus(
      aiTutorSafetySeverities,
      fixture.aiTutorSafetyFlags,
      (flag) => flag.severity,
    ),
    teacherReviewStatus: countByStatus(
      aiTutorTeacherReviewStatuses,
      fixture.aiTutorTeacherReviewItems,
      (item) => item.status,
    ),
    supportPriority: countByStatus(
      aiTutorSupportPriorities,
      fixture.aiTutorSupportRecommendations,
      (recommendation) => recommendation.priority,
    ),
    supportRecommendationStatus: countByStatus(
      aiTutorSupportRecommendationStatuses,
      fixture.aiTutorSupportRecommendations,
      (recommendation) => recommendation.status,
    ),
  };
}

export function requireAiTutorChatSession(
  sessionsById: Map<string, DemoLearningAiTutorChatSession>,
  chatSessionId: string,
) {
  const session = sessionsById.get(chatSessionId);
  if (!session) {
    throw new Error(
      `Missing local demo AI tutor chat session for ${chatSessionId}`,
    );
  }

  return session;
}

export function requireAiTutorSafetyFlag(
  safetyFlagsById: Map<string, DemoLearningAiTutorSafetyFlag>,
  safetyFlagId: string,
) {
  const safetyFlag = safetyFlagsById.get(safetyFlagId);
  if (!safetyFlag) {
    throw new Error(
      `Missing local demo AI tutor safety flag for ${safetyFlagId}`,
    );
  }

  return safetyFlag;
}
