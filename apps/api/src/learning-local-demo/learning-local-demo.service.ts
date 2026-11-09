import { Injectable } from '@nestjs/common';
import {
  buildLearningLocalDemoAuthSessionSmokeMatrixReport,
  toLearningLocalDemoAuthSessionSmokeMatrixMarkdown,
} from './auth-session-smoke-matrix';
import {
  buildLearningLocalDemoAuthRefreshLifecycleMatrixReport,
  toLearningLocalDemoAuthRefreshLifecycleMatrixMarkdown,
} from './auth-refresh-lifecycle-matrix';
import {
  buildLearningLocalDemoAuthPersistenceSecurityGateMatrixReport,
  toLearningLocalDemoAuthPersistenceSecurityGateMatrixMarkdown,
} from './auth-persistence-security-gate-matrix';
import {
  buildLearningLocalDemoAuthSessionRepositoryContractMatrixReport,
  toLearningLocalDemoAuthSessionRepositoryContractMatrixMarkdown,
} from './auth-session-repository-contract-matrix';
import {
  buildLearningProductionRuntimeGateMatrixReport,
  toLearningProductionRuntimeGateMatrixMarkdown,
} from './production-runtime-gate-matrix';
import {
  buildLearningUploadStorageHardeningMatrixReport,
  toLearningUploadStorageHardeningMatrixMarkdown,
} from './upload-storage-hardening-matrix';
import {
  buildLearningReleaseCandidateGoLiveGateReport,
  toLearningReleaseCandidateGoLiveGateMarkdown,
  type LearningStagingRehearsalEvidence,
} from './release-candidate-go-live-gate-matrix';
import {
  buildPrismaAuthSessionStoreMatrixReport,
  toPrismaAuthSessionStoreMatrixMarkdown,
} from './prisma-auth-session-store-matrix';
import {
  buildAuthOperationalControlMatrixReport,
  toAuthOperationalControlMatrixMarkdown,
} from './auth-operational-control-matrix';
import {
  buildAuthOperationalAlertPolicyMatrixReport,
  toAuthOperationalAlertPolicyMatrixMarkdown,
} from './auth-operational-alert-policy-matrix';
import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import type {
  DemoLearningAcceptanceTraceabilityGateReport,
  DemoLearningAiTutorChatSafetyTeacherReviewReport,
  DemoLearningClassSessionAttendanceProgressReport,
  DemoLearningCoreFixture,
  DemoLearningCoreReport,
  DemoLearningFollowUpActionOutcomeReport,
  DemoLearningPathDailyPlanVideoPracticeEvidenceReport,
  DemoLearningMvpReadinessOverviewReport,
  DemoLearningMvpEndToEndReadinessTraceReport,
  DemoLearningMvpRoleJourneyEntrypointsReport,
  DemoLearningLessonAssignmentAssessmentProgressReport,
  DemoLearningParentTeacherProgressAlertInterventionReport,
  DemoLearningParentScreenTimeGrantDailyPlanGuardReport,
  DemoLearningParentScreenTimeGuardianControlsReport,
  DemoLearningSessionCompletionPracticeProgressRollupReport,
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport,
  DemoLearningParentPortalApprovedReportInboxReadReceiptReport,
  DemoLearningParentTeacherProgressAccessSummaryReport,
  DemoLearningParentTeacherReportPermissionPrivacyRedactionReport,
  DemoLearningParentTeacherReportReviewQueueMessagePreviewReport,
  DemoLearningParentTeacherWeeklyDigestReport,
  DemoLearningStudentCourseEnrollmentSubscriptionFlowReport,
  DemoLearningSubscriptionEntitlementDailyPlanAccessReport,
  DemoLearningStudentAchievementBadgeCertificateReport,
  DemoLearningTeacherContentLibraryLearningPathPublishReport,
  DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport,
  DemoLearningRemedialRetryUnresolvedSupportEscalationReport,
  DemoLearningTeacherEscalationFollowupResolutionReport,
} from './learning-local-demo.types';
import {
  buildAcceptanceTraceabilityGateReport,
  toAcceptanceTraceabilityGateMarkdown,
} from './reports/acceptance-traceability-gate.report';
import {
  buildAiTutorChatSafetyTeacherReviewReport,
  toAiTutorChatSafetyTeacherReviewMarkdown,
} from './reports/ai-tutor-chat-safety-teacher-review.report';
import {
  buildClassSessionAttendanceProgressReport,
  toClassSessionAttendanceProgressMarkdown,
} from './reports/class-session-attendance-progress.report';
import {
  buildFollowUpActionOutcomeReport,
  toFollowUpActionOutcomeMarkdown,
} from './reports/follow-up-action-outcome.report';
import {
  buildLearningPathDailyPlanVideoPracticeEvidenceReport,
  toLearningPathDailyPlanVideoPracticeEvidenceMarkdown,
} from './reports/learning-path-daily-plan-video-practice-evidence.report';
import {
  buildLearningSessionCompletionPracticeProgressRollupReport,
  toLearningSessionCompletionPracticeProgressRollupMarkdown,
} from './reports/learning-session-completion-practice-progress-rollup.report';
import {
  buildLessonAssignmentAssessmentProgressReport,
  toLessonAssignmentAssessmentProgressMarkdown,
} from './reports/lesson-assignment-assessment-progress.report';
import {
  buildMvpEndToEndReadinessTraceReport,
  toMvpEndToEndReadinessTraceMarkdown,
} from './reports/mvp-end-to-end-readiness-trace.report';
import {
  buildMvpReadinessOverviewReport,
  toMvpReadinessOverviewMarkdown,
} from './reports/mvp-readiness-overview.report';
import {
  buildMvpRoleJourneyEntrypointsReport,
  toMvpRoleJourneyEntrypointsMarkdown,
} from './reports/mvp-role-journey-entrypoints.report';
import {
  buildParentPortalApprovedReportInboxReadReceiptReport,
  toParentPortalApprovedReportInboxReadReceiptMarkdown,
} from './reports/parent-portal-approved-report-inbox-read-receipt.report';
import {
  buildParentScreenTimeGrantDailyPlanGuardReport,
  toParentScreenTimeGrantDailyPlanGuardMarkdown,
} from './reports/parent-screen-time-grant-daily-plan-guard.report';
import {
  buildParentScreenTimeGuardianControlsReport,
  toParentScreenTimeGuardianControlsMarkdown,
} from './reports/parent-screen-time-guardian-controls.report';
import {
  buildParentTeacherProgressAccessSummaryReport,
  toParentTeacherProgressAccessSummaryMarkdown,
} from './reports/parent-teacher-progress-access-summary.report';
import {
  buildParentTeacherProgressAlertInterventionReport,
  toParentTeacherProgressAlertInterventionMarkdown,
} from './reports/parent-teacher-progress-alert-intervention.report';
import { toParentTeacherReportPermissionPrivacyRedactionMarkdown } from './reports/parent-teacher-report-permission-privacy-redaction.markdown';
import { buildParentTeacherReportPermissionPrivacyRedactionReport } from './reports/parent-teacher-report-permission-privacy-redaction.report';
import {
  buildParentTeacherReportReviewQueueMessagePreviewReport,
  toParentTeacherReportReviewQueueMessagePreviewMarkdown,
} from './reports/parent-teacher-report-review-queue-message-preview.report';
import {
  buildParentTeacherWeeklyDigestReport,
  toParentTeacherWeeklyDigestMarkdown,
} from './reports/parent-teacher-weekly-digest.report';
import {
  buildRemedialRetryCompletionSupportOutcomeFollowupReport,
  toRemedialRetryCompletionSupportOutcomeFollowupMarkdown,
} from './reports/remedial-retry-completion-support-outcome-followup.report';
import {
  buildRemedialRetryUnresolvedSupportEscalationReport,
  toRemedialRetryUnresolvedSupportEscalationMarkdown,
} from './reports/remedial-retry-unresolved-support-escalation.report';
import {
  buildStudentAchievementBadgeCertificateReport,
  toStudentAchievementBadgeCertificateMarkdown,
} from './reports/student-achievement-badge-certificate.report';
import {
  buildStudentCourseEnrollmentSubscriptionFlowReport,
  toStudentCourseEnrollmentSubscriptionFlowMarkdown,
} from './reports/student-course-enrollment-subscription-flow.report';
import {
  buildStudentCourseEnrollmentSubscriptionReport,
  toLearningCoreMarkdown,
} from './reports/student-course-enrollment-subscription.report';
import {
  buildSubscriptionEntitlementDailyPlanAccessReport,
  toSubscriptionEntitlementDailyPlanAccessMarkdown,
} from './reports/subscription-entitlement-daily-plan-access.report';
import {
  buildTeacherContentLibraryLearningPathPublishReport,
  toTeacherContentLibraryLearningPathPublishMarkdown,
} from './reports/teacher-content-library-learning-path-publish.report';
import {
  buildTeacherEscalationFollowupResolutionReport,
  toTeacherEscalationFollowupResolutionMarkdown,
} from './reports/teacher-escalation-followup-resolution.report';
import {
  buildTeacherInterventionRemedialAssignmentSupportPlanReport,
  toTeacherInterventionRemedialAssignmentSupportPlanMarkdown,
} from './reports/teacher-intervention-remedial-assignment-support-plan.report';

