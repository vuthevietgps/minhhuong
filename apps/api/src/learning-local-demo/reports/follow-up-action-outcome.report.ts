import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningFollowUpActionOutcomeImpact,
  DemoLearningFollowUpActionOutcomeReport,
  DemoLearningFollowUpActionOutcomeRow,
  DemoLearningFollowUpActionOutcomeStatus,
  DemoLearningFollowUpActionOutcomeStatusCounts,
  DemoLearningFollowUpActionOutcomeStudentRow,
} from '../learning-local-demo.types';
import { buildParentTeacherWeeklyDigestReport } from './parent-teacher-weekly-digest.report';
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
  requireStudentById,
  requireWeeklyDigest,
  weeklyDigestActionOwners,
  weeklyDigestActionPriorities,
} from './shared';

export const followUpActionOutcomeStatuses: readonly DemoLearningFollowUpActionOutcomeStatus[] =
  ['COMPLETED', 'VERIFIED', 'SCHEDULED', 'MONITORING', 'HELD'];

export const followUpActionOutcomeImpacts: readonly DemoLearningFollowUpActionOutcomeImpact[] =
  ['POSITIVE', 'STABLE', 'NEEDS_SUPPORT', 'NO_SEND'];

export function buildFollowUpActionOutcomeReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningFollowUpActionOutcomeReport {
  const weeklyDigestReport = buildParentTeacherWeeklyDigestReport(
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
  const dailyPlansById = new Map(
    fixture.dailyPlans.map((dailyPlan) => [dailyPlan.id, dailyPlan]),
  );
  const supportRecommendationsById = new Map(
    fixture.aiTutorSupportRecommendations.map((recommendation) => [
      recommendation.id,
      recommendation,
    ]),
  );
  const achievementRecordsById = new Map(
    fixture.achievementRecords.map((achievementRecord) => [
      achievementRecord.id,
      achievementRecord,
    ]),
  );
  const parentSummariesById = new Map(
    fixture.aiTutorParentSummaries.map((parentSummary) => [
      parentSummary.id,
      parentSummary,
    ]),
  );
  const teacherReviewItemsById = new Map(
    fixture.aiTutorTeacherReviewItems.map((teacherReviewItem) => [
      teacherReviewItem.id,
      teacherReviewItem,
    ]),
  );
  const weeklyDigestsById = new Map(
    fixture.weeklyDigests.map((digest) => [digest.id, digest]),
  );
  const weeklyDigestActionsById = new Map(
    fixture.weeklyDigestActions.map((action) => [action.id, action]),
  );
  const digestRowsById = new Map(
    weeklyDigestReport.digestRows.map((row) => [row.digestId, row]),
  );
  const actionRowsById = new Map(
    weeklyDigestReport.actionRows.map((row) => [row.actionId, row]),
  );

  const outcomeRows = fixture.followUpActionOutcomes
    .map((outcome) => {
      const action = weeklyDigestActionsById.get(outcome.weeklyDigestActionId);
      if (!action) {
        throw new Error(
          `Missing local demo follow-up action for ${outcome.id}`,
        );
      }
      const digest = requireWeeklyDigest(weeklyDigestsById, outcome.digestId);
      const actionRow = actionRowsById.get(action.id);
      if (!actionRow) {
        throw new Error(
          `Missing local demo follow-up action row for ${outcome.id}`,
        );
      }
      const digestRow = digestRowsById.get(digest.id);
      if (!digestRow) {
        throw new Error(
          `Missing local demo follow-up digest row for ${outcome.id}`,
        );
      }
      const student = requireStudentById(studentsById, outcome.studentId);
      const enrollment = requireEnrollment(
        enrollmentsById,
        digest.enrollmentId,
      );
      const course = requireCourseById(coursesById, digest.courseId);
      const classCohort = requireClass(classesById, digest.classId);
      const guardian = requireGuardian(guardiansById, digest.parentGuardianId);
      const dailyPlan = outcome.sourceDailyPlanId
        ? requireDailyPlan(dailyPlansById, outcome.sourceDailyPlanId)
        : null;
      const supportRecommendation = outcome.sourceAiTutorSupportRecommendationId
        ? requireAiTutorSupportRecommendation(
            supportRecommendationsById,
            outcome.sourceAiTutorSupportRecommendationId,
          )
        : null;
      const achievementRecord = outcome.sourceAchievementRecordId
        ? requireAchievementRecord(
            achievementRecordsById,
            outcome.sourceAchievementRecordId,
          )
        : null;
      const parentSummary = outcome.sourceAiTutorParentSummaryId
        ? parentSummariesById.get(outcome.sourceAiTutorParentSummaryId)
        : null;
      const teacherReviewItem = outcome.sourceAiTutorTeacherReviewItemId
        ? teacherReviewItemsById.get(outcome.sourceAiTutorTeacherReviewItemId)
        : null;

      if (outcome.sourceAiTutorParentSummaryId && !parentSummary) {
        throw new Error(
          `Missing local demo follow-up parent summary ${outcome.sourceAiTutorParentSummaryId}`,
        );
      }
      if (outcome.sourceAiTutorTeacherReviewItemId && !teacherReviewItem) {
        throw new Error(
          `Missing local demo follow-up teacher review ${outcome.sourceAiTutorTeacherReviewItemId}`,
        );
      }
      if (
        action.digestId !== digest.id ||
        outcome.digestId !== digest.id ||
        action.studentId !== student.id ||
        digest.studentId !== student.id ||
        enrollment.studentId !== student.id ||
        enrollment.courseId !== course.id ||
        classCohort.courseId !== course.id ||
        !guardian.childProfileIds.includes(student.childProfileId)
      ) {
        throw new Error(
          `Mismatched local demo follow-up outcome fixture for ${outcome.id}`,
        );
      }
      if (
        dailyPlan &&
        (dailyPlan.studentId !== student.id ||
          dailyPlan.courseId !== course.id ||
          dailyPlan.classId !== classCohort.id)
      ) {
        throw new Error(
          `Mismatched local demo follow-up daily plan for ${outcome.id}`,
        );
      }
      if (
        supportRecommendation &&
        supportRecommendation.studentId !== student.id
      ) {
        throw new Error(
          `Mismatched local demo follow-up support recommendation for ${outcome.id}`,
        );
      }
      if (achievementRecord && achievementRecord.studentId !== student.id) {
        throw new Error(
          `Mismatched local demo follow-up achievement for ${outcome.id}`,
        );
      }
      if (
        parentSummary &&
        (parentSummary.studentId !== student.id ||
          parentSummary.parentGuardianId !== guardian.id)
      ) {
        throw new Error(
          `Mismatched local demo follow-up parent summary for ${outcome.id}`,
        );
      }
      if (teacherReviewItem && teacherReviewItem.studentId !== student.id) {
        throw new Error(
          `Mismatched local demo follow-up teacher review for ${outcome.id}`,
        );
      }

      return {
        outcomeId: outcome.id,
        actionId: action.id,
        digestId: digest.id,
        weekStart: digest.weekStart,
        weekEnd: digest.weekEnd,
        actionOwner: action.owner,
        actionPriority: action.priority,
        actionStatus: action.status,
        outcomeStatus: outcome.outcomeStatus,
        impactBand: outcome.impactBand,
        parentVisible: outcome.parentVisible,
        outcomeAt: outcome.outcomeAt ?? null,
        nextReviewAt: outcome.nextReviewAt ?? null,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        parentGuardianName: guardian.displayName,
        parentEmail: student.parentEmail,
        courseCode: course.code,
        classCode: classCohort.code,
        teacherName: classCohort.teacherName,
        digestAudience: digestRow.audience,
        digestDeliveryStatus: digestRow.deliveryStatus,
        dailyPlanId: dailyPlan?.id ?? null,
        dailyPlanTitle: dailyPlan?.title ?? null,
        dailyPlanStatus: dailyPlan?.status ?? 'NONE',
        supportRecommendationId: supportRecommendation?.id ?? null,
        supportPriority: supportRecommendation?.priority ?? 'NONE',
        supportStatus: supportRecommendation?.status ?? 'NONE',
        achievementRecordId: achievementRecord?.id ?? null,
        achievementKind: achievementRecord?.achievementKind ?? 'NONE',
        achievementPoints: achievementRecord?.points ?? 0,
        parentSummaryId: parentSummary?.id ?? null,
        parentSummaryReady: Boolean(parentSummary && outcome.parentVisible),
        teacherReviewItemId: teacherReviewItem?.id ?? null,
        teacherReviewStatus: teacherReviewItem?.status ?? 'NONE',
        sourceAlertId: actionRow.sourceAlertId,
        sourceRecognitionSummaryId: actionRow.sourceRecognitionSummaryId,
        actionSummary: action.actionSummary,
        evidenceSummary: outcome.evidenceSummary,
        outcomeSummary: outcome.outcomeSummary,
      } satisfies DemoLearningFollowUpActionOutcomeRow;
    })
    .sort((left, right) =>
      [
        left.outcomeAt ?? left.nextReviewAt ?? '9999-12-31T00:00:00.000Z',
        left.studentName,
        left.outcomeId,
      ]
        .join('|')
        .localeCompare(
          [
            right.outcomeAt ?? right.nextReviewAt ?? '9999-12-31T00:00:00.000Z',
            right.studentName,
            right.outcomeId,
          ].join('|'),
        ),
    );

  const outcomeRowsByStudentId = groupBy(outcomeRows, (row) => row.studentId);
  const studentRows = [...outcomeRowsByStudentId.entries()]
    .map(([studentId, rows]) => {
      const first = rows[0];
      const completedOrVerifiedCount = rows.filter((row) =>
        ['COMPLETED', 'VERIFIED'].includes(row.outcomeStatus),
      ).length;
      const scheduledOrMonitoringCount = rows.filter((row) =>
        ['SCHEDULED', 'MONITORING'].includes(row.outcomeStatus),
      ).length;
      const heldOutcomeCount = rows.filter(
        (row) => row.outcomeStatus === 'HELD',
      ).length;
      const needsSupportOutcomeCount = rows.filter(
        (row) => row.impactBand === 'NEEDS_SUPPORT',
      ).length;
      const nextReviewAt =
        rows
          .filter((row) => row.nextReviewAt)
          .map((row) => row.nextReviewAt as string)
          .sort((left, right) => left.localeCompare(right))[0] ?? null;

      return {
        studentId,
        childProfileId: first.childProfileId,
        studentName: first.studentName,
        parentGuardianName: first.parentGuardianName,
        courseCode: first.courseCode,
        classCode: first.classCode,
        outcomeCount: rows.length,
        completedOrVerifiedCount,
        scheduledOrMonitoringCount,
        heldOutcomeCount,
        needsSupportOutcomeCount,
        parentVisibleOutcomeCount: rows.filter((row) => row.parentVisible)
          .length,
        nextReviewAt,
        outcomeSummary: buildFollowUpActionOutcomeStudentSummary(
          first.studentName,
          rows,
        ),
      } satisfies DemoLearningFollowUpActionOutcomeStudentRow;
    })
    .sort((left, right) =>
      [left.studentName, left.studentId]
        .join('|')
        .localeCompare([right.studentName, right.studentId].join('|')),
    );

  const statusCounts = buildFollowUpActionOutcomeStatusCounts(outcomeRows);
  const studentsWithCompletedOrVerifiedOutcome = new Set(
    outcomeRows
      .filter((row) => ['COMPLETED', 'VERIFIED'].includes(row.outcomeStatus))
      .map((row) => row.studentId),
  ).size;
  const studentsWithOpenOutcome = new Set(
    outcomeRows
      .filter(
        (row) =>
          row.outcomeStatus !== 'COMPLETED' && row.outcomeStatus !== 'VERIFIED',
      )
      .map((row) => row.studentId),
  ).size;

  return {
    reportName: 'Learning local demo Follow-up Action Outcome Report',
    generatedFor: 'local-demo-followup-action-outcome-report',
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
      realParentSummaryMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realWeeklyDigestNotificationMutationUsed: false,
      realFollowUpActionOutcomeMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      outcomeCount: outcomeRows.length,
      completedOutcomeCount: statusCounts.outcomeStatus.COMPLETED,
      verifiedOutcomeCount: statusCounts.outcomeStatus.VERIFIED,
      scheduledOutcomeCount: statusCounts.outcomeStatus.SCHEDULED,
      monitoringOutcomeCount: statusCounts.outcomeStatus.MONITORING,
      heldOutcomeCount: statusCounts.outcomeStatus.HELD,
      parentVisibleOutcomeCount: outcomeRows.filter((row) => row.parentVisible)
        .length,
      teacherOnlyOutcomeCount: outcomeRows.filter((row) => !row.parentVisible)
        .length,
      positiveOutcomeCount: statusCounts.impactBand.POSITIVE,
      needsSupportOutcomeCount: statusCounts.impactBand.NEEDS_SUPPORT,
      noSendOutcomeCount: statusCounts.impactBand.NO_SEND,
      linkedDailyPlanCount: outcomeRows.filter((row) => row.dailyPlanId).length,
      linkedSupportRecommendationCount: outcomeRows.filter(
        (row) => row.supportRecommendationId,
      ).length,
      linkedAchievementCount: outcomeRows.filter(
        (row) => row.achievementRecordId,
      ).length,
      linkedParentSummaryCount: outcomeRows.filter((row) => row.parentSummaryId)
        .length,
      linkedTeacherReviewCount: outcomeRows.filter(
        (row) => row.teacherReviewItemId,
      ).length,
      studentsCovered: studentRows.length,
      studentsWithCompletedOrVerifiedOutcome,
      studentsWithOpenOutcome,
    },
    statusCounts,
    studentRows,
    outcomeRows,
  };
}

