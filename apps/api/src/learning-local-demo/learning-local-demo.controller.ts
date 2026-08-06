import { Controller, Get, UseGuards } from '@nestjs/common';
import { LocalDemoOnlyGuard } from '../runtime-safety/local-demo-only.guard';
import { LearningLocalDemoService } from './learning-local-demo.service';

@Controller('learning-local-demo')
@UseGuards(LocalDemoOnlyGuard)
export class LearningLocalDemoController {
  constructor(
    private readonly learningLocalDemoService: LearningLocalDemoService,
  ) {}

  @Get('student-course-enrollment-subscription-report')
  getStudentCourseEnrollmentSubscriptionReport() {
    return this.learningLocalDemoService.buildStudentCourseEnrollmentSubscriptionReport();
  }

  @Get('student-course-enrollment-subscription-flow-report')
  getStudentCourseEnrollmentSubscriptionFlowReport() {
    return this.learningLocalDemoService.buildStudentCourseEnrollmentSubscriptionFlowReport();
  }

  @Get('subscription-entitlement-daily-plan-access-report')
  getSubscriptionEntitlementDailyPlanAccessReport() {
    return this.learningLocalDemoService.buildSubscriptionEntitlementDailyPlanAccessReport();
  }

  @Get('parent-teacher-progress-access-summary-report')
  getParentTeacherProgressAccessSummaryReport() {
    return this.learningLocalDemoService.buildParentTeacherProgressAccessSummaryReport();
  }

  @Get('parent-teacher-report-permission-privacy-redaction-report')
  getParentTeacherReportPermissionPrivacyRedactionReport() {
    return this.learningLocalDemoService.buildParentTeacherReportPermissionPrivacyRedactionReport();
  }

  @Get('parent-teacher-report-review-queue-message-preview-report')
  getParentTeacherReportReviewQueueMessagePreviewReport() {
    return this.learningLocalDemoService.buildParentTeacherReportReviewQueueMessagePreviewReport();
  }

  @Get('parent-portal-approved-report-inbox-read-receipt-report')
  getParentPortalApprovedReportInboxReadReceiptReport() {
    return this.learningLocalDemoService.buildParentPortalApprovedReportInboxReadReceiptReport();
  }

  @Get('auth-session-smoke-matrix-report')
  getAuthSessionSmokeMatrixReport() {
    return this.learningLocalDemoService.buildAuthSessionSmokeMatrixReport();
  }

  @Get('auth-refresh-lifecycle-matrix-report')
  getAuthRefreshLifecycleMatrixReport() {
    return this.learningLocalDemoService.buildAuthRefreshLifecycleMatrixReport();
  }

  @Get('auth-persistence-security-gate-matrix-report')
  getAuthPersistenceSecurityGateMatrixReport() {
    return this.learningLocalDemoService.buildAuthPersistenceSecurityGateMatrixReport();
  }

  @Get('auth-session-repository-contract-matrix-report')
  getAuthSessionRepositoryContractMatrixReport() {
    return this.learningLocalDemoService.buildAuthSessionRepositoryContractMatrixReport();
  }

  @Get('production-runtime-gate-matrix-report')
  getProductionRuntimeGateMatrixReport() {
    return this.learningLocalDemoService.buildProductionRuntimeGateMatrixReport();
  }

  @Get('upload-storage-hardening-matrix-report')
  getUploadStorageHardeningMatrixReport() {
    return this.learningLocalDemoService.buildUploadStorageHardeningMatrixReport();
  }

  @Get('release-candidate-go-live-gate-matrix-report')
  getReleaseCandidateGoLiveGateMatrixReport() {
    return this.learningLocalDemoService.buildReleaseCandidateGoLiveGateReport();
  }

  @Get('prisma-auth-session-store-matrix-report')
  getPrismaAuthSessionStoreMatrixReport() {
    return this.learningLocalDemoService.buildPrismaAuthSessionStoreMatrixReport();
  }

  @Get('auth-operational-control-matrix-report')
  getAuthOperationalControlMatrixReport() {
    return this.learningLocalDemoService.buildAuthOperationalControlMatrixReport();
  }

  @Get('auth-operational-alert-policy-matrix-report')
  getAuthOperationalAlertPolicyMatrixReport() {
    return this.learningLocalDemoService.buildAuthOperationalAlertPolicyMatrixReport();
  }