/**
 * Facade kept for existing consumers (controllers, jobs, other modules).
 * Each method delegates to the focused service that owns the use case.
 */
@Injectable()
export class LearningLocalDemoService {
  buildAuthSessionSmokeMatrixReport(generatedAt = new Date().toISOString()) {
    return buildLearningLocalDemoAuthSessionSmokeMatrixReport(generatedAt);
  }

  toAuthSessionSmokeMatrixMarkdown(
    report: ReturnType<
      typeof buildLearningLocalDemoAuthSessionSmokeMatrixReport
    >,
  ) {
    return toLearningLocalDemoAuthSessionSmokeMatrixMarkdown(report);
  }

  buildAuthRefreshLifecycleMatrixReport(
    generatedAt = new Date().toISOString(),
  ) {
    return buildLearningLocalDemoAuthRefreshLifecycleMatrixReport(generatedAt);
  }

  toAuthRefreshLifecycleMatrixMarkdown(
    report: ReturnType<
      typeof buildLearningLocalDemoAuthRefreshLifecycleMatrixReport
    >,
  ) {
    return toLearningLocalDemoAuthRefreshLifecycleMatrixMarkdown(report);
  }

  buildAuthPersistenceSecurityGateMatrixReport(
    generatedAt = new Date().toISOString(),
  ) {
    return buildLearningLocalDemoAuthPersistenceSecurityGateMatrixReport(
      generatedAt,
    );
  }

