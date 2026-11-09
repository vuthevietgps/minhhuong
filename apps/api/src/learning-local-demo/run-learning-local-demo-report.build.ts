import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseLearningStagingRehearsalEvidence } from './release-candidate-go-live-gate-matrix';
import { LearningLocalDemoService } from './learning-local-demo.service';

/** Builds every local-demo report with its fixed generatedAt timestamp. */
export function buildLearningLocalDemoReports() {
  const outputDir = resolve(
    process.env.LEARNING_LOCAL_DEMO_REPORT_DIR ??
      process.env.ERP_LOCAL_DEMO_REPORT_DIR ??
      '../../exports',
  );
  const service = new LearningLocalDemoService();
  const stagingRehearsalEvidencePath = join(
    outputDir,
    'minhhuong-staging-rc-v3-local-rehearsal.json',
  );
  const stagingRehearsalEvidence = existsSync(stagingRehearsalEvidencePath)
    ? parseLearningStagingRehearsalEvidence(
        readFileSync(stagingRehearsalEvidencePath, 'utf8'),
      )
    : undefined;
  const studentCourseReport =
    service.buildStudentCourseEnrollmentSubscriptionReport(
      undefined,
      '2026-06-29T00:00:00.000Z',
    );
  const studentCourseFlowReport =
    service.buildStudentCourseEnrollmentSubscriptionFlowReport(
      undefined,
      '2026-06-30T12:00:00.000Z',
    );
  const subscriptionEntitlementDailyPlanAccessReport =
    service.buildSubscriptionEntitlementDailyPlanAccessReport(
      undefined,
      '2026-06-30T12:30:00.000Z',
    );
  const parentTeacherProgressAccessSummaryReport =
    service.buildParentTeacherProgressAccessSummaryReport(
      undefined,
      '2026-06-30T13:00:00.000Z',
    );
  const parentTeacherReportPermissionPrivacyRedactionReport =
    service.buildParentTeacherReportPermissionPrivacyRedactionReport(
      undefined,
      '2026-06-30T13:30:00.000Z',
    );
  const parentTeacherReportReviewQueueMessagePreviewReport =
    service.buildParentTeacherReportReviewQueueMessagePreviewReport(
      undefined,
      '2026-06-30T13:45:00.000Z',
    );
  const parentPortalApprovedReportInboxReadReceiptReport =
    service.buildParentPortalApprovedReportInboxReadReceiptReport(
      undefined,
      '2026-06-30T14:00:00.000Z',
    );
  const authSessionSmokeMatrixReport =
    service.buildAuthSessionSmokeMatrixReport('2026-07-01T01:30:00.000Z');
  const authRefreshLifecycleMatrixReport =
    service.buildAuthRefreshLifecycleMatrixReport('2026-07-01T02:15:00.000Z');
  const authPersistenceSecurityGateMatrixReport =
    service.buildAuthPersistenceSecurityGateMatrixReport(
      '2026-07-01T03:00:00.000Z',
    );
  const authSessionRepositoryContractMatrixReport =
    service.buildAuthSessionRepositoryContractMatrixReport(
      '2026-07-01T03:30:00.000Z',
    );
  const productionRuntimeGateMatrixReport =
    service.buildProductionRuntimeGateMatrixReport('2026-07-10T03:00:00.000Z');
  const uploadStorageHardeningMatrixReport =
    service.buildUploadStorageHardeningMatrixReport('2026-07-11T01:00:00.000Z');
  const releaseCandidateGoLiveGateReport =
    service.buildReleaseCandidateGoLiveGateReport(
      '2026-07-10T10:00:00.000Z',
      stagingRehearsalEvidence,
    );
  const prismaAuthSessionStoreMatrixReport =
    service.buildPrismaAuthSessionStoreMatrixReport('2026-07-10T04:00:00.000Z');
  const authOperationalControlMatrixReport =
    service.buildAuthOperationalControlMatrixReport('2026-07-10T05:00:00.000Z');
  const authOperationalAlertPolicyMatrixReport =
    service.buildAuthOperationalAlertPolicyMatrixReport(
      '2026-07-10T06:00:00.000Z',
    );
  const classSessionReport = service.buildClassSessionAttendanceProgressReport(
    undefined,
    '2026-06-30T00:00:00.000Z',
  );
  const lessonAssignmentReport =
    service.buildLessonAssignmentAssessmentProgressReport(
      undefined,
      '2026-06-30T01:00:00.000Z',
    );
  const learningPathReport =
    service.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
      undefined,
      '2026-06-30T02:00:00.000Z',
    );
  const parentTeacherAlertReport =
    service.buildParentTeacherProgressAlertInterventionReport(
      undefined,
      '2026-06-30T03:00:00.000Z',
    );
  const parentScreenTimeReport =
    service.buildParentScreenTimeGuardianControlsReport(
      undefined,
      '2026-06-30T04:00:00.000Z',
    );
  const parentScreenTimeGrantDailyPlanGuardReport =
    service.buildParentScreenTimeGrantDailyPlanGuardReport(
      undefined,
      '2026-06-30T04:15:00.000Z',
    );
  const learningSessionCompletionPracticeProgressRollupReport =
    service.buildLearningSessionCompletionPracticeProgressRollupReport(
      undefined,
      '2026-06-30T04:30:00.000Z',
    );
  const teacherInterventionRemedialAssignmentSupportPlanReport =
    service.buildTeacherInterventionRemedialAssignmentSupportPlanReport(
      undefined,
      '2026-06-30T04:45:00.000Z',
    );
  const remedialRetryCompletionSupportOutcomeFollowupReport =
    service.buildRemedialRetryCompletionSupportOutcomeFollowupReport(
      undefined,
      '2026-06-30T04:50:00.000Z',
    );
  const remedialRetryUnresolvedSupportEscalationReport =
    service.buildRemedialRetryUnresolvedSupportEscalationReport(
      undefined,
      '2026-06-30T04:55:00.000Z',
    );
  const teacherEscalationFollowupResolutionReport =
    service.buildTeacherEscalationFollowupResolutionReport(
      undefined,
      '2026-06-30T04:58:00.000Z',
    );
  const mvpEndToEndReadinessTraceReport =
    service.buildMvpEndToEndReadinessTraceReport(
      undefined,
      '2026-06-30T04:59:00.000Z',
    );
  const mvpRoleJourneyEntrypointsReport =
    service.buildMvpRoleJourneyEntrypointsReport(
      undefined,
      '2026-06-30T04:59:30.000Z',
    );
  const teacherContentPublishReport =
    service.buildTeacherContentLibraryLearningPathPublishReport(
      undefined,
      '2026-06-30T05:00:00.000Z',
    );
  const aiTutorChatSafetyTeacherReviewReport =
    service.buildAiTutorChatSafetyTeacherReviewReport(
      undefined,
      '2026-06-30T06:00:00.000Z',
    );
  const studentAchievementBadgeCertificateReport =
    service.buildStudentAchievementBadgeCertificateReport(
      undefined,
      '2026-06-30T07:00:00.000Z',
    );
  const parentTeacherWeeklyDigestReport =
    service.buildParentTeacherWeeklyDigestReport(
      undefined,
      '2026-06-30T08:00:00.000Z',
    );
  const followUpActionOutcomeReport = service.buildFollowUpActionOutcomeReport(
    undefined,
    '2026-06-30T09:00:00.000Z',
  );
  const mvpReadinessOverviewReport = service.buildMvpReadinessOverviewReport(
    undefined,
    '2026-06-30T10:00:00.000Z',
  );
  const acceptanceTraceabilityGateReport =
    service.buildAcceptanceTraceabilityGateReport(
      undefined,
      '2026-06-30T11:00:00.000Z',
    );

  return {
    outputDir,
    service,
    stagingRehearsalEvidencePath,
    stagingRehearsalEvidence,
    studentCourseReport,
    studentCourseFlowReport,
    subscriptionEntitlementDailyPlanAccessReport,
    parentTeacherProgressAccessSummaryReport,
    parentTeacherReportPermissionPrivacyRedactionReport,
    parentTeacherReportReviewQueueMessagePreviewReport,
    parentPortalApprovedReportInboxReadReceiptReport,
    authSessionSmokeMatrixReport,
    authRefreshLifecycleMatrixReport,
    authPersistenceSecurityGateMatrixReport,
    authSessionRepositoryContractMatrixReport,
    productionRuntimeGateMatrixReport,
    uploadStorageHardeningMatrixReport,
    releaseCandidateGoLiveGateReport,
    prismaAuthSessionStoreMatrixReport,
    authOperationalControlMatrixReport,
    authOperationalAlertPolicyMatrixReport,
    classSessionReport,
    lessonAssignmentReport,
    learningPathReport,
    parentTeacherAlertReport,
    parentScreenTimeReport,
    parentScreenTimeGrantDailyPlanGuardReport,
    learningSessionCompletionPracticeProgressRollupReport,
    teacherInterventionRemedialAssignmentSupportPlanReport,
    remedialRetryCompletionSupportOutcomeFollowupReport,
    remedialRetryUnresolvedSupportEscalationReport,
    teacherEscalationFollowupResolutionReport,
    mvpEndToEndReadinessTraceReport,
    mvpRoleJourneyEntrypointsReport,
    teacherContentPublishReport,
    aiTutorChatSafetyTeacherReviewReport,
    studentAchievementBadgeCertificateReport,
    parentTeacherWeeklyDigestReport,
    followUpActionOutcomeReport,
    mvpReadinessOverviewReport,
    acceptanceTraceabilityGateReport,
  };
}
