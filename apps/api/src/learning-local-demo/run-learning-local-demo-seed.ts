import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';
import { parseLearningStagingRehearsalEvidence } from './release-candidate-go-live-gate-matrix';

const outputDir = resolve(
  process.env.LEARNING_LOCAL_DEMO_REPORT_DIR ??
    process.env.ERP_LOCAL_DEMO_REPORT_DIR ??
    '../../exports',
);
const seedPath = join(outputDir, 'learning-local-demo-seed.json');
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
const parentTeacherAlertReport =
  service.buildParentTeacherProgressAlertInterventionReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T03:00:00.000Z',
  );
const parentScreenTimeReport =
  service.buildParentScreenTimeGuardianControlsReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T04:00:00.000Z',
  );
const parentScreenTimeGrantDailyPlanGuardReport =
  service.buildParentScreenTimeGrantDailyPlanGuardReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T04:15:00.000Z',
  );
const learningSessionCompletionPracticeProgressRollupReport =
  service.buildLearningSessionCompletionPracticeProgressRollupReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T04:30:00.000Z',
  );
const teacherInterventionRemedialAssignmentSupportPlanReport =
  service.buildTeacherInterventionRemedialAssignmentSupportPlanReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T04:45:00.000Z',
  );
const remedialRetryCompletionSupportOutcomeFollowupReport =
  service.buildRemedialRetryCompletionSupportOutcomeFollowupReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T04:50:00.000Z',
  );
const remedialRetryUnresolvedSupportEscalationReport =
  service.buildRemedialRetryUnresolvedSupportEscalationReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T04:55:00.000Z',
  );
const teacherEscalationFollowupResolutionReport =
  service.buildTeacherEscalationFollowupResolutionReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T04:58:00.000Z',
  );
const mvpEndToEndReadinessTraceReport =
  service.buildMvpEndToEndReadinessTraceReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T04:59:00.000Z',
  );
const teacherContentPublishReport =
  service.buildTeacherContentLibraryLearningPathPublishReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T05:00:00.000Z',
  );
const aiTutorChatSafetyTeacherReviewReport =
  service.buildAiTutorChatSafetyTeacherReviewReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T06:00:00.000Z',
  );
const studentAchievementBadgeCertificateReport =
  service.buildStudentAchievementBadgeCertificateReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T07:00:00.000Z',
  );
const parentTeacherWeeklyDigestReport =
  service.buildParentTeacherWeeklyDigestReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T08:00:00.000Z',
  );
const followUpActionOutcomeReport = service.buildFollowUpActionOutcomeReport(
  learningLocalDemoCoreFixture,
  '2026-06-30T09:00:00.000Z',
);
const mvpReadinessOverviewReport = service.buildMvpReadinessOverviewReport(
  learningLocalDemoCoreFixture,
  '2026-06-30T10:00:00.000Z',
);
const acceptanceTraceabilityGateReport =
  service.buildAcceptanceTraceabilityGateReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T11:00:00.000Z',
  );
const studentCourseEnrollmentSubscriptionFlowReport =
  service.buildStudentCourseEnrollmentSubscriptionFlowReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T12:00:00.000Z',
  );
const subscriptionEntitlementDailyPlanAccessReport =
  service.buildSubscriptionEntitlementDailyPlanAccessReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T12:30:00.000Z',
  );
const parentTeacherReportPermissionPrivacyRedactionReport =
  service.buildParentTeacherReportPermissionPrivacyRedactionReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T13:30:00.000Z',
  );
const parentTeacherReportReviewQueueMessagePreviewReport =
  service.buildParentTeacherReportReviewQueueMessagePreviewReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T13:45:00.000Z',
  );
const parentPortalApprovedReportInboxReadReceiptReport =
  service.buildParentPortalApprovedReportInboxReadReceiptReport(
    learningLocalDemoCoreFixture,
    '2026-06-30T14:00:00.000Z',
  );
const authSessionSmokeMatrixReport = service.buildAuthSessionSmokeMatrixReport(
  '2026-07-01T01:30:00.000Z',
);
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
      parentTeacherProgressAlertInterventionEvidence: parentTeacherAlertReport,
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
      uploadStorageHardeningMatrixEvidence: uploadStorageHardeningMatrixReport,
      releaseCandidateGoLiveGateEvidence: releaseCandidateGoLiveGateReport,
      prismaAuthSessionStoreMatrixEvidence: prismaAuthSessionStoreMatrixReport,
      authOperationalControlMatrixEvidence: authOperationalControlMatrixReport,
      authOperationalAlertPolicyMatrixEvidence:
        authOperationalAlertPolicyMatrixReport,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log('LEARNING_LOCAL_DEMO_SEED PASS');