  toAuthPersistenceSecurityGateMatrixMarkdown(
    report: ReturnType<
      typeof buildLearningLocalDemoAuthPersistenceSecurityGateMatrixReport
    >,
  ) {
    return toLearningLocalDemoAuthPersistenceSecurityGateMatrixMarkdown(report);
  }

  buildAuthSessionRepositoryContractMatrixReport(
    generatedAt = new Date().toISOString(),
  ) {
    return buildLearningLocalDemoAuthSessionRepositoryContractMatrixReport(
      generatedAt,
    );
  }

  toAuthSessionRepositoryContractMatrixMarkdown(
    report: ReturnType<
      typeof buildLearningLocalDemoAuthSessionRepositoryContractMatrixReport
    >,
  ) {
    return toLearningLocalDemoAuthSessionRepositoryContractMatrixMarkdown(
      report,
    );
  }

  buildProductionRuntimeGateMatrixReport(
    generatedAt = new Date().toISOString(),
  ) {
    return buildLearningProductionRuntimeGateMatrixReport(generatedAt);
  }

  buildUploadStorageHardeningMatrixReport(
    generatedAt = new Date().toISOString(),
  ) {
    return buildLearningUploadStorageHardeningMatrixReport(generatedAt);
  }

  buildReleaseCandidateGoLiveGateReport(
    generatedAt = new Date().toISOString(),
    stagingRehearsalEvidence?: LearningStagingRehearsalEvidence,
  ) {
    return buildLearningReleaseCandidateGoLiveGateReport(
      generatedAt,
      stagingRehearsalEvidence,
    );
  }

  toReleaseCandidateGoLiveGateMarkdown(
    report: ReturnType<typeof buildLearningReleaseCandidateGoLiveGateReport>,
  ) {
    return toLearningReleaseCandidateGoLiveGateMarkdown(report);
  }

  buildPrismaAuthSessionStoreMatrixReport(
    generatedAt = new Date().toISOString(),
  ) {
    return buildPrismaAuthSessionStoreMatrixReport(generatedAt);
  }

  toPrismaAuthSessionStoreMatrixMarkdown(
    report: ReturnType<typeof buildPrismaAuthSessionStoreMatrixReport>,
  ) {
    return toPrismaAuthSessionStoreMatrixMarkdown(report);
  }

  buildAuthOperationalControlMatrixReport(
    generatedAt = new Date().toISOString(),
  ) {
    return buildAuthOperationalControlMatrixReport(generatedAt);
  }

