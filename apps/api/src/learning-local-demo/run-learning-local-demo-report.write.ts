import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { buildLearningLocalDemoReports } from './run-learning-local-demo-report.build';

/** Writes the JSON and Markdown exports for every report. */
export function writeLearningLocalDemoReportExports(
  ctx: ReturnType<typeof buildLearningLocalDemoReports>,
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
    classSessionReport,
    followUpActionOutcomeReport,
    learningPathReport,
    learningSessionCompletionPracticeProgressRollupReport,
    lessonAssignmentReport,
    mvpEndToEndReadinessTraceReport,
    mvpReadinessOverviewReport,
    mvpRoleJourneyEntrypointsReport,
    outputDir,
    parentPortalApprovedReportInboxReadReceiptReport,
    parentScreenTimeGrantDailyPlanGuardReport,
    parentScreenTimeReport,
    parentTeacherAlertReport,
    parentTeacherProgressAccessSummaryReport,
    parentTeacherReportPermissionPrivacyRedactionReport,
    parentTeacherReportReviewQueueMessagePreviewReport,
    parentTeacherWeeklyDigestReport,
    prismaAuthSessionStoreMatrixReport,
    productionRuntimeGateMatrixReport,
    releaseCandidateGoLiveGateReport,
    remedialRetryCompletionSupportOutcomeFollowupReport,
    remedialRetryUnresolvedSupportEscalationReport,
    service,
    studentAchievementBadgeCertificateReport,
    studentCourseFlowReport,
    studentCourseReport,
    subscriptionEntitlementDailyPlanAccessReport,
    teacherContentPublishReport,
    teacherEscalationFollowupResolutionReport,
    teacherInterventionRemedialAssignmentSupportPlanReport,
    uploadStorageHardeningMatrixReport,
  } = ctx;
  mkdirSync(outputDir, { recursive: true });
  const jsonPath = join(
    outputDir,
    'learning-local-demo-student-course-enrollment-subscription-report.json',
  );
  const mdPath = join(
    outputDir,
    'learning-local-demo-student-course-enrollment-subscription-report.md',
  );
  const flowJsonPath = join(
    outputDir,
    'learning-local-demo-student-course-enrollment-subscription-flow-report.json',
  );
  const flowMdPath = join(
    outputDir,
    'learning-local-demo-student-course-enrollment-subscription-flow-report.md',
  );
  const subscriptionEntitlementDailyPlanAccessJsonPath = join(
    outputDir,
    'learning-local-demo-subscription-entitlement-daily-plan-access-report.json',
  );
  const subscriptionEntitlementDailyPlanAccessMdPath = join(
    outputDir,
    'learning-local-demo-subscription-entitlement-daily-plan-access-report.md',
  );
  const parentTeacherProgressAccessSummaryJsonPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-progress-access-summary-report.json',
  );
  const parentTeacherProgressAccessSummaryMdPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-progress-access-summary-report.md',
  );
  const parentTeacherReportPermissionPrivacyRedactionJsonPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json',
  );
  const parentTeacherReportPermissionPrivacyRedactionMdPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.md',
  );
  const parentTeacherReportReviewQueueMessagePreviewJsonPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-report-review-queue-message-preview-report.json',
  );
  const parentTeacherReportReviewQueueMessagePreviewMdPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-report-review-queue-message-preview-report.md',
  );
  const parentPortalApprovedReportInboxReadReceiptJsonPath = join(
    outputDir,
    'learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
  );
  const parentPortalApprovedReportInboxReadReceiptMdPath = join(
    outputDir,
    'learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.md',
  );
  const authSessionSmokeMatrixJsonPath = join(
    outputDir,
    'learning-local-demo-auth-session-smoke-matrix-report.json',
  );
  const authSessionSmokeMatrixMdPath = join(
    outputDir,
    'learning-local-demo-auth-session-smoke-matrix-report.md',
  );
  const authRefreshLifecycleMatrixJsonPath = join(
    outputDir,
    'learning-local-demo-auth-refresh-lifecycle-matrix-report.json',
  );
  const authRefreshLifecycleMatrixMdPath = join(
    outputDir,
    'learning-local-demo-auth-refresh-lifecycle-matrix-report.md',
  );
  const authPersistenceSecurityGateMatrixJsonPath = join(
    outputDir,
    'learning-local-demo-auth-persistence-security-gate-matrix-report.json',
  );
  const authPersistenceSecurityGateMatrixMdPath = join(
    outputDir,
    'learning-local-demo-auth-persistence-security-gate-matrix-report.md',
  );
  const authSessionRepositoryContractMatrixJsonPath = join(
    outputDir,
    'learning-local-demo-auth-session-repository-contract-matrix-report.json',
  );
  const authSessionRepositoryContractMatrixMdPath = join(
    outputDir,
    'learning-local-demo-auth-session-repository-contract-matrix-report.md',
  );
  const productionRuntimeGateMatrixJsonPath = join(
    outputDir,
    'learning-local-demo-production-runtime-gate-matrix-report.json',
  );
  const productionRuntimeGateMatrixMdPath = join(
    outputDir,
    'learning-local-demo-production-runtime-gate-matrix-report.md',
  );
  const uploadStorageHardeningMatrixJsonPath = join(
    outputDir,
    'learning-local-demo-upload-storage-hardening-matrix-report.json',
  );
  const uploadStorageHardeningMatrixMdPath = join(
    outputDir,
    'learning-local-demo-upload-storage-hardening-matrix-report.md',
  );
  const releaseCandidateGoLiveGateJsonPath = join(
    outputDir,
    'learning-local-demo-release-candidate-go-live-gate-report.json',
  );
  const releaseCandidateGoLiveGateMdPath = join(
    outputDir,
    'learning-local-demo-release-candidate-go-live-gate-report.md',
  );
  const prismaAuthSessionStoreMatrixJsonPath = join(
    outputDir,
    'learning-local-demo-prisma-auth-session-store-matrix-report.json',
  );
  const prismaAuthSessionStoreMatrixMdPath = join(
    outputDir,
    'learning-local-demo-prisma-auth-session-store-matrix-report.md',
  );
  const authOperationalControlMatrixJsonPath = join(
    outputDir,
    'learning-local-demo-auth-operational-control-matrix-report.json',
  );
  const authOperationalControlMatrixMdPath = join(
    outputDir,
    'learning-local-demo-auth-operational-control-matrix-report.md',
  );
  const authOperationalAlertPolicyMatrixJsonPath = join(
    outputDir,
    'learning-local-demo-auth-operational-alert-policy-matrix-report.json',
  );
  const authOperationalAlertPolicyMatrixMdPath = join(
    outputDir,
    'learning-local-demo-auth-operational-alert-policy-matrix-report.md',
  );
  const classSessionJsonPath = join(
    outputDir,
    'learning-local-demo-class-session-attendance-progress-report.json',
  );
  const classSessionMdPath = join(
    outputDir,
    'learning-local-demo-class-session-attendance-progress-report.md',
  );
  const lessonAssignmentJsonPath = join(
    outputDir,
    'learning-local-demo-lesson-assignment-assessment-progress-report.json',
  );
  const lessonAssignmentMdPath = join(
    outputDir,
    'learning-local-demo-lesson-assignment-assessment-progress-report.md',
  );
  const learningPathJsonPath = join(
    outputDir,
    'learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.json',
  );
  const learningPathMdPath = join(
    outputDir,
    'learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.md',
  );
  const parentTeacherAlertJsonPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-progress-alert-intervention-report.json',
  );
  const parentTeacherAlertMdPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-progress-alert-intervention-report.md',
  );
  const parentScreenTimeJsonPath = join(
    outputDir,
    'learning-local-demo-parent-screen-time-guardian-controls-report.json',
  );
  const parentScreenTimeMdPath = join(
    outputDir,
    'learning-local-demo-parent-screen-time-guardian-controls-report.md',
  );
  const parentScreenTimeGrantDailyPlanGuardJsonPath = join(
    outputDir,
    'learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.json',
  );
  const parentScreenTimeGrantDailyPlanGuardMdPath = join(
    outputDir,
    'learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.md',
  );
  const learningSessionCompletionPracticeProgressRollupJsonPath = join(
    outputDir,
    'learning-local-demo-learning-session-completion-practice-progress-rollup-report.json',
  );
  const learningSessionCompletionPracticeProgressRollupMdPath = join(
    outputDir,
    'learning-local-demo-learning-session-completion-practice-progress-rollup-report.md',
  );
  const teacherInterventionRemedialAssignmentSupportPlanJsonPath = join(
    outputDir,
    'learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json',
  );
  const teacherInterventionRemedialAssignmentSupportPlanMdPath = join(
    outputDir,
    'learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.md',
  );
  const remedialRetryCompletionSupportOutcomeFollowupJsonPath = join(
    outputDir,
    'learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.json',
  );
  const remedialRetryCompletionSupportOutcomeFollowupMdPath = join(
    outputDir,
    'learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.md',
  );
  const remedialRetryUnresolvedSupportEscalationJsonPath = join(
    outputDir,
    'learning-local-demo-remedial-retry-unresolved-support-escalation-report.json',
  );
  const remedialRetryUnresolvedSupportEscalationMdPath = join(
    outputDir,
    'learning-local-demo-remedial-retry-unresolved-support-escalation-report.md',
  );
  const teacherEscalationFollowupResolutionJsonPath = join(
    outputDir,
    'learning-local-demo-teacher-escalation-followup-resolution-report.json',
  );
  const teacherEscalationFollowupResolutionMdPath = join(
    outputDir,
    'learning-local-demo-teacher-escalation-followup-resolution-report.md',
  );
  const mvpEndToEndReadinessTraceJsonPath = join(
    outputDir,
    'learning-local-demo-mvp-end-to-end-readiness-trace-report.json',
  );
  const mvpEndToEndReadinessTraceMdPath = join(
    outputDir,
    'learning-local-demo-mvp-end-to-end-readiness-trace-report.md',
  );
  const mvpRoleJourneyEntrypointsJsonPath = join(
    outputDir,
    'learning-local-demo-mvp-role-journey-entrypoints-report.json',
  );
  const mvpRoleJourneyEntrypointsMdPath = join(
    outputDir,
    'learning-local-demo-mvp-role-journey-entrypoints-report.md',
  );
  const teacherContentPublishJsonPath = join(
    outputDir,
    'learning-local-demo-teacher-content-library-learning-path-publish-report.json',
  );
  const teacherContentPublishMdPath = join(
    outputDir,
    'learning-local-demo-teacher-content-library-learning-path-publish-report.md',
  );
  const aiTutorChatSafetyTeacherReviewJsonPath = join(
    outputDir,
    'learning-local-demo-ai-tutor-chat-safety-teacher-review-report.json',
  );
  const aiTutorChatSafetyTeacherReviewMdPath = join(
    outputDir,
    'learning-local-demo-ai-tutor-chat-safety-teacher-review-report.md',
  );
  const studentAchievementBadgeCertificateJsonPath = join(
    outputDir,
    'learning-local-demo-student-achievement-badge-certificate-report.json',
  );
  const studentAchievementBadgeCertificateMdPath = join(
    outputDir,
    'learning-local-demo-student-achievement-badge-certificate-report.md',
  );
  const parentTeacherWeeklyDigestJsonPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-weekly-digest-report.json',
  );
  const parentTeacherWeeklyDigestMdPath = join(
    outputDir,
    'learning-local-demo-parent-teacher-weekly-digest-report.md',
  );
  const followUpActionOutcomeJsonPath = join(
    outputDir,
    'learning-local-demo-followup-action-outcome-report.json',
  );
  const followUpActionOutcomeMdPath = join(
    outputDir,
    'learning-local-demo-followup-action-outcome-report.md',
  );
  const mvpReadinessOverviewJsonPath = join(
    outputDir,
    'learning-local-demo-mvp-readiness-overview-report.json',
  );
  const mvpReadinessOverviewMdPath = join(
    outputDir,
    'learning-local-demo-mvp-readiness-overview-report.md',
  );
  const acceptanceTraceabilityGateJsonPath = join(
    outputDir,
    'learning-local-demo-acceptance-traceability-gate-report.json',
  );
  const acceptanceTraceabilityGateMdPath = join(
    outputDir,
    'learning-local-demo-acceptance-traceability-gate-report.md',
  );
  writeFileSync(
    jsonPath,
    `${JSON.stringify(studentCourseReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    mdPath,
    service.toLearningCoreMarkdown(studentCourseReport),
    'utf8',
  );
  writeFileSync(
    flowJsonPath,
    `${JSON.stringify(studentCourseFlowReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    flowMdPath,
    service.toStudentCourseEnrollmentSubscriptionFlowMarkdown(
      studentCourseFlowReport,
    ),
    'utf8',
  );
  writeFileSync(
    subscriptionEntitlementDailyPlanAccessJsonPath,
    `${JSON.stringify(subscriptionEntitlementDailyPlanAccessReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    subscriptionEntitlementDailyPlanAccessMdPath,
    service.toSubscriptionEntitlementDailyPlanAccessMarkdown(
      subscriptionEntitlementDailyPlanAccessReport,
    ),
    'utf8',
  );
  writeFileSync(
    parentTeacherProgressAccessSummaryJsonPath,
    `${JSON.stringify(parentTeacherProgressAccessSummaryReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    parentTeacherProgressAccessSummaryMdPath,
    service.toParentTeacherProgressAccessSummaryMarkdown(
      parentTeacherProgressAccessSummaryReport,
    ),
    'utf8',
  );
  writeFileSync(
    parentTeacherReportPermissionPrivacyRedactionJsonPath,
    `${JSON.stringify(parentTeacherReportPermissionPrivacyRedactionReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    parentTeacherReportPermissionPrivacyRedactionMdPath,
    service.toParentTeacherReportPermissionPrivacyRedactionMarkdown(
      parentTeacherReportPermissionPrivacyRedactionReport,
    ),
    'utf8',
  );
  writeFileSync(
    parentTeacherReportReviewQueueMessagePreviewJsonPath,
    `${JSON.stringify(parentTeacherReportReviewQueueMessagePreviewReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    parentTeacherReportReviewQueueMessagePreviewMdPath,
    service.toParentTeacherReportReviewQueueMessagePreviewMarkdown(
      parentTeacherReportReviewQueueMessagePreviewReport,
    ),
    'utf8',
  );
  writeFileSync(
    parentPortalApprovedReportInboxReadReceiptJsonPath,
    `${JSON.stringify(parentPortalApprovedReportInboxReadReceiptReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    parentPortalApprovedReportInboxReadReceiptMdPath,
    service.toParentPortalApprovedReportInboxReadReceiptMarkdown(
      parentPortalApprovedReportInboxReadReceiptReport,
    ),
    'utf8',
  );
  writeFileSync(
    authSessionSmokeMatrixJsonPath,
    `${JSON.stringify(authSessionSmokeMatrixReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    authSessionSmokeMatrixMdPath,
    service.toAuthSessionSmokeMatrixMarkdown(authSessionSmokeMatrixReport),
    'utf8',
  );
  writeFileSync(
    authRefreshLifecycleMatrixJsonPath,
    `${JSON.stringify(authRefreshLifecycleMatrixReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    authRefreshLifecycleMatrixMdPath,
    service.toAuthRefreshLifecycleMatrixMarkdown(
      authRefreshLifecycleMatrixReport,
    ),
    'utf8',
  );
  writeFileSync(
    authPersistenceSecurityGateMatrixJsonPath,
    `${JSON.stringify(authPersistenceSecurityGateMatrixReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    authPersistenceSecurityGateMatrixMdPath,
    service.toAuthPersistenceSecurityGateMatrixMarkdown(
      authPersistenceSecurityGateMatrixReport,
    ),
    'utf8',
  );
  writeFileSync(
    authSessionRepositoryContractMatrixJsonPath,
    `${JSON.stringify(authSessionRepositoryContractMatrixReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    authSessionRepositoryContractMatrixMdPath,
    service.toAuthSessionRepositoryContractMatrixMarkdown(
      authSessionRepositoryContractMatrixReport,
    ),
    'utf8',
  );
  writeFileSync(
    productionRuntimeGateMatrixJsonPath,
    `${JSON.stringify(productionRuntimeGateMatrixReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    productionRuntimeGateMatrixMdPath,
    service.toProductionRuntimeGateMatrixMarkdown(
      productionRuntimeGateMatrixReport,
    ),
    'utf8',
  );
  writeFileSync(
    uploadStorageHardeningMatrixJsonPath,
    `${JSON.stringify(uploadStorageHardeningMatrixReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    uploadStorageHardeningMatrixMdPath,
    service.toUploadStorageHardeningMatrixMarkdown(
      uploadStorageHardeningMatrixReport,
    ),
    'utf8',
  );
  writeFileSync(
    releaseCandidateGoLiveGateJsonPath,
    `${JSON.stringify(releaseCandidateGoLiveGateReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    releaseCandidateGoLiveGateMdPath,
    service.toReleaseCandidateGoLiveGateMarkdown(
      releaseCandidateGoLiveGateReport,
    ),
    'utf8',
  );
  writeFileSync(
    prismaAuthSessionStoreMatrixJsonPath,
    `${JSON.stringify(prismaAuthSessionStoreMatrixReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    prismaAuthSessionStoreMatrixMdPath,
    service.toPrismaAuthSessionStoreMatrixMarkdown(
      prismaAuthSessionStoreMatrixReport,
    ),
    'utf8',
  );
  writeFileSync(
    authOperationalControlMatrixJsonPath,
    `${JSON.stringify(authOperationalControlMatrixReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    authOperationalControlMatrixMdPath,
    service.toAuthOperationalControlMatrixMarkdown(
      authOperationalControlMatrixReport,
    ),
    'utf8',
  );
  writeFileSync(
    authOperationalAlertPolicyMatrixJsonPath,
    `${JSON.stringify(authOperationalAlertPolicyMatrixReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    authOperationalAlertPolicyMatrixMdPath,
    service.toAuthOperationalAlertPolicyMatrixMarkdown(
      authOperationalAlertPolicyMatrixReport,
    ),
    'utf8',
  );
  writeFileSync(
    classSessionJsonPath,
    `${JSON.stringify(classSessionReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    classSessionMdPath,
    service.toClassSessionAttendanceProgressMarkdown(classSessionReport),
    'utf8',
  );
  writeFileSync(
    lessonAssignmentJsonPath,
    `${JSON.stringify(lessonAssignmentReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    lessonAssignmentMdPath,
    service.toLessonAssignmentAssessmentProgressMarkdown(
      lessonAssignmentReport,
    ),
    'utf8',
  );
  writeFileSync(
    learningPathJsonPath,
    `${JSON.stringify(learningPathReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    learningPathMdPath,
    service.toLearningPathDailyPlanVideoPracticeEvidenceMarkdown(
      learningPathReport,
    ),
    'utf8',
  );
  writeFileSync(
    parentTeacherAlertJsonPath,
    `${JSON.stringify(parentTeacherAlertReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    parentTeacherAlertMdPath,
    service.toParentTeacherProgressAlertInterventionMarkdown(
      parentTeacherAlertReport,
    ),
    'utf8',
  );
  writeFileSync(
    parentScreenTimeJsonPath,
    `${JSON.stringify(parentScreenTimeReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    parentScreenTimeMdPath,
    service.toParentScreenTimeGuardianControlsMarkdown(parentScreenTimeReport),
    'utf8',
  );
  writeFileSync(
    parentScreenTimeGrantDailyPlanGuardJsonPath,
    `${JSON.stringify(parentScreenTimeGrantDailyPlanGuardReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    parentScreenTimeGrantDailyPlanGuardMdPath,
    service.toParentScreenTimeGrantDailyPlanGuardMarkdown(
      parentScreenTimeGrantDailyPlanGuardReport,
    ),
    'utf8',
  );
  writeFileSync(
    learningSessionCompletionPracticeProgressRollupJsonPath,
    `${JSON.stringify(learningSessionCompletionPracticeProgressRollupReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    learningSessionCompletionPracticeProgressRollupMdPath,
    service.toLearningSessionCompletionPracticeProgressRollupMarkdown(
      learningSessionCompletionPracticeProgressRollupReport,
    ),
    'utf8',
  );
  writeFileSync(
    teacherInterventionRemedialAssignmentSupportPlanJsonPath,
    `${JSON.stringify(
      teacherInterventionRemedialAssignmentSupportPlanReport,
      null,
      2,
    )}\n`,
    'utf8',
  );
  writeFileSync(
    teacherInterventionRemedialAssignmentSupportPlanMdPath,
    service.toTeacherInterventionRemedialAssignmentSupportPlanMarkdown(
      teacherInterventionRemedialAssignmentSupportPlanReport,
    ),
    'utf8',
  );
  writeFileSync(
    remedialRetryCompletionSupportOutcomeFollowupJsonPath,
    `${JSON.stringify(
      remedialRetryCompletionSupportOutcomeFollowupReport,
      null,
      2,
    )}\n`,
    'utf8',
  );
  writeFileSync(
    remedialRetryCompletionSupportOutcomeFollowupMdPath,
    service.toRemedialRetryCompletionSupportOutcomeFollowupMarkdown(
      remedialRetryCompletionSupportOutcomeFollowupReport,
    ),
    'utf8',
  );
  writeFileSync(
    remedialRetryUnresolvedSupportEscalationJsonPath,
    `${JSON.stringify(
      remedialRetryUnresolvedSupportEscalationReport,
      null,
      2,
    )}\n`,
    'utf8',
  );
  writeFileSync(
    remedialRetryUnresolvedSupportEscalationMdPath,
    service.toRemedialRetryUnresolvedSupportEscalationMarkdown(
      remedialRetryUnresolvedSupportEscalationReport,
    ),
    'utf8',
  );
  writeFileSync(
    teacherEscalationFollowupResolutionJsonPath,
    `${JSON.stringify(teacherEscalationFollowupResolutionReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    teacherEscalationFollowupResolutionMdPath,
    service.toTeacherEscalationFollowupResolutionMarkdown(
      teacherEscalationFollowupResolutionReport,
    ),
    'utf8',
  );
  writeFileSync(
    mvpEndToEndReadinessTraceJsonPath,
    `${JSON.stringify(mvpEndToEndReadinessTraceReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    mvpEndToEndReadinessTraceMdPath,
    service.toMvpEndToEndReadinessTraceMarkdown(
      mvpEndToEndReadinessTraceReport,
    ),
    'utf8',
  );
  writeFileSync(
    mvpRoleJourneyEntrypointsJsonPath,
    `${JSON.stringify(mvpRoleJourneyEntrypointsReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    mvpRoleJourneyEntrypointsMdPath,
    service.toMvpRoleJourneyEntrypointsMarkdown(
      mvpRoleJourneyEntrypointsReport,
    ),
    'utf8',
  );
  writeFileSync(
    teacherContentPublishJsonPath,
    `${JSON.stringify(teacherContentPublishReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    teacherContentPublishMdPath,
    service.toTeacherContentLibraryLearningPathPublishMarkdown(
      teacherContentPublishReport,
    ),
    'utf8',
  );
  writeFileSync(
    aiTutorChatSafetyTeacherReviewJsonPath,
    `${JSON.stringify(aiTutorChatSafetyTeacherReviewReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    aiTutorChatSafetyTeacherReviewMdPath,
    service.toAiTutorChatSafetyTeacherReviewMarkdown(
      aiTutorChatSafetyTeacherReviewReport,
    ),
    'utf8',
  );
  writeFileSync(
    studentAchievementBadgeCertificateJsonPath,
    `${JSON.stringify(studentAchievementBadgeCertificateReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    studentAchievementBadgeCertificateMdPath,
    service.toStudentAchievementBadgeCertificateMarkdown(
      studentAchievementBadgeCertificateReport,
    ),
    'utf8',
  );
  writeFileSync(
    parentTeacherWeeklyDigestJsonPath,
    `${JSON.stringify(parentTeacherWeeklyDigestReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    parentTeacherWeeklyDigestMdPath,
    service.toParentTeacherWeeklyDigestMarkdown(
      parentTeacherWeeklyDigestReport,
    ),
    'utf8',
  );
  writeFileSync(
    followUpActionOutcomeJsonPath,
    `${JSON.stringify(followUpActionOutcomeReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    followUpActionOutcomeMdPath,
    service.toFollowUpActionOutcomeMarkdown(followUpActionOutcomeReport),
    'utf8',
  );
  writeFileSync(
    mvpReadinessOverviewJsonPath,
    `${JSON.stringify(mvpReadinessOverviewReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    mvpReadinessOverviewMdPath,
    service.toMvpReadinessOverviewMarkdown(mvpReadinessOverviewReport),
    'utf8',
  );
  writeFileSync(
    acceptanceTraceabilityGateJsonPath,
    `${JSON.stringify(acceptanceTraceabilityGateReport, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    acceptanceTraceabilityGateMdPath,
    service.toAcceptanceTraceabilityGateMarkdown(
      acceptanceTraceabilityGateReport,
    ),
    'utf8',
  );

  return {
    jsonPath,
    mdPath,
    flowJsonPath,
    flowMdPath,
    subscriptionEntitlementDailyPlanAccessJsonPath,
    subscriptionEntitlementDailyPlanAccessMdPath,
    parentTeacherProgressAccessSummaryJsonPath,
    parentTeacherProgressAccessSummaryMdPath,
    parentTeacherReportPermissionPrivacyRedactionJsonPath,
    parentTeacherReportPermissionPrivacyRedactionMdPath,
    parentTeacherReportReviewQueueMessagePreviewJsonPath,
    parentTeacherReportReviewQueueMessagePreviewMdPath,
    parentPortalApprovedReportInboxReadReceiptJsonPath,
    parentPortalApprovedReportInboxReadReceiptMdPath,
    authSessionSmokeMatrixJsonPath,
    authSessionSmokeMatrixMdPath,
    authRefreshLifecycleMatrixJsonPath,
    authRefreshLifecycleMatrixMdPath,
    authPersistenceSecurityGateMatrixJsonPath,
    authPersistenceSecurityGateMatrixMdPath,
    authSessionRepositoryContractMatrixJsonPath,
    authSessionRepositoryContractMatrixMdPath,
    productionRuntimeGateMatrixJsonPath,
    productionRuntimeGateMatrixMdPath,
    uploadStorageHardeningMatrixJsonPath,
    uploadStorageHardeningMatrixMdPath,
    releaseCandidateGoLiveGateJsonPath,
    releaseCandidateGoLiveGateMdPath,
    prismaAuthSessionStoreMatrixJsonPath,
    prismaAuthSessionStoreMatrixMdPath,
    authOperationalControlMatrixJsonPath,
    authOperationalControlMatrixMdPath,
    authOperationalAlertPolicyMatrixJsonPath,
    authOperationalAlertPolicyMatrixMdPath,
    classSessionJsonPath,
    classSessionMdPath,
    lessonAssignmentJsonPath,
    lessonAssignmentMdPath,
    learningPathJsonPath,
    learningPathMdPath,
    parentTeacherAlertJsonPath,
    parentTeacherAlertMdPath,
    parentScreenTimeJsonPath,
    parentScreenTimeMdPath,
    parentScreenTimeGrantDailyPlanGuardJsonPath,
    parentScreenTimeGrantDailyPlanGuardMdPath,
    learningSessionCompletionPracticeProgressRollupJsonPath,
    learningSessionCompletionPracticeProgressRollupMdPath,
    teacherInterventionRemedialAssignmentSupportPlanJsonPath,
    teacherInterventionRemedialAssignmentSupportPlanMdPath,
    remedialRetryCompletionSupportOutcomeFollowupJsonPath,
    remedialRetryCompletionSupportOutcomeFollowupMdPath,
    remedialRetryUnresolvedSupportEscalationJsonPath,
    remedialRetryUnresolvedSupportEscalationMdPath,
    teacherEscalationFollowupResolutionJsonPath,
    teacherEscalationFollowupResolutionMdPath,
    mvpEndToEndReadinessTraceJsonPath,
    mvpEndToEndReadinessTraceMdPath,
    mvpRoleJourneyEntrypointsJsonPath,
    mvpRoleJourneyEntrypointsMdPath,
    teacherContentPublishJsonPath,
    teacherContentPublishMdPath,
    aiTutorChatSafetyTeacherReviewJsonPath,
    aiTutorChatSafetyTeacherReviewMdPath,
    studentAchievementBadgeCertificateJsonPath,
    studentAchievementBadgeCertificateMdPath,
    parentTeacherWeeklyDigestJsonPath,
    parentTeacherWeeklyDigestMdPath,
    followUpActionOutcomeJsonPath,
    followUpActionOutcomeMdPath,
    mvpReadinessOverviewJsonPath,
    mvpReadinessOverviewMdPath,
    acceptanceTraceabilityGateJsonPath,
    acceptanceTraceabilityGateMdPath,
  };
}