console.log(`learningFixture=${seedPath}`);
console.log(`learningStudents=${learningLocalDemoCoreFixture.students.length}`);
console.log(`learningCourses=${learningLocalDemoCoreFixture.courses.length}`);
console.log(
  `learningEnrollments=${learningLocalDemoCoreFixture.enrollments.length}`,
);
console.log(
  `learningSubscriptions=${learningLocalDemoCoreFixture.subscriptions.length}`,
);
console.log(`learningPayments=${learningLocalDemoCoreFixture.payments.length}`);
console.log(`learningRefunds=${learningLocalDemoCoreFixture.refunds.length}`);
console.log(
  `learningCommissions=${learningLocalDemoCoreFixture.commissions.length}`,
);
console.log(
  `learningStudentCourseFlowRelationshipTraces=${studentCourseEnrollmentSubscriptionFlowReport.totals.relationshipTraceCount}`,
);
console.log(
  `learningStudentCourseFlowOpenSafetyGates=${studentCourseEnrollmentSubscriptionFlowReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningSubscriptionEntitlementAccessEntitlements=${subscriptionEntitlementDailyPlanAccessReport.totals.entitlementCount}`,
);
console.log(
  `learningSubscriptionEntitlementAccessCases=${subscriptionEntitlementDailyPlanAccessReport.totals.dailyPlanAccessCaseCount}`,
);
console.log(
  `learningSubscriptionEntitlementAccessUnlocked=${subscriptionEntitlementDailyPlanAccessReport.totals.unlockedAccessCount}`,
);
console.log(
  `learningSubscriptionEntitlementAccessBlocked=${subscriptionEntitlementDailyPlanAccessReport.totals.blockedAccessCount}`,
);
console.log(
  `learningSubscriptionEntitlementLifecycleRows=${subscriptionEntitlementDailyPlanAccessReport.totals.lifecycleRowCount}`,
);
console.log(
  `learningSubscriptionEntitlementLifecycleExpired=${subscriptionEntitlementDailyPlanAccessReport.totals.lifecycleExpiredRowCount}`,
);
console.log(
  `learningSubscriptionEntitlementLifecycleRevoked=${subscriptionEntitlementDailyPlanAccessReport.totals.lifecycleRevokedRowCount}`,
);
console.log(
  `learningSubscriptionEntitlementAccessBlockedReasons=${subscriptionEntitlementDailyPlanAccessReport.totals.blockedAccessWithReasonCount}`,
);
console.log(
  `learningSubscriptionEntitlementAccessOpenSafetyGates=${subscriptionEntitlementDailyPlanAccessReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningParentTeacherReportPermissionCases=${parentTeacherReportPermissionPrivacyRedactionReport.totals.reportPermissionCaseCount}`,
);
console.log(
  `learningParentTeacherReportPermissionAllowed=${parentTeacherReportPermissionPrivacyRedactionReport.totals.allowedReportCaseCount}`,
);
console.log(
  `learningParentTeacherReportPermissionDenied=${parentTeacherReportPermissionPrivacyRedactionReport.totals.deniedReportCaseCount}`,
);
console.log(
  `learningParentTeacherReportTeacherUnassignedDenied=${parentTeacherReportPermissionPrivacyRedactionReport.totals.teacherUnassignedDeniedCaseCount}`,
);
console.log(
  `learningParentTeacherReportSupportOpsAuditReadOnly=${parentTeacherReportPermissionPrivacyRedactionReport.totals.supportOpsAuditReadOnlyCaseCount}`,
);
console.log(
  `learningParentTeacherReportRedactedFields=${parentTeacherReportPermissionPrivacyRedactionReport.totals.redactedFieldCount}`,
);
console.log(
  `learningParentTeacherReportOpenSafetyGates=${parentTeacherReportPermissionPrivacyRedactionReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningParentTeacherReviewQueueItems=${parentTeacherReportReviewQueueMessagePreviewReport.totals.reviewQueueItemCount}`,
);
console.log(
  `learningParentTeacherMessagePreviews=${parentTeacherReportReviewQueueMessagePreviewReport.totals.messagePreviewCount}`,
);
console.log(
  `learningParentTeacherApprovedPreviews=${parentTeacherReportReviewQueueMessagePreviewReport.totals.approvedPreviewCount}`,
);
console.log(
  `learningParentTeacherHeldPreviews=${parentTeacherReportReviewQueueMessagePreviewReport.totals.heldPreviewCount}`,
);
console.log(
  `learningParentTeacherPreviewOpenSafetyGates=${parentTeacherReportReviewQueueMessagePreviewReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningParentPortalInboxItems=${parentPortalApprovedReportInboxReadReceiptReport.totals.parentInboxItemCount}`,
);
console.log(
  `learningParentPortalVisibleInboxItems=${parentPortalApprovedReportInboxReadReceiptReport.totals.visibleParentInboxItemCount}`,
);
console.log(
  `learningParentPortalHiddenHeldPreviews=${parentPortalApprovedReportInboxReadReceiptReport.totals.hiddenHeldPreviewCount}`,
);
console.log(
  `learningParentPortalReadAckEvidence=${parentPortalApprovedReportInboxReadReceiptReport.totals.readAckEvidenceCount}`,
);
console.log(
  `learningParentPortalAlignedApprovedInboxEntries=${parentPortalApprovedReportInboxReadReceiptReport.totals.alignedApprovedParentInboxEntryCount}`,
);
console.log(
  `learningParentPortalAlignedReadReceipts=${parentPortalApprovedReportInboxReadReceiptReport.totals.alignedParentReadReceiptCount}`,
);
console.log(
  `learningParentPortalStableAlignedReadReceiptTraces=${parentPortalApprovedReportInboxReadReceiptReport.totals.stableAlignedReadReceiptTraceCount}`,
);
console.log(
  `learningParentPortalInboxOpenSafetyGates=${parentPortalApprovedReportInboxReadReceiptReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningAuthSessionSmokeCases=${authSessionSmokeMatrixReport.totals.smokeCaseCount}`,
);
console.log(
  `learningAuthSessionSmokeRoleCoverage=${authSessionSmokeMatrixReport.totals.roleCoverageCount}`,
);
console.log(
  `learningAuthSessionSmokeScenarioCoverage=${authSessionSmokeMatrixReport.totals.scenarioCoverageCount}`,
);
console.log(
  `learningAuthSessionSmokeDeniedCases=${authSessionSmokeMatrixReport.totals.deniedCaseCount}`,
);
console.log(
  `learningAuthSessionSmokeOpenSafetyGates=${authSessionSmokeMatrixReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningAuthRefreshLifecycleCases=${authRefreshLifecycleMatrixReport.totals.lifecycleCaseCount}`,
);
console.log(
  `learningAuthRefreshPersistentSessionLookup=${authRefreshLifecycleMatrixReport.totals.persistentSessionLookupCount}`,
);
console.log(
  `learningAuthRefreshRotationDenied=${authRefreshLifecycleMatrixReport.totals.refreshTokenRotationDeniedCount}`,
);
console.log(
  `learningAuthRefreshReuseDenied=${authRefreshLifecycleMatrixReport.totals.reusedRefreshTokenDeniedCount}`,
);
console.log(
  `learningAuthRefreshCrossDeviceRevocations=${authRefreshLifecycleMatrixReport.totals.crossDeviceRevocationCount}`,
);
console.log(
  `learningAuthRefreshCleanupExpiry=${authRefreshLifecycleMatrixReport.totals.sessionCleanupExpiryCount}`,
);
console.log(
  `learningAuthRefreshAuditVisibility=${authRefreshLifecycleMatrixReport.totals.adminSupportAuditVisibilityCount}`,
);
console.log(
  `learningAuthRefreshOpenSafetyGates=${authRefreshLifecycleMatrixReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningAuthPersistenceSecurityGates=${authPersistenceSecurityGateMatrixReport.totals.securityDesignGateCount}`,
);
console.log(
  `learningAuthPersistenceSchemaContracts=${authPersistenceSecurityGateMatrixReport.totals.schemaRepositoryContractCount}`,
);
console.log(
  `learningAuthPersistenceDistributedRevocation=${authPersistenceSecurityGateMatrixReport.totals.distributedRevocationContractCount}`,
);
console.log(
  `learningAuthPersistenceRefreshRetentionReuse=${authPersistenceSecurityGateMatrixReport.totals.refreshRetentionReusePolicyCount}`,
);
console.log(
  `learningAuthPersistenceAuditRetentionExport=${authPersistenceSecurityGateMatrixReport.totals.auditRetentionExportPolicyCount}`,
);
console.log(
  `learningAuthPersistenceRateLimitMonitoring=${authPersistenceSecurityGateMatrixReport.totals.rateLimitMonitoringHookCount}`,
);
console.log(
  `learningAuthPersistenceRollbackMigration=${authPersistenceSecurityGateMatrixReport.totals.rollbackMigrationNoteCount}`,
);
console.log(
  `learningAuthPersistenceProductionBlockers=${authPersistenceSecurityGateMatrixReport.totals.productionBlockerCount}`,
);
console.log(
  `learningAuthPersistenceOpenSafetyGates=${authPersistenceSecurityGateMatrixReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningAuthSessionRepositorySchemaFields=${authSessionRepositoryContractMatrixReport.totals.schemaFieldCount}`,
);
console.log(
  `learningAuthSessionRepositoryTransitions=${authSessionRepositoryContractMatrixReport.totals.transitionConstraintCount}`,
);
console.log(
  `learningAuthSessionRepositoryMigrationDryRunNotes=${authSessionRepositoryContractMatrixReport.totals.migrationDryRunNoteCount}`,
);
console.log(
  `learningAuthSessionRepositoryRollbackNotes=${authSessionRepositoryContractMatrixReport.totals.rollbackNoteCount}`,
);
console.log(
  `learningAuthSessionRepositoryOpenSafetyGates=${authSessionRepositoryContractMatrixReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningProductionRuntimeGates=${productionRuntimeGateMatrixReport.totals.gateCount}`,
);
console.log(
  `learningProductionRuntimeClosedByCode=${productionRuntimeGateMatrixReport.totals.closedByCodeCount}`,
);
console.log(
  `learningProductionRuntimeBlockers=${productionRuntimeGateMatrixReport.totals.productionBlockerCount}`,
);
console.log(
  `learningProductionRuntimeDecision=${productionRuntimeGateMatrixReport.decision}`,
);
console.log(
  `learningProductionRuntimeOpenSafetyGates=${productionRuntimeGateMatrixReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningUploadStorageSurfaces=${uploadStorageHardeningMatrixReport.totals.uploadSurfaceCount}`,
);
console.log(
  `learningUploadStorageDeniedNegativeCases=${uploadStorageHardeningMatrixReport.totals.deniedNegativeCaseCount}`,
);
console.log(
  `learningUploadStorageUnsafeAcceptedCases=${uploadStorageHardeningMatrixReport.totals.unsafeAcceptedNegativeCaseCount}`,
);
console.log(
  `learningReleaseCandidateRolesComplete=${releaseCandidateGoLiveGateReport.totals.completeRoleCoverageCount}`,
);
console.log(
  `learningReleaseCandidateRoleJourneys=${releaseCandidateGoLiveGateReport.totals.roleJourneyCount}`,
);
console.log(
  `learningReleaseCandidateScenarioFixtures=${releaseCandidateGoLiveGateReport.totals.roleScenarioFixtureCount}`,
);
console.log(
  `learningReleaseCandidateEvidenceIntegrity=${releaseCandidateGoLiveGateReport.evidenceIntegrity.status}`,
);
console.log(
  `learningReleaseCandidateLocalSmokePass=${releaseCandidateGoLiveGateReport.totals.localSmokePassCount}`,
);
console.log(
  `learningReleaseCandidateProductionBlockers=${releaseCandidateGoLiveGateReport.totals.productionBlockerCount}`,
);
console.log(
  `learningReleaseCandidateDecision=${releaseCandidateGoLiveGateReport.goLiveDecision}`,
);
console.log(
  `learningReleaseCandidatePendingApprovals=${releaseCandidateGoLiveGateReport.totals.pendingApprovalCount}`,
);
console.log(
  `learningReleaseCandidateApprovalGateDecision=${releaseCandidateGoLiveGateReport.approvalGateDecision}`,
);
console.log(
  `learningReleaseCandidateAutoLoopDecision=${releaseCandidateGoLiveGateReport.autoLoopDecision}`,
);
console.log(
  `learningReleaseCandidateStagingExecutionAuthorized=${releaseCandidateGoLiveGateReport.stagingExecutionAuthorized}`,
);
console.log(
  `learningPrismaAuthSessionStoreEvidence=${prismaAuthSessionStoreMatrixReport.totals.evidenceCount}`,
);
console.log(
  `learningPrismaAuthSessionStoreDisposableVerified=${prismaAuthSessionStoreMatrixReport.totals.disposableLocalVerifiedCount}`,
);
console.log(
  `learningPrismaAuthSessionStoreProductionBlockers=${prismaAuthSessionStoreMatrixReport.totals.productionBlockerCount}`,
);
console.log(
  `learningPrismaAuthSessionStoreOpenSafetyGates=${prismaAuthSessionStoreMatrixReport.totals.openLocalSafetyGateCount}`,
);
console.log(
  `learningAuthOperationalControlEvidence=${authOperationalControlMatrixReport.totals.evidenceCount}`,
);
console.log(
  `learningAuthOperationalControlLocalVerified=${authOperationalControlMatrixReport.totals.verifiedLocalCount}`,
);
console.log(
  `learningAuthOperationalControlProductionBlockers=${authOperationalControlMatrixReport.totals.productionBlockerCount}`,
);
console.log(
  `learningAuthOperationalControlOpenSafetyGates=${authOperationalControlMatrixReport.totals.openLocalSafetyGateCount}`,
);
console.log(
  `learningAuthOperationalAlertPolicyOpenCandidates=${authOperationalAlertPolicyMatrixReport.totals.initialOpenCandidateCount}`,
);
console.log(
  `learningAuthOperationalAlertPolicyCooldownSuppressed=${authOperationalAlertPolicyMatrixReport.totals.cooldownSuppressedCandidateCount}`,
);
console.log(
  `learningAuthOperationalAlertPolicyDeniedRoles=${authOperationalAlertPolicyMatrixReport.totals.deniedBeforeSnapshotRoleCount}`,
);
console.log(
  `learningAuthOperationalAlertAuditOutageDenied=${authOperationalAlertPolicyMatrixReport.totals.auditOutageDeniedCount}`,
);
console.log(
  `learningAuthOperationalAlertAppendOnlyAudits=${authOperationalAlertPolicyMatrixReport.totals.appendOnlyAuditDisposableSmokeCount}`,
);
console.log(
  `learningAuthOperationalAlertContentionCapacity=${authOperationalAlertPolicyMatrixReport.totals.contentionCapacityDisposableSmokeCount}`,
);
console.log(
  `learningAuthOperationalAlertPolicyProductionBlockers=${authOperationalAlertPolicyMatrixReport.totals.productionBlockerCount}`,
);
console.log(`learningClasses=${learningLocalDemoCoreFixture.classes.length}`);
console.log(`learningSessions=${learningLocalDemoCoreFixture.sessions.length}`);
console.log(`learningLessons=${learningLocalDemoCoreFixture.lessons.length}`);
console.log(
  `learningAssignments=${learningLocalDemoCoreFixture.assignments.length}`,
);
console.log(
  `learningSubmissions=${learningLocalDemoCoreFixture.submissions.length}`,
);
console.log(
  `learningPaths=${learningLocalDemoCoreFixture.learningPaths.length}`,
);
console.log(
  `learningDailyPlans=${learningLocalDemoCoreFixture.dailyPlans.length}`,
);
console.log(
  `learningVideoEvidence=${learningLocalDemoCoreFixture.videoEvidence.length}`,
);
console.log(
  `learningPracticeAttempts=${learningLocalDemoCoreFixture.practiceAttempts.length}`,
);
console.log(
  `learningParentGuardians=${learningLocalDemoCoreFixture.parentGuardians.length}`,
);
console.log(
  `learningScreenTimePolicies=${learningLocalDemoCoreFixture.screenTimePolicies.length}`,
);
console.log(
  `learningSessionGates=${learningLocalDemoCoreFixture.sessionGates.length}`,
);
console.log(
  `learningScreenTimeGrantRequests=${learningLocalDemoCoreFixture.screenTimeGrantRequests.length}`,
);
console.log(
  `learningContentOwners=${learningLocalDemoCoreFixture.contentOwners.length}`,
);
console.log(
  `learningContentItems=${learningLocalDemoCoreFixture.contentLibraryItems.length}`,
);
console.log(
  `learningContentClassAssignments=${learningLocalDemoCoreFixture.contentClassAssignments.length}`,
);
console.log(
  `learningContentStudentVisibilityRows=${learningLocalDemoCoreFixture.contentStudentVisibilities.length}`,
);
console.log(
  `learningAiTutorChatSessions=${learningLocalDemoCoreFixture.aiTutorChatSessions.length}`,
);
console.log(
  `learningAiTutorChatMessages=${learningLocalDemoCoreFixture.aiTutorChatMessages.length}`,
);
console.log(
  `learningAiTutorSafetyFlags=${learningLocalDemoCoreFixture.aiTutorSafetyFlags.length}`,
);
console.log(
  `learningAiTutorTeacherReviewItems=${learningLocalDemoCoreFixture.aiTutorTeacherReviewItems.length}`,
);
console.log(
  `learningAiTutorParentSummaries=${learningLocalDemoCoreFixture.aiTutorParentSummaries.length}`,
);
console.log(
  `learningAiTutorSupportRecommendations=${learningLocalDemoCoreFixture.aiTutorSupportRecommendations.length}`,
);
console.log(
  `learningAchievementRecords=${learningLocalDemoCoreFixture.achievementRecords.length}`,
);
console.log(
  `learningBadgeAwards=${learningLocalDemoCoreFixture.badgeAwards.length}`,
);
console.log(
  `learningCertificateFixtures=${learningLocalDemoCoreFixture.certificateFixtures.length}`,
);
console.log(
  `learningMilestones=${learningLocalDemoCoreFixture.milestones.length}`,
);
console.log(
  `learningRecognitionSummaries=${learningLocalDemoCoreFixture.recognitionSummaries.length}`,
);
console.log(
  `learningWeeklyDigests=${learningLocalDemoCoreFixture.weeklyDigests.length}`,
);
console.log(
  `learningWeeklyDigestActions=${learningLocalDemoCoreFixture.weeklyDigestActions.length}`,
);
console.log(
  `learningFollowUpActionOutcomes=${learningLocalDemoCoreFixture.followUpActionOutcomes.length}`,
);
console.log(
  `learningRemedialRetryCompletionFixtures=${learningLocalDemoCoreFixture.remedialRetryCompletions.length}`,
);
console.log(
  `learningRemedialRetryUnresolvedFixtures=${learningLocalDemoCoreFixture.remedialRetryUnresolvedEscalations.length}`,
);
console.log(
  `learningParentTeacherLearnerSummaries=${parentTeacherAlertReport.totals.learnerProgressSummaryCount}`,
);
console.log(
  `learningParentTeacherAlerts=${parentTeacherAlertReport.totals.alertCount}`,
);
console.log(
  `learningParentTeacherHighRiskAlerts=${parentTeacherAlertReport.totals.highRiskAlertCount}`,
);
console.log(
  `learningParentTeacherMediumRiskAlerts=${parentTeacherAlertReport.totals.mediumRiskAlertCount}`,
);
console.log(
  `learningParentTeacherFollowUpNeededAlerts=${parentTeacherAlertReport.totals.followUpNeededAlertCount}`,
);
console.log(
  `learningParentTeacherResolvedAlerts=${parentTeacherAlertReport.totals.resolvedAlertCount}`,
);
console.log(
  `learningParentScreenTimeGuardians=${parentScreenTimeReport.totals.parentGuardianCount}`,
);
console.log(
  `learningParentScreenTimeChildren=${parentScreenTimeReport.totals.childCount}`,
);
console.log(
  `learningParentScreenTimeActivePolicies=${parentScreenTimeReport.totals.activeScreenTimePolicyCount}`,
);
console.log(
  `learningParentScreenTimeAllowedMinutes=${parentScreenTimeReport.totals.allowedMinutes}`,
);
console.log(
  `learningParentScreenTimeUsedMinutes=${parentScreenTimeReport.totals.usedMinutes}`,
);
console.log(
  `learningParentScreenTimeRemainingMinutes=${parentScreenTimeReport.totals.remainingMinutes}`,
);
console.log(
  `learningParentScreenTimeGrantRequests=${parentScreenTimeReport.totals.grantRequestCount}`,
);
console.log(
  `learningParentScreenTimeGrantDecisions=${parentScreenTimeReport.totals.grantDecisionCount}`,
);
console.log(
  `learningParentScreenTimeAllowedSessions=${parentScreenTimeReport.totals.allowedSessionCount}`,
);
console.log(
  `learningParentScreenTimeBlockedSessions=${parentScreenTimeReport.totals.blockedSessionCount}`,
);
console.log(
  `learningParentScreenTimeOverrideSessions=${parentScreenTimeReport.totals.overrideSessionCount}`,
);
console.log(
  `learningParentScreenTimeChildrenNeedAttention=${parentScreenTimeReport.totals.childrenNeedingParentAttentionCount}`,
);
console.log(
  `learningParentScreenTimeGrantDailyPlanGuardCases=${parentScreenTimeGrantDailyPlanGuardReport.totals.dailyPlanAccessCaseCount}`,
);
console.log(
  `learningParentScreenTimeGrantDailyPlanGuardAllowed=${parentScreenTimeGrantDailyPlanGuardReport.totals.allowedSessionCount}`,
);
console.log(
  `learningParentScreenTimeGrantDailyPlanGuardBlocked=${parentScreenTimeGrantDailyPlanGuardReport.totals.blockedSessionCount}`,
);
console.log(
  `learningParentScreenTimeGrantDailyPlanGuardTraces=${parentScreenTimeGrantDailyPlanGuardReport.totals.sessionGuardTraceCount}`,
);
console.log(
  `learningParentScreenTimeGrantDailyPlanGuardOpenSafetyGates=${parentScreenTimeGrantDailyPlanGuardReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningSessionCompletionPracticeProgressRollups=${learningSessionCompletionPracticeProgressRollupReport.totals.progressRollupCount}`,
);
console.log(
  `learningSessionCompletionPracticeProgressParentSummaries=${learningSessionCompletionPracticeProgressRollupReport.totals.parentVisibleProgressSummaryCount}`,
);
console.log(
  `learningSessionCompletionPracticeProgressTeacherSummaries=${learningSessionCompletionPracticeProgressRollupReport.totals.teacherVisibleProgressSummaryCount}`,
);
console.log(
  `learningSessionCompletionPracticeProgressStableTraces=${learningSessionCompletionPracticeProgressRollupReport.totals.stableTraceCount}`,
);
console.log(
  `learningSessionCompletionPracticeProgressOpenSafetyGates=${learningSessionCompletionPracticeProgressRollupReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningTeacherInterventionReviews=${teacherInterventionRemedialAssignmentSupportPlanReport.totals.teacherInterventionReviewCount}`,
);
console.log(
  `learningTeacherInterventionRemedialAssignments=${teacherInterventionRemedialAssignmentSupportPlanReport.totals.remedialAssignmentCount}`,
);
console.log(
  `learningTeacherInterventionSupportPlans=${teacherInterventionRemedialAssignmentSupportPlanReport.totals.supportPlanCount}`,
);
console.log(
  `learningTeacherInterventionParentSummaries=${teacherInterventionRemedialAssignmentSupportPlanReport.totals.parentVisibleSupportSummaryCount}`,
);
console.log(
  `learningTeacherInterventionTeacherNextActions=${teacherInterventionRemedialAssignmentSupportPlanReport.totals.teacherVisibleNextActionCount}`,
);
console.log(
  `learningTeacherInterventionStableTraces=${teacherInterventionRemedialAssignmentSupportPlanReport.totals.stableTraceCount}`,
);
console.log(
  `learningTeacherInterventionOpenSafetyGates=${teacherInterventionRemedialAssignmentSupportPlanReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningTeacherContentTeacherAdmins=${teacherContentPublishReport.totals.teacherAdminCount}`,
);
console.log(
  `learningTeacherContentItems=${teacherContentPublishReport.totals.contentItemCount}`,
);
console.log(
  `learningTeacherContentVideoAssets=${teacherContentPublishReport.totals.videoAssetCount}`,
);
console.log(
  `learningTeacherContentPracticeAssets=${teacherContentPublishReport.totals.practiceAssetCount}`,
);
console.log(
  `learningTeacherContentLessonAssets=${teacherContentPublishReport.totals.lessonAssetCount}`,
);
console.log(
  `learningTeacherContentPublished=${teacherContentPublishReport.totals.publishedContentCount}`,
);
console.log(
  `learningTeacherContentDraft=${teacherContentPublishReport.totals.draftContentCount}`,
);
console.log(
  `learningTeacherContentArchived=${teacherContentPublishReport.totals.archivedContentCount}`,
);
console.log(
  `learningTeacherContentLearningPathPublishes=${teacherContentPublishReport.totals.learningPathPublishCount}`,
);
console.log(
  `learningTeacherContentClassAssignments=${teacherContentPublishReport.totals.classAssignmentCount}`,
);
console.log(
  `learningTeacherContentStudentVisibility=${teacherContentPublishReport.totals.studentVisibilityCount}`,
);
console.log(
  `learningTeacherContentParentSummaries=${teacherContentPublishReport.totals.parentVisibleSummaryCount}`,
);
console.log(
  `learningTeacherContentBlockedUnpublished=${teacherContentPublishReport.totals.blockedUnpublishedItemCount}`,
);
console.log(
  `learningTeacherContentTeacherReview=${teacherContentPublishReport.totals.itemsNeedingTeacherReviewCount}`,
);
console.log(
  `learningAiTutorAllowedMessages=${aiTutorChatSafetyTeacherReviewReport.totals.allowedMessageCount}`,
);
console.log(
  `learningAiTutorBlockedMessages=${aiTutorChatSafetyTeacherReviewReport.totals.blockedMessageCount}`,
);
console.log(
  `learningAiTutorReviewedItems=${aiTutorChatSafetyTeacherReviewReport.totals.reviewedTeacherReviewItemCount}`,
);
console.log(
  `learningAiTutorStudentsNeedingSupport=${aiTutorChatSafetyTeacherReviewReport.totals.studentsNeedingSupportCount}`,
);
console.log(
  `learningAchievementReportAchievementRecords=${studentAchievementBadgeCertificateReport.totals.achievementRecords}`,
);
console.log(
  `learningAchievementReportBadgeAwards=${studentAchievementBadgeCertificateReport.totals.badgeAwards}`,
);
console.log(
  `learningAchievementReportCertificateFixtures=${studentAchievementBadgeCertificateReport.totals.certificateFixtures}`,
);
console.log(
  `learningAchievementReportMilestonesCompleted=${studentAchievementBadgeCertificateReport.totals.milestonesCompleted}`,
);
console.log(
  `learningAchievementReportMilestonesPending=${studentAchievementBadgeCertificateReport.totals.milestonesPending}`,
);
console.log(
  `learningAchievementReportRecognitionSummaries=${studentAchievementBadgeCertificateReport.totals.recognitionSummaries}`,
);
console.log(
  `learningAchievementReportParentVisibleRecognitions=${studentAchievementBadgeCertificateReport.totals.parentVisibleRecognitions}`,
);
console.log(
  `learningAchievementReportTeacherReviewItems=${studentAchievementBadgeCertificateReport.totals.teacherReviewItems}`,
);
console.log(
  `learningAchievementReportStudentsWithBadges=${studentAchievementBadgeCertificateReport.totals.studentsWithBadges}`,
);
console.log(
  `learningAchievementReportStudentsNearCertificate=${studentAchievementBadgeCertificateReport.totals.studentsNearCertificate}`,
);
console.log(
  `learningAchievementReportStudentsNeedingEncouragement=${studentAchievementBadgeCertificateReport.totals.studentsNeedingEncouragement}`,
);
console.log(
  `learningWeeklyDigestReportDigests=${parentTeacherWeeklyDigestReport.totals.digestCount}`,
);
console.log(
  `learningWeeklyDigestReportParentDigests=${parentTeacherWeeklyDigestReport.totals.parentDigestCount}`,
);
console.log(
  `learningWeeklyDigestReportTeacherDigests=${parentTeacherWeeklyDigestReport.totals.teacherDigestCount}`,
);
console.log(
  `learningWeeklyDigestReportReadyToSend=${parentTeacherWeeklyDigestReport.totals.readyToSendDigestCount}`,
);
console.log(
  `learningWeeklyDigestReportTeacherReview=${parentTeacherWeeklyDigestReport.totals.teacherReviewDigestCount}`,
);
console.log(
  `learningWeeklyDigestReportHeldWithdrawn=${parentTeacherWeeklyDigestReport.totals.heldWithdrawnDigestCount}`,
);
console.log(
  `learningWeeklyDigestReportActions=${parentTeacherWeeklyDigestReport.totals.actionCount}`,
);
console.log(
  `learningWeeklyDigestReportHighPriorityActions=${parentTeacherWeeklyDigestReport.totals.highPriorityActionCount}`,
);
console.log(
  `learningWeeklyDigestReportStudentsCovered=${parentTeacherWeeklyDigestReport.totals.studentsCovered}`,
);
console.log(
  `learningFollowUpOutcomeReportOutcomes=${followUpActionOutcomeReport.totals.outcomeCount}`,
);
console.log(
  `learningFollowUpOutcomeReportCompleted=${followUpActionOutcomeReport.totals.completedOutcomeCount}`,
);
console.log(
  `learningFollowUpOutcomeReportVerified=${followUpActionOutcomeReport.totals.verifiedOutcomeCount}`,
);
console.log(
  `learningFollowUpOutcomeReportMonitoring=${followUpActionOutcomeReport.totals.monitoringOutcomeCount}`,
);
console.log(
  `learningFollowUpOutcomeReportHeld=${followUpActionOutcomeReport.totals.heldOutcomeCount}`,
);
console.log(
  `learningFollowUpOutcomeReportStudentsCovered=${followUpActionOutcomeReport.totals.studentsCovered}`,
);
console.log(
  `learningRemedialRetryCompletionReportRetries=${remedialRetryCompletionSupportOutcomeFollowupReport.totals.remedialRetryCompletionCount}`,
);
console.log(
  `learningRemedialRetryCompletionReportOutcomes=${remedialRetryCompletionSupportOutcomeFollowupReport.totals.supportOutcomeEvidenceCount}`,
);
console.log(
  `learningRemedialRetryCompletionReportParentFollowups=${remedialRetryCompletionSupportOutcomeFollowupReport.totals.parentVisibleFollowupSummaryCount}`,
);
console.log(
  `learningRemedialRetryCompletionReportTeacherFollowups=${remedialRetryCompletionSupportOutcomeFollowupReport.totals.teacherVisibleFollowupSummaryCount}`,
);
console.log(
  `learningRemedialRetryCompletionReportStableTraces=${remedialRetryCompletionSupportOutcomeFollowupReport.totals.stableTraceCount}`,
);
console.log(
  `learningRemedialRetryCompletionReportOpenSafetyGates=${remedialRetryCompletionSupportOutcomeFollowupReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningRemedialRetryUnresolvedReportAttempts=${remedialRetryUnresolvedSupportEscalationReport.totals.remedialRetryAttemptCount}`,
);
console.log(
  `learningRemedialRetryUnresolvedReportOutcomes=${remedialRetryUnresolvedSupportEscalationReport.totals.unresolvedSupportOutcomeCount}`,
);
console.log(
  `learningRemedialRetryUnresolvedReportTeacherEscalations=${remedialRetryUnresolvedSupportEscalationReport.totals.teacherEscalationCount}`,
);
console.log(
  `learningRemedialRetryUnresolvedReportParentEscalations=${remedialRetryUnresolvedSupportEscalationReport.totals.parentVisibleEscalationSummaryCount}`,
);
console.log(
  `learningRemedialRetryUnresolvedReportTeacherNextActions=${remedialRetryUnresolvedSupportEscalationReport.totals.teacherVisibleEscalationNextActionCount}`,
);
console.log(
  `learningRemedialRetryUnresolvedReportStableTraces=${remedialRetryUnresolvedSupportEscalationReport.totals.stableTraceCount}`,
);
console.log(
  `learningRemedialRetryUnresolvedReportOpenSafetyGates=${remedialRetryUnresolvedSupportEscalationReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningTeacherEscalationFollowupReportReferences=${teacherEscalationFollowupResolutionReport.totals.unresolvedEscalationReferenceCount}`,
);
console.log(
  `learningTeacherEscalationFollowupReportTeacherReviews=${teacherEscalationFollowupResolutionReport.totals.teacherReviewedEscalationCount}`,
);
console.log(
  `learningTeacherEscalationFollowupReportAdjustedRetries=${teacherEscalationFollowupResolutionReport.totals.adjustedSupportRetryCompletionCount}`,
);
console.log(
  `learningTeacherEscalationFollowupReportResolvedOutcomes=${teacherEscalationFollowupResolutionReport.totals.resolvedSupportOutcomeCount}`,
);
console.log(
  `learningTeacherEscalationFollowupReportParentClosures=${teacherEscalationFollowupResolutionReport.totals.parentVisibleClosureSummaryCount}`,
);
console.log(
  `learningTeacherEscalationFollowupReportTeacherClosures=${teacherEscalationFollowupResolutionReport.totals.teacherVisibleClosureNoteCount}`,
);
console.log(
  `learningTeacherEscalationFollowupReportStableTraces=${teacherEscalationFollowupResolutionReport.totals.stableTraceCount}`,
);
console.log(
  `learningTeacherEscalationFollowupReportOpenSafetyGates=${teacherEscalationFollowupResolutionReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningMvpEndToEndReadinessTraceStableTraces=${mvpEndToEndReadinessTraceReport.totals.stableEndToEndTraceCount}`,
);
console.log(
  `learningMvpEndToEndReadinessTraceSamePath=${mvpEndToEndReadinessTraceReport.totals.sameStudentCoursePathCount}`,
);
console.log(
  `learningMvpEndToEndReadinessTraceAlignedApprovedDeliveryPath=${mvpEndToEndReadinessTraceReport.totals.alignedApprovedDeliveryStudentCoursePathCount}`,
);
console.log(
  `learningMvpEndToEndReadinessTraceOpenSafetyGates=${mvpEndToEndReadinessTraceReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningMvpReadinessOverviewSlices=${mvpReadinessOverviewReport.totals.sliceCount}`,
);
console.log(
  `learningMvpReadinessOverviewReadySlices=${mvpReadinessOverviewReport.totals.localDemoReadySliceCount}`,
);
console.log(
  `learningMvpReadinessOverviewScorePercent=${mvpReadinessOverviewReport.totals.readinessScorePercent}`,
);
console.log(
  `learningMvpReadinessOverviewOpenSafetyGates=${mvpReadinessOverviewReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningAcceptanceTraceabilityGateCriteria=${acceptanceTraceabilityGateReport.totals.acceptanceCriterionCount}`,
);
console.log(
  `learningAcceptanceTraceabilityGateMappedCriteria=${acceptanceTraceabilityGateReport.totals.mappedCriterionCount}`,
);
console.log(
  `learningAcceptanceTraceabilityGateSlicesWithMapping=${acceptanceTraceabilityGateReport.totals.slicesWithMappingCount}`,
);
console.log(
  `learningAcceptanceTraceabilityGateOpenSafetyGates=${acceptanceTraceabilityGateReport.totals.openSafetyGateCount}`,
);
console.log(
  `learningAttendanceRecords=${learningLocalDemoCoreFixture.attendance.length}`,
);
console.log(`learningProgress=${learningLocalDemoCoreFixture.progress.length}`);