  toAuthOperationalControlMatrixMarkdown(
    report: ReturnType<typeof buildAuthOperationalControlMatrixReport>,
  ) {
    return toAuthOperationalControlMatrixMarkdown(report);
  }

  buildAuthOperationalAlertPolicyMatrixReport(
    generatedAt = new Date().toISOString(),
  ) {
    return buildAuthOperationalAlertPolicyMatrixReport(generatedAt);
  }

  toAuthOperationalAlertPolicyMatrixMarkdown(
    report: ReturnType<typeof buildAuthOperationalAlertPolicyMatrixReport>,
  ) {
    return toAuthOperationalAlertPolicyMatrixMarkdown(report);
  }

  toProductionRuntimeGateMatrixMarkdown(
    report: ReturnType<typeof buildLearningProductionRuntimeGateMatrixReport>,
  ) {
    return toLearningProductionRuntimeGateMatrixMarkdown(report);
  }

  toUploadStorageHardeningMatrixMarkdown(
    report: ReturnType<typeof buildLearningUploadStorageHardeningMatrixReport>,
  ) {
    return toLearningUploadStorageHardeningMatrixMarkdown(report);
  }

  buildStudentCourseEnrollmentSubscriptionReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningCoreReport {
    return buildStudentCourseEnrollmentSubscriptionReport(fixture, generatedAt);
  }

  buildStudentCourseEnrollmentSubscriptionFlowReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningStudentCourseEnrollmentSubscriptionFlowReport {
    return buildStudentCourseEnrollmentSubscriptionFlowReport(
      fixture,
      generatedAt,
    );
  }