export function toFollowUpActionOutcomeMarkdown(
  report: DemoLearningFollowUpActionOutcomeReport,
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
    '- realParentSummaryMutationUsed=false',
    '- realParentMessageMutationUsed=false',
    '- realTeacherInterventionMutationUsed=false',
    '- realTeacherInterventionReviewMutationUsed=false',
    '- realRemedialAssignmentMutationUsed=false',
    '- realSupportPlanMutationUsed=false',
    '- realParentSupportSummaryMutationUsed=false',
    '- realTeacherNextActionMutationUsed=false',
    '- realRemedialRetryCompletionMutationUsed=false',
    '- realSupportOutcomeEvidenceMutationUsed=false',
    '- realParentFollowupSummaryMutationUsed=false',
    '- realTeacherFollowupSummaryMutationUsed=false',
    '- realRemedialRetryUnresolvedAttemptMutationUsed=false',
    '- realUnresolvedSupportOutcomeMutationUsed=false',
    '- realTeacherEscalationMutationUsed=false',
    '- realSupportAdjustmentMutationUsed=false',
    '- realParentEscalationSummaryMutationUsed=false',
    '- realTeacherEscalationNextActionMutationUsed=false',
    '- realWeeklyDigestNotificationMutationUsed=false',
    '- realFollowUpActionOutcomeMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Follow-up outcomes: ${report.totals.outcomeCount}`,
    `- Completed outcomes: ${report.totals.completedOutcomeCount}`,
    `- Verified outcomes: ${report.totals.verifiedOutcomeCount}`,
    `- Scheduled outcomes: ${report.totals.scheduledOutcomeCount}`,
    `- Monitoring outcomes: ${report.totals.monitoringOutcomeCount}`,
    `- Held outcomes: ${report.totals.heldOutcomeCount}`,
    `- Parent-visible outcomes: ${report.totals.parentVisibleOutcomeCount}`,
    `- Teacher-only outcomes: ${report.totals.teacherOnlyOutcomeCount}`,
    `- Positive outcomes: ${report.totals.positiveOutcomeCount}`,
    `- Needs-support outcomes: ${report.totals.needsSupportOutcomeCount}`,
    `- No-send outcomes: ${report.totals.noSendOutcomeCount}`,
    `- Linked daily plans: ${report.totals.linkedDailyPlanCount}`,
    `- Linked support recommendations: ${report.totals.linkedSupportRecommendationCount}`,
    `- Linked achievements: ${report.totals.linkedAchievementCount}`,
    `- Linked parent summaries: ${report.totals.linkedParentSummaryCount}`,
    `- Linked teacher reviews: ${report.totals.linkedTeacherReviewCount}`,
    `- Students covered: ${report.totals.studentsCovered}`,
    `- Students completed or verified: ${report.totals.studentsWithCompletedOrVerifiedOutcome}`,
    `- Students with open outcomes: ${report.totals.studentsWithOpenOutcome}`,
    '',
    '## Student Outcome Rows',
    '',
    '| Student | Course | Outcomes | Done/verified | Scheduled/monitoring | Held | Needs support | Parent visible | Next review | Summary |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |',
    ...report.studentRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          `${row.courseCode} / ${row.classCode}`,
          String(row.outcomeCount),
          String(row.completedOrVerifiedCount),
          String(row.scheduledOrMonitoringCount),
          String(row.heldOutcomeCount),
          String(row.needsSupportOutcomeCount),
          String(row.parentVisibleOutcomeCount),
          row.nextReviewAt ?? 'n/a',
          row.outcomeSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Outcome Rows',
    '',
    '| Outcome | Student | Action | Owner | Priority | Action status | Outcome | Impact | Visible | Daily plan | Support | Achievement | Parent summary | Teacher review | Evidence |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.outcomeRows.map(
      (row) =>
        `| ${[
          row.outcomeId,
          `${row.studentName} (${row.childProfileId})`,
          row.actionId,
          row.actionOwner,
          row.actionPriority,
          row.actionStatus,
          row.outcomeStatus,
          row.impactBand,
          row.parentVisible ? 'parent-visible' : 'teacher-only',
          row.dailyPlanId
            ? `${row.dailyPlanId} / ${row.dailyPlanStatus}`
            : 'n/a',
          row.supportRecommendationId
            ? `${row.supportRecommendationId} / ${row.supportStatus}`
            : 'n/a',
          row.achievementRecordId
            ? `${row.achievementRecordId} / ${row.achievementKind}`
            : 'n/a',
          row.parentSummaryId ?? 'n/a',
          row.teacherReviewItemId
            ? `${row.teacherReviewItemId} / ${row.teacherReviewStatus}`
            : 'n/a',
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildFollowUpActionOutcomeStatusCounts(
  rows: DemoLearningFollowUpActionOutcomeRow[],
): DemoLearningFollowUpActionOutcomeStatusCounts {
  return {
    outcomeStatus: countByStatus(
      followUpActionOutcomeStatuses,
      rows,
      (row) => row.outcomeStatus,
    ),
    impactBand: countByStatus(
      followUpActionOutcomeImpacts,
      rows,
      (row) => row.impactBand,
    ),
    actionOwner: countByStatus(
      weeklyDigestActionOwners,
      rows,
      (row) => row.actionOwner,
    ),
    actionPriority: countByStatus(
      weeklyDigestActionPriorities,
      rows,
      (row) => row.actionPriority,
    ),
  };
}

export function buildFollowUpActionOutcomeStudentSummary(
  studentName: string,
  rows: DemoLearningFollowUpActionOutcomeRow[],
) {
  const held = rows.filter((row) => row.outcomeStatus === 'HELD').length;
  const done = rows.filter((row) =>
    ['COMPLETED', 'VERIFIED'].includes(row.outcomeStatus),
  ).length;
  const needsSupport = rows.filter(
    (row) => row.impactBand === 'NEEDS_SUPPORT',
  ).length;

  if (held > 0) {
    return `${studentName} has a held teacher-only outcome with no parent send from fixture evidence.`;
  }

  if (needsSupport > 0) {
    return `${studentName} has ${needsSupport} needs-support outcome and remains in teacher follow-up review.`;
  }

  return `${studentName} has ${done} completed or verified follow-up outcome.`;
}
