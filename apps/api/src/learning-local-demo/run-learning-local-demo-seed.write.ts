import { mkdirSync, writeFileSync } from 'node:fs';
import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import type { buildLearningLocalDemoSeedReports } from './run-learning-local-demo-seed.build';

/** Writes the demo seed JSON. */
export function writeLearningLocalDemoSeed(
  ctx: ReturnType<typeof buildLearningLocalDemoSeedReports>,
) {
  const {
    acceptanceTraceabilityGateReport,
    aiTutorChatSafetyTeacherReviewReport,
    authOperationalAlertPolicyMatrixReport,
    authOperationalControlMatrixReport,
    authPersistenceSecurityGateMatrixReport,
    authRefreshLifecycleMatrixReport,
    authSessionRepositoryContractMatrixReport,
    authSessionSmokeMatrixReport,
    followUpActionOutcomeReport,
    learningSessionCompletionPracticeProgressRollupReport,
    mvpEndToEndReadinessTraceReport,
    mvpReadinessOverviewReport,
    outputDir,
    parentPortalApprovedReportInboxReadReceiptReport,
    parentScreenTimeGrantDailyPlanGuardReport,
    parentScreenTimeReport,
    parentTeacherAlertReport,
    parentTeacherReportPermissionPrivacyRedactionReport,
    parentTeacherReportReviewQueueMessagePreviewReport,
    parentTeacherWeeklyDigestReport,
    prismaAuthSessionStoreMatrixReport,
    productionRuntimeGateMatrixReport,
    releaseCandidateGoLiveGateReport,
    remedialRetryCompletionSupportOutcomeFollowupReport,
    remedialRetryUnresolvedSupportEscalationReport,
    seedPath,
    studentAchievementBadgeCertificateReport,
    studentCourseEnrollmentSubscriptionFlowReport,
    subscriptionEntitlementDailyPlanAccessReport,
    teacherContentPublishReport,
    teacherEscalationFollowupResolutionReport,
    teacherInterventionRemedialAssignmentSupportPlanReport,
    uploadStorageHardeningMatrixReport,
  } = ctx;
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    seedPath,
    `${JSON.stringify(
      {
        fixtureKind: 'learning-local-demo-only',
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
        realPaymentMutationUsed: false,
        realRefundMutationUsed: false,
        realCommissionMutationUsed: false,
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
        realParentMessageMutationUsed: false,
        realTeacherInterventionMutationUsed: false,
        realContentLibraryMutationUsed: false,
        realContentPublishMutationUsed: false,
        realContentUploadMutationUsed: false,
        realStorageCdnMutationUsed: false,
        realTeacherAdminAccountMutationUsed: false,
        realStudentClassVisibilityMutationUsed: false,
        realParentSummaryMutationUsed: false,
        realAiChatMutationUsed: false,
        realAiModerationMutationUsed: false,
        realLearningSupportMutationUsed: false,
        realAchievementMutationUsed: false,
        realBadgeMutationUsed: false,
        realCertificateMutationUsed: false,
        realCredentialIssuanceUsed: false,
        realRecognitionNotificationMutationUsed: false,
        realWeeklyDigestNotificationMutationUsed: false,
        realFollowUpActionOutcomeMutationUsed: false,
        realRemedialRetryCompletionMutationUsed: false,
        realSupportOutcomeEvidenceMutationUsed: false,
        realParentFollowupSummaryMutationUsed: false,
        realTeacherFollowupSummaryMutationUsed: false,
        realRemedialRetryUnresolvedAttemptMutationUsed: false,
        realUnresolvedSupportOutcomeMutationUsed: false,
        realTeacherEscalationMutationUsed: false,
        realSupportAdjustmentMutationUsed: false,
        realParentEscalationSummaryMutationUsed: false,
        realTeacherEscalationNextActionMutationUsed: false,
        realTeacherReviewedEscalationMutationUsed: false,
        realAdjustedSupportRetryCompletionMutationUsed: false,
        realResolvedSupportOutcomeMutationUsed: false,
        realParentClosureSummaryMutationUsed: false,
        realTeacherClosureNoteMutationUsed: false,
        certificateIssuerProviderUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
        fixture: learningLocalDemoCoreFixture,
        parentTeacherProgressAlertInterventionEvidence:
          parentTeacherAlertReport,
        parentScreenTimeGuardianControlsEvidence: parentScreenTimeReport,
        parentScreenTimeGrantDailyPlanGuardEvidence:
          parentScreenTimeGrantDailyPlanGuardReport,
        learningSessionCompletionPracticeProgressRollupEvidence:
          learningSessionCompletionPracticeProgressRollupReport,
        teacherInterventionRemedialAssignmentSupportPlanEvidence:
          teacherInterventionRemedialAssignmentSupportPlanReport,
        teacherContentLibraryLearningPathPublishEvidence:
          teacherContentPublishReport,
        aiTutorChatSafetyTeacherReviewEvidence:
          aiTutorChatSafetyTeacherReviewReport,
        studentAchievementBadgeCertificateEvidence:
          studentAchievementBadgeCertificateReport,
        parentTeacherWeeklyDigestEvidence: parentTeacherWeeklyDigestReport,
        followUpActionOutcomeEvidence: followUpActionOutcomeReport,
        remedialRetryCompletionSupportOutcomeFollowupEvidence:
          remedialRetryCompletionSupportOutcomeFollowupReport,
        remedialRetryUnresolvedSupportEscalationEvidence:
          remedialRetryUnresolvedSupportEscalationReport,
        teacherEscalationFollowupResolutionEvidence:
          teacherEscalationFollowupResolutionReport,
        mvpEndToEndReadinessTraceEvidence: mvpEndToEndReadinessTraceReport,
        mvpReadinessOverviewEvidence: mvpReadinessOverviewReport,
        acceptanceTraceabilityGateEvidence: acceptanceTraceabilityGateReport,
        studentCourseEnrollmentSubscriptionFlowEvidence:
          studentCourseEnrollmentSubscriptionFlowReport,
        subscriptionEntitlementDailyPlanAccessEvidence:
          subscriptionEntitlementDailyPlanAccessReport,
        parentTeacherReportPermissionPrivacyRedactionEvidence:
          parentTeacherReportPermissionPrivacyRedactionReport,
        parentTeacherReportReviewQueueMessagePreviewEvidence:
          parentTeacherReportReviewQueueMessagePreviewReport,
        parentPortalApprovedReportInboxReadReceiptEvidence:
          parentPortalApprovedReportInboxReadReceiptReport,
        authSessionSmokeMatrixEvidence: authSessionSmokeMatrixReport,
        authRefreshLifecycleMatrixEvidence: authRefreshLifecycleMatrixReport,
        authPersistenceSecurityGateMatrixEvidence:
          authPersistenceSecurityGateMatrixReport,
        authSessionRepositoryContractMatrixEvidence:
          authSessionRepositoryContractMatrixReport,
        productionRuntimeGateMatrixEvidence: productionRuntimeGateMatrixReport,
        uploadStorageHardeningMatrixEvidence:
          uploadStorageHardeningMatrixReport,
        releaseCandidateGoLiveGateEvidence: releaseCandidateGoLiveGateReport,
        prismaAuthSessionStoreMatrixEvidence:
          prismaAuthSessionStoreMatrixReport,
        authOperationalControlMatrixEvidence:
          authOperationalControlMatrixReport,
        authOperationalAlertPolicyMatrixEvidence:
          authOperationalAlertPolicyMatrixReport,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}