  buildSubscriptionEntitlementDailyPlanAccessReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = '2026-06-30T12:30:00.000Z',
  ): DemoLearningSubscriptionEntitlementDailyPlanAccessReport {
    return buildSubscriptionEntitlementDailyPlanAccessReport(
      fixture,
      generatedAt,
    );
  }

  buildParentTeacherProgressAccessSummaryReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = '2026-06-30T13:00:00.000Z',
  ): DemoLearningParentTeacherProgressAccessSummaryReport {
    return buildParentTeacherProgressAccessSummaryReport(fixture, generatedAt);
  }

  buildParentTeacherReportPermissionPrivacyRedactionReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentTeacherReportPermissionPrivacyRedactionReport {
    return buildParentTeacherReportPermissionPrivacyRedactionReport(
      fixture,
      generatedAt,
    );
  }

  buildParentTeacherReportReviewQueueMessagePreviewReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentTeacherReportReviewQueueMessagePreviewReport {
    return buildParentTeacherReportReviewQueueMessagePreviewReport(
      fixture,
      generatedAt,
    );
  }

  buildParentPortalApprovedReportInboxReadReceiptReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentPortalApprovedReportInboxReadReceiptReport {
    return buildParentPortalApprovedReportInboxReadReceiptReport(
      fixture,
      generatedAt,
    );
  }

  buildClassSessionAttendanceProgressReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningClassSessionAttendanceProgressReport {
    return buildClassSessionAttendanceProgressReport(fixture, generatedAt);
  }

  buildLessonAssignmentAssessmentProgressReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningLessonAssignmentAssessmentProgressReport {
    return buildLessonAssignmentAssessmentProgressReport(fixture, generatedAt);
  }

  buildLearningPathDailyPlanVideoPracticeEvidenceReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningPathDailyPlanVideoPracticeEvidenceReport {
    return buildLearningPathDailyPlanVideoPracticeEvidenceReport(
      fixture,
      generatedAt,
    );
  }

  buildParentTeacherProgressAlertInterventionReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentTeacherProgressAlertInterventionReport {
    return buildParentTeacherProgressAlertInterventionReport(
      fixture,
      generatedAt,
    );
  }

  buildParentScreenTimeGuardianControlsReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentScreenTimeGuardianControlsReport {
    return buildParentScreenTimeGuardianControlsReport(fixture, generatedAt);
  }

  buildParentScreenTimeGrantDailyPlanGuardReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentScreenTimeGrantDailyPlanGuardReport {
    return buildParentScreenTimeGrantDailyPlanGuardReport(fixture, generatedAt);
  }

  buildLearningSessionCompletionPracticeProgressRollupReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningSessionCompletionPracticeProgressRollupReport {
    return buildLearningSessionCompletionPracticeProgressRollupReport(
      fixture,
      generatedAt,
    );
  }

  buildTeacherInterventionRemedialAssignmentSupportPlanReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport {
    return buildTeacherInterventionRemedialAssignmentSupportPlanReport(
      fixture,
      generatedAt,
    );
  }

  buildRemedialRetryCompletionSupportOutcomeFollowupReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport {
    return buildRemedialRetryCompletionSupportOutcomeFollowupReport(
      fixture,
      generatedAt,
    );
  }

  buildRemedialRetryUnresolvedSupportEscalationReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningRemedialRetryUnresolvedSupportEscalationReport {
    return buildRemedialRetryUnresolvedSupportEscalationReport(
      fixture,
      generatedAt,
    );
  }

  buildTeacherEscalationFollowupResolutionReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningTeacherEscalationFollowupResolutionReport {
    return buildTeacherEscalationFollowupResolutionReport(fixture, generatedAt);
  }

  buildMvpEndToEndReadinessTraceReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningMvpEndToEndReadinessTraceReport {
    return buildMvpEndToEndReadinessTraceReport(fixture, generatedAt);
  }

  buildMvpRoleJourneyEntrypointsReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningMvpRoleJourneyEntrypointsReport {
    return buildMvpRoleJourneyEntrypointsReport(fixture, generatedAt);
  }

  buildTeacherContentLibraryLearningPathPublishReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningTeacherContentLibraryLearningPathPublishReport {
    return buildTeacherContentLibraryLearningPathPublishReport(
      fixture,
      generatedAt,
    );
  }

  buildAiTutorChatSafetyTeacherReviewReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningAiTutorChatSafetyTeacherReviewReport {
    return buildAiTutorChatSafetyTeacherReviewReport(fixture, generatedAt);
  }

  buildStudentAchievementBadgeCertificateReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningStudentAchievementBadgeCertificateReport {
    return buildStudentAchievementBadgeCertificateReport(fixture, generatedAt);
  }

  buildParentTeacherWeeklyDigestReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentTeacherWeeklyDigestReport {
    return buildParentTeacherWeeklyDigestReport(fixture, generatedAt);
  }

  buildFollowUpActionOutcomeReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningFollowUpActionOutcomeReport {
    return buildFollowUpActionOutcomeReport(fixture, generatedAt);
  }

  buildMvpReadinessOverviewReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningMvpReadinessOverviewReport {
    return buildMvpReadinessOverviewReport(fixture, generatedAt);
  }

  buildAcceptanceTraceabilityGateReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningAcceptanceTraceabilityGateReport {
    return buildAcceptanceTraceabilityGateReport(fixture, generatedAt);
  }

  toLearningCoreMarkdown(report: DemoLearningCoreReport) {
    return toLearningCoreMarkdown(report);
  }

  toStudentCourseEnrollmentSubscriptionFlowMarkdown(
    report: DemoLearningStudentCourseEnrollmentSubscriptionFlowReport,
  ) {
    return toStudentCourseEnrollmentSubscriptionFlowMarkdown(report);
  }

  toSubscriptionEntitlementDailyPlanAccessMarkdown(
    report: DemoLearningSubscriptionEntitlementDailyPlanAccessReport,
  ) {
    return toSubscriptionEntitlementDailyPlanAccessMarkdown(report);
  }

  toParentTeacherProgressAccessSummaryMarkdown(
    report: DemoLearningParentTeacherProgressAccessSummaryReport,
  ) {
    return toParentTeacherProgressAccessSummaryMarkdown(report);
  }

  toParentTeacherReportPermissionPrivacyRedactionMarkdown(
    report: DemoLearningParentTeacherReportPermissionPrivacyRedactionReport,
  ) {
    return toParentTeacherReportPermissionPrivacyRedactionMarkdown(report);
  }

  toParentTeacherReportReviewQueueMessagePreviewMarkdown(
    report: DemoLearningParentTeacherReportReviewQueueMessagePreviewReport,
  ) {
    return toParentTeacherReportReviewQueueMessagePreviewMarkdown(report);
  }

  toParentPortalApprovedReportInboxReadReceiptMarkdown(
    report: DemoLearningParentPortalApprovedReportInboxReadReceiptReport,
  ) {
    return toParentPortalApprovedReportInboxReadReceiptMarkdown(report);
  }

  toClassSessionAttendanceProgressMarkdown(
    report: DemoLearningClassSessionAttendanceProgressReport,
  ) {
    return toClassSessionAttendanceProgressMarkdown(report);
  }

  toLessonAssignmentAssessmentProgressMarkdown(
    report: DemoLearningLessonAssignmentAssessmentProgressReport,
  ) {
    return toLessonAssignmentAssessmentProgressMarkdown(report);
  }

  toLearningPathDailyPlanVideoPracticeEvidenceMarkdown(
    report: DemoLearningPathDailyPlanVideoPracticeEvidenceReport,
  ) {
    return toLearningPathDailyPlanVideoPracticeEvidenceMarkdown(report);
  }

  toParentTeacherProgressAlertInterventionMarkdown(
    report: DemoLearningParentTeacherProgressAlertInterventionReport,
  ) {
    return toParentTeacherProgressAlertInterventionMarkdown(report);
  }

  toParentScreenTimeGuardianControlsMarkdown(
    report: DemoLearningParentScreenTimeGuardianControlsReport,
  ) {
    return toParentScreenTimeGuardianControlsMarkdown(report);
  }

  toParentScreenTimeGrantDailyPlanGuardMarkdown(
    report: DemoLearningParentScreenTimeGrantDailyPlanGuardReport,
  ) {
    return toParentScreenTimeGrantDailyPlanGuardMarkdown(report);
  }

  toLearningSessionCompletionPracticeProgressRollupMarkdown(
    report: DemoLearningSessionCompletionPracticeProgressRollupReport,
  ) {
    return toLearningSessionCompletionPracticeProgressRollupMarkdown(report);
  }

  toTeacherInterventionRemedialAssignmentSupportPlanMarkdown(
    report: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport,
  ) {
    return toTeacherInterventionRemedialAssignmentSupportPlanMarkdown(report);
  }

  toTeacherContentLibraryLearningPathPublishMarkdown(
    report: DemoLearningTeacherContentLibraryLearningPathPublishReport,
  ) {
    return toTeacherContentLibraryLearningPathPublishMarkdown(report);
  }

  toAiTutorChatSafetyTeacherReviewMarkdown(
    report: DemoLearningAiTutorChatSafetyTeacherReviewReport,
  ) {
    return toAiTutorChatSafetyTeacherReviewMarkdown(report);
  }

  toStudentAchievementBadgeCertificateMarkdown(
    report: DemoLearningStudentAchievementBadgeCertificateReport,
  ) {
    return toStudentAchievementBadgeCertificateMarkdown(report);
  }

  toParentTeacherWeeklyDigestMarkdown(
    report: DemoLearningParentTeacherWeeklyDigestReport,
  ) {
    return toParentTeacherWeeklyDigestMarkdown(report);
  }

  toFollowUpActionOutcomeMarkdown(
    report: DemoLearningFollowUpActionOutcomeReport,
  ) {
    return toFollowUpActionOutcomeMarkdown(report);
  }

  toRemedialRetryCompletionSupportOutcomeFollowupMarkdown(
    report: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport,
  ) {
    return toRemedialRetryCompletionSupportOutcomeFollowupMarkdown(report);
  }

  toRemedialRetryUnresolvedSupportEscalationMarkdown(
    report: DemoLearningRemedialRetryUnresolvedSupportEscalationReport,
  ) {
    return toRemedialRetryUnresolvedSupportEscalationMarkdown(report);
  }

  toTeacherEscalationFollowupResolutionMarkdown(
    report: DemoLearningTeacherEscalationFollowupResolutionReport,
  ) {
    return toTeacherEscalationFollowupResolutionMarkdown(report);
  }

  toMvpEndToEndReadinessTraceMarkdown(
    report: DemoLearningMvpEndToEndReadinessTraceReport,
  ) {
    return toMvpEndToEndReadinessTraceMarkdown(report);
  }

  toMvpRoleJourneyEntrypointsMarkdown(
    report: DemoLearningMvpRoleJourneyEntrypointsReport,
  ) {
    return toMvpRoleJourneyEntrypointsMarkdown(report);
  }

  toMvpReadinessOverviewMarkdown(
    report: DemoLearningMvpReadinessOverviewReport,
  ) {
    return toMvpReadinessOverviewMarkdown(report);
  }

  toAcceptanceTraceabilityGateMarkdown(
    report: DemoLearningAcceptanceTraceabilityGateReport,
  ) {
    return toAcceptanceTraceabilityGateMarkdown(report);
  }
}