  @Get('class-session-attendance-progress-report')
  getClassSessionAttendanceProgressReport() {
    return this.learningLocalDemoService.buildClassSessionAttendanceProgressReport();
  }

  @Get('lesson-assignment-assessment-progress-report')
  getLessonAssignmentAssessmentProgressReport() {
    return this.learningLocalDemoService.buildLessonAssignmentAssessmentProgressReport();
  }

  @Get('learning-path-daily-plan-video-practice-evidence-report')
  getLearningPathDailyPlanVideoPracticeEvidenceReport() {
    return this.learningLocalDemoService.buildLearningPathDailyPlanVideoPracticeEvidenceReport();
  }

  @Get('parent-teacher-progress-alert-intervention-report')
  getParentTeacherProgressAlertInterventionReport() {
    return this.learningLocalDemoService.buildParentTeacherProgressAlertInterventionReport();
  }

  @Get('parent-screen-time-guardian-controls-report')
  getParentScreenTimeGuardianControlsReport() {
    return this.learningLocalDemoService.buildParentScreenTimeGuardianControlsReport();
  }

  @Get('parent-screen-time-grant-daily-plan-guard-report')
  getParentScreenTimeGrantDailyPlanGuardReport() {
    return this.learningLocalDemoService.buildParentScreenTimeGrantDailyPlanGuardReport();
  }

  @Get('learning-session-completion-practice-progress-rollup-report')
  getLearningSessionCompletionPracticeProgressRollupReport() {
    return this.learningLocalDemoService.buildLearningSessionCompletionPracticeProgressRollupReport();
  }

  @Get('teacher-intervention-remedial-assignment-support-plan-report')
  getTeacherInterventionRemedialAssignmentSupportPlanReport() {
    return this.learningLocalDemoService.buildTeacherInterventionRemedialAssignmentSupportPlanReport();
  }

  @Get('remedial-retry-completion-support-outcome-followup-summary-report')
  getRemedialRetryCompletionSupportOutcomeFollowupReport() {
    return this.learningLocalDemoService.buildRemedialRetryCompletionSupportOutcomeFollowupReport();
  }

  @Get('remedial-retry-unresolved-support-escalation-report')
  getRemedialRetryUnresolvedSupportEscalationReport() {
    return this.learningLocalDemoService.buildRemedialRetryUnresolvedSupportEscalationReport();
  }

  @Get('teacher-escalation-followup-resolution-report')
  getTeacherEscalationFollowupResolutionReport() {
    return this.learningLocalDemoService.buildTeacherEscalationFollowupResolutionReport();
  }

  @Get('mvp-end-to-end-readiness-trace-report')
  getMvpEndToEndReadinessTraceReport() {
    return this.learningLocalDemoService.buildMvpEndToEndReadinessTraceReport();
  }

  @Get('mvp-role-journey-entrypoints-report')
  getMvpRoleJourneyEntrypointsReport() {
    return this.learningLocalDemoService.buildMvpRoleJourneyEntrypointsReport();
  }

  @Get('teacher-content-library-learning-path-publish-report')
  getTeacherContentLibraryLearningPathPublishReport() {
    return this.learningLocalDemoService.buildTeacherContentLibraryLearningPathPublishReport();
  }

  @Get('ai-tutor-chat-safety-teacher-review-report')
  getAiTutorChatSafetyTeacherReviewReport() {
    return this.learningLocalDemoService.buildAiTutorChatSafetyTeacherReviewReport();
  }

  @Get('student-achievement-badge-certificate-report')
  getStudentAchievementBadgeCertificateReport() {
    return this.learningLocalDemoService.buildStudentAchievementBadgeCertificateReport();
  }

  @Get('parent-teacher-weekly-digest-report')
  getParentTeacherWeeklyDigestReport() {
    return this.learningLocalDemoService.buildParentTeacherWeeklyDigestReport();
  }

  @Get('followup-action-outcome-report')
  getFollowUpActionOutcomeReport() {
    return this.learningLocalDemoService.buildFollowUpActionOutcomeReport();
  }

  @Get('mvp-readiness-overview-report')
  getMvpReadinessOverviewReport() {
    return this.learningLocalDemoService.buildMvpReadinessOverviewReport();
  }

  @Get('acceptance-traceability-gate-report')
  getAcceptanceTraceabilityGateReport() {
    return this.learningLocalDemoService.buildAcceptanceTraceabilityGateReport();
  }
}
