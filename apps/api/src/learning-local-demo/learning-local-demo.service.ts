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
  DemoLearningAcceptanceTraceabilityGateRow,
  DemoLearningAcceptanceTraceabilityGateStatus,
  DemoLearningAdjustedSupportRetryCompletionRow,
  DemoLearningAdjustedSupportRetryCompletionStatus,
  DemoLearningAchievementRecord,
  DemoLearningAchievementRecordRow,
  DemoLearningBadgeAward,
  DemoLearningBadgeAwardRow,
  DemoLearningCertificateFixture,
  DemoLearningCertificateFixtureRow,
  DemoLearningAiTutorChatMessageRow,
  DemoLearningAiTutorChatSafetyTeacherReviewReport,
  DemoLearningAiTutorChatSafetyTeacherReviewStatusCounts,
  DemoLearningAiTutorSupportRecommendation,
  DemoLearningAiTutorChatSession,
  DemoLearningAiTutorChatSessionRow,
  DemoLearningAiTutorParentSummaryRow,
  DemoLearningAiTutorSafetyFlag,
  DemoLearningAiTutorSafetyFlagRow,
  DemoLearningAiTutorSupportRecommendationRow,
  DemoLearningAiTutorTeacherReviewQueueRow,
  DemoLearningAttendanceRecord,
  DemoLearningAttendanceStatus,
  DemoLearningAssignment,
  DemoLearningAssignmentAssessmentRow,
  DemoLearningAssessmentBand,
  DemoLearningClassAggregateRow,
  DemoLearningClassCohort,
  DemoLearningClassSessionAttendanceProgressReport,
  DemoLearningClassSessionStatusCounts,
  DemoLearningCommission,
  DemoLearningCommissionStatus,
  DemoLearningContentClassAssignment,
  DemoLearningContentLibraryItem,
  DemoLearningContentOwner,
  DemoLearningCoreFixture,
  DemoLearningCoreReport,
  DemoLearningCourse,
  DemoLearningCourseAggregateRow,
  DemoLearningDailyPlan,
  DemoLearningDailyPlanEvidenceRow,
  DemoLearningDailyPlanStatus,
  DemoLearningEnrollment,
  DemoLearningEnrollmentReportRow,
  DemoLearningFeedbackStatus,
  DemoLearningFollowUpActionOutcomeImpact,
  DemoLearningFollowUpActionOutcomeReport,
  DemoLearningFollowUpActionOutcomeRow,
  DemoLearningFollowUpActionOutcomeStatus,
  DemoLearningFollowUpActionOutcomeStatusCounts,
  DemoLearningFollowUpActionOutcomeStudentRow,
  DemoLearningLearnerAssessmentRow,
  DemoLearningLearnerProgressRow,
  DemoLearningPath,
  DemoLearningPathDailyPlanVideoPracticeEvidenceReport,
  DemoLearningPathDailyPlanVideoPracticeStatusCounts,
  DemoLearningPathEvidenceRow,
  DemoLearningPathLearnerBand,
  DemoLearningPathStatus,
  DemoLearningPracticeAttempt,
  DemoLearningPracticeAttemptStatus,
  DemoLearningMilestone,
  DemoLearningMilestoneRow,
  DemoLearningMvpReadinessOverviewReport,
  DemoLearningMvpReadinessOverviewRow,
  DemoLearningMvpReadinessOverviewSliceKey,
  DemoLearningMvpReadinessOverviewStatus,
  DemoLearningMvpEndToEndReadinessTraceEvidenceRow,
  DemoLearningMvpEndToEndReadinessTraceReport,
  DemoLearningMvpEndToEndReadinessTraceRow,
  DemoLearningMvpEndToEndReadinessTraceSafety,
  DemoLearningMvpEndToEndReadinessTraceStatusCounts,
  DemoLearningMvpRoleJourneyEntrypointOwner,
  DemoLearningMvpRoleJourneyEntrypointRole,
  DemoLearningMvpRoleJourneyEntrypointRow,
  DemoLearningMvpRoleJourneyEntrypointStatus,
  DemoLearningMvpRoleJourneyEntrypointsEvidenceRow,
  DemoLearningMvpRoleJourneyEntrypointsReport,
  DemoLearningMvpRoleJourneyEntrypointsSafety,
  DemoLearningMvpRoleJourneyEntrypointsStatusCounts,
  DemoLearningMvpRoleJourneyTraceRow,
  DemoLearningRecognitionSummaryRow,
  DemoLearningLesson,
  DemoLearningLessonAssignmentAssessmentProgressReport,
  DemoLearningLessonAssignmentAssessmentStatusCounts,
  DemoLearningLessonAssessmentRow,
  DemoLearningPayment,
  DemoLearningParentTeacherAlertReasonSummaryRow,
  DemoLearningParentTeacherLearnerSummaryRow,
  DemoLearningParentTeacherProgressAlertInterventionReport,
  DemoLearningParentTeacherProgressAlertRow,
  DemoLearningParentTeacherProgressAlertStatusCounts,
  DemoLearningParentGuardian,
  DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
  DemoLearningParentScreenTimeChildControlsRow,
  DemoLearningParentScreenTimeGateRow,
  DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow,
  DemoLearningParentScreenTimeGrantDailyPlanGuardEvidenceRow,
  DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow,
  DemoLearningParentScreenTimeGrantDailyPlanGuardReport,
  DemoLearningParentScreenTimeGrantDailyPlanGuardSafety,
  DemoLearningParentScreenTimeGrantDailyPlanGuardSessionEvidenceRow,
  DemoLearningParentScreenTimeGrantDailyPlanGuardStatusCounts,
  DemoLearningParentScreenTimeGrantRow,
  DemoLearningParentScreenTimeGuardianControlsReport,
  DemoLearningParentScreenTimeGuardianControlsStatusCounts,
  DemoLearningSessionCompletionPracticeProgressEvidenceRow,
  DemoLearningSessionCompletionPracticeProgressParentSummaryRow,
  DemoLearningSessionCompletionPracticeProgressRollupReport,
  DemoLearningSessionCompletionPracticeProgressRollupRow,
  DemoLearningSessionCompletionPracticeProgressRollupSafety,
  DemoLearningSessionCompletionPracticeProgressRollupStatus,
  DemoLearningSessionCompletionPracticeProgressRollupStatusCounts,
  DemoLearningSessionCompletionPracticeProgressTeacherSummaryRow,
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanEvidenceRow,
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport,
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety,
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanStatusCounts,
  DemoLearningTeacherInterventionReviewRow,
  DemoLearningParentVisibleSupportSummaryRow,
  DemoLearningRemedialAssignmentRow,
  DemoLearningSupportPlanRow,
  DemoLearningTeacherVisibleNextActionRow,
  DemoLearningParentPortalApprovedReportInboxReadReceiptEvidenceRow,
  DemoLearningParentPortalApprovedReportInboxReadReceiptReport,
  DemoLearningParentPortalApprovedReportInboxReadReceiptSafety,
  DemoLearningParentPortalApprovedReportInboxRow,
  DemoLearningParentPortalApprovedReportReadAckRow,
  DemoLearningParentTeacherProgressAccessEvidenceRow,
  DemoLearningParentTeacherProgressAccessRow,
  DemoLearningParentTeacherProgressAccessSummaryReport,
  DemoLearningParentTeacherProgressAccessSummarySafety,
  DemoLearningParentTeacherProgressParentSummaryRow,
  DemoLearningParentTeacherProgressTeacherSummaryRow,
  DemoLearningParentTeacherReportFieldVisibilityRow,
  DemoLearningParentTeacherReportMessagePreviewRow,
  DemoLearningParentTeacherReportPermissionRedactionReferenceRow,
  DemoLearningParentTeacherReportPermissionCaseRow,
  DemoLearningParentTeacherReportPermissionPrivacyRedactionEvidenceRow,
  DemoLearningParentTeacherReportPermissionPrivacyRedactionReport,
  DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety,
  DemoLearningParentTeacherReportReviewQueueMessagePreviewEvidenceRow,
  DemoLearningParentTeacherReportReviewQueueMessagePreviewReport,
  DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety,
  DemoLearningParentTeacherReportReviewQueueRow,
  DemoLearningParentTeacherReportReviewSummaryRow,
  DemoLearningParentTeacherWeeklyDigestActionRow,
  DemoLearningParentTeacherWeeklyDigestReport,
  DemoLearningParentTeacherWeeklyDigestRow,
  DemoLearningParentTeacherWeeklyDigestStatusCounts,
  DemoLearningParentTeacherWeeklyDigestStudentRow,
  DemoLearningRefund,
  DemoLearningResolvedSupportOutcomeEvidenceRow,
  DemoLearningResolvedSupportOutcomeReasonCode,
  DemoLearningResolvedSupportOutcomeStatus,
  DemoLearningScreenTimeGrantRequest,
  DemoLearningScreenTimePolicy,
  DemoLearningSession,
  DemoLearningSessionGate,
  DemoLearningSessionReportRow,
  DemoLearningStatusCounts,
  DemoLearningStudent,
  DemoLearningStudentCourseEnrollmentSubscriptionFlowEvidenceRow,
  DemoLearningStudentCourseEnrollmentSubscriptionFlowRelationshipRow,
  DemoLearningStudentCourseEnrollmentSubscriptionFlowReport,
  DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety,
  DemoLearningSubscriptionEntitlementDailyPlanAccessEvidenceRow,
  DemoLearningSubscriptionEntitlementDailyPlanAccessReport,
  DemoLearningSubscriptionEntitlementDailyPlanAccessRow,
  DemoLearningSubscriptionEntitlementDailyPlanAccessSafety,
  DemoLearningSubscriptionEntitlementDailyPlanAccessStatus,
  DemoLearningSubscriptionEntitlementLifecycleRow,
  DemoLearningStudentAchievementBadgeCertificateReport,
  DemoLearningStudentAchievementBadgeCertificateStatusCounts,
  DemoLearningStudentAchievementSummaryRow,
  DemoLearningSubmission,
  DemoLearningSubmissionStatus,
  DemoLearningSubscription,
  DemoLearningTeacherContentClassAssignmentRow,
  DemoLearningTeacherContentLibraryItemRow,
  DemoLearningTeacherContentLibraryLearningPathPublishReport,
  DemoLearningTeacherContentLibraryStatusCounts,
  DemoLearningTeacherContentParentSummaryRow,
  DemoLearningTeacherContentStudentVisibilityRow,
  DemoLearningProgressAlertFollowUpStatus,
  DemoLearningProgressAlertReason,
  DemoLearningProgressAlertSeverity,
  DemoLearningProgressRecord,
  DemoLearningParentVisibleEscalationSummaryRow,
  DemoLearningParentVisibleClosureSummaryRow,
  DemoLearningParentVisibleFollowupSummaryRow,
  DemoLearningVideoEvidence,
  DemoLearningVideoEvidenceStatus,
  DemoLearningRemedialRetryCompletionRow,
  DemoLearningRemedialRetryCompletionStatus,
  DemoLearningRemedialRetryCompletionSupportOutcomeFollowupEvidenceRow,
  DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport,
  DemoLearningRemedialRetryCompletionSupportOutcomeFollowupSafety,
  DemoLearningRemedialRetryCompletionSupportOutcomeFollowupStatusCounts,
  DemoLearningRemedialRetryUnresolvedAttemptRow,
  DemoLearningRemedialRetryUnresolvedAttemptStatus,
  DemoLearningRemedialRetryUnresolvedSupportEscalationEvidenceRow,
  DemoLearningRemedialRetryUnresolvedSupportEscalationReport,
  DemoLearningRemedialRetryUnresolvedSupportEscalationSafety,
  DemoLearningRemedialRetryUnresolvedSupportEscalationStatusCounts,
  DemoLearningWeeklyDigest,
  DemoLearningWeeklyDigestActionOwner,
  DemoLearningWeeklyDigestActionPriority,
  DemoLearningWeeklyDigestActionStatus,
  DemoLearningWeeklyDigestAudience,
  DemoLearningWeeklyDigestDeliveryStatus,
  DemoLearningSupportOutcomeEvidenceRow,
  DemoLearningSupportOutcomeEvidenceStatus,
  DemoLearningSupportAdjustmentStatus,
  DemoLearningTeacherEscalationStatus,
  DemoLearningTeacherEscalationFollowupResolutionEvidenceRow,
  DemoLearningTeacherEscalationFollowupResolutionReport,
  DemoLearningTeacherEscalationFollowupResolutionRow,
  DemoLearningTeacherEscalationFollowupResolutionSafety,
  DemoLearningTeacherEscalationFollowupResolutionStatusCounts,
  DemoLearningTeacherEscalationSupportAdjustmentRow,
  DemoLearningTeacherReviewedEscalationRow,
  DemoLearningTeacherReviewedEscalationStatus,
  DemoLearningTeacherVisibleFollowupSummaryRow,
  DemoLearningTeacherVisibleClosureNoteRow,
  DemoLearningTeacherVisibleEscalationNextActionRow,
  DemoLearningUnresolvedSupportOutcomeEvidenceRow,
  DemoLearningUnresolvedSupportOutcomeReasonCode,
  DemoLearningUnresolvedSupportOutcomeStatus,
} from './learning-local-demo.types';

const enrollmentStatuses = ['ACTIVE', 'PENDING', 'CANCELED'] as const;
const subscriptionStatuses = [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'EXPIRED',
] as const;
const paymentStatuses = ['PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED'] as const;
const refundStatuses = ['PENDING', 'SUCCEEDED', 'FAILED'] as const;
const commissionStatuses = [
  'PENDING',
  'PAYABLE',
  'APPROVED',
  'CANCELED',
] as const;
const classStatuses = ['ACTIVE', 'COMPLETED'] as const;
const sessionStatuses = ['SCHEDULED', 'COMPLETED'] as const;
const lessonStatuses = ['PUBLISHED', 'SCHEDULED'] as const;
const assignmentStatuses = ['OPEN', 'CLOSED'] as const;
const submissionStatuses = [
  'SUBMITTED',
  'LATE',
  'MISSING',
  'RESUBMITTED',
] as const;
const feedbackStatuses = ['GIVEN', 'PENDING', 'NOT_REQUIRED'] as const;
const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;
const progressStatuses = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'NEEDS_SUPPORT',
  'COMPLETED',
  'WITHDRAWN',
] as const;
const learningPathStatuses = [
  'ACTIVE',
  'COMPLETED',
  'NEEDS_SUPPORT',
  'WITHDRAWN',
] as const;
const dailyPlanStatuses = [
  'COMPLETED',
  'IN_PROGRESS',
  'BLOCKED',
  'SKIPPED',
  'ASSIGNED',
] as const;
const videoEvidenceStatuses = ['COMPLETED', 'INCOMPLETE', 'SKIPPED'] as const;
const practiceAttemptStatuses = [
  'PASSED',
  'NEEDS_RETRY',
  'INCOMPLETE',
  'SKIPPED',
] as const;
const learningPathLearnerBands = [
  'ON_TRACK',
  'NEEDS_SUPPORT',
  'INACTIVE',
  'WITHDRAWN',
] as const;
const progressAlertSeverities = ['HIGH', 'MEDIUM'] as const;
const progressAlertReasons = [
  'MISSING_SUBMISSIONS',
  'LOW_PRACTICE_SCORE',
  'SKIPPED_VIDEO',
  'ATTENDANCE_SESSION_GAP',
  'STALLED_DAILY_PLAN',
] as const;
const progressAlertFollowUpStatuses = [
  'OPEN',
  'SCHEDULED',
  'RESOLVED',
  'MONITORING',
] as const;
const screenTimePolicyStatuses = ['ACTIVE', 'PAUSED', 'DISABLED'] as const;
const sessionGateDecisions = [
  'ALLOWED',
  'BLOCKED',
  'OVERRIDE_ALLOWED',
] as const;
const dailyPlanGuardAccessResults: readonly DemoLearningParentScreenTimeDailyPlanGuardAccessResult[] =
  ['ALLOWED_SESSION', 'BLOCKED_SESSION'];
const sessionCompletionPracticeProgressRollupStatuses: readonly DemoLearningSessionCompletionPracticeProgressRollupStatus[] =
  ['COMPLETED', 'ON_TRACK', 'NEEDS_SUPPORT', 'IN_PROGRESS'];
const teacherInterventionReviewStatuses = ['REVIEWED'] as const;
const remedialAssignmentFixtureStatuses = ['ASSIGNED'] as const;
const supportPlanFixtureStatuses = ['PARENT_VISIBLE_REVIEW_READY'] as const;
const teacherNextActionStatuses = ['SCHEDULED'] as const;
const screenTimeGrantDecisions = ['APPROVED', 'DENIED', 'PENDING'] as const;
const contentOwnerRoles = ['TEACHER', 'ADMIN'] as const;
const contentAssetKinds = ['VIDEO', 'PRACTICE', 'LESSON'] as const;
const contentPublishStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
const contentClassAssignmentStatuses = [
  'PUBLISHED',
  'BLOCKED_UNPUBLISHED',
] as const;
const contentStudentVisibilityStatuses = [
  'VISIBLE',
  'BLOCKED_UNPUBLISHED',
  'BLOCKED_ARCHIVED',
] as const;
const aiTutorChatSessionStatuses = ['ACTIVE', 'ESCALATED', 'CLOSED'] as const;
const aiTutorMessageRoles = ['STUDENT', 'AI_TUTOR'] as const;
const aiTutorGuardDecisions = ['ALLOWED', 'BLOCKED'] as const;
const aiTutorTopicCategories = [
  'LESSON_HELP',
  'PRACTICE_HINT',
  'STUDY_PLANNING',
  'PERSONAL_DATA',
  'OFF_TOPIC_GAMING',
  'ACCOUNT_ACCESS',
  'SAFETY_REDIRECT',
  'ACADEMIC_INTEGRITY',
] as const;
const aiTutorSafetySeverities = ['LOW', 'MEDIUM', 'HIGH'] as const;
const aiTutorTeacherReviewStatuses = ['OPEN', 'REVIEWED', 'RESOLVED'] as const;
const aiTutorSupportPriorities = ['LOW', 'MEDIUM', 'HIGH'] as const;
const aiTutorSupportRecommendationStatuses = [
  'RECOMMENDED',
  'MONITORING',
  'COMPLETED',
] as const;
const achievementKinds = [
  'LESSON_MASTERY',
  'PRACTICE_STREAK',
  'ASSESSMENT_SCORE',
  'SAFE_TUTOR_USE',
  'COURSE_COMPLETION',
] as const;
const badgeAwardStatuses = ['AWARDED', 'HELD_FOR_TEACHER_REVIEW'] as const;
const certificateFixtureStatuses = [
  'READY',
  'PENDING',
  'HELD_FOR_REVIEW',
] as const;
const milestoneStatuses = ['COMPLETED', 'PENDING'] as const;
const recognitionAudiences = ['PARENT', 'TEACHER'] as const;
const recognitionStatuses = [
  'PARENT_VISIBLE',
  'TEACHER_REVIEW',
  'ENCOURAGEMENT_NEEDED',
] as const;
const weeklyDigestAudiences: readonly DemoLearningWeeklyDigestAudience[] = [
  'PARENT',
  'TEACHER',
];
const weeklyDigestDeliveryStatuses = [
  'READY_TO_SEND',
  'TEACHER_REVIEW',
  'HELD_WITHDRAWN',
] as readonly DemoLearningWeeklyDigestDeliveryStatus[];
const weeklyDigestActionPriorities: readonly DemoLearningWeeklyDigestActionPriority[] =
  ['LOW', 'MEDIUM', 'HIGH'];
const weeklyDigestActionStatuses = [
  'RECOMMENDED',
  'SCHEDULED',
  'COMPLETED',
  'HELD',
] as readonly DemoLearningWeeklyDigestActionStatus[];
const weeklyDigestActionOwners: readonly DemoLearningWeeklyDigestActionOwner[] =
  ['PARENT', 'TEACHER'];
const followUpActionOutcomeStatuses: readonly DemoLearningFollowUpActionOutcomeStatus[] =
  ['COMPLETED', 'VERIFIED', 'SCHEDULED', 'MONITORING', 'HELD'];
const followUpActionOutcomeImpacts: readonly DemoLearningFollowUpActionOutcomeImpact[] =
  ['POSITIVE', 'STABLE', 'NEEDS_SUPPORT', 'NO_SEND'];
const remedialRetryCompletionStatuses: readonly DemoLearningRemedialRetryCompletionStatus[] =
  ['COMPLETED'];
const supportOutcomeEvidenceStatuses: readonly DemoLearningSupportOutcomeEvidenceStatus[] =
  ['IMPROVED'];
const remedialRetryUnresolvedAttemptStatuses: readonly DemoLearningRemedialRetryUnresolvedAttemptStatus[] =
  ['FAILED', 'INCOMPLETE'];
const unresolvedSupportOutcomeStatuses: readonly DemoLearningUnresolvedSupportOutcomeStatus[] =
  ['UNRESOLVED'];
const unresolvedSupportOutcomeReasonCodes: readonly DemoLearningUnresolvedSupportOutcomeReasonCode[] =
  ['RETRY_SCORE_BELOW_THRESHOLD', 'RETRY_INCOMPLETE'];
const teacherEscalationStatuses: readonly DemoLearningTeacherEscalationStatus[] =
  ['SCHEDULED'];
const supportAdjustmentStatuses: readonly DemoLearningSupportAdjustmentStatus[] =
  ['ADJUSTED'];
const teacherReviewedEscalationStatuses: readonly DemoLearningTeacherReviewedEscalationStatus[] =
  ['REVIEWED'];
const adjustedSupportRetryCompletionStatuses: readonly DemoLearningAdjustedSupportRetryCompletionStatus[] =
  ['COMPLETED'];
const resolvedSupportOutcomeStatuses: readonly DemoLearningResolvedSupportOutcomeStatus[] =
  ['RESOLVED'];
const resolvedSupportOutcomeReasonCodes: readonly DemoLearningResolvedSupportOutcomeReasonCode[] =
  ['ADJUSTED_RETRY_COMPLETED'];
const mvpReadinessOverviewStatuses: readonly DemoLearningMvpReadinessOverviewStatus[] =
  ['LOCAL_DEMO_READY', 'LOCAL_DEMO_READY_WITH_NOTES', 'NEEDS_LOCAL_DEMO_FIX'];
const mvpRoleJourneyEntrypointRoles: readonly DemoLearningMvpRoleJourneyEntrypointRole[] =
  ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN_OPERATOR'];
const mvpRoleJourneyEntrypointStatuses: readonly DemoLearningMvpRoleJourneyEntrypointStatus[] =
  ['LOCAL_DEMO_READY_WITH_NOTES'];
const mvpRoleJourneyEntrypointOwners: readonly DemoLearningMvpRoleJourneyEntrypointOwner[] =
  ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN_OPERATOR'];
const acceptanceTraceabilityGateStatuses: readonly DemoLearningAcceptanceTraceabilityGateStatus[] =
  ['MAPPED_LOCAL_DEMO', 'NEEDS_LOCAL_DEMO_EVIDENCE'];
const acceptanceCriteriaBySliceKey: Record<
  DemoLearningMvpReadinessOverviewSliceKey,
  {
    id: string;
    name: string;
    safetyGatesCovered: string[];
    remainingLocalDemoNote: string;
  }
> = {
  ENROLLMENT: {
    id: 'LC-AC-001',
    name: 'Students, courses, enrollments, and lifecycle states are visible in fixture evidence.',
    safetyGatesCovered: [
      'productionDbUsed=false',
      'realStudentMutationUsed=false',
      'realCourseMutationUsed=false',
      'realEnrollmentMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production enrollment creation, cancellation, and roster mutation remain out of scope.',
  },
  SUBSCRIPTION_FIXTURE: {
    id: 'LC-AC-002',
    name: 'Subscription and pending payment states are traceable without provider execution.',
    safetyGatesCovered: [
      'providerApiUsed=false',
      'paymentProviderUsed=false',
      'realPaymentMutationUsed=false',
      'realEnrollmentMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Provider-backed subscription renewal and payment capture remain out of scope.',
  },
  REFUNDS_COMMISSION_FIXTURE: {
    id: 'LC-AC-003',
    name: 'Refund and commission fixture rows reconcile to read-only revenue evidence.',
    safetyGatesCovered: [
      'paymentProviderUsed=false',
      'realRefundMutationUsed=false',
      'realCommissionMutationUsed=false',
      'realPaymentMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live refund, payout, clawback, and commission approval mutations remain out of scope.',
  },
  DAILY_PLAN: {
    id: 'LC-AC-004',
    name: 'Daily plan, video, and practice completion states are reproducible from fixtures.',
    safetyGatesCovered: [
      'realLearningPathMutationUsed=false',
      'realDailyPlanMutationUsed=false',
      'realVideoEvidenceMutationUsed=false',
      'realPracticeMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Real learner plan assignment and video/practice telemetry writes remain out of scope.',
  },
  LESSON_ASSIGNMENT: {
    id: 'LC-AC-005',
    name: 'Lessons, assignments, submissions, scores, and feedback are mapped to fixture rows.',
    safetyGatesCovered: [
      'realLessonMutationUsed=false',
      'realAssignmentMutationUsed=false',
      'realAssessmentMutationUsed=false',
      'realProgressMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Teacher grading, feedback edits, and assessment mutations remain out of scope.',
  },
  PROGRESS: {
    id: 'LC-AC-006',
    name: 'Attendance and learner progress rollups have deterministic local-demo evidence.',
    safetyGatesCovered: [
      'realClassMutationUsed=false',
      'realSessionMutationUsed=false',
      'realAttendanceMutationUsed=false',
      'realProgressMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live attendance capture and learner progress writes remain out of scope.',
  },
  SESSION_COMPLETION_PRACTICE_ROLLUP: {
    id: 'LC-AC-014',
    name: 'Allowed daily plan sessions roll up lesson completion, practice score, and parent/teacher progress summaries.',
    safetyGatesCovered: [
      'realLearningSessionGateMutationUsed=false',
      'realDailyPlanAccessMutationUsed=false',
      'realLearningSessionCompletionMutationUsed=false',
      'realVideoEvidenceMutationUsed=false',
      'realPracticeMutationUsed=false',
      'realProgressMutationUsed=false',
      'realParentProgressSummaryMutationUsed=false',
      'realTeacherProgressSummaryMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production session completion telemetry, persisted progress writes, parent delivery, and teacher workflow mutation remain out of scope.',
  },
  TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN: {
    id: 'LC-AC-015',
    name: 'Needs-support progress rollups create teacher review, remedial assignment, support plan, parent summary, and teacher next-action evidence.',
    safetyGatesCovered: [
      'realTeacherInterventionMutationUsed=false',
      'realTeacherInterventionReviewMutationUsed=false',
      'realRemedialAssignmentMutationUsed=false',
      'realSupportPlanMutationUsed=false',
      'realParentSupportSummaryMutationUsed=false',
      'realTeacherNextActionMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production teacher workflow persistence, remedial assignment writes, parent delivery, and live learning mutation remain out of scope.',
  },
  REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP: {
    id: 'LC-AC-016',
    name: 'Teacher support plans trace remedial retry completion, support outcome, and parent/teacher follow-up evidence.',
    safetyGatesCovered: [
      'realRemedialRetryCompletionMutationUsed=false',
      'realSupportOutcomeEvidenceMutationUsed=false',
      'realParentFollowupSummaryMutationUsed=false',
      'realTeacherFollowupSummaryMutationUsed=false',
      'realSupportPlanMutationUsed=false',
      'realRemedialAssignmentMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production retry completion persistence, parent delivery, teacher workflow mutation, and live learning mutation remain out of scope.',
  },
  REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION: {
    id: 'LC-AC-017',
    name: 'Incomplete remedial retries trace unresolved support outcomes, teacher escalation, support adjustment, parent escalation summary, and teacher next action evidence.',
    safetyGatesCovered: [
      'realRemedialRetryUnresolvedAttemptMutationUsed=false',
      'realUnresolvedSupportOutcomeMutationUsed=false',
      'realTeacherEscalationMutationUsed=false',
      'realSupportAdjustmentMutationUsed=false',
      'realParentEscalationSummaryMutationUsed=false',
      'realTeacherEscalationNextActionMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production unresolved retry persistence, escalation workflow mutation, support adjustment writes, parent delivery, and live learning mutation remain out of scope.',
  },
  TEACHER_ESCALATION_FOLLOWUP_RESOLUTION: {
    id: 'LC-AC-018',
    name: 'Teacher-reviewed escalations trace adjusted retry completion, resolved support outcome, parent closure summary, and teacher closure note evidence.',
    safetyGatesCovered: [
      'realTeacherReviewedEscalationMutationUsed=false',
      'realAdjustedSupportRetryCompletionMutationUsed=false',
      'realResolvedSupportOutcomeMutationUsed=false',
      'realParentClosureSummaryMutationUsed=false',
      'realTeacherClosureNoteMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production escalation resolution persistence, adjusted retry writes, parent closure delivery, teacher workflow mutation, and live learning mutation remain out of scope.',
  },
  MVP_END_TO_END_READINESS_TRACE: {
    id: 'LC-AC-019',
    name: 'A deterministic MVP readiness trace links the core learning journey from enrollment fixture through teacher escalation resolution evidence.',
    safetyGatesCovered: [
      'productionReady=false',
      'productionDbUsed=false',
      'providerApiUsed=false',
      'paymentProviderUsed=false',
      'notificationProviderUsed=false',
      'aiProviderExecutionUsed=false',
      'realLearningMutationUsed=false',
      'realTeacherReviewedEscalationMutationUsed=false',
      'realAdjustedSupportRetryCompletionMutationUsed=false',
      'realResolvedSupportOutcomeMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'This is a read-only local-demo trace over fixture evidence; production orchestration, persistence, provider calls, notification sends, and live learner mutations remain out of scope.',
  },
  MVP_ROLE_JOURNEY_ENTRYPOINTS: {
    id: 'LC-AC-020',
    name: 'Student, parent, teacher, and admin/operator entrypoints link to the same accepted Minh/course A1 MVP journey.',
    safetyGatesCovered: [
      'productionReady=false',
      'productionDbUsed=false',
      'providerApiUsed=false',
      'notificationProviderUsed=false',
      'realLearningMutationUsed=false',
      'realTeacherInterventionMutationUsed=false',
      'realParentMessageMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Role entrypoints are local-demo dashboard/report evidence only; production navigation state, authorization persistence, parent sends, teacher workflow mutation, and live learner mutation remain out of scope.',
  },
  REPORT_REVIEW_PREVIEW: {
    id: 'LC-AC-007',
    name: 'Parent-facing report previews require teacher/admin review and permission-redaction evidence.',
    safetyGatesCovered: [
      'productionDbUsed=false',
      'aiProviderExecutionUsed=false',
      'notificationProviderUsed=false',
      'realParentMessageMutationUsed=false',
      'realLearningMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live review workflow persistence, parent message sends, and production privacy enforcement remain out of scope.',
  },
  PARENT_PORTAL_INBOX_READ_RECEIPT: {
    id: 'LC-AC-012',
    name: 'Only approved report previews appear in the parent portal inbox and fixture read/ack evidence is traceable.',
    safetyGatesCovered: [
      'productionDbUsed=false',
      'notificationProviderUsed=false',
      'realParentMessageMutationUsed=false',
      'realLearningMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production parent portal authorization, persisted inbox state, and notification delivery remain out of scope.',
  },
  PARENT_SCREEN_TIME_DAILY_PLAN_GUARD: {
    id: 'LC-AC-013',
    name: 'Parent screen-time grants and limits guard child daily plan sessions with allowed and blocked fixture evidence.',
    safetyGatesCovered: [
      'productionDbUsed=false',
      'providerApiUsed=false',
      'notificationProviderUsed=false',
      'realParentGuardianMutationUsed=false',
      'realScreenTimePolicyMutationUsed=false',
      'realLearningSessionGateMutationUsed=false',
      'realScreenTimeGrantMutationUsed=false',
      'realDailyPlanAccessMutationUsed=false',
      'realLearningMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production parent controls, persisted session gates, grant mutation, and daily plan access writes remain out of scope.',
  },
  AI_TUTOR_EVIDENCE: {
    id: 'LC-AC-008',
    name: 'AI tutor guardrails, reviews, parent summaries, and support recommendations are fixture-only.',
    safetyGatesCovered: [
      'aiProviderUsed=false',
      'aiProviderExecutionUsed=false',
      'realAiChatMutationUsed=false',
      'realAiModerationMutationUsed=false',
      'realLearningSupportMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live AI model execution and persisted AI chat mutation remain out of scope.',
  },
  ACHIEVEMENTS: {
    id: 'LC-AC-009',
    name: 'Achievements, badges, certificates, and recognition are preview evidence only.',
    safetyGatesCovered: [
      'certificateIssuerProviderUsed=false',
      'realAchievementMutationUsed=false',
      'realBadgeMutationUsed=false',
      'realCertificateMutationUsed=false',
      'realCredentialIssuanceUsed=false',
      'realRecognitionNotificationMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Credential issuance, certificate sending, and recognition notification remain out of scope.',
  },
  WEEKLY_DIGEST: {
    id: 'LC-AC-010',
    name: 'Parent and teacher weekly digest evidence is generated without notification sends.',
    safetyGatesCovered: [
      'notificationProviderUsed=false',
      'realParentSummaryMutationUsed=false',
      'realParentMessageMutationUsed=false',
      'realTeacherInterventionMutationUsed=false',
      'realWeeklyDigestNotificationMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live parent/teacher messaging and notification delivery remain out of scope.',
  },
  FOLLOW_UP_OUTCOMES: {
    id: 'LC-AC-011',
    name: 'Follow-up action outcomes link digest actions back to learning evidence without mutations.',
    safetyGatesCovered: [
      'realFollowUpActionOutcomeMutationUsed=false',
      'realParentMessageMutationUsed=false',
      'realTeacherInterventionMutationUsed=false',
      'notificationProviderUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Real follow-up state changes, parent sends, and teacher workflow mutations remain out of scope.',
  },
};

type ParentTeacherProgressAlertContext = {
  learningPathId: string;
  enrollmentId: string;
  student: DemoLearningStudent;
  course: DemoLearningCourse;
  classCohort: DemoLearningClassCohort;
  progress: DemoLearningProgressRecord;
  pathStatus: DemoLearningPathStatus;
  progressPercent: number;
  attendanceRatePercent: number;
  absentAttendanceCount: number;
  missingSubmissionCount: number;
  skippedVideoCount: number;
  incompleteVideoCount: number;
  blockedDailyPlanCount: number;
  skippedDailyPlanCount: number;
  incompleteDailyPlanCount: number;
  averagePracticeScorePercent: number;
};

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
    const studentsById = new Map(
      fixture.students.map((student) => [student.id, student]),
    );
    const coursesById = new Map(
      fixture.courses.map((course) => [course.id, course]),
    );
    const subscriptionsByEnrollmentId = new Map(
      fixture.subscriptions.map((subscription) => [
        subscription.enrollmentId,
        subscription,
      ]),
    );
    const paymentsBySubscriptionId = new Map(
      fixture.payments.map((payment) => [payment.subscriptionId, payment]),
    );
    const refundsByPaymentId = this.groupBy(
      fixture.refunds,
      (refund) => refund.paymentId,
    );
    const commissionsByEnrollmentId = this.groupBy(
      fixture.commissions,
      (commission) => commission.enrollmentId,
    );

    const rows = fixture.enrollments
      .map((enrollment) => {
        const student = this.requireStudent(studentsById, enrollment);
        const course = this.requireCourse(coursesById, enrollment);
        const subscription = this.requireSubscription(
          subscriptionsByEnrollmentId,
          enrollment,
        );
        const payment = this.requirePayment(
          paymentsBySubscriptionId,
          subscription,
        );
        const refunds = refundsByPaymentId.get(payment.id) ?? [];
        const commissions = commissionsByEnrollmentId.get(enrollment.id) ?? [];

        return this.buildEnrollmentRow({
          enrollment,
          student,
          course,
          subscription,
          payment,
          refunds,
          commissions,
        });
      })
      .sort((left, right) =>
        [left.courseCode, left.studentName, left.enrollmentId]
          .join('|')
          .localeCompare(
            [right.courseCode, right.studentName, right.enrollmentId].join('|'),
          ),
      );

    const statusCounts = this.buildStatusCounts(fixture);

    return {
      reportName:
        'Learning local demo Student -> Course -> Enrollment -> Subscription/Payment -> Refund/Commission Report',
      generatedFor: fixture.generatedFor,
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
        realPaymentMutationUsed: false,
        realRefundMutationUsed: false,
        realCommissionMutationUsed: false,
        realClassMutationUsed: false,
        realSessionMutationUsed: false,
        realAttendanceMutationUsed: false,
        realProgressMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      },
      totals: {
        studentCount: fixture.students.length,
        courseCount: fixture.courses.length,
        enrollmentCount: fixture.enrollments.length,
        activeEnrollmentCount: statusCounts.enrollment.ACTIVE,
        pendingEnrollmentCount: statusCounts.enrollment.PENDING,
        canceledEnrollmentCount: statusCounts.enrollment.CANCELED,
        subscriptionCount: fixture.subscriptions.length,
        activeSubscriptionCount: statusCounts.subscription.ACTIVE,
        trialingSubscriptionCount: statusCounts.subscription.TRIALING,
        canceledSubscriptionCount: statusCounts.subscription.CANCELED,
        paymentCount: fixture.payments.length,
        pendingPaymentCount: statusCounts.payment.PENDING,
        succeededPaymentCount: statusCounts.payment.SUCCEEDED,
        refundedPaymentCount: statusCounts.payment.REFUNDED,
        refundCount: fixture.refunds.length,
        succeededRefundCount: statusCounts.refund.SUCCEEDED,
        commissionCount: fixture.commissions.length,
        pendingCommissionCount: statusCounts.commission.PENDING,
        payableCommissionCount: statusCounts.commission.PAYABLE,
        approvedCommissionCount: statusCounts.commission.APPROVED,
        canceledCommissionCount: statusCounts.commission.CANCELED,
        grossPaidCents: rows.reduce((sum, row) => sum + row.grossPaidCents, 0),
        pendingPaymentCents: rows.reduce(
          (sum, row) => sum + row.pendingPaymentCents,
          0,
        ),
        refundedCents: rows.reduce((sum, row) => sum + row.refundedCents, 0),
        netRevenueCents: rows.reduce(
          (sum, row) => sum + row.netRevenueCents,
          0,
        ),
        commissionPendingCents: rows.reduce(
          (sum, row) => sum + row.commissionPendingCents,
          0,
        ),
        commissionPayableCents: rows.reduce(
          (sum, row) => sum + row.commissionPayableCents,
          0,
        ),
        commissionApprovedCents: rows.reduce(
          (sum, row) => sum + row.commissionApprovedCents,
          0,
        ),
        commissionCanceledCents: rows.reduce(
          (sum, row) => sum + row.commissionCanceledCents,
          0,
        ),
        commissionEarnedCents: rows.reduce(
          (sum, row) =>
            sum +
            row.commissionPendingCents +
            row.commissionPayableCents +
            row.commissionApprovedCents,
          0,
        ),
      },
      statusCounts,
      courseAggregates: this.buildCourseAggregates(rows),
      rows,
    };
  }

  buildStudentCourseEnrollmentSubscriptionFlowReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningStudentCourseEnrollmentSubscriptionFlowReport {
    const coreReport = this.buildStudentCourseEnrollmentSubscriptionReport(
      fixture,
      generatedAt,
    );
    const relationshipRows: DemoLearningStudentCourseEnrollmentSubscriptionFlowRelationshipRow[] =
      coreReport.rows.map((row) => ({
        relationshipKey: [
          row.studentId,
          row.courseId,
          row.enrollmentId,
          row.subscriptionId,
        ].join('->'),
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        courseId: row.courseId,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        enrollmentId: row.enrollmentId,
        enrollmentStatus: row.enrollmentStatus,
        subscriptionId: row.subscriptionId,
        subscriptionStatus: row.subscriptionStatus,
        paymentId: row.paymentId,
        paymentStatus: row.paymentStatus,
        refundIds: row.refundIds,
        commissionIds: row.commissionIds,
        fixtureOnly: true,
        mutationUsed: false,
        evidenceSummary: `${row.studentName} links ${row.courseCode} through ${row.enrollmentId}, ${row.subscriptionId}, ${row.paymentId}, ${row.refundIds.length} refund fixture, and ${row.commissionIds.length} commission fixture rows.`,
      }));
    const evidenceRows: DemoLearningStudentCourseEnrollmentSubscriptionFlowEvidenceRow[] =
      [
        {
          evidenceKind: 'STUDENT_PROFILE',
          evidenceCount: fixture.students.length,
          stableFixtureIds: fixture.students.map((student) => student.id),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Fixture student profiles use stable child profile and parent email IDs only.',
        },
        {
          evidenceKind: 'COURSE_PACKAGE',
          evidenceCount: fixture.courses.length,
          stableFixtureIds: fixture.courses.map((course) => course.id),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Fixture courses expose course code, level, package code, and package name.',
        },
        {
          evidenceKind: 'ENROLLMENT_SUBSCRIPTION',
          evidenceCount: relationshipRows.length,
          stableFixtureIds: relationshipRows.map((row) => row.relationshipKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Each enrollment row has one traceable fixture subscription and payment row.',
        },
        {
          evidenceKind: 'PAYMENT_FIXTURE',
          evidenceCount: fixture.payments.length,
          stableFixtureIds: fixture.payments.map((payment) => payment.id),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Payment evidence is fixture_manual_bank_transfer status data only.',
        },
        {
          evidenceKind: 'REFUND_FIXTURE',
          evidenceCount: fixture.refunds.length,
          stableFixtureIds: fixture.refunds.map((refund) => refund.id),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Refund evidence is a deliberate synthetic cancellation example with no real refund mutation.',
        },
        {
          evidenceKind: 'COMMISSION_FIXTURE',
          evidenceCount: fixture.commissions.length,
          stableFixtureIds: fixture.commissions.map(
            (commission) => commission.id,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Commission evidence includes pending, payable, approved, and canceled fixture rows with no payout mutation.',
        },
      ];
    const safety = {
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    } satisfies DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety;
    const remainingLocalDemoNotes = [
      'Production enrollment, subscription lifecycle, payment provider capture, refund mutation, and commission payout are out of scope.',
      'Provider refs are fixture_manual_bank_transfer identifiers only; no provider API read or mutation is executed.',
      'Dashboard and exports are read-only evidence for local-demo review.',
    ];
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
        return value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;

    return {
      reportName:
        'Learning local demo Student -> Course -> Enrollment -> Subscription/Payment fixture -> Refund/Commission fixture Flow Report',
      generatedFor:
        'local-demo-student-course-enrollment-subscription-flow-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/student-course-enrollment-subscription-flow-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#student-course-enrollment-subscription-flow',
      jsonExportPath:
        'exports/learning-local-demo-student-course-enrollment-subscription-flow-report.json',
      markdownExportPath:
        'exports/learning-local-demo-student-course-enrollment-subscription-flow-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'The local-demo spine connects fixture students, courses, enrollments, subscriptions, payment statuses, refund evidence, and commission evidence without production or provider access.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: coreReport.totals.studentCount,
        courseCount: coreReport.totals.courseCount,
        enrollmentCount: coreReport.totals.enrollmentCount,
        subscriptionCount: coreReport.totals.subscriptionCount,
        fixturePaymentEvidenceCount: coreReport.totals.paymentCount,
        refundEvidenceCount: coreReport.totals.refundCount,
        commissionEvidenceCount: coreReport.totals.commissionCount,
        relationshipTraceCount: relationshipRows.length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      relationshipRows,
      evidenceRows,
    };
  }

  buildSubscriptionEntitlementDailyPlanAccessReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = '2026-06-30T12:30:00.000Z',
  ): DemoLearningSubscriptionEntitlementDailyPlanAccessReport {
    const coreReport = this.buildStudentCourseEnrollmentSubscriptionReport(
      fixture,
      generatedAt,
    );
    const studentsById = new Map(
      fixture.students.map((student) => [student.id, student]),
    );
    const coursesById = new Map(
      fixture.courses.map((course) => [course.id, course]),
    );
    const subscriptionsByEnrollmentId = new Map(
      fixture.subscriptions.map((subscription) => [
        subscription.enrollmentId,
        subscription,
      ]),
    );
    const paymentsBySubscriptionId = new Map(
      fixture.payments.map((payment) => [payment.subscriptionId, payment]),
    );
    const refundsByPaymentId = this.groupBy(
      fixture.refunds,
      (refund) => refund.paymentId,
    );
    const learningPathsByEnrollmentId = new Map(
      fixture.learningPaths.map((path) => [path.enrollmentId, path]),
    );
    const dailyPlansByPathId = this.groupBy(
      fixture.dailyPlans,
      (plan) => plan.learningPathId,
    );

    const accessRows: DemoLearningSubscriptionEntitlementDailyPlanAccessRow[] =
      fixture.enrollments
        .map((enrollment) => {
          const student = this.requireStudent(studentsById, enrollment);
          const course = this.requireCourse(coursesById, enrollment);
          const subscription = this.requireSubscription(
            subscriptionsByEnrollmentId,
            enrollment,
          );
          const payment = this.requirePayment(
            paymentsBySubscriptionId,
            subscription,
          );
          const refunds = refundsByPaymentId.get(payment.id) ?? [];
          const learningPath = learningPathsByEnrollmentId.get(enrollment.id);
          if (!learningPath) {
            throw new Error(
              `Missing local demo learning path for enrollment ${enrollment.id}`,
            );
          }
          const accessStatus = this.buildSubscriptionEntitlementAccessStatus({
            enrollment,
            subscription,
            payment,
            refundCount: refunds.length,
            generatedAt,
          });
          const dailyPlan = this.selectDailyPlanForAccess(
            dailyPlansByPathId.get(learningPath.id) ?? [],
            accessStatus,
            learningPath.id,
          );
          const entitlementId = `entitlement-${subscription.id}`;
          const relationshipKey = [
            student.id,
            course.id,
            enrollment.id,
            subscription.id,
            entitlementId,
            dailyPlan.id,
          ].join('->');
          const blockedReason =
            this.buildSubscriptionEntitlementBlockedReason(accessStatus);
          const nextSafeActionLabel =
            this.buildSubscriptionEntitlementNextAction(accessStatus);
          const entitlementStatus: 'GRANTED' | 'BLOCKED' =
            accessStatus === 'UNLOCKED' ? 'GRANTED' : 'BLOCKED';

          return {
            relationshipKey,
            entitlementId,
            entitlementStatus,
            accessStatus,
            blockedReason,
            nextSafeActionLabel,
            studentId: student.id,
            childProfileId: student.childProfileId,
            studentName: student.displayName,
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            enrollmentId: enrollment.id,
            enrollmentStatus: enrollment.status,
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            paymentId: payment.id,
            paymentStatus: payment.status,
            refundIds: refunds.map((refund) => refund.id),
            learningPathId: learningPath.id,
            learningPathTitle: learningPath.title,
            learningPathStatus: learningPath.status,
            dailyPlanId: dailyPlan.id,
            dailyPlanTitle: dailyPlan.title,
            dailyPlanStatus: dailyPlan.status,
            planDate: dailyPlan.planDate,
            fixtureOnly: true,
            providerUsed: false,
            mutationUsed: false,
            evidenceSummary:
              accessStatus === 'UNLOCKED'
                ? `${student.displayName} has fixture entitlement ${entitlementId} and can open ${dailyPlan.id}.`
                : `${student.displayName} is blocked from ${dailyPlan.id}: ${blockedReason}.`,
          } satisfies DemoLearningSubscriptionEntitlementDailyPlanAccessRow;
        })
        .sort((left, right) =>
          [left.courseCode, left.studentName, left.dailyPlanId]
            .join('|')
            .localeCompare(
              [right.courseCode, right.studentName, right.dailyPlanId].join(
                '|',
              ),
            ),
        );

    const unlockedRows = accessRows.filter(
      (row) => row.accessStatus === 'UNLOCKED',
    );
    const blockedRows = accessRows.filter(
      (row) => row.accessStatus !== 'UNLOCKED',
    );
    const lifecycleRows =
      this.buildSubscriptionEntitlementLifecycleRows(accessRows);
    const expiredLifecycleRows = lifecycleRows.filter(
      (row) => row.lifecycleState === 'EXPIRED',
    );
    const revokedLifecycleRows = lifecycleRows.filter(
      (row) => row.lifecycleState === 'REVOKED',
    );
    const remainingLocalDemoNotes = [
      'Entitlements are derived from fixture enrollment, subscription, payment, refund, learning path, and daily plan rows only.',
      'Blocked rows explain the local-demo reason and next safe action without calling providers or mutating learning access.',
      'Lifecycle hardening rows add expired and revoked entitlement audit coverage as fixture-only snapshots over stable local-demo IDs.',
      'Production entitlement sync, subscription lifecycle, payment capture, refund mutation, and learner access writes are out of scope.',
    ];
    const safety = {
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    } satisfies DemoLearningSubscriptionEntitlementDailyPlanAccessSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
        return value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningSubscriptionEntitlementDailyPlanAccessEvidenceRow[] =
      [
        {
          evidenceKind: 'COURSE_ENTITLEMENT',
          evidenceCount: accessRows.length,
          stableFixtureIds: accessRows.map((row) => row.entitlementId),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Each entitlement is a deterministic local-demo ID derived from the fixture subscription ID.',
        },
        {
          evidenceKind: 'UNLOCKED_DAILY_PLAN_ACCESS',
          evidenceCount: unlockedRows.length,
          stableFixtureIds: unlockedRows.map((row) => row.relationshipKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Active paid fixture subscriptions unlock representative learning path and daily plan access.',
        },
        {
          evidenceKind: 'BLOCKED_DAILY_PLAN_ACCESS',
          evidenceCount: blockedRows.length,
          stableFixtureIds: blockedRows.map((row) => row.relationshipKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Non-active or refunded fixture subscriptions are blocked with explicit reasons and safe next actions.',
        },
        {
          evidenceKind: 'ENTITLEMENT_LIFECYCLE_HARDENING',
          evidenceCount: lifecycleRows.length,
          stableFixtureIds: lifecycleRows.map((row) => row.auditTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Lifecycle matrix covers active, pending payment, refunded, expired, and revoked entitlement outcomes without provider calls or access mutations.',
        },
        {
          evidenceKind: 'RELATIONSHIP_TRACE',
          evidenceCount: accessRows.length,
          stableFixtureIds: accessRows.map((row) => row.relationshipKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Relationship keys trace student -> course -> enrollment -> subscription -> entitlement -> daily plan.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: Object.entries(safety).map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'All production, provider, payment, notification, learning mutation, and ERP mutation gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Subscription Entitlement -> Daily Plan Access Gate Report',
      generatedFor:
        'local-demo-subscription-entitlement-daily-plan-access-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/subscription-entitlement-daily-plan-access-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#subscription-entitlement-daily-plan-access',
      jsonExportPath:
        'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json',
      markdownExportPath:
        'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'The local-demo access gate derives course entitlements from fixture enrollment, subscription, payment, refund, learning path, and daily plan rows.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: coreReport.totals.studentCount,
        courseCount: coreReport.totals.courseCount,
        enrollmentCount: coreReport.totals.enrollmentCount,
        subscriptionCount: coreReport.totals.subscriptionCount,
        entitlementCount: accessRows.length,
        learningPathCount: fixture.learningPaths.length,
        dailyPlanAccessCaseCount: accessRows.length,
        unlockedAccessCount: unlockedRows.length,
        blockedAccessCount: blockedRows.length,
        blockedPendingPaymentCount: accessRows.filter(
          (row) => row.accessStatus === 'BLOCKED_PENDING_PAYMENT',
        ).length,
        blockedExpiredCount:
          accessRows.filter((row) => row.accessStatus === 'BLOCKED_EXPIRED')
            .length + expiredLifecycleRows.length,
        blockedRevokedCount:
          accessRows.filter((row) => row.accessStatus === 'BLOCKED_REVOKED')
            .length + revokedLifecycleRows.length,
        blockedRefundedCount: accessRows.filter(
          (row) => row.accessStatus === 'BLOCKED_REFUNDED',
        ).length,
        blockedCanceledCount: accessRows.filter(
          (row) => row.accessStatus === 'BLOCKED_CANCELED',
        ).length,
        lifecycleRowCount: lifecycleRows.length,
        lifecycleExpiredRowCount: expiredLifecycleRows.length,
        lifecycleRevokedRowCount: revokedLifecycleRows.length,
        lifecycleRowsWithReasonCount: lifecycleRows.filter((row) =>
          Boolean(row.decisionReason),
        ).length,
        relationshipTraceCount: accessRows.length,
        accessCasesWithRelationshipTraceCount: accessRows.filter(
          (row) =>
            row.relationshipKey.includes(row.entitlementId) &&
            row.relationshipKey.includes(row.dailyPlanId),
        ).length,
        blockedAccessWithReasonCount: blockedRows.filter((row) =>
          Boolean(row.blockedReason),
        ).length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      accessRows,
      lifecycleRows,
      evidenceRows,
    };
  }

  buildParentTeacherProgressAccessSummaryReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = '2026-06-30T13:00:00.000Z',
  ): DemoLearningParentTeacherProgressAccessSummaryReport {
    const accessReport = this.buildSubscriptionEntitlementDailyPlanAccessReport(
      fixture,
      generatedAt,
    );
    const guardiansByChildProfileId = new Map(
      fixture.parentGuardians.flatMap((guardian) =>
        guardian.childProfileIds.map(
          (childProfileId) => [childProfileId, guardian] as const,
        ),
      ),
    );
    const guardiansById = new Map(
      fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
    );
    const classesById = new Map(
      fixture.classes.map((classCohort) => [classCohort.id, classCohort]),
    );
    const coursesById = new Map(
      fixture.courses.map((course) => [course.id, course]),
    );
    const progressByEnrollmentId = new Map(
      fixture.progress.map((progress) => [progress.enrollmentId, progress]),
    );
    const dailyPlansById = new Map(
      fixture.dailyPlans.map((plan) => [plan.id, plan]),
    );
    const videoEvidenceByDailyPlanId = new Map(
      fixture.videoEvidence.map((evidence) => [evidence.dailyPlanId, evidence]),
    );
    const practiceAttemptByDailyPlanId = new Map(
      fixture.practiceAttempts.map((attempt) => [attempt.dailyPlanId, attempt]),
    );
    const teacherOwners = fixture.contentOwners.filter(
      (owner) => owner.role === 'TEACHER' || owner.role === 'ADMIN',
    );
    const teacherOwnersByClassId = new Map<
      string,
      DemoLearningContentOwner[]
    >();

    for (const owner of teacherOwners) {
      for (const classId of owner.classIds) {
        const owners = teacherOwnersByClassId.get(classId) ?? [];
        owners.push(owner);
        teacherOwnersByClassId.set(classId, owners);
      }
    }

    const progressRows = accessReport.accessRows
      .map((accessRow) => {
        const guardian = this.requireGuardianByChildProfileId(
          guardiansByChildProfileId,
          accessRow.childProfileId,
        );
        const progress = this.requireProgress(
          progressByEnrollmentId,
          accessRow.enrollmentId,
        );
        const dailyPlan = this.requireDailyPlan(
          dailyPlansById,
          accessRow.dailyPlanId,
        );
        const classCohort = this.requireClass(classesById, dailyPlan.classId);
        const videoEvidence = this.requireVideoEvidence(
          videoEvidenceByDailyPlanId,
          dailyPlan.id,
        );
        const practiceAttempt = this.requirePracticeAttempt(
          practiceAttemptByDailyPlanId,
          dailyPlan.id,
        );
        const owners = teacherOwnersByClassId.get(classCohort.id) ?? [];
        const progressSummaryId = `progress-access-${accessRow.enrollmentId}`;
        const progressEvidenceKey = [
          accessRow.relationshipKey,
          progress.id,
          videoEvidence.id,
          practiceAttempt.id,
        ].join('->');

        return {
          progressSummaryId,
          relationshipKey: accessRow.relationshipKey,
          progressEvidenceKey,
          parentGuardianId: guardian.id,
          parentGuardianName: guardian.displayName,
          parentGuardianEmail: guardian.email,
          teacherOwnerIds: owners.map((owner) => owner.id),
          teacherOwnerNames: owners.map((owner) => owner.displayName),
          studentId: accessRow.studentId,
          childProfileId: accessRow.childProfileId,
          studentName: accessRow.studentName,
          courseId: accessRow.courseId,
          courseCode: accessRow.courseCode,
          courseTitle: accessRow.courseTitle,
          classId: classCohort.id,
          classCode: classCohort.code,
          teacherName: classCohort.teacherName,
          enrollmentId: accessRow.enrollmentId,
          enrollmentStatus: accessRow.enrollmentStatus,
          subscriptionId: accessRow.subscriptionId,
          subscriptionStatus: accessRow.subscriptionStatus,
          paymentStatus: accessRow.paymentStatus,
          entitlementId: accessRow.entitlementId,
          entitlementStatus: accessRow.entitlementStatus,
          accessStatus: accessRow.accessStatus,
          blockedReason: accessRow.blockedReason,
          nextSafeActionLabel: accessRow.nextSafeActionLabel,
          learningPathId: accessRow.learningPathId,
          learningPathStatus: accessRow.learningPathStatus,
          dailyPlanId: dailyPlan.id,
          dailyPlanStatus: dailyPlan.status,
          progressId: progress.id,
          progressStatus: progress.status,
          completionPercent: progress.completionPercent,
          completedLessonCount: progress.completedLessonCount,
          totalLessonCount: progress.totalLessonCount,
          videoEvidenceId: videoEvidence.id,
          videoEvidenceStatus: videoEvidence.status,
          practiceAttemptId: practiceAttempt.id,
          practiceAttemptStatus: practiceAttempt.status,
          evidenceCoverageCount: 3,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            accessRow.accessStatus === 'UNLOCKED'
              ? `${accessRow.studentName} has unlocked fixture access and ${progress.completionPercent}% progress evidence.`
              : `${accessRow.studentName} has blocked fixture access with progress evidence: ${accessRow.blockedReason}.`,
        } satisfies DemoLearningParentTeacherProgressAccessRow;
      })
      .sort((left, right) =>
        [left.courseCode, left.studentName, left.dailyPlanId]
          .join('|')
          .localeCompare(
            [right.courseCode, right.studentName, right.dailyPlanId].join('|'),
          ),
      );

    const parentSummaryRows = progressRows.map((row) => {
      const guardian = this.requireGuardian(
        guardiansById,
        row.parentGuardianId,
      );
      const relationshipTraceKey = [
        guardian.id,
        row.relationshipKey,
        row.progressSummaryId,
      ].join('->');

      return {
        parentSummaryId: `parent-access-summary-${row.parentGuardianId}-${row.enrollmentId}`,
        relationshipTraceKey,
        relationshipTraceIds: [
          relationshipTraceKey,
          row.relationshipKey,
          row.progressEvidenceKey,
        ],
        parentGuardianId: guardian.id,
        parentGuardianName: guardian.displayName,
        parentGuardianEmail: guardian.email,
        relationship: guardian.relationship,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        entitlementStatus: row.entitlementStatus,
        accessStatus: row.accessStatus,
        blockedReason: row.blockedReason,
        nextSafeActionLabel: row.nextSafeActionLabel,
        dailyPlanId: row.dailyPlanId,
        dailyPlanStatus: row.dailyPlanStatus,
        progressStatus: row.progressStatus,
        completionPercent: row.completionPercent,
        evidenceCoverageCount: row.evidenceCoverageCount,
        parentFacingSummary:
          row.accessStatus === 'UNLOCKED'
            ? `${row.studentName} can open ${row.dailyPlanId}; progress is ${row.progressStatus} at ${row.completionPercent}%.`
            : `${row.studentName} cannot open ${row.dailyPlanId}; ${row.blockedReason}`,
      } satisfies DemoLearningParentTeacherProgressParentSummaryRow;
    });

    const teacherSummaryRows = teacherOwners
      .flatMap((owner) =>
        owner.classIds.map((classId) => {
          const classCohort = this.requireClass(classesById, classId);
          const course = this.requireCourseById(
            coursesById,
            classCohort.courseId,
          );
          const rows = progressRows.filter((row) => row.classId === classId);
          if (rows.length === 0) {
            return null;
          }

          const blockedRows = rows.filter(
            (row) => row.accessStatus !== 'UNLOCKED',
          );
          const relationshipTraceIds = rows.map((row) =>
            [owner.id, row.relationshipKey, row.progressSummaryId].join('->'),
          );
          const progressSummaryIds = rows.map((row) => row.progressSummaryId);
          const enrollmentIds = rows.map((row) => row.enrollmentId);
          const averageCompletionPercent = this.averagePercent(
            rows.map((row) => row.completionPercent),
          );

          return {
            teacherSummaryId: `teacher-access-summary-${owner.id}-${classId}`,
            relationshipTraceKey: [owner.id, classId, course.id].join('->'),
            relationshipTraceIds,
            blockedRelationshipTraceIds: blockedRows.map(
              (row) => row.relationshipKey,
            ),
            teacherOwnerId: owner.id,
            teacherName: owner.displayName,
            teacherEmail: owner.email,
            teacherRole: owner.role,
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            classId: classCohort.id,
            classCode: classCohort.code,
            classTitle: classCohort.title,
            studentCount: new Set(rows.map((row) => row.studentId)).size,
            progressSummaryIds,
            enrollmentIds,
            unlockedAccessCount: rows.filter(
              (row) => row.accessStatus === 'UNLOCKED',
            ).length,
            blockedAccessCount: blockedRows.length,
            blockedReasonCount: blockedRows.filter((row) =>
              Boolean(row.blockedReason),
            ).length,
            averageCompletionPercent,
            completedProgressCount: rows.filter(
              (row) => row.progressStatus === 'COMPLETED',
            ).length,
            needsSupportProgressCount: rows.filter(
              (row) => row.progressStatus === 'NEEDS_SUPPORT',
            ).length,
            withdrawnProgressCount: rows.filter(
              (row) => row.progressStatus === 'WITHDRAWN',
            ).length,
            evidenceCoverageCount: rows.reduce(
              (sum, row) => sum + row.evidenceCoverageCount,
              0,
            ),
            teacherFacingSummary: `${owner.displayName} sees ${rows.length} fixture learner access summaries for ${classCohort.code}: ${blockedRows.length} blocked and ${averageCompletionPercent}% average progress.`,
          } satisfies DemoLearningParentTeacherProgressTeacherSummaryRow;
        }),
      )
      .filter(
        (row): row is DemoLearningParentTeacherProgressTeacherSummaryRow =>
          row !== null,
      )
      .sort((left, right) =>
        [left.teacherName, left.classCode, left.courseCode]
          .join('|')
          .localeCompare(
            [right.teacherName, right.classCode, right.courseCode].join('|'),
          ),
      );

    const blockedRows = progressRows.filter(
      (row) => row.accessStatus !== 'UNLOCKED',
    );
    const blockedRelationshipKeys = new Set(
      blockedRows.map((row) => row.relationshipKey),
    );
    const parentBlockedKeysWithReason = new Set(
      parentSummaryRows
        .filter(
          (row) =>
            row.accessStatus !== 'UNLOCKED' && Boolean(row.blockedReason),
        )
        .map((row) => row.relationshipTraceIds[1]),
    );
    const teacherBlockedKeysWithReason = new Set(
      teacherSummaryRows.flatMap((row) => row.blockedRelationshipTraceIds),
    );
    const blockedAccessInSummariesWithReasonCount = [
      ...blockedRelationshipKeys,
    ].filter(
      (key) =>
        parentBlockedKeysWithReason.has(key) &&
        teacherBlockedKeysWithReason.has(key),
    ).length;
    const remainingLocalDemoNotes = [
      'Parent summaries are read-only views over guardian, entitlement, daily plan, and progress fixtures.',
      'Teacher/admin summaries aggregate existing fixture access rows by assigned class and course without writing learning records.',
      'Production parent messaging, teacher interventions, entitlement sync, payment handling, and progress mutations are out of scope.',
    ];
    const safety = {
      ...accessReport.safety,
    } satisfies DemoLearningParentTeacherProgressAccessSummarySafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
        return value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningParentTeacherProgressAccessEvidenceRow[] = [
      {
        evidenceKind: 'PARENT_GUARDIAN_LINK',
        evidenceCount: parentSummaryRows.length,
        stableFixtureIds: parentSummaryRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Each parent summary links a fixture guardian to child, course entitlement, daily plan access, and progress evidence.',
      },
      {
        evidenceKind: 'TEACHER_COURSE_LINK',
        evidenceCount: teacherSummaryRows.length,
        stableFixtureIds: teacherSummaryRows.map(
          (row) => row.relationshipTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher/admin summaries use content owner class assignments to aggregate course access and progress rows.',
      },
      {
        evidenceKind: 'PROGRESS_ACCESS_SUMMARY',
        evidenceCount: progressRows.length,
        stableFixtureIds: progressRows.map((row) => row.progressEvidenceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Progress rows connect entitlement access to progress, video, and practice evidence for unlocked and blocked cases.',
      },
      {
        evidenceKind: 'BLOCKED_REASON_SUMMARY',
        evidenceCount: blockedRows.length,
        stableFixtureIds: blockedRows.map((row) => row.relationshipKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Blocked access rows are surfaced to parent and teacher summaries with explicit local-demo reasons.',
      },
      {
        evidenceKind: 'SAFETY_GATE',
        evidenceCount: safetyGateCount,
        stableFixtureIds: Object.entries(safety).map(
          ([gate, value]) => `${gate}=${String(value)}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'All production, provider, payment, notification, learning mutation, and ERP mutation gates remain closed.',
      },
    ];

    return {
      reportName:
        'Learning local demo Parent/Teacher Progress Access Summary Report',
      generatedFor: 'local-demo-parent-teacher-progress-access-summary-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/parent-teacher-progress-access-summary-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#parent-teacher-progress-access-summary',
      jsonExportPath:
        'exports/learning-local-demo-parent-teacher-progress-access-summary-report.json',
      markdownExportPath:
        'exports/learning-local-demo-parent-teacher-progress-access-summary-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Parent and teacher read-only summaries compose fixture entitlement access, blocked reasons, and progress evidence without production data or mutations.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: fixture.students.length,
        parentGuardianCount: fixture.parentGuardians.length,
        teacherCount: teacherOwners.length,
        courseCount: fixture.courses.length,
        enrollmentCount: fixture.enrollments.length,
        subscriptionCount: fixture.subscriptions.length,
        entitlementCount: accessReport.totals.entitlementCount,
        dailyPlanAccessCaseCount: accessReport.totals.dailyPlanAccessCaseCount,
        unlockedAccessCount: accessReport.totals.unlockedAccessCount,
        blockedAccessCount: blockedRows.length,
        blockedReasonCount: blockedRows.filter((row) =>
          Boolean(row.blockedReason),
        ).length,
        progressSummaryCount: progressRows.length,
        parentSummaryCount: parentSummaryRows.length,
        teacherSummaryCount: teacherSummaryRows.length,
        relationshipTraceCount: progressRows.length,
        parentSummaryWithTraceCount: parentSummaryRows.filter(
          (row) =>
            row.relationshipTraceIds.length > 0 &&
            row.relationshipTraceKey.includes(row.parentGuardianId),
        ).length,
        teacherSummaryWithTraceCount: teacherSummaryRows.filter(
          (row) =>
            row.relationshipTraceIds.length > 0 &&
            row.relationshipTraceKey.includes(row.teacherOwnerId),
        ).length,
        blockedAccessInSummariesWithReasonCount,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      progressRows,
      parentSummaryRows,
      teacherSummaryRows,
      evidenceRows,
    };
  }

  buildParentTeacherReportPermissionPrivacyRedactionReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentTeacherReportPermissionPrivacyRedactionReport {
    const progressAccessReport =
      this.buildParentTeacherProgressAccessSummaryReport(fixture, generatedAt);
    const guardiansById = new Map(
      fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
    );
    const contentOwnersById = new Map(
      fixture.contentOwners.map((owner) => [owner.id, owner]),
    );

    const requireProgressRow = (studentId: string) => {
      const row = progressAccessReport.progressRows.find(
        (progressRow) => progressRow.studentId === studentId,
      );
      if (!row) {
        throw new Error(
          `Missing local demo progress access row for ${studentId}`,
        );
      }

      return row;
    };
    const requireParentSummaryRow = (guardianId: string, studentId: string) => {
      const row = progressAccessReport.parentSummaryRows.find(
        (summaryRow) =>
          summaryRow.parentGuardianId === guardianId &&
          summaryRow.studentId === studentId,
      );
      if (!row) {
        throw new Error(
          `Missing local demo parent summary for ${guardianId} and ${studentId}`,
        );
      }

      return row;
    };
    const requireTeacherSummaryRow = (ownerId: string, classId: string) => {
      const row = progressAccessReport.teacherSummaryRows.find(
        (summaryRow) =>
          summaryRow.teacherOwnerId === ownerId &&
          summaryRow.classId === classId,
      );
      if (!row) {
        throw new Error(
          `Missing local demo teacher summary for ${ownerId} and ${classId}`,
        );
      }

      return row;
    };

    const avaProgress = requireProgressRow('student-ava');
    const avaParent = this.requireGuardian(
      guardiansById,
      'guardian-ava-parent',
    );
    const minhParent = this.requireGuardian(
      guardiansById,
      'guardian-minh-parent',
    );
    const avaParentSummary = requireParentSummaryRow(
      avaParent.id,
      avaProgress.studentId,
    );
    const teacherMai = this.requireContentOwner(
      contentOwnersById,
      'content-owner-teacher-mai',
    );
    const teacherHanh = this.requireContentOwner(
      contentOwnersById,
      'content-owner-teacher-hanh',
    );
    const adminHoa = this.requireContentOwner(
      contentOwnersById,
      'content-owner-admin-hoa',
    );
    const teacherMaiSummary = requireTeacherSummaryRow(
      teacherMai.id,
      'class-a1-june-weekday',
    );
    const adminHoaSummary = requireTeacherSummaryRow(
      adminHoa.id,
      'class-phonics-may-booster',
    );
    const teacherHanhSummary = requireTeacherSummaryRow(
      teacherHanh.id,
      'class-phonics-may-booster',
    );
    const supportOpsAuditor = {
      id: 'support-ops-auditor-lan',
      displayName: 'Support Ops Lan',
      email: 'support.ops.lan@example.test',
    };

    const permissionCaseInputs = [
      {
        permissionCaseId: 'permission-case-parent-ava-own-child',
        actorId: avaParent.id,
        actorName: avaParent.displayName,
        actorEmail: avaParent.email,
        actorRole: 'PARENT_GUARDIAN' as const,
        reportScope: 'OWN_CHILD' as const,
        permissionDecision: 'ALLOWED' as const,
        decisionReason:
          'Fixture guardian is linked to child-ava-demo; parent-facing fields are visible while teacher-internal fields stay redacted.',
        targetStudentId: avaProgress.studentId,
        targetChildProfileId: avaProgress.childProfileId,
        targetStudentName: avaProgress.studentName,
        targetCourseId: avaProgress.courseId,
        targetCourseCode: avaProgress.courseCode,
        targetClassId: avaProgress.classId,
        targetClassCode: avaProgress.classCode,
        progressSummaryId: avaProgress.progressSummaryId,
        sourceParentSummaryId: avaParentSummary.parentSummaryId,
        sourceTeacherSummaryId: null,
        sourceAccessStatus: avaProgress.accessStatus,
        relationshipTraceKey: [
          avaParent.id,
          avaProgress.relationshipKey,
          avaProgress.progressSummaryId,
          'permission-allowed-own-child',
        ].join('->'),
        relationshipTraceIds: [
          avaParent.id,
          avaProgress.relationshipKey,
          avaProgress.progressEvidenceKey,
          avaParentSummary.relationshipTraceKey,
        ],
        caseSummary:
          'Ava Parent can see Ava report fields that are parent-facing; teacher-only narrative is redacted.',
        fields: [
          {
            fieldKey: 'studentName',
            fieldLabel: 'Student name',
            fieldScope: 'PARENT_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: avaProgress.studentName,
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'courseCode',
            fieldLabel: 'Course code',
            fieldScope: 'PARENT_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: avaProgress.courseCode,
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'accessStatus',
            fieldLabel: 'Daily plan access status',
            fieldScope: 'PARENT_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: avaProgress.accessStatus,
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'completionPercent',
            fieldLabel: 'Completion percent',
            fieldScope: 'PARENT_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: `${avaProgress.completionPercent}%`,
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'teacherInternalSummary',
            fieldLabel: 'Teacher internal summary',
            fieldScope: 'TEACHER_INTERNAL' as const,
            visibility: 'REDACTED' as const,
            visibleValue: null,
            redactedValue: 'REDACTED_LOCAL_DEMO',
            reason:
              'Parent report hides teacher/admin internal notes until a parent-facing digest is approved.',
          },
        ],
      },
      {
        permissionCaseId: 'permission-case-parent-minh-non-owning-ava',
        actorId: minhParent.id,
        actorName: minhParent.displayName,
        actorEmail: minhParent.email,
        actorRole: 'PARENT_GUARDIAN' as const,
        reportScope: 'NON_OWNING_CHILD' as const,
        permissionDecision: 'DENIED' as const,
        decisionReason:
          'Fixture guardian guardian-minh-parent is not linked to child-ava-demo, so Ava report fields are denied.',
        targetStudentId: avaProgress.studentId,
        targetChildProfileId: avaProgress.childProfileId,
        targetStudentName: avaProgress.studentName,
        targetCourseId: avaProgress.courseId,
        targetCourseCode: avaProgress.courseCode,
        targetClassId: avaProgress.classId,
        targetClassCode: avaProgress.classCode,
        progressSummaryId: avaProgress.progressSummaryId,
        sourceParentSummaryId: avaParentSummary.parentSummaryId,
        sourceTeacherSummaryId: null,
        sourceAccessStatus: 'DENIED_SCOPE' as const,
        relationshipTraceKey: [
          minhParent.id,
          avaProgress.studentId,
          avaProgress.courseId,
          avaProgress.progressSummaryId,
          'permission-denied-non-owner',
        ].join('->'),
        relationshipTraceIds: [
          minhParent.id,
          avaProgress.childProfileId,
          avaProgress.relationshipKey,
          avaProgress.progressSummaryId,
        ],
        caseSummary:
          'Minh Parent cannot see Ava report fields because there is no fixture child relationship.',
        fields: [
          {
            fieldKey: 'studentName',
            fieldLabel: 'Student name',
            fieldScope: 'NON_OWNING_CHILD_PRIVATE' as const,
            visibility: 'DENIED' as const,
            visibleValue: null,
            redactedValue: 'DENIED_LOCAL_DEMO',
            reason: 'Guardian childProfileIds does not include child-ava-demo.',
          },
          {
            fieldKey: 'courseCode',
            fieldLabel: 'Course code',
            fieldScope: 'NON_OWNING_CHILD_PRIVATE' as const,
            visibility: 'DENIED' as const,
            visibleValue: null,
            redactedValue: 'DENIED_LOCAL_DEMO',
            reason:
              'Non-owning parent has no local-demo report scope for Ava course data.',
          },
          {
            fieldKey: 'completionPercent',
            fieldLabel: 'Completion percent',
            fieldScope: 'NON_OWNING_CHILD_PRIVATE' as const,
            visibility: 'DENIED' as const,
            visibleValue: null,
            redactedValue: 'DENIED_LOCAL_DEMO',
            reason:
              'Non-owning parent has no local-demo report scope for Ava progress data.',
          },
        ],
      },
      {
        permissionCaseId: 'permission-case-teacher-mai-assigned-a1',
        actorId: teacherMai.id,
        actorName: teacherMai.displayName,
        actorEmail: teacherMai.email,
        actorRole: 'TEACHER' as const,
        reportScope: 'ASSIGNED_CLASS' as const,
        permissionDecision: 'ALLOWED' as const,
        decisionReason:
          'Fixture teacher is assigned to class-a1-june-weekday; class report fields are visible while guardian private contact is redacted.',
        targetStudentId: null,
        targetChildProfileId: null,
        targetStudentName: null,
        targetCourseId: teacherMaiSummary.courseId,
        targetCourseCode: teacherMaiSummary.courseCode,
        targetClassId: teacherMaiSummary.classId,
        targetClassCode: teacherMaiSummary.classCode,
        progressSummaryId: null,
        sourceParentSummaryId: null,
        sourceTeacherSummaryId: teacherMaiSummary.teacherSummaryId,
        sourceAccessStatus: 'CLASS_SCOPE' as const,
        relationshipTraceKey: [
          teacherMai.id,
          teacherMaiSummary.classId,
          teacherMaiSummary.courseId,
          teacherMaiSummary.teacherSummaryId,
          'permission-allowed-assigned-class',
        ].join('->'),
        relationshipTraceIds: [
          teacherMaiSummary.relationshipTraceKey,
          ...teacherMaiSummary.relationshipTraceIds,
        ],
        caseSummary:
          'Teacher Mai sees assigned A1 class progress evidence and blocked reasons; guardian private contact is redacted.',
        fields: [
          {
            fieldKey: 'classCode',
            fieldLabel: 'Class code',
            fieldScope: 'TEACHER_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: teacherMaiSummary.classCode,
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'studentCount',
            fieldLabel: 'Student count',
            fieldScope: 'TEACHER_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: String(teacherMaiSummary.studentCount),
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'blockedReasonCount',
            fieldLabel: 'Blocked reason count',
            fieldScope: 'TEACHER_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: String(teacherMaiSummary.blockedReasonCount),
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'progressSummaryIds',
            fieldLabel: 'Progress summary IDs',
            fieldScope: 'TEACHER_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: teacherMaiSummary.progressSummaryIds.join(', '),
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'guardianEmail',
            fieldLabel: 'Guardian email',
            fieldScope: 'GUARDIAN_PRIVATE' as const,
            visibility: 'REDACTED' as const,
            visibleValue: null,
            redactedValue: 'REDACTED_LOCAL_DEMO',
            reason:
              'Teacher class report redacts guardian email; contact workflows stay outside this local-demo evidence slice.',
          },
        ],
      },
      {
        permissionCaseId:
          'permission-case-teacher-mai-unassigned-phonics-denied',
        actorId: teacherMai.id,
        actorName: teacherMai.displayName,
        actorEmail: teacherMai.email,
        actorRole: 'TEACHER' as const,
        reportScope: 'UNASSIGNED_CLASS' as const,
        permissionDecision: 'DENIED' as const,
        decisionReason:
          'Fixture teacher content-owner-teacher-mai is not assigned to class-phonics-may-booster, so phonics class report fields are denied.',
        targetStudentId: null,
        targetChildProfileId: null,
        targetStudentName: null,
        targetCourseId: teacherHanhSummary.courseId,
        targetCourseCode: teacherHanhSummary.courseCode,
        targetClassId: teacherHanhSummary.classId,
        targetClassCode: teacherHanhSummary.classCode,
        progressSummaryId: null,
        sourceParentSummaryId: null,
        sourceTeacherSummaryId: teacherHanhSummary.teacherSummaryId,
        sourceAccessStatus: 'DENIED_SCOPE' as const,
        relationshipTraceKey: [
          teacherMai.id,
          teacherHanhSummary.classId,
          teacherHanhSummary.teacherSummaryId,
          'permission-denied-unassigned-class',
        ].join('->'),
        relationshipTraceIds: [
          teacherMai.id,
          teacherHanh.id,
          teacherHanhSummary.relationshipTraceKey,
          ...teacherHanhSummary.relationshipTraceIds,
        ],
        caseSummary:
          'Teacher Mai cannot see Teacher Hanh phonics class report fields because the fixture class assignment is out of scope.',
        fields: [
          {
            fieldKey: 'classCode',
            fieldLabel: 'Class code',
            fieldScope: 'UNASSIGNED_CLASS_PRIVATE' as const,
            visibility: 'DENIED' as const,
            visibleValue: null,
            redactedValue: 'DENIED_LOCAL_DEMO',
            reason:
              'Teacher Mai classIds does not include class-phonics-may-booster.',
          },
          {
            fieldKey: 'studentCount',
            fieldLabel: 'Student count',
            fieldScope: 'UNASSIGNED_CLASS_PRIVATE' as const,
            visibility: 'DENIED' as const,
            visibleValue: null,
            redactedValue: 'DENIED_LOCAL_DEMO',
            reason:
              'Unassigned teacher has no local-demo roster scope for the phonics class.',
          },
          {
            fieldKey: 'progressSummaryIds',
            fieldLabel: 'Progress summary IDs',
            fieldScope: 'UNASSIGNED_CLASS_PRIVATE' as const,
            visibility: 'DENIED' as const,
            visibleValue: null,
            redactedValue: 'DENIED_LOCAL_DEMO',
            reason:
              'Unassigned teacher cannot read phonics learner progress summaries in the fixture matrix.',
          },
        ],
      },
      {
        permissionCaseId: 'permission-case-admin-hoa-phonics-class',
        actorId: adminHoa.id,
        actorName: adminHoa.displayName,
        actorEmail: adminHoa.email,
        actorRole: 'ADMIN' as const,
        reportScope: 'ADMIN_CLASS' as const,
        permissionDecision: 'ALLOWED' as const,
        decisionReason:
          'Fixture admin has local-demo class scope for class-phonics-may-booster and sees read-only class report fields.',
        targetStudentId: null,
        targetChildProfileId: null,
        targetStudentName: null,
        targetCourseId: adminHoaSummary.courseId,
        targetCourseCode: adminHoaSummary.courseCode,
        targetClassId: adminHoaSummary.classId,
        targetClassCode: adminHoaSummary.classCode,
        progressSummaryId: null,
        sourceParentSummaryId: null,
        sourceTeacherSummaryId: adminHoaSummary.teacherSummaryId,
        sourceAccessStatus: 'CLASS_SCOPE' as const,
        relationshipTraceKey: [
          adminHoa.id,
          adminHoaSummary.classId,
          adminHoaSummary.courseId,
          adminHoaSummary.teacherSummaryId,
          'permission-allowed-admin-class',
        ].join('->'),
        relationshipTraceIds: [
          adminHoaSummary.relationshipTraceKey,
          ...adminHoaSummary.relationshipTraceIds,
        ],
        caseSummary:
          'Admin Hoa sees the phonics class evidence in read-only local-demo scope.',
        fields: [
          {
            fieldKey: 'classCode',
            fieldLabel: 'Class code',
            fieldScope: 'ADMIN_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: adminHoaSummary.classCode,
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'courseCode',
            fieldLabel: 'Course code',
            fieldScope: 'ADMIN_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: adminHoaSummary.courseCode,
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'studentCount',
            fieldLabel: 'Student count',
            fieldScope: 'ADMIN_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: String(adminHoaSummary.studentCount),
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'averageCompletionPercent',
            fieldLabel: 'Average completion percent',
            fieldScope: 'ADMIN_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: `${adminHoaSummary.averageCompletionPercent}%`,
            redactedValue: null,
            reason: null,
          },
        ],
      },
      {
        permissionCaseId: 'permission-case-support-ops-lan-audit-read-only',
        actorId: supportOpsAuditor.id,
        actorName: supportOpsAuditor.displayName,
        actorEmail: supportOpsAuditor.email,
        actorRole: 'SUPPORT_OPS' as const,
        reportScope: 'SUPPORT_AUDIT_READ_ONLY' as const,
        permissionDecision: 'ALLOWED' as const,
        decisionReason:
          'Fixture support/ops actor can inspect read-only audit fields for class-a1-june-weekday while live mutations remain denied.',
        targetStudentId: null,
        targetChildProfileId: null,
        targetStudentName: null,
        targetCourseId: teacherMaiSummary.courseId,
        targetCourseCode: teacherMaiSummary.courseCode,
        targetClassId: teacherMaiSummary.classId,
        targetClassCode: teacherMaiSummary.classCode,
        progressSummaryId: null,
        sourceParentSummaryId: null,
        sourceTeacherSummaryId: teacherMaiSummary.teacherSummaryId,
        sourceAccessStatus: 'SUPPORT_AUDIT_SCOPE' as const,
        relationshipTraceKey: [
          supportOpsAuditor.id,
          teacherMaiSummary.classId,
          teacherMaiSummary.teacherSummaryId,
          'permission-allowed-support-ops-audit-read-only',
        ].join('->'),
        relationshipTraceIds: [
          supportOpsAuditor.id,
          teacherMaiSummary.relationshipTraceKey,
          ...teacherMaiSummary.relationshipTraceIds,
        ],
        caseSummary:
          'Support Ops Lan can review class-level blocked reason and trace evidence, but mutation/write controls are denied in local-demo scope.',
        fields: [
          {
            fieldKey: 'classCode',
            fieldLabel: 'Class code',
            fieldScope: 'SUPPORT_AUDIT_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: teacherMaiSummary.classCode,
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'blockedReasonCount',
            fieldLabel: 'Blocked reason count',
            fieldScope: 'SUPPORT_AUDIT_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: String(teacherMaiSummary.blockedReasonCount),
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'auditTraceKey',
            fieldLabel: 'Audit trace key',
            fieldScope: 'SUPPORT_AUDIT_VISIBLE' as const,
            visibility: 'VISIBLE' as const,
            visibleValue: teacherMaiSummary.relationshipTraceKey,
            redactedValue: null,
            reason: null,
          },
          {
            fieldKey: 'liveMutation',
            fieldLabel: 'Live mutation',
            fieldScope: 'SUPPORT_AUDIT_MUTATION' as const,
            visibility: 'DENIED' as const,
            visibleValue: null,
            redactedValue: 'DENIED_LOCAL_DEMO',
            reason:
              'Support/ops audit case is read-only and cannot mutate students, reports, entitlements, payments, or ERP records.',
          },
        ],
      },
    ];

    const fieldVisibilityRows =
      permissionCaseInputs.flatMap<DemoLearningParentTeacherReportFieldVisibilityRow>(
        (permissionCase) =>
          permissionCase.fields.map((field) => {
            const relationshipTraceKey = [
              permissionCase.relationshipTraceKey,
              field.fieldKey,
              field.visibility,
            ].join('->');

            return {
              fieldVisibilityId: `field-visibility-${permissionCase.permissionCaseId}-${field.fieldKey}`,
              permissionCaseId: permissionCase.permissionCaseId,
              actorId: permissionCase.actorId,
              actorRole: permissionCase.actorRole,
              fieldKey: field.fieldKey,
              fieldLabel: field.fieldLabel,
              fieldScope: field.fieldScope,
              visibility: field.visibility,
              visibleValue: field.visibleValue,
              redactedValue: field.redactedValue,
              reason: field.reason,
              relationshipTraceKey,
              relationshipTraceIds: [
                ...permissionCase.relationshipTraceIds,
                relationshipTraceKey,
              ],
              fixtureOnly: true,
              providerUsed: false,
              mutationUsed: false,
            } satisfies DemoLearningParentTeacherReportFieldVisibilityRow;
          }),
      );

    const permissionCaseRows =
      permissionCaseInputs.map<DemoLearningParentTeacherReportPermissionCaseRow>(
        (permissionCase) => {
          const caseFields = fieldVisibilityRows.filter(
            (field) =>
              field.permissionCaseId === permissionCase.permissionCaseId,
          );

          return {
            permissionCaseId: permissionCase.permissionCaseId,
            actorId: permissionCase.actorId,
            actorName: permissionCase.actorName,
            actorEmail: permissionCase.actorEmail,
            actorRole: permissionCase.actorRole,
            reportScope: permissionCase.reportScope,
            permissionDecision: permissionCase.permissionDecision,
            decisionReason: permissionCase.decisionReason,
            targetStudentId: permissionCase.targetStudentId,
            targetChildProfileId: permissionCase.targetChildProfileId,
            targetStudentName: permissionCase.targetStudentName,
            targetCourseId: permissionCase.targetCourseId,
            targetCourseCode: permissionCase.targetCourseCode,
            targetClassId: permissionCase.targetClassId,
            targetClassCode: permissionCase.targetClassCode,
            progressSummaryId: permissionCase.progressSummaryId,
            sourceParentSummaryId: permissionCase.sourceParentSummaryId,
            sourceTeacherSummaryId: permissionCase.sourceTeacherSummaryId,
            sourceAccessStatus: permissionCase.sourceAccessStatus,
            relationshipTraceKey: permissionCase.relationshipTraceKey,
            relationshipTraceIds: permissionCase.relationshipTraceIds,
            visibleFieldCount: caseFields.filter(
              (field) => field.visibility === 'VISIBLE',
            ).length,
            redactedFieldCount: caseFields.filter(
              (field) => field.visibility === 'REDACTED',
            ).length,
            deniedFieldCount: caseFields.filter(
              (field) => field.visibility === 'DENIED',
            ).length,
            fixtureOnly: true,
            providerUsed: false,
            mutationUsed: false,
            caseSummary: permissionCase.caseSummary,
          } satisfies DemoLearningParentTeacherReportPermissionCaseRow;
        },
      );

    const visibleFields = fieldVisibilityRows.filter(
      (field) => field.visibility === 'VISIBLE',
    );
    const redactedFields = fieldVisibilityRows.filter(
      (field) => field.visibility === 'REDACTED',
    );
    const deniedFields = fieldVisibilityRows.filter(
      (field) => field.visibility === 'DENIED',
    );
    const remainingLocalDemoNotes = [
      'Report permission rows are fixture-only and do not alter production authentication, authorization, or privacy policy.',
      'Parent and teacher/admin actors use existing local-demo guardians and content owners; support/ops audit uses a deterministic read-only fixture actor.',
      'Denied and redacted rows expose reasons for review while hiding field values from out-of-scope actors.',
    ];
    const safety = {
      ...progressAccessReport.safety,
    } satisfies DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
        return value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningParentTeacherReportPermissionPrivacyRedactionEvidenceRow[] =
      [
        {
          evidenceKind: 'PARENT_ALLOWED_REPORT_SCOPE',
          evidenceCount: permissionCaseRows.filter(
            (row) =>
              row.actorRole === 'PARENT_GUARDIAN' &&
              row.permissionDecision === 'ALLOWED',
          ).length,
          stableFixtureIds: permissionCaseRows
            .filter(
              (row) =>
                row.actorRole === 'PARENT_GUARDIAN' &&
                row.permissionDecision === 'ALLOWED',
            )
            .map((row) => row.relationshipTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Owning parent can see parent-facing child report fields through guardian-child fixture links.',
        },
        {
          evidenceKind: 'PARENT_DENIED_NON_OWNER_SCOPE',
          evidenceCount: permissionCaseRows.filter(
            (row) => row.reportScope === 'NON_OWNING_CHILD',
          ).length,
          stableFixtureIds: permissionCaseRows
            .filter((row) => row.reportScope === 'NON_OWNING_CHILD')
            .map((row) => row.relationshipTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Non-owning parent request is denied with explicit local-demo relationship reason.',
        },
        {
          evidenceKind: 'TEACHER_ASSIGNED_CLASS_SCOPE',
          evidenceCount: permissionCaseRows.filter(
            (row) => row.reportScope === 'ASSIGNED_CLASS',
          ).length,
          stableFixtureIds: permissionCaseRows
            .filter((row) => row.reportScope === 'ASSIGNED_CLASS')
            .map((row) => row.relationshipTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Assigned teacher sees class progress report fields while guardian private contact is redacted.',
        },
        {
          evidenceKind: 'TEACHER_DENIED_UNASSIGNED_CLASS_SCOPE',
          evidenceCount: permissionCaseRows.filter(
            (row) => row.reportScope === 'UNASSIGNED_CLASS',
          ).length,
          stableFixtureIds: permissionCaseRows
            .filter((row) => row.reportScope === 'UNASSIGNED_CLASS')
            .map((row) => row.relationshipTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Unassigned teacher request is denied with explicit class-scope reason and denied field rows.',
        },
        {
          evidenceKind: 'ADMIN_CLASS_SCOPE',
          evidenceCount: permissionCaseRows.filter(
            (row) => row.reportScope === 'ADMIN_CLASS',
          ).length,
          stableFixtureIds: permissionCaseRows
            .filter((row) => row.reportScope === 'ADMIN_CLASS')
            .map((row) => row.relationshipTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Fixture admin sees read-only class report fields through existing content owner class scope.',
        },
        {
          evidenceKind: 'SUPPORT_OPS_AUDIT_READ_ONLY_SCOPE',
          evidenceCount: permissionCaseRows.filter(
            (row) => row.reportScope === 'SUPPORT_AUDIT_READ_ONLY',
          ).length,
          stableFixtureIds: permissionCaseRows
            .filter((row) => row.reportScope === 'SUPPORT_AUDIT_READ_ONLY')
            .map((row) => row.relationshipTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Support/ops actor has explicit audited read-only report scope and denied mutation evidence.',
        },
        {
          evidenceKind: 'FIELD_VISIBILITY_REDACTION',
          evidenceCount: redactedFields.length + deniedFields.length,
          stableFixtureIds: [...redactedFields, ...deniedFields].map(
            (row) => row.fieldVisibilityId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Every redacted or denied field row carries a stable trace key and reason.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: Object.entries(safety).map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'All production DB, provider, payment, notification, learning mutation, and ERP mutation gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Parent/Teacher Report Permission Privacy Redaction Report',
      generatedFor:
        'local-demo-parent-teacher-report-permission-privacy-redaction-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/parent-teacher-report-permission-privacy-redaction-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#parent-teacher-report-permission-privacy-redaction',
      jsonExportPath:
        'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json',
      markdownExportPath:
        'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Parent/teacher report permission and privacy redaction evidence is fixture-only, read-only, and deterministic.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: fixture.students.length,
        parentGuardianCount: fixture.parentGuardians.length,
        teacherCount: fixture.contentOwners.filter(
          (owner) => owner.role === 'TEACHER' || owner.role === 'ADMIN',
        ).length,
        supportOpsCount: permissionCaseRows.filter(
          (row) => row.actorRole === 'SUPPORT_OPS',
        ).length,
        courseCount: fixture.courses.length,
        reportPermissionCaseCount: permissionCaseRows.length,
        allowedReportCaseCount: permissionCaseRows.filter(
          (row) => row.permissionDecision === 'ALLOWED',
        ).length,
        deniedReportCaseCount: permissionCaseRows.filter(
          (row) => row.permissionDecision === 'DENIED',
        ).length,
        teacherUnassignedDeniedCaseCount: permissionCaseRows.filter(
          (row) =>
            row.actorRole === 'TEACHER' &&
            row.reportScope === 'UNASSIGNED_CLASS' &&
            row.permissionDecision === 'DENIED',
        ).length,
        supportOpsAuditReadOnlyCaseCount: permissionCaseRows.filter(
          (row) =>
            row.actorRole === 'SUPPORT_OPS' &&
            row.reportScope === 'SUPPORT_AUDIT_READ_ONLY' &&
            row.permissionDecision === 'ALLOWED',
        ).length,
        visibleFieldCount: visibleFields.length,
        redactedFieldCount: redactedFields.length,
        deniedFieldCount: deniedFields.length,
        parentVisibleFieldCount: visibleFields.filter(
          (row) => row.actorRole === 'PARENT_GUARDIAN',
        ).length,
        teacherVisibleFieldCount: visibleFields.filter(
          (row) => row.actorRole === 'TEACHER' || row.actorRole === 'ADMIN',
        ).length,
        supportOpsVisibleFieldCount: visibleFields.filter(
          (row) => row.actorRole === 'SUPPORT_OPS',
        ).length,
        parentRedactedFieldCount: redactedFields.filter(
          (row) => row.actorRole === 'PARENT_GUARDIAN',
        ).length,
        teacherRedactedFieldCount: redactedFields.filter(
          (row) => row.actorRole === 'TEACHER' || row.actorRole === 'ADMIN',
        ).length,
        supportOpsDeniedFieldCount: deniedFields.filter(
          (row) => row.actorRole === 'SUPPORT_OPS',
        ).length,
        permissionTraceCount: permissionCaseRows.filter(
          (row) => row.relationshipTraceIds.length > 0,
        ).length,
        casesWithTraceCount: permissionCaseRows.filter(
          (row) =>
            row.relationshipTraceIds.length > 0 &&
            row.relationshipTraceKey.includes(row.actorId),
        ).length,
        deniedOrRedactedCaseWithReasonCount: permissionCaseRows.filter(
          (row) =>
            (row.permissionDecision === 'DENIED' ||
              row.redactedFieldCount > 0 ||
              row.deniedFieldCount > 0) &&
            Boolean(row.decisionReason),
        ).length,
        redactedOrDeniedFieldWithReasonCount: [
          ...redactedFields,
          ...deniedFields,
        ].filter((field) => Boolean(field.reason)).length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      permissionCaseRows,
      fieldVisibilityRows,
      evidenceRows,
    };
  }

  buildParentTeacherReportReviewQueueMessagePreviewReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentTeacherReportReviewQueueMessagePreviewReport {
    const permissionReport =
      this.buildParentTeacherReportPermissionPrivacyRedactionReport(
        fixture,
        generatedAt,
      );
    const guardiansById = new Map(
      fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
    );
    const contentOwnersById = new Map(
      fixture.contentOwners.map((owner) => [owner.id, owner]),
    );
    const coursesById = new Map(
      fixture.courses.map((course) => [course.id, course]),
    );

    const requirePermissionCase = (permissionCaseId: string) => {
      const permissionCase = permissionReport.permissionCaseRows.find(
        (row) => row.permissionCaseId === permissionCaseId,
      );
      if (!permissionCase) {
        throw new Error(
          `Missing local demo report permission case ${permissionCaseId}`,
        );
      }

      return permissionCase;
    };
    const requireCourseCode = (courseId: string | null) => {
      if (!courseId) {
        throw new Error('Missing local demo course id for report preview');
      }

      return this.requireCourseById(coursesById, courseId).code;
    };
    const requireStudentTarget = (
      permissionCase: DemoLearningParentTeacherReportPermissionCaseRow,
    ) => {
      if (
        !permissionCase.targetStudentId ||
        !permissionCase.targetChildProfileId ||
        !permissionCase.targetStudentName ||
        !permissionCase.targetCourseId ||
        !permissionCase.targetClassId ||
        !permissionCase.targetClassCode ||
        !permissionCase.progressSummaryId
      ) {
        throw new Error(
          `Missing local demo student report target for ${permissionCase.permissionCaseId}`,
        );
      }

      return {
        studentId: permissionCase.targetStudentId,
        childProfileId: permissionCase.targetChildProfileId,
        studentName: permissionCase.targetStudentName,
        courseId: permissionCase.targetCourseId,
        courseCode:
          permissionCase.targetCourseCode ??
          requireCourseCode(permissionCase.targetCourseId),
        classId: permissionCase.targetClassId,
        classCode: permissionCase.targetClassCode,
        progressSummaryId: permissionCase.progressSummaryId,
      };
    };

    const allowedParentCase = requirePermissionCase(
      'permission-case-parent-ava-own-child',
    );
    const deniedParentCase = requirePermissionCase(
      'permission-case-parent-minh-non-owning-ava',
    );
    const allowedTarget = requireStudentTarget(allowedParentCase);
    const deniedTarget = requireStudentTarget(deniedParentCase);
    const avaParent = this.requireGuardian(
      guardiansById,
      allowedParentCase.actorId,
    );
    const minhParent = this.requireGuardian(
      guardiansById,
      deniedParentCase.actorId,
    );
    const teacherMai = this.requireContentOwner(
      contentOwnersById,
      'content-owner-teacher-mai',
    );
    const adminHoa = this.requireContentOwner(
      contentOwnersById,
      'content-owner-admin-hoa',
    );

    const reportSummaryRows: DemoLearningParentTeacherReportReviewSummaryRow[] =
      [
        {
          reportSummaryId:
            'report-summary-preview-progress-access-enroll-ava-a1-active',
          sourceProgressSummaryId: allowedTarget.progressSummaryId,
          sourceParentSummaryId: allowedParentCase.sourceParentSummaryId,
          studentId: allowedTarget.studentId,
          childProfileId: allowedTarget.childProfileId,
          studentName: allowedTarget.studentName,
          courseId: allowedTarget.courseId,
          courseCode: allowedTarget.courseCode,
          classId: allowedTarget.classId,
          classCode: allowedTarget.classCode,
          parentGuardianId: avaParent.id,
          parentGuardianName: avaParent.displayName,
          relationshipTraceKey: [
            allowedTarget.studentId,
            allowedTarget.courseId,
            allowedTarget.progressSummaryId,
            'report-summary-parent-facing-preview',
          ].join('->'),
          relationshipTraceIds: [
            allowedTarget.studentId,
            allowedTarget.courseId,
            allowedTarget.classId,
            allowedTarget.progressSummaryId,
            allowedParentCase.sourceParentSummaryId ?? 'no-parent-summary',
            allowedParentCase.relationshipTraceKey,
          ],
          summary:
            'Ava A1 progress summary is the fixture source for a parent-facing message preview after permission and redaction checks.',
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
        },
      ];
    const reportSummary = reportSummaryRows[0];

    const permissionRedactionReferenceRows = [
      allowedParentCase,
      deniedParentCase,
    ].map<DemoLearningParentTeacherReportPermissionRedactionReferenceRow>(
      (permissionCase) => {
        const fieldRows = permissionReport.fieldVisibilityRows.filter(
          (row) => row.permissionCaseId === permissionCase.permissionCaseId,
        );
        const redactedFieldVisibilityIds = fieldRows
          .filter((row) => row.visibility === 'REDACTED')
          .map((row) => row.fieldVisibilityId);
        const deniedFieldVisibilityIds = fieldRows
          .filter((row) => row.visibility === 'DENIED')
          .map((row) => row.fieldVisibilityId);
        const relationshipTraceKey = [
          reportSummary.relationshipTraceKey,
          permissionCase.permissionCaseId,
          permissionCase.permissionDecision,
          'permission-redaction-reference',
        ].join('->');

        return {
          permissionRedactionReferenceId: `permission-redaction-reference-${permissionCase.permissionCaseId}`,
          permissionCaseId: permissionCase.permissionCaseId,
          actorId: permissionCase.actorId,
          actorRole: permissionCase.actorRole,
          permissionDecision: permissionCase.permissionDecision,
          reportScope: permissionCase.reportScope,
          visibleFieldCount: permissionCase.visibleFieldCount,
          redactedFieldCount: permissionCase.redactedFieldCount,
          deniedFieldCount: permissionCase.deniedFieldCount,
          redactedFieldVisibilityIds,
          deniedFieldVisibilityIds,
          permissionReason: permissionCase.decisionReason,
          relationshipTraceKey,
          relationshipTraceIds: [
            ...reportSummary.relationshipTraceIds,
            permissionCase.permissionCaseId,
            permissionCase.relationshipTraceKey,
            ...fieldRows.map((row) => row.relationshipTraceKey),
          ],
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
        };
      },
    );
    const referencesByPermissionCaseId = new Map(
      permissionRedactionReferenceRows.map((row) => [
        row.permissionCaseId,
        row,
      ]),
    );
    const requireReference = (permissionCaseId: string) => {
      const reference = referencesByPermissionCaseId.get(permissionCaseId);
      if (!reference) {
        throw new Error(
          `Missing local demo permission redaction reference ${permissionCaseId}`,
        );
      }

      return reference;
    };
    const allowedReference = requireReference(
      allowedParentCase.permissionCaseId,
    );
    const deniedReference = requireReference(deniedParentCase.permissionCaseId);

    const reviewQueueInputs = [
      {
        reviewQueueItemId:
          'review-queue-ava-a1-parent-progress-preview-approve',
        permissionCase: allowedParentCase,
        target: allowedTarget,
        parentGuardian: avaParent,
        reviewer: teacherMai,
        reference: allowedReference,
        reviewStatus: 'APPROVED' as const,
        createdAt: '2026-06-30T13:40:00.000Z',
        reviewedAt: '2026-06-30T13:45:00.000Z',
        reviewReason:
          'Teacher review approved the parent-facing preview because the owning-parent permission case is allowed and teacher-internal notes are redacted.',
        messagePreviewId: 'message-preview-ava-a1-parent-progress-approved',
        decisionTraceId: 'preview-decision-ava-a1-parent-progress-approved',
        messagePreview:
          'Ava is on track in A1 English with 86% completion. Teacher-only notes remain redacted in this local-demo preview.',
      },
      {
        reviewQueueItemId: 'review-queue-ava-a1-non-owner-preview-held',
        permissionCase: deniedParentCase,
        target: deniedTarget,
        parentGuardian: minhParent,
        reviewer: adminHoa,
        reference: deniedReference,
        reviewStatus: 'HELD_NEEDS_EDIT' as const,
        createdAt: '2026-06-30T13:42:00.000Z',
        reviewedAt: '2026-06-30T13:48:00.000Z',
        reviewReason:
          'Admin review held the preview because the requested guardian is not linked to child-ava-demo and all parent-facing fields are denied.',
        messagePreviewId: 'message-preview-ava-a1-non-owner-held',
        decisionTraceId: 'preview-decision-ava-a1-non-owner-held',
        messagePreview:
          'HELD_LOCAL_DEMO: no parent-facing message is sent or shown until the guardian-child relationship is corrected in fixture evidence.',
      },
    ];

    const reviewQueueRows =
      reviewQueueInputs.map<DemoLearningParentTeacherReportReviewQueueRow>(
        (input) => {
          const relationshipTraceKey = [
            input.target.studentId,
            input.target.courseId,
            reportSummary.reportSummaryId,
            input.reference.permissionRedactionReferenceId,
            input.reviewQueueItemId,
          ].join('->');

          return {
            reviewQueueItemId: input.reviewQueueItemId,
            reportSummaryId: reportSummary.reportSummaryId,
            permissionCaseId: input.permissionCase.permissionCaseId,
            permissionRedactionReferenceId:
              input.reference.permissionRedactionReferenceId,
            studentId: input.target.studentId,
            childProfileId: input.target.childProfileId,
            studentName: input.target.studentName,
            courseId: input.target.courseId,
            courseCode: input.target.courseCode,
            classId: input.target.classId,
            classCode: input.target.classCode,
            parentGuardianId: input.parentGuardian.id,
            parentGuardianName: input.parentGuardian.displayName,
            reviewerId: input.reviewer.id,
            reviewerName: input.reviewer.displayName,
            reviewerRole: input.reviewer.role,
            reviewStatus: input.reviewStatus,
            createdAt: input.createdAt,
            reviewedAt: input.reviewedAt,
            reviewReason: input.reviewReason,
            relationshipTraceKey,
            relationshipTraceIds: [
              input.target.studentId,
              input.target.courseId,
              reportSummary.reportSummaryId,
              input.permissionCase.permissionCaseId,
              input.reference.permissionRedactionReferenceId,
              ...input.reference.relationshipTraceIds,
              input.reviewQueueItemId,
              relationshipTraceKey,
            ],
            fixtureOnly: true,
            providerUsed: false,
            mutationUsed: false,
          };
        },
      );
    const reviewQueueRowsById = new Map(
      reviewQueueRows.map((row) => [row.reviewQueueItemId, row]),
    );

    const messagePreviewRows =
      reviewQueueInputs.map<DemoLearningParentTeacherReportMessagePreviewRow>(
        (input) => {
          const reviewQueueRow = reviewQueueRowsById.get(
            input.reviewQueueItemId,
          );
          if (!reviewQueueRow) {
            throw new Error(
              `Missing local demo review queue row ${input.reviewQueueItemId}`,
            );
          }

          const relationshipTraceKey = [
            reviewQueueRow.relationshipTraceKey,
            input.decisionTraceId,
            input.messagePreviewId,
          ].join('->');
          const approved = input.reviewStatus === 'APPROVED';

          return {
            messagePreviewId: input.messagePreviewId,
            reviewQueueItemId: input.reviewQueueItemId,
            reportSummaryId: reportSummary.reportSummaryId,
            permissionCaseId: input.permissionCase.permissionCaseId,
            permissionRedactionReferenceId:
              input.reference.permissionRedactionReferenceId,
            previewDecision: input.reviewStatus,
            decisionTraceId: input.decisionTraceId,
            studentId: input.target.studentId,
            childProfileId: input.target.childProfileId,
            studentName: input.target.studentName,
            courseId: input.target.courseId,
            courseCode: input.target.courseCode,
            classCode: input.target.classCode,
            parentGuardianId: input.parentGuardian.id,
            parentGuardianName: input.parentGuardian.displayName,
            reviewerName: input.reviewer.displayName,
            permissionDecision: input.permissionCase.permissionDecision,
            permissionEvidenceReferenced: true,
            redactionEvidenceReferenced:
              input.reference.redactedFieldVisibilityIds.length > 0 ||
              input.reference.deniedFieldVisibilityIds.length > 0,
            redactedFieldVisibilityIds:
              input.reference.redactedFieldVisibilityIds,
            deniedFieldVisibilityIds: input.reference.deniedFieldVisibilityIds,
            heldReason: approved ? null : input.reviewReason,
            approvalReason: approved ? input.reviewReason : null,
            messagePreview: input.messagePreview,
            relationshipTraceKey,
            relationshipTraceIds: [
              ...reviewQueueRow.relationshipTraceIds,
              input.decisionTraceId,
              input.messagePreviewId,
              relationshipTraceKey,
            ],
            fixtureOnly: true,
            providerUsed: false,
            aiProviderExecutionUsed: false,
            notificationDeliveryUsed: false,
            mutationUsed: false,
          };
        },
      );

    const remainingLocalDemoNotes = [
      'Review queue and preview rows are deterministic local-demo evidence, not persisted workflow state.',
      'Approved previews require an allowed permission case and referenced redaction evidence before any parent-facing text is marked approved.',
      'Held previews carry explicit reasons and do not call notification, AI, production DB, or parent-message delivery paths.',
    ];
    const safety = {
      ...permissionReport.safety,
    } satisfies DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
        return value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const approvedPreviewRows = messagePreviewRows.filter(
      (row) => row.previewDecision === 'APPROVED',
    );
    const heldPreviewRows = messagePreviewRows.filter(
      (row) => row.previewDecision === 'HELD_NEEDS_EDIT',
    );
    const evidenceRows: DemoLearningParentTeacherReportReviewQueueMessagePreviewEvidenceRow[] =
      [
        {
          evidenceKind: 'REPORT_SUMMARY_SOURCE',
          evidenceCount: reportSummaryRows.length,
          stableFixtureIds: reportSummaryRows.map(
            (row) => row.relationshipTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Parent-facing preview rows are generated from the existing Ava progress access report summary.',
        },
        {
          evidenceKind: 'PERMISSION_REDACTION_REFERENCE',
          evidenceCount: permissionRedactionReferenceRows.length,
          stableFixtureIds: permissionRedactionReferenceRows.map(
            (row) => row.relationshipTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Each preview decision references an allowed or denied permission case plus redacted or denied field evidence.',
        },
        {
          evidenceKind: 'REVIEW_QUEUE_DECISION',
          evidenceCount: reviewQueueRows.length,
          stableFixtureIds: reviewQueueRows.map(
            (row) => row.relationshipTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Teacher/admin queue items link student, course, report summary, permission evidence, and review decision.',
        },
        {
          evidenceKind: 'APPROVED_PARENT_PREVIEW',
          evidenceCount: approvedPreviewRows.length,
          stableFixtureIds: approvedPreviewRows.map(
            (row) => row.relationshipTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Approved parent-facing preview remains fixture-only and references redaction evidence before approval.',
        },
        {
          evidenceKind: 'HELD_PARENT_PREVIEW',
          evidenceCount: heldPreviewRows.length,
          stableFixtureIds: heldPreviewRows.map(
            (row) => row.relationshipTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Held preview has an explicit reason and no parent notification or message delivery.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: Object.entries(safety).map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'All production DB, provider, payment, notification, learning mutation, and ERP mutation gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Parent/Teacher Report Review Queue Message Preview Report',
      generatedFor:
        'local-demo-parent-teacher-report-review-queue-message-preview-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#parent-teacher-report-review-queue-message-preview',
      jsonExportPath:
        'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.json',
      markdownExportPath:
        'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Parent-facing report preview review queue is fixture-only, read-only, and references permission/redaction evidence before approval.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: fixture.students.length,
        parentGuardianCount: fixture.parentGuardians.length,
        teacherCount: fixture.contentOwners.filter(
          (owner) => owner.role === 'TEACHER' || owner.role === 'ADMIN',
        ).length,
        courseCount: fixture.courses.length,
        reportSummaryCount: reportSummaryRows.length,
        permissionRedactionReferenceCount:
          permissionRedactionReferenceRows.length,
        reviewQueueItemCount: reviewQueueRows.length,
        messagePreviewCount: messagePreviewRows.length,
        approvedPreviewCount: approvedPreviewRows.length,
        heldPreviewCount: heldPreviewRows.length,
        redactionAwarePreviewCount: messagePreviewRows.filter(
          (row) => row.redactionEvidenceReferenced,
        ).length,
        reviewDecisionTraceCount: messagePreviewRows.filter(
          (row) =>
            row.decisionTraceId.length > 0 &&
            row.relationshipTraceIds.includes(row.decisionTraceId),
        ).length,
        casesWithStableRelationshipTraceCount: messagePreviewRows.filter(
          (row) =>
            row.relationshipTraceIds.includes(row.studentId) &&
            row.relationshipTraceIds.includes(row.courseId) &&
            row.relationshipTraceIds.includes(reportSummary.reportSummaryId) &&
            row.relationshipTraceIds.includes(row.permissionCaseId) &&
            row.relationshipTraceIds.includes(row.reviewQueueItemId) &&
            row.relationshipTraceIds.includes(row.messagePreviewId),
        ).length,
        heldOrNeedsEditWithReasonCount: heldPreviewRows.filter((row) =>
          Boolean(row.heldReason),
        ).length,
        approvedWithPermissionRedactionEvidenceCount:
          approvedPreviewRows.filter(
            (row) =>
              row.permissionEvidenceReferenced &&
              row.redactionEvidenceReferenced,
          ).length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      reportSummaryRows,
      permissionRedactionReferenceRows,
      reviewQueueRows,
      messagePreviewRows,
      evidenceRows,
    };
  }

  buildParentPortalApprovedReportInboxReadReceiptReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentPortalApprovedReportInboxReadReceiptReport {
    const previewReport =
      this.buildParentTeacherReportReviewQueueMessagePreviewReport(
        fixture,
        generatedAt,
      );
    const approvedPreviewRows = previewReport.messagePreviewRows.filter(
      (row) => row.previewDecision === 'APPROVED',
    );
    const heldPreviewRows = previewReport.messagePreviewRows.filter(
      (row) => row.previewDecision === 'HELD_NEEDS_EDIT',
    );
    const progressAccessReport =
      this.buildParentTeacherProgressAccessSummaryReport(fixture, generatedAt);
    const alignedMinhProgressRow = progressAccessReport.progressRows.find(
      (row) =>
        row.studentId === 'student-minh' &&
        row.courseId === 'course-a1-starter',
    );
    if (!alignedMinhProgressRow) {
      throw new Error(
        'Missing local demo aligned Minh/course A1 progress evidence for parent inbox read receipt',
      );
    }
    const alignedMinhParentSummary =
      progressAccessReport.parentSummaryRows.find(
        (row) =>
          row.parentGuardianId === alignedMinhProgressRow.parentGuardianId &&
          row.studentId === alignedMinhProgressRow.studentId,
      );
    if (!alignedMinhParentSummary) {
      throw new Error(
        'Missing local demo aligned Minh parent summary evidence for parent inbox read receipt',
      );
    }
    const alignedMinhReportSummaryId =
      'report-summary-preview-progress-access-enroll-minh-a1-pending';
    const alignedMinhPermissionCaseId =
      'permission-case-parent-minh-own-child-aligned';
    const alignedMinhPermissionRedactionReferenceId =
      'permission-redaction-reference-permission-case-parent-minh-own-child-aligned';
    const alignedMinhReviewQueueItemId =
      'review-queue-minh-a1-parent-progress-preview-approve';
    const alignedMinhMessagePreviewId =
      'message-preview-minh-a1-parent-progress-approved';
    const alignedMinhDecisionTraceId =
      'preview-decision-minh-a1-parent-progress-approved';
    const alignedMinhParentInboxItemId =
      'parent-inbox-item-message-preview-minh-a1-parent-progress-approved';
    const alignedMinhRedactedFieldVisibilityIds = [
      'field-visibility-permission-case-parent-minh-own-child-aligned-teacherInternalSummary',
    ];
    const alignedMinhRelationshipTraceKey = [
      alignedMinhProgressRow.studentId,
      alignedMinhProgressRow.courseId,
      alignedMinhReportSummaryId,
      alignedMinhReviewQueueItemId,
      alignedMinhMessagePreviewId,
      alignedMinhParentInboxItemId,
    ].join('->');
    const parentInboxRows =
      previewReport.messagePreviewRows.map<DemoLearningParentPortalApprovedReportInboxRow>(
        (preview) => {
          const approved = preview.previewDecision === 'APPROVED';
          const parentInboxItemId = approved
            ? `parent-inbox-item-${preview.messagePreviewId}`
            : `parent-inbox-hidden-held-${preview.messagePreviewId}`;
          const relationshipTraceKey = [
            preview.studentId,
            preview.courseId,
            preview.reportSummaryId,
            preview.reviewQueueItemId,
            preview.messagePreviewId,
            parentInboxItemId,
          ].join('->');

          return {
            parentInboxItemId,
            messagePreviewId: preview.messagePreviewId,
            reviewQueueItemId: preview.reviewQueueItemId,
            reportSummaryId: preview.reportSummaryId,
            permissionCaseId: preview.permissionCaseId,
            permissionRedactionReferenceId:
              preview.permissionRedactionReferenceId,
            decisionTraceId: preview.decisionTraceId,
            studentId: preview.studentId,
            childProfileId: preview.childProfileId,
            studentName: preview.studentName,
            courseId: preview.courseId,
            courseCode: preview.courseCode,
            classCode: preview.classCode,
            parentGuardianId: preview.parentGuardianId,
            parentGuardianName: preview.parentGuardianName,
            inboxVisibility: approved
              ? 'VISIBLE_TO_PARENT'
              : 'HIDDEN_HELD_REVIEW',
            parentVisible: approved,
            hiddenFromParent: !approved,
            hiddenReason: approved ? null : preview.heldReason,
            visibleSubject: approved
              ? `${preview.studentName} ${preview.courseCode} progress update`
              : null,
            visibleBody: approved ? preview.messagePreview : null,
            visibleCourseLabel: approved
              ? `${preview.courseCode} / ${preview.classCode}`
              : null,
            permissionDecision: preview.permissionDecision,
            permissionEvidenceReferenced: preview.permissionEvidenceReferenced,
            redactionEvidenceReferenced: preview.redactionEvidenceReferenced,
            redactedFieldVisibilityIds: preview.redactedFieldVisibilityIds,
            deniedFieldVisibilityIds: preview.deniedFieldVisibilityIds,
            relationshipTraceKey,
            relationshipTraceIds: [
              ...preview.relationshipTraceIds,
              parentInboxItemId,
              relationshipTraceKey,
            ],
            fixtureOnly: true,
            providerUsed: false,
            aiProviderExecutionUsed: false,
            notificationDeliveryUsed: false,
            mutationUsed: false,
          };
        },
      );
    parentInboxRows.push({
      parentInboxItemId: alignedMinhParentInboxItemId,
      messagePreviewId: alignedMinhMessagePreviewId,
      reviewQueueItemId: alignedMinhReviewQueueItemId,
      reportSummaryId: alignedMinhReportSummaryId,
      permissionCaseId: alignedMinhPermissionCaseId,
      permissionRedactionReferenceId: alignedMinhPermissionRedactionReferenceId,
      decisionTraceId: alignedMinhDecisionTraceId,
      studentId: alignedMinhProgressRow.studentId,
      childProfileId: alignedMinhProgressRow.childProfileId,
      studentName: alignedMinhProgressRow.studentName,
      courseId: alignedMinhProgressRow.courseId,
      courseCode: alignedMinhProgressRow.courseCode,
      classCode: alignedMinhProgressRow.classCode,
      parentGuardianId: alignedMinhProgressRow.parentGuardianId,
      parentGuardianName: alignedMinhProgressRow.parentGuardianName,
      inboxVisibility: 'VISIBLE_TO_PARENT',
      parentVisible: true,
      hiddenFromParent: false,
      hiddenReason: null,
      visibleSubject: `${alignedMinhProgressRow.studentName} ${alignedMinhProgressRow.courseCode} progress update`,
      visibleBody: `${alignedMinhParentSummary.parentFacingSummary} Teacher-only recovery notes remain redacted in this aligned local-demo preview.`,
      visibleCourseLabel: `${alignedMinhProgressRow.courseCode} / ${alignedMinhProgressRow.classCode}`,
      permissionDecision: 'ALLOWED',
      permissionEvidenceReferenced: true,
      redactionEvidenceReferenced: true,
      redactedFieldVisibilityIds: alignedMinhRedactedFieldVisibilityIds,
      deniedFieldVisibilityIds: [],
      relationshipTraceKey: alignedMinhRelationshipTraceKey,
      relationshipTraceIds: [
        alignedMinhProgressRow.studentId,
        alignedMinhProgressRow.courseId,
        alignedMinhProgressRow.classId,
        alignedMinhProgressRow.progressSummaryId,
        alignedMinhReportSummaryId,
        alignedMinhParentSummary.parentSummaryId,
        alignedMinhParentSummary.relationshipTraceKey,
        ...alignedMinhParentSummary.relationshipTraceIds,
        alignedMinhPermissionCaseId,
        alignedMinhPermissionRedactionReferenceId,
        ...alignedMinhRedactedFieldVisibilityIds,
        alignedMinhReviewQueueItemId,
        alignedMinhDecisionTraceId,
        alignedMinhMessagePreviewId,
        alignedMinhParentInboxItemId,
        alignedMinhRelationshipTraceKey,
      ],
      fixtureOnly: true,
      providerUsed: false,
      aiProviderExecutionUsed: false,
      notificationDeliveryUsed: false,
      mutationUsed: false,
    });
    const visibleParentInboxRows = parentInboxRows.filter(
      (row) => row.parentVisible,
    );
    const hiddenHeldInboxRows = parentInboxRows.filter(
      (row) => row.hiddenFromParent,
    );
    const readAckRows =
      visibleParentInboxRows.map<DemoLearningParentPortalApprovedReportReadAckRow>(
        (row) => {
          const readAckEvidenceId = `read-ack-${row.parentInboxItemId}`;
          const relationshipTraceKey = [
            row.relationshipTraceKey,
            readAckEvidenceId,
          ].join('->');

          return {
            readAckEvidenceId,
            parentInboxItemId: row.parentInboxItemId,
            messagePreviewId: row.messagePreviewId,
            parentGuardianId: row.parentGuardianId,
            parentGuardianName: row.parentGuardianName,
            studentId: row.studentId,
            childProfileId: row.childProfileId,
            readAckStatus: 'READ_ACKNOWLEDGED',
            readAt: '2026-06-30T14:05:00.000Z',
            acknowledgedAt: '2026-06-30T14:06:00.000Z',
            acknowledgementLabel:
              'Parent opened the local-demo inbox preview and acknowledged the progress note.',
            evidenceReason:
              'Fixture read/ack evidence is generated only for an approved visible parent inbox item.',
            relationshipTraceKey,
            relationshipTraceIds: [
              ...row.relationshipTraceIds,
              readAckEvidenceId,
              relationshipTraceKey,
            ],
            fixtureOnly: true,
            providerUsed: false,
            notificationDeliveryUsed: false,
            mutationUsed: false,
          };
        },
      );

    const remainingLocalDemoNotes = [
      'Parent portal inbox/read receipt rows are deterministic local-demo evidence, not persisted parent portal state.',
      'Only approved previews produce parent-visible subject and body fields; held previews stay hidden and carry explicit internal reasons.',
      'Read/ack evidence is fixture-only and does not call notification providers, production DB, auth/privacy policy, or parent-message delivery paths.',
    ];
    const safety = {
      ...previewReport.safety,
    } satisfies DemoLearningParentPortalApprovedReportInboxReadReceiptSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
        return value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const parentInboxTraceCount = parentInboxRows.filter(
      (row) =>
        row.relationshipTraceIds.includes(row.studentId) &&
        row.relationshipTraceIds.includes(row.courseId) &&
        row.relationshipTraceIds.includes(row.reportSummaryId) &&
        row.relationshipTraceIds.includes(row.reviewQueueItemId) &&
        row.relationshipTraceIds.includes(row.messagePreviewId) &&
        row.relationshipTraceIds.includes(row.parentInboxItemId),
    ).length;
    const parentInboxRowsById = new Map(
      parentInboxRows.map((row) => [row.parentInboxItemId, row]),
    );
    const alignedApprovedParentInboxRows = visibleParentInboxRows.filter(
      (row) =>
        row.studentId === 'student-minh' &&
        row.courseId === 'course-a1-starter' &&
        row.parentGuardianId === 'guardian-minh-parent' &&
        row.permissionDecision === 'ALLOWED',
    );
    const alignedParentReadAckRows = readAckRows.filter((row) => {
      const parentInboxRow = parentInboxRowsById.get(row.parentInboxItemId);

      return (
        row.studentId === 'student-minh' &&
        parentInboxRow?.courseId === 'course-a1-starter' &&
        row.parentGuardianId === 'guardian-minh-parent'
      );
    });
    const stableAlignedReadReceiptTraceRows = alignedParentReadAckRows.filter(
      (row) => {
        const parentInboxRow = parentInboxRowsById.get(row.parentInboxItemId);

        return (
          Boolean(parentInboxRow) &&
          row.relationshipTraceIds.includes(row.studentId) &&
          row.relationshipTraceIds.includes(parentInboxRow?.courseId ?? '') &&
          row.relationshipTraceIds.includes(row.parentInboxItemId) &&
          row.relationshipTraceIds.includes(row.readAckEvidenceId)
        );
      },
    );
    const evidenceRows: DemoLearningParentPortalApprovedReportInboxReadReceiptEvidenceRow[] =
      [
        {
          evidenceKind: 'VISIBLE_PARENT_INBOX_ITEM',
          evidenceCount: visibleParentInboxRows.length,
          stableFixtureIds: visibleParentInboxRows.map(
            (row) => row.relationshipTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Approved previews become visible parent inbox rows with parent-facing subject and body fields.',
        },
        {
          evidenceKind: 'HIDDEN_HELD_PREVIEW',
          evidenceCount: hiddenHeldInboxRows.length,
          stableFixtureIds: hiddenHeldInboxRows.map(
            (row) => row.relationshipTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Held previews remain hidden from the parent inbox surface and carry an explicit internal reason.',
        },
        {
          evidenceKind: 'READ_ACK_RECEIPT',
          evidenceCount: readAckRows.length,
          stableFixtureIds: readAckRows.map((row) => row.relationshipTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Fixture read/ack evidence links the visible inbox item back to the approved preview.',
        },
        {
          evidenceKind: 'ALIGNED_APPROVED_DELIVERY_READ_RECEIPT',
          evidenceCount: stableAlignedReadReceiptTraceRows.length,
          stableFixtureIds: stableAlignedReadReceiptTraceRows.map(
            (row) => row.relationshipTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Aligned Minh/course A1 approved inbox and read/ack evidence is available for the MVP readiness trace without notification delivery.',
        },
        {
          evidenceKind: 'PERMISSION_REDACTION_REFERENCE',
          evidenceCount:
            previewReport.permissionRedactionReferenceRows.length +
            alignedApprovedParentInboxRows.length,
          stableFixtureIds: [
            ...previewReport.permissionRedactionReferenceRows.map(
              (row) => row.relationshipTraceKey,
            ),
            ...alignedApprovedParentInboxRows.map(
              (row) => row.permissionRedactionReferenceId,
            ),
          ],
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Visible and hidden inbox evidence carries forward permission and redaction references from the review preview.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: Object.entries(safety).map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Production DB, provider, payment, notification, AI execution, learning mutation, and ERP mutation gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Parent Portal Approved Report Inbox Read Receipt Report',
      generatedFor:
        'local-demo-parent-portal-approved-report-inbox-read-receipt-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#parent-portal-approved-report-inbox-read-receipt',
      jsonExportPath:
        'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
      markdownExportPath:
        'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Parent portal inbox/read receipt evidence is fixture-only and only exposes approved parent-facing previews.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: fixture.students.length,
        parentGuardianCount: fixture.parentGuardians.length,
        teacherCount: fixture.contentOwners.filter(
          (owner) => owner.role === 'TEACHER' || owner.role === 'ADMIN',
        ).length,
        courseCount: fixture.courses.length,
        approvedPreviewCount:
          approvedPreviewRows.length + alignedApprovedParentInboxRows.length,
        heldPreviewCount: heldPreviewRows.length,
        parentInboxItemCount: parentInboxRows.length,
        visibleParentInboxItemCount: visibleParentInboxRows.length,
        hiddenHeldPreviewCount: hiddenHeldInboxRows.length,
        readAckEvidenceCount: readAckRows.length,
        permissionRedactionReferenceCount:
          previewReport.permissionRedactionReferenceRows.length +
          alignedApprovedParentInboxRows.length,
        parentInboxTraceCount,
        visibleInboxItemsWithStableRelationshipTraceCount:
          visibleParentInboxRows.filter(
            (row) =>
              row.relationshipTraceIds.includes(row.studentId) &&
              row.relationshipTraceIds.includes(row.courseId) &&
              row.relationshipTraceIds.includes(row.reportSummaryId) &&
              row.relationshipTraceIds.includes(row.reviewQueueItemId) &&
              row.relationshipTraceIds.includes(row.messagePreviewId) &&
              row.relationshipTraceIds.includes(row.parentInboxItemId),
          ).length,
        hiddenHeldPreviewsWithReasonCount: hiddenHeldInboxRows.filter((row) =>
          Boolean(row.hiddenReason),
        ).length,
        visibleParentPreviewWithPermissionRedactionEvidenceCount:
          visibleParentInboxRows.filter(
            (row) =>
              row.permissionEvidenceReferenced &&
              row.redactionEvidenceReferenced,
          ).length,
        alignedApprovedParentInboxEntryCount:
          alignedApprovedParentInboxRows.length,
        alignedParentReadReceiptCount: alignedParentReadAckRows.length,
        stableAlignedReadReceiptTraceCount:
          stableAlignedReadReceiptTraceRows.length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      parentInboxRows,
      readAckRows,
      evidenceRows,
    };
  }

  buildClassSessionAttendanceProgressReport(
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
    const sessionsByClassId = this.groupBy(
      fixture.sessions,
      (session) => session.classId,
    );
    const attendanceByEnrollmentId = this.groupBy(
      fixture.attendance,
      (attendance) => attendance.enrollmentId,
    );
    const attendanceBySessionId = this.groupBy(
      fixture.attendance,
      (attendance) => attendance.sessionId,
    );

    const learnerRows = fixture.progress
      .map((progress) => {
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          progress.enrollmentId,
        );
        const student = this.requireStudent(studentsById, enrollment);
        const course = this.requireCourseById(coursesById, progress.courseId);
        const classCohort = this.requireClass(classesById, progress.classId);
        const classSessions = sessionsByClassId.get(classCohort.id) ?? [];
        const attendanceRecords =
          attendanceByEnrollmentId.get(enrollment.id) ?? [];
        const attendanceCounts =
          this.countAttendanceStatuses(attendanceRecords);
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
          attendanceRatePercent: this.percent(
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
        this.buildSessionRow({
          session,
          classCohort: this.requireClass(classesById, session.classId),
          course: this.requireCourseById(coursesById, session.courseId),
          attendance: attendanceBySessionId.get(session.id) ?? [],
        }),
      )
      .sort((left, right) =>
        [left.classCode, String(left.sequence), left.sessionId]
          .join('|')
          .localeCompare(
            [right.classCode, String(right.sequence), right.sessionId].join(
              '|',
            ),
          ),
      );

    const statusCounts = this.buildClassSessionStatusCounts(fixture);
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
        attendanceRatePercent: this.percent(
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
        overallCompletionPercent: this.percent(
          completedLessonCount,
          totalLessonCount,
        ),
        averageLearnerCompletionPercent: this.averagePercent(
          learnerRows.map((row) => row.completionPercent),
        ),
      },
      statusCounts,
      classAggregates: this.buildClassAggregates({
        classes: fixture.classes,
        coursesById,
        learnerRows,
        sessionRows,
      }),
      sessionRows,
      learnerRows,
    };
  }

  buildLessonAssignmentAssessmentProgressReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningLessonAssignmentAssessmentProgressReport {
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
    const assignmentsByLessonId = this.groupBy(
      fixture.assignments,
      (assignment) => assignment.lessonId,
    );
    const submissionsByAssignmentId = this.groupBy(
      fixture.submissions,
      (submission) => submission.assignmentId,
    );
    const submissionsByEnrollmentId = this.groupBy(
      fixture.submissions,
      (submission) => submission.enrollmentId,
    );

    const assignmentRows = fixture.assignments
      .map((assignment) => {
        const lesson = this.requireLesson(lessonsById, assignment.lessonId);
        const classCohort = this.requireClass(classesById, assignment.classId);
        const course = this.requireCourseById(coursesById, assignment.courseId);
        const submissions = submissionsByAssignmentId.get(assignment.id) ?? [];

        return this.buildAssignmentAssessmentRow({
          assignment,
          lesson,
          classCohort,
          course,
          submissions,
        });
      })
      .sort((left, right) =>
        [left.classCode, left.lessonCode, left.kind, left.assignmentId]
          .join('|')
          .localeCompare(
            [
              right.classCode,
              right.lessonCode,
              right.kind,
              right.assignmentId,
            ].join('|'),
          ),
      );

    const lessonRows = fixture.lessons
      .map((lesson) => {
        const classCohort = this.requireClass(classesById, lesson.classId);
        const course = this.requireCourseById(coursesById, lesson.courseId);
        const assignments = assignmentsByLessonId.get(lesson.id) ?? [];
        const submissions = assignments.flatMap(
          (assignment) => submissionsByAssignmentId.get(assignment.id) ?? [],
        );

        return this.buildLessonAssessmentRow({
          lesson,
          classCohort,
          course,
          assignments,
          submissions,
        });
      })
      .sort((left, right) =>
        [left.classCode, String(left.sequence), left.lessonId]
          .join('|')
          .localeCompare(
            [right.classCode, String(right.sequence), right.lessonId].join('|'),
          ),
      );

    const learnerRows = fixture.progress
      .map((progress) => {
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          progress.enrollmentId,
        );
        const student = this.requireStudent(studentsById, enrollment);
        const course = this.requireCourseById(coursesById, progress.courseId);
        const classCohort = this.requireClass(classesById, progress.classId);
        const classAssignments = fixture.assignments.filter(
          (assignment) => assignment.classId === classCohort.id,
        );
        const classAssignmentIds = new Set(
          classAssignments.map((assignment) => assignment.id),
        );
        const submissions = (
          submissionsByEnrollmentId.get(enrollment.id) ?? []
        ).filter((submission) =>
          classAssignmentIds.has(submission.assignmentId),
        );

        return this.buildLearnerAssessmentRow({
          enrollment,
          student,
          course,
          classCohort,
          progressStatus: progress.status,
          progressCompletionPercent: progress.completionPercent,
          expectedAssignmentCount: classAssignments.length,
          submissions,
        });
      })
      .sort((left, right) =>
        [left.classCode, left.studentName, left.enrollmentId]
          .join('|')
          .localeCompare(
            [right.classCode, right.studentName, right.enrollmentId].join('|'),
          ),
      );

    const statusCounts =
      this.buildLessonAssignmentAssessmentStatusCounts(fixture);
    const completedSubmissionCount =
      statusCounts.submission.SUBMITTED +
      statusCounts.submission.LATE +
      statusCounts.submission.RESUBMITTED;
    const scoreBandCounts = this.countScoreBands(fixture.submissions);
    const expectedSubmissionCount = assignmentRows.reduce(
      (sum, row) => sum + row.expectedSubmissionCount,
      0,
    );

    return {
      reportName:
        'Learning local demo Lesson -> Assignment/Quiz -> Submission -> Score/Feedback -> Progress Report',
      generatedFor: 'local-demo-lesson-assignment-assessment-progress-report',
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
        realLessonMutationUsed: false,
        realAssignmentMutationUsed: false,
        realAssessmentMutationUsed: false,
        realPaymentMutationUsed: false,
        realRefundMutationUsed: false,
        realCommissionMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      },
      totals: {
        studentCount: fixture.students.length,
        courseCount: fixture.courses.length,
        classCount: fixture.classes.length,
        lessonCount: fixture.lessons.length,
        publishedLessonCount: statusCounts.lesson.PUBLISHED,
        scheduledLessonCount: statusCounts.lesson.SCHEDULED,
        assignmentCount: fixture.assignments.length,
        quizCount: fixture.assignments.filter(
          (assignment) => assignment.kind === 'QUIZ',
        ).length,
        assignmentTaskCount: fixture.assignments.filter(
          (assignment) => assignment.kind === 'ASSIGNMENT',
        ).length,
        openAssignmentCount: statusCounts.assignment.OPEN,
        closedAssignmentCount: statusCounts.assignment.CLOSED,
        expectedSubmissionCount,
        submissionRecordCount: fixture.submissions.length,
        submittedSubmissionCount: statusCounts.submission.SUBMITTED,
        lateSubmissionCount: statusCounts.submission.LATE,
        missingSubmissionCount: statusCounts.submission.MISSING,
        resubmittedSubmissionCount: statusCounts.submission.RESUBMITTED,
        completedSubmissionCount,
        scoredSubmissionCount: this.countScoredSubmissions(fixture.submissions),
        feedbackGivenCount: statusCounts.feedback.GIVEN,
        pendingFeedbackCount: statusCounts.feedback.PENDING,
        feedbackNotRequiredCount: statusCounts.feedback.NOT_REQUIRED,
        excellentScoreCount: scoreBandCounts.EXCELLENT,
        onTrackScoreCount: scoreBandCounts.ON_TRACK,
        needsSupportScoreCount: scoreBandCounts.NEEDS_SUPPORT,
        missingScoreCount: scoreBandCounts.MISSING,
        averageScorePercent: this.averageSubmissionScorePercent(
          fixture.submissions,
        ),
        learnerAssessmentCount: learnerRows.length,
        excellentLearnerCount: learnerRows.filter(
          (row) => row.assessmentBand === 'EXCELLENT',
        ).length,
        onTrackLearnerCount: learnerRows.filter(
          (row) => row.assessmentBand === 'ON_TRACK',
        ).length,
        needsSupportLearnerCount: learnerRows.filter(
          (row) => row.assessmentBand === 'NEEDS_SUPPORT',
        ).length,
        missingLearnerCount: learnerRows.filter(
          (row) => row.assessmentBand === 'MISSING',
        ).length,
        withdrawnLearnerCount: learnerRows.filter(
          (row) => row.assessmentBand === 'WITHDRAWN',
        ).length,
        overallAssignmentCompletionPercent: this.percent(
          completedSubmissionCount,
          expectedSubmissionCount,
        ),
        averageLearnerScorePercent: this.averagePercent(
          learnerRows
            .filter((row) => row.scoredSubmissionCount > 0)
            .map((row) => row.averageScorePercent),
        ),
      },
      statusCounts,
      lessonRows,
      assignmentRows,
      learnerRows,
    };
  }

  buildLearningPathDailyPlanVideoPracticeEvidenceReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningPathDailyPlanVideoPracticeEvidenceReport {
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
    const dailyPlansByPathId = this.groupBy(
      fixture.dailyPlans,
      (plan) => plan.learningPathId,
    );
    const videoEvidenceByDailyPlanId = new Map(
      fixture.videoEvidence.map((evidence) => [evidence.dailyPlanId, evidence]),
    );
    const practiceAttemptByDailyPlanId = new Map(
      fixture.practiceAttempts.map((attempt) => [attempt.dailyPlanId, attempt]),
    );

    const dailyPlanRows = fixture.dailyPlans
      .map((plan) => {
        const learningPath = this.requireLearningPath(
          pathsById,
          plan.learningPathId,
        );
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          plan.enrollmentId,
        );
        const student = this.requireStudent(studentsById, enrollment);
        const course = this.requireCourseById(coursesById, plan.courseId);
        const classCohort = this.requireClass(classesById, plan.classId);
        const lesson = this.requireLesson(lessonsById, plan.lessonId);
        const videoEvidence = this.requireVideoEvidence(
          videoEvidenceByDailyPlanId,
          plan.id,
        );
        const practiceAttempt = this.requirePracticeAttempt(
          practiceAttemptByDailyPlanId,
          plan.id,
        );

        return this.buildDailyPlanEvidenceRow({
          plan,
          learningPath,
          enrollment,
          student,
          course,
          classCohort,
          lesson,
          videoEvidence,
          practiceAttempt,
        });
      })
      .sort((left, right) =>
        [
          left.classCode,
          left.studentName,
          String(left.sequence),
          left.dailyPlanId,
        ]
          .join('|')
          .localeCompare(
            [
              right.classCode,
              right.studentName,
              String(right.sequence),
              right.dailyPlanId,
            ].join('|'),
          ),
      );

    const learningPathRows = fixture.learningPaths
      .map((learningPath) => {
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          learningPath.enrollmentId,
        );
        const student = this.requireStudent(studentsById, enrollment);
        const course = this.requireCourseById(
          coursesById,
          learningPath.courseId,
        );
        const classCohort = this.requireClass(
          classesById,
          learningPath.classId,
        );
        const dailyPlans = dailyPlansByPathId.get(learningPath.id) ?? [];
        const videoEvidence = dailyPlans.map((plan) =>
          this.requireVideoEvidence(videoEvidenceByDailyPlanId, plan.id),
        );
        const practiceAttempts = dailyPlans.map((plan) =>
          this.requirePracticeAttempt(practiceAttemptByDailyPlanId, plan.id),
        );

        return this.buildLearningPathEvidenceRow({
          learningPath,
          enrollment,
          student,
          course,
          classCohort,
          dailyPlans,
          videoEvidence,
          practiceAttempts,
        });
      })
      .sort((left, right) =>
        [left.classCode, left.studentName, left.learningPathId]
          .join('|')
          .localeCompare(
            [right.classCode, right.studentName, right.learningPathId].join(
              '|',
            ),
          ),
      );

    const statusCounts =
      this.buildLearningPathDailyPlanVideoPracticeStatusCounts(
        fixture,
        learningPathRows,
      );
    const completedDailyPlanCount = statusCounts.dailyPlan.COMPLETED;
    const scoredPracticeAttempts = fixture.practiceAttempts.filter(
      (attempt) => attempt.scorePercent !== undefined,
    );

    return {
      reportName:
        'Learning local demo Learning Path -> Daily Plan -> Video Evidence -> Practice Attempt -> Progress Report',
      generatedFor:
        'local-demo-learning-path-daily-plan-video-practice-evidence-report',
      generatedAt,
      currency: fixture.currency,
      safety: {
        fixtureOnly: true,
        productionDbUsed: false,
        noProductionDbRead: true,
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
        realLessonMutationUsed: false,
        realAssignmentMutationUsed: false,
        realAssessmentMutationUsed: false,
        realLearningPathMutationUsed: false,
        realDailyPlanMutationUsed: false,
        realVideoEvidenceMutationUsed: false,
        realPracticeMutationUsed: false,
        realPaymentMutationUsed: false,
        realRefundMutationUsed: false,
        realCommissionMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      },
      totals: {
        studentCount: new Set(
          fixture.learningPaths.map((path) => path.studentId),
        ).size,
        courseCount: new Set(fixture.learningPaths.map((path) => path.courseId))
          .size,
        learningPathCount: fixture.learningPaths.length,
        activeLearningPathCount: statusCounts.learningPath.ACTIVE,
        completedLearningPathCount: statusCounts.learningPath.COMPLETED,
        needsSupportLearningPathCount: statusCounts.learningPath.NEEDS_SUPPORT,
        withdrawnLearningPathCount: statusCounts.learningPath.WITHDRAWN,
        dailyPlanCount: fixture.dailyPlans.length,
        completedDailyPlanCount,
        inProgressDailyPlanCount: statusCounts.dailyPlan.IN_PROGRESS,
        blockedDailyPlanCount: statusCounts.dailyPlan.BLOCKED,
        skippedDailyPlanCount: statusCounts.dailyPlan.SKIPPED,
        assignedDailyPlanCount: statusCounts.dailyPlan.ASSIGNED,
        blockedSkippedIncompleteDailyPlanCount:
          fixture.dailyPlans.length - completedDailyPlanCount,
        videoEvidenceCount: fixture.videoEvidence.length,
        completedVideoCount: statusCounts.videoEvidence.COMPLETED,
        incompleteVideoCount: statusCounts.videoEvidence.INCOMPLETE,
        skippedVideoCount: statusCounts.videoEvidence.SKIPPED,
        practiceAttemptCount: fixture.practiceAttempts.length,
        passedPracticeCount: statusCounts.practiceAttempt.PASSED,
        needsRetryPracticeCount: statusCounts.practiceAttempt.NEEDS_RETRY,
        incompletePracticeCount: statusCounts.practiceAttempt.INCOMPLETE,
        skippedPracticeCount: statusCounts.practiceAttempt.SKIPPED,
        averagePracticeScorePercent: this.averagePercent(
          scoredPracticeAttempts.map((attempt) => attempt.scorePercent ?? 0),
        ),
        overallDailyPlanCompletionPercent: this.percent(
          completedDailyPlanCount,
          fixture.dailyPlans.length,
        ),
        averageLearnerProgressPercent: this.averagePercent(
          learningPathRows.map((row) => row.progressPercent),
        ),
        onTrackLearnerCount: statusCounts.learnerBand.ON_TRACK,
        needsSupportLearnerCount: statusCounts.learnerBand.NEEDS_SUPPORT,
        inactiveLearnerCount: statusCounts.learnerBand.INACTIVE,
        withdrawnLearnerCount: statusCounts.learnerBand.WITHDRAWN,
      },
      statusCounts,
      learningPathRows,
      dailyPlanRows,
    };
  }

  buildParentTeacherProgressAlertInterventionReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentTeacherProgressAlertInterventionReport {
    const pathReport =
      this.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        fixture,
        generatedAt,
      );
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
    const progressByEnrollmentId = new Map(
      fixture.progress.map((progress) => [progress.enrollmentId, progress]),
    );
    const submissionsByEnrollmentId = this.groupBy(
      fixture.submissions,
      (submission) => submission.enrollmentId,
    );
    const attendanceByEnrollmentId = this.groupBy(
      fixture.attendance,
      (attendance) => attendance.enrollmentId,
    );
    const dailyPlansByPathId = this.groupBy(
      fixture.dailyPlans,
      (plan) => plan.learningPathId,
    );
    const videoEvidenceByPathId = this.groupBy(
      fixture.videoEvidence,
      (evidence) => evidence.learningPathId,
    );
    const practiceAttemptsByPathId = this.groupBy(
      fixture.practiceAttempts,
      (attempt) => attempt.learningPathId,
    );

    const contexts = pathReport.learningPathRows.map((pathRow) => {
      const enrollment = this.requireEnrollment(
        enrollmentsById,
        pathRow.enrollmentId,
      );
      const student = this.requireStudent(studentsById, enrollment);
      const course = this.requireCourseById(coursesById, pathRow.courseId);
      const classCohort = this.requireClass(classesById, pathRow.classId);
      const progress = this.requireProgress(
        progressByEnrollmentId,
        pathRow.enrollmentId,
      );
      const submissions = submissionsByEnrollmentId.get(enrollment.id) ?? [];
      const submissionCounts = this.countSubmissionStatuses(submissions);
      const attendance = attendanceByEnrollmentId.get(enrollment.id) ?? [];
      const attendanceCounts = this.countAttendanceStatuses(attendance);
      const dailyPlans = dailyPlansByPathId.get(pathRow.learningPathId) ?? [];
      const dailyPlanCounts = this.countDailyPlanStatuses(dailyPlans);
      const videoEvidence =
        videoEvidenceByPathId.get(pathRow.learningPathId) ?? [];
      const videoEvidenceCounts =
        this.countVideoEvidenceStatuses(videoEvidence);
      const practiceAttempts =
        practiceAttemptsByPathId.get(pathRow.learningPathId) ?? [];

      return {
        learningPathId: pathRow.learningPathId,
        enrollmentId: pathRow.enrollmentId,
        student,
        course,
        classCohort,
        progress,
        pathStatus: pathRow.pathStatus,
        progressPercent: pathRow.progressPercent,
        attendanceRatePercent: this.percent(
          attendanceCounts.PRESENT + attendanceCounts.LATE,
          attendance.length,
        ),
        absentAttendanceCount: attendanceCounts.ABSENT,
        missingSubmissionCount: submissionCounts.MISSING,
        skippedVideoCount: videoEvidenceCounts.SKIPPED,
        incompleteVideoCount: videoEvidenceCounts.INCOMPLETE,
        blockedDailyPlanCount: dailyPlanCounts.BLOCKED,
        skippedDailyPlanCount: dailyPlanCounts.SKIPPED,
        incompleteDailyPlanCount: dailyPlans.length - dailyPlanCounts.COMPLETED,
        averagePracticeScorePercent:
          this.averagePracticeScorePercent(practiceAttempts),
      } satisfies ParentTeacherProgressAlertContext;
    });

    const alertRows = contexts
      .flatMap((context) => this.buildParentTeacherProgressAlertRows(context))
      .sort((left, right) =>
        [
          left.alertSeverity === 'HIGH' ? '0' : '1',
          left.classCode,
          left.studentName,
          left.alertReason,
        ]
          .join('|')
          .localeCompare(
            [
              right.alertSeverity === 'HIGH' ? '0' : '1',
              right.classCode,
              right.studentName,
              right.alertReason,
            ].join('|'),
          ),
      );
    const alertsByEnrollmentId = this.groupBy(
      alertRows,
      (row) => row.enrollmentId,
    );
    const learnerSummaries = contexts
      .map((context) =>
        this.buildParentTeacherLearnerSummaryRow(
          context,
          alertsByEnrollmentId.get(context.enrollmentId) ?? [],
        ),
      )
      .sort((left, right) =>
        [left.classCode, left.studentName, left.learningPathId]
          .join('|')
          .localeCompare(
            [right.classCode, right.studentName, right.learningPathId].join(
              '|',
            ),
          ),
      );
    const statusCounts =
      this.buildParentTeacherProgressAlertStatusCounts(alertRows);
    const resolvedAlertCount = statusCounts.followUpStatus.RESOLVED;

    return {
      reportName:
        'Learning local demo Parent/Teacher Progress Alert -> Intervention -> Parent Summary Report',
      generatedFor:
        'local-demo-parent-teacher-progress-alert-intervention-report',
      generatedAt,
      currency: fixture.currency,
      safety: {
        fixtureOnly: true,
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
        realParentMessageMutationUsed: false,
        realTeacherInterventionMutationUsed: false,
        realPaymentMutationUsed: false,
        realRefundMutationUsed: false,
        realCommissionMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      },
      totals: {
        studentCount: new Set(learnerSummaries.map((row) => row.studentId))
          .size,
        courseCount: new Set(learnerSummaries.map((row) => row.courseId)).size,
        learnerProgressSummaryCount: learnerSummaries.length,
        alertCount: alertRows.length,
        highRiskAlertCount: statusCounts.alertSeverity.HIGH,
        mediumRiskAlertCount: statusCounts.alertSeverity.MEDIUM,
        resolvedAlertCount,
        followUpNeededAlertCount: alertRows.length - resolvedAlertCount,
        teacherInterventionRecommendationCount: alertRows.length,
        parentSummaryCount: alertRows.length,
        openFollowUpCount: statusCounts.followUpStatus.OPEN,
        scheduledFollowUpCount: statusCounts.followUpStatus.SCHEDULED,
        resolvedFollowUpCount: statusCounts.followUpStatus.RESOLVED,
        monitoringFollowUpCount: statusCounts.followUpStatus.MONITORING,
      },
      statusCounts,
      topAlertReasons: this.buildTopAlertReasonRows(statusCounts.alertReason),
      learnerSummaries,
      alertRows,
    };
  }

  buildParentScreenTimeGuardianControlsReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentScreenTimeGuardianControlsReport {
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
    const dailyPlansById = new Map(
      fixture.dailyPlans.map((plan) => [plan.id, plan]),
    );
    const policiesById = new Map(
      fixture.screenTimePolicies.map((policy) => [policy.id, policy]),
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
    const policiesByStudentId = this.groupBy(
      fixture.screenTimePolicies,
      (policy) => policy.studentId,
    );
    const gatesByStudentId = this.groupBy(
      fixture.sessionGates,
      (gate) => gate.studentId,
    );
    const grantsByStudentId = this.groupBy(
      fixture.screenTimeGrantRequests,
      (grant) => grant.studentId,
    );

    const gateRows = fixture.sessionGates
      .map((gate) => {
        const dailyPlan = this.requireDailyPlan(
          dailyPlansById,
          gate.dailyPlanId,
        );
        const policy = this.requireScreenTimePolicy(
          policiesById,
          gate.policyId,
        );
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          gate.enrollmentId,
        );

        return this.buildParentScreenTimeGateRow({
          gate,
          dailyPlan,
          guardian: this.requireGuardian(guardiansById, policy.guardianId),
          enrollment,
          student: this.requireStudentById(studentsById, gate.studentId),
          course: this.requireCourseById(coursesById, dailyPlan.courseId),
          classesById,
          lessonsById,
        });
      })
      .sort((left, right) =>
        [left.studentName, left.requestedAt, left.gateId]
          .join('|')
          .localeCompare(
            [right.studentName, right.requestedAt, right.gateId].join('|'),
          ),
      );

    const grantRows = fixture.screenTimeGrantRequests
      .map((grant) =>
        this.buildParentScreenTimeGrantRow({
          grant,
          guardian: this.requireGuardian(guardiansById, grant.guardianId),
          student: this.requireStudentById(studentsById, grant.studentId),
        }),
      )
      .sort((left, right) =>
        [left.studentName, left.requestedAt, left.grantRequestId]
          .join('|')
          .localeCompare(
            [right.studentName, right.requestedAt, right.grantRequestId].join(
              '|',
            ),
          ),
      );

    const childRows = fixture.students
      .map((student) => {
        const guardian = this.requireGuardianByChildProfileId(
          guardianByChildProfileId,
          student.childProfileId,
        );
        const policies = policiesByStudentId.get(student.id) ?? [];
        const activePolicy =
          policies.find((policy) => policy.status === 'ACTIVE') ?? null;
        const displayPolicy = activePolicy ?? policies[0] ?? null;
        const studentGates = gatesByStudentId.get(student.id) ?? [];
        const studentGrants = grantsByStudentId.get(student.id) ?? [];
        const enrollmentRows = fixture.enrollments.filter(
          (enrollment) => enrollment.studentId === student.id,
        );
        const courseIds = [
          ...new Set(enrollmentRows.map((enrollment) => enrollment.courseId)),
        ];
        const courseCodes = courseIds.map(
          (courseId) => this.requireCourseById(coursesById, courseId).code,
        );
        const approvedGrantMinutes = studentGrants.reduce(
          (sum, grant) =>
            grant.decision === 'APPROVED' ? sum + grant.grantedMinutes : sum,
          0,
        );
        const totalAllowedMinutes =
          (activePolicy?.dailyAllowedMinutes ?? 0) + approvedGrantMinutes;
        const usedMinutes = studentGates.reduce(
          (sum, gate) =>
            gate.decision === 'BLOCKED' ? sum : sum + gate.requestedMinutes,
          0,
        );
        const blockedSessionCount = studentGates.filter(
          (gate) => gate.decision === 'BLOCKED',
        ).length;
        const deniedGrantCount = studentGrants.filter(
          (grant) => grant.decision === 'DENIED',
        ).length;
        const needsParentAttention =
          blockedSessionCount > 0 || deniedGrantCount > 0;

        return {
          guardianId: guardian.id,
          guardianName: guardian.displayName,
          guardianEmail: guardian.email,
          relationship: guardian.relationship,
          studentId: student.id,
          childProfileId: student.childProfileId,
          studentName: student.displayName,
          courseIds,
          courseCodes,
          activePolicyId: activePolicy?.id ?? null,
          policyStatus: displayPolicy?.status ?? 'DISABLED',
          dailyAllowedMinutes: activePolicy?.dailyAllowedMinutes ?? 0,
          approvedGrantMinutes,
          totalAllowedMinutes,
          usedMinutes,
          remainingMinutes: Math.max(totalAllowedMinutes - usedMinutes, 0),
          grantRequestCount: studentGrants.length,
          grantDecisionCount: studentGrants.filter(
            (grant) => grant.decision !== 'PENDING',
          ).length,
          allowedSessionCount: studentGates.filter(
            (gate) => gate.decision === 'ALLOWED',
          ).length,
          blockedSessionCount,
          overrideSessionCount: studentGates.filter(
            (gate) => gate.decision === 'OVERRIDE_ALLOWED',
          ).length,
          needsParentAttention,
          parentAttentionReason: needsParentAttention
            ? this.buildParentScreenTimeAttentionReason({
                studentGates,
                deniedGrantCount,
              })
            : 'No parent action needed in the synthetic controls fixture.',
        } satisfies DemoLearningParentScreenTimeChildControlsRow;
      })
      .sort((left, right) => left.studentName.localeCompare(right.studentName));

    const statusCounts =
      this.buildParentScreenTimeGuardianControlsStatusCounts(fixture);
    const allowedMinutes = childRows.reduce(
      (sum, row) => sum + row.totalAllowedMinutes,
      0,
    );
    const usedMinutes = childRows.reduce(
      (sum, row) => sum + row.usedMinutes,
      0,
    );
    const grantDecisionCount =
      statusCounts.grantDecision.APPROVED + statusCounts.grantDecision.DENIED;

    return {
      reportName:
        'Learning local demo Parent/Guardian Screen Time -> Session Gate -> Grant -> Controls Report',
      generatedFor: 'local-demo-parent-screen-time-guardian-controls-report',
      generatedAt,
      currency: fixture.currency,
      safety: {
        fixtureOnly: true,
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
        realPaymentMutationUsed: false,
        realRefundMutationUsed: false,
        realCommissionMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      },
      totals: {
        parentGuardianCount: fixture.parentGuardians.length,
        childCount: childRows.length,
        activeScreenTimePolicyCount: statusCounts.policyStatus.ACTIVE,
        allowedMinutes,
        usedMinutes,
        remainingMinutes: Math.max(allowedMinutes - usedMinutes, 0),
        grantRequestCount: fixture.screenTimeGrantRequests.length,
        grantDecisionCount,
        approvedGrantCount: statusCounts.grantDecision.APPROVED,
        deniedGrantCount: statusCounts.grantDecision.DENIED,
        allowedSessionCount: statusCounts.gateDecision.ALLOWED,
        blockedSessionCount: statusCounts.gateDecision.BLOCKED,
        overrideSessionCount: statusCounts.gateDecision.OVERRIDE_ALLOWED,
        childrenNeedingParentAttentionCount: childRows.filter(
          (row) => row.needsParentAttention,
        ).length,
      },
      statusCounts,
      childRows,
      gateRows,
      grantRows,
    };
  }

  buildParentScreenTimeGrantDailyPlanGuardReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentScreenTimeGrantDailyPlanGuardReport {
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
    const learningPathsById = new Map(
      fixture.learningPaths.map((path) => [path.id, path]),
    );
    const dailyPlansById = new Map(
      fixture.dailyPlans.map((plan) => [plan.id, plan]),
    );
    const policiesById = new Map(
      fixture.screenTimePolicies.map((policy) => [policy.id, policy]),
    );
    const guardiansById = new Map(
      fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
    );
    const grantsBySessionGateId = this.groupBy(
      fixture.screenTimeGrantRequests,
      (grant) => grant.sessionGateId,
    );

    const accessRows: DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow[] =
      fixture.sessionGates
        .map((gate) => {
          const dailyPlan = this.requireDailyPlan(
            dailyPlansById,
            gate.dailyPlanId,
          );
          const learningPath = this.requireLearningPath(
            learningPathsById,
            gate.learningPathId,
          );
          this.requireEnrollment(enrollmentsById, gate.enrollmentId);
          const student = this.requireStudentById(studentsById, gate.studentId);
          const course = this.requireCourseById(
            coursesById,
            dailyPlan.courseId,
          );
          const classCohort = this.requireClass(classesById, dailyPlan.classId);
          const lesson = this.requireLesson(lessonsById, dailyPlan.lessonId);
          const policy = this.requireScreenTimePolicy(
            policiesById,
            gate.policyId,
          );
          const guardian = this.requireGuardian(
            guardiansById,
            policy.guardianId,
          );
          const grant = grantsBySessionGateId.get(gate.id)?.[0] ?? null;
          const accessResult: DemoLearningParentScreenTimeDailyPlanGuardAccessResult =
            gate.decision === 'BLOCKED' ? 'BLOCKED_SESSION' : 'ALLOWED_SESSION';
          const blockedReason = this.buildDailyPlanGuardBlockedReason(
            gate.blockedReason,
          );
          const nextSafeActionLabel = this.buildDailyPlanGuardNextAction({
            gate,
            grant,
          });
          const learningSessionEvidenceId = `learning-session-evidence-${gate.id}`;
          const sessionGuardTraceIds = [
            guardian.id,
            student.childProfileId,
            student.id,
            course.id,
            dailyPlan.id,
            policy.id,
            grant?.id ?? `no-parent-grant-${gate.id}`,
            gate.id,
            accessResult,
            learningSessionEvidenceId,
          ];

          return {
            accessCaseId: `daily-plan-guard-${gate.id}`,
            sessionGuardTraceKey: sessionGuardTraceIds.join('->'),
            sessionGuardTraceIds,
            parentGuardianId: guardian.id,
            parentGuardianName: guardian.displayName,
            parentGuardianEmail: guardian.email,
            relationship: guardian.relationship,
            studentId: student.id,
            childProfileId: student.childProfileId,
            studentName: student.displayName,
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            classId: classCohort.id,
            classCode: classCohort.code,
            teacherName: classCohort.teacherName,
            learningPathId: learningPath.id,
            learningPathTitle: learningPath.title,
            learningPathStatus: learningPath.status,
            dailyPlanId: dailyPlan.id,
            dailyPlanTitle: dailyPlan.title,
            dailyPlanStatus: dailyPlan.status,
            lessonId: lesson.id,
            lessonCode: lesson.code,
            sessionId: lesson.sessionId,
            screenTimePolicyId: policy.id,
            screenTimePolicyStatus: policy.status,
            dailyAllowedMinutes: policy.dailyAllowedMinutes,
            safeLearningWindowStart: policy.safeLearningWindowStart,
            safeLearningWindowEnd: policy.safeLearningWindowEnd,
            parentGrantRuleId: grant?.id ?? null,
            parentGrantDecision: grant?.decision ?? 'NONE',
            parentGrantRuleApplied: grant !== null,
            grantedMinutes: grant?.grantedMinutes ?? 0,
            requestedAt: gate.requestedAt,
            requestedMinutes: gate.requestedMinutes,
            usedMinutesBeforeSession: gate.usedMinutesBeforeSession,
            totalAllowedMinutesForCase:
              policy.dailyAllowedMinutes + (grant?.grantedMinutes ?? 0),
            accessDecision: gate.decision,
            accessResult,
            blockedReasonCode: gate.blockedReason ?? 'NONE',
            blockedReason,
            nextSafeActionLabel,
            learningSessionEvidenceId,
            fixtureOnly: true,
            providerUsed: false,
            mutationUsed: false,
            evidenceSummary:
              accessResult === 'ALLOWED_SESSION'
                ? `${student.displayName} can open ${dailyPlan.id} through ${gate.decision.toLowerCase()} fixture guard evidence.`
                : `${student.displayName} is blocked from ${dailyPlan.id}: ${blockedReason}.`,
          } satisfies DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow;
        })
        .sort((left, right) =>
          [
            left.courseCode,
            left.studentName,
            left.requestedAt,
            left.accessCaseId,
          ]
            .join('|')
            .localeCompare(
              [
                right.courseCode,
                right.studentName,
                right.requestedAt,
                right.accessCaseId,
              ].join('|'),
            ),
        );

    const grantRuleRows: DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow[] =
      fixture.screenTimeGrantRequests
        .map((grant) => {
          const gate = fixture.sessionGates.find(
            (candidate) => candidate.id === grant.sessionGateId,
          );
          if (!gate) {
            throw new Error(
              `Missing local demo session gate for grant ${grant.id}`,
            );
          }
          const dailyPlan = this.requireDailyPlan(
            dailyPlansById,
            gate.dailyPlanId,
          );
          const guardian = this.requireGuardian(
            guardiansById,
            grant.guardianId,
          );
          const student = this.requireStudentById(
            studentsById,
            grant.studentId,
          );
          const ruleTraceKey = [
            guardian.id,
            student.childProfileId,
            dailyPlan.id,
            grant.id,
            gate.id,
            grant.decision,
          ].join('->');

          return {
            grantRuleId: grant.id,
            sessionGateId: grant.sessionGateId,
            parentGuardianId: guardian.id,
            parentGuardianName: guardian.displayName,
            studentId: student.id,
            childProfileId: student.childProfileId,
            studentName: student.displayName,
            dailyPlanId: dailyPlan.id,
            dailyPlanTitle: dailyPlan.title,
            requestedExtraMinutes: grant.requestedExtraMinutes,
            grantedMinutes: grant.grantedMinutes,
            requestedAt: grant.requestedAt,
            decidedAt: grant.decidedAt ?? null,
            decision: grant.decision,
            allowsDailyPlanAccess: grant.decision === 'APPROVED',
            decisionReason: grant.decisionReason,
            ruleTraceKey,
          } satisfies DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow;
        })
        .sort((left, right) =>
          [left.studentName, left.requestedAt, left.grantRuleId]
            .join('|')
            .localeCompare(
              [right.studentName, right.requestedAt, right.grantRuleId].join(
                '|',
              ),
            ),
        );

    const sessionEvidenceRows: DemoLearningParentScreenTimeGrantDailyPlanGuardSessionEvidenceRow[] =
      accessRows.map((row) => ({
        learningSessionEvidenceId: row.learningSessionEvidenceId,
        sessionGuardTraceKey: row.sessionGuardTraceKey,
        sessionGateId: row.sessionGuardTraceIds[7],
        dailyPlanId: row.dailyPlanId,
        dailyPlanTitle: row.dailyPlanTitle,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        courseCode: row.courseCode,
        requestedAt: row.requestedAt,
        accessResult: row.accessResult,
        accessDecision: row.accessDecision,
        sessionStarted: row.accessResult === 'ALLOWED_SESSION',
        sessionDurationMinutes:
          row.accessResult === 'ALLOWED_SESSION' ? row.requestedMinutes : 0,
        blockedReason: row.blockedReason,
        nextSafeActionLabel: row.nextSafeActionLabel,
        evidenceSummary:
          row.accessResult === 'ALLOWED_SESSION'
            ? `${row.learningSessionEvidenceId} records read-only allowed access for ${row.dailyPlanId}.`
            : `${row.learningSessionEvidenceId} records read-only blocked access for ${row.dailyPlanId}.`,
      }));

    const allowedRows = accessRows.filter(
      (row) => row.accessResult === 'ALLOWED_SESSION',
    );
    const blockedRows = accessRows.filter(
      (row) => row.accessResult === 'BLOCKED_SESSION',
    );
    const blockedOrLimitedRows = accessRows.filter(
      (row) =>
        row.accessResult === 'BLOCKED_SESSION' || row.parentGrantRuleApplied,
    );
    const rowsWithStableTrace = accessRows.filter((row) =>
      [
        row.parentGuardianId,
        row.childProfileId,
        row.courseId,
        row.dailyPlanId,
        row.screenTimePolicyId,
        row.sessionGuardTraceIds[7],
        row.learningSessionEvidenceId,
      ].every((id) => row.sessionGuardTraceKey.includes(id)),
    );
    const remainingLocalDemoNotes = [
      'Parent grant rules and screen-time policies are fixture rows only; no parent-control mutation is executed.',
      'Allowed and blocked learning session evidence is generated from deterministic local session gate fixtures.',
      'Production parent controls, notification delivery, daily plan access writes, provider calls, and real learner mutations remain out of scope.',
    ];
    const safety = {
      productionReady: false,
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
      realParentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
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
      realLearningMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    } satisfies DemoLearningParentScreenTimeGrantDailyPlanGuardSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (
        gate === 'fixtureOnly' ||
        gate === 'noProductionDbRead' ||
        gate === 'productionReady'
      ) {
        return gate === 'productionReady' ? value !== false : value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const statusCounts: DemoLearningParentScreenTimeGrantDailyPlanGuardStatusCounts =
      {
        policyStatus: this.countByStatus(
          screenTimePolicyStatuses,
          fixture.screenTimePolicies,
          (policy) => policy.status,
        ),
        gateDecision: this.countByStatus(
          sessionGateDecisions,
          fixture.sessionGates,
          (gate) => gate.decision,
        ),
        grantDecision: this.countByStatus(
          screenTimeGrantDecisions,
          fixture.screenTimeGrantRequests,
          (grant) => grant.decision,
        ),
        accessResult: this.countByStatus(
          dailyPlanGuardAccessResults,
          accessRows,
          (row) => row.accessResult,
        ),
      };
    const evidenceRows: DemoLearningParentScreenTimeGrantDailyPlanGuardEvidenceRow[] =
      [
        {
          evidenceKind: 'PARENT_CHILD_COURSE_PLAN_TRACE',
          evidenceCount: accessRows.length,
          stableFixtureIds: accessRows.map((row) => row.sessionGuardTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Trace keys connect parent -> child -> course/daily plan -> screen-time/grant rule -> access result -> learning session evidence.',
        },
        {
          evidenceKind: 'PARENT_GRANT_RULE',
          evidenceCount: grantRuleRows.length,
          stableFixtureIds: grantRuleRows.map((row) => row.ruleTraceKey),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Fixture parent grant rules include approved and denied decisions linked to daily plan guard cases.',
        },
        {
          evidenceKind: 'SCREEN_TIME_RULE',
          evidenceCount: fixture.screenTimePolicies.length,
          stableFixtureIds: fixture.screenTimePolicies.map(
            (policy) => policy.id,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Screen-time rules are deterministic fixture policies with no live parent-control writes.',
        },
        {
          evidenceKind: 'ALLOWED_LEARNING_SESSION',
          evidenceCount: allowedRows.length,
          stableFixtureIds: allowedRows.map(
            (row) => row.learningSessionEvidenceId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Allowed rows record read-only learning session evidence, including parent-grant override access.',
        },
        {
          evidenceKind: 'BLOCKED_LEARNING_SESSION',
          evidenceCount: blockedRows.length,
          stableFixtureIds: blockedRows.map(
            (row) => row.learningSessionEvidenceId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Blocked rows include clear reasons and safe next-action labels without mutating daily plan access.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: Object.entries(safety).map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'All production, provider, payment, notification, AI, learning mutation, and ERP mutation gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Parent Screen-Time Grant -> Daily Plan Guard Report',
      generatedFor:
        'local-demo-parent-screen-time-grant-daily-plan-guard-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#parent-screen-time-grant-daily-plan-guard',
      jsonExportPath:
        'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.json',
      markdownExportPath:
        'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'The local-demo daily plan guard derives allowed and blocked child learning session evidence from parent grants, screen-time rules, and session gate fixtures.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: new Set(accessRows.map((row) => row.studentId)).size,
        parentGuardianCount: new Set(
          accessRows.map((row) => row.parentGuardianId),
        ).size,
        courseCount: new Set(accessRows.map((row) => row.courseId)).size,
        dailyPlanAccessCaseCount: accessRows.length,
        parentGrantRuleCount: grantRuleRows.length,
        screenTimeRuleCount: fixture.screenTimePolicies.length,
        allowedSessionCount: allowedRows.length,
        blockedSessionCount: blockedRows.length,
        blockedReasonCount: blockedRows.filter((row) =>
          Boolean(row.blockedReason),
        ).length,
        safeNextActionCount: accessRows.filter((row) =>
          Boolean(row.nextSafeActionLabel),
        ).length,
        blockedOrLimitedCaseWithSafeNextActionCount:
          blockedOrLimitedRows.filter((row) => Boolean(row.nextSafeActionLabel))
            .length,
        sessionGuardTraceCount: rowsWithStableTrace.length,
        accessCasesWithStableTraceCount: rowsWithStableTrace.length,
        allowedCasesWithStableTraceCount: rowsWithStableTrace.filter(
          (row) => row.accessResult === 'ALLOWED_SESSION',
        ).length,
        blockedCasesWithStableTraceCount: rowsWithStableTrace.filter(
          (row) => row.accessResult === 'BLOCKED_SESSION',
        ).length,
        blockedCasesWithReasonAndNextActionCount: blockedRows.filter(
          (row) =>
            Boolean(row.blockedReason) && Boolean(row.nextSafeActionLabel),
        ).length,
        learningSessionEvidenceCount: sessionEvidenceRows.length,
        allowedLearningSessionEvidenceCount: sessionEvidenceRows.filter(
          (row) => row.accessResult === 'ALLOWED_SESSION',
        ).length,
        blockedLearningSessionEvidenceCount: sessionEvidenceRows.filter(
          (row) => row.accessResult === 'BLOCKED_SESSION',
        ).length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      statusCounts,
      accessRows,
      grantRuleRows,
      sessionEvidenceRows,
      evidenceRows,
    };
  }

  buildLearningSessionCompletionPracticeProgressRollupReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningSessionCompletionPracticeProgressRollupReport {
    const guardReport = this.buildParentScreenTimeGrantDailyPlanGuardReport(
      fixture,
      generatedAt,
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
    const learningPathsById = new Map(
      fixture.learningPaths.map((path) => [path.id, path]),
    );
    const dailyPlansById = new Map(
      fixture.dailyPlans.map((plan) => [plan.id, plan]),
    );
    const progressByEnrollmentId = new Map(
      fixture.progress.map((progress) => [progress.enrollmentId, progress]),
    );
    const guardiansById = new Map(
      fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
    );
    const videoEvidenceByDailyPlanId = new Map(
      fixture.videoEvidence.map((evidence) => [evidence.dailyPlanId, evidence]),
    );
    const practiceAttemptByDailyPlanId = new Map(
      fixture.practiceAttempts.map((attempt) => [attempt.dailyPlanId, attempt]),
    );
    const allowedAccessRows = guardReport.accessRows.filter(
      (row) => row.accessResult === 'ALLOWED_SESSION',
    );

    const progressRollupRows: DemoLearningSessionCompletionPracticeProgressRollupRow[] =
      allowedAccessRows
        .map((accessRow) => {
          const dailyPlan = this.requireDailyPlan(
            dailyPlansById,
            accessRow.dailyPlanId,
          );
          const learningPath = this.requireLearningPath(
            learningPathsById,
            accessRow.learningPathId,
          );
          const enrollment = this.requireEnrollment(
            enrollmentsById,
            accessRow.sessionGuardTraceIds[2] === accessRow.studentId
              ? dailyPlan.enrollmentId
              : learningPath.enrollmentId,
          );
          const course = this.requireCourseById(
            coursesById,
            accessRow.courseId,
          );
          const classCohort = this.requireClass(classesById, dailyPlan.classId);
          const lesson = this.requireLesson(lessonsById, dailyPlan.lessonId);
          const progress = this.requireProgress(
            progressByEnrollmentId,
            enrollment.id,
          );
          const guardian = this.requireGuardian(
            guardiansById,
            accessRow.parentGuardianId,
          );
          const videoEvidence = this.requireVideoEvidence(
            videoEvidenceByDailyPlanId,
            dailyPlan.id,
          );
          const practiceAttempt = this.requirePracticeAttempt(
            practiceAttemptByDailyPlanId,
            dailyPlan.id,
          );
          const progressRollupId = `progress-rollup-${accessRow.learningSessionEvidenceId}`;
          const parentVisibleProgressSummaryId = `parent-progress-summary-${accessRow.accessCaseId}`;
          const teacherVisibleProgressSummaryId = `teacher-progress-summary-${accessRow.accessCaseId}`;
          const lessonCompletionEvidenceId = `lesson-completion-${videoEvidence.id}`;
          const practiceScorePercent = practiceAttempt.scorePercent ?? 0;
          const rollupStatus =
            this.buildSessionCompletionPracticeProgressRollupStatus({
              dailyPlan,
              videoEvidence,
              practiceAttempt,
              progress,
            });
          const nextSafeActionLabel =
            this.buildSessionCompletionPracticeProgressNextAction({
              rollupStatus,
              practiceScorePercent,
            });
          const stableTraceIds = [
            accessRow.studentId,
            course.id,
            dailyPlan.id,
            accessRow.sessionId,
            lesson.id,
            accessRow.learningSessionEvidenceId,
            lessonCompletionEvidenceId,
            videoEvidence.id,
            practiceAttempt.id,
            progress.id,
            progressRollupId,
            parentVisibleProgressSummaryId,
            teacherVisibleProgressSummaryId,
          ];

          return {
            progressRollupId,
            stableTraceKey: stableTraceIds.join('->'),
            stableTraceIds,
            accessCaseId: accessRow.accessCaseId,
            learningSessionEvidenceId: accessRow.learningSessionEvidenceId,
            sessionGateId: accessRow.sessionGuardTraceIds[7],
            sessionId: accessRow.sessionId,
            studentId: accessRow.studentId,
            childProfileId: accessRow.childProfileId,
            studentName: accessRow.studentName,
            parentGuardianId: guardian.id,
            parentGuardianName: guardian.displayName,
            teacherName: classCohort.teacherName,
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            classId: classCohort.id,
            classCode: classCohort.code,
            learningPathId: learningPath.id,
            dailyPlanId: dailyPlan.id,
            dailyPlanTitle: dailyPlan.title,
            dailyPlanStatus: dailyPlan.status,
            lessonId: lesson.id,
            lessonCode: lesson.code,
            lessonTitle: lesson.title,
            videoEvidenceId: videoEvidence.id,
            videoEvidenceStatus: videoEvidence.status,
            videoCompletionPercent: this.percent(
              videoEvidence.watchedSeconds,
              videoEvidence.requiredSeconds,
            ),
            lessonCompletionEvidenceId,
            lessonCompletionStatus: videoEvidence.status,
            practiceAttemptId: practiceAttempt.id,
            practiceAttemptStatus: practiceAttempt.status,
            practiceAttemptNumber: practiceAttempt.attemptNumber,
            practiceScorePercent,
            progressRecordId: progress.id,
            completionPercent: progress.completionPercent,
            progressStatus: progress.status,
            rollupStatus,
            parentVisibleProgressSummaryId,
            teacherVisibleProgressSummaryId,
            nextSafeActionLabel,
            fixtureOnly: true,
            providerUsed: false,
            mutationUsed: false,
            evidenceSummary: `${accessRow.studentName} allowed session ${accessRow.learningSessionEvidenceId} rolls up ${lesson.code}, video ${videoEvidence.status}, practice ${practiceAttempt.status} ${practiceScorePercent}%, and ${progress.completionPercent}% course progress.`,
          } satisfies DemoLearningSessionCompletionPracticeProgressRollupRow;
        })
        .sort((left, right) =>
          [
            left.courseCode,
            left.studentName,
            left.dailyPlanId,
            left.progressRollupId,
          ]
            .join('|')
            .localeCompare(
              [
                right.courseCode,
                right.studentName,
                right.dailyPlanId,
                right.progressRollupId,
              ].join('|'),
            ),
        );

    const parentSummaryRows: DemoLearningSessionCompletionPracticeProgressParentSummaryRow[] =
      progressRollupRows.map((row) => {
        const guardian = this.requireGuardian(
          guardiansById,
          row.parentGuardianId,
        );

        return {
          parentVisibleProgressSummaryId: row.parentVisibleProgressSummaryId,
          progressRollupId: row.progressRollupId,
          stableTraceKey: row.stableTraceKey,
          parentGuardianId: guardian.id,
          parentGuardianName: guardian.displayName,
          parentGuardianEmail: guardian.email,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          courseCode: row.courseCode,
          dailyPlanId: row.dailyPlanId,
          dailyPlanTitle: row.dailyPlanTitle,
          completionPercent: row.completionPercent,
          practiceScorePercent: row.practiceScorePercent,
          rollupStatus: row.rollupStatus,
          nextSafeActionLabel: row.nextSafeActionLabel,
          parentVisible: true,
          summary: `${row.studentName} completed local-demo evidence for ${row.dailyPlanTitle}: ${row.completionPercent}% progress and ${row.practiceScorePercent}% practice score.`,
        } satisfies DemoLearningSessionCompletionPracticeProgressParentSummaryRow;
      });

    const teacherSummaryRows: DemoLearningSessionCompletionPracticeProgressTeacherSummaryRow[] =
      progressRollupRows.map((row) => ({
        teacherVisibleProgressSummaryId: row.teacherVisibleProgressSummaryId,
        progressRollupId: row.progressRollupId,
        stableTraceKey: row.stableTraceKey,
        teacherName: row.teacherName,
        classId: row.classId,
        classCode: row.classCode,
        courseCode: row.courseCode,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        dailyPlanId: row.dailyPlanId,
        lessonCode: row.lessonCode,
        completionPercent: row.completionPercent,
        practiceScorePercent: row.practiceScorePercent,
        rollupStatus: row.rollupStatus,
        nextSafeActionLabel: row.nextSafeActionLabel,
        teacherVisible: true,
        summary: `${row.teacherName} can review ${row.studentName} from allowed session ${row.learningSessionEvidenceId}: ${row.rollupStatus.toLowerCase()} rollup with ${row.practiceScorePercent}% practice score.`,
      }));

    const statusCounts: DemoLearningSessionCompletionPracticeProgressRollupStatusCounts =
      {
        accessResult: this.countByStatus(
          dailyPlanGuardAccessResults,
          allowedAccessRows,
          (row) => row.accessResult,
        ),
        dailyPlanStatus: this.countByStatus(
          dailyPlanStatuses,
          progressRollupRows,
          (row) => row.dailyPlanStatus,
        ),
        practiceAttemptStatus: this.countByStatus(
          practiceAttemptStatuses,
          progressRollupRows,
          (row) => row.practiceAttemptStatus,
        ),
        rollupStatus: this.countByStatus(
          sessionCompletionPracticeProgressRollupStatuses,
          progressRollupRows,
          (row) => row.rollupStatus,
        ),
      };
    const rowsWithStableTrace = progressRollupRows.filter((row) =>
      [
        row.studentId,
        row.courseId,
        row.dailyPlanId,
        row.sessionId,
        row.lessonId,
        row.learningSessionEvidenceId,
        row.lessonCompletionEvidenceId,
        row.videoEvidenceId,
        row.practiceAttemptId,
        row.progressRecordId,
        row.progressRollupId,
        row.parentVisibleProgressSummaryId,
        row.teacherVisibleProgressSummaryId,
      ].every((id) => row.stableTraceKey.includes(id)),
    );
    const remainingLocalDemoNotes = [
      'Completion and practice rollups are derived from allowed session gate fixtures only.',
      'Parent and teacher summaries are read-only evidence rows; no parent delivery or teacher workflow mutation is executed.',
      'Production telemetry writes, persisted progress updates, notification delivery, provider calls, and real learner mutations remain out of scope.',
    ];
    const safety = {
      productionReady: false,
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
      realParentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
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
      realLearningMutationUsed: false,
      realLearningSessionCompletionMutationUsed: false,
      realParentProgressSummaryMutationUsed: false,
      realTeacherProgressSummaryMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    } satisfies DemoLearningSessionCompletionPracticeProgressRollupSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (
        gate === 'fixtureOnly' ||
        gate === 'noProductionDbRead' ||
        gate === 'productionReady'
      ) {
        return gate === 'productionReady' ? value !== false : value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningSessionCompletionPracticeProgressEvidenceRow[] =
      [
        {
          evidenceKind: 'ALLOWED_DAILY_PLAN_SESSION_REFERENCE',
          evidenceCount: allowedAccessRows.length,
          stableFixtureIds: allowedAccessRows.map(
            (row) => row.learningSessionEvidenceId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Allowed screen-time/grant session evidence is the source for completion rollups.',
        },
        {
          evidenceKind: 'LESSON_VIDEO_COMPLETION',
          evidenceCount: progressRollupRows.length,
          stableFixtureIds: progressRollupRows.map(
            (row) => row.lessonCompletionEvidenceId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Lesson/video completion IDs are derived from deterministic local LMS video evidence.',
        },
        {
          evidenceKind: 'PRACTICE_SCORE_ATTEMPT',
          evidenceCount: progressRollupRows.length,
          stableFixtureIds: progressRollupRows.map(
            (row) => `${row.practiceAttemptId}:${row.practiceScorePercent}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Practice attempts include deterministic status and score evidence for each rollup.',
        },
        {
          evidenceKind: 'PROGRESS_ROLLUP',
          evidenceCount: progressRollupRows.length,
          stableFixtureIds: progressRollupRows.map(
            (row) => row.progressRollupId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Progress rollups connect student, course, session, lesson, practice, and progress record IDs.',
        },
        {
          evidenceKind: 'PARENT_VISIBLE_SUMMARY',
          evidenceCount: parentSummaryRows.length,
          stableFixtureIds: parentSummaryRows.map(
            (row) => row.parentVisibleProgressSummaryId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Parent-visible summaries are local-demo report rows only and do not send notifications.',
        },
        {
          evidenceKind: 'TEACHER_VISIBLE_SUMMARY',
          evidenceCount: teacherSummaryRows.length,
          stableFixtureIds: teacherSummaryRows.map(
            (row) => row.teacherVisibleProgressSummaryId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Teacher-visible summaries are local-demo report rows only and do not mutate teacher workflow state.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: safetyEntries.map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'All production, provider, payment, notification, AI, learning mutation, parent summary, teacher summary, and ERP mutation gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Learning Session Completion -> Practice Progress Rollup Report',
      generatedFor:
        'local-demo-learning-session-completion-practice-progress-rollup-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#learning-session-completion-practice-progress-rollup',
      jsonExportPath:
        'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.json',
      markdownExportPath:
        'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Allowed daily plan sessions roll up lesson/video completion and practice score evidence into parent- and teacher-visible read-only progress summaries.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: new Set(progressRollupRows.map((row) => row.studentId))
          .size,
        courseCount: new Set(progressRollupRows.map((row) => row.courseId))
          .size,
        dailyPlanSessionReferenceCount: allowedAccessRows.length,
        allowedDailyPlanSessionReferenceCount: allowedAccessRows.length,
        lessonCompletionEvidenceCount: progressRollupRows.length,
        practiceAttemptEvidenceCount: progressRollupRows.length,
        scoredPracticeAttemptEvidenceCount: progressRollupRows.filter(
          (row) => row.practiceScorePercent >= 0,
        ).length,
        progressRollupCount: progressRollupRows.length,
        parentVisibleProgressSummaryCount: parentSummaryRows.length,
        teacherVisibleProgressSummaryCount: teacherSummaryRows.length,
        stableTraceCount: rowsWithStableTrace.length,
        rollupsWithStudentCourseDailyPlanSessionCount:
          progressRollupRows.filter(
            (row) =>
              Boolean(row.studentId) &&
              Boolean(row.courseId) &&
              Boolean(row.dailyPlanId) &&
              Boolean(row.sessionId),
          ).length,
        rollupsWithLessonPracticeEvidenceCount: progressRollupRows.filter(
          (row) =>
            Boolean(row.lessonCompletionEvidenceId) &&
            Boolean(row.practiceAttemptId),
        ).length,
        rollupsWithParentTeacherSummaryCount: progressRollupRows.filter(
          (row) =>
            parentSummaryRows.some(
              (summary) =>
                summary.parentVisibleProgressSummaryId ===
                row.parentVisibleProgressSummaryId,
            ) &&
            teacherSummaryRows.some(
              (summary) =>
                summary.teacherVisibleProgressSummaryId ===
                row.teacherVisibleProgressSummaryId,
            ),
        ).length,
        practiceAttemptsWithDeterministicScoreStatusCount:
          progressRollupRows.filter(
            (row) =>
              row.practiceScorePercent >= 0 &&
              Boolean(row.practiceAttemptStatus),
          ).length,
        rollupsWithCompletionPercentCount: progressRollupRows.filter(
          (row) => row.completionPercent >= 0,
        ).length,
        rollupsWithSafeNextActionLabelCount: progressRollupRows.filter((row) =>
          Boolean(row.nextSafeActionLabel),
        ).length,
        completedRollupCount: statusCounts.rollupStatus.COMPLETED,
        needsSupportRollupCount: statusCounts.rollupStatus.NEEDS_SUPPORT,
        averageCompletionPercent: this.averagePercent(
          progressRollupRows.map((row) => row.completionPercent),
        ),
        averagePracticeScorePercent: this.averagePercent(
          progressRollupRows.map((row) => row.practiceScorePercent),
        ),
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      statusCounts,
      progressRollupRows,
      parentSummaryRows,
      teacherSummaryRows,
      evidenceRows,
    };
  }

  buildTeacherInterventionRemedialAssignmentSupportPlanReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport {
    const progressRollupReport =
      this.buildLearningSessionCompletionPracticeProgressRollupReport(
        fixture,
        generatedAt,
      );
    const dailyPlansById = new Map(
      fixture.dailyPlans.map((plan) => [plan.id, plan]),
    );
    const lessonsById = new Map(
      fixture.lessons.map((lesson) => [lesson.id, lesson]),
    );
    const guardiansById = new Map(
      fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
    );
    const practiceAttemptByDailyPlanId = new Map(
      fixture.practiceAttempts.map((attempt) => [attempt.dailyPlanId, attempt]),
    );
    const needsSupportRollupRows =
      progressRollupReport.progressRollupRows.filter(
        (row) =>
          row.rollupStatus === 'NEEDS_SUPPORT' ||
          row.progressStatus === 'NEEDS_SUPPORT',
      );

    const interventionReviewRows: DemoLearningTeacherInterventionReviewRow[] =
      needsSupportRollupRows.map((row) => {
        const teacher = fixture.contentOwners.find(
          (owner) =>
            owner.role === 'TEACHER' && owner.classIds.includes(row.classId),
        );
        if (!teacher) {
          throw new Error(
            `Missing local demo teacher owner for class ${row.classId}`,
          );
        }
        const sourceDailyPlan = this.requireDailyPlan(
          dailyPlansById,
          row.dailyPlanId,
        );
        const remedialDailyPlan = this.findRemedialDailyPlanForSupportPlan(
          fixture.dailyPlans,
          sourceDailyPlan,
        );
        const remedialPracticeAttempt = this.requirePracticeAttempt(
          practiceAttemptByDailyPlanId,
          remedialDailyPlan.id,
        );
        const remedialLesson = this.requireLesson(
          lessonsById,
          remedialDailyPlan.lessonId,
        );
        const interventionReviewId = `teacher-intervention-review-${row.progressRollupId}`;
        const remedialAssignmentId = `remedial-assignment-${row.progressRollupId}`;
        const supportPlanId = `support-plan-${row.progressRollupId}`;
        const parentVisibleSupportSummaryId = `parent-support-summary-${row.progressRollupId}`;
        const teacherVisibleNextActionId = `teacher-next-action-${row.progressRollupId}`;
        const supportReason = this.buildTeacherInterventionSupportReason(row);
        const safeNextActionLabel =
          this.buildTeacherInterventionSafeNextAction(row);
        const stableTraceIds = [
          row.studentId,
          row.courseId,
          row.dailyPlanId,
          row.sessionId,
          row.learningSessionEvidenceId,
          row.progressRecordId,
          row.progressRollupId,
          teacher.id,
          interventionReviewId,
          remedialDailyPlan.id,
          remedialPracticeAttempt.id,
          remedialAssignmentId,
          supportPlanId,
          parentVisibleSupportSummaryId,
          teacherVisibleNextActionId,
        ];

        return {
          interventionReviewId,
          progressRollupId: row.progressRollupId,
          stableTraceKey: stableTraceIds.join('->'),
          stableTraceIds,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          parentGuardianId: row.parentGuardianId,
          teacherId: teacher.id,
          teacherName: teacher.displayName,
          teacherEmail: teacher.email,
          courseId: row.courseId,
          courseCode: row.courseCode,
          courseTitle: row.courseTitle,
          classId: row.classId,
          classCode: row.classCode,
          learningPathId: row.learningPathId,
          sourceDailyPlanId: row.dailyPlanId,
          sourceDailyPlanTitle: row.dailyPlanTitle,
          sourceSessionId: row.sessionId,
          learningSessionEvidenceId: row.learningSessionEvidenceId,
          remedialDailyPlanId: remedialDailyPlan.id,
          remedialPracticeAttemptId: remedialPracticeAttempt.id,
          remedialLessonId: remedialLesson.id,
          remedialLessonCode: remedialLesson.code,
          sourceAssignmentId: remedialPracticeAttempt.assignmentId ?? null,
          progressRecordId: row.progressRecordId,
          rollupStatus: row.rollupStatus,
          completionPercent: row.completionPercent,
          practiceScorePercent: row.practiceScorePercent,
          supportReason,
          reviewStatus: 'REVIEWED',
          reviewedAt: generatedAt,
          remedialAssignmentId,
          supportPlanId,
          parentVisibleSupportSummaryId,
          teacherVisibleNextActionId,
          safeNextActionLabel,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary: `${teacher.displayName} reviewed ${row.studentName} from ${row.progressRollupId}; ${supportReason}`,
        } satisfies DemoLearningTeacherInterventionReviewRow;
      });

    const remedialAssignmentRows: DemoLearningRemedialAssignmentRow[] =
      interventionReviewRows.map((row) => {
        const remedialDailyPlan = this.requireDailyPlan(
          dailyPlansById,
          row.remedialDailyPlanId,
        );

        return {
          remedialAssignmentId: row.remedialAssignmentId,
          interventionReviewId: row.interventionReviewId,
          supportPlanId: row.supportPlanId,
          progressRollupId: row.progressRollupId,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          teacherId: row.teacherId,
          teacherName: row.teacherName,
          courseId: row.courseId,
          courseCode: row.courseCode,
          remedialDailyPlanId: remedialDailyPlan.id,
          remedialDailyPlanTitle: remedialDailyPlan.title,
          remedialLessonId: row.remedialLessonId,
          remedialLessonCode: row.remedialLessonCode,
          sourcePracticeAttemptId: row.remedialPracticeAttemptId,
          sourceAssignmentId: row.sourceAssignmentId,
          status: 'ASSIGNED',
          dueAt: `${remedialDailyPlan.planDate}T17:00:00.000Z`,
          safeNextActionLabel: row.safeNextActionLabel,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary: `${row.studentName} has a fixture remedial assignment on ${remedialDailyPlan.title} with ${row.teacherName} review evidence.`,
        } satisfies DemoLearningRemedialAssignmentRow;
      });

    const supportPlanRows: DemoLearningSupportPlanRow[] =
      interventionReviewRows.map((row) => ({
        supportPlanId: row.supportPlanId,
        interventionReviewId: row.interventionReviewId,
        progressRollupId: row.progressRollupId,
        remedialAssignmentId: row.remedialAssignmentId,
        parentVisibleSupportSummaryId: row.parentVisibleSupportSummaryId,
        teacherVisibleNextActionId: row.teacherVisibleNextActionId,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        courseId: row.courseId,
        courseCode: row.courseCode,
        supportReason: row.supportReason,
        status: 'PARENT_VISIBLE_REVIEW_READY',
        safeNextActionLabel: row.safeNextActionLabel,
        parentVisible: true,
        teacherVisible: true,
        planSummary: `${row.studentName} needs a teacher-reviewed remedial practice plan for ${row.courseCode}; parent summary is visible as fixture evidence only.`,
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
      }));

    const parentSummaryRows: DemoLearningParentVisibleSupportSummaryRow[] =
      interventionReviewRows.map((row) => {
        const guardian = this.requireGuardian(
          guardiansById,
          row.parentGuardianId,
        );

        return {
          parentVisibleSupportSummaryId: row.parentVisibleSupportSummaryId,
          supportPlanId: row.supportPlanId,
          interventionReviewId: row.interventionReviewId,
          progressRollupId: row.progressRollupId,
          parentGuardianId: guardian.id,
          parentGuardianName: guardian.displayName,
          parentGuardianEmail: guardian.email,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          courseCode: row.courseCode,
          supportReason: row.supportReason,
          safeNextActionLabel: row.safeNextActionLabel,
          parentVisible: true,
          summary: `${row.studentName} has a teacher-reviewed local-demo support plan: ${row.safeNextActionLabel}.`,
        } satisfies DemoLearningParentVisibleSupportSummaryRow;
      });

    const teacherNextActionRows: DemoLearningTeacherVisibleNextActionRow[] =
      interventionReviewRows.map((row) => ({
        teacherVisibleNextActionId: row.teacherVisibleNextActionId,
        supportPlanId: row.supportPlanId,
        interventionReviewId: row.interventionReviewId,
        progressRollupId: row.progressRollupId,
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        teacherEmail: row.teacherEmail,
        classId: row.classId,
        classCode: row.classCode,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        courseCode: row.courseCode,
        status: 'SCHEDULED',
        dueAt: generatedAt,
        safeNextActionLabel: row.safeNextActionLabel,
        teacherVisible: true,
        summary: `${row.teacherName} should review ${row.studentName} with the remedial assignment and keep parent-visible support wording safe.`,
      }));

    const statusCounts: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanStatusCounts =
      {
        interventionReviewStatus: this.countByStatus(
          teacherInterventionReviewStatuses,
          interventionReviewRows,
          (row) => row.reviewStatus,
        ),
        remedialAssignmentStatus: this.countByStatus(
          remedialAssignmentFixtureStatuses,
          remedialAssignmentRows,
          (row) => row.status,
        ),
        supportPlanStatus: this.countByStatus(
          supportPlanFixtureStatuses,
          supportPlanRows,
          (row) => row.status,
        ),
        teacherNextActionStatus: this.countByStatus(
          teacherNextActionStatuses,
          teacherNextActionRows,
          (row) => row.status,
        ),
      };
    const rowsWithStableTrace = interventionReviewRows.filter((row) =>
      [
        row.studentId,
        row.courseId,
        row.sourceDailyPlanId,
        row.sourceSessionId,
        row.learningSessionEvidenceId,
        row.progressRecordId,
        row.progressRollupId,
        row.teacherId,
        row.interventionReviewId,
        row.remedialDailyPlanId,
        row.remedialPracticeAttemptId,
        row.remedialAssignmentId,
        row.supportPlanId,
        row.parentVisibleSupportSummaryId,
        row.teacherVisibleNextActionId,
      ].every((id) => row.stableTraceKey.includes(id)),
    );
    const linkedInterventionRows = interventionReviewRows.filter(
      (row) =>
        Boolean(row.studentId) &&
        Boolean(row.teacherId) &&
        Boolean(row.courseId) &&
        Boolean(row.progressRollupId) &&
        Boolean(row.supportReason) &&
        remedialAssignmentRows.some(
          (assignment) =>
            assignment.remedialAssignmentId === row.remedialAssignmentId,
        ) &&
        supportPlanRows.some(
          (plan) => plan.supportPlanId === row.supportPlanId,
        ) &&
        parentSummaryRows.some(
          (summary) =>
            summary.parentVisibleSupportSummaryId ===
            row.parentVisibleSupportSummaryId,
        ) &&
        teacherNextActionRows.some(
          (action) =>
            action.teacherVisibleNextActionId ===
            row.teacherVisibleNextActionId,
        ),
    );
    const remainingLocalDemoNotes = [
      'Teacher intervention reviews are deterministic fixture rows derived from needs-support progress rollups.',
      'Remedial assignments, support plans, parent summaries, and teacher next actions are read-only evidence only.',
      'Production teacher workflow persistence, parent delivery, provider calls, AI execution, and real learner mutations remain out of scope.',
    ];
    const safety = {
      productionReady: false,
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
      realParentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
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
      realLearningMutationUsed: false,
      realLearningSessionCompletionMutationUsed: false,
      realParentProgressSummaryMutationUsed: false,
      realTeacherProgressSummaryMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realTeacherInterventionReviewMutationUsed: false,
      realRemedialAssignmentMutationUsed: false,
      realSupportPlanMutationUsed: false,
      realParentSupportSummaryMutationUsed: false,
      realTeacherNextActionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    } satisfies DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (
        gate === 'fixtureOnly' ||
        gate === 'noProductionDbRead' ||
        gate === 'productionReady'
      ) {
        return gate === 'productionReady' ? value !== false : value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanEvidenceRow[] =
      [
        {
          evidenceKind: 'NEEDS_SUPPORT_PROGRESS_ROLLUP',
          evidenceCount: needsSupportRollupRows.length,
          stableFixtureIds: needsSupportRollupRows.map(
            (row) => row.progressRollupId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Needs-support rollups are the source for teacher intervention review evidence.',
        },
        {
          evidenceKind: 'TEACHER_INTERVENTION_REVIEW',
          evidenceCount: interventionReviewRows.length,
          stableFixtureIds: interventionReviewRows.map(
            (row) => row.interventionReviewId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Teacher review rows link the needs-support learner, teacher, course, progress rollup, and support reason.',
        },
        {
          evidenceKind: 'REMEDIAL_ASSIGNMENT',
          evidenceCount: remedialAssignmentRows.length,
          stableFixtureIds: remedialAssignmentRows.map(
            (row) => row.remedialAssignmentId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Remedial assignments are deterministic fixture rows and do not write learner assignments.',
        },
        {
          evidenceKind: 'SUPPORT_PLAN',
          evidenceCount: supportPlanRows.length,
          stableFixtureIds: supportPlanRows.map((row) => row.supportPlanId),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Support plans include deterministic statuses and safe next-action labels.',
        },
        {
          evidenceKind: 'PARENT_VISIBLE_SUPPORT_SUMMARY',
          evidenceCount: parentSummaryRows.length,
          stableFixtureIds: parentSummaryRows.map(
            (row) => row.parentVisibleSupportSummaryId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Parent-visible support summaries are report rows only and do not send notifications.',
        },
        {
          evidenceKind: 'TEACHER_VISIBLE_NEXT_ACTION',
          evidenceCount: teacherNextActionRows.length,
          stableFixtureIds: teacherNextActionRows.map(
            (row) => row.teacherVisibleNextActionId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Teacher-visible next actions are local-demo evidence and do not mutate teacher workflow state.',
        },
        {
          evidenceKind: 'STABLE_TRACE',
          evidenceCount: rowsWithStableTrace.length,
          stableFixtureIds: rowsWithStableTrace.map(
            (row) => row.stableTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Stable traces connect student -> course -> daily plan/session -> progress rollup -> teacher review -> support plan evidence.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: safetyEntries.map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'All production, provider, payment, notification, AI, support-plan mutation, learning mutation, and ERP gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Teacher Intervention -> Remedial Assignment Support Plan Report',
      generatedFor:
        'local-demo-teacher-intervention-remedial-assignment-support-plan-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#teacher-intervention-remedial-assignment-support-plan',
      jsonExportPath:
        'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json',
      markdownExportPath:
        'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Needs-support progress rollups create teacher intervention review, remedial assignment, support plan, parent-visible support summary, and teacher next-action evidence.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: new Set(
          interventionReviewRows.map((row) => row.studentId),
        ).size,
        teacherCount: new Set(
          interventionReviewRows.map((row) => row.teacherId),
        ).size,
        courseCount: new Set(interventionReviewRows.map((row) => row.courseId))
          .size,
        needsSupportProgressRollupCount: needsSupportRollupRows.length,
        teacherInterventionReviewCount: interventionReviewRows.length,
        remedialAssignmentCount: remedialAssignmentRows.length,
        supportPlanCount: supportPlanRows.length,
        parentVisibleSupportSummaryCount: parentSummaryRows.length,
        teacherVisibleNextActionCount: teacherNextActionRows.length,
        supportReasonCount: interventionReviewRows.filter((row) =>
          Boolean(row.supportReason),
        ).length,
        stableTraceCount: rowsWithStableTrace.length,
        interventionLinksCompleteCount: linkedInterventionRows.length,
        supportPlansWithDeterministicStatusCount: supportPlanRows.filter(
          (row) => Boolean(row.status) && Boolean(row.safeNextActionLabel),
        ).length,
        remedialAssignmentsWithDeterministicStatusCount:
          remedialAssignmentRows.filter(
            (row) => Boolean(row.status) && Boolean(row.safeNextActionLabel),
          ).length,
        teacherNextActionsWithSafeLabelCount: teacherNextActionRows.filter(
          (row) => Boolean(row.safeNextActionLabel),
        ).length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      statusCounts,
      interventionReviewRows,
      remedialAssignmentRows,
      supportPlanRows,
      parentSummaryRows,
      teacherNextActionRows,
      evidenceRows,
    };
  }

  buildRemedialRetryCompletionSupportOutcomeFollowupReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport {
    const supportPlanReport =
      this.buildTeacherInterventionRemedialAssignmentSupportPlanReport(
        fixture,
        generatedAt,
      );
    const supportPlansById = new Map(
      supportPlanReport.supportPlanRows.map((row) => [row.supportPlanId, row]),
    );
    const remedialAssignmentsById = new Map(
      supportPlanReport.remedialAssignmentRows.map((row) => [
        row.remedialAssignmentId,
        row,
      ]),
    );
    const reviewsById = new Map(
      supportPlanReport.interventionReviewRows.map((row) => [
        row.interventionReviewId,
        row,
      ]),
    );
    const parentSupportSummariesById = new Map(
      supportPlanReport.parentSummaryRows.map((row) => [
        row.parentVisibleSupportSummaryId,
        row,
      ]),
    );
    const teacherNextActionsById = new Map(
      supportPlanReport.teacherNextActionRows.map((row) => [
        row.teacherVisibleNextActionId,
        row,
      ]),
    );
    const dailyPlansById = new Map(
      fixture.dailyPlans.map((dailyPlan) => [dailyPlan.id, dailyPlan]),
    );
    const practiceAttemptsById = new Map(
      fixture.practiceAttempts.map((attempt) => [attempt.id, attempt]),
    );

    const retryCompletionRows: DemoLearningRemedialRetryCompletionRow[] =
      fixture.remedialRetryCompletions.map((retry) => {
        const supportPlan = supportPlansById.get(retry.supportPlanId);
        if (!supportPlan) {
          throw new Error(
            `Missing local demo support plan for remedial retry ${retry.id}`,
          );
        }
        const remedialAssignment = remedialAssignmentsById.get(
          retry.remedialAssignmentId,
        );
        if (!remedialAssignment) {
          throw new Error(
            `Missing local demo remedial assignment for remedial retry ${retry.id}`,
          );
        }
        const review = reviewsById.get(supportPlan.interventionReviewId);
        if (!review) {
          throw new Error(
            `Missing local demo teacher review for remedial retry ${retry.id}`,
          );
        }
        const parentSupportSummary = parentSupportSummariesById.get(
          supportPlan.parentVisibleSupportSummaryId,
        );
        if (!parentSupportSummary) {
          throw new Error(
            `Missing local demo parent support summary for remedial retry ${retry.id}`,
          );
        }
        const teacherNextAction = teacherNextActionsById.get(
          supportPlan.teacherVisibleNextActionId,
        );
        if (!teacherNextAction) {
          throw new Error(
            `Missing local demo teacher next action for remedial retry ${retry.id}`,
          );
        }
        const remedialDailyPlan = this.requireDailyPlan(
          dailyPlansById,
          retry.remedialDailyPlanId,
        );
        const remedialPracticeAttempt = this.requirePracticeAttempt(
          practiceAttemptsById,
          retry.remedialPracticeAttemptId,
        );

        if (
          retry.studentId !== review.studentId ||
          supportPlan.remedialAssignmentId !==
            remedialAssignment.remedialAssignmentId ||
          remedialAssignment.supportPlanId !== supportPlan.supportPlanId ||
          remedialAssignment.remedialDailyPlanId !== remedialDailyPlan.id ||
          remedialAssignment.sourcePracticeAttemptId !==
            remedialPracticeAttempt.id ||
          remedialDailyPlan.studentId !== review.studentId ||
          remedialDailyPlan.courseId !== review.courseId ||
          remedialPracticeAttempt.studentId !== review.studentId ||
          remedialPracticeAttempt.dailyPlanId !== remedialDailyPlan.id
        ) {
          throw new Error(
            `Mismatched local demo remedial retry fixture for ${retry.id}`,
          );
        }

        const stableTraceIds = [
          review.studentId,
          review.courseId,
          review.progressRollupId,
          review.interventionReviewId,
          supportPlan.supportPlanId,
          remedialAssignment.remedialAssignmentId,
          remedialDailyPlan.id,
          remedialPracticeAttempt.id,
          retry.id,
          retry.supportOutcomeId,
          retry.parentFollowupSummaryId,
          retry.teacherFollowupSummaryId,
        ];

        return {
          retryCompletionId: retry.id,
          stableTraceKey: stableTraceIds.join('->'),
          stableTraceIds,
          studentId: review.studentId,
          childProfileId: review.childProfileId,
          studentName: review.studentName,
          parentGuardianId: parentSupportSummary.parentGuardianId,
          teacherId: review.teacherId,
          teacherName: review.teacherName,
          teacherEmail: review.teacherEmail,
          courseId: review.courseId,
          courseCode: review.courseCode,
          courseTitle: review.courseTitle,
          classId: review.classId,
          classCode: review.classCode,
          learningPathId: review.learningPathId,
          progressRollupId: review.progressRollupId,
          interventionReviewId: review.interventionReviewId,
          supportPlanId: supportPlan.supportPlanId,
          remedialAssignmentId: remedialAssignment.remedialAssignmentId,
          remedialDailyPlanId: remedialDailyPlan.id,
          remedialDailyPlanTitle: remedialDailyPlan.title,
          remedialPracticeAttemptId: remedialPracticeAttempt.id,
          remedialLessonCode: remedialAssignment.remedialLessonCode,
          retryStatus: retry.retryStatus,
          completedAt: retry.completedAt,
          completionPercent: retry.completionPercent,
          scorePercent: retry.scorePercent,
          supportOutcomeId: retry.supportOutcomeId,
          supportOutcomeStatus: retry.supportOutcomeStatus,
          supportOutcomeAt: retry.outcomeAt,
          parentFollowupSummaryId: retry.parentFollowupSummaryId,
          teacherFollowupSummaryId: retry.teacherFollowupSummaryId,
          parentVisible: retry.parentVisible,
          teacherVisible: retry.teacherVisible,
          safeNextActionLabel: retry.safeNextActionLabel,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary: retry.evidenceSummary,
          outcomeSummary: retry.outcomeSummary,
          parentFollowupSummary: retry.parentFollowupSummary,
          teacherFollowupSummary: retry.teacherFollowupSummary,
        } satisfies DemoLearningRemedialRetryCompletionRow;
      });

    const supportOutcomeRows: DemoLearningSupportOutcomeEvidenceRow[] =
      retryCompletionRows.map((row) => ({
        supportOutcomeId: row.supportOutcomeId,
        retryCompletionId: row.retryCompletionId,
        supportPlanId: row.supportPlanId,
        remedialAssignmentId: row.remedialAssignmentId,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        courseCode: row.courseCode,
        status: row.supportOutcomeStatus,
        scorePercent: row.scorePercent,
        completionPercent: row.completionPercent,
        outcomeAt: row.supportOutcomeAt,
        parentFollowupSummaryId: row.parentFollowupSummaryId,
        teacherFollowupSummaryId: row.teacherFollowupSummaryId,
        safeNextActionLabel: row.safeNextActionLabel,
        parentVisible: row.parentVisible,
        teacherVisible: row.teacherVisible,
        outcomeSummary: row.outcomeSummary,
      }));

    const parentFollowupSummaryRows: DemoLearningParentVisibleFollowupSummaryRow[] =
      retryCompletionRows
        .filter((row) => row.parentVisible)
        .map((row) => {
          const parentSupportSummary = parentSupportSummariesById.get(
            supportPlansById.get(row.supportPlanId)
              ?.parentVisibleSupportSummaryId ?? '',
          );
          if (!parentSupportSummary) {
            throw new Error(
              `Missing parent support summary for retry completion ${row.retryCompletionId}`,
            );
          }

          return {
            parentFollowupSummaryId: row.parentFollowupSummaryId,
            supportOutcomeId: row.supportOutcomeId,
            retryCompletionId: row.retryCompletionId,
            supportPlanId: row.supportPlanId,
            remedialAssignmentId: row.remedialAssignmentId,
            parentGuardianId: parentSupportSummary.parentGuardianId,
            parentGuardianName: parentSupportSummary.parentGuardianName,
            parentGuardianEmail: parentSupportSummary.parentGuardianEmail,
            studentId: row.studentId,
            childProfileId: row.childProfileId,
            studentName: row.studentName,
            courseCode: row.courseCode,
            retryStatus: row.retryStatus,
            supportOutcomeStatus: row.supportOutcomeStatus,
            scorePercent: row.scorePercent,
            completionPercent: row.completionPercent,
            safeNextActionLabel: row.safeNextActionLabel,
            parentVisible: true,
            summary: row.parentFollowupSummary,
          } satisfies DemoLearningParentVisibleFollowupSummaryRow;
        });

    const teacherFollowupSummaryRows: DemoLearningTeacherVisibleFollowupSummaryRow[] =
      retryCompletionRows
        .filter((row) => row.teacherVisible)
        .map((row) => ({
          teacherFollowupSummaryId: row.teacherFollowupSummaryId,
          supportOutcomeId: row.supportOutcomeId,
          retryCompletionId: row.retryCompletionId,
          supportPlanId: row.supportPlanId,
          remedialAssignmentId: row.remedialAssignmentId,
          teacherId: row.teacherId,
          teacherName: row.teacherName,
          teacherEmail: row.teacherEmail,
          classId: row.classId,
          classCode: row.classCode,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          courseCode: row.courseCode,
          retryStatus: row.retryStatus,
          supportOutcomeStatus: row.supportOutcomeStatus,
          scorePercent: row.scorePercent,
          completionPercent: row.completionPercent,
          safeNextActionLabel: row.safeNextActionLabel,
          teacherVisible: true,
          summary: row.teacherFollowupSummary,
        }));

    const statusCounts: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupStatusCounts =
      {
        retryStatus: this.countByStatus(
          remedialRetryCompletionStatuses,
          retryCompletionRows,
          (row) => row.retryStatus,
        ),
        supportOutcomeStatus: this.countByStatus(
          supportOutcomeEvidenceStatuses,
          supportOutcomeRows,
          (row) => row.status,
        ),
      };
    const rowsWithStableTrace = retryCompletionRows.filter((row) =>
      [
        row.studentId,
        row.courseId,
        row.progressRollupId,
        row.interventionReviewId,
        row.supportPlanId,
        row.remedialAssignmentId,
        row.remedialDailyPlanId,
        row.remedialPracticeAttemptId,
        row.retryCompletionId,
        row.supportOutcomeId,
        row.parentFollowupSummaryId,
        row.teacherFollowupSummaryId,
      ].every((id) => row.stableTraceKey.includes(id)),
    );
    const linkedRetryRows = retryCompletionRows.filter(
      (row) =>
        Boolean(row.studentId) &&
        Boolean(row.teacherId) &&
        Boolean(row.courseId) &&
        supportPlanReport.supportPlanRows.some(
          (plan) => plan.supportPlanId === row.supportPlanId,
        ) &&
        supportPlanReport.remedialAssignmentRows.some(
          (assignment) =>
            assignment.remedialAssignmentId === row.remedialAssignmentId,
        ) &&
        supportOutcomeRows.some(
          (outcome) => outcome.supportOutcomeId === row.supportOutcomeId,
        ) &&
        parentFollowupSummaryRows.some(
          (summary) =>
            summary.parentFollowupSummaryId === row.parentFollowupSummaryId,
        ) &&
        teacherFollowupSummaryRows.some(
          (summary) =>
            summary.teacherFollowupSummaryId === row.teacherFollowupSummaryId,
        ),
    );
    const remainingLocalDemoNotes = [
      'Remedial retry completions are deterministic fixture rows linked to the existing teacher support plan.',
      'Support outcome, parent follow-up summary, and teacher follow-up summary rows are read-only evidence only.',
      'Production retry persistence, teacher workflow mutation, parent delivery, provider calls, AI execution, and real learner mutations remain out of scope.',
    ];
    const safety = {
      ...supportPlanReport.safety,
      realRemedialRetryCompletionMutationUsed: false,
      realSupportOutcomeEvidenceMutationUsed: false,
      realParentFollowupSummaryMutationUsed: false,
      realTeacherFollowupSummaryMutationUsed: false,
    } satisfies DemoLearningRemedialRetryCompletionSupportOutcomeFollowupSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (
        gate === 'fixtureOnly' ||
        gate === 'noProductionDbRead' ||
        gate === 'productionReady'
      ) {
        return gate === 'productionReady' ? value !== false : value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupEvidenceRow[] =
      [
        {
          evidenceKind: 'SUPPORT_PLAN_REFERENCE',
          evidenceCount: supportPlanReport.supportPlanRows.length,
          stableFixtureIds: supportPlanReport.supportPlanRows.map(
            (row) => row.supportPlanId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Support plan references come from the prior teacher intervention fixture report.',
        },
        {
          evidenceKind: 'REMEDIAL_ASSIGNMENT_REFERENCE',
          evidenceCount: supportPlanReport.remedialAssignmentRows.length,
          stableFixtureIds: supportPlanReport.remedialAssignmentRows.map(
            (row) => row.remedialAssignmentId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Remedial assignment references are reused without writing learner assignments.',
        },
        {
          evidenceKind: 'REMEDIAL_RETRY_COMPLETION',
          evidenceCount: retryCompletionRows.length,
          stableFixtureIds: retryCompletionRows.map(
            (row) => row.retryCompletionId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Remedial retry completions include deterministic status, completion percent, and score evidence.',
        },
        {
          evidenceKind: 'SUPPORT_OUTCOME_EVIDENCE',
          evidenceCount: supportOutcomeRows.length,
          stableFixtureIds: supportOutcomeRows.map(
            (row) => row.supportOutcomeId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Support outcome evidence records a deterministic outcome status and safe next-action label.',
        },
        {
          evidenceKind: 'PARENT_VISIBLE_FOLLOWUP_SUMMARY',
          evidenceCount: parentFollowupSummaryRows.length,
          stableFixtureIds: parentFollowupSummaryRows.map(
            (row) => row.parentFollowupSummaryId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Parent-visible follow-up summaries are report evidence and do not send notifications.',
        },
        {
          evidenceKind: 'TEACHER_VISIBLE_FOLLOWUP_SUMMARY',
          evidenceCount: teacherFollowupSummaryRows.length,
          stableFixtureIds: teacherFollowupSummaryRows.map(
            (row) => row.teacherFollowupSummaryId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Teacher-visible follow-up summaries are local-demo rows and do not mutate teacher workflow state.',
        },
        {
          evidenceKind: 'STABLE_TRACE',
          evidenceCount: rowsWithStableTrace.length,
          stableFixtureIds: rowsWithStableTrace.map(
            (row) => row.stableTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Stable traces connect student -> course -> support plan/remedial assignment -> retry completion -> outcome -> follow-up summaries.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: safetyEntries.map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'All production, provider, payment, notification, AI, retry completion, support outcome, learning mutation, and ERP gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Remedial Retry Completion -> Support Outcome Follow-up Summary Report',
      generatedFor:
        'local-demo-remedial-retry-completion-support-outcome-followup-summary-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#remedial-retry-completion-support-outcome-followup-summary',
      jsonExportPath:
        'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.json',
      markdownExportPath:
        'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Teacher support plan evidence now traces remedial retry completion to support outcome evidence and parent/teacher follow-up summaries.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: new Set(retryCompletionRows.map((row) => row.studentId))
          .size,
        teacherCount: new Set(retryCompletionRows.map((row) => row.teacherId))
          .size,
        courseCount: new Set(retryCompletionRows.map((row) => row.courseId))
          .size,
        supportPlanReferenceCount: new Set(
          retryCompletionRows.map((row) => row.supportPlanId),
        ).size,
        remedialAssignmentReferenceCount: new Set(
          retryCompletionRows.map((row) => row.remedialAssignmentId),
        ).size,
        remedialRetryCompletionCount: retryCompletionRows.length,
        supportOutcomeEvidenceCount: supportOutcomeRows.length,
        parentVisibleFollowupSummaryCount: parentFollowupSummaryRows.length,
        teacherVisibleFollowupSummaryCount: teacherFollowupSummaryRows.length,
        safeNextActionCount: retryCompletionRows.filter((row) =>
          Boolean(row.safeNextActionLabel),
        ).length,
        stableTraceCount: rowsWithStableTrace.length,
        retryLinksCompleteCount: linkedRetryRows.length,
        outcomesWithDeterministicStatusCount: supportOutcomeRows.filter(
          (row) => Boolean(row.status) && Boolean(row.safeNextActionLabel),
        ).length,
        retriesWithDeterministicStatusScoreCount: retryCompletionRows.filter(
          (row) =>
            Boolean(row.retryStatus) &&
            row.completionPercent >= 0 &&
            row.scorePercent >= 0,
        ).length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      statusCounts,
      retryCompletionRows,
      supportOutcomeRows,
      parentFollowupSummaryRows,
      teacherFollowupSummaryRows,
      evidenceRows,
    };
  }

  buildRemedialRetryUnresolvedSupportEscalationReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningRemedialRetryUnresolvedSupportEscalationReport {
    const supportPlanReport =
      this.buildTeacherInterventionRemedialAssignmentSupportPlanReport(
        fixture,
        generatedAt,
      );
    const supportPlansById = new Map(
      supportPlanReport.supportPlanRows.map((row) => [row.supportPlanId, row]),
    );
    const remedialAssignmentsById = new Map(
      supportPlanReport.remedialAssignmentRows.map((row) => [
        row.remedialAssignmentId,
        row,
      ]),
    );
    const reviewsById = new Map(
      supportPlanReport.interventionReviewRows.map((row) => [
        row.interventionReviewId,
        row,
      ]),
    );
    const parentSupportSummariesById = new Map(
      supportPlanReport.parentSummaryRows.map((row) => [
        row.parentVisibleSupportSummaryId,
        row,
      ]),
    );
    const teacherNextActionsById = new Map(
      supportPlanReport.teacherNextActionRows.map((row) => [
        row.teacherVisibleNextActionId,
        row,
      ]),
    );
    const dailyPlansById = new Map(
      fixture.dailyPlans.map((dailyPlan) => [dailyPlan.id, dailyPlan]),
    );
    const practiceAttemptsById = new Map(
      fixture.practiceAttempts.map((attempt) => [attempt.id, attempt]),
    );

    const retryAttemptRows: DemoLearningRemedialRetryUnresolvedAttemptRow[] =
      fixture.remedialRetryUnresolvedEscalations.map((retry) => {
        const supportPlan = supportPlansById.get(retry.supportPlanId);
        if (!supportPlan) {
          throw new Error(
            `Missing local demo support plan for unresolved remedial retry ${retry.id}`,
          );
        }
        const remedialAssignment = remedialAssignmentsById.get(
          retry.remedialAssignmentId,
        );
        if (!remedialAssignment) {
          throw new Error(
            `Missing local demo remedial assignment for unresolved remedial retry ${retry.id}`,
          );
        }
        const review = reviewsById.get(supportPlan.interventionReviewId);
        if (!review) {
          throw new Error(
            `Missing local demo teacher review for unresolved remedial retry ${retry.id}`,
          );
        }
        const parentSupportSummary = parentSupportSummariesById.get(
          supportPlan.parentVisibleSupportSummaryId,
        );
        if (!parentSupportSummary) {
          throw new Error(
            `Missing local demo parent support summary for unresolved remedial retry ${retry.id}`,
          );
        }
        const teacherNextAction = teacherNextActionsById.get(
          supportPlan.teacherVisibleNextActionId,
        );
        if (!teacherNextAction) {
          throw new Error(
            `Missing local demo teacher next action for unresolved remedial retry ${retry.id}`,
          );
        }
        const remedialDailyPlan = this.requireDailyPlan(
          dailyPlansById,
          retry.remedialDailyPlanId,
        );
        const remedialPracticeAttempt = this.requirePracticeAttempt(
          practiceAttemptsById,
          retry.remedialPracticeAttemptId,
        );

        if (
          retry.studentId !== review.studentId ||
          supportPlan.remedialAssignmentId !==
            remedialAssignment.remedialAssignmentId ||
          remedialAssignment.supportPlanId !== supportPlan.supportPlanId ||
          remedialAssignment.remedialDailyPlanId !== remedialDailyPlan.id ||
          remedialAssignment.sourcePracticeAttemptId !==
            remedialPracticeAttempt.id ||
          remedialDailyPlan.studentId !== review.studentId ||
          remedialDailyPlan.courseId !== review.courseId ||
          remedialPracticeAttempt.studentId !== review.studentId ||
          remedialPracticeAttempt.dailyPlanId !== remedialDailyPlan.id
        ) {
          throw new Error(
            `Mismatched local demo unresolved remedial retry fixture for ${retry.id}`,
          );
        }

        const stableTraceIds = [
          review.studentId,
          review.courseId,
          review.progressRollupId,
          review.interventionReviewId,
          supportPlan.supportPlanId,
          remedialAssignment.remedialAssignmentId,
          remedialDailyPlan.id,
          remedialPracticeAttempt.id,
          retry.id,
          retry.unresolvedOutcomeId,
          retry.teacherEscalationId,
          retry.supportAdjustmentId,
          retry.parentEscalationSummaryId,
          retry.teacherEscalationNextActionId,
        ];

        return {
          retryAttemptId: retry.id,
          stableTraceKey: stableTraceIds.join('->'),
          stableTraceIds,
          studentId: review.studentId,
          childProfileId: review.childProfileId,
          studentName: review.studentName,
          parentGuardianId: parentSupportSummary.parentGuardianId,
          teacherId: review.teacherId,
          teacherName: review.teacherName,
          teacherEmail: review.teacherEmail,
          courseId: review.courseId,
          courseCode: review.courseCode,
          courseTitle: review.courseTitle,
          classId: review.classId,
          classCode: review.classCode,
          learningPathId: review.learningPathId,
          progressRollupId: review.progressRollupId,
          interventionReviewId: review.interventionReviewId,
          supportPlanId: supportPlan.supportPlanId,
          remedialAssignmentId: remedialAssignment.remedialAssignmentId,
          remedialDailyPlanId: remedialDailyPlan.id,
          remedialDailyPlanTitle: remedialDailyPlan.title,
          remedialPracticeAttemptId: remedialPracticeAttempt.id,
          remedialLessonCode: remedialAssignment.remedialLessonCode,
          retryStatus: retry.retryStatus,
          attemptedAt: retry.attemptedAt,
          completionPercent: retry.completionPercent,
          scorePercent: retry.scorePercent,
          unresolvedOutcomeId: retry.unresolvedOutcomeId,
          unresolvedOutcomeStatus: retry.unresolvedOutcomeStatus,
          reasonCode: retry.reasonCode,
          outcomeAt: retry.outcomeAt,
          teacherEscalationId: retry.teacherEscalationId,
          teacherEscalationStatus: retry.teacherEscalationStatus,
          supportAdjustmentId: retry.supportAdjustmentId,
          supportAdjustmentStatus: retry.supportAdjustmentStatus,
          parentEscalationSummaryId: retry.parentEscalationSummaryId,
          teacherEscalationNextActionId: retry.teacherEscalationNextActionId,
          parentVisible: retry.parentVisible,
          teacherVisible: retry.teacherVisible,
          safeNextActionLabel: retry.safeNextActionLabel,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary: retry.evidenceSummary,
          unresolvedOutcomeSummary: retry.unresolvedOutcomeSummary,
          teacherEscalationSummary: retry.teacherEscalationSummary,
          supportAdjustmentSummary: retry.supportAdjustmentSummary,
          parentEscalationSummary: retry.parentEscalationSummary,
          teacherNextActionSummary: retry.teacherNextActionSummary,
        } satisfies DemoLearningRemedialRetryUnresolvedAttemptRow;
      });

    const unresolvedOutcomeRows: DemoLearningUnresolvedSupportOutcomeEvidenceRow[] =
      retryAttemptRows.map((row) => ({
        unresolvedOutcomeId: row.unresolvedOutcomeId,
        retryAttemptId: row.retryAttemptId,
        supportPlanId: row.supportPlanId,
        remedialAssignmentId: row.remedialAssignmentId,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        courseCode: row.courseCode,
        status: row.unresolvedOutcomeStatus,
        reasonCode: row.reasonCode,
        scorePercent: row.scorePercent,
        completionPercent: row.completionPercent,
        outcomeAt: row.outcomeAt,
        teacherEscalationId: row.teacherEscalationId,
        parentEscalationSummaryId: row.parentEscalationSummaryId,
        teacherEscalationNextActionId: row.teacherEscalationNextActionId,
        safeNextActionLabel: row.safeNextActionLabel,
        parentVisible: row.parentVisible,
        teacherVisible: row.teacherVisible,
        outcomeSummary: row.unresolvedOutcomeSummary,
      }));

    const teacherEscalationRows: DemoLearningTeacherEscalationSupportAdjustmentRow[] =
      retryAttemptRows
        .filter((row) => row.teacherVisible)
        .map((row) => ({
          teacherEscalationId: row.teacherEscalationId,
          supportAdjustmentId: row.supportAdjustmentId,
          unresolvedOutcomeId: row.unresolvedOutcomeId,
          retryAttemptId: row.retryAttemptId,
          supportPlanId: row.supportPlanId,
          remedialAssignmentId: row.remedialAssignmentId,
          teacherId: row.teacherId,
          teacherName: row.teacherName,
          teacherEmail: row.teacherEmail,
          classId: row.classId,
          classCode: row.classCode,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          courseCode: row.courseCode,
          retryStatus: row.retryStatus,
          unresolvedOutcomeStatus: row.unresolvedOutcomeStatus,
          reasonCode: row.reasonCode,
          escalationStatus: row.teacherEscalationStatus,
          supportAdjustmentStatus: row.supportAdjustmentStatus,
          safeNextActionLabel: row.safeNextActionLabel,
          teacherVisible: true,
          escalationSummary: row.teacherEscalationSummary,
          supportAdjustmentSummary: row.supportAdjustmentSummary,
        }));

    const parentEscalationSummaryRows: DemoLearningParentVisibleEscalationSummaryRow[] =
      retryAttemptRows
        .filter((row) => row.parentVisible)
        .map((row) => {
          const parentSupportSummary = parentSupportSummariesById.get(
            supportPlansById.get(row.supportPlanId)
              ?.parentVisibleSupportSummaryId ?? '',
          );
          if (!parentSupportSummary) {
            throw new Error(
              `Missing parent support summary for unresolved retry ${row.retryAttemptId}`,
            );
          }

          return {
            parentEscalationSummaryId: row.parentEscalationSummaryId,
            unresolvedOutcomeId: row.unresolvedOutcomeId,
            retryAttemptId: row.retryAttemptId,
            supportPlanId: row.supportPlanId,
            remedialAssignmentId: row.remedialAssignmentId,
            parentGuardianId: parentSupportSummary.parentGuardianId,
            parentGuardianName: parentSupportSummary.parentGuardianName,
            parentGuardianEmail: parentSupportSummary.parentGuardianEmail,
            studentId: row.studentId,
            childProfileId: row.childProfileId,
            studentName: row.studentName,
            courseCode: row.courseCode,
            retryStatus: row.retryStatus,
            unresolvedOutcomeStatus: row.unresolvedOutcomeStatus,
            reasonCode: row.reasonCode,
            scorePercent: row.scorePercent,
            completionPercent: row.completionPercent,
            safeNextActionLabel: row.safeNextActionLabel,
            parentVisible: true,
            summary: row.parentEscalationSummary,
          } satisfies DemoLearningParentVisibleEscalationSummaryRow;
        });

    const teacherEscalationNextActionRows: DemoLearningTeacherVisibleEscalationNextActionRow[] =
      retryAttemptRows
        .filter((row) => row.teacherVisible)
        .map((row) => ({
          teacherEscalationNextActionId: row.teacherEscalationNextActionId,
          teacherEscalationId: row.teacherEscalationId,
          supportAdjustmentId: row.supportAdjustmentId,
          unresolvedOutcomeId: row.unresolvedOutcomeId,
          retryAttemptId: row.retryAttemptId,
          supportPlanId: row.supportPlanId,
          remedialAssignmentId: row.remedialAssignmentId,
          teacherId: row.teacherId,
          teacherName: row.teacherName,
          teacherEmail: row.teacherEmail,
          classId: row.classId,
          classCode: row.classCode,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          courseCode: row.courseCode,
          retryStatus: row.retryStatus,
          unresolvedOutcomeStatus: row.unresolvedOutcomeStatus,
          reasonCode: row.reasonCode,
          safeNextActionLabel: row.safeNextActionLabel,
          teacherVisible: true,
          summary: row.teacherNextActionSummary,
        }));

    const statusCounts: DemoLearningRemedialRetryUnresolvedSupportEscalationStatusCounts =
      {
        retryStatus: this.countByStatus(
          remedialRetryUnresolvedAttemptStatuses,
          retryAttemptRows,
          (row) => row.retryStatus,
        ),
        unresolvedOutcomeStatus: this.countByStatus(
          unresolvedSupportOutcomeStatuses,
          unresolvedOutcomeRows,
          (row) => row.status,
        ),
        reasonCode: this.countByStatus(
          unresolvedSupportOutcomeReasonCodes,
          unresolvedOutcomeRows,
          (row) => row.reasonCode,
        ),
        teacherEscalationStatus: this.countByStatus(
          teacherEscalationStatuses,
          teacherEscalationRows,
          (row) => row.escalationStatus,
        ),
        supportAdjustmentStatus: this.countByStatus(
          supportAdjustmentStatuses,
          teacherEscalationRows,
          (row) => row.supportAdjustmentStatus,
        ),
      };
    const rowsWithStableTrace = retryAttemptRows.filter((row) =>
      [
        row.studentId,
        row.courseId,
        row.progressRollupId,
        row.interventionReviewId,
        row.supportPlanId,
        row.remedialAssignmentId,
        row.remedialDailyPlanId,
        row.remedialPracticeAttemptId,
        row.retryAttemptId,
        row.unresolvedOutcomeId,
        row.teacherEscalationId,
        row.supportAdjustmentId,
        row.parentEscalationSummaryId,
        row.teacherEscalationNextActionId,
      ].every((id) => row.stableTraceKey.includes(id)),
    );
    const linkedRetryRows = retryAttemptRows.filter(
      (row) =>
        Boolean(row.studentId) &&
        Boolean(row.teacherId) &&
        Boolean(row.courseId) &&
        supportPlanReport.supportPlanRows.some(
          (plan) => plan.supportPlanId === row.supportPlanId,
        ) &&
        supportPlanReport.remedialAssignmentRows.some(
          (assignment) =>
            assignment.remedialAssignmentId === row.remedialAssignmentId,
        ) &&
        unresolvedOutcomeRows.some(
          (outcome) => outcome.unresolvedOutcomeId === row.unresolvedOutcomeId,
        ) &&
        teacherEscalationRows.some(
          (escalation) =>
            escalation.teacherEscalationId === row.teacherEscalationId &&
            escalation.supportAdjustmentId === row.supportAdjustmentId,
        ) &&
        parentEscalationSummaryRows.some(
          (summary) =>
            summary.parentEscalationSummaryId === row.parentEscalationSummaryId,
        ) &&
        teacherEscalationNextActionRows.some(
          (action) =>
            action.teacherEscalationNextActionId ===
            row.teacherEscalationNextActionId,
        ),
    );
    const remainingLocalDemoNotes = [
      'Unresolved remedial retry attempts are deterministic fixture rows linked to the existing teacher support plan.',
      'Teacher escalation, support adjustment, parent summary, and teacher next action rows are read-only evidence only.',
      'Production retry persistence, escalation workflow mutation, parent delivery, provider calls, AI execution, schedulers, and real learner mutations remain out of scope.',
    ];
    const safety = {
      ...supportPlanReport.safety,
      realRemedialRetryUnresolvedAttemptMutationUsed: false,
      realUnresolvedSupportOutcomeMutationUsed: false,
      realTeacherEscalationMutationUsed: false,
      realSupportAdjustmentMutationUsed: false,
      realParentEscalationSummaryMutationUsed: false,
      realTeacherEscalationNextActionMutationUsed: false,
    } satisfies DemoLearningRemedialRetryUnresolvedSupportEscalationSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (
        gate === 'fixtureOnly' ||
        gate === 'noProductionDbRead' ||
        gate === 'productionReady'
      ) {
        return gate === 'productionReady' ? value !== false : value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningRemedialRetryUnresolvedSupportEscalationEvidenceRow[] =
      [
        {
          evidenceKind: 'SUPPORT_PLAN_REFERENCE',
          evidenceCount: supportPlanReport.supportPlanRows.length,
          stableFixtureIds: supportPlanReport.supportPlanRows.map(
            (row) => row.supportPlanId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Support plan references come from the prior teacher intervention fixture report.',
        },
        {
          evidenceKind: 'REMEDIAL_ASSIGNMENT_REFERENCE',
          evidenceCount: supportPlanReport.remedialAssignmentRows.length,
          stableFixtureIds: supportPlanReport.remedialAssignmentRows.map(
            (row) => row.remedialAssignmentId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Remedial assignment references are reused without writing learner assignments.',
        },
        {
          evidenceKind: 'FAILED_OR_INCOMPLETE_RETRY',
          evidenceCount: retryAttemptRows.length,
          stableFixtureIds: retryAttemptRows.map((row) => row.retryAttemptId),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Retry attempts include deterministic incomplete or failed status, completion percent, and score evidence.',
        },
        {
          evidenceKind: 'UNRESOLVED_SUPPORT_OUTCOME',
          evidenceCount: unresolvedOutcomeRows.length,
          stableFixtureIds: unresolvedOutcomeRows.map(
            (row) => row.unresolvedOutcomeId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Unresolved support outcome evidence records deterministic status, reason code, and safe next-action label.',
        },
        {
          evidenceKind: 'TEACHER_ESCALATION_SUPPORT_ADJUSTMENT',
          evidenceCount: teacherEscalationRows.length,
          stableFixtureIds: teacherEscalationRows.flatMap((row) => [
            row.teacherEscalationId,
            row.supportAdjustmentId,
          ]),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Teacher escalation and support adjustment rows are local-demo evidence and do not mutate teacher workflow state.',
        },
        {
          evidenceKind: 'PARENT_VISIBLE_ESCALATION_SUMMARY',
          evidenceCount: parentEscalationSummaryRows.length,
          stableFixtureIds: parentEscalationSummaryRows.map(
            (row) => row.parentEscalationSummaryId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Parent-visible escalation summaries are report evidence and do not send notifications.',
        },
        {
          evidenceKind: 'TEACHER_VISIBLE_ESCALATION_NEXT_ACTION',
          evidenceCount: teacherEscalationNextActionRows.length,
          stableFixtureIds: teacherEscalationNextActionRows.map(
            (row) => row.teacherEscalationNextActionId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Teacher-visible escalation next actions are local-demo rows and do not mutate teacher workflow state.',
        },
        {
          evidenceKind: 'STABLE_TRACE',
          evidenceCount: rowsWithStableTrace.length,
          stableFixtureIds: rowsWithStableTrace.map(
            (row) => row.stableTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Stable traces connect student -> course -> support plan/remedial assignment -> retry attempt -> unresolved outcome -> escalation/support adjustment -> parent summary -> teacher next action.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: safetyEntries.map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'All production, provider, payment, notification, AI, scheduler, retry escalation, learning mutation, and ERP gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Remedial Retry Unresolved -> Support Escalation Report',
      generatedFor:
        'local-demo-remedial-retry-unresolved-support-escalation-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#remedial-retry-unresolved-support-escalation',
      jsonExportPath:
        'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.json',
      markdownExportPath:
        'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Teacher support plan evidence now traces an incomplete remedial retry to unresolved outcome, teacher escalation, parent escalation summary, and teacher next action evidence.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: new Set(retryAttemptRows.map((row) => row.studentId))
          .size,
        teacherCount: new Set(retryAttemptRows.map((row) => row.teacherId))
          .size,
        courseCount: new Set(retryAttemptRows.map((row) => row.courseId)).size,
        supportPlanReferenceCount: new Set(
          retryAttemptRows.map((row) => row.supportPlanId),
        ).size,
        remedialAssignmentReferenceCount: new Set(
          retryAttemptRows.map((row) => row.remedialAssignmentId),
        ).size,
        remedialRetryAttemptCount: retryAttemptRows.length,
        failedOrIncompleteRetryCount: retryAttemptRows.filter((row) =>
          ['FAILED', 'INCOMPLETE'].includes(row.retryStatus),
        ).length,
        unresolvedSupportOutcomeCount: unresolvedOutcomeRows.length,
        teacherEscalationCount: teacherEscalationRows.length,
        supportAdjustmentCount: teacherEscalationRows.filter((row) =>
          Boolean(row.supportAdjustmentId),
        ).length,
        parentVisibleEscalationSummaryCount: parentEscalationSummaryRows.length,
        teacherVisibleEscalationNextActionCount:
          teacherEscalationNextActionRows.length,
        safeNextActionCount: retryAttemptRows.filter((row) =>
          Boolean(row.safeNextActionLabel),
        ).length,
        stableTraceCount: rowsWithStableTrace.length,
        unresolvedRetryLinksCompleteCount: linkedRetryRows.length,
        outcomesWithDeterministicStatusReasonActionCount:
          unresolvedOutcomeRows.filter(
            (row) =>
              Boolean(row.status) &&
              Boolean(row.reasonCode) &&
              Boolean(row.safeNextActionLabel),
          ).length,
        attemptsWithDeterministicStatusScoreCount: retryAttemptRows.filter(
          (row) =>
            Boolean(row.retryStatus) &&
            row.completionPercent >= 0 &&
            row.scorePercent >= 0,
        ).length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      statusCounts,
      retryAttemptRows,
      unresolvedOutcomeRows,
      teacherEscalationRows,
      parentEscalationSummaryRows,
      teacherEscalationNextActionRows,
      evidenceRows,
    };
  }

  buildTeacherEscalationFollowupResolutionReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningTeacherEscalationFollowupResolutionReport {
    const unresolvedReport =
      this.buildRemedialRetryUnresolvedSupportEscalationReport(
        fixture,
        generatedAt,
      );
    const unresolvedRowsByAttemptId = new Map(
      unresolvedReport.retryAttemptRows.map((row) => [row.retryAttemptId, row]),
    );
    const parentEscalationSummariesById = new Map(
      unresolvedReport.parentEscalationSummaryRows.map((row) => [
        row.parentEscalationSummaryId,
        row,
      ]),
    );

    const resolutionRows: DemoLearningTeacherEscalationFollowupResolutionRow[] =
      fixture.teacherEscalationFollowupResolutions.map((resolution) => {
        const unresolvedRetry = unresolvedRowsByAttemptId.get(
          resolution.unresolvedRetryAttemptId,
        );
        if (!unresolvedRetry) {
          throw new Error(
            `Missing unresolved retry escalation for teacher follow-up resolution ${resolution.id}`,
          );
        }
        const parentEscalationSummary = parentEscalationSummariesById.get(
          unresolvedRetry.parentEscalationSummaryId,
        );
        if (!parentEscalationSummary) {
          throw new Error(
            `Missing parent escalation summary for teacher follow-up resolution ${resolution.id}`,
          );
        }

        if (
          resolution.studentId !== unresolvedRetry.studentId ||
          resolution.unresolvedOutcomeId !==
            unresolvedRetry.unresolvedOutcomeId ||
          resolution.teacherEscalationId !==
            unresolvedRetry.teacherEscalationId ||
          resolution.supportAdjustmentId !== unresolvedRetry.supportAdjustmentId
        ) {
          throw new Error(
            `Mismatched teacher follow-up resolution fixture for ${resolution.id}`,
          );
        }

        const stableTraceIds = [
          unresolvedRetry.studentId,
          unresolvedRetry.courseId,
          unresolvedRetry.progressRollupId,
          unresolvedRetry.interventionReviewId,
          unresolvedRetry.supportPlanId,
          unresolvedRetry.remedialAssignmentId,
          unresolvedRetry.remedialDailyPlanId,
          unresolvedRetry.remedialPracticeAttemptId,
          unresolvedRetry.retryAttemptId,
          unresolvedRetry.unresolvedOutcomeId,
          unresolvedRetry.teacherEscalationId,
          unresolvedRetry.supportAdjustmentId,
          resolution.teacherReviewedEscalationId,
          resolution.adjustedSupportRetryCompletionId,
          resolution.resolvedSupportOutcomeId,
          resolution.parentClosureSummaryId,
          resolution.teacherClosureNoteId,
        ];

        return {
          resolutionId: resolution.id,
          stableTraceKey: stableTraceIds.join('->'),
          stableTraceIds,
          studentId: unresolvedRetry.studentId,
          childProfileId: unresolvedRetry.childProfileId,
          studentName: unresolvedRetry.studentName,
          parentGuardianId: unresolvedRetry.parentGuardianId,
          teacherId: unresolvedRetry.teacherId,
          teacherName: unresolvedRetry.teacherName,
          teacherEmail: unresolvedRetry.teacherEmail,
          courseId: unresolvedRetry.courseId,
          courseCode: unresolvedRetry.courseCode,
          courseTitle: unresolvedRetry.courseTitle,
          classId: unresolvedRetry.classId,
          classCode: unresolvedRetry.classCode,
          learningPathId: unresolvedRetry.learningPathId,
          progressRollupId: unresolvedRetry.progressRollupId,
          interventionReviewId: unresolvedRetry.interventionReviewId,
          supportPlanId: unresolvedRetry.supportPlanId,
          remedialAssignmentId: unresolvedRetry.remedialAssignmentId,
          remedialDailyPlanId: unresolvedRetry.remedialDailyPlanId,
          remedialDailyPlanTitle: unresolvedRetry.remedialDailyPlanTitle,
          remedialPracticeAttemptId: unresolvedRetry.remedialPracticeAttemptId,
          remedialLessonCode: unresolvedRetry.remedialLessonCode,
          unresolvedRetryAttemptId: unresolvedRetry.retryAttemptId,
          unresolvedRetryStatus: unresolvedRetry.retryStatus,
          unresolvedOutcomeId: unresolvedRetry.unresolvedOutcomeId,
          unresolvedOutcomeStatus: unresolvedRetry.unresolvedOutcomeStatus,
          unresolvedReasonCode: unresolvedRetry.reasonCode,
          teacherEscalationId: unresolvedRetry.teacherEscalationId,
          supportAdjustmentId: unresolvedRetry.supportAdjustmentId,
          teacherReviewedEscalationId: resolution.teacherReviewedEscalationId,
          teacherReviewedEscalationStatus:
            resolution.teacherReviewedEscalationStatus,
          teacherReviewedAt: resolution.teacherReviewedAt,
          adjustedSupportRetryCompletionId:
            resolution.adjustedSupportRetryCompletionId,
          adjustedSupportRetryStatus: resolution.adjustedSupportRetryStatus,
          completedAt: resolution.completedAt,
          completionPercent: resolution.completionPercent,
          scorePercent: resolution.scorePercent,
          resolvedSupportOutcomeId: resolution.resolvedSupportOutcomeId,
          resolvedSupportOutcomeStatus: resolution.resolvedSupportOutcomeStatus,
          resolvedOutcomeReasonCode: resolution.resolvedOutcomeReasonCode,
          resolvedOutcomeAt: resolution.resolvedOutcomeAt,
          parentClosureSummaryId: resolution.parentClosureSummaryId,
          teacherClosureNoteId: resolution.teacherClosureNoteId,
          parentVisible: resolution.parentVisible,
          teacherVisible: resolution.teacherVisible,
          safeNextActionLabel: resolution.safeNextActionLabel,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary: resolution.evidenceSummary,
          teacherReviewSummary: resolution.teacherReviewSummary,
          adjustedRetryCompletionSummary:
            resolution.adjustedRetryCompletionSummary,
          resolvedOutcomeSummary: resolution.resolvedOutcomeSummary,
          parentClosureSummary: resolution.parentClosureSummary,
          teacherClosureNoteSummary: resolution.teacherClosureNoteSummary,
        } satisfies DemoLearningTeacherEscalationFollowupResolutionRow;
      });

    const teacherReviewedEscalationRows: DemoLearningTeacherReviewedEscalationRow[] =
      resolutionRows
        .filter((row) => row.teacherVisible)
        .map((row) => ({
          teacherReviewedEscalationId: row.teacherReviewedEscalationId,
          teacherEscalationId: row.teacherEscalationId,
          supportAdjustmentId: row.supportAdjustmentId,
          unresolvedOutcomeId: row.unresolvedOutcomeId,
          unresolvedRetryAttemptId: row.unresolvedRetryAttemptId,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          teacherId: row.teacherId,
          teacherName: row.teacherName,
          teacherEmail: row.teacherEmail,
          courseCode: row.courseCode,
          classCode: row.classCode,
          reviewStatus: row.teacherReviewedEscalationStatus,
          reviewedAt: row.teacherReviewedAt,
          safeNextActionLabel: row.safeNextActionLabel,
          teacherVisible: true,
          summary: row.teacherReviewSummary,
        }));

    const adjustedSupportRetryCompletionRows: DemoLearningAdjustedSupportRetryCompletionRow[] =
      resolutionRows.map((row) => ({
        adjustedSupportRetryCompletionId: row.adjustedSupportRetryCompletionId,
        teacherReviewedEscalationId: row.teacherReviewedEscalationId,
        supportAdjustmentId: row.supportAdjustmentId,
        unresolvedRetryAttemptId: row.unresolvedRetryAttemptId,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        teacherName: row.teacherName,
        courseCode: row.courseCode,
        remedialAssignmentId: row.remedialAssignmentId,
        remedialDailyPlanId: row.remedialDailyPlanId,
        remedialPracticeAttemptId: row.remedialPracticeAttemptId,
        retryStatus: row.adjustedSupportRetryStatus,
        completedAt: row.completedAt,
        scorePercent: row.scorePercent,
        completionPercent: row.completionPercent,
        resolvedSupportOutcomeId: row.resolvedSupportOutcomeId,
        safeNextActionLabel: row.safeNextActionLabel,
        summary: row.adjustedRetryCompletionSummary,
      }));

    const resolvedSupportOutcomeRows: DemoLearningResolvedSupportOutcomeEvidenceRow[] =
      resolutionRows.map((row) => ({
        resolvedSupportOutcomeId: row.resolvedSupportOutcomeId,
        adjustedSupportRetryCompletionId: row.adjustedSupportRetryCompletionId,
        teacherReviewedEscalationId: row.teacherReviewedEscalationId,
        unresolvedOutcomeId: row.unresolvedOutcomeId,
        supportAdjustmentId: row.supportAdjustmentId,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        courseCode: row.courseCode,
        status: row.resolvedSupportOutcomeStatus,
        reasonCode: row.resolvedOutcomeReasonCode,
        scorePercent: row.scorePercent,
        completionPercent: row.completionPercent,
        outcomeAt: row.resolvedOutcomeAt,
        parentClosureSummaryId: row.parentClosureSummaryId,
        teacherClosureNoteId: row.teacherClosureNoteId,
        safeNextActionLabel: row.safeNextActionLabel,
        parentVisible: row.parentVisible,
        teacherVisible: row.teacherVisible,
        outcomeSummary: row.resolvedOutcomeSummary,
      }));

    const parentClosureSummaryRows: DemoLearningParentVisibleClosureSummaryRow[] =
      resolutionRows
        .filter((row) => row.parentVisible)
        .map((row) => {
          const parentEscalationSummary = parentEscalationSummariesById.get(
            unresolvedRowsByAttemptId.get(row.unresolvedRetryAttemptId)
              ?.parentEscalationSummaryId ?? '',
          );
          if (!parentEscalationSummary) {
            throw new Error(
              `Missing parent closure reference for teacher follow-up resolution ${row.resolutionId}`,
            );
          }

          return {
            parentClosureSummaryId: row.parentClosureSummaryId,
            resolvedSupportOutcomeId: row.resolvedSupportOutcomeId,
            adjustedSupportRetryCompletionId:
              row.adjustedSupportRetryCompletionId,
            parentGuardianId: parentEscalationSummary.parentGuardianId,
            parentGuardianName: parentEscalationSummary.parentGuardianName,
            parentGuardianEmail: parentEscalationSummary.parentGuardianEmail,
            studentId: row.studentId,
            childProfileId: row.childProfileId,
            studentName: row.studentName,
            courseCode: row.courseCode,
            resolvedOutcomeStatus: row.resolvedSupportOutcomeStatus,
            resolvedOutcomeReasonCode: row.resolvedOutcomeReasonCode,
            scorePercent: row.scorePercent,
            completionPercent: row.completionPercent,
            safeNextActionLabel: row.safeNextActionLabel,
            parentVisible: true,
            summary: row.parentClosureSummary,
          } satisfies DemoLearningParentVisibleClosureSummaryRow;
        });

    const teacherClosureNoteRows: DemoLearningTeacherVisibleClosureNoteRow[] =
      resolutionRows
        .filter((row) => row.teacherVisible)
        .map((row) => ({
          teacherClosureNoteId: row.teacherClosureNoteId,
          resolvedSupportOutcomeId: row.resolvedSupportOutcomeId,
          adjustedSupportRetryCompletionId:
            row.adjustedSupportRetryCompletionId,
          teacherReviewedEscalationId: row.teacherReviewedEscalationId,
          teacherId: row.teacherId,
          teacherName: row.teacherName,
          teacherEmail: row.teacherEmail,
          classId: row.classId,
          classCode: row.classCode,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          courseCode: row.courseCode,
          resolvedOutcomeStatus: row.resolvedSupportOutcomeStatus,
          resolvedOutcomeReasonCode: row.resolvedOutcomeReasonCode,
          scorePercent: row.scorePercent,
          completionPercent: row.completionPercent,
          safeNextActionLabel: row.safeNextActionLabel,
          teacherVisible: true,
          summary: row.teacherClosureNoteSummary,
        }));

    const statusCounts: DemoLearningTeacherEscalationFollowupResolutionStatusCounts =
      {
        teacherReviewedEscalationStatus: this.countByStatus(
          teacherReviewedEscalationStatuses,
          teacherReviewedEscalationRows,
          (row) => row.reviewStatus,
        ),
        adjustedSupportRetryStatus: this.countByStatus(
          adjustedSupportRetryCompletionStatuses,
          adjustedSupportRetryCompletionRows,
          (row) => row.retryStatus,
        ),
        resolvedOutcomeStatus: this.countByStatus(
          resolvedSupportOutcomeStatuses,
          resolvedSupportOutcomeRows,
          (row) => row.status,
        ),
        resolvedOutcomeReasonCode: this.countByStatus(
          resolvedSupportOutcomeReasonCodes,
          resolvedSupportOutcomeRows,
          (row) => row.reasonCode,
        ),
      };
    const rowsWithStableTrace = resolutionRows.filter((row) =>
      [
        row.studentId,
        row.courseId,
        row.progressRollupId,
        row.interventionReviewId,
        row.supportPlanId,
        row.remedialAssignmentId,
        row.remedialDailyPlanId,
        row.remedialPracticeAttemptId,
        row.unresolvedRetryAttemptId,
        row.unresolvedOutcomeId,
        row.teacherEscalationId,
        row.supportAdjustmentId,
        row.teacherReviewedEscalationId,
        row.adjustedSupportRetryCompletionId,
        row.resolvedSupportOutcomeId,
        row.parentClosureSummaryId,
        row.teacherClosureNoteId,
      ].every((id) => row.stableTraceKey.includes(id)),
    );
    const linkedResolutionRows = resolutionRows.filter(
      (row) =>
        Boolean(row.studentId) &&
        Boolean(row.teacherId) &&
        Boolean(row.courseId) &&
        unresolvedReport.retryAttemptRows.some(
          (retry) => retry.retryAttemptId === row.unresolvedRetryAttemptId,
        ) &&
        teacherReviewedEscalationRows.some(
          (review) =>
            review.teacherReviewedEscalationId ===
            row.teacherReviewedEscalationId,
        ) &&
        adjustedSupportRetryCompletionRows.some(
          (completion) =>
            completion.adjustedSupportRetryCompletionId ===
            row.adjustedSupportRetryCompletionId,
        ) &&
        resolvedSupportOutcomeRows.some(
          (outcome) =>
            outcome.resolvedSupportOutcomeId === row.resolvedSupportOutcomeId,
        ) &&
        parentClosureSummaryRows.some(
          (summary) =>
            summary.parentClosureSummaryId === row.parentClosureSummaryId,
        ) &&
        teacherClosureNoteRows.some(
          (note) => note.teacherClosureNoteId === row.teacherClosureNoteId,
        ),
    );
    const remainingLocalDemoNotes = [
      'Teacher escalation follow-up resolutions are deterministic fixture rows linked to the prior unresolved support escalation.',
      'Adjusted retry completion, resolved outcome, parent closure summary, and teacher closure note rows are read-only evidence only.',
      'Production escalation resolution persistence, adjusted retry writes, parent delivery, provider calls, AI execution, schedulers, and real learner mutations remain out of scope.',
    ];
    const safety = {
      ...unresolvedReport.safety,
      realTeacherReviewedEscalationMutationUsed: false,
      realAdjustedSupportRetryCompletionMutationUsed: false,
      realResolvedSupportOutcomeMutationUsed: false,
      realParentClosureSummaryMutationUsed: false,
      realTeacherClosureNoteMutationUsed: false,
    } satisfies DemoLearningTeacherEscalationFollowupResolutionSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (
        gate === 'fixtureOnly' ||
        gate === 'noProductionDbRead' ||
        gate === 'productionReady'
      ) {
        return gate === 'productionReady' ? value !== false : value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningTeacherEscalationFollowupResolutionEvidenceRow[] =
      [
        {
          evidenceKind: 'UNRESOLVED_ESCALATION_REFERENCE',
          evidenceCount: unresolvedReport.retryAttemptRows.length,
          stableFixtureIds: unresolvedReport.retryAttemptRows.map(
            (row) => row.retryAttemptId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Unresolved escalation references come from the prior remedial retry unresolved support escalation report.',
        },
        {
          evidenceKind: 'TEACHER_REVIEWED_ESCALATION',
          evidenceCount: teacherReviewedEscalationRows.length,
          stableFixtureIds: teacherReviewedEscalationRows.map(
            (row) => row.teacherReviewedEscalationId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Teacher-reviewed escalation rows confirm the support adjustment before retry closure evidence.',
        },
        {
          evidenceKind: 'ADJUSTED_SUPPORT_RETRY_COMPLETION',
          evidenceCount: adjustedSupportRetryCompletionRows.length,
          stableFixtureIds: adjustedSupportRetryCompletionRows.map(
            (row) => row.adjustedSupportRetryCompletionId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Adjusted support retry completion rows include deterministic completion status, completion percent, and score evidence.',
        },
        {
          evidenceKind: 'RESOLVED_SUPPORT_OUTCOME',
          evidenceCount: resolvedSupportOutcomeRows.length,
          stableFixtureIds: resolvedSupportOutcomeRows.map(
            (row) => row.resolvedSupportOutcomeId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Resolved support outcome evidence records deterministic status, reason code, and safe next-action label.',
        },
        {
          evidenceKind: 'PARENT_VISIBLE_CLOSURE_SUMMARY',
          evidenceCount: parentClosureSummaryRows.length,
          stableFixtureIds: parentClosureSummaryRows.map(
            (row) => row.parentClosureSummaryId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Parent-visible closure summaries are report evidence and do not send notifications.',
        },
        {
          evidenceKind: 'TEACHER_VISIBLE_CLOSURE_NOTE',
          evidenceCount: teacherClosureNoteRows.length,
          stableFixtureIds: teacherClosureNoteRows.map(
            (row) => row.teacherClosureNoteId,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Teacher-visible closure notes are local-demo rows and do not mutate teacher workflow state.',
        },
        {
          evidenceKind: 'SAFE_NEXT_ACTION',
          evidenceCount: resolutionRows.filter((row) =>
            Boolean(row.safeNextActionLabel),
          ).length,
          stableFixtureIds: resolutionRows.map(
            (row) => row.safeNextActionLabel,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Safe next-action labels close the escalation without live scheduler, parent delivery, or learner mutation.',
        },
        {
          evidenceKind: 'STABLE_TRACE',
          evidenceCount: rowsWithStableTrace.length,
          stableFixtureIds: rowsWithStableTrace.map(
            (row) => row.stableTraceKey,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'Stable traces connect unresolved escalation -> teacher review -> adjusted retry completion -> resolved outcome -> parent closure -> teacher closure.',
        },
        {
          evidenceKind: 'SAFETY_GATE',
          evidenceCount: safetyGateCount,
          stableFixtureIds: safetyEntries.map(
            ([gate, value]) => `${gate}=${String(value)}`,
          ),
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            'All production, provider, payment, notification, AI, scheduler, escalation resolution, learning mutation, and ERP gates remain closed.',
        },
      ];

    return {
      reportName:
        'Learning local demo Teacher Escalation Follow-up Resolution Report',
      generatedFor: 'local-demo-teacher-escalation-followup-resolution-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/teacher-escalation-followup-resolution-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#teacher-escalation-followup-resolution',
      jsonExportPath:
        'exports/learning-local-demo-teacher-escalation-followup-resolution-report.json',
      markdownExportPath:
        'exports/learning-local-demo-teacher-escalation-followup-resolution-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Teacher escalation evidence now traces reviewed escalation, adjusted retry completion, resolved outcome, parent closure summary, and teacher closure note rows.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: new Set(resolutionRows.map((row) => row.studentId)).size,
        teacherCount: new Set(resolutionRows.map((row) => row.teacherId)).size,
        courseCount: new Set(resolutionRows.map((row) => row.courseId)).size,
        unresolvedEscalationReferenceCount: new Set(
          resolutionRows.map((row) => row.unresolvedRetryAttemptId),
        ).size,
        teacherReviewedEscalationCount: teacherReviewedEscalationRows.length,
        adjustedSupportRetryCompletionCount:
          adjustedSupportRetryCompletionRows.length,
        resolvedSupportOutcomeCount: resolvedSupportOutcomeRows.length,
        parentVisibleClosureSummaryCount: parentClosureSummaryRows.length,
        teacherVisibleClosureNoteCount: teacherClosureNoteRows.length,
        safeNextActionCount: resolutionRows.filter((row) =>
          Boolean(row.safeNextActionLabel),
        ).length,
        stableTraceCount: rowsWithStableTrace.length,
        resolvedFlowLinksCompleteCount: linkedResolutionRows.length,
        outcomesWithDeterministicStatusReasonActionCount:
          resolvedSupportOutcomeRows.filter(
            (row) =>
              Boolean(row.status) &&
              Boolean(row.reasonCode) &&
              Boolean(row.safeNextActionLabel),
          ).length,
        adjustedRetriesWithDeterministicStatusScoreCount:
          adjustedSupportRetryCompletionRows.filter(
            (row) =>
              Boolean(row.retryStatus) &&
              row.completionPercent >= 0 &&
              row.scorePercent >= 0,
          ).length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      statusCounts,
      resolutionRows,
      teacherReviewedEscalationRows,
      adjustedSupportRetryCompletionRows,
      resolvedSupportOutcomeRows,
      parentClosureSummaryRows,
      teacherClosureNoteRows,
      evidenceRows,
    };
  }

  buildMvpEndToEndReadinessTraceReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningMvpEndToEndReadinessTraceReport {
    const studentCourseFlowReport =
      this.buildStudentCourseEnrollmentSubscriptionFlowReport(
        fixture,
        generatedAt,
      );
    const subscriptionEntitlementDailyPlanAccessReport =
      this.buildSubscriptionEntitlementDailyPlanAccessReport(
        fixture,
        generatedAt,
      );
    const parentTeacherProgressAccessSummaryReport =
      this.buildParentTeacherProgressAccessSummaryReport(fixture, generatedAt);
    const permissionRedactionReport =
      this.buildParentTeacherReportPermissionPrivacyRedactionReport(
        fixture,
        generatedAt,
      );
    const parentPortalApprovedReportInboxReadReceiptReport =
      this.buildParentPortalApprovedReportInboxReadReceiptReport(
        fixture,
        generatedAt,
      );
    const screenTimeGuardReport =
      this.buildParentScreenTimeGrantDailyPlanGuardReport(fixture, generatedAt);
    const practiceRollupReport =
      this.buildLearningSessionCompletionPracticeProgressRollupReport(
        fixture,
        generatedAt,
      );
    const teacherInterventionReport =
      this.buildTeacherInterventionRemedialAssignmentSupportPlanReport(
        fixture,
        generatedAt,
      );
    const remedialRetryUnresolvedReport =
      this.buildRemedialRetryUnresolvedSupportEscalationReport(
        fixture,
        generatedAt,
      );
    const teacherEscalationResolutionReport =
      this.buildTeacherEscalationFollowupResolutionReport(fixture, generatedAt);

    const requireEvidence = <TRow>(
      row: TRow | undefined,
      description: string,
    ) => {
      if (!row) {
        throw new Error(
          `Missing local demo MVP end-to-end readiness trace evidence: ${description}`,
        );
      }

      return row;
    };

    const resolution = requireEvidence(
      teacherEscalationResolutionReport.resolutionRows.find(
        (row) =>
          row.studentId === 'student-minh' &&
          row.courseId === 'course-a1-starter',
      ),
      'student-minh teacher escalation resolution',
    );
    const studentCourse = requireEvidence(
      studentCourseFlowReport.relationshipRows.find(
        (row) =>
          row.studentId === resolution.studentId &&
          row.courseId === resolution.courseId,
      ),
      'student/course/enrollment/subscription relationship',
    );
    const entitlement = requireEvidence(
      subscriptionEntitlementDailyPlanAccessReport.accessRows.find(
        (row) =>
          row.studentId === resolution.studentId &&
          row.courseId === resolution.courseId &&
          row.learningPathId === resolution.learningPathId,
      ),
      'subscription entitlement and daily plan access',
    );
    const practiceRollup = requireEvidence(
      practiceRollupReport.progressRollupRows.find(
        (row) =>
          row.studentId === resolution.studentId &&
          row.courseId === resolution.courseId,
      ),
      'practice completion/progress rollup',
    );
    const parentTeacherReport = requireEvidence(
      parentTeacherProgressAccessSummaryReport.parentSummaryRows.find(
        (row) =>
          row.studentId === resolution.studentId &&
          row.courseCode === resolution.courseCode,
      ),
      'parent/teacher progress reporting summary',
    );
    const permissionCase = requireEvidence(
      permissionRedactionReport.permissionCaseRows.find(
        (row) =>
          row.permissionCaseId === 'permission-case-teacher-mai-assigned-a1',
      ),
      'permission and privacy redaction case',
    );
    const permissionEvidence = requireEvidence(
      permissionRedactionReport.fieldVisibilityRows.find(
        (row) =>
          row.permissionCaseId === permissionCase.permissionCaseId &&
          row.visibility === 'REDACTED',
      ),
      'redacted field evidence',
    );
    const parentInboxRowsById = new Map(
      parentPortalApprovedReportInboxReadReceiptReport.parentInboxRows.map(
        (row) => [row.parentInboxItemId, row],
      ),
    );
    const readAck = requireEvidence(
      parentPortalApprovedReportInboxReadReceiptReport.readAckRows.find(
        (row) => {
          const parentInboxRow = parentInboxRowsById.get(row.parentInboxItemId);

          return (
            row.studentId === resolution.studentId &&
            parentInboxRow?.courseId === resolution.courseId
          );
        },
      ),
      'aligned approved parent inbox read receipt',
    );
    const readAckParentInbox = requireEvidence(
      parentInboxRowsById.get(readAck.parentInboxItemId),
      'aligned approved parent inbox row for read receipt',
    );
    const screenTimeGuard = requireEvidence(
      screenTimeGuardReport.accessRows.find(
        (row) =>
          row.studentId === resolution.studentId &&
          row.courseId === resolution.courseId,
      ),
      'screen-time daily plan guard',
    );
    const teacherIntervention = requireEvidence(
      teacherInterventionReport.interventionReviewRows.find(
        (row) => row.interventionReviewId === resolution.interventionReviewId,
      ),
      'teacher intervention review',
    );
    const remedialRetry = requireEvidence(
      remedialRetryUnresolvedReport.retryAttemptRows.find(
        (row) => row.retryAttemptId === resolution.unresolvedRetryAttemptId,
      ),
      'remedial retry escalation',
    );
    const traceId = 'mvp-end-to-end-readiness-trace-minh-a1-2026-06-09';
    const stableEndToEndTraceIds = [
      resolution.studentId,
      resolution.courseId,
      studentCourse.enrollmentId,
      studentCourse.subscriptionId,
      studentCourse.paymentId,
      entitlement.entitlementId,
      entitlement.dailyPlanId,
      practiceRollup.progressRollupId,
      parentTeacherReport.parentSummaryId,
      permissionCase.permissionCaseId,
      permissionEvidence.fieldVisibilityId,
      readAckParentInbox.parentInboxItemId,
      readAck.readAckEvidenceId,
      screenTimeGuard.accessCaseId,
      teacherIntervention.interventionReviewId,
      resolution.supportPlanId,
      resolution.remedialAssignmentId,
      remedialRetry.retryAttemptId,
      resolution.teacherEscalationId,
      resolution.supportAdjustmentId,
      resolution.resolutionId,
      resolution.resolvedSupportOutcomeId,
    ];
    const traceRows: DemoLearningMvpEndToEndReadinessTraceRow[] = [
      {
        traceId,
        stableEndToEndTraceKey: stableEndToEndTraceIds.join('->'),
        stableEndToEndTraceIds,
        studentId: resolution.studentId,
        childProfileId: resolution.childProfileId,
        studentName: resolution.studentName,
        parentGuardianId: resolution.parentGuardianId,
        teacherId: resolution.teacherId,
        teacherName: resolution.teacherName,
        courseId: resolution.courseId,
        courseCode: resolution.courseCode,
        courseTitle: resolution.courseTitle,
        classId: resolution.classId,
        classCode: resolution.classCode,
        enrollmentId: studentCourse.enrollmentId,
        enrollmentStatus: studentCourse.enrollmentStatus,
        subscriptionId: studentCourse.subscriptionId,
        subscriptionStatus: studentCourse.subscriptionStatus,
        paymentId: studentCourse.paymentId,
        paymentStatus: studentCourse.paymentStatus,
        refundIds: studentCourse.refundIds,
        commissionIds: studentCourse.commissionIds,
        entitlementId: entitlement.entitlementId,
        entitlementStatus: entitlement.entitlementStatus,
        entitlementAccessStatus: entitlement.accessStatus,
        learningPathId: resolution.learningPathId,
        dailyPlanId: entitlement.dailyPlanId,
        dailyPlanTitle: entitlement.dailyPlanTitle,
        dailyPlanStatus: entitlement.dailyPlanStatus,
        practiceProgressRollupId: practiceRollup.progressRollupId,
        practiceAttemptId: practiceRollup.practiceAttemptId,
        practiceAttemptStatus: practiceRollup.practiceAttemptStatus,
        practiceScorePercent: practiceRollup.practiceScorePercent,
        progressStatus: practiceRollup.progressStatus,
        parentTeacherReportSummaryId: parentTeacherReport.parentSummaryId,
        parentTeacherPermissionCaseId: permissionCase.permissionCaseId,
        permissionRedactionEvidenceId: permissionEvidence.fieldVisibilityId,
        approvedDeliveryOrReadReceiptId: readAck.readAckEvidenceId,
        approvedDeliveryStudentId: readAck.studentId,
        approvedDeliveryCourseId: readAckParentInbox.courseId,
        screenTimeGuardEvidenceId: screenTimeGuard.accessCaseId,
        screenTimeAccessResult: screenTimeGuard.accessResult,
        teacherInterventionReviewId: teacherIntervention.interventionReviewId,
        supportPlanId: resolution.supportPlanId,
        remedialAssignmentId: resolution.remedialAssignmentId,
        remedialRetryOrEscalationId: remedialRetry.retryAttemptId,
        remedialRetryStatus: remedialRetry.retryStatus,
        unresolvedOutcomeId: resolution.unresolvedOutcomeId,
        teacherEscalationId: resolution.teacherEscalationId,
        supportAdjustmentId: resolution.supportAdjustmentId,
        escalationResolutionId: resolution.resolutionId,
        resolvedSupportOutcomeId: resolution.resolvedSupportOutcomeId,
        resolutionStatus: resolution.resolvedSupportOutcomeStatus,
        traceStatus: 'LOCAL_DEMO_READY_WITH_NOTES',
        reasonLabel:
          'Fixture-only MVP readiness trace links all accepted learning-core slices and keeps production_ready=false.',
        actionLabel:
          'Review the trace evidence locally; do not run providers, sends, schedulers, or live mutations.',
        ownerLabel: 'TEACHER',
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        productionReady: false,
        evidenceSummary:
          'Minh A1 local-demo journey links enrollment/subscription, entitlement and daily plan evidence, practice progress, reporting/privacy evidence, parent inbox read receipt evidence, screen-time guard, teacher intervention, remedial retry escalation, and teacher escalation resolution.',
      },
    ];

    const rowsWithStableTrace = traceRows.filter((row) =>
      [
        row.studentId,
        row.courseId,
        row.enrollmentId,
        row.subscriptionId,
        row.entitlementId,
        row.dailyPlanId,
        row.practiceProgressRollupId,
        row.approvedDeliveryOrReadReceiptId,
        row.teacherInterventionReviewId,
        row.remedialRetryOrEscalationId,
        row.escalationResolutionId,
        row.resolvedSupportOutcomeId,
      ].every((id) => row.stableEndToEndTraceKey.includes(id)),
    );
    const rowsWithSameStudentCoursePath = traceRows.filter(
      (row) =>
        row.studentId === resolution.studentId &&
        row.courseId === resolution.courseId &&
        row.enrollmentId === studentCourse.enrollmentId &&
        row.subscriptionId === studentCourse.subscriptionId &&
        row.learningPathId === resolution.learningPathId &&
        row.approvedDeliveryStudentId === row.studentId &&
        row.approvedDeliveryCourseId === row.courseId &&
        row.teacherInterventionReviewId === resolution.interventionReviewId &&
        row.escalationResolutionId === resolution.resolutionId,
    );
    const rowsWithAlignedApprovedDeliveryStudentCoursePath = traceRows.filter(
      (row) =>
        row.approvedDeliveryOrReadReceiptId &&
        row.approvedDeliveryStudentId === row.studentId &&
        row.approvedDeliveryCourseId === row.courseId,
    );
    const rowsWithDeterministicLabels = traceRows.filter(
      (row) =>
        Boolean(row.traceStatus) &&
        Boolean(row.reasonLabel) &&
        Boolean(row.actionLabel) &&
        Boolean(row.ownerLabel),
    );
    const remainingLocalDemoNotes = [
      'The trace is a deterministic local-demo evidence derivation over accepted slices; it does not create production orchestration state.',
      'The approved delivery/read receipt source is the aligned Minh/course A1 parent portal read/ack gate evidence and is kept explicit in the trace row.',
      'Production database reads, provider APIs, payment/refund mutation, notification sends, AI execution, scheduler activation, secrets, and real learner mutations remain out of scope.',
    ];
    const safety = {
      ...teacherEscalationResolutionReport.safety,
    } satisfies DemoLearningMvpEndToEndReadinessTraceSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (
        gate === 'fixtureOnly' ||
        gate === 'noProductionDbRead' ||
        gate === 'productionReady'
      ) {
        return gate === 'productionReady' ? value !== false : value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningMvpEndToEndReadinessTraceEvidenceRow[] = [
      {
        evidenceKind: 'STUDENT_COURSE_ENROLLMENT_SUBSCRIPTION',
        evidenceCount: traceRows.filter(
          (row) => row.enrollmentId && row.subscriptionId,
        ).length,
        stableFixtureIds: traceRows.map(
          (row) =>
            `${row.studentId}->${row.courseId}->${row.enrollmentId}->${row.subscriptionId}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'The trace starts from deterministic student, course, enrollment, and subscription fixture IDs.',
      },
      {
        evidenceKind: 'PAYMENT_REFUND_COMMISSION_FIXTURE',
        evidenceCount: traceRows.filter((row) => row.paymentId).length,
        stableFixtureIds: traceRows.flatMap((row) => [
          row.paymentId,
          ...row.refundIds,
          ...row.commissionIds,
        ]),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Payment/refund/commission evidence is fixture-only; no provider or live financial mutation is used.',
      },
      {
        evidenceKind: 'ENTITLEMENT_DAILY_PLAN',
        evidenceCount: traceRows.filter(
          (row) => row.entitlementId && row.dailyPlanId,
        ).length,
        stableFixtureIds: traceRows.map(
          (row) => `${row.entitlementId}->${row.dailyPlanId}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Entitlement and daily plan IDs connect the learner path into local-demo access evidence.',
      },
      {
        evidenceKind: 'PRACTICE_PROGRESS_COMPLETION',
        evidenceCount: traceRows.filter(
          (row) => row.practiceProgressRollupId && row.practiceAttemptId,
        ).length,
        stableFixtureIds: traceRows.map(
          (row) =>
            `${row.practiceProgressRollupId}->${row.practiceAttemptId}:${row.practiceScorePercent}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Practice progress rows carry deterministic status and score evidence.',
      },
      {
        evidenceKind: 'PARENT_TEACHER_REPORTING',
        evidenceCount: traceRows.filter(
          (row) => row.parentTeacherReportSummaryId,
        ).length,
        stableFixtureIds: traceRows.map(
          (row) => row.parentTeacherReportSummaryId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Parent/teacher reporting evidence is read-only fixture summary data.',
      },
      {
        evidenceKind: 'PERMISSION_REDACTION',
        evidenceCount: traceRows.filter(
          (row) =>
            row.parentTeacherPermissionCaseId &&
            row.permissionRedactionEvidenceId,
        ).length,
        stableFixtureIds: traceRows.map(
          (row) =>
            `${row.parentTeacherPermissionCaseId}->${row.permissionRedactionEvidenceId}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Permission and redaction references prove privacy handling remains fixture-only and reviewable.',
      },
      {
        evidenceKind: 'APPROVED_DELIVERY_READ_RECEIPT',
        evidenceCount: traceRows.filter(
          (row) => row.approvedDeliveryOrReadReceiptId,
        ).length,
        stableFixtureIds: traceRows.map(
          (row) => row.approvedDeliveryOrReadReceiptId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Aligned Minh/course A1 approved parent inbox read/ack evidence is referenced without notification delivery or parent-message mutation.',
      },
      {
        evidenceKind: 'SCREEN_TIME_GUARD',
        evidenceCount: traceRows.filter((row) => row.screenTimeGuardEvidenceId)
          .length,
        stableFixtureIds: traceRows.map(
          (row) =>
            `${row.screenTimeGuardEvidenceId}->${row.screenTimeAccessResult}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Screen-time guard evidence links the daily plan path to read-only parent-control fixture decisions.',
      },
      {
        evidenceKind: 'TEACHER_INTERVENTION',
        evidenceCount: traceRows.filter(
          (row) => row.teacherInterventionReviewId && row.supportPlanId,
        ).length,
        stableFixtureIds: traceRows.map(
          (row) =>
            `${row.teacherInterventionReviewId}->${row.supportPlanId}->${row.remedialAssignmentId}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher intervention evidence links needs-support progress to support plan and remedial assignment rows.',
      },
      {
        evidenceKind: 'REMEDIAL_RETRY_OR_ESCALATION',
        evidenceCount: traceRows.filter(
          (row) => row.remedialRetryOrEscalationId && row.teacherEscalationId,
        ).length,
        stableFixtureIds: traceRows.map(
          (row) =>
            `${row.remedialRetryOrEscalationId}->${row.unresolvedOutcomeId}->${row.teacherEscalationId}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Remedial retry escalation evidence carries deterministic retry status, unresolved outcome, and teacher escalation IDs.',
      },
      {
        evidenceKind: 'ESCALATION_RESOLUTION',
        evidenceCount: traceRows.filter(
          (row) => row.escalationResolutionId && row.resolvedSupportOutcomeId,
        ).length,
        stableFixtureIds: traceRows.map(
          (row) =>
            `${row.escalationResolutionId}->${row.resolvedSupportOutcomeId}->${row.resolutionStatus}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher escalation resolution closes the local-demo journey with resolved support outcome evidence.',
      },
      {
        evidenceKind: 'STABLE_END_TO_END_TRACE',
        evidenceCount: rowsWithStableTrace.length,
        stableFixtureIds: rowsWithStableTrace.map(
          (row) => row.stableEndToEndTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Stable trace keys connect accepted learning-core slice IDs into one reviewable MVP readiness path.',
      },
      {
        evidenceKind: 'SAFETY_GATE',
        evidenceCount: safetyGateCount,
        stableFixtureIds: safetyEntries.map(
          ([gate, value]) => `${gate}=${String(value)}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'All production, provider, payment, notification, AI, scheduler, learning mutation, and ERP gates remain closed.',
      },
    ];
    const statusCounts: DemoLearningMvpEndToEndReadinessTraceStatusCounts = {
      traceStatus: {
        LOCAL_DEMO_READY_WITH_NOTES: traceRows.length,
      },
      ownerLabel: {
        TEACHER: traceRows.length,
      },
    };

    return {
      reportName: 'Learning local demo MVP End-to-End Readiness Trace Report',
      generatedFor: 'local-demo-mvp-end-to-end-readiness-trace-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/mvp-end-to-end-readiness-trace-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#mvp-end-to-end-readiness-trace',
      jsonExportPath:
        'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json',
      markdownExportPath:
        'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'The local-demo MVP readiness trace links accepted learning-core evidence from enrollment fixture through teacher escalation resolution while keeping production_ready=false.',
        remainingLocalDemoNotes,
      },
      totals: {
        studentCount: new Set(traceRows.map((row) => row.studentId)).size,
        courseCount: new Set(traceRows.map((row) => row.courseId)).size,
        enrollmentOrSubscriptionCount: traceRows.filter(
          (row) => row.enrollmentId && row.subscriptionId,
        ).length,
        paymentRefundCommissionFixtureEvidenceCount: traceRows.filter(
          (row) =>
            row.paymentId ||
            row.refundIds.length > 0 ||
            row.commissionIds.length > 0,
        ).length,
        entitlementOrDailyPlanCount: traceRows.filter(
          (row) => row.entitlementId && row.dailyPlanId,
        ).length,
        practiceProgressOrCompletionCount: traceRows.filter(
          (row) => row.practiceProgressRollupId && row.practiceAttemptId,
        ).length,
        parentTeacherReportCount: traceRows.filter(
          (row) => row.parentTeacherReportSummaryId,
        ).length,
        permissionRedactionEvidenceCount: traceRows.filter(
          (row) => row.permissionRedactionEvidenceId,
        ).length,
        approvedDeliveryOrReadReceiptCount: traceRows.filter(
          (row) => row.approvedDeliveryOrReadReceiptId,
        ).length,
        alignedApprovedDeliveryStudentCoursePathCount:
          rowsWithAlignedApprovedDeliveryStudentCoursePath.length,
        screenTimeGuardEvidenceCount: traceRows.filter(
          (row) => row.screenTimeGuardEvidenceId,
        ).length,
        teacherInterventionEvidenceCount: traceRows.filter(
          (row) => row.teacherInterventionReviewId && row.supportPlanId,
        ).length,
        remedialRetryOrEscalationEvidenceCount: traceRows.filter(
          (row) => row.remedialRetryOrEscalationId && row.teacherEscalationId,
        ).length,
        escalationResolutionEvidenceCount: traceRows.filter(
          (row) => row.escalationResolutionId && row.resolvedSupportOutcomeId,
        ).length,
        stableEndToEndTraceCount: rowsWithStableTrace.length,
        deterministicStatusReasonActionOwnerCount:
          rowsWithDeterministicLabels.length,
        sameStudentCoursePathCount: rowsWithSameStudentCoursePath.length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      statusCounts,
      traceRows,
      evidenceRows,
    };
  }

  buildMvpRoleJourneyEntrypointsReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningMvpRoleJourneyEntrypointsReport {
    const mvpReadinessTraceReport = this.buildMvpEndToEndReadinessTraceReport(
      fixture,
      generatedAt,
    );
    const parentPortalApprovedReportInboxReadReceiptReport =
      this.buildParentPortalApprovedReportInboxReadReceiptReport(
        fixture,
        generatedAt,
      );
    const requireEvidence = <TRow>(
      row: TRow | undefined,
      description: string,
    ) => {
      if (!row) {
        throw new Error(
          `Missing local demo MVP role journey entrypoint evidence: ${description}`,
        );
      }

      return row;
    };
    const mvpTrace = requireEvidence(
      mvpReadinessTraceReport.traceRows.find(
        (row) =>
          row.studentId === 'student-minh' &&
          row.courseId === 'course-a1-starter',
      ),
      'student-minh/course-a1-starter readiness trace',
    );
    const parentReadAck = requireEvidence(
      parentPortalApprovedReportInboxReadReceiptReport.readAckRows.find(
        (row) =>
          row.readAckEvidenceId === mvpTrace.approvedDeliveryOrReadReceiptId,
      ),
      'aligned parent read receipt row',
    );
    const parentInbox = requireEvidence(
      parentPortalApprovedReportInboxReadReceiptReport.parentInboxRows.find(
        (row) => row.parentInboxItemId === parentReadAck.parentInboxItemId,
      ),
      'aligned parent inbox row',
    );
    const stableRoleJourneyTraceId =
      'mvp-role-journey-entrypoints-minh-a1-2026-06-09';
    const baseStableRoleJourneyTraceIds = [
      stableRoleJourneyTraceId,
      mvpTrace.traceId,
      mvpTrace.studentId,
      mvpTrace.courseId,
      mvpTrace.learningPathId,
      mvpTrace.dailyPlanId,
      mvpTrace.practiceAttemptId,
      parentInbox.parentInboxItemId,
      parentReadAck.readAckEvidenceId,
      mvpTrace.screenTimeGuardEvidenceId,
      mvpTrace.parentTeacherReportSummaryId,
      mvpTrace.teacherInterventionReviewId,
      mvpTrace.remedialAssignmentId,
      mvpTrace.remedialRetryOrEscalationId,
      mvpTrace.teacherEscalationId,
      mvpTrace.escalationResolutionId,
      mvpTrace.resolvedSupportOutcomeId,
    ];
    const buildEntrypointRow = (input: {
      role: DemoLearningMvpRoleJourneyEntrypointRole;
      roleLabel: string;
      routePath: string;
      dashboardAnchor: string;
      routeLabel: string;
      anchorLabel: string;
      actionLabel: string;
      reasonLabel: string;
      ownerLabel: DemoLearningMvpRoleJourneyEntrypointOwner;
      evidenceSummary: string;
    }): DemoLearningMvpRoleJourneyEntrypointRow => {
      const roleEntrypointId = `role-entrypoint-${input.role.toLowerCase().replace(/_/g, '-')}-minh-a1`;
      const stableRoleJourneyTraceIds = [
        ...baseStableRoleJourneyTraceIds,
        roleEntrypointId,
        input.role,
      ];

      return {
        roleEntrypointId,
        role: input.role,
        roleLabel: input.roleLabel,
        stableRoleJourneyTraceId,
        stableRoleJourneyTraceKey: stableRoleJourneyTraceIds.join('->'),
        stableRoleJourneyTraceIds,
        studentId: mvpTrace.studentId,
        childProfileId: mvpTrace.childProfileId,
        studentName: mvpTrace.studentName,
        parentGuardianId: mvpTrace.parentGuardianId,
        teacherId: mvpTrace.teacherId,
        teacherName: mvpTrace.teacherName,
        courseId: mvpTrace.courseId,
        courseCode: mvpTrace.courseCode,
        courseTitle: mvpTrace.courseTitle,
        learningPathId: mvpTrace.learningPathId,
        dailyPlanId: mvpTrace.dailyPlanId,
        dailyPlanTitle: mvpTrace.dailyPlanTitle,
        practiceAttemptId: mvpTrace.practiceAttemptId,
        routePath: input.routePath,
        dashboardAnchor: input.dashboardAnchor,
        routeLabel: input.routeLabel,
        anchorLabel: input.anchorLabel,
        actionLabel: input.actionLabel,
        statusLabel: 'LOCAL_DEMO_READY_WITH_NOTES',
        reasonLabel: input.reasonLabel,
        ownerLabel: input.ownerLabel,
        mvpReadinessTraceId: mvpTrace.traceId,
        parentInboxItemId: parentInbox.parentInboxItemId,
        parentReadReceiptEvidenceId: parentReadAck.readAckEvidenceId,
        screenTimeGuardEvidenceId: mvpTrace.screenTimeGuardEvidenceId,
        teacherProgressSummaryId: mvpTrace.parentTeacherReportSummaryId,
        teacherInterventionReviewId: mvpTrace.teacherInterventionReviewId,
        remedialAssignmentId: mvpTrace.remedialAssignmentId,
        remedialRetryOrEscalationId: mvpTrace.remedialRetryOrEscalationId,
        teacherEscalationResolutionId: mvpTrace.escalationResolutionId,
        safetyOverviewAnchor:
          '/admin/learning-local-demo#mvp-readiness-overview',
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        productionReady: false,
        evidenceSummary: input.evidenceSummary,
      };
    };
    const entrypointRows: DemoLearningMvpRoleJourneyEntrypointRow[] = [
      buildEntrypointRow({
        role: 'STUDENT',
        roleLabel: 'Student daily plan and practice entrypoint',
        routePath: `/student/learning/${mvpTrace.courseId}/daily-plans/${mvpTrace.dailyPlanId}#${mvpTrace.practiceAttemptId}`,
        dashboardAnchor:
          '/admin/learning-local-demo#learning-session-completion-practice-progress-rollup',
        routeLabel: 'Student daily plan route',
        anchorLabel: 'Daily plan practice evidence',
        actionLabel: 'Resume assigned daily plan practice',
        reasonLabel:
          'Student entrypoint starts from the accepted Minh/course A1 daily plan and practice attempt.',
        ownerLabel: 'STUDENT',
        evidenceSummary:
          'The student enters the same Minh A1 path through the daily plan/practice route tied to the MVP readiness trace.',
      }),
      buildEntrypointRow({
        role: 'PARENT',
        roleLabel:
          'Parent inbox, read receipt, and screen-time guard entrypoint',
        routePath: `/parent/children/${mvpTrace.childProfileId}/reports/${parentInbox.parentInboxItemId}#${parentReadAck.readAckEvidenceId}`,
        dashboardAnchor:
          '/admin/learning-local-demo#parent-portal-approved-report-inbox-read-receipt',
        routeLabel: 'Parent report inbox route',
        anchorLabel: 'Approved inbox read receipt evidence',
        actionLabel:
          'Open approved report, acknowledge it, and review screen-time guard state',
        reasonLabel:
          'Parent entrypoint links the approved inbox item, read receipt, and screen-time guard to Minh/course A1.',
        ownerLabel: 'PARENT',
        evidenceSummary:
          'The parent enters through the approved parent portal inbox/read receipt path and sees the linked screen-time guard evidence.',
      }),
      buildEntrypointRow({
        role: 'TEACHER',
        roleLabel:
          'Teacher progress, intervention, remedial, and escalation entrypoint',
        routePath: `/teacher/classes/${mvpTrace.classId}/students/${mvpTrace.studentId}/interventions/${mvpTrace.teacherInterventionReviewId}`,
        dashboardAnchor:
          '/admin/learning-local-demo#teacher-intervention-remedial-assignment-support-plan',
        routeLabel: 'Teacher intervention workspace route',
        anchorLabel: 'Progress intervention remedial escalation evidence',
        actionLabel:
          'Review progress, support plan, remedial retry, and close escalation resolution',
        reasonLabel:
          'Teacher entrypoint links progress reporting, intervention, remedial retry, and escalation resolution evidence.',
        ownerLabel: 'TEACHER',
        evidenceSummary:
          'The teacher enters through the Minh A1 intervention workspace and can trace progress, support plan, remedial retry, and resolved escalation rows.',
      }),
      buildEntrypointRow({
        role: 'ADMIN_OPERATOR',
        roleLabel:
          'Admin/operator readiness trace and safety overview entrypoint',
        routePath: `/admin/learning-local-demo#mvp-role-journey-entrypoints`,
        dashboardAnchor:
          '/admin/learning-local-demo#mvp-role-journey-entrypoints',
        routeLabel: 'Admin/operator MVP role journey route',
        anchorLabel: 'MVP role journey entrypoint evidence',
        actionLabel:
          'Review role entrypoints, MVP readiness trace, and closed safety gates',
        reasonLabel:
          'Admin/operator entrypoint exposes the local-demo role journey and safety overview without production readiness claims.',
        ownerLabel: 'ADMIN_OPERATOR',
        evidenceSummary:
          'The admin/operator enters through the new dashboard anchor and links the role journey to readiness trace and safety overview evidence.',
      }),
    ];
    const stableTraceRows: DemoLearningMvpRoleJourneyTraceRow[] = [
      {
        stableRoleJourneyTraceId,
        stableRoleJourneyTraceKey: [
          stableRoleJourneyTraceId,
          ...entrypointRows.map((row) => row.roleEntrypointId),
          mvpTrace.traceId,
          parentReadAck.readAckEvidenceId,
          mvpTrace.escalationResolutionId,
        ].join('->'),
        studentId: mvpTrace.studentId,
        courseId: mvpTrace.courseId,
        learningPathId: mvpTrace.learningPathId,
        roleEntrypointIds: entrypointRows.map((row) => row.roleEntrypointId),
        roleLabels: entrypointRows.map((row) => row.roleLabel),
        mvpReadinessTraceId: mvpTrace.traceId,
        parentReadReceiptEvidenceId: parentReadAck.readAckEvidenceId,
        teacherEscalationResolutionId: mvpTrace.escalationResolutionId,
        traceStatus: 'LOCAL_DEMO_READY_WITH_NOTES',
        reasonLabel:
          'All primary roles enter the accepted Minh/course A1 local-demo journey through one stable trace id.',
        actionLabel:
          'Use this entrypoint evidence for local review only; keep production_ready=false.',
        ownerLabel: 'ADMIN_OPERATOR',
        evidenceSummary:
          'Student, parent, teacher, and admin/operator entrypoints all share the same Minh/course A1 path and link to the accepted MVP readiness trace.',
      },
    ];
    const rowsWithSameStudentCoursePath = entrypointRows.filter(
      (row) =>
        row.studentId === mvpTrace.studentId &&
        row.courseId === mvpTrace.courseId &&
        row.learningPathId === mvpTrace.learningPathId &&
        row.dailyPlanId === mvpTrace.dailyPlanId &&
        row.practiceAttemptId === mvpTrace.practiceAttemptId,
    );
    const rowsWithDeterministicLabels = entrypointRows.filter(
      (row) =>
        Boolean(row.statusLabel) &&
        Boolean(row.reasonLabel) &&
        Boolean(row.actionLabel) &&
        Boolean(row.ownerLabel),
    );
    const rowsWithRouteAnchorActionStatusLabels = entrypointRows.filter(
      (row) =>
        Boolean(row.routePath) &&
        Boolean(row.dashboardAnchor) &&
        Boolean(row.routeLabel) &&
        Boolean(row.anchorLabel) &&
        Boolean(row.actionLabel) &&
        Boolean(row.statusLabel),
    );
    const remainingLocalDemoNotes = [
      'Role entrypoints are deterministic report/dashboard evidence only and do not create production navigation, authorization, or workflow state.',
      'Every role row links to student-minh, course-a1-starter, the aligned parent read receipt, and the accepted MVP readiness trace.',
      'Production database reads, provider APIs, payment/refund mutation, notification sends, AI execution, scheduler activation, secrets, and real learner mutations remain out of scope.',
    ];
    const safety = {
      ...mvpReadinessTraceReport.safety,
    } satisfies DemoLearningMvpRoleJourneyEntrypointsSafety;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (
        gate === 'fixtureOnly' ||
        gate === 'noProductionDbRead' ||
        gate === 'productionReady'
      ) {
        return gate === 'productionReady' ? value !== false : value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;
    const evidenceRows: DemoLearningMvpRoleJourneyEntrypointsEvidenceRow[] = [
      {
        evidenceKind: 'STUDENT_ENTRYPOINT',
        evidenceCount: entrypointRows.filter((row) => row.role === 'STUDENT')
          .length,
        stableFixtureIds: entrypointRows
          .filter((row) => row.role === 'STUDENT')
          .map(
            (row) =>
              `${row.roleEntrypointId}->${row.dailyPlanId}->${row.practiceAttemptId}`,
          ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Student entrypoint links to the accepted daily plan and practice attempt.',
      },
      {
        evidenceKind: 'PARENT_ENTRYPOINT',
        evidenceCount: entrypointRows.filter((row) => row.role === 'PARENT')
          .length,
        stableFixtureIds: entrypointRows
          .filter((row) => row.role === 'PARENT')
          .map(
            (row) =>
              `${row.roleEntrypointId}->${row.parentInboxItemId}->${row.parentReadReceiptEvidenceId}->${row.screenTimeGuardEvidenceId}`,
          ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Parent entrypoint links approved inbox, read receipt, and screen-time guard evidence.',
      },
      {
        evidenceKind: 'TEACHER_ENTRYPOINT',
        evidenceCount: entrypointRows.filter((row) => row.role === 'TEACHER')
          .length,
        stableFixtureIds: entrypointRows
          .filter((row) => row.role === 'TEACHER')
          .map(
            (row) =>
              `${row.roleEntrypointId}->${row.teacherInterventionReviewId}->${row.remedialAssignmentId}->${row.remedialRetryOrEscalationId}->${row.teacherEscalationResolutionId}`,
          ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher entrypoint links progress, intervention, remedial retry, and escalation resolution evidence.',
      },
      {
        evidenceKind: 'ADMIN_OPERATOR_ENTRYPOINT',
        evidenceCount: entrypointRows.filter(
          (row) => row.role === 'ADMIN_OPERATOR',
        ).length,
        stableFixtureIds: entrypointRows
          .filter((row) => row.role === 'ADMIN_OPERATOR')
          .map(
            (row) =>
              `${row.roleEntrypointId}->${row.mvpReadinessTraceId}->${row.safetyOverviewAnchor}`,
          ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Admin/operator entrypoint links the new role journey anchor, readiness trace, and safety overview.',
      },
      {
        evidenceKind: 'STABLE_ROLE_JOURNEY_TRACE',
        evidenceCount: stableTraceRows.length,
        stableFixtureIds: stableTraceRows.map(
          (row) => row.stableRoleJourneyTraceKey,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'One stable trace id connects every role entrypoint to the same Minh/course A1 path.',
      },
      {
        evidenceKind: 'SAFETY_GATE',
        evidenceCount: safetyGateCount,
        stableFixtureIds: safetyEntries.map(
          ([gate, value]) => `${gate}=${String(value)}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'All local-demo safety gates remain closed and production_ready remains false.',
      },
    ];
    const statusCounts: DemoLearningMvpRoleJourneyEntrypointsStatusCounts = {
      role: this.countByStatus(
        mvpRoleJourneyEntrypointRoles,
        entrypointRows,
        (row) => row.role,
      ),
      status: this.countByStatus(
        mvpRoleJourneyEntrypointStatuses,
        entrypointRows,
        (row) => row.statusLabel,
      ),
      ownerLabel: this.countByStatus(
        mvpRoleJourneyEntrypointOwners,
        entrypointRows,
        (row) => row.ownerLabel,
      ),
    };

    return {
      reportName: 'Learning local demo MVP Role Journey Entrypoints Report',
      generatedFor: 'local-demo-mvp-role-journey-entrypoints-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      endpointPath:
        '/v1/learning-local-demo/mvp-role-journey-entrypoints-report',
      dashboardEvidencePath:
        '/admin/learning-local-demo#mvp-role-journey-entrypoints',
      jsonExportPath:
        'exports/learning-local-demo-mvp-role-journey-entrypoints-report.json',
      markdownExportPath:
        'exports/learning-local-demo-mvp-role-journey-entrypoints-report.md',
      safety,
      currentStatus: {
        status: 'LOCAL_DEMO_READY_WITH_NOTES',
        summary:
          'Student, parent, teacher, and admin/operator local-demo entrypoints all link to the same accepted Minh/course A1 MVP readiness journey.',
        remainingLocalDemoNotes,
      },
      totals: {
        roleEntrypointCount: entrypointRows.length,
        studentRoleEntrypointCount: statusCounts.role.STUDENT,
        parentRoleEntrypointCount: statusCounts.role.PARENT,
        teacherRoleEntrypointCount: statusCounts.role.TEACHER,
        adminRoleEntrypointCount: statusCounts.role.ADMIN_OPERATOR,
        stableRoleJourneyTraceCount: stableTraceRows.length,
        sameStudentCoursePathCount: rowsWithSameStudentCoursePath.length,
        linkedMvpReadinessTraceCount: entrypointRows.filter(
          (row) => row.mvpReadinessTraceId === mvpTrace.traceId,
        ).length,
        linkedParentReadReceiptCount: entrypointRows.filter(
          (row) =>
            row.parentReadReceiptEvidenceId === parentReadAck.readAckEvidenceId,
        ).length,
        linkedTeacherEscalationResolutionCount: entrypointRows.filter(
          (row) =>
            row.teacherEscalationResolutionId ===
            mvpTrace.escalationResolutionId,
        ).length,
        deterministicStatusReasonActionOwnerCount:
          rowsWithDeterministicLabels.length,
        routeAnchorActionStatusLabelCount:
          rowsWithRouteAnchorActionStatusLabels.length,
        evidenceRowCount: evidenceRows.length,
        localDemoNoteCount: remainingLocalDemoNotes.length,
        productionReadyClaimCount: 0,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      statusCounts,
      entrypointRows,
      stableTraceRows,
      evidenceRows,
    };
  }

  buildTeacherContentLibraryLearningPathPublishReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningTeacherContentLibraryLearningPathPublishReport {
    const ownersById = new Map(
      fixture.contentOwners.map((owner) => [owner.id, owner]),
    );
    const contentItemsById = new Map(
      fixture.contentLibraryItems.map((item) => [item.id, item]),
    );
    const classAssignmentsById = new Map(
      fixture.contentClassAssignments.map((assignment) => [
        assignment.id,
        assignment,
      ]),
    );
    const coursesById = new Map(
      fixture.courses.map((course) => [course.id, course]),
    );
    const lessonsById = new Map(
      fixture.lessons.map((lesson) => [lesson.id, lesson]),
    );
    const classesById = new Map(
      fixture.classes.map((classCohort) => [classCohort.id, classCohort]),
    );
    const studentsById = new Map(
      fixture.students.map((student) => [student.id, student]),
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

    const studentVisibilityRows = fixture.contentStudentVisibilities
      .map((visibility) => {
        const contentItem = this.requireContentItem(
          contentItemsById,
          visibility.contentItemId,
        );
        const classAssignment = this.requireContentClassAssignment(
          classAssignmentsById,
          visibility.classAssignmentId,
        );
        const learningPath = this.requireLearningPath(
          pathsById,
          visibility.learningPathId,
        );
        const dailyPlan = this.requireDailyPlan(
          dailyPlansById,
          visibility.dailyPlanId,
        );
        const student = this.requireStudentById(
          studentsById,
          visibility.studentId,
        );
        const guardian = this.requireGuardian(
          guardiansById,
          visibility.parentGuardianId,
        );
        const course = this.requireCourseById(
          coursesById,
          learningPath.courseId,
        );
        const classCohort = this.requireClass(
          classesById,
          learningPath.classId,
        );
        const lesson = this.requireLesson(lessonsById, contentItem.lessonId);

        return {
          visibilityId: visibility.id,
          classAssignmentId: classAssignment.id,
          contentItemId: contentItem.id,
          contentTitle: contentItem.title,
          assetKind: contentItem.assetKind,
          publishStatus: contentItem.publishStatus,
          visibilityStatus: visibility.visibilityStatus,
          learningPathId: learningPath.id,
          dailyPlanId: dailyPlan.id,
          dailyPlanTitle: dailyPlan.title,
          dailyPlanStatus: dailyPlan.status,
          planDate: dailyPlan.planDate,
          studentId: student.id,
          childProfileId: student.childProfileId,
          studentName: student.displayName,
          parentGuardianId: guardian.id,
          parentGuardianName: guardian.displayName,
          courseCode: course.code,
          classCode: classCohort.code,
          lessonCode: lesson.code,
          studentVisible: visibility.studentVisible,
          parentVisible: visibility.parentVisible,
          availableOnDailyPlan: visibility.availableOnDailyPlan,
          publishedAt: visibility.publishedAt ?? null,
          blockedReason: visibility.blockedReason ?? 'NONE',
        } satisfies DemoLearningTeacherContentStudentVisibilityRow;
      })
      .sort((left, right) =>
        [
          left.classCode,
          left.studentName,
          left.planDate,
          left.contentTitle,
          left.visibilityId,
        ]
          .join('|')
          .localeCompare(
            [
              right.classCode,
              right.studentName,
              right.planDate,
              right.contentTitle,
              right.visibilityId,
            ].join('|'),
          ),
      );
    const visibilityRowsByContentItemId = this.groupBy(
      studentVisibilityRows,
      (row) => row.contentItemId,
    );
    const visibilityRowsByClassAssignmentId = this.groupBy(
      studentVisibilityRows,
      (row) => row.classAssignmentId,
    );

    const classAssignmentRows = fixture.contentClassAssignments
      .map((assignment) => {
        const contentItem = this.requireContentItem(
          contentItemsById,
          assignment.contentItemId,
        );
        const owner = this.requireContentOwner(
          ownersById,
          assignment.assignedByOwnerId,
        );
        const classCohort = this.requireClass(classesById, assignment.classId);
        const course = this.requireCourseById(
          coursesById,
          contentItem.courseId,
        );
        const visibilityRows =
          visibilityRowsByClassAssignmentId.get(assignment.id) ?? [];

        return {
          classAssignmentId: assignment.id,
          contentItemId: contentItem.id,
          contentTitle: contentItem.title,
          assetKind: contentItem.assetKind,
          publishStatus: contentItem.publishStatus,
          assignmentStatus: assignment.assignmentStatus,
          classId: classCohort.id,
          classCode: classCohort.code,
          classTitle: classCohort.title,
          teacherName: classCohort.teacherName,
          courseCode: course.code,
          ownerName: owner.displayName,
          assignedAt: assignment.assignedAt,
          studentVisibilityCount: visibilityRows.filter(
            (row) => row.studentVisible,
          ).length,
          visibleStudentCount: visibilityRows.filter(
            (row) => row.studentVisible,
          ).length,
          blockedStudentVisibilityCount: visibilityRows.filter(
            (row) => !row.studentVisible,
          ).length,
          blockedReason: assignment.blockedReason ?? 'NONE',
        } satisfies DemoLearningTeacherContentClassAssignmentRow;
      })
      .sort((left, right) =>
        [left.classCode, left.contentTitle, left.classAssignmentId]
          .join('|')
          .localeCompare(
            [right.classCode, right.contentTitle, right.classAssignmentId].join(
              '|',
            ),
          ),
      );

    const contentRows = fixture.contentLibraryItems
      .map((contentItem) => {
        const owner = this.requireContentOwner(ownersById, contentItem.ownerId);
        const course = this.requireCourseById(
          coursesById,
          contentItem.courseId,
        );
        const lesson = this.requireLesson(lessonsById, contentItem.lessonId);
        const classAssignmentCount = fixture.contentClassAssignments.filter(
          (assignment) => assignment.contentItemId === contentItem.id,
        ).length;
        const visibilityRows =
          visibilityRowsByContentItemId.get(contentItem.id) ?? [];
        const visibleRows = visibilityRows.filter((row) => row.studentVisible);
        const parentVisibleGuardianCount = new Set(
          visibilityRows
            .filter((row) => row.parentVisible)
            .map((row) => row.parentGuardianId),
        ).size;

        return {
          contentItemId: contentItem.id,
          ownerId: owner.id,
          ownerName: owner.displayName,
          ownerEmail: owner.email,
          ownerRole: owner.role,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          lessonId: lesson.id,
          lessonCode: lesson.code,
          lessonTitle: lesson.title,
          assetKind: contentItem.assetKind,
          assetRef: contentItem.assetRef,
          title: contentItem.title,
          publishStatus: contentItem.publishStatus,
          classAssignmentCount,
          learningPathPublishCount: visibleRows.filter(
            (row) => row.availableOnDailyPlan,
          ).length,
          studentVisibilityCount: visibleRows.length,
          parentVisibleSummaryCount: parentVisibleGuardianCount,
          needsTeacherReview: contentItem.needsTeacherReview,
          blockedReason: contentItem.blockedReason ?? 'NONE',
        } satisfies DemoLearningTeacherContentLibraryItemRow;
      })
      .sort((left, right) =>
        [left.courseCode, left.lessonCode, left.assetKind, left.contentItemId]
          .join('|')
          .localeCompare(
            [
              right.courseCode,
              right.lessonCode,
              right.assetKind,
              right.contentItemId,
            ].join('|'),
          ),
      );
    const parentSummaryRows = this.buildTeacherContentParentSummaryRows(
      studentVisibilityRows,
      contentItemsById,
    );
    const statusCounts =
      this.buildTeacherContentLibraryLearningPathPublishStatusCounts(fixture);
    const learningPathPublishCount = studentVisibilityRows.filter(
      (row) => row.studentVisible && row.availableOnDailyPlan,
    ).length;
    const studentVisibilityCount = studentVisibilityRows.filter(
      (row) => row.studentVisible,
    ).length;
    const blockedUnpublishedItemCount = fixture.contentLibraryItems.filter(
      (item) => item.publishStatus !== 'PUBLISHED',
    ).length;

    return {
      reportName:
        'Learning local demo Teacher Content Library -> Learning Path Publish -> Parent Summary Report',
      generatedFor:
        'local-demo-teacher-content-library-learning-path-publish-report',
      generatedAt,
      currency: fixture.currency,
      safety: {
        fixtureOnly: true,
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
        realContentLibraryMutationUsed: false,
        realContentPublishMutationUsed: false,
        realContentUploadMutationUsed: false,
        realStorageCdnMutationUsed: false,
        realTeacherAdminAccountMutationUsed: false,
        realStudentClassVisibilityMutationUsed: false,
        realParentSummaryMutationUsed: false,
        realPaymentMutationUsed: false,
        realRefundMutationUsed: false,
        realCommissionMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      },
      totals: {
        teacherAdminCount: fixture.contentOwners.length,
        contentItemCount: fixture.contentLibraryItems.length,
        videoAssetCount: statusCounts.assetKind.VIDEO,
        practiceAssetCount: statusCounts.assetKind.PRACTICE,
        lessonAssetCount: statusCounts.assetKind.LESSON,
        draftContentCount: statusCounts.publishStatus.DRAFT,
        publishedContentCount: statusCounts.publishStatus.PUBLISHED,
        archivedContentCount: statusCounts.publishStatus.ARCHIVED,
        learningPathPublishCount,
        classAssignmentCount: fixture.contentClassAssignments.length,
        studentVisibilityCount,
        parentVisibleSummaryCount: parentSummaryRows.length,
        blockedUnpublishedItemCount,
        itemsNeedingTeacherReviewCount: fixture.contentLibraryItems.filter(
          (item) => item.needsTeacherReview,
        ).length,
      },
      statusCounts,
      contentRows,
      classAssignmentRows,
      studentVisibilityRows,
      parentSummaryRows,
    };
  }

  buildAiTutorChatSafetyTeacherReviewReport(
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
    const messagesBySessionId = this.groupBy(
      fixture.aiTutorChatMessages,
      (message) => message.chatSessionId,
    );
    const safetyFlagsBySessionId = this.groupBy(
      fixture.aiTutorSafetyFlags,
      (flag) => flag.chatSessionId,
    );
    const reviewItemsBySessionId = this.groupBy(
      fixture.aiTutorTeacherReviewItems,
      (item) => item.chatSessionId,
    );
    const parentSummariesBySessionId = this.groupBy(
      fixture.aiTutorParentSummaries,
      (summary) => summary.chatSessionId,
    );
    const supportRecommendationsBySessionId = this.groupBy(
      fixture.aiTutorSupportRecommendations,
      (recommendation) => recommendation.chatSessionId,
    );
    const supportRecommendationsByReviewItemId = this.groupBy(
      fixture.aiTutorSupportRecommendations,
      (recommendation) => recommendation.teacherReviewItemId,
    );

    const chatSessionRows = fixture.aiTutorChatSessions
      .map((session) => {
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          session.enrollmentId,
        );
        const student = this.requireStudentById(
          studentsById,
          session.studentId,
        );
        const learningPath = this.requireLearningPath(
          pathsById,
          session.learningPathId,
        );
        const dailyPlan = this.requireDailyPlan(
          dailyPlansById,
          session.dailyPlanId,
        );
        const lesson = this.requireLesson(lessonsById, session.lessonId);
        const course = this.requireCourseById(coursesById, enrollment.courseId);
        const classCohort = this.requireClass(
          classesById,
          learningPath.classId,
        );
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
        const session = this.requireAiTutorChatSession(
          sessionsById,
          message.chatSessionId,
        );
        const student = this.requireStudentById(
          studentsById,
          session.studentId,
        );

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
        const session = this.requireAiTutorChatSession(
          sessionsById,
          flag.chatSessionId,
        );
        const student = this.requireStudentById(studentsById, flag.studentId);

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
        const flag = this.requireAiTutorSafetyFlag(
          safetyFlagsById,
          item.safetyFlagId,
        );
        const session = this.requireAiTutorChatSession(
          sessionsById,
          item.chatSessionId,
        );
        const dailyPlan = this.requireDailyPlan(
          dailyPlansById,
          session.dailyPlanId,
        );
        const student = this.requireStudentById(studentsById, item.studentId);
        const course = this.requireCourseById(coursesById, dailyPlan.courseId);
        const classCohort = this.requireClass(classesById, dailyPlan.classId);
        const lesson = this.requireLesson(lessonsById, dailyPlan.lessonId);

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
        const session = this.requireAiTutorChatSession(
          sessionsById,
          summary.chatSessionId,
        );
        const dailyPlan = this.requireDailyPlan(
          dailyPlansById,
          session.dailyPlanId,
        );
        const student = this.requireStudentById(
          studentsById,
          summary.studentId,
        );
        const guardian = this.requireGuardian(
          guardiansById,
          summary.parentGuardianId,
        );
        const course = this.requireCourseById(coursesById, dailyPlan.courseId);
        const classCohort = this.requireClass(classesById, dailyPlan.classId);

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
            [right.studentName, right.createdAt, right.parentSummaryId].join(
              '|',
            ),
          ),
      );

    const supportRecommendationRows = fixture.aiTutorSupportRecommendations
      .map((recommendation) => {
        const session = this.requireAiTutorChatSession(
          sessionsById,
          recommendation.chatSessionId,
        );
        const dailyPlan = this.requireDailyPlan(
          dailyPlansById,
          recommendation.dailyPlanId,
        );
        const student = this.requireStudentById(
          studentsById,
          recommendation.studentId,
        );
        const course = this.requireCourseById(coursesById, dailyPlan.courseId);
        const classCohort = this.requireClass(classesById, dailyPlan.classId);

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

    const statusCounts =
      this.buildAiTutorChatSafetyTeacherReviewStatusCounts(fixture);
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
        supportRecommendationCount:
          fixture.aiTutorSupportRecommendations.length,
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

  buildStudentAchievementBadgeCertificateReport(
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
      fixture.enrollments.map((enrollment) => [
        enrollment.studentId,
        enrollment,
      ]),
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
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          record.enrollmentId,
        );
        const student = this.requireStudentById(studentsById, record.studentId);
        const course = this.requireCourseById(coursesById, record.courseId);
        const classCohort = this.requireClass(classesById, record.classId);
        const lesson = this.requireLesson(lessonsById, record.lessonId);
        const dailyPlan = this.requireDailyPlan(
          dailyPlansById,
          record.dailyPlanId,
        );
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
          this.requireAiTutorSupportRecommendation(
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
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          badge.enrollmentId,
        );
        const student = this.requireStudentById(studentsById, badge.studentId);
        const course = this.requireCourseById(coursesById, badge.courseId);
        const classCohort = this.requireClass(classesById, badge.classId);
        for (const achievementRecordId of badge.achievementRecordIds) {
          this.requireAchievementRecord(
            achievementRecordsById,
            achievementRecordId,
          );
        }
        if (enrollment.studentId !== student.id) {
          throw new Error(
            `Mismatched local demo badge fixture for ${badge.id}`,
          );
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
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          certificate.enrollmentId,
        );
        const student = this.requireStudentById(
          studentsById,
          certificate.studentId,
        );
        const course = this.requireCourseById(
          coursesById,
          certificate.courseId,
        );
        const classCohort = this.requireClass(classesById, certificate.classId);
        const learningPath = this.requireLearningPath(
          pathsById,
          certificate.learningPathId,
        );
        for (const badgeAwardId of certificate.completedBadgeAwardIds) {
          this.requireBadgeAward(badgeAwardsById, badgeAwardId);
        }
        for (const milestoneId of certificate.pendingMilestoneIds) {
          this.requireMilestone(milestonesById, milestoneId);
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
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          milestone.enrollmentId,
        );
        const student = this.requireStudentById(
          studentsById,
          milestone.studentId,
        );
        const course = this.requireCourseById(coursesById, milestone.courseId);
        const classCohort = this.requireClass(classesById, milestone.classId);
        const learningPath = this.requireLearningPath(
          pathsById,
          milestone.learningPathId,
        );
        const dailyPlan = this.requireDailyPlan(
          dailyPlansById,
          milestone.dailyPlanId,
        );
        const lesson = this.requireLesson(lessonsById, milestone.lessonId);
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
        const student = this.requireStudentById(
          studentsById,
          recognition.studentId,
        );
        const guardian = this.requireGuardian(
          guardiansById,
          recognition.parentGuardianId,
        );
        const course = this.requireCourseById(
          coursesById,
          recognition.courseId,
        );
        const classCohort = this.requireClass(classesById, recognition.classId);
        if (recognition.sourceBadgeAwardId) {
          this.requireBadgeAward(
            badgeAwardsById,
            recognition.sourceBadgeAwardId,
          );
        }
        if (recognition.sourceCertificateFixtureId) {
          this.requireCertificateFixture(
            certificateFixturesById,
            recognition.sourceCertificateFixtureId,
          );
        }
        if (recognition.sourceAiTutorSupportRecommendationId) {
          this.requireAiTutorSupportRecommendation(
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

    const badgeRowsByStudentId = this.groupBy(
      badgeRows,
      (row) => row.studentId,
    );
    const achievementRowsByStudentId = this.groupBy(
      achievementRows,
      (row) => row.studentId,
    );
    const certificateRowsByStudentId = this.groupBy(
      certificateRows,
      (row) => row.studentId,
    );
    const milestoneRowsByStudentId = this.groupBy(
      milestoneRows,
      (row) => row.studentId,
    );
    const recognitionRowsByStudentId = this.groupBy(
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
        const course = this.requireCourseById(coursesById, enrollment.courseId);
        const classCohort = this.requireClass(classesById, progress.classId);
        const guardian = this.requireGuardianByChildProfileId(
          guardianByChildProfileId,
          student.childProfileId,
        );
        const studentAchievements =
          achievementRowsByStudentId.get(student.id) ?? [];
        const studentBadges = badgeRowsByStudentId.get(student.id) ?? [];
        const studentCertificates =
          certificateRowsByStudentId.get(student.id) ?? [];
        const studentMilestones =
          milestoneRowsByStudentId.get(student.id) ?? [];
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
      this.buildStudentAchievementBadgeCertificateStatusCounts(fixture);
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

  buildParentTeacherWeeklyDigestReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningParentTeacherWeeklyDigestReport {
    const progressReport = this.buildClassSessionAttendanceProgressReport(
      fixture,
      generatedAt,
    );
    const assessmentReport = this.buildLessonAssignmentAssessmentProgressReport(
      fixture,
      generatedAt,
    );
    const learningPathReport =
      this.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        fixture,
        generatedAt,
      );
    const parentTeacherAlertReport =
      this.buildParentTeacherProgressAlertInterventionReport(
        fixture,
        generatedAt,
      );
    const aiTutorReport = this.buildAiTutorChatSafetyTeacherReviewReport(
      fixture,
      generatedAt,
    );
    const achievementReport =
      this.buildStudentAchievementBadgeCertificateReport(fixture, generatedAt);

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
    const progressRowsByEnrollmentId = new Map(
      progressReport.learnerRows.map((row) => [row.enrollmentId, row]),
    );
    const assessmentRowsByEnrollmentId = new Map(
      assessmentReport.learnerRows.map((row) => [row.enrollmentId, row]),
    );
    const learningPathRowsByEnrollmentId = new Map(
      learningPathReport.learningPathRows.map((row) => [row.enrollmentId, row]),
    );
    const achievementRowsByStudentId = new Map(
      achievementReport.studentRows.map((row) => [row.studentId, row]),
    );
    const alertRowsById = new Map(
      parentTeacherAlertReport.alertRows.map((row) => [row.alertId, row]),
    );
    const recognitionRowsById = new Map(
      achievementReport.recognitionRows.map((row) => [
        row.recognitionSummaryId,
        row,
      ]),
    );
    const teacherReviewRowsById = new Map(
      aiTutorReport.teacherReviewRows.map((row) => [
        row.teacherReviewItemId,
        row,
      ]),
    );
    const certificateRowsById = new Map(
      achievementReport.certificateRows.map((row) => [
        row.certificateFixtureId,
        row,
      ]),
    );
    const digestActionsByDigestId = this.groupBy(
      fixture.weeklyDigestActions,
      (action) => action.digestId,
    );
    const digestById = new Map(
      fixture.weeklyDigests.map((digest) => [digest.id, digest]),
    );

    const digestRows = fixture.weeklyDigests
      .map((digest) => {
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          digest.enrollmentId,
        );
        const student = this.requireStudentById(studentsById, digest.studentId);
        const course = this.requireCourseById(coursesById, digest.courseId);
        const classCohort = this.requireClass(classesById, digest.classId);
        const guardian = this.requireGuardian(
          guardiansById,
          digest.parentGuardianId,
        );
        const progressRow = progressRowsByEnrollmentId.get(enrollment.id);
        if (!progressRow) {
          throw new Error(
            `Missing local demo weekly digest progress for ${digest.id}`,
          );
        }
        const assessmentRow = assessmentRowsByEnrollmentId.get(enrollment.id);
        if (!assessmentRow) {
          throw new Error(
            `Missing local demo weekly digest assessment for ${digest.id}`,
          );
        }
        const learningPathRow = learningPathRowsByEnrollmentId.get(
          enrollment.id,
        );
        if (!learningPathRow) {
          throw new Error(
            `Missing local demo weekly digest learning path for ${digest.id}`,
          );
        }
        const achievementRow = achievementRowsByStudentId.get(student.id);
        if (!achievementRow) {
          throw new Error(
            `Missing local demo weekly digest achievement row for ${digest.id}`,
          );
        }
        const alertRows = digest.sourceAlertIds.map((alertId) => {
          const alertRow = alertRowsById.get(alertId);
          if (!alertRow) {
            throw new Error(
              `Missing local demo weekly digest alert ${alertId}`,
            );
          }
          return alertRow;
        });
        const recognitionRows = digest.sourceRecognitionSummaryIds.map(
          (recognitionSummaryId) => {
            const recognitionRow =
              recognitionRowsById.get(recognitionSummaryId);
            if (!recognitionRow) {
              throw new Error(
                `Missing local demo weekly digest recognition ${recognitionSummaryId}`,
              );
            }
            return recognitionRow;
          },
        );
        for (const teacherReviewItemId of digest.sourceAiTutorTeacherReviewItemIds) {
          if (!teacherReviewRowsById.has(teacherReviewItemId)) {
            throw new Error(
              `Missing local demo weekly digest AI tutor review ${teacherReviewItemId}`,
            );
          }
        }
        if (
          digest.sourceCertificateFixtureId &&
          !certificateRowsById.has(digest.sourceCertificateFixtureId)
        ) {
          throw new Error(
            `Missing local demo weekly digest certificate ${digest.sourceCertificateFixtureId}`,
          );
        }
        if (
          enrollment.studentId !== student.id ||
          enrollment.courseId !== course.id ||
          classCohort.courseId !== course.id ||
          !guardian.childProfileIds.includes(student.childProfileId)
        ) {
          throw new Error(
            `Mismatched local demo weekly digest fixture for ${digest.id}`,
          );
        }

        const digestActions = digestActionsByDigestId.get(digest.id) ?? [];

        return {
          digestId: digest.id,
          weekStart: digest.weekStart,
          weekEnd: digest.weekEnd,
          audience: digest.audience,
          deliveryStatus: digest.deliveryStatus,
          parentVisible: digest.parentVisible,
          studentId: student.id,
          childProfileId: student.childProfileId,
          studentName: student.displayName,
          parentGuardianName: guardian.displayName,
          parentEmail: student.parentEmail,
          courseCode: course.code,
          classCode: classCohort.code,
          teacherName: classCohort.teacherName,
          progressStatus: progressRow.progressStatus,
          completionPercent: progressRow.completionPercent,
          attendanceRatePercent: progressRow.attendanceRatePercent,
          assignmentCompletionPercent:
            assessmentRow.assignmentCompletionPercent,
          averagePracticeScorePercent:
            learningPathRow.averagePracticeScorePercent,
          alertCount: alertRows.length,
          highRiskAlertCount: alertRows.filter(
            (alert) => alert.alertSeverity === 'HIGH',
          ).length,
          followUpNeededAlertCount: alertRows.filter(
            (alert) => alert.followUpStatus !== 'RESOLVED',
          ).length,
          achievementRecordCount: achievementRow.achievementRecordCount,
          badgeAwardCount: achievementRow.badgeAwardCount,
          certificateStatus: achievementRow.certificateStatus,
          recognitionSummaryCount: recognitionRows.length,
          parentVisibleRecognitionCount: recognitionRows.filter(
            (recognition) => recognition.parentVisible,
          ).length,
          actionCount: digestActions.length,
          highPriorityActionCount: digestActions.filter(
            (action) => action.priority === 'HIGH',
          ).length,
          sourceAlertIds: [...digest.sourceAlertIds],
          sourceRecognitionSummaryIds: [...digest.sourceRecognitionSummaryIds],
          sourceAiTutorTeacherReviewItemIds: [
            ...digest.sourceAiTutorTeacherReviewItemIds,
          ],
          sourceCertificateFixtureId: digest.sourceCertificateFixtureId ?? null,
          highlight: digest.highlight,
          riskSummary: digest.riskSummary,
          parentSummary: digest.parentSummary,
          teacherNote: digest.teacherNote,
        } satisfies DemoLearningParentTeacherWeeklyDigestRow;
      })
      .sort((left, right) =>
        [left.weekStart, left.studentName, left.audience, left.digestId]
          .join('|')
          .localeCompare(
            [
              right.weekStart,
              right.studentName,
              right.audience,
              right.digestId,
            ].join('|'),
          ),
      );

    const actionRows = fixture.weeklyDigestActions
      .map((action) => {
        const digest = this.requireWeeklyDigest(digestById, action.digestId);
        const student = this.requireStudentById(studentsById, action.studentId);
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          digest.enrollmentId,
        );
        const course = this.requireCourseById(coursesById, digest.courseId);
        const classCohort = this.requireClass(classesById, digest.classId);
        const guardian = this.requireGuardian(
          guardiansById,
          digest.parentGuardianId,
        );
        if (action.sourceAlertId && !alertRowsById.has(action.sourceAlertId)) {
          throw new Error(
            `Missing local demo weekly digest action alert ${action.sourceAlertId}`,
          );
        }
        if (
          action.sourceRecognitionSummaryId &&
          !recognitionRowsById.has(action.sourceRecognitionSummaryId)
        ) {
          throw new Error(
            `Missing local demo weekly digest action recognition ${action.sourceRecognitionSummaryId}`,
          );
        }
        if (
          enrollment.studentId !== student.id ||
          digest.studentId !== student.id ||
          !guardian.childProfileIds.includes(student.childProfileId)
        ) {
          throw new Error(
            `Mismatched local demo weekly digest action fixture for ${action.id}`,
          );
        }

        return {
          actionId: action.id,
          digestId: digest.id,
          studentId: student.id,
          childProfileId: student.childProfileId,
          studentName: student.displayName,
          parentGuardianName: guardian.displayName,
          courseCode: course.code,
          classCode: classCohort.code,
          owner: action.owner,
          priority: action.priority,
          status: action.status,
          dueAt: action.dueAt,
          sourceAlertId: action.sourceAlertId ?? null,
          sourceRecognitionSummaryId: action.sourceRecognitionSummaryId ?? null,
          actionSummary: action.actionSummary,
        } satisfies DemoLearningParentTeacherWeeklyDigestActionRow;
      })
      .sort((left, right) =>
        [left.dueAt, left.studentName, left.actionId]
          .join('|')
          .localeCompare(
            [right.dueAt, right.studentName, right.actionId].join('|'),
          ),
      );

    const digestRowsByStudentId = this.groupBy(
      digestRows,
      (row) => row.studentId,
    );
    const actionRowsByStudentId = this.groupBy(
      actionRows,
      (row) => row.studentId,
    );
    const studentRows = [...digestRowsByStudentId.entries()]
      .map(([studentId, studentDigestRows]) => {
        const first = studentDigestRows[0];
        const studentActions = actionRowsByStudentId.get(studentId) ?? [];
        const nextActionDueAt =
          studentActions
            .filter((action) => action.status !== 'COMPLETED')
            .map((action) => action.dueAt)
            .sort((left, right) => left.localeCompare(right))[0] ?? null;

        return {
          studentId,
          childProfileId: first.childProfileId,
          studentName: first.studentName,
          parentGuardianName: first.parentGuardianName,
          courseCode: first.courseCode,
          classCode: first.classCode,
          parentDigestCount: studentDigestRows.filter(
            (row) => row.audience === 'PARENT',
          ).length,
          teacherDigestCount: studentDigestRows.filter(
            (row) => row.audience === 'TEACHER',
          ).length,
          readyToSendDigestCount: studentDigestRows.filter(
            (row) => row.deliveryStatus === 'READY_TO_SEND',
          ).length,
          teacherReviewDigestCount: studentDigestRows.filter(
            (row) => row.deliveryStatus === 'TEACHER_REVIEW',
          ).length,
          heldWithdrawnDigestCount: studentDigestRows.filter(
            (row) => row.deliveryStatus === 'HELD_WITHDRAWN',
          ).length,
          actionCount: studentActions.length,
          highPriorityActionCount: studentActions.filter(
            (action) => action.priority === 'HIGH',
          ).length,
          completedActionCount: studentActions.filter(
            (action) => action.status === 'COMPLETED',
          ).length,
          nextActionDueAt,
          weeklySummary: this.buildWeeklyDigestStudentSummary(
            first.studentName,
            studentDigestRows,
            studentActions,
          ),
        } satisfies DemoLearningParentTeacherWeeklyDigestStudentRow;
      })
      .sort((left, right) =>
        [left.studentName, left.studentId]
          .join('|')
          .localeCompare([right.studentName, right.studentId].join('|')),
      );

    const statusCounts =
      this.buildParentTeacherWeeklyDigestStatusCounts(fixture);
    const studentsNeedingTeacherReview = new Set(
      digestRows
        .filter((row) => row.deliveryStatus !== 'READY_TO_SEND')
        .map((row) => row.studentId),
    ).size;
    const studentsReadyForParentSend = new Set(
      digestRows
        .filter(
          (row) =>
            row.audience === 'PARENT' &&
            row.parentVisible &&
            row.deliveryStatus === 'READY_TO_SEND',
        )
        .map((row) => row.studentId),
    ).size;

    return {
      reportName: 'Learning local demo Parent/Teacher Weekly Digest Report',
      generatedFor: 'local-demo-parent-teacher-weekly-digest-report',
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
        realWeeklyDigestNotificationMutationUsed: false,
        realPaymentMutationUsed: false,
        realRefundMutationUsed: false,
        realCommissionMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      },
      totals: {
        digestCount: fixture.weeklyDigests.length,
        parentDigestCount: statusCounts.audience.PARENT,
        teacherDigestCount: statusCounts.audience.TEACHER,
        readyToSendDigestCount: statusCounts.deliveryStatus.READY_TO_SEND,
        teacherReviewDigestCount: statusCounts.deliveryStatus.TEACHER_REVIEW,
        heldWithdrawnDigestCount: statusCounts.deliveryStatus.HELD_WITHDRAWN,
        parentVisibleDigestCount: digestRows.filter((row) => row.parentVisible)
          .length,
        teacherOnlyDigestCount: digestRows.filter((row) => !row.parentVisible)
          .length,
        actionCount: fixture.weeklyDigestActions.length,
        highPriorityActionCount: statusCounts.actionPriority.HIGH,
        scheduledActionCount: statusCounts.actionStatus.SCHEDULED,
        completedActionCount: statusCounts.actionStatus.COMPLETED,
        studentsCovered: studentRows.length,
        studentsNeedingTeacherReview,
        studentsReadyForParentSend,
      },
      statusCounts,
      studentRows,
      digestRows,
      actionRows,
    };
  }

  buildFollowUpActionOutcomeReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningFollowUpActionOutcomeReport {
    const weeklyDigestReport = this.buildParentTeacherWeeklyDigestReport(
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
        const action = weeklyDigestActionsById.get(
          outcome.weeklyDigestActionId,
        );
        if (!action) {
          throw new Error(
            `Missing local demo follow-up action for ${outcome.id}`,
          );
        }
        const digest = this.requireWeeklyDigest(
          weeklyDigestsById,
          outcome.digestId,
        );
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
        const student = this.requireStudentById(
          studentsById,
          outcome.studentId,
        );
        const enrollment = this.requireEnrollment(
          enrollmentsById,
          digest.enrollmentId,
        );
        const course = this.requireCourseById(coursesById, digest.courseId);
        const classCohort = this.requireClass(classesById, digest.classId);
        const guardian = this.requireGuardian(
          guardiansById,
          digest.parentGuardianId,
        );
        const dailyPlan = outcome.sourceDailyPlanId
          ? this.requireDailyPlan(dailyPlansById, outcome.sourceDailyPlanId)
          : null;
        const supportRecommendation =
          outcome.sourceAiTutorSupportRecommendationId
            ? this.requireAiTutorSupportRecommendation(
                supportRecommendationsById,
                outcome.sourceAiTutorSupportRecommendationId,
              )
            : null;
        const achievementRecord = outcome.sourceAchievementRecordId
          ? this.requireAchievementRecord(
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
              right.outcomeAt ??
                right.nextReviewAt ??
                '9999-12-31T00:00:00.000Z',
              right.studentName,
              right.outcomeId,
            ].join('|'),
          ),
      );

    const outcomeRowsByStudentId = this.groupBy(
      outcomeRows,
      (row) => row.studentId,
    );
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
          outcomeSummary: this.buildFollowUpActionOutcomeStudentSummary(
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

    const statusCounts =
      this.buildFollowUpActionOutcomeStatusCounts(outcomeRows);
    const studentsWithCompletedOrVerifiedOutcome = new Set(
      outcomeRows
        .filter((row) => ['COMPLETED', 'VERIFIED'].includes(row.outcomeStatus))
        .map((row) => row.studentId),
    ).size;
    const studentsWithOpenOutcome = new Set(
      outcomeRows
        .filter(
          (row) =>
            row.outcomeStatus !== 'COMPLETED' &&
            row.outcomeStatus !== 'VERIFIED',
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
        parentVisibleOutcomeCount: outcomeRows.filter(
          (row) => row.parentVisible,
        ).length,
        teacherOnlyOutcomeCount: outcomeRows.filter((row) => !row.parentVisible)
          .length,
        positiveOutcomeCount: statusCounts.impactBand.POSITIVE,
        needsSupportOutcomeCount: statusCounts.impactBand.NEEDS_SUPPORT,
        noSendOutcomeCount: statusCounts.impactBand.NO_SEND,
        linkedDailyPlanCount: outcomeRows.filter((row) => row.dailyPlanId)
          .length,
        linkedSupportRecommendationCount: outcomeRows.filter(
          (row) => row.supportRecommendationId,
        ).length,
        linkedAchievementCount: outcomeRows.filter(
          (row) => row.achievementRecordId,
        ).length,
        linkedParentSummaryCount: outcomeRows.filter(
          (row) => row.parentSummaryId,
        ).length,
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

  buildMvpReadinessOverviewReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningMvpReadinessOverviewReport {
    const enrollmentReport =
      this.buildStudentCourseEnrollmentSubscriptionReport(fixture, generatedAt);
    const progressReport = this.buildClassSessionAttendanceProgressReport(
      fixture,
      generatedAt,
    );
    const lessonAssignmentReport =
      this.buildLessonAssignmentAssessmentProgressReport(fixture, generatedAt);
    const learningPathReport =
      this.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        fixture,
        generatedAt,
      );
    const parentTeacherReportReviewQueueMessagePreviewReport =
      this.buildParentTeacherReportReviewQueueMessagePreviewReport(
        fixture,
        generatedAt,
      );
    const parentPortalApprovedReportInboxReadReceiptReport =
      this.buildParentPortalApprovedReportInboxReadReceiptReport(
        fixture,
        generatedAt,
      );
    const parentScreenTimeGrantDailyPlanGuardReport =
      this.buildParentScreenTimeGrantDailyPlanGuardReport(fixture, generatedAt);
    const learningSessionCompletionPracticeProgressRollupReport =
      this.buildLearningSessionCompletionPracticeProgressRollupReport(
        fixture,
        generatedAt,
      );
    const teacherInterventionRemedialAssignmentSupportPlanReport =
      this.buildTeacherInterventionRemedialAssignmentSupportPlanReport(
        fixture,
        generatedAt,
      );
    const remedialRetryCompletionSupportOutcomeFollowupReport =
      this.buildRemedialRetryCompletionSupportOutcomeFollowupReport(
        fixture,
        generatedAt,
      );
    const remedialRetryUnresolvedSupportEscalationReport =
      this.buildRemedialRetryUnresolvedSupportEscalationReport(
        fixture,
        generatedAt,
      );
    const teacherEscalationFollowupResolutionReport =
      this.buildTeacherEscalationFollowupResolutionReport(fixture, generatedAt);
    const mvpEndToEndReadinessTraceReport =
      this.buildMvpEndToEndReadinessTraceReport(fixture, generatedAt);
    const mvpRoleJourneyEntrypointsReport =
      this.buildMvpRoleJourneyEntrypointsReport(fixture, generatedAt);
    const aiTutorChatSafetyTeacherReviewReport =
      this.buildAiTutorChatSafetyTeacherReviewReport(fixture, generatedAt);
    const studentAchievementBadgeCertificateReport =
      this.buildStudentAchievementBadgeCertificateReport(fixture, generatedAt);
    const parentTeacherWeeklyDigestReport =
      this.buildParentTeacherWeeklyDigestReport(fixture, generatedAt);
    const followUpActionOutcomeReport = this.buildFollowUpActionOutcomeReport(
      fixture,
      generatedAt,
    );
    const safety = {
      ...followUpActionOutcomeReport.safety,
      realLearningSessionCompletionMutationUsed:
        learningSessionCompletionPracticeProgressRollupReport.safety
          .realLearningSessionCompletionMutationUsed,
      realParentProgressSummaryMutationUsed:
        learningSessionCompletionPracticeProgressRollupReport.safety
          .realParentProgressSummaryMutationUsed,
      realTeacherProgressSummaryMutationUsed:
        learningSessionCompletionPracticeProgressRollupReport.safety
          .realTeacherProgressSummaryMutationUsed,
      realTeacherInterventionReviewMutationUsed:
        teacherInterventionRemedialAssignmentSupportPlanReport.safety
          .realTeacherInterventionReviewMutationUsed,
      realRemedialAssignmentMutationUsed:
        teacherInterventionRemedialAssignmentSupportPlanReport.safety
          .realRemedialAssignmentMutationUsed,
      realSupportPlanMutationUsed:
        teacherInterventionRemedialAssignmentSupportPlanReport.safety
          .realSupportPlanMutationUsed,
      realParentSupportSummaryMutationUsed:
        teacherInterventionRemedialAssignmentSupportPlanReport.safety
          .realParentSupportSummaryMutationUsed,
      realTeacherNextActionMutationUsed:
        teacherInterventionRemedialAssignmentSupportPlanReport.safety
          .realTeacherNextActionMutationUsed,
      realRemedialRetryCompletionMutationUsed:
        remedialRetryCompletionSupportOutcomeFollowupReport.safety
          .realRemedialRetryCompletionMutationUsed,
      realSupportOutcomeEvidenceMutationUsed:
        remedialRetryCompletionSupportOutcomeFollowupReport.safety
          .realSupportOutcomeEvidenceMutationUsed,
      realParentFollowupSummaryMutationUsed:
        remedialRetryCompletionSupportOutcomeFollowupReport.safety
          .realParentFollowupSummaryMutationUsed,
      realTeacherFollowupSummaryMutationUsed:
        remedialRetryCompletionSupportOutcomeFollowupReport.safety
          .realTeacherFollowupSummaryMutationUsed,
      realRemedialRetryUnresolvedAttemptMutationUsed:
        remedialRetryUnresolvedSupportEscalationReport.safety
          .realRemedialRetryUnresolvedAttemptMutationUsed,
      realUnresolvedSupportOutcomeMutationUsed:
        remedialRetryUnresolvedSupportEscalationReport.safety
          .realUnresolvedSupportOutcomeMutationUsed,
      realTeacherEscalationMutationUsed:
        remedialRetryUnresolvedSupportEscalationReport.safety
          .realTeacherEscalationMutationUsed,
      realSupportAdjustmentMutationUsed:
        remedialRetryUnresolvedSupportEscalationReport.safety
          .realSupportAdjustmentMutationUsed,
      realParentEscalationSummaryMutationUsed:
        remedialRetryUnresolvedSupportEscalationReport.safety
          .realParentEscalationSummaryMutationUsed,
      realTeacherEscalationNextActionMutationUsed:
        remedialRetryUnresolvedSupportEscalationReport.safety
          .realTeacherEscalationNextActionMutationUsed,
      realTeacherReviewedEscalationMutationUsed:
        teacherEscalationFollowupResolutionReport.safety
          .realTeacherReviewedEscalationMutationUsed,
      realAdjustedSupportRetryCompletionMutationUsed:
        teacherEscalationFollowupResolutionReport.safety
          .realAdjustedSupportRetryCompletionMutationUsed,
      realResolvedSupportOutcomeMutationUsed:
        teacherEscalationFollowupResolutionReport.safety
          .realResolvedSupportOutcomeMutationUsed,
      realParentClosureSummaryMutationUsed:
        teacherEscalationFollowupResolutionReport.safety
          .realParentClosureSummaryMutationUsed,
      realTeacherClosureNoteMutationUsed:
        teacherEscalationFollowupResolutionReport.safety
          .realTeacherClosureNoteMutationUsed,
    };
    const rows: DemoLearningMvpReadinessOverviewRow[] = [
      {
        sliceKey: 'ENROLLMENT',
        sliceName: 'Student enrollment',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/student-course-enrollment-subscription-report',
        jsonExportPath:
          'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
        markdownExportPath:
          'exports/learning-local-demo-student-course-enrollment-subscription-report.md',
        primaryMetricLabel: 'Enrollments',
        primaryMetricValue: enrollmentReport.totals.enrollmentCount,
        secondaryMetricLabel: 'Active enrollments',
        secondaryMetricValue: enrollmentReport.totals.activeEnrollmentCount,
        coverageLabel: 'Students covered',
        coverageValue: enrollmentReport.totals.studentCount,
        riskNote:
          'Local-demo fixture only; production enrollment lifecycle remains out of scope.',
        evidenceSummary: `${enrollmentReport.totals.studentCount} students, ${enrollmentReport.totals.courseCount} courses, ${enrollmentReport.totals.enrollmentCount} enrollment rows.`,
      },
      {
        sliceKey: 'SUBSCRIPTION_FIXTURE',
        sliceName: 'Subscription fixture',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/student-course-enrollment-subscription-report',
        jsonExportPath:
          'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
        markdownExportPath:
          'exports/learning-local-demo-student-course-enrollment-subscription-report.md',
        primaryMetricLabel: 'Subscriptions',
        primaryMetricValue: enrollmentReport.totals.subscriptionCount,
        secondaryMetricLabel: 'Active or trialing',
        secondaryMetricValue:
          enrollmentReport.totals.activeSubscriptionCount +
          enrollmentReport.totals.trialingSubscriptionCount,
        coverageLabel: 'Enrollment rows',
        coverageValue: enrollmentReport.totals.enrollmentCount,
        riskNote:
          'Provider-backed subscription creation and renewal are intentionally not executed.',
        evidenceSummary: `${enrollmentReport.totals.subscriptionCount} synthetic subscriptions with ${enrollmentReport.totals.pendingPaymentCount} pending payment fixture.`,
      },
      {
        sliceKey: 'REFUNDS_COMMISSION_FIXTURE',
        sliceName: 'Refunds and commission fixture',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/student-course-enrollment-subscription-report',
        jsonExportPath:
          'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
        markdownExportPath:
          'exports/learning-local-demo-student-course-enrollment-subscription-report.md',
        primaryMetricLabel: 'Commission rows',
        primaryMetricValue: enrollmentReport.totals.commissionCount,
        secondaryMetricLabel: 'Refund rows',
        secondaryMetricValue: enrollmentReport.totals.refundCount,
        coverageLabel: 'Net revenue cents',
        coverageValue: enrollmentReport.totals.netRevenueCents,
        riskNote:
          'Refund and commission states are fixture evidence only; no payment provider mutation is used.',
        evidenceSummary: `${enrollmentReport.totals.refundCount} refund and ${enrollmentReport.totals.commissionCount} commission fixtures reconcile to ${enrollmentReport.totals.netRevenueCents} net revenue cents.`,
      },
      {
        sliceKey: 'DAILY_PLAN',
        sliceName: 'Daily plan and practice evidence',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/learning-path-daily-plan-video-practice-evidence-report',
        jsonExportPath:
          'exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.json',
        markdownExportPath:
          'exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.md',
        primaryMetricLabel: 'Daily plans',
        primaryMetricValue: learningPathReport.totals.dailyPlanCount,
        secondaryMetricLabel: 'Completed plans',
        secondaryMetricValue: learningPathReport.totals.completedDailyPlanCount,
        coverageLabel: 'Learning paths',
        coverageValue: learningPathReport.totals.learningPathCount,
        riskNote:
          'Video and practice completion are deterministic evidence rows only.',
        evidenceSummary: `${learningPathReport.totals.completedDailyPlanCount}/${learningPathReport.totals.dailyPlanCount} daily plans complete with ${learningPathReport.totals.passedPracticeCount} passed practice attempts.`,
      },
      {
        sliceKey: 'LESSON_ASSIGNMENT',
        sliceName: 'Lesson and assignment evidence',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/lesson-assignment-assessment-progress-report',
        jsonExportPath:
          'exports/learning-local-demo-lesson-assignment-assessment-progress-report.json',
        markdownExportPath:
          'exports/learning-local-demo-lesson-assignment-assessment-progress-report.md',
        primaryMetricLabel: 'Assignments',
        primaryMetricValue: lessonAssignmentReport.totals.assignmentCount,
        secondaryMetricLabel: 'Lessons',
        secondaryMetricValue: lessonAssignmentReport.totals.lessonCount,
        coverageLabel: 'Expected submissions',
        coverageValue: lessonAssignmentReport.totals.expectedSubmissionCount,
        riskNote:
          'Assessment scoring and feedback remain local fixture evidence only.',
        evidenceSummary: `${lessonAssignmentReport.totals.assignmentCount} assignment or quiz items produce ${lessonAssignmentReport.totals.submissionRecordCount} submission fixture rows.`,
      },
      {
        sliceKey: 'PROGRESS',
        sliceName: 'Attendance and progress',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/class-session-attendance-progress-report',
        jsonExportPath:
          'exports/learning-local-demo-class-session-attendance-progress-report.json',
        markdownExportPath:
          'exports/learning-local-demo-class-session-attendance-progress-report.md',
        primaryMetricLabel: 'Progress records',
        primaryMetricValue: progressReport.totals.progressRecordCount,
        secondaryMetricLabel: 'Needs support',
        secondaryMetricValue: progressReport.totals.needsSupportCount,
        coverageLabel: 'Attendance rows',
        coverageValue: progressReport.totals.attendanceRecordCount,
        riskNote:
          'Attendance and progress rows are read-only snapshots, not learner mutations.',
        evidenceSummary: `${progressReport.totals.progressRecordCount} progress rows, ${progressReport.totals.attendanceRecordCount} attendance records, and ${progressReport.totals.attendanceRatePercent}% attendance.`,
      },
      {
        sliceKey: 'REPORT_REVIEW_PREVIEW',
        sliceName: 'Report review queue and message preview',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report',
        jsonExportPath:
          'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.json',
        markdownExportPath:
          'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.md',
        primaryMetricLabel: 'Review items',
        primaryMetricValue:
          parentTeacherReportReviewQueueMessagePreviewReport.totals
            .reviewQueueItemCount,
        secondaryMetricLabel: 'Approved previews',
        secondaryMetricValue:
          parentTeacherReportReviewQueueMessagePreviewReport.totals
            .approvedPreviewCount,
        coverageLabel: 'Held previews',
        coverageValue:
          parentTeacherReportReviewQueueMessagePreviewReport.totals
            .heldPreviewCount,
        riskNote:
          'Review decisions and parent-facing previews are read-only fixture evidence; no notification or parent-message delivery is executed.',
        evidenceSummary: `${parentTeacherReportReviewQueueMessagePreviewReport.totals.reviewQueueItemCount} review queue items produce ${parentTeacherReportReviewQueueMessagePreviewReport.totals.approvedPreviewCount} approved and ${parentTeacherReportReviewQueueMessagePreviewReport.totals.heldPreviewCount} held parent-facing previews.`,
      },
      {
        sliceKey: 'PARENT_PORTAL_INBOX_READ_RECEIPT',
        sliceName: 'Parent portal inbox and read receipt',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report',
        jsonExportPath:
          'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
        markdownExportPath:
          'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.md',
        primaryMetricLabel: 'Parent inbox items',
        primaryMetricValue:
          parentPortalApprovedReportInboxReadReceiptReport.totals
            .parentInboxItemCount,
        secondaryMetricLabel: 'Read/ack evidence',
        secondaryMetricValue:
          parentPortalApprovedReportInboxReadReceiptReport.totals
            .readAckEvidenceCount,
        coverageLabel: 'Hidden held previews',
        coverageValue:
          parentPortalApprovedReportInboxReadReceiptReport.totals
            .hiddenHeldPreviewCount,
        riskNote:
          'Parent inbox and read/ack rows are fixture evidence only; no production portal state, notification delivery, or parent-message mutation is used.',
        evidenceSummary: `${parentPortalApprovedReportInboxReadReceiptReport.totals.visibleParentInboxItemCount} approved preview is visible in the parent inbox, ${parentPortalApprovedReportInboxReadReceiptReport.totals.hiddenHeldPreviewCount} held preview remains hidden, and ${parentPortalApprovedReportInboxReadReceiptReport.totals.readAckEvidenceCount} read/ack row is traced.`,
      },
      {
        sliceKey: 'PARENT_SCREEN_TIME_DAILY_PLAN_GUARD',
        sliceName: 'Parent screen-time daily plan guard',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report',
        jsonExportPath:
          'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.json',
        markdownExportPath:
          'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.md',
        primaryMetricLabel: 'Daily plan guard cases',
        primaryMetricValue:
          parentScreenTimeGrantDailyPlanGuardReport.totals
            .dailyPlanAccessCaseCount,
        secondaryMetricLabel: 'Blocked sessions',
        secondaryMetricValue:
          parentScreenTimeGrantDailyPlanGuardReport.totals.blockedSessionCount,
        coverageLabel: 'Session guard traces',
        coverageValue:
          parentScreenTimeGrantDailyPlanGuardReport.totals
            .sessionGuardTraceCount,
        riskNote:
          'Parent grants, screen-time rules, and session guard evidence are fixture-only; no daily plan access or parent-control mutation is executed.',
        evidenceSummary: `${parentScreenTimeGrantDailyPlanGuardReport.totals.allowedSessionCount} allowed and ${parentScreenTimeGrantDailyPlanGuardReport.totals.blockedSessionCount} blocked learning session evidence rows trace parent -> child -> course/daily plan -> rule -> result.`,
      },
      {
        sliceKey: 'SESSION_COMPLETION_PRACTICE_ROLLUP',
        sliceName: 'Learning session completion practice rollup',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report',
        jsonExportPath:
          'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.json',
        markdownExportPath:
          'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.md',
        primaryMetricLabel: 'Progress rollups',
        primaryMetricValue:
          learningSessionCompletionPracticeProgressRollupReport.totals
            .progressRollupCount,
        secondaryMetricLabel: 'Parent summaries',
        secondaryMetricValue:
          learningSessionCompletionPracticeProgressRollupReport.totals
            .parentVisibleProgressSummaryCount,
        coverageLabel: 'Stable traces',
        coverageValue:
          learningSessionCompletionPracticeProgressRollupReport.totals
            .stableTraceCount,
        riskNote:
          'Completion, practice, parent summary, and teacher summary rows are read-only fixture evidence only.',
        evidenceSummary: `${learningSessionCompletionPracticeProgressRollupReport.totals.progressRollupCount} allowed daily plan sessions roll up lesson/video completion, practice score, and progress evidence into ${learningSessionCompletionPracticeProgressRollupReport.totals.parentVisibleProgressSummaryCount} parent and ${learningSessionCompletionPracticeProgressRollupReport.totals.teacherVisibleProgressSummaryCount} teacher summaries.`,
      },
      {
        sliceKey: 'TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN',
        sliceName: 'Teacher intervention remedial support plan',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report',
        jsonExportPath:
          'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json',
        markdownExportPath:
          'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.md',
        primaryMetricLabel: 'Teacher reviews',
        primaryMetricValue:
          teacherInterventionRemedialAssignmentSupportPlanReport.totals
            .teacherInterventionReviewCount,
        secondaryMetricLabel: 'Support plans',
        secondaryMetricValue:
          teacherInterventionRemedialAssignmentSupportPlanReport.totals
            .supportPlanCount,
        coverageLabel: 'Stable traces',
        coverageValue:
          teacherInterventionRemedialAssignmentSupportPlanReport.totals
            .stableTraceCount,
        riskNote:
          'Teacher interventions, remedial assignments, support plans, parent summaries, and teacher next actions are read-only fixture evidence only.',
        evidenceSummary: `${teacherInterventionRemedialAssignmentSupportPlanReport.totals.needsSupportProgressRollupCount} needs-support progress rollup creates ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.teacherInterventionReviewCount} teacher review, ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.remedialAssignmentCount} remedial assignment, ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.supportPlanCount} support plan, ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.parentVisibleSupportSummaryCount} parent summary, and ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.teacherVisibleNextActionCount} teacher next action.`,
      },
      {
        sliceKey: 'REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP',
        sliceName: 'Remedial retry completion support outcome follow-up',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report',
        jsonExportPath:
          'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.json',
        markdownExportPath:
          'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.md',
        primaryMetricLabel: 'Retry completions',
        primaryMetricValue:
          remedialRetryCompletionSupportOutcomeFollowupReport.totals
            .remedialRetryCompletionCount,
        secondaryMetricLabel: 'Support outcomes',
        secondaryMetricValue:
          remedialRetryCompletionSupportOutcomeFollowupReport.totals
            .supportOutcomeEvidenceCount,
        coverageLabel: 'Stable traces',
        coverageValue:
          remedialRetryCompletionSupportOutcomeFollowupReport.totals
            .stableTraceCount,
        riskNote:
          'Retry completions, support outcomes, and parent/teacher follow-up summaries are read-only fixture evidence only.',
        evidenceSummary: `${remedialRetryCompletionSupportOutcomeFollowupReport.totals.remedialRetryCompletionCount} remedial retry completion links ${remedialRetryCompletionSupportOutcomeFollowupReport.totals.supportPlanReferenceCount} support plan, ${remedialRetryCompletionSupportOutcomeFollowupReport.totals.supportOutcomeEvidenceCount} support outcome, ${remedialRetryCompletionSupportOutcomeFollowupReport.totals.parentVisibleFollowupSummaryCount} parent follow-up summary, and ${remedialRetryCompletionSupportOutcomeFollowupReport.totals.teacherVisibleFollowupSummaryCount} teacher follow-up summary.`,
      },
      {
        sliceKey: 'REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION',
        sliceName: 'Remedial retry unresolved support escalation',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report',
        jsonExportPath:
          'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.json',
        markdownExportPath:
          'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.md',
        primaryMetricLabel: 'Unresolved retry attempts',
        primaryMetricValue:
          remedialRetryUnresolvedSupportEscalationReport.totals
            .remedialRetryAttemptCount,
        secondaryMetricLabel: 'Teacher escalations',
        secondaryMetricValue:
          remedialRetryUnresolvedSupportEscalationReport.totals
            .teacherEscalationCount,
        coverageLabel: 'Stable traces',
        coverageValue:
          remedialRetryUnresolvedSupportEscalationReport.totals
            .stableTraceCount,
        riskNote:
          'Unresolved retry attempts, support outcomes, teacher escalations, support adjustments, parent summaries, and teacher next actions are read-only fixture evidence only.',
        evidenceSummary: `${remedialRetryUnresolvedSupportEscalationReport.totals.remedialRetryAttemptCount} incomplete or failed remedial retry links ${remedialRetryUnresolvedSupportEscalationReport.totals.supportPlanReferenceCount} support plan, ${remedialRetryUnresolvedSupportEscalationReport.totals.unresolvedSupportOutcomeCount} unresolved outcome, ${remedialRetryUnresolvedSupportEscalationReport.totals.teacherEscalationCount} teacher escalation, ${remedialRetryUnresolvedSupportEscalationReport.totals.parentVisibleEscalationSummaryCount} parent escalation summary, and ${remedialRetryUnresolvedSupportEscalationReport.totals.teacherVisibleEscalationNextActionCount} teacher next action.`,
      },
      {
        sliceKey: 'TEACHER_ESCALATION_FOLLOWUP_RESOLUTION',
        sliceName: 'Teacher escalation follow-up resolution',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/teacher-escalation-followup-resolution-report',
        jsonExportPath:
          'exports/learning-local-demo-teacher-escalation-followup-resolution-report.json',
        markdownExportPath:
          'exports/learning-local-demo-teacher-escalation-followup-resolution-report.md',
        primaryMetricLabel: 'Resolved follow-ups',
        primaryMetricValue:
          teacherEscalationFollowupResolutionReport.totals
            .resolvedSupportOutcomeCount,
        secondaryMetricLabel: 'Adjusted retry completions',
        secondaryMetricValue:
          teacherEscalationFollowupResolutionReport.totals
            .adjustedSupportRetryCompletionCount,
        coverageLabel: 'Stable traces',
        coverageValue:
          teacherEscalationFollowupResolutionReport.totals.stableTraceCount,
        riskNote:
          'Teacher-reviewed escalation resolution, adjusted retry completion, parent closure summaries, and teacher closure notes are read-only fixture evidence only.',
        evidenceSummary: `${teacherEscalationFollowupResolutionReport.totals.unresolvedEscalationReferenceCount} unresolved escalation reference links ${teacherEscalationFollowupResolutionReport.totals.teacherReviewedEscalationCount} teacher review, ${teacherEscalationFollowupResolutionReport.totals.adjustedSupportRetryCompletionCount} adjusted retry completion, ${teacherEscalationFollowupResolutionReport.totals.resolvedSupportOutcomeCount} resolved outcome, ${teacherEscalationFollowupResolutionReport.totals.parentVisibleClosureSummaryCount} parent closure summary, and ${teacherEscalationFollowupResolutionReport.totals.teacherVisibleClosureNoteCount} teacher closure note.`,
      },
      {
        sliceKey: 'MVP_END_TO_END_READINESS_TRACE',
        sliceName: 'MVP end-to-end readiness trace',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/mvp-end-to-end-readiness-trace-report',
        jsonExportPath:
          'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json',
        markdownExportPath:
          'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.md',
        primaryMetricLabel: 'Stable traces',
        primaryMetricValue:
          mvpEndToEndReadinessTraceReport.totals.stableEndToEndTraceCount,
        secondaryMetricLabel: 'Resolution evidence',
        secondaryMetricValue:
          mvpEndToEndReadinessTraceReport.totals
            .escalationResolutionEvidenceCount,
        coverageLabel: 'Safety gates closed',
        coverageValue:
          mvpEndToEndReadinessTraceReport.totals.closedSafetyGateCount,
        riskNote:
          'End-to-end readiness is a local-demo evidence trace only; no production orchestration, provider call, notification send, scheduler, or live learner mutation is used.',
        evidenceSummary: `${mvpEndToEndReadinessTraceReport.totals.stableEndToEndTraceCount} stable end-to-end trace links enrollment/subscription, entitlement, practice progress, reporting/privacy, inbox read/ack evidence, screen-time guard, teacher intervention, remedial escalation, and teacher escalation resolution.`,
      },
      {
        sliceKey: 'MVP_ROLE_JOURNEY_ENTRYPOINTS',
        sliceName: 'MVP role journey entrypoints',
        readinessStatus: 'LOCAL_DEMO_READY_WITH_NOTES',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/mvp-role-journey-entrypoints-report',
        jsonExportPath:
          'exports/learning-local-demo-mvp-role-journey-entrypoints-report.json',
        markdownExportPath:
          'exports/learning-local-demo-mvp-role-journey-entrypoints-report.md',
        primaryMetricLabel: 'Role entrypoints',
        primaryMetricValue:
          mvpRoleJourneyEntrypointsReport.totals.roleEntrypointCount,
        secondaryMetricLabel: 'Stable role traces',
        secondaryMetricValue:
          mvpRoleJourneyEntrypointsReport.totals.stableRoleJourneyTraceCount,
        coverageLabel: 'Same-path rows',
        coverageValue:
          mvpRoleJourneyEntrypointsReport.totals.sameStudentCoursePathCount,
        riskNote:
          'Role entrypoints are local-demo navigation evidence only; no production route state, authorization mutation, provider call, notification send, scheduler, or live learner mutation is used.',
        evidenceSummary: `${mvpRoleJourneyEntrypointsReport.totals.roleEntrypointCount} role entrypoints link student, parent, teacher, and admin/operator journeys to ${mvpRoleJourneyEntrypointsReport.totals.stableRoleJourneyTraceCount} stable Minh/course A1 trace with ${mvpRoleJourneyEntrypointsReport.totals.openSafetyGateCount} open safety gates.`,
      },
      {
        sliceKey: 'AI_TUTOR_EVIDENCE',
        sliceName: 'AI tutor safety evidence',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/ai-tutor-chat-safety-teacher-review-report',
        jsonExportPath:
          'exports/learning-local-demo-ai-tutor-chat-safety-teacher-review-report.json',
        markdownExportPath:
          'exports/learning-local-demo-ai-tutor-chat-safety-teacher-review-report.md',
        primaryMetricLabel: 'Chat sessions',
        primaryMetricValue:
          aiTutorChatSafetyTeacherReviewReport.totals.chatSessionCount,
        secondaryMetricLabel: 'Safety flags',
        secondaryMetricValue:
          aiTutorChatSafetyTeacherReviewReport.totals.safetyFlagCount,
        coverageLabel: 'Teacher reviews',
        coverageValue:
          aiTutorChatSafetyTeacherReviewReport.totals.teacherReviewItemCount,
        riskNote:
          'No AI provider execution is used; messages and guard decisions are fixture rows.',
        evidenceSummary: `${aiTutorChatSafetyTeacherReviewReport.totals.chatSessionCount} chat sessions, ${aiTutorChatSafetyTeacherReviewReport.totals.blockedMessageCount} blocked messages, and ${aiTutorChatSafetyTeacherReviewReport.totals.supportRecommendationCount} support recommendations.`,
      },
      {
        sliceKey: 'ACHIEVEMENTS',
        sliceName: 'Achievements and certificates',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/student-achievement-badge-certificate-report',
        jsonExportPath:
          'exports/learning-local-demo-student-achievement-badge-certificate-report.json',
        markdownExportPath:
          'exports/learning-local-demo-student-achievement-badge-certificate-report.md',
        primaryMetricLabel: 'Achievement records',
        primaryMetricValue:
          studentAchievementBadgeCertificateReport.totals.achievementRecords,
        secondaryMetricLabel: 'Badge awards',
        secondaryMetricValue:
          studentAchievementBadgeCertificateReport.totals.badgeAwards,
        coverageLabel: 'Certificate fixtures',
        coverageValue:
          studentAchievementBadgeCertificateReport.totals.certificateFixtures,
        riskNote:
          'Certificates are previews only; no credential issuer or notification provider is called.',
        evidenceSummary: `${studentAchievementBadgeCertificateReport.totals.achievementRecords} achievement rows, ${studentAchievementBadgeCertificateReport.totals.badgeAwards} badges, and ${studentAchievementBadgeCertificateReport.totals.certificateFixtures} certificate fixtures.`,
      },
      {
        sliceKey: 'WEEKLY_DIGEST',
        sliceName: 'Parent and teacher weekly digest',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/parent-teacher-weekly-digest-report',
        jsonExportPath:
          'exports/learning-local-demo-parent-teacher-weekly-digest-report.json',
        markdownExportPath:
          'exports/learning-local-demo-parent-teacher-weekly-digest-report.md',
        primaryMetricLabel: 'Weekly digests',
        primaryMetricValue: parentTeacherWeeklyDigestReport.totals.digestCount,
        secondaryMetricLabel: 'Digest actions',
        secondaryMetricValue:
          parentTeacherWeeklyDigestReport.totals.actionCount,
        coverageLabel: 'Students covered',
        coverageValue: parentTeacherWeeklyDigestReport.totals.studentsCovered,
        riskNote:
          'Digest delivery is readiness evidence only; no notification provider send is executed.',
        evidenceSummary: `${parentTeacherWeeklyDigestReport.totals.digestCount} digests include ${parentTeacherWeeklyDigestReport.totals.actionCount} actions and ${parentTeacherWeeklyDigestReport.totals.readyToSendDigestCount} ready-to-send rows.`,
      },
      {
        sliceKey: 'FOLLOW_UP_OUTCOMES',
        sliceName: 'Follow-up outcomes',
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        sourceEndpointPath:
          '/v1/learning-local-demo/followup-action-outcome-report',
        jsonExportPath:
          'exports/learning-local-demo-followup-action-outcome-report.json',
        markdownExportPath:
          'exports/learning-local-demo-followup-action-outcome-report.md',
        primaryMetricLabel: 'Follow-up outcomes',
        primaryMetricValue: followUpActionOutcomeReport.totals.outcomeCount,
        secondaryMetricLabel: 'Done or verified',
        secondaryMetricValue:
          followUpActionOutcomeReport.totals.completedOutcomeCount +
          followUpActionOutcomeReport.totals.verifiedOutcomeCount,
        coverageLabel: 'Students covered',
        coverageValue: followUpActionOutcomeReport.totals.studentsCovered,
        riskNote:
          'Outcomes are report rows only; parent messages, teacher interventions, and follow-up mutations are disabled.',
        evidenceSummary: `${followUpActionOutcomeReport.totals.outcomeCount} outcomes link ${followUpActionOutcomeReport.totals.linkedDailyPlanCount} daily plans and ${followUpActionOutcomeReport.totals.linkedSupportRecommendationCount} support recommendations.`,
      },
    ];
    const statusCounts = {
      readinessStatus: this.countByStatus(
        mvpReadinessOverviewStatuses,
        rows,
        (row) => row.readinessStatus,
      ),
    };
    const readyOrReadyWithNotesCount =
      statusCounts.readinessStatus.LOCAL_DEMO_READY +
      statusCounts.readinessStatus.LOCAL_DEMO_READY_WITH_NOTES;
    const safetyEntries = Object.entries(safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
        return value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;

    return {
      reportName: 'Learning local demo MVP Readiness Overview Report',
      generatedFor: 'local-demo-mvp-readiness-overview-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      safety,
      totals: {
        sliceCount: rows.length,
        localDemoReadySliceCount: statusCounts.readinessStatus.LOCAL_DEMO_READY,
        localDemoReadyWithNotesSliceCount:
          statusCounts.readinessStatus.LOCAL_DEMO_READY_WITH_NOTES,
        needsLocalDemoFixSliceCount:
          statusCounts.readinessStatus.NEEDS_LOCAL_DEMO_FIX,
        productionReadySliceCount: 0,
        fixtureOnlySliceCount: rows.length,
        safetyClosedSliceCount: rows.filter((row) => row.safetyClosed).length,
        evidenceEndpointCount: new Set(
          rows.map((row) => row.sourceEndpointPath),
        ).size,
        jsonExportCount: new Set(rows.map((row) => row.jsonExportPath)).size,
        markdownExportCount: new Set(rows.map((row) => row.markdownExportPath))
          .size,
        readinessScorePercent: this.percent(
          readyOrReadyWithNotesCount,
          rows.length,
        ),
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
        studentCount: enrollmentReport.totals.studentCount,
        courseCount: enrollmentReport.totals.courseCount,
        enrollmentCount: enrollmentReport.totals.enrollmentCount,
        activeEnrollmentCount: enrollmentReport.totals.activeEnrollmentCount,
        subscriptionCount: enrollmentReport.totals.subscriptionCount,
        refundCount: enrollmentReport.totals.refundCount,
        commissionCount: enrollmentReport.totals.commissionCount,
        dailyPlanCount: learningPathReport.totals.dailyPlanCount,
        completedDailyPlanCount:
          learningPathReport.totals.completedDailyPlanCount,
        lessonCount: lessonAssignmentReport.totals.lessonCount,
        assignmentCount: lessonAssignmentReport.totals.assignmentCount,
        progressRecordCount: progressReport.totals.progressRecordCount,
        needsSupportLearnerCount:
          lessonAssignmentReport.totals.needsSupportLearnerCount,
        aiTutorChatSessionCount:
          aiTutorChatSafetyTeacherReviewReport.totals.chatSessionCount,
        aiTutorSafetyFlagCount:
          aiTutorChatSafetyTeacherReviewReport.totals.safetyFlagCount,
        achievementRecordCount:
          studentAchievementBadgeCertificateReport.totals.achievementRecords,
        badgeAwardCount:
          studentAchievementBadgeCertificateReport.totals.badgeAwards,
        teacherInterventionReviewCount:
          teacherInterventionRemedialAssignmentSupportPlanReport.totals
            .teacherInterventionReviewCount,
        remedialAssignmentCount:
          teacherInterventionRemedialAssignmentSupportPlanReport.totals
            .remedialAssignmentCount,
        supportPlanCount:
          teacherInterventionRemedialAssignmentSupportPlanReport.totals
            .supportPlanCount,
        remedialRetryCompletionCount:
          remedialRetryCompletionSupportOutcomeFollowupReport.totals
            .remedialRetryCompletionCount,
        supportOutcomeEvidenceCount:
          remedialRetryCompletionSupportOutcomeFollowupReport.totals
            .supportOutcomeEvidenceCount,
        remedialRetryUnresolvedAttemptCount:
          remedialRetryUnresolvedSupportEscalationReport.totals
            .remedialRetryAttemptCount,
        unresolvedSupportOutcomeCount:
          remedialRetryUnresolvedSupportEscalationReport.totals
            .unresolvedSupportOutcomeCount,
        teacherEscalationCount:
          remedialRetryUnresolvedSupportEscalationReport.totals
            .teacherEscalationCount,
        parentVisibleEscalationSummaryCount:
          remedialRetryUnresolvedSupportEscalationReport.totals
            .parentVisibleEscalationSummaryCount,
        teacherVisibleEscalationNextActionCount:
          remedialRetryUnresolvedSupportEscalationReport.totals
            .teacherVisibleEscalationNextActionCount,
        teacherReviewedEscalationCount:
          teacherEscalationFollowupResolutionReport.totals
            .teacherReviewedEscalationCount,
        adjustedSupportRetryCompletionCount:
          teacherEscalationFollowupResolutionReport.totals
            .adjustedSupportRetryCompletionCount,
        resolvedSupportOutcomeCount:
          teacherEscalationFollowupResolutionReport.totals
            .resolvedSupportOutcomeCount,
        parentVisibleClosureSummaryCount:
          teacherEscalationFollowupResolutionReport.totals
            .parentVisibleClosureSummaryCount,
        teacherVisibleClosureNoteCount:
          teacherEscalationFollowupResolutionReport.totals
            .teacherVisibleClosureNoteCount,
        stableEndToEndTraceCount:
          mvpEndToEndReadinessTraceReport.totals.stableEndToEndTraceCount,
        weeklyDigestCount: parentTeacherWeeklyDigestReport.totals.digestCount,
        weeklyDigestActionCount:
          parentTeacherWeeklyDigestReport.totals.actionCount,
        followUpOutcomeCount: followUpActionOutcomeReport.totals.outcomeCount,
      },
      statusCounts,
      rows,
    };
  }

  buildAcceptanceTraceabilityGateReport(
    fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLearningAcceptanceTraceabilityGateReport {
    const mvpReadinessOverviewReport = this.buildMvpReadinessOverviewReport(
      fixture,
      generatedAt,
    );
    const rows: DemoLearningAcceptanceTraceabilityGateRow[] =
      mvpReadinessOverviewReport.rows.map((row) => {
        const acceptanceCriterion = acceptanceCriteriaBySliceKey[row.sliceKey];
        const acceptanceStatus =
          row.safetyClosed &&
          row.fixtureOnly &&
          !row.productionReady &&
          Boolean(row.sourceEndpointPath) &&
          Boolean(row.jsonExportPath) &&
          Boolean(row.markdownExportPath)
            ? 'MAPPED_LOCAL_DEMO'
            : 'NEEDS_LOCAL_DEMO_EVIDENCE';

        return {
          sliceKey: row.sliceKey,
          sliceName: row.sliceName,
          acceptanceCriterionId: acceptanceCriterion.id,
          acceptanceCriterionName: acceptanceCriterion.name,
          acceptanceStatus,
          readinessStatus: row.readinessStatus,
          productionReady: false,
          fixtureOnly: true,
          safetyClosed: row.safetyClosed,
          evidenceEndpointPath: row.sourceEndpointPath,
          jsonExportPath: row.jsonExportPath,
          markdownExportPath: row.markdownExportPath,
          dashboardEvidencePath:
            row.sliceKey === 'MVP_END_TO_END_READINESS_TRACE'
              ? '/admin/learning-local-demo#mvp-end-to-end-readiness-trace'
              : row.sliceKey === 'MVP_ROLE_JOURNEY_ENTRYPOINTS'
                ? '/admin/learning-local-demo#mvp-role-journey-entrypoints'
                : '/admin/learning-local-demo#mvp-readiness-overview',
          seedCommand: 'npm run seed:demo',
          reportCommand: 'npm run report:demo',
          testCommand: 'npm run test:learning-local',
          safetyGatesCovered: acceptanceCriterion.safetyGatesCovered,
          remainingLocalDemoNote: acceptanceCriterion.remainingLocalDemoNote,
          evidenceSummary: row.evidenceSummary,
        };
      });
    const statusCounts = {
      acceptanceStatus: this.countByStatus(
        acceptanceTraceabilityGateStatuses,
        rows,
        (row) => row.acceptanceStatus,
      ),
    };
    const safetyEntries = Object.entries(mvpReadinessOverviewReport.safety);
    const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
      if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
        return value !== true;
      }

      return value !== false;
    }).length;
    const safetyGateCount = safetyEntries.length;

    return {
      reportName: 'Learning local demo Acceptance Traceability Gate Report',
      generatedFor: 'local-demo-acceptance-traceability-gate-report',
      generatedAt,
      currency: fixture.currency,
      productionReady: false,
      fixtureOnly: true,
      safety: mvpReadinessOverviewReport.safety,
      totals: {
        sliceCount: mvpReadinessOverviewReport.totals.sliceCount,
        acceptanceCriterionCount: rows.length,
        mappedCriterionCount: statusCounts.acceptanceStatus.MAPPED_LOCAL_DEMO,
        slicesWithMappingCount: new Set(
          rows
            .filter((row) => row.acceptanceStatus === 'MAPPED_LOCAL_DEMO')
            .map((row) => row.sliceKey),
        ).size,
        slicesMissingMappingCount: new Set(
          rows
            .filter(
              (row) => row.acceptanceStatus === 'NEEDS_LOCAL_DEMO_EVIDENCE',
            )
            .map((row) => row.sliceKey),
        ).size,
        productionReadyClaimCount: 0,
        fixtureOnlyCriterionCount: rows.filter((row) => row.fixtureOnly).length,
        safetyClosedCriterionCount: rows.filter((row) => row.safetyClosed)
          .length,
        evidenceEndpointCount: new Set(
          rows.map((row) => row.evidenceEndpointPath),
        ).size,
        jsonExportCount: new Set(rows.map((row) => row.jsonExportPath)).size,
        markdownExportCount: new Set(rows.map((row) => row.markdownExportPath))
          .size,
        dashboardEvidenceCount: new Set(
          rows.map((row) => row.dashboardEvidencePath),
        ).size,
        seedCommandCount: new Set(rows.map((row) => row.seedCommand)).size,
        reportCommandCount: new Set(rows.map((row) => row.reportCommand)).size,
        testCommandCount: new Set(rows.map((row) => row.testCommand)).size,
        safetyGateCount,
        closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
        openSafetyGateCount,
      },
      statusCounts,
      rows,
    };
  }

  toLearningCoreMarkdown(report: DemoLearningCoreReport) {
    const money = (cents: number) =>
      `${Math.round(cents / 100).toLocaleString('en-US')} ${report.currency}`;

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
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realClassMutationUsed=false',
      '- realSessionMutationUsed=false',
      '- realAttendanceMutationUsed=false',
      '- realProgressMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Totals',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Enrollments: ${report.totals.enrollmentCount}`,
      `- Active enrollments: ${report.totals.activeEnrollmentCount}`,
      `- Pending enrollments: ${report.totals.pendingEnrollmentCount}`,
      `- Canceled enrollments: ${report.totals.canceledEnrollmentCount}`,
      `- Subscriptions: ${report.totals.subscriptionCount}`,
      `- Payments: ${report.totals.paymentCount}`,
      `- Refunds: ${report.totals.refundCount}`,
      `- Commissions: ${report.totals.commissionCount}`,
      `- Gross paid: ${money(report.totals.grossPaidCents)}`,
      `- Pending payment amount: ${money(report.totals.pendingPaymentCents)}`,
      `- Refunded amount: ${money(report.totals.refundedCents)}`,
      `- Net revenue: ${money(report.totals.netRevenueCents)}`,
      `- Commission pending: ${money(report.totals.commissionPendingCents)}`,
      `- Commission payable: ${money(report.totals.commissionPayableCents)}`,
      `- Commission approved: ${money(report.totals.commissionApprovedCents)}`,
      `- Commission canceled: ${money(report.totals.commissionCanceledCents)}`,
      '',
      '## Course Aggregates',
      '',
      '| Course | Enrollments | Active | Pending | Canceled | Gross paid | Refunded | Net revenue | Earned commission |',
      '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
      ...report.courseAggregates.map(
        (row) =>
          `| ${[
            `${row.courseCode} ${row.courseTitle}`,
            String(row.enrollmentCount),
            String(row.activeEnrollmentCount),
            String(row.pendingEnrollmentCount),
            String(row.canceledEnrollmentCount),
            money(row.grossPaidCents),
            money(row.refundedCents),
            money(row.netRevenueCents),
            money(row.commissionEarnedCents),
          ].join(' | ')} |`,
      ),
      '',
      '## Enrollment Rows',
      '',
      '| Student | Course | Enrollment | Subscription | Payment | Refund | Gross paid | Pending payment | Refunded | Net revenue | Commission pending | Commission payable | Commission approved | Commission canceled |',
      '| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
      ...report.rows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            row.courseCode,
            row.enrollmentStatus,
            row.subscriptionStatus,
            row.paymentStatus,
            row.refundStatus,
            money(row.grossPaidCents),
            money(row.pendingPaymentCents),
            money(row.refundedCents),
            money(row.netRevenueCents),
            money(row.commissionPendingCents),
            money(row.commissionPayableCents),
            money(row.commissionApprovedCents),
            money(row.commissionCanceledCents),
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toStudentCourseEnrollmentSubscriptionFlowMarkdown(
    report: DemoLearningStudentCourseEnrollmentSubscriptionFlowReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Current Status',
      '',
      `- Status: ${report.currentStatus.status}`,
      `- Summary: ${report.currentStatus.summary}`,
      `- Endpoint: ${report.endpointPath}`,
      `- Dashboard evidence: ${report.dashboardEvidencePath}`,
      `- JSON export: ${report.jsonExportPath}`,
      `- Markdown export: ${report.markdownExportPath}`,
      '',
      '## Safety',
      '',
      '- production_ready=false',
      '- fixtureOnly=true',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- paymentProviderUsed=false',
      '- aiProviderExecutionUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Acceptance Counts',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Enrollments: ${report.totals.enrollmentCount}`,
      `- Subscriptions: ${report.totals.subscriptionCount}`,
      `- Fixture payment evidence: ${report.totals.fixturePaymentEvidenceCount}`,
      `- Refund evidence: ${report.totals.refundEvidenceCount}`,
      `- Commission evidence: ${report.totals.commissionEvidenceCount}`,
      `- Relationship traces: ${report.totals.relationshipTraceCount}`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Remaining Local-Demo Notes',
      '',
      ...report.currentStatus.remainingLocalDemoNotes.map(
        (note) => `- ${note}`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | Fixture IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join(', '),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Relationship Trace Rows',
      '',
      '| Student | Course | Enrollment | Subscription | Payment | Refunds | Commissions | Summary |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.relationshipRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.studentId})`,
            `${row.courseCode} (${row.courseId})`,
            `${row.enrollmentId} ${row.enrollmentStatus}`,
            `${row.subscriptionId} ${row.subscriptionStatus}`,
            `${row.paymentId} ${row.paymentStatus}`,
            row.refundIds.join(', ') || 'NONE',
            row.commissionIds.join(', ') || 'NONE',
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toSubscriptionEntitlementDailyPlanAccessMarkdown(
    report: DemoLearningSubscriptionEntitlementDailyPlanAccessReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Current Status',
      '',
      `- Status: ${report.currentStatus.status}`,
      `- Summary: ${report.currentStatus.summary}`,
      `- Endpoint: ${report.endpointPath}`,
      `- Dashboard evidence: ${report.dashboardEvidencePath}`,
      `- JSON export: ${report.jsonExportPath}`,
      `- Markdown export: ${report.markdownExportPath}`,
      '',
      '## Safety',
      '',
      '- production_ready=false',
      '- fixtureOnly=true',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- paymentProviderUsed=false',
      '- aiProviderExecutionUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Acceptance Counts',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Enrollments: ${report.totals.enrollmentCount}`,
      `- Subscriptions: ${report.totals.subscriptionCount}`,
      `- Entitlements: ${report.totals.entitlementCount}`,
      `- Daily plan access cases: ${report.totals.dailyPlanAccessCaseCount}`,
      `- Unlocked access: ${report.totals.unlockedAccessCount}`,
      `- Blocked access: ${report.totals.blockedAccessCount}`,
      `- Blocked pending payment: ${report.totals.blockedPendingPaymentCount}`,
      `- Blocked expired: ${report.totals.blockedExpiredCount}`,
      `- Blocked revoked: ${report.totals.blockedRevokedCount}`,
      `- Blocked refunded: ${report.totals.blockedRefundedCount}`,
      `- Blocked canceled: ${report.totals.blockedCanceledCount}`,
      `- Lifecycle rows: ${report.totals.lifecycleRowCount}`,
      `- Lifecycle expired rows: ${report.totals.lifecycleExpiredRowCount}`,
      `- Lifecycle revoked rows: ${report.totals.lifecycleRevokedRowCount}`,
      `- Lifecycle rows with reason: ${report.totals.lifecycleRowsWithReasonCount}`,
      `- Relationship traces: ${report.totals.relationshipTraceCount}`,
      `- Blocked access with reason: ${report.totals.blockedAccessWithReasonCount}`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Remaining Local-Demo Notes',
      '',
      ...report.currentStatus.remainingLocalDemoNotes.map(
        (note) => `- ${note}`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | Fixture IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join(', '),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Access Case Rows',
      '',
      '| Student | Course | Enrollment | Subscription | Entitlement | Learning path | Daily plan | Access | Blocked reason | Next safe action | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.accessRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.studentId})`,
            `${row.courseCode} (${row.courseId})`,
            `${row.enrollmentId} ${row.enrollmentStatus}`,
            `${row.subscriptionId} ${row.subscriptionStatus} / ${row.paymentId} ${row.paymentStatus}`,
            `${row.entitlementId} ${row.entitlementStatus}`,
            `${row.learningPathId} ${row.learningPathStatus}`,
            `${row.dailyPlanId} ${row.dailyPlanStatus}`,
            row.accessStatus,
            row.blockedReason ?? 'NONE',
            row.nextSafeActionLabel,
            row.relationshipKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Lifecycle Hardening Rows',
      '',
      '| Lifecycle | Student | Entitlement | Access | Reason | Next safe action | Audit trace |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...report.lifecycleRows.map(
        (row) =>
          `| ${[
            `${row.lifecycleState} (${row.lifecycleRowId})`,
            `${row.studentName} (${row.studentId})`,
            `${row.entitlementId} ${row.entitlementStatus}`,
            row.accessStatus,
            row.decisionReason,
            row.nextSafeActionLabel,
            row.auditTraceKey,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toParentTeacherProgressAccessSummaryMarkdown(
    report: DemoLearningParentTeacherProgressAccessSummaryReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Current Status',
      '',
      `- Status: ${report.currentStatus.status}`,
      `- Summary: ${report.currentStatus.summary}`,
      `- Endpoint: ${report.endpointPath}`,
      `- Dashboard evidence: ${report.dashboardEvidencePath}`,
      `- JSON export: ${report.jsonExportPath}`,
      `- Markdown export: ${report.markdownExportPath}`,
      '',
      '## Safety',
      '',
      '- production_ready=false',
      '- fixtureOnly=true',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- paymentProviderUsed=false',
      '- aiProviderExecutionUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Acceptance Counts',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Parent guardians: ${report.totals.parentGuardianCount}`,
      `- Teachers/admins: ${report.totals.teacherCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Enrollments: ${report.totals.enrollmentCount}`,
      `- Entitlements: ${report.totals.entitlementCount}`,
      `- Daily plan access cases: ${report.totals.dailyPlanAccessCaseCount}`,
      `- Unlocked access: ${report.totals.unlockedAccessCount}`,
      `- Blocked access: ${report.totals.blockedAccessCount}`,
      `- Blocked reasons: ${report.totals.blockedReasonCount}`,
      `- Progress summaries: ${report.totals.progressSummaryCount}`,
      `- Parent summaries: ${report.totals.parentSummaryCount}`,
      `- Teacher summaries: ${report.totals.teacherSummaryCount}`,
      `- Parent summaries with trace: ${report.totals.parentSummaryWithTraceCount}`,
      `- Teacher summaries with trace: ${report.totals.teacherSummaryWithTraceCount}`,
      `- Blocked access in summaries with reason: ${report.totals.blockedAccessInSummariesWithReasonCount}`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Remaining Local-Demo Notes',
      '',
      ...report.currentStatus.remainingLocalDemoNotes.map(
        (note) => `- ${note}`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | Fixture IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join(', '),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Summary Rows',
      '',
      '| Parent | Child | Course | Access | Progress | Blocked reason | Trace | Summary |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.parentSummaryRows.map(
        (row) =>
          `| ${[
            `${row.parentGuardianName} (${row.parentGuardianId})`,
            `${row.studentName} (${row.childProfileId})`,
            row.courseCode,
            `${row.accessStatus} / ${row.entitlementStatus}`,
            `${row.progressStatus} ${row.completionPercent}%`,
            row.blockedReason ?? 'NONE',
            row.relationshipTraceKey,
            row.parentFacingSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Teacher Summary Rows',
      '',
      '| Teacher | Class | Course | Students | Access | Progress | Blocked reasons | Trace IDs | Summary |',
      '| --- | --- | --- | ---: | --- | --- | ---: | --- | --- |',
      ...report.teacherSummaryRows.map(
        (row) =>
          `| ${[
            `${row.teacherName} (${row.teacherRole})`,
            row.classCode,
            row.courseCode,
            String(row.studentCount),
            `${row.unlockedAccessCount} unlocked / ${row.blockedAccessCount} blocked`,
            `${row.averageCompletionPercent}% average`,
            String(row.blockedReasonCount),
            row.relationshipTraceIds.join(', '),
            row.teacherFacingSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Progress Access Rows',
      '',
      '| Student | Daily plan | Access | Progress | Evidence | Blocked reason | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...report.progressRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.studentId})`,
            `${row.dailyPlanId} ${row.dailyPlanStatus}`,
            `${row.accessStatus} / ${row.entitlementStatus}`,
            `${row.progressStatus} ${row.completionPercent}%`,
            `${row.videoEvidenceId} ${row.videoEvidenceStatus}; ${row.practiceAttemptId} ${row.practiceAttemptStatus}`,
            row.blockedReason ?? 'NONE',
            row.progressEvidenceKey,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toParentTeacherReportPermissionPrivacyRedactionMarkdown(
    report: DemoLearningParentTeacherReportPermissionPrivacyRedactionReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Current Status',
      '',
      `- Status: ${report.currentStatus.status}`,
      `- Summary: ${report.currentStatus.summary}`,
      `- Endpoint: ${report.endpointPath}`,
      `- Dashboard evidence: ${report.dashboardEvidencePath}`,
      `- JSON export: ${report.jsonExportPath}`,
      `- Markdown export: ${report.markdownExportPath}`,
      '',
      '## Safety',
      '',
      '- production_ready=false',
      '- fixtureOnly=true',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- paymentProviderUsed=false',
      '- aiProviderExecutionUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Acceptance Counts',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Parent guardians: ${report.totals.parentGuardianCount}`,
      `- Teachers/admins: ${report.totals.teacherCount}`,
      `- Support/ops actors: ${report.totals.supportOpsCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Report permission cases: ${report.totals.reportPermissionCaseCount}`,
      `- Allowed cases: ${report.totals.allowedReportCaseCount}`,
      `- Denied cases: ${report.totals.deniedReportCaseCount}`,
      `- Teacher unassigned denied cases: ${report.totals.teacherUnassignedDeniedCaseCount}`,
      `- Support/ops audit read-only cases: ${report.totals.supportOpsAuditReadOnlyCaseCount}`,
      `- Visible fields: ${report.totals.visibleFieldCount}`,
      `- Redacted fields: ${report.totals.redactedFieldCount}`,
      `- Denied fields: ${report.totals.deniedFieldCount}`,
      `- Parent-visible fields: ${report.totals.parentVisibleFieldCount}`,
      `- Teacher/admin-visible fields: ${report.totals.teacherVisibleFieldCount}`,
      `- Support/ops-visible fields: ${report.totals.supportOpsVisibleFieldCount}`,
      `- Support/ops denied fields: ${report.totals.supportOpsDeniedFieldCount}`,
      `- Permission traces: ${report.totals.permissionTraceCount}`,
      `- Cases with trace: ${report.totals.casesWithTraceCount}`,
      `- Denied/redacted cases with reason: ${report.totals.deniedOrRedactedCaseWithReasonCount}`,
      `- Redacted/denied fields with reason: ${report.totals.redactedOrDeniedFieldWithReasonCount}`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Remaining Local-Demo Notes',
      '',
      ...report.currentStatus.remainingLocalDemoNotes.map(
        (note) => `- ${note}`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | Fixture IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join(', '),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Permission Case Rows',
      '',
      '| Case | Actor | Scope | Decision | Target | Fields | Reason | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.permissionCaseRows.map(
        (row) =>
          `| ${[
            row.permissionCaseId,
            `${row.actorName} (${row.actorRole})`,
            row.reportScope,
            row.permissionDecision,
            row.targetStudentName ??
              row.targetClassCode ??
              row.targetCourseCode ??
              'NONE',
            `${row.visibleFieldCount} visible / ${row.redactedFieldCount} redacted / ${row.deniedFieldCount} denied`,
            row.decisionReason,
            row.relationshipTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Field Visibility Rows',
      '',
      '| Case | Actor | Field | Scope | Visibility | Value | Reason | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.fieldVisibilityRows.map(
        (row) =>
          `| ${[
            row.permissionCaseId,
            `${row.actorId} (${row.actorRole})`,
            row.fieldKey,
            row.fieldScope,
            row.visibility,
            row.visibleValue ?? row.redactedValue ?? 'NONE',
            row.reason ?? 'NONE',
            row.relationshipTraceKey,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toParentTeacherReportReviewQueueMessagePreviewMarkdown(
    report: DemoLearningParentTeacherReportReviewQueueMessagePreviewReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Current Status',
      '',
      `- Status: ${report.currentStatus.status}`,
      `- Summary: ${report.currentStatus.summary}`,
      `- Endpoint: ${report.endpointPath}`,
      `- Dashboard evidence: ${report.dashboardEvidencePath}`,
      `- JSON export: ${report.jsonExportPath}`,
      `- Markdown export: ${report.markdownExportPath}`,
      '',
      '## Safety',
      '',
      '- production_ready=false',
      '- fixtureOnly=true',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- paymentProviderUsed=false',
      '- aiProviderExecutionUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Acceptance Counts',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Parent guardians: ${report.totals.parentGuardianCount}`,
      `- Teachers/admins: ${report.totals.teacherCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Report summaries: ${report.totals.reportSummaryCount}`,
      `- Permission/redaction references: ${report.totals.permissionRedactionReferenceCount}`,
      `- Review queue items: ${report.totals.reviewQueueItemCount}`,
      `- Message previews: ${report.totals.messagePreviewCount}`,
      `- Approved previews: ${report.totals.approvedPreviewCount}`,
      `- Held previews: ${report.totals.heldPreviewCount}`,
      `- Redaction-aware previews: ${report.totals.redactionAwarePreviewCount}`,
      `- Review decision traces: ${report.totals.reviewDecisionTraceCount}`,
      `- Cases with stable relationship trace: ${report.totals.casesWithStableRelationshipTraceCount}`,
      `- Held/needs-edit with reason: ${report.totals.heldOrNeedsEditWithReasonCount}`,
      `- Approved with permission/redaction evidence: ${report.totals.approvedWithPermissionRedactionEvidenceCount}`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Remaining Local-Demo Notes',
      '',
      ...report.currentStatus.remainingLocalDemoNotes.map(
        (note) => `- ${note}`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | Fixture IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join(', '),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Report Summary Rows',
      '',
      '| Summary | Student | Course | Parent | Source progress | Trace |',
      '| --- | --- | --- | --- | --- | --- |',
      ...report.reportSummaryRows.map(
        (row) =>
          `| ${[
            row.reportSummaryId,
            `${row.studentName} (${row.childProfileId})`,
            `${row.courseCode} / ${row.classCode}`,
            row.parentGuardianName,
            row.sourceProgressSummaryId,
            row.relationshipTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Permission Redaction References',
      '',
      '| Reference | Permission case | Decision | Fields | Reason | Trace |',
      '| --- | --- | --- | --- | --- | --- |',
      ...report.permissionRedactionReferenceRows.map(
        (row) =>
          `| ${[
            row.permissionRedactionReferenceId,
            row.permissionCaseId,
            `${row.permissionDecision} / ${row.reportScope}`,
            `${row.visibleFieldCount} visible / ${row.redactedFieldCount} redacted / ${row.deniedFieldCount} denied`,
            row.permissionReason,
            row.relationshipTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Review Queue Rows',
      '',
      '| Queue item | Student | Parent | Reviewer | Decision | Reason | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...report.reviewQueueRows.map(
        (row) =>
          `| ${[
            row.reviewQueueItemId,
            `${row.studentName} (${row.childProfileId})`,
            row.parentGuardianName,
            `${row.reviewerName} (${row.reviewerRole})`,
            row.reviewStatus,
            row.reviewReason,
            row.relationshipTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Message Preview Rows',
      '',
      '| Preview | Student | Parent | Decision | Permission | Evidence | Reason | Message preview | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.messagePreviewRows.map(
        (row) =>
          `| ${[
            row.messagePreviewId,
            `${row.studentName} (${row.childProfileId})`,
            row.parentGuardianName,
            row.previewDecision,
            row.permissionDecision,
            `permission=${row.permissionEvidenceReferenced ? 'YES' : 'NO'} redaction=${row.redactionEvidenceReferenced ? 'YES' : 'NO'}`,
            row.approvalReason ?? row.heldReason ?? 'NONE',
            row.messagePreview,
            row.relationshipTraceKey,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toParentPortalApprovedReportInboxReadReceiptMarkdown(
    report: DemoLearningParentPortalApprovedReportInboxReadReceiptReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Current Status',
      '',
      `- Status: ${report.currentStatus.status}`,
      `- Summary: ${report.currentStatus.summary}`,
      `- Endpoint: ${report.endpointPath}`,
      `- Dashboard evidence: ${report.dashboardEvidencePath}`,
      `- JSON export: ${report.jsonExportPath}`,
      `- Markdown export: ${report.markdownExportPath}`,
      '',
      '## Safety',
      '',
      '- production_ready=false',
      '- fixtureOnly=true',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- paymentProviderUsed=false',
      '- aiProviderExecutionUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Acceptance Counts',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Parent guardians: ${report.totals.parentGuardianCount}`,
      `- Teachers/admins: ${report.totals.teacherCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Approved previews: ${report.totals.approvedPreviewCount}`,
      `- Held previews: ${report.totals.heldPreviewCount}`,
      `- Parent inbox items: ${report.totals.parentInboxItemCount}`,
      `- Visible parent inbox items: ${report.totals.visibleParentInboxItemCount}`,
      `- Hidden held previews: ${report.totals.hiddenHeldPreviewCount}`,
      `- Read/ack evidence: ${report.totals.readAckEvidenceCount}`,
      `- Permission/redaction references: ${report.totals.permissionRedactionReferenceCount}`,
      `- Parent inbox traces: ${report.totals.parentInboxTraceCount}`,
      `- Visible inbox items with stable relationship trace: ${report.totals.visibleInboxItemsWithStableRelationshipTraceCount}`,
      `- Hidden/held previews with reason: ${report.totals.hiddenHeldPreviewsWithReasonCount}`,
      `- Visible previews with permission/redaction evidence: ${report.totals.visibleParentPreviewWithPermissionRedactionEvidenceCount}`,
      `- Aligned approved Minh/course A1 inbox entries: ${report.totals.alignedApprovedParentInboxEntryCount}`,
      `- Aligned Minh/course A1 read receipts: ${report.totals.alignedParentReadReceiptCount}`,
      `- Stable aligned read receipt traces: ${report.totals.stableAlignedReadReceiptTraceCount}`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Remaining Local-Demo Notes',
      '',
      ...report.currentStatus.remainingLocalDemoNotes.map(
        (note) => `- ${note}`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | Fixture IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join(', '),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Inbox Rows',
      '',
      '| Inbox item | Student | Parent | Visibility | Subject | Body | Hidden reason | Permission evidence | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.parentInboxRows.map(
        (row) =>
          `| ${[
            row.parentInboxItemId,
            `${row.studentName} (${row.childProfileId})`,
            row.parentGuardianName,
            row.inboxVisibility,
            row.visibleSubject ?? 'HIDDEN_LOCAL_DEMO',
            row.visibleBody ?? 'HIDDEN_LOCAL_DEMO',
            row.hiddenReason ?? 'NONE',
            `permission=${row.permissionEvidenceReferenced ? 'YES' : 'NO'} redaction=${row.redactionEvidenceReferenced ? 'YES' : 'NO'}`,
            row.relationshipTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Read/Ack Rows',
      '',
      '| Read/Ack | Inbox item | Parent | Status | Read at | Acknowledged at | Reason | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.readAckRows.map(
        (row) =>
          `| ${[
            row.readAckEvidenceId,
            row.parentInboxItemId,
            row.parentGuardianName,
            row.readAckStatus,
            row.readAt,
            row.acknowledgedAt,
            row.evidenceReason,
            row.relationshipTraceKey,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toClassSessionAttendanceProgressMarkdown(
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

  toLessonAssignmentAssessmentProgressMarkdown(
    report: DemoLearningLessonAssignmentAssessmentProgressReport,
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
      '- realLessonMutationUsed=false',
      '- realAssignmentMutationUsed=false',
      '- realAssessmentMutationUsed=false',
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
      `- Lessons: ${report.totals.lessonCount}`,
      `- Published lessons: ${report.totals.publishedLessonCount}`,
      `- Scheduled lessons: ${report.totals.scheduledLessonCount}`,
      `- Assignments/quizzes: ${report.totals.assignmentCount}`,
      `- Quizzes: ${report.totals.quizCount}`,
      `- Assignment tasks: ${report.totals.assignmentTaskCount}`,
      `- Expected submissions: ${report.totals.expectedSubmissionCount}`,
      `- Submission records: ${report.totals.submissionRecordCount}`,
      `- Submitted: ${report.totals.submittedSubmissionCount}`,
      `- Late: ${report.totals.lateSubmissionCount}`,
      `- Missing: ${report.totals.missingSubmissionCount}`,
      `- Resubmitted: ${report.totals.resubmittedSubmissionCount}`,
      `- Scored submissions: ${report.totals.scoredSubmissionCount}`,
      `- Feedback given: ${report.totals.feedbackGivenCount}`,
      `- Feedback pending: ${report.totals.pendingFeedbackCount}`,
      `- Average score: ${report.totals.averageScorePercent}%`,
      `- Assignment completion: ${report.totals.overallAssignmentCompletionPercent}%`,
      `- Learner assessments: ${report.totals.learnerAssessmentCount}`,
      `- Excellent learners: ${report.totals.excellentLearnerCount}`,
      `- On-track learners: ${report.totals.onTrackLearnerCount}`,
      `- Needs-support learners: ${report.totals.needsSupportLearnerCount}`,
      `- Withdrawn learners: ${report.totals.withdrawnLearnerCount}`,
      '',
      '## Lesson Rows',
      '',
      '| Lesson | Class | Status | Items | Expected submissions | Records | Missing | Average score |',
      '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |',
      ...report.lessonRows.map(
        (row) =>
          `| ${[
            `${row.lessonCode} ${row.lessonTitle}`,
            row.classCode,
            row.lessonStatus,
            String(row.assignmentCount),
            String(row.expectedSubmissionCount),
            String(row.submissionRecordCount),
            String(row.missingSubmissionCount),
            `${row.averageScorePercent}%`,
          ].join(' | ')} |`,
      ),
      '',
      '## Assignment Rows',
      '',
      '| Item | Lesson | Kind | Status | Expected | Submitted | Late | Missing | Resubmitted | Scored | Feedback pending | Avg score |',
      '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
      ...report.assignmentRows.map(
        (row) =>
          `| ${[
            row.title,
            row.lessonCode,
            row.kind,
            row.status,
            String(row.expectedSubmissionCount),
            String(row.submittedSubmissionCount),
            String(row.lateSubmissionCount),
            String(row.missingSubmissionCount),
            String(row.resubmittedSubmissionCount),
            String(row.scoredSubmissionCount),
            String(row.pendingFeedbackCount),
            `${row.averageScorePercent}%`,
          ].join(' | ')} |`,
      ),
      '',
      '## Learner Assessment Rows',
      '',
      '| Student | Class | Progress | Expected | Submitted | Late | Missing | Resubmitted | Scored | Avg score | Assignment completion | Progress completion | Band |',
      '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
      ...report.learnerRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            row.classCode,
            row.progressStatus,
            String(row.expectedAssignmentCount),
            String(row.submittedSubmissionCount),
            String(row.lateSubmissionCount),
            String(row.missingSubmissionCount),
            String(row.resubmittedSubmissionCount),
            String(row.scoredSubmissionCount),
            `${row.averageScorePercent}%`,
            `${row.assignmentCompletionPercent}%`,
            `${row.progressCompletionPercent}%`,
            row.assessmentBand,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toLearningPathDailyPlanVideoPracticeEvidenceMarkdown(
    report: DemoLearningPathDailyPlanVideoPracticeEvidenceReport,
  ) {
    const score = (value: number | null) =>
      value === null ? 'n/a' : `${value}%`;
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
      '- paymentProviderUsed=false',
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
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Totals',
      '',
      `- Students/children: ${report.totals.studentCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Learning paths: ${report.totals.learningPathCount}`,
      `- Daily plans: ${report.totals.dailyPlanCount}`,
      `- Completed daily plans: ${report.totals.completedDailyPlanCount}`,
      `- Blocked/skipped/incomplete daily plans: ${report.totals.blockedSkippedIncompleteDailyPlanCount}`,
      `- Video evidence records: ${report.totals.videoEvidenceCount}`,
      `- Completed videos: ${report.totals.completedVideoCount}`,
      `- Incomplete videos: ${report.totals.incompleteVideoCount}`,
      `- Skipped videos: ${report.totals.skippedVideoCount}`,
      `- Practice attempts: ${report.totals.practiceAttemptCount}`,
      `- Passed practice attempts: ${report.totals.passedPracticeCount}`,
      `- Needs-retry practice attempts: ${report.totals.needsRetryPracticeCount}`,
      `- Incomplete practice attempts: ${report.totals.incompletePracticeCount}`,
      `- Skipped practice attempts: ${report.totals.skippedPracticeCount}`,
      `- Average practice score: ${report.totals.averagePracticeScorePercent}%`,
      `- Overall daily-plan completion: ${report.totals.overallDailyPlanCompletionPercent}%`,
      `- Average learner progress: ${report.totals.averageLearnerProgressPercent}%`,
      `- Learner bands: onTrack=${report.totals.onTrackLearnerCount}, needsSupport=${report.totals.needsSupportLearnerCount}, inactive=${report.totals.inactiveLearnerCount}, withdrawn=${report.totals.withdrawnLearnerCount}`,
      '',
      '## Learning Path Rows',
      '',
      '| Student | Course | Class | Path | Status | Plans | Videos complete | Practice passed | Avg practice | Progress | Band |',
      '| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
      ...report.learningPathRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            row.courseCode,
            row.classCode,
            row.title,
            row.pathStatus,
            `${row.completedDailyPlanCount}/${row.dailyPlanCount}`,
            String(row.completedVideoCount),
            String(row.passedPracticeCount),
            `${row.averagePracticeScorePercent}%`,
            `${row.progressPercent}%`,
            row.learnerStatusBand,
          ].join(' | ')} |`,
      ),
      '',
      '## Daily Plan Video Practice Rows',
      '',
      '| Student | Date | Lesson | Daily plan | Plan status | Video evidence | Watch | Practice attempt | Score |',
      '| --- | --- | --- | --- | --- | --- | ---: | --- | ---: |',
      ...report.dailyPlanRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            row.planDate,
            row.lessonCode,
            row.title,
            row.dailyPlanStatus,
            row.videoEvidenceStatus,
            `${row.videoCompletionPercent}%`,
            row.practiceAttemptStatus,
            score(row.practiceScorePercent),
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toParentTeacherProgressAlertInterventionMarkdown(
    report: DemoLearningParentTeacherProgressAlertInterventionReport,
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
      `- Students/children: ${report.totals.studentCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Learner progress summaries: ${report.totals.learnerProgressSummaryCount}`,
      `- Alerts: ${report.totals.alertCount}`,
      `- High-risk alerts: ${report.totals.highRiskAlertCount}`,
      `- Medium-risk alerts: ${report.totals.mediumRiskAlertCount}`,
      `- Resolved alerts: ${report.totals.resolvedAlertCount}`,
      `- Follow-up-needed alerts: ${report.totals.followUpNeededAlertCount}`,
      `- Teacher intervention recommendations: ${report.totals.teacherInterventionRecommendationCount}`,
      `- Parent summaries: ${report.totals.parentSummaryCount}`,
      `- Follow-up status bands: open=${report.totals.openFollowUpCount}, scheduled=${report.totals.scheduledFollowUpCount}, resolved=${report.totals.resolvedFollowUpCount}, monitoring=${report.totals.monitoringFollowUpCount}`,
      '',
      '## Top Alert Reasons',
      '',
      '| Reason | Alerts |',
      '| --- | ---: |',
      ...report.topAlertReasons.map(
        (row) => `| ${row.reasonLabel} | ${row.alertCount} |`,
      ),
      '',
      '## Learner Progress Summaries',
      '',
      '| Student | Course | Class | Teacher | Progress | Attendance | Missing | Skipped videos | Blocked plans | Avg practice | Alerts | Follow-up needed | Highest risk |',
      '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
      ...report.learnerSummaries.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            row.courseCode,
            row.classCode,
            row.teacherName,
            `${row.progressPercent}%`,
            `${row.attendanceRatePercent}%`,
            String(row.missingSubmissionCount),
            String(row.skippedVideoCount),
            String(row.blockedDailyPlanCount),
            `${row.averagePracticeScorePercent}%`,
            String(row.alertCount),
            String(row.followUpNeededAlertCount),
            row.highestAlertSeverity,
          ].join(' | ')} |`,
      ),
      '',
      '## Alert Intervention Rows',
      '',
      '| Student | Severity | Reason | Follow-up | Evidence | Teacher intervention | Parent summary |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...report.alertRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            row.alertSeverity,
            row.reasonLabel,
            `${row.followUpStatus} ${row.recommendedFollowUpAt}`,
            row.evidenceSummary,
            row.teacherInterventionRecommendation,
            row.parentSummary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toParentScreenTimeGuardianControlsMarkdown(
    report: DemoLearningParentScreenTimeGuardianControlsReport,
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
      '- realParentGuardianMutationUsed=false',
      '- realScreenTimePolicyMutationUsed=false',
      '- realLearningSessionGateMutationUsed=false',
      '- realScreenTimeGrantMutationUsed=false',
      '- realDailyPlanAccessMutationUsed=false',
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
      `- Parents/guardians: ${report.totals.parentGuardianCount}`,
      `- Children: ${report.totals.childCount}`,
      `- Active screen-time policies: ${report.totals.activeScreenTimePolicyCount}`,
      `- Allowed minutes: ${report.totals.allowedMinutes}`,
      `- Used minutes: ${report.totals.usedMinutes}`,
      `- Remaining minutes: ${report.totals.remainingMinutes}`,
      `- Grant requests: ${report.totals.grantRequestCount}`,
      `- Grant decisions: ${report.totals.grantDecisionCount}`,
      `- Approved grants: ${report.totals.approvedGrantCount}`,
      `- Denied grants: ${report.totals.deniedGrantCount}`,
      `- Allowed sessions: ${report.totals.allowedSessionCount}`,
      `- Blocked sessions: ${report.totals.blockedSessionCount}`,
      `- Override sessions: ${report.totals.overrideSessionCount}`,
      `- Children needing parent attention: ${report.totals.childrenNeedingParentAttentionCount}`,
      '',
      '## Child Controls Rows',
      '',
      '| Child | Guardian | Courses | Policy | Minutes used | Grants | Sessions | Attention |',
      '| --- | --- | --- | --- | ---: | ---: | ---: | --- |',
      ...report.childRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            `${row.guardianName} (${row.relationship})`,
            row.courseCodes.join(', '),
            `${row.policyStatus} ${row.dailyAllowedMinutes}+${row.approvedGrantMinutes}`,
            `${row.usedMinutes}/${row.totalAllowedMinutes} remaining ${row.remainingMinutes}`,
            `${row.grantDecisionCount}/${row.grantRequestCount}`,
            `allowed ${row.allowedSessionCount}, blocked ${row.blockedSessionCount}, override ${row.overrideSessionCount}`,
            row.needsParentAttention ? row.parentAttentionReason : 'No',
          ].join(' | ')} |`,
      ),
      '',
      '## Learning Session Gate Rows',
      '',
      '| Child | Daily plan | Course | Teacher | Decision | Requested | Used before | Blocked reason | Access |',
      '| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |',
      ...report.gateRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            row.dailyPlanTitle,
            row.courseCode,
            row.teacherName,
            row.decision,
            String(row.requestedMinutes),
            String(row.usedMinutesBeforeSession),
            row.blockedReason,
            row.safeDailyPlanAccess ? 'safe daily plan access' : 'blocked',
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Grant Rows',
      '',
      '| Child | Guardian | Requested extra | Decision | Granted | Reason |',
      '| --- | --- | ---: | --- | ---: | --- |',
      ...report.grantRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            row.guardianName,
            String(row.requestedExtraMinutes),
            row.decision,
            String(row.grantedMinutes),
            row.decisionReason,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toParentScreenTimeGrantDailyPlanGuardMarkdown(
    report: DemoLearningParentScreenTimeGrantDailyPlanGuardReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Current Status',
      '',
      `- Status: ${report.currentStatus.status}`,
      `- Summary: ${report.currentStatus.summary}`,
      `- Endpoint: ${report.endpointPath}`,
      `- Dashboard evidence: ${report.dashboardEvidencePath}`,
      `- JSON export: ${report.jsonExportPath}`,
      `- Markdown export: ${report.markdownExportPath}`,
      '',
      '## Safety',
      '',
      '- production_ready=false',
      '- fixtureOnly=true',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- aiProviderUsed=false',
      '- aiProviderExecutionUsed=false',
      '- paymentProviderUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realParentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
      '- realLearningPathMutationUsed=false',
      '- realDailyPlanMutationUsed=false',
      '- realParentGuardianMutationUsed=false',
      '- realScreenTimePolicyMutationUsed=false',
      '- realLearningSessionGateMutationUsed=false',
      '- realScreenTimeGrantMutationUsed=false',
      '- realDailyPlanAccessMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realParentMessageMutationUsed=false',
      '- realTeacherInterventionMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Acceptance Counts',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Parent guardians: ${report.totals.parentGuardianCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Daily plan access cases: ${report.totals.dailyPlanAccessCaseCount}`,
      `- Parent grant rules: ${report.totals.parentGrantRuleCount}`,
      `- Screen-time rules: ${report.totals.screenTimeRuleCount}`,
      `- Allowed sessions: ${report.totals.allowedSessionCount}`,
      `- Blocked sessions: ${report.totals.blockedSessionCount}`,
      `- Blocked reasons: ${report.totals.blockedReasonCount}`,
      `- Safe next-action labels: ${report.totals.safeNextActionCount}`,
      `- Blocked/limited cases with safe next action: ${report.totals.blockedOrLimitedCaseWithSafeNextActionCount}`,
      `- Session guard traces: ${report.totals.sessionGuardTraceCount}`,
      `- Stable trace cases: ${report.totals.accessCasesWithStableTraceCount}`,
      `- Blocked cases with reason and next action: ${report.totals.blockedCasesWithReasonAndNextActionCount}`,
      `- Learning session evidence rows: ${report.totals.learningSessionEvidenceCount}`,
      `- Allowed learning session evidence: ${report.totals.allowedLearningSessionEvidenceCount}`,
      `- Blocked learning session evidence: ${report.totals.blockedLearningSessionEvidenceCount}`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Remaining Local-Demo Notes',
      '',
      ...report.currentStatus.remainingLocalDemoNotes.map(
        (note) => `- ${note}`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | Fixture IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join(', '),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Daily Plan Guard Rows',
      '',
      '| Child | Guardian | Daily plan | Rule | Grant | Result | Reason | Next action | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.accessRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            `${row.parentGuardianName} (${row.relationship})`,
            `${row.courseCode} / ${row.dailyPlanTitle}`,
            `${row.screenTimePolicyStatus} ${row.usedMinutesBeforeSession}+${row.requestedMinutes}/${row.totalAllowedMinutesForCase}`,
            row.parentGrantRuleId
              ? `${row.parentGrantRuleId} ${row.parentGrantDecision}`
              : 'NONE',
            `${row.accessDecision} / ${row.accessResult}`,
            row.blockedReason
              ? `${row.blockedReasonCode}: ${row.blockedReason}`
              : row.blockedReasonCode,
            row.nextSafeActionLabel,
            row.sessionGuardTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Grant Rule Rows',
      '',
      '| Grant | Child | Daily plan | Requested | Decision | Granted | Allows access | Reason | Trace |',
      '| --- | --- | --- | ---: | --- | ---: | --- | --- | --- |',
      ...report.grantRuleRows.map(
        (row) =>
          `| ${[
            row.grantRuleId,
            `${row.studentName} (${row.childProfileId})`,
            row.dailyPlanTitle,
            String(row.requestedExtraMinutes),
            row.decision,
            String(row.grantedMinutes),
            row.allowsDailyPlanAccess ? 'yes' : 'no',
            row.decisionReason,
            row.ruleTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Learning Session Evidence Rows',
      '',
      '| Evidence | Child | Daily plan | Result | Started | Minutes | Reason | Next action | Trace |',
      '| --- | --- | --- | --- | --- | ---: | --- | --- | --- |',
      ...report.sessionEvidenceRows.map(
        (row) =>
          `| ${[
            row.learningSessionEvidenceId,
            `${row.studentName} (${row.childProfileId})`,
            row.dailyPlanTitle,
            `${row.accessDecision} / ${row.accessResult}`,
            row.sessionStarted ? 'yes' : 'no',
            String(row.sessionDurationMinutes),
            row.blockedReason ?? 'NONE',
            row.nextSafeActionLabel,
            row.sessionGuardTraceKey,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toLearningSessionCompletionPracticeProgressRollupMarkdown(
    report: DemoLearningSessionCompletionPracticeProgressRollupReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Current Status',
      '',
      `- Status: ${report.currentStatus.status}`,
      `- Summary: ${report.currentStatus.summary}`,
      `- Endpoint: ${report.endpointPath}`,
      `- Dashboard evidence: ${report.dashboardEvidencePath}`,
      `- JSON export: ${report.jsonExportPath}`,
      `- Markdown export: ${report.markdownExportPath}`,
      '',
      '## Safety',
      '',
      '- production_ready=false',
      '- fixtureOnly=true',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- aiProviderUsed=false',
      '- aiProviderExecutionUsed=false',
      '- paymentProviderUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realParentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
      '- realLearningSessionGateMutationUsed=false',
      '- realDailyPlanAccessMutationUsed=false',
      '- realLearningSessionCompletionMutationUsed=false',
      '- realProgressMutationUsed=false',
      '- realVideoEvidenceMutationUsed=false',
      '- realPracticeMutationUsed=false',
      '- realParentProgressSummaryMutationUsed=false',
      '- realTeacherProgressSummaryMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realParentMessageMutationUsed=false',
      '- realTeacherInterventionMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Acceptance Counts',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Daily plan session references: ${report.totals.dailyPlanSessionReferenceCount}`,
      `- Allowed daily plan session references: ${report.totals.allowedDailyPlanSessionReferenceCount}`,
      `- Lesson completion evidence: ${report.totals.lessonCompletionEvidenceCount}`,
      `- Practice attempt evidence: ${report.totals.practiceAttemptEvidenceCount}`,
      `- Progress rollups: ${report.totals.progressRollupCount}`,
      `- Parent-visible progress summaries: ${report.totals.parentVisibleProgressSummaryCount}`,
      `- Teacher-visible progress summaries: ${report.totals.teacherVisibleProgressSummaryCount}`,
      `- Stable traces: ${report.totals.stableTraceCount}`,
      `- Rollups with student/course/daily plan/session: ${report.totals.rollupsWithStudentCourseDailyPlanSessionCount}`,
      `- Rollups with lesson/practice evidence: ${report.totals.rollupsWithLessonPracticeEvidenceCount}`,
      `- Rollups with parent/teacher summaries: ${report.totals.rollupsWithParentTeacherSummaryCount}`,
      `- Practice attempts with deterministic score/status: ${report.totals.practiceAttemptsWithDeterministicScoreStatusCount}`,
      `- Rollups with completion percent: ${report.totals.rollupsWithCompletionPercentCount}`,
      `- Rollups with safe next action: ${report.totals.rollupsWithSafeNextActionLabelCount}`,
      `- Average completion: ${report.totals.averageCompletionPercent}%`,
      `- Average practice score: ${report.totals.averagePracticeScorePercent}%`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Remaining Local-Demo Notes',
      '',
      ...report.currentStatus.remainingLocalDemoNotes.map(
        (note) => `- ${note}`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | Fixture IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join(', '),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Progress Rollup Rows',
      '',
      '| Rollup | Child | Daily plan/session | Lesson/video | Practice | Progress | Parent summary | Teacher summary | Next action | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.progressRollupRows.map(
        (row) =>
          `| ${[
            `${row.progressRollupId} ${row.rollupStatus}`,
            `${row.studentName} (${row.childProfileId})`,
            `${row.dailyPlanTitle} / ${row.learningSessionEvidenceId}`,
            `${row.lessonCode} ${row.videoEvidenceStatus} ${row.videoCompletionPercent}%`,
            `${row.practiceAttemptStatus} ${row.practiceScorePercent}%`,
            `${row.progressStatus} ${row.completionPercent}%`,
            row.parentVisibleProgressSummaryId,
            row.teacherVisibleProgressSummaryId,
            row.nextSafeActionLabel,
            row.stableTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Summary Rows',
      '',
      '| Parent summary | Child | Daily plan | Completion | Practice | Status | Next action |',
      '| --- | --- | --- | ---: | ---: | --- | --- |',
      ...report.parentSummaryRows.map(
        (row) =>
          `| ${[
            row.parentVisibleProgressSummaryId,
            `${row.studentName} (${row.childProfileId})`,
            row.dailyPlanTitle,
            `${row.completionPercent}%`,
            `${row.practiceScorePercent}%`,
            row.rollupStatus,
            row.nextSafeActionLabel,
          ].join(' | ')} |`,
      ),
      '',
      '## Teacher Summary Rows',
      '',
      '| Teacher summary | Teacher | Child | Class | Lesson | Completion | Practice | Status | Next action |',
      '| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |',
      ...report.teacherSummaryRows.map(
        (row) =>
          `| ${[
            row.teacherVisibleProgressSummaryId,
            row.teacherName,
            `${row.studentName} (${row.childProfileId})`,
            row.classCode,
            row.lessonCode,
            `${row.completionPercent}%`,
            `${row.practiceScorePercent}%`,
            row.rollupStatus,
            row.nextSafeActionLabel,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toTeacherInterventionRemedialAssignmentSupportPlanMarkdown(
    report: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Current Status',
      '',
      `- Status: ${report.currentStatus.status}`,
      `- Summary: ${report.currentStatus.summary}`,
      `- Endpoint: ${report.endpointPath}`,
      `- Dashboard evidence: ${report.dashboardEvidencePath}`,
      `- JSON export: ${report.jsonExportPath}`,
      `- Markdown export: ${report.markdownExportPath}`,
      '',
      '## Safety',
      '',
      '- production_ready=false',
      '- fixtureOnly=true',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- aiProviderUsed=false',
      '- aiProviderExecutionUsed=false',
      '- paymentProviderUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realParentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realLearningSessionCompletionMutationUsed=false',
      '- realProgressMutationUsed=false',
      '- realVideoEvidenceMutationUsed=false',
      '- realPracticeMutationUsed=false',
      '- realParentProgressSummaryMutationUsed=false',
      '- realTeacherProgressSummaryMutationUsed=false',
      '- realTeacherInterventionMutationUsed=false',
      '- realTeacherInterventionReviewMutationUsed=false',
      '- realRemedialAssignmentMutationUsed=false',
      '- realSupportPlanMutationUsed=false',
      '- realParentSupportSummaryMutationUsed=false',
      '- realTeacherNextActionMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realParentMessageMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Acceptance Counts',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Teachers: ${report.totals.teacherCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Needs-support progress rollups: ${report.totals.needsSupportProgressRollupCount}`,
      `- Teacher intervention reviews: ${report.totals.teacherInterventionReviewCount}`,
      `- Remedial assignments: ${report.totals.remedialAssignmentCount}`,
      `- Support plans: ${report.totals.supportPlanCount}`,
      `- Parent-visible support summaries: ${report.totals.parentVisibleSupportSummaryCount}`,
      `- Teacher-visible next actions: ${report.totals.teacherVisibleNextActionCount}`,
      `- Support reasons: ${report.totals.supportReasonCount}`,
      `- Stable traces: ${report.totals.stableTraceCount}`,
      `- Complete intervention links: ${report.totals.interventionLinksCompleteCount}`,
      `- Support plans with deterministic status: ${report.totals.supportPlansWithDeterministicStatusCount}`,
      `- Remedial assignments with deterministic status: ${report.totals.remedialAssignmentsWithDeterministicStatusCount}`,
      `- Teacher next actions with safe label: ${report.totals.teacherNextActionsWithSafeLabelCount}`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Remaining Local-Demo Notes',
      '',
      ...report.currentStatus.remainingLocalDemoNotes.map(
        (note) => `- ${note}`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | Fixture IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join(', '),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Teacher Intervention Review Rows',
      '',
      '| Review | Child | Teacher | Course | Source rollup | Support reason | Remedial/support | Parent summary | Teacher action | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.interventionReviewRows.map(
        (row) =>
          `| ${[
            `${row.interventionReviewId} ${row.reviewStatus}`,
            `${row.studentName} (${row.childProfileId})`,
            row.teacherName,
            row.courseCode,
            `${row.progressRollupId} ${row.rollupStatus}`,
            row.supportReason,
            `${row.remedialAssignmentId} / ${row.supportPlanId}`,
            row.parentVisibleSupportSummaryId,
            row.teacherVisibleNextActionId,
            row.stableTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Remedial Assignment Rows',
      '',
      '| Remedial assignment | Child | Teacher | Daily plan | Lesson | Status | Due | Next action |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.remedialAssignmentRows.map(
        (row) =>
          `| ${[
            row.remedialAssignmentId,
            `${row.studentName} (${row.childProfileId})`,
            row.teacherName,
            row.remedialDailyPlanTitle,
            row.remedialLessonCode,
            row.status,
            row.dueAt,
            row.safeNextActionLabel,
          ].join(' | ')} |`,
      ),
      '',
      '## Support Plan Rows',
      '',
      '| Support plan | Child | Teacher | Status | Parent visible | Teacher visible | Next action |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...report.supportPlanRows.map(
        (row) =>
          `| ${[
            row.supportPlanId,
            `${row.studentName} (${row.childProfileId})`,
            row.teacherName,
            row.status,
            row.parentVisible ? 'yes' : 'no',
            row.teacherVisible ? 'yes' : 'no',
            row.safeNextActionLabel,
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Support Summary Rows',
      '',
      '| Parent summary | Parent | Child | Course | Reason | Next action |',
      '| --- | --- | --- | --- | --- | --- |',
      ...report.parentSummaryRows.map(
        (row) =>
          `| ${[
            row.parentVisibleSupportSummaryId,
            `${row.parentGuardianName} (${row.parentGuardianEmail})`,
            `${row.studentName} (${row.childProfileId})`,
            row.courseCode,
            row.supportReason,
            row.safeNextActionLabel,
          ].join(' | ')} |`,
      ),
      '',
      '## Teacher Next Action Rows',
      '',
      '| Teacher action | Teacher | Child | Class | Status | Next action |',
      '| --- | --- | --- | --- | --- | --- |',
      ...report.teacherNextActionRows.map(
        (row) =>
          `| ${[
            row.teacherVisibleNextActionId,
            row.teacherName,
            `${row.studentName} (${row.childProfileId})`,
            row.classCode,
            row.status,
            row.safeNextActionLabel,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toTeacherContentLibraryLearningPathPublishMarkdown(
    report: DemoLearningTeacherContentLibraryLearningPathPublishReport,
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
      '- realContentLibraryMutationUsed=false',
      '- realContentPublishMutationUsed=false',
      '- realContentUploadMutationUsed=false',
      '- realStorageCdnMutationUsed=false',
      '- realTeacherAdminAccountMutationUsed=false',
      '- realStudentClassVisibilityMutationUsed=false',
      '- realParentSummaryMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Totals',
      '',
      `- Teacher/admin owners: ${report.totals.teacherAdminCount}`,
      `- Content items: ${report.totals.contentItemCount}`,
      `- Video assets: ${report.totals.videoAssetCount}`,
      `- Practice assets: ${report.totals.practiceAssetCount}`,
      `- Lesson assets: ${report.totals.lessonAssetCount}`,
      `- Draft content: ${report.totals.draftContentCount}`,
      `- Published content: ${report.totals.publishedContentCount}`,
      `- Archived content: ${report.totals.archivedContentCount}`,
      `- Learning-path publishes: ${report.totals.learningPathPublishCount}`,
      `- Class assignments: ${report.totals.classAssignmentCount}`,
      `- Student visibility rows: ${report.totals.studentVisibilityCount}`,
      `- Parent-visible summaries: ${report.totals.parentVisibleSummaryCount}`,
      `- Blocked/unpublished items: ${report.totals.blockedUnpublishedItemCount}`,
      `- Items needing teacher review: ${report.totals.itemsNeedingTeacherReviewCount}`,
      '',
      '## Content Library Rows',
      '',
      '| Content | Owner | Course | Lesson | Asset | Publish | Class assignments | Path publishes | Student visibility | Parent summaries | Review | Blocked reason |',
      '| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |',
      ...report.contentRows.map(
        (row) =>
          `| ${[
            row.title,
            `${row.ownerName} (${row.ownerRole})`,
            row.courseCode,
            row.lessonCode,
            row.assetKind,
            row.publishStatus,
            String(row.classAssignmentCount),
            String(row.learningPathPublishCount),
            String(row.studentVisibilityCount),
            String(row.parentVisibleSummaryCount),
            row.needsTeacherReview ? 'YES' : 'NO',
            row.blockedReason,
          ].join(' | ')} |`,
      ),
      '',
      '## Class Assignment Rows',
      '',
      '| Content | Class | Teacher | Assignment | Visible students | Blocked students | Assigned at |',
      '| --- | --- | --- | --- | ---: | ---: | --- |',
      ...report.classAssignmentRows.map(
        (row) =>
          `| ${[
            row.contentTitle,
            row.classCode,
            row.teacherName,
            row.assignmentStatus,
            String(row.visibleStudentCount),
            String(row.blockedStudentVisibilityCount),
            row.assignedAt,
          ].join(' | ')} |`,
      ),
      '',
      '## Student Visibility Rows',
      '',
      '| Student | Content | Daily plan | Course | Class | Visibility | Student | Parent | Available | Blocked reason |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.studentVisibilityRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            row.contentTitle,
            `${row.planDate} ${row.dailyPlanTitle}`,
            row.courseCode,
            row.classCode,
            row.visibilityStatus,
            row.studentVisible ? 'visible' : 'hidden',
            row.parentVisible ? 'visible' : 'hidden',
            row.availableOnDailyPlan ? 'yes' : 'no',
            row.blockedReason,
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Summary Rows',
      '',
      '| Parent | Student | Courses | Classes | Parent visible | Blocked | Teacher review | Next date | Summary |',
      '| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |',
      ...report.parentSummaryRows.map(
        (row) =>
          `| ${[
            row.parentGuardianName,
            `${row.studentName} (${row.childProfileId})`,
            row.courseCodes.join(', '),
            row.classCodes.join(', '),
            String(row.parentVisibleItemCount),
            String(row.blockedItemCount),
            String(row.itemsNeedingTeacherReviewCount),
            row.nextAvailableDailyPlanDate ?? 'n/a',
            row.summary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toAiTutorChatSafetyTeacherReviewMarkdown(
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

  toStudentAchievementBadgeCertificateMarkdown(
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

  toParentTeacherWeeklyDigestMarkdown(
    report: DemoLearningParentTeacherWeeklyDigestReport,
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
      '- realWeeklyDigestNotificationMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Totals',
      '',
      `- Weekly digests: ${report.totals.digestCount}`,
      `- Parent digests: ${report.totals.parentDigestCount}`,
      `- Teacher digests: ${report.totals.teacherDigestCount}`,
      `- Ready to send: ${report.totals.readyToSendDigestCount}`,
      `- Teacher review: ${report.totals.teacherReviewDigestCount}`,
      `- Held withdrawn: ${report.totals.heldWithdrawnDigestCount}`,
      `- Parent-visible digests: ${report.totals.parentVisibleDigestCount}`,
      `- Teacher-only digests: ${report.totals.teacherOnlyDigestCount}`,
      `- Digest actions: ${report.totals.actionCount}`,
      `- High-priority actions: ${report.totals.highPriorityActionCount}`,
      `- Scheduled actions: ${report.totals.scheduledActionCount}`,
      `- Completed actions: ${report.totals.completedActionCount}`,
      `- Students covered: ${report.totals.studentsCovered}`,
      `- Students needing teacher review: ${report.totals.studentsNeedingTeacherReview}`,
      `- Students ready for parent send: ${report.totals.studentsReadyForParentSend}`,
      '',
      '## Student Weekly Digest Rows',
      '',
      '| Student | Course | Parent digests | Teacher digests | Ready | Review | Held | Actions | High priority | Completed | Next action | Summary |',
      '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |',
      ...report.studentRows.map(
        (row) =>
          `| ${[
            `${row.studentName} (${row.childProfileId})`,
            `${row.courseCode} / ${row.classCode}`,
            String(row.parentDigestCount),
            String(row.teacherDigestCount),
            String(row.readyToSendDigestCount),
            String(row.teacherReviewDigestCount),
            String(row.heldWithdrawnDigestCount),
            String(row.actionCount),
            String(row.highPriorityActionCount),
            String(row.completedActionCount),
            row.nextActionDueAt ?? 'n/a',
            row.weeklySummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Weekly Digest Rows',
      '',
      '| Digest | Week | Student | Audience | Status | Parent visible | Progress | Attendance | Assignments | Practice | Alerts | Actions | Certificate | Highlight | Risk |',
      '| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |',
      ...report.digestRows.map(
        (row) =>
          `| ${[
            row.digestId,
            `${row.weekStart} to ${row.weekEnd}`,
            `${row.studentName} (${row.childProfileId})`,
            row.audience,
            row.deliveryStatus,
            row.parentVisible ? 'YES' : 'NO',
            `${row.progressStatus} ${row.completionPercent}%`,
            String(row.attendanceRatePercent),
            String(row.assignmentCompletionPercent),
            String(row.averagePracticeScorePercent),
            String(row.alertCount),
            String(row.actionCount),
            row.certificateStatus,
            row.highlight,
            row.riskSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Action Rows',
      '',
      '| Action | Student | Owner | Priority | Status | Due at | Alert | Recognition | Summary |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.actionRows.map(
        (row) =>
          `| ${[
            row.actionId,
            `${row.studentName} (${row.childProfileId})`,
            row.owner,
            row.priority,
            row.status,
            row.dueAt,
            row.sourceAlertId ?? 'n/a',
            row.sourceRecognitionSummaryId ?? 'n/a',
            row.actionSummary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toFollowUpActionOutcomeMarkdown(
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

  toRemedialRetryCompletionSupportOutcomeFollowupMarkdown(
    report: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      `Endpoint: ${report.endpointPath}`,
      '',
      '## Safety',
      '',
      '- Fixture-only local demo data.',
      '- production_ready=false',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- aiProviderExecutionUsed=false',
      '- paymentProviderUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realParentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
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
      '- realParentGuardianMutationUsed=false',
      '- realScreenTimePolicyMutationUsed=false',
      '- realLearningSessionGateMutationUsed=false',
      '- realScreenTimeGrantMutationUsed=false',
      '- realDailyPlanAccessMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realLearningSessionCompletionMutationUsed=false',
      '- realParentProgressSummaryMutationUsed=false',
      '- realTeacherProgressSummaryMutationUsed=false',
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
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Totals',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Teachers: ${report.totals.teacherCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Support plan references: ${report.totals.supportPlanReferenceCount}`,
      `- Remedial assignment references: ${report.totals.remedialAssignmentReferenceCount}`,
      `- Remedial retry completions: ${report.totals.remedialRetryCompletionCount}`,
      `- Support outcome evidence rows: ${report.totals.supportOutcomeEvidenceCount}`,
      `- Parent-visible follow-up summaries: ${report.totals.parentVisibleFollowupSummaryCount}`,
      `- Teacher-visible follow-up summaries: ${report.totals.teacherVisibleFollowupSummaryCount}`,
      `- Safe next actions: ${report.totals.safeNextActionCount}`,
      `- Stable traces: ${report.totals.stableTraceCount}`,
      `- Complete retry links: ${report.totals.retryLinksCompleteCount}`,
      `- Outcomes with deterministic status: ${report.totals.outcomesWithDeterministicStatusCount}`,
      `- Retries with deterministic status/score: ${report.totals.retriesWithDeterministicStatusScoreCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Retry Completion Rows',
      '',
      '| Retry completion | Student | Teacher | Support plan | Remedial assignment | Status | Score | Outcome | Parent summary | Teacher summary | Next action | Trace |',
      '| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |',
      ...report.retryCompletionRows.map(
        (row) =>
          `| ${[
            row.retryCompletionId,
            `${row.studentName} (${row.childProfileId})`,
            row.teacherName,
            row.supportPlanId,
            row.remedialAssignmentId,
            row.retryStatus,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            `${row.supportOutcomeId} / ${row.supportOutcomeStatus}`,
            row.parentFollowupSummaryId,
            row.teacherFollowupSummaryId,
            row.safeNextActionLabel,
            row.stableTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Support Outcome Rows',
      '',
      '| Outcome | Retry completion | Student | Status | Score | Visibility | Next action | Summary |',
      '| --- | --- | --- | --- | ---: | --- | --- | --- |',
      ...report.supportOutcomeRows.map(
        (row) =>
          `| ${[
            row.supportOutcomeId,
            row.retryCompletionId,
            `${row.studentName} (${row.childProfileId})`,
            row.status,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            `${row.parentVisible ? 'parent-visible' : 'parent-held'} / ${
              row.teacherVisible ? 'teacher-visible' : 'teacher-held'
            }`,
            row.safeNextActionLabel,
            row.outcomeSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Follow-up Summary Rows',
      '',
      '| Parent summary | Parent | Student | Status | Score | Next action | Summary |',
      '| --- | --- | --- | --- | ---: | --- | --- |',
      ...report.parentFollowupSummaryRows.map(
        (row) =>
          `| ${[
            row.parentFollowupSummaryId,
            `${row.parentGuardianName} (${row.parentGuardianEmail})`,
            `${row.studentName} (${row.childProfileId})`,
            `${row.retryStatus} / ${row.supportOutcomeStatus}`,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            row.safeNextActionLabel,
            row.summary,
          ].join(' | ')} |`,
      ),
      '',
      '## Teacher Follow-up Summary Rows',
      '',
      '| Teacher summary | Teacher | Student | Status | Score | Next action | Summary |',
      '| --- | --- | --- | --- | ---: | --- | --- |',
      ...report.teacherFollowupSummaryRows.map(
        (row) =>
          `| ${[
            row.teacherFollowupSummaryId,
            `${row.teacherName} (${row.teacherEmail})`,
            `${row.studentName} (${row.childProfileId})`,
            `${row.retryStatus} / ${row.supportOutcomeStatus}`,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            row.safeNextActionLabel,
            row.summary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toRemedialRetryUnresolvedSupportEscalationMarkdown(
    report: DemoLearningRemedialRetryUnresolvedSupportEscalationReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      `Endpoint: ${report.endpointPath}`,
      '',
      '## Safety',
      '',
      '- Fixture-only local demo data.',
      '- production_ready=false',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- aiProviderExecutionUsed=false',
      '- paymentProviderUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realParentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
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
      '- realParentGuardianMutationUsed=false',
      '- realScreenTimePolicyMutationUsed=false',
      '- realLearningSessionGateMutationUsed=false',
      '- realScreenTimeGrantMutationUsed=false',
      '- realDailyPlanAccessMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realLearningSessionCompletionMutationUsed=false',
      '- realParentProgressSummaryMutationUsed=false',
      '- realTeacherProgressSummaryMutationUsed=false',
      '- realParentMessageMutationUsed=false',
      '- realTeacherInterventionMutationUsed=false',
      '- realTeacherInterventionReviewMutationUsed=false',
      '- realRemedialAssignmentMutationUsed=false',
      '- realSupportPlanMutationUsed=false',
      '- realParentSupportSummaryMutationUsed=false',
      '- realTeacherNextActionMutationUsed=false',
      '- realRemedialRetryUnresolvedAttemptMutationUsed=false',
      '- realUnresolvedSupportOutcomeMutationUsed=false',
      '- realTeacherEscalationMutationUsed=false',
      '- realSupportAdjustmentMutationUsed=false',
      '- realParentEscalationSummaryMutationUsed=false',
      '- realTeacherEscalationNextActionMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Totals',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Teachers: ${report.totals.teacherCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Support plan references: ${report.totals.supportPlanReferenceCount}`,
      `- Remedial assignment references: ${report.totals.remedialAssignmentReferenceCount}`,
      `- Remedial retry attempts: ${report.totals.remedialRetryAttemptCount}`,
      `- Failed or incomplete retries: ${report.totals.failedOrIncompleteRetryCount}`,
      `- Unresolved support outcomes: ${report.totals.unresolvedSupportOutcomeCount}`,
      `- Teacher escalations: ${report.totals.teacherEscalationCount}`,
      `- Support adjustments: ${report.totals.supportAdjustmentCount}`,
      `- Parent-visible escalation summaries: ${report.totals.parentVisibleEscalationSummaryCount}`,
      `- Teacher-visible escalation next actions: ${report.totals.teacherVisibleEscalationNextActionCount}`,
      `- Safe next actions: ${report.totals.safeNextActionCount}`,
      `- Stable traces: ${report.totals.stableTraceCount}`,
      `- Complete unresolved retry links: ${report.totals.unresolvedRetryLinksCompleteCount}`,
      `- Outcomes with deterministic status/reason/action: ${report.totals.outcomesWithDeterministicStatusReasonActionCount}`,
      `- Attempts with deterministic status/score: ${report.totals.attemptsWithDeterministicStatusScoreCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Retry Attempt Rows',
      '',
      '| Retry attempt | Student | Teacher | Support plan | Remedial assignment | Status | Reason | Score | Outcome | Escalation | Next action | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |',
      ...report.retryAttemptRows.map(
        (row) =>
          `| ${[
            row.retryAttemptId,
            `${row.studentName} (${row.childProfileId})`,
            row.teacherName,
            row.supportPlanId,
            row.remedialAssignmentId,
            row.retryStatus,
            row.reasonCode,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            `${row.unresolvedOutcomeId} / ${row.unresolvedOutcomeStatus}`,
            `${row.teacherEscalationId} / ${row.supportAdjustmentId}`,
            row.safeNextActionLabel,
            row.stableTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Unresolved Outcome Rows',
      '',
      '| Outcome | Retry attempt | Student | Status | Reason | Score | Visibility | Next action | Summary |',
      '| --- | --- | --- | --- | --- | ---: | --- | --- | --- |',
      ...report.unresolvedOutcomeRows.map(
        (row) =>
          `| ${[
            row.unresolvedOutcomeId,
            row.retryAttemptId,
            `${row.studentName} (${row.childProfileId})`,
            row.status,
            row.reasonCode,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            `${row.parentVisible ? 'parent-visible' : 'parent-held'} / ${
              row.teacherVisible ? 'teacher-visible' : 'teacher-held'
            }`,
            row.safeNextActionLabel,
            row.outcomeSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Teacher Escalation Rows',
      '',
      '| Escalation | Support adjustment | Teacher | Student | Status | Reason | Next action | Summary |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.teacherEscalationRows.map(
        (row) =>
          `| ${[
            row.teacherEscalationId,
            row.supportAdjustmentId,
            `${row.teacherName} (${row.teacherEmail})`,
            `${row.studentName} (${row.childProfileId})`,
            `${row.escalationStatus} / ${row.supportAdjustmentStatus}`,
            row.reasonCode,
            row.safeNextActionLabel,
            `${row.escalationSummary} ${row.supportAdjustmentSummary}`,
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Escalation Summary Rows',
      '',
      '| Parent summary | Parent | Student | Status | Reason | Score | Next action | Summary |',
      '| --- | --- | --- | --- | --- | ---: | --- | --- |',
      ...report.parentEscalationSummaryRows.map(
        (row) =>
          `| ${[
            row.parentEscalationSummaryId,
            `${row.parentGuardianName} (${row.parentGuardianEmail})`,
            `${row.studentName} (${row.childProfileId})`,
            `${row.retryStatus} / ${row.unresolvedOutcomeStatus}`,
            row.reasonCode,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            row.safeNextActionLabel,
            row.summary,
          ].join(' | ')} |`,
      ),
      '',
      '## Teacher Escalation Next Action Rows',
      '',
      '| Teacher next action | Teacher | Student | Status | Reason | Next action | Summary |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...report.teacherEscalationNextActionRows.map(
        (row) =>
          `| ${[
            row.teacherEscalationNextActionId,
            `${row.teacherName} (${row.teacherEmail})`,
            `${row.studentName} (${row.childProfileId})`,
            `${row.retryStatus} / ${row.unresolvedOutcomeStatus}`,
            row.reasonCode,
            row.safeNextActionLabel,
            row.summary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toTeacherEscalationFollowupResolutionMarkdown(
    report: DemoLearningTeacherEscalationFollowupResolutionReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      `Endpoint: ${report.endpointPath}`,
      `JSON export: ${report.jsonExportPath}`,
      `Markdown export: ${report.markdownExportPath}`,
      `Dashboard: ${report.dashboardEvidencePath}`,
      '',
      '## Safety',
      '',
      '- Fixture-only local demo data.',
      '- production_ready=false',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- aiProviderExecutionUsed=false',
      '- paymentProviderUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realParentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
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
      '- realParentGuardianMutationUsed=false',
      '- realScreenTimePolicyMutationUsed=false',
      '- realLearningSessionGateMutationUsed=false',
      '- realScreenTimeGrantMutationUsed=false',
      '- realDailyPlanAccessMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realLearningSessionCompletionMutationUsed=false',
      '- realParentProgressSummaryMutationUsed=false',
      '- realTeacherProgressSummaryMutationUsed=false',
      '- realParentMessageMutationUsed=false',
      '- realTeacherInterventionMutationUsed=false',
      '- realTeacherInterventionReviewMutationUsed=false',
      '- realRemedialAssignmentMutationUsed=false',
      '- realSupportPlanMutationUsed=false',
      '- realParentSupportSummaryMutationUsed=false',
      '- realTeacherNextActionMutationUsed=false',
      '- realRemedialRetryUnresolvedAttemptMutationUsed=false',
      '- realUnresolvedSupportOutcomeMutationUsed=false',
      '- realTeacherEscalationMutationUsed=false',
      '- realSupportAdjustmentMutationUsed=false',
      '- realParentEscalationSummaryMutationUsed=false',
      '- realTeacherEscalationNextActionMutationUsed=false',
      '- realTeacherReviewedEscalationMutationUsed=false',
      '- realAdjustedSupportRetryCompletionMutationUsed=false',
      '- realResolvedSupportOutcomeMutationUsed=false',
      '- realParentClosureSummaryMutationUsed=false',
      '- realTeacherClosureNoteMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Totals',
      '',
      `- Students: ${report.totals.studentCount}`,
      `- Teachers: ${report.totals.teacherCount}`,
      `- Courses: ${report.totals.courseCount}`,
      `- Unresolved escalation references: ${report.totals.unresolvedEscalationReferenceCount}`,
      `- Teacher-reviewed escalations: ${report.totals.teacherReviewedEscalationCount}`,
      `- Adjusted support retry completions: ${report.totals.adjustedSupportRetryCompletionCount}`,
      `- Resolved support outcomes: ${report.totals.resolvedSupportOutcomeCount}`,
      `- Parent-visible closure summaries: ${report.totals.parentVisibleClosureSummaryCount}`,
      `- Teacher-visible closure notes: ${report.totals.teacherVisibleClosureNoteCount}`,
      `- Safe next actions: ${report.totals.safeNextActionCount}`,
      `- Stable traces: ${report.totals.stableTraceCount}`,
      `- Complete resolved flow links: ${report.totals.resolvedFlowLinksCompleteCount}`,
      `- Outcomes with deterministic status/reason/action: ${report.totals.outcomesWithDeterministicStatusReasonActionCount}`,
      `- Adjusted retries with deterministic status/score: ${report.totals.adjustedRetriesWithDeterministicStatusScoreCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Resolution Rows',
      '',
      '| Resolution | Student | Teacher | Unresolved escalation | Adjusted retry | Resolved outcome | Closures | Next action | Trace |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.resolutionRows.map(
        (row) =>
          `| ${[
            row.resolutionId,
            `${row.studentName} (${row.childProfileId})`,
            `${row.teacherName} (${row.teacherEmail})`,
            `${row.unresolvedRetryAttemptId} / ${row.unresolvedOutcomeId} / ${row.supportAdjustmentId}`,
            `${row.adjustedSupportRetryCompletionId} / ${row.adjustedSupportRetryStatus} / ${row.scorePercent}%`,
            `${row.resolvedSupportOutcomeId} / ${row.resolvedSupportOutcomeStatus} / ${row.resolvedOutcomeReasonCode}`,
            `${row.parentClosureSummaryId} / ${row.teacherClosureNoteId}`,
            row.safeNextActionLabel,
            row.stableTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Teacher Reviewed Escalation Rows',
      '',
      '| Review | Escalation | Teacher | Student | Status | Next action | Summary |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...report.teacherReviewedEscalationRows.map(
        (row) =>
          `| ${[
            row.teacherReviewedEscalationId,
            `${row.teacherEscalationId} / ${row.supportAdjustmentId}`,
            `${row.teacherName} (${row.teacherEmail})`,
            `${row.studentName} (${row.childProfileId})`,
            row.reviewStatus,
            row.safeNextActionLabel,
            row.summary,
          ].join(' | ')} |`,
      ),
      '',
      '## Adjusted Support Retry Completion Rows',
      '',
      '| Adjusted retry | Student | Support adjustment | Status | Score | Outcome | Summary |',
      '| --- | --- | --- | --- | ---: | --- | --- |',
      ...report.adjustedSupportRetryCompletionRows.map(
        (row) =>
          `| ${[
            row.adjustedSupportRetryCompletionId,
            `${row.studentName} (${row.childProfileId})`,
            row.supportAdjustmentId,
            row.retryStatus,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            row.resolvedSupportOutcomeId,
            row.summary,
          ].join(' | ')} |`,
      ),
      '',
      '## Resolved Outcome Rows',
      '',
      '| Outcome | Adjusted retry | Student | Status | Reason | Score | Visibility | Next action | Summary |',
      '| --- | --- | --- | --- | --- | ---: | --- | --- | --- |',
      ...report.resolvedSupportOutcomeRows.map(
        (row) =>
          `| ${[
            row.resolvedSupportOutcomeId,
            row.adjustedSupportRetryCompletionId,
            `${row.studentName} (${row.childProfileId})`,
            row.status,
            row.reasonCode,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            `${row.parentVisible ? 'parent-visible' : 'parent-held'} / ${
              row.teacherVisible ? 'teacher-visible' : 'teacher-held'
            }`,
            row.safeNextActionLabel,
            row.outcomeSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Parent Closure Summary Rows',
      '',
      '| Parent closure | Parent | Student | Status | Score | Next action | Summary |',
      '| --- | --- | --- | --- | ---: | --- | --- |',
      ...report.parentClosureSummaryRows.map(
        (row) =>
          `| ${[
            row.parentClosureSummaryId,
            `${row.parentGuardianName} (${row.parentGuardianEmail})`,
            `${row.studentName} (${row.childProfileId})`,
            `${row.resolvedOutcomeStatus} / ${row.resolvedOutcomeReasonCode}`,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            row.safeNextActionLabel,
            row.summary,
          ].join(' | ')} |`,
      ),
      '',
      '## Teacher Closure Note Rows',
      '',
      '| Teacher closure | Teacher | Student | Status | Score | Next action | Summary |',
      '| --- | --- | --- | --- | ---: | --- | --- |',
      ...report.teacherClosureNoteRows.map(
        (row) =>
          `| ${[
            row.teacherClosureNoteId,
            `${row.teacherName} (${row.teacherEmail})`,
            `${row.studentName} (${row.childProfileId})`,
            `${row.resolvedOutcomeStatus} / ${row.resolvedOutcomeReasonCode}`,
            `${row.scorePercent}% / ${row.completionPercent}%`,
            row.safeNextActionLabel,
            row.summary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toMvpEndToEndReadinessTraceMarkdown(
    report: DemoLearningMvpEndToEndReadinessTraceReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      `Endpoint: ${report.endpointPath}`,
      `JSON export: ${report.jsonExportPath}`,
      `Markdown export: ${report.markdownExportPath}`,
      `Dashboard: ${report.dashboardEvidencePath}`,
      '',
      '## Safety',
      '',
      '- Fixture-only local demo data.',
      '- production_ready=false',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- aiProviderExecutionUsed=false',
      '- paymentProviderUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realStudentMutationUsed=false',
      '- realCourseMutationUsed=false',
      '- realEnrollmentMutationUsed=false',
      '- realSubscriptionMutationUsed=false',
      '- realLearningMutationUsed=false',
      '- realTeacherInterventionMutationUsed=false',
      '- realRemedialRetryUnresolvedAttemptMutationUsed=false',
      '- realTeacherEscalationMutationUsed=false',
      '- realTeacherReviewedEscalationMutationUsed=false',
      '- realAdjustedSupportRetryCompletionMutationUsed=false',
      '- realResolvedSupportOutcomeMutationUsed=false',
      '- realParentClosureSummaryMutationUsed=false',
      '- realTeacherClosureNoteMutationUsed=false',
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
      `- Enrollment/subscription links: ${report.totals.enrollmentOrSubscriptionCount}`,
      `- Payment/refund/commission fixture evidence: ${report.totals.paymentRefundCommissionFixtureEvidenceCount}`,
      `- Entitlement/daily plan evidence: ${report.totals.entitlementOrDailyPlanCount}`,
      `- Practice progress/completion evidence: ${report.totals.practiceProgressOrCompletionCount}`,
      `- Parent/teacher report evidence: ${report.totals.parentTeacherReportCount}`,
      `- Permission/redaction evidence: ${report.totals.permissionRedactionEvidenceCount}`,
      `- Approved delivery/read receipt evidence: ${report.totals.approvedDeliveryOrReadReceiptCount}`,
      `- Aligned approved delivery student/course path rows: ${report.totals.alignedApprovedDeliveryStudentCoursePathCount}`,
      `- Screen-time guard evidence: ${report.totals.screenTimeGuardEvidenceCount}`,
      `- Teacher intervention evidence: ${report.totals.teacherInterventionEvidenceCount}`,
      `- Remedial retry/escalation evidence: ${report.totals.remedialRetryOrEscalationEvidenceCount}`,
      `- Escalation resolution evidence: ${report.totals.escalationResolutionEvidenceCount}`,
      `- Stable end-to-end traces: ${report.totals.stableEndToEndTraceCount}`,
      `- Deterministic status/reason/action/owner rows: ${report.totals.deterministicStatusReasonActionOwnerCount}`,
      `- Same student/course path rows: ${report.totals.sameStudentCoursePathCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Trace Rows',
      '',
      '| Trace | Student | Course | Enrollment/subscription | Entitlement/daily plan | Practice | Reporting/privacy | Read receipt | Guard | Intervention | Retry/escalation | Resolution | Status | Owner | Trace key |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.traceRows.map(
        (row) =>
          `| ${[
            row.traceId,
            `${row.studentName} (${row.childProfileId})`,
            `${row.courseCode} (${row.courseId})`,
            `${row.enrollmentId} / ${row.subscriptionId} / ${row.paymentId}`,
            `${row.entitlementId} / ${row.dailyPlanId} / ${row.entitlementAccessStatus}`,
            `${row.practiceProgressRollupId} / ${row.practiceAttemptId} / ${row.practiceAttemptStatus} / ${row.practiceScorePercent}%`,
            `${row.parentTeacherReportSummaryId} / ${row.parentTeacherPermissionCaseId} / ${row.permissionRedactionEvidenceId}`,
            `${row.approvedDeliveryOrReadReceiptId} (${row.approvedDeliveryStudentId}/${row.approvedDeliveryCourseId})`,
            `${row.screenTimeGuardEvidenceId} / ${row.screenTimeAccessResult}`,
            `${row.teacherInterventionReviewId} / ${row.supportPlanId} / ${row.remedialAssignmentId}`,
            `${row.remedialRetryOrEscalationId} / ${row.unresolvedOutcomeId} / ${row.teacherEscalationId}`,
            `${row.escalationResolutionId} / ${row.resolvedSupportOutcomeId} / ${row.resolutionStatus}`,
            `${row.traceStatus}: ${row.reasonLabel}; ${row.actionLabel}`,
            row.ownerLabel,
            row.stableEndToEndTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join('<br>'),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toMvpRoleJourneyEntrypointsMarkdown(
    report: DemoLearningMvpRoleJourneyEntrypointsReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      `Endpoint: ${report.endpointPath}`,
      `JSON export: ${report.jsonExportPath}`,
      `Markdown export: ${report.markdownExportPath}`,
      `Dashboard: ${report.dashboardEvidencePath}`,
      '',
      '## Safety',
      '',
      '- Fixture-only local demo data.',
      '- production_ready=false',
      '- productionDbUsed=false',
      '- noProductionDbRead=true',
      '- providerApiUsed=false',
      '- aiProviderExecutionUsed=false',
      '- paymentProviderUsed=false',
      '- notificationProviderUsed=false',
      '- liveAdsExecuted=false',
      '- realLearningMutationUsed=false',
      '- realTeacherInterventionMutationUsed=false',
      '- realParentMessageMutationUsed=false',
      '- realPaymentMutationUsed=false',
      '- realRefundMutationUsed=false',
      '- realCommissionMutationUsed=false',
      '- realErpMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Totals',
      '',
      `- Role entrypoints: ${report.totals.roleEntrypointCount}`,
      `- Student role entrypoints: ${report.totals.studentRoleEntrypointCount}`,
      `- Parent role entrypoints: ${report.totals.parentRoleEntrypointCount}`,
      `- Teacher role entrypoints: ${report.totals.teacherRoleEntrypointCount}`,
      `- Admin/operator role entrypoints: ${report.totals.adminRoleEntrypointCount}`,
      `- Stable role journey traces: ${report.totals.stableRoleJourneyTraceCount}`,
      `- Same student/course path rows: ${report.totals.sameStudentCoursePathCount}`,
      `- Linked MVP readiness trace rows: ${report.totals.linkedMvpReadinessTraceCount}`,
      `- Linked parent read receipt rows: ${report.totals.linkedParentReadReceiptCount}`,
      `- Linked teacher escalation resolution rows: ${report.totals.linkedTeacherEscalationResolutionCount}`,
      `- Deterministic status/reason/action/owner rows: ${report.totals.deterministicStatusReasonActionOwnerCount}`,
      `- Route/anchor/action/status label rows: ${report.totals.routeAnchorActionStatusLabelCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Role Entrypoint Rows',
      '',
      '| Entrypoint | Role | Student | Course | Route | Dashboard anchor | Action | Status | Reason | Owner | Linked evidence | Trace key |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.entrypointRows.map(
        (row) =>
          `| ${[
            row.roleEntrypointId,
            `${row.roleLabel} (${row.role})`,
            `${row.studentName} (${row.childProfileId})`,
            `${row.courseCode} (${row.courseId})`,
            `${row.routeLabel}: ${row.routePath}`,
            `${row.anchorLabel}: ${row.dashboardAnchor}`,
            row.actionLabel,
            row.statusLabel,
            row.reasonLabel,
            row.ownerLabel,
            [
              row.mvpReadinessTraceId,
              row.parentInboxItemId,
              row.parentReadReceiptEvidenceId,
              row.screenTimeGuardEvidenceId,
              row.teacherInterventionReviewId,
              row.remedialAssignmentId,
              row.remedialRetryOrEscalationId,
              row.teacherEscalationResolutionId,
            ].join('<br>'),
            row.stableRoleJourneyTraceKey,
          ].join(' | ')} |`,
      ),
      '',
      '## Stable Trace Rows',
      '',
      '| Trace | Student/course | Roles | MVP trace | Parent read receipt | Teacher resolution | Status | Action | Summary |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.stableTraceRows.map(
        (row) =>
          `| ${[
            row.stableRoleJourneyTraceId,
            `${row.studentId} / ${row.courseId} / ${row.learningPathId}`,
            row.roleLabels.join('<br>'),
            row.mvpReadinessTraceId,
            row.parentReadReceiptEvidenceId,
            row.teacherEscalationResolutionId,
            `${row.traceStatus}: ${row.reasonLabel}`,
            row.actionLabel,
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
      '## Evidence Rows',
      '',
      '| Evidence | Count | IDs | Summary |',
      '| --- | ---: | --- | --- |',
      ...report.evidenceRows.map(
        (row) =>
          `| ${[
            row.evidenceKind,
            String(row.evidenceCount),
            row.stableFixtureIds.join('<br>'),
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toMvpReadinessOverviewMarkdown(
    report: DemoLearningMvpReadinessOverviewReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      'Overview endpoint: /v1/learning-local-demo/mvp-readiness-overview-report',
      '',
      '## Safety',
      '',
      '- Fixture-only local demo data.',
      '- production_ready=false',
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
      '- realTeacherReviewedEscalationMutationUsed=false',
      '- realAdjustedSupportRetryCompletionMutationUsed=false',
      '- realResolvedSupportOutcomeMutationUsed=false',
      '- realParentClosureSummaryMutationUsed=false',
      '- realTeacherClosureNoteMutationUsed=false',
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
      `- MVP readiness slices: ${report.totals.sliceCount}`,
      `- Local-demo ready slices: ${report.totals.localDemoReadySliceCount}`,
      `- Needs local-demo fix slices: ${report.totals.needsLocalDemoFixSliceCount}`,
      `- Production-ready slices: ${report.totals.productionReadySliceCount}`,
      `- Readiness score: ${report.totals.readinessScorePercent}%`,
      `- Evidence endpoints: ${report.totals.evidenceEndpointCount}`,
      `- JSON exports: ${report.totals.jsonExportCount}`,
      `- Markdown exports: ${report.totals.markdownExportCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Students: ${report.totals.studentCount}`,
      `- Enrollments: ${report.totals.enrollmentCount}`,
      `- Subscriptions: ${report.totals.subscriptionCount}`,
      `- Refund rows: ${report.totals.refundCount}`,
      `- Commission rows: ${report.totals.commissionCount}`,
      `- Daily plans: ${report.totals.dailyPlanCount}`,
      `- Lessons: ${report.totals.lessonCount}`,
      `- Assignments: ${report.totals.assignmentCount}`,
      `- Progress records: ${report.totals.progressRecordCount}`,
      `- AI tutor chat sessions: ${report.totals.aiTutorChatSessionCount}`,
      `- Achievement records: ${report.totals.achievementRecordCount}`,
      `- Teacher intervention reviews: ${report.totals.teacherInterventionReviewCount}`,
      `- Remedial assignments: ${report.totals.remedialAssignmentCount}`,
      `- Support plans: ${report.totals.supportPlanCount}`,
      `- Remedial retry completions: ${report.totals.remedialRetryCompletionCount}`,
      `- Support outcome evidence rows: ${report.totals.supportOutcomeEvidenceCount}`,
      `- Unresolved remedial retry attempts: ${report.totals.remedialRetryUnresolvedAttemptCount}`,
      `- Unresolved support outcome rows: ${report.totals.unresolvedSupportOutcomeCount}`,
      `- Teacher escalations: ${report.totals.teacherEscalationCount}`,
      `- Parent escalation summaries: ${report.totals.parentVisibleEscalationSummaryCount}`,
      `- Teacher escalation next actions: ${report.totals.teacherVisibleEscalationNextActionCount}`,
      `- Teacher-reviewed escalations: ${report.totals.teacherReviewedEscalationCount}`,
      `- Adjusted retry completions: ${report.totals.adjustedSupportRetryCompletionCount}`,
      `- Resolved support outcomes: ${report.totals.resolvedSupportOutcomeCount}`,
      `- Parent closure summaries: ${report.totals.parentVisibleClosureSummaryCount}`,
      `- Teacher closure notes: ${report.totals.teacherVisibleClosureNoteCount}`,
      `- Stable end-to-end traces: ${report.totals.stableEndToEndTraceCount}`,
      `- Weekly digests: ${report.totals.weeklyDigestCount}`,
      `- Follow-up outcomes: ${report.totals.followUpOutcomeCount}`,
      '',
      '## MVP Readiness Rows',
      '',
      '| Slice | Status | Primary metric | Secondary metric | Coverage | Endpoint | Exports | Evidence | Risk note |',
      '| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- |',
      ...report.rows.map(
        (row) =>
          `| ${[
            `${row.sliceName} (${row.sliceKey})`,
            row.readinessStatus,
            `${row.primaryMetricValue} ${row.primaryMetricLabel}`,
            `${row.secondaryMetricValue} ${row.secondaryMetricLabel}`,
            `${row.coverageValue} ${row.coverageLabel}`,
            row.sourceEndpointPath,
            `${row.jsonExportPath}; ${row.markdownExportPath}`,
            row.evidenceSummary,
            row.riskNote,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toAcceptanceTraceabilityGateMarkdown(
    report: DemoLearningAcceptanceTraceabilityGateReport,
  ) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      'Traceability endpoint: /v1/learning-local-demo/acceptance-traceability-gate-report',
      '',
      '## Safety',
      '',
      '- Fixture-only local demo data.',
      '- production_ready=false',
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
      '- realTeacherReviewedEscalationMutationUsed=false',
      '- realAdjustedSupportRetryCompletionMutationUsed=false',
      '- realResolvedSupportOutcomeMutationUsed=false',
      '- realParentClosureSummaryMutationUsed=false',
      '- realTeacherClosureNoteMutationUsed=false',
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
      `- MVP readiness slices: ${report.totals.sliceCount}`,
      `- Acceptance criteria: ${report.totals.acceptanceCriterionCount}`,
      `- Mapped criteria: ${report.totals.mappedCriterionCount}`,
      `- Slices with mapping: ${report.totals.slicesWithMappingCount}`,
      `- Slices missing mapping: ${report.totals.slicesMissingMappingCount}`,
      `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
      `- Fixture-only criteria: ${report.totals.fixtureOnlyCriterionCount}`,
      `- Safety-closed criteria: ${report.totals.safetyClosedCriterionCount}`,
      `- Evidence endpoints: ${report.totals.evidenceEndpointCount}`,
      `- JSON exports: ${report.totals.jsonExportCount}`,
      `- Markdown exports: ${report.totals.markdownExportCount}`,
      `- Dashboard evidence paths: ${report.totals.dashboardEvidenceCount}`,
      `- Seed commands: ${report.totals.seedCommandCount}`,
      `- Report commands: ${report.totals.reportCommandCount}`,
      `- Test commands: ${report.totals.testCommandCount}`,
      `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
      `- Open safety gates: ${report.totals.openSafetyGateCount}`,
      '',
      '## Acceptance Traceability Rows',
      '',
      '| Criterion | Slice | Current status | Endpoint | Exports | Dashboard | Commands | Safety gates | Remaining local-demo note | Evidence |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.rows.map(
        (row) =>
          `| ${[
            `${row.acceptanceCriterionId} ${row.acceptanceCriterionName}`,
            `${row.sliceName} (${row.sliceKey})`,
            `${row.acceptanceStatus} / ${row.readinessStatus}`,
            row.evidenceEndpointPath,
            `${row.jsonExportPath}; ${row.markdownExportPath}`,
            row.dashboardEvidencePath,
            `${row.seedCommand}; ${row.reportCommand}; ${row.testCommand}`,
            row.safetyGatesCovered.join('<br>'),
            row.remainingLocalDemoNote,
            row.evidenceSummary,
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  private buildTeacherContentParentSummaryRows(
    studentVisibilityRows: DemoLearningTeacherContentStudentVisibilityRow[],
    contentItemsById: Map<string, DemoLearningContentLibraryItem>,
  ): DemoLearningTeacherContentParentSummaryRow[] {
    const rowsByParentStudent = this.groupBy(
      studentVisibilityRows,
      (row) => `${row.parentGuardianId}|${row.studentId}`,
    );
    const parentRows: DemoLearningTeacherContentParentSummaryRow[] = [];

    for (const rows of rowsByParentStudent.values()) {
      const parentVisibleRows = rows.filter((row) => row.parentVisible);
      if (parentVisibleRows.length === 0) {
        continue;
      }

      const first = rows[0];
      const blockedRows = rows.filter((row) => !row.studentVisible);
      const itemsNeedingTeacherReviewCount = new Set(
        blockedRows
          .filter(
            (row) =>
              contentItemsById.get(row.contentItemId)?.needsTeacherReview,
          )
          .map((row) => row.contentItemId),
      ).size;
      const courseCodes = [...new Set(rows.map((row) => row.courseCode))].sort(
        (left, right) => left.localeCompare(right),
      );
      const classCodes = [...new Set(rows.map((row) => row.classCode))].sort(
        (left, right) => left.localeCompare(right),
      );
      const nextAvailableDailyPlanDate =
        parentVisibleRows
          .map((row) => row.planDate)
          .sort((left, right) => left.localeCompare(right))[0] ?? null;

      parentRows.push({
        parentGuardianId: first.parentGuardianId,
        parentGuardianName: first.parentGuardianName,
        studentId: first.studentId,
        childProfileId: first.childProfileId,
        studentName: first.studentName,
        courseCodes,
        classCodes,
        parentVisibleItemCount: parentVisibleRows.length,
        blockedItemCount: blockedRows.length,
        itemsNeedingTeacherReviewCount,
        nextAvailableDailyPlanDate,
        summary:
          blockedRows.length > 0
            ? `${first.studentName} has ${parentVisibleRows.length} parent-visible content items and ${blockedRows.length} blocked draft or archived item for teacher review.`
            : `${first.studentName} has ${parentVisibleRows.length} parent-visible content items ready in the synthetic learning path.`,
      });
    }

    return parentRows.sort((left, right) =>
      [left.studentName, left.parentGuardianName, left.studentId]
        .join('|')
        .localeCompare(
          [right.studentName, right.parentGuardianName, right.studentId].join(
            '|',
          ),
        ),
    );
  }

  private buildTeacherContentLibraryLearningPathPublishStatusCounts(
    fixture: DemoLearningCoreFixture,
  ): DemoLearningTeacherContentLibraryStatusCounts {
    return {
      ownerRole: this.countByStatus(
        contentOwnerRoles,
        fixture.contentOwners,
        (owner) => owner.role,
      ),
      assetKind: this.countByStatus(
        contentAssetKinds,
        fixture.contentLibraryItems,
        (item) => item.assetKind,
      ),
      publishStatus: this.countByStatus(
        contentPublishStatuses,
        fixture.contentLibraryItems,
        (item) => item.publishStatus,
      ),
      classAssignmentStatus: this.countByStatus(
        contentClassAssignmentStatuses,
        fixture.contentClassAssignments,
        (assignment) => assignment.assignmentStatus,
      ),
      studentVisibilityStatus: this.countByStatus(
        contentStudentVisibilityStatuses,
        fixture.contentStudentVisibilities,
        (visibility) => visibility.visibilityStatus,
      ),
    };
  }

  private buildAiTutorChatSafetyTeacherReviewStatusCounts(
    fixture: DemoLearningCoreFixture,
  ): DemoLearningAiTutorChatSafetyTeacherReviewStatusCounts {
    return {
      sessionStatus: this.countByStatus(
        aiTutorChatSessionStatuses,
        fixture.aiTutorChatSessions,
        (session) => session.status,
      ),
      messageRole: this.countByStatus(
        aiTutorMessageRoles,
        fixture.aiTutorChatMessages,
        (message) => message.role,
      ),
      guardDecision: this.countByStatus(
        aiTutorGuardDecisions,
        fixture.aiTutorChatMessages,
        (message) => message.guardDecision,
      ),
      topicCategory: this.countByStatus(
        aiTutorTopicCategories,
        fixture.aiTutorChatMessages,
        (message) => message.topicCategory,
      ),
      safetySeverity: this.countByStatus(
        aiTutorSafetySeverities,
        fixture.aiTutorSafetyFlags,
        (flag) => flag.severity,
      ),
      teacherReviewStatus: this.countByStatus(
        aiTutorTeacherReviewStatuses,
        fixture.aiTutorTeacherReviewItems,
        (item) => item.status,
      ),
      supportPriority: this.countByStatus(
        aiTutorSupportPriorities,
        fixture.aiTutorSupportRecommendations,
        (recommendation) => recommendation.priority,
      ),
      supportRecommendationStatus: this.countByStatus(
        aiTutorSupportRecommendationStatuses,
        fixture.aiTutorSupportRecommendations,
        (recommendation) => recommendation.status,
      ),
    };
  }

  private buildStudentAchievementBadgeCertificateStatusCounts(
    fixture: DemoLearningCoreFixture,
  ): DemoLearningStudentAchievementBadgeCertificateStatusCounts {
    return {
      achievementKind: this.countByStatus(
        achievementKinds,
        fixture.achievementRecords,
        (record) => record.achievementKind,
      ),
      badgeAwardStatus: this.countByStatus(
        badgeAwardStatuses,
        fixture.badgeAwards,
        (badge) => badge.status,
      ),
      certificateStatus: this.countByStatus(
        certificateFixtureStatuses,
        fixture.certificateFixtures,
        (certificate) => certificate.status,
      ),
      milestoneStatus: this.countByStatus(
        milestoneStatuses,
        fixture.milestones,
        (milestone) => milestone.status,
      ),
      recognitionAudience: this.countByStatus(
        recognitionAudiences,
        fixture.recognitionSummaries,
        (recognition) => recognition.audience,
      ),
      recognitionStatus: this.countByStatus(
        recognitionStatuses,
        fixture.recognitionSummaries,
        (recognition) => recognition.status,
      ),
    };
  }

  private buildParentTeacherWeeklyDigestStatusCounts(
    fixture: DemoLearningCoreFixture,
  ): DemoLearningParentTeacherWeeklyDigestStatusCounts {
    return {
      audience: this.countByStatus(
        weeklyDigestAudiences,
        fixture.weeklyDigests,
        (digest) => digest.audience,
      ),
      deliveryStatus: this.countByStatus(
        weeklyDigestDeliveryStatuses,
        fixture.weeklyDigests,
        (digest) => digest.deliveryStatus,
      ),
      actionPriority: this.countByStatus(
        weeklyDigestActionPriorities,
        fixture.weeklyDigestActions,
        (action) => action.priority,
      ),
      actionStatus: this.countByStatus(
        weeklyDigestActionStatuses,
        fixture.weeklyDigestActions,
        (action) => action.status,
      ),
      actionOwner: this.countByStatus(
        weeklyDigestActionOwners,
        fixture.weeklyDigestActions,
        (action) => action.owner,
      ),
    };
  }

  private buildFollowUpActionOutcomeStatusCounts(
    rows: DemoLearningFollowUpActionOutcomeRow[],
  ): DemoLearningFollowUpActionOutcomeStatusCounts {
    return {
      outcomeStatus: this.countByStatus(
        followUpActionOutcomeStatuses,
        rows,
        (row) => row.outcomeStatus,
      ),
      impactBand: this.countByStatus(
        followUpActionOutcomeImpacts,
        rows,
        (row) => row.impactBand,
      ),
      actionOwner: this.countByStatus(
        weeklyDigestActionOwners,
        rows,
        (row) => row.actionOwner,
      ),
      actionPriority: this.countByStatus(
        weeklyDigestActionPriorities,
        rows,
        (row) => row.actionPriority,
      ),
    };
  }

  private buildWeeklyDigestStudentSummary(
    studentName: string,
    digestRows: DemoLearningParentTeacherWeeklyDigestRow[],
    actionRows: DemoLearningParentTeacherWeeklyDigestActionRow[],
  ) {
    const ready = digestRows.filter(
      (row) => row.deliveryStatus === 'READY_TO_SEND',
    ).length;
    const review = digestRows.filter(
      (row) => row.deliveryStatus === 'TEACHER_REVIEW',
    ).length;
    const held = digestRows.filter(
      (row) => row.deliveryStatus === 'HELD_WITHDRAWN',
    ).length;
    const highPriority = actionRows.filter(
      (row) => row.priority === 'HIGH',
    ).length;

    if (held > 0) {
      return `${studentName} has a teacher-only weekly digest held because the fixture enrollment is withdrawn.`;
    }

    if (review > 0) {
      return `${studentName} has ${review} digest pending teacher review and ${highPriority} high-priority action.`;
    }

    return `${studentName} has ${ready} parent-ready weekly digest and ${actionRows.length} fixture action.`;
  }

  private buildFollowUpActionOutcomeStudentSummary(
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

  private buildParentScreenTimeGateRow(input: {
    gate: DemoLearningSessionGate;
    dailyPlan: DemoLearningDailyPlan;
    guardian: DemoLearningParentGuardian;
    enrollment: DemoLearningEnrollment;
    student: DemoLearningStudent;
    course: DemoLearningCourse;
    classesById: Map<string, DemoLearningClassCohort>;
    lessonsById: Map<string, DemoLearningLesson>;
  }): DemoLearningParentScreenTimeGateRow {
    const classCohort = this.requireClass(
      input.classesById,
      input.dailyPlan.classId,
    );
    const lesson = this.requireLesson(
      input.lessonsById,
      input.dailyPlan.lessonId,
    );
    const safeDailyPlanAccess =
      input.gate.decision !== 'BLOCKED' &&
      input.gate.accessMode === 'SAFE_DAILY_PLAN';

    return {
      gateId: input.gate.id,
      dailyPlanId: input.dailyPlan.id,
      learningPathId: input.gate.learningPathId,
      enrollmentId: input.enrollment.id,
      studentId: input.student.id,
      childProfileId: input.student.childProfileId,
      studentName: input.student.displayName,
      guardianId: input.guardian.id,
      guardianName: input.guardian.displayName,
      courseId: input.course.id,
      courseCode: input.course.code,
      courseTitle: input.course.title,
      classId: classCohort.id,
      classCode: classCohort.code,
      teacherName: classCohort.teacherName,
      lessonId: lesson.id,
      lessonCode: lesson.code,
      dailyPlanTitle: input.dailyPlan.title,
      requestedAt: input.gate.requestedAt,
      requestedMinutes: input.gate.requestedMinutes,
      usedMinutesBeforeSession: input.gate.usedMinutesBeforeSession,
      sessionUsedMinutes: safeDailyPlanAccess ? input.gate.requestedMinutes : 0,
      decision: input.gate.decision,
      blockedReason: input.gate.blockedReason ?? 'NONE',
      decidedBy: input.gate.decidedBy,
      accessMode: input.gate.accessMode,
      safeDailyPlanAccess,
    };
  }

  private buildParentScreenTimeGrantRow(input: {
    grant: DemoLearningScreenTimeGrantRequest;
    guardian: DemoLearningParentGuardian;
    student: DemoLearningStudent;
  }): DemoLearningParentScreenTimeGrantRow {
    return {
      grantRequestId: input.grant.id,
      sessionGateId: input.grant.sessionGateId,
      guardianId: input.guardian.id,
      guardianName: input.guardian.displayName,
      studentId: input.student.id,
      childProfileId: input.student.childProfileId,
      studentName: input.student.displayName,
      requestedExtraMinutes: input.grant.requestedExtraMinutes,
      requestedAt: input.grant.requestedAt,
      decision: input.grant.decision,
      decidedAt: input.grant.decidedAt ?? null,
      grantedMinutes: input.grant.grantedMinutes,
      decisionReason: input.grant.decisionReason,
    };
  }

  private buildDailyPlanGuardBlockedReason(
    blockedReason: DemoLearningSessionGate['blockedReason'],
  ) {
    if (!blockedReason) {
      return null;
    }

    if (blockedReason === 'DAILY_LIMIT_EXCEEDED') {
      return 'Daily screen-time limit would be exceeded by the requested fixture learning session.';
    }

    if (blockedReason === 'GUARDIAN_DENIED_GRANT') {
      return 'Parent/guardian denied the fixture extra-time grant for this daily plan session.';
    }

    return 'Screen-time policy is disabled because the fixture enrollment is withdrawn.';
  }

  private buildDailyPlanGuardNextAction(input: {
    gate: DemoLearningSessionGate;
    grant: DemoLearningScreenTimeGrantRequest | null;
  }) {
    if (input.gate.decision === 'ALLOWED') {
      return 'Allow fixture session and continue read-only daily plan evidence';
    }

    if (input.gate.decision === 'OVERRIDE_ALLOWED') {
      return 'Allow fixture session through approved parent grant and keep the next session inside the daily plan window';
    }

    if (input.gate.blockedReason === 'DAILY_LIMIT_EXCEEDED') {
      return 'Keep blocked until the next fixture learning window or a reviewed parent grant';
    }

    if (input.gate.blockedReason === 'GUARDIAN_DENIED_GRANT') {
      return 'Keep blocked and schedule teacher/guardian review before retrying the daily plan';
    }

    if (input.gate.blockedReason === 'POLICY_DISABLED_WITHDRAWN') {
      return 'Keep blocked because the fixture enrollment is withdrawn';
    }

    if (input.grant?.decision === 'DENIED') {
      return 'Keep blocked after denied fixture parent grant';
    }

    return 'Keep blocked until a safe local-demo review clears the session';
  }

  private buildSessionCompletionPracticeProgressRollupStatus(input: {
    dailyPlan: DemoLearningDailyPlan;
    videoEvidence: DemoLearningVideoEvidence;
    practiceAttempt: DemoLearningPracticeAttempt;
    progress: DemoLearningProgressRecord;
  }): DemoLearningSessionCompletionPracticeProgressRollupStatus {
    if (
      input.dailyPlan.status === 'COMPLETED' &&
      input.videoEvidence.status === 'COMPLETED' &&
      input.practiceAttempt.status === 'PASSED' &&
      input.progress.completionPercent >= 80
    ) {
      return 'COMPLETED';
    }

    if (
      input.progress.status === 'NEEDS_SUPPORT' ||
      input.progress.status === 'WITHDRAWN' ||
      input.practiceAttempt.status === 'NEEDS_RETRY'
    ) {
      return 'NEEDS_SUPPORT';
    }

    if (
      input.dailyPlan.status === 'COMPLETED' ||
      input.videoEvidence.status === 'COMPLETED' ||
      input.practiceAttempt.status === 'PASSED'
    ) {
      return 'ON_TRACK';
    }

    return 'IN_PROGRESS';
  }

  private buildSessionCompletionPracticeProgressNextAction(input: {
    rollupStatus: DemoLearningSessionCompletionPracticeProgressRollupStatus;
    practiceScorePercent: number;
  }) {
    if (input.rollupStatus === 'COMPLETED') {
      return 'Show parent progress summary and open the next fixture daily plan';
    }

    if (input.rollupStatus === 'IN_PROGRESS') {
      return 'Complete the fixture lesson video before rolling up the next summary';
    }

    if (
      input.rollupStatus === 'NEEDS_SUPPORT' ||
      input.practiceScorePercent < 75
    ) {
      return 'Schedule teacher support before the next parent-visible progress update';
    }

    if (input.rollupStatus === 'ON_TRACK') {
      return 'Continue the next fixture practice item and monitor progress';
    }

    return 'Complete the fixture lesson video before rolling up the next summary';
  }

  private findRemedialDailyPlanForSupportPlan(
    dailyPlans: DemoLearningDailyPlan[],
    sourceDailyPlan: DemoLearningDailyPlan,
  ) {
    const nextBlockedOrSkippedPlan = dailyPlans
      .filter(
        (plan) =>
          plan.learningPathId === sourceDailyPlan.learningPathId &&
          plan.sequence > sourceDailyPlan.sequence &&
          (plan.status === 'BLOCKED' || plan.status === 'SKIPPED'),
      )
      .sort((left, right) => left.sequence - right.sequence)[0];

    return nextBlockedOrSkippedPlan ?? sourceDailyPlan;
  }

  private buildTeacherInterventionSupportReason(
    row: DemoLearningSessionCompletionPracticeProgressRollupRow,
  ) {
    if (row.progressStatus === 'NEEDS_SUPPORT') {
      return `${row.studentName} is at ${row.completionPercent}% course completion and needs teacher support before the next parent-visible update.`;
    }

    if (row.practiceScorePercent < 75) {
      return `${row.studentName} has a ${row.practiceScorePercent}% practice score and needs a remedial retry.`;
    }

    return `${row.studentName} needs teacher review because the progress rollup status is ${row.rollupStatus}.`;
  }

  private buildTeacherInterventionSafeNextAction(
    row: DemoLearningSessionCompletionPracticeProgressRollupRow,
  ) {
    if (row.progressStatus === 'NEEDS_SUPPORT') {
      return 'Schedule teacher-led remedial practice and share a parent-visible support summary';
    }

    if (row.practiceScorePercent < 75) {
      return 'Assign a fixture remedial retry before the next progress summary';
    }

    return 'Review the support plan before the next parent-visible progress update';
  }

  private buildParentScreenTimeGuardianControlsStatusCounts(
    fixture: DemoLearningCoreFixture,
  ): DemoLearningParentScreenTimeGuardianControlsStatusCounts {
    return {
      policyStatus: this.countByStatus(
        screenTimePolicyStatuses,
        fixture.screenTimePolicies,
        (policy) => policy.status,
      ),
      gateDecision: this.countByStatus(
        sessionGateDecisions,
        fixture.sessionGates,
        (gate) => gate.decision,
      ),
      grantDecision: this.countByStatus(
        screenTimeGrantDecisions,
        fixture.screenTimeGrantRequests,
        (grant) => grant.decision,
      ),
    };
  }

  private buildParentScreenTimeAttentionReason(input: {
    studentGates: DemoLearningSessionGate[];
    deniedGrantCount: number;
  }) {
    const blockedSessionCount = input.studentGates.filter(
      (gate) => gate.decision === 'BLOCKED',
    ).length;

    if (input.deniedGrantCount > 0) {
      return `${input.deniedGrantCount} denied grant and ${blockedSessionCount} blocked session gate rows need parent review.`;
    }

    return `${blockedSessionCount} blocked session gate rows need parent review.`;
  }

  private buildParentTeacherProgressAlertRows(
    context: ParentTeacherProgressAlertContext,
  ): DemoLearningParentTeacherProgressAlertRow[] {
    const rows: DemoLearningParentTeacherProgressAlertRow[] = [];
    const addAlert = (
      alertReason: DemoLearningProgressAlertReason,
      alertSeverity: DemoLearningProgressAlertSeverity,
      followUpStatus: DemoLearningProgressAlertFollowUpStatus,
      recommendedFollowUpAt: string,
    ) => {
      rows.push(
        this.buildParentTeacherProgressAlertRow({
          context,
          alertReason,
          alertSeverity,
          followUpStatus,
          recommendedFollowUpAt,
        }),
      );
    };

    if (
      context.pathStatus !== 'WITHDRAWN' &&
      context.missingSubmissionCount >= 2
    ) {
      addAlert(
        'MISSING_SUBMISSIONS',
        'HIGH',
        'OPEN',
        '2026-06-06T09:00:00.000Z',
      );
    }

    if (
      context.pathStatus !== 'WITHDRAWN' &&
      context.averagePracticeScorePercent > 0 &&
      context.averagePracticeScorePercent < 70
    ) {
      addAlert(
        'LOW_PRACTICE_SCORE',
        'HIGH',
        'SCHEDULED',
        '2026-06-06T10:00:00.000Z',
      );
    }

    if (context.skippedVideoCount > 0) {
      addAlert(
        'SKIPPED_VIDEO',
        'MEDIUM',
        context.pathStatus === 'WITHDRAWN' ? 'RESOLVED' : 'OPEN',
        context.pathStatus === 'WITHDRAWN'
          ? '2026-05-24T09:30:00.000Z'
          : '2026-06-06T11:00:00.000Z',
      );
    }

    if (
      context.pathStatus !== 'WITHDRAWN' &&
      context.absentAttendanceCount > 0 &&
      context.attendanceRatePercent < 75
    ) {
      addAlert(
        'ATTENDANCE_SESSION_GAP',
        'MEDIUM',
        'SCHEDULED',
        '2026-06-06T13:00:00.000Z',
      );
    }

    if (
      context.pathStatus !== 'WITHDRAWN' &&
      (context.blockedDailyPlanCount > 0 ||
        context.incompleteDailyPlanCount > 0)
    ) {
      addAlert(
        'STALLED_DAILY_PLAN',
        'MEDIUM',
        context.blockedDailyPlanCount > 0 ? 'OPEN' : 'MONITORING',
        context.blockedDailyPlanCount > 0
          ? '2026-06-06T14:00:00.000Z'
          : '2026-06-07T09:00:00.000Z',
      );
    }

    return rows;
  }

  private buildParentTeacherProgressAlertRow(input: {
    context: ParentTeacherProgressAlertContext;
    alertReason: DemoLearningProgressAlertReason;
    alertSeverity: DemoLearningProgressAlertSeverity;
    followUpStatus: DemoLearningProgressAlertFollowUpStatus;
    recommendedFollowUpAt: string;
  }): DemoLearningParentTeacherProgressAlertRow {
    const copy = this.buildParentTeacherProgressAlertCopy(
      input.context,
      input.alertReason,
    );

    return {
      alertId: `alert-${input.context.student.id}-${input.alertReason
        .toLowerCase()
        .replace(/_/g, '-')}`,
      learningPathId: input.context.learningPathId,
      enrollmentId: input.context.enrollmentId,
      studentId: input.context.student.id,
      childProfileId: input.context.student.childProfileId,
      studentName: input.context.student.displayName,
      parentEmail: input.context.student.parentEmail,
      courseId: input.context.course.id,
      courseCode: input.context.course.code,
      courseTitle: input.context.course.title,
      classId: input.context.classCohort.id,
      classCode: input.context.classCohort.code,
      classTitle: input.context.classCohort.title,
      teacherName: input.context.classCohort.teacherName,
      alertSeverity: input.alertSeverity,
      alertReason: input.alertReason,
      reasonLabel: this.labelProgressAlertReason(input.alertReason),
      evidenceSummary: copy.evidenceSummary,
      progressPercent: input.context.progressPercent,
      attendanceRatePercent: input.context.attendanceRatePercent,
      missingSubmissionCount: input.context.missingSubmissionCount,
      skippedVideoCount: input.context.skippedVideoCount,
      blockedDailyPlanCount: input.context.blockedDailyPlanCount,
      averagePracticeScorePercent: input.context.averagePracticeScorePercent,
      teacherInterventionRecommendation: copy.teacherInterventionRecommendation,
      parentSummary: copy.parentSummary,
      followUpStatus: input.followUpStatus,
      recommendedFollowUpAt: input.recommendedFollowUpAt,
    };
  }

  private buildParentTeacherProgressAlertCopy(
    context: ParentTeacherProgressAlertContext,
    reason: DemoLearningProgressAlertReason,
  ) {
    switch (reason) {
      case 'MISSING_SUBMISSIONS':
        return {
          evidenceSummary: `${context.missingSubmissionCount} missing submissions with ${context.progressPercent}% path progress.`,
          teacherInterventionRecommendation:
            'Teacher reviews missed tasks, assigns a short catch-up checklist, and records parent call outcome in local-demo notes.',
          parentSummary: `${context.student.displayName} needs parent support to complete ${context.missingSubmissionCount} missing assignments before the next fixture session.`,
        };
      case 'LOW_PRACTICE_SCORE':
        return {
          evidenceSummary: `${context.averagePracticeScorePercent}% average practice score across scored fixture attempts.`,
          teacherInterventionRecommendation:
            'Teacher schedules a 15-minute remedial practice block using the existing colors and objects exercise.',
          parentSummary: `${context.student.displayName} should retry the practice set with teacher guidance because the score is below the 70% support threshold.`,
        };
      case 'SKIPPED_VIDEO':
        if (context.pathStatus === 'WITHDRAWN') {
          return {
            evidenceSummary: `${context.skippedVideoCount} skipped video after the local-demo withdrawal/refund state.`,
            teacherInterventionRecommendation:
              'Teacher marks the skipped-video item resolved because this learner is withdrawn in synthetic fixtures.',
            parentSummary: `${context.student.displayName}'s skipped-video follow-up is resolved in the local-demo withdrawal fixture.`,
          };
        }

        return {
          evidenceSummary: `${context.skippedVideoCount} skipped video and ${context.incompleteVideoCount} incomplete video records.`,
          teacherInterventionRecommendation:
            'Teacher reopens the skipped video and asks the parent to confirm a home viewing window.',
          parentSummary: `${context.student.displayName} needs to watch the skipped fixture video before continuing the daily plan.`,
        };
      case 'ATTENDANCE_SESSION_GAP':
        return {
          evidenceSummary: `${context.attendanceRatePercent}% attendance rate with ${context.absentAttendanceCount} absent session record.`,
          teacherInterventionRecommendation:
            'Teacher schedules an attendance check-in and shares the catch-up lesson sequence with the parent.',
          parentSummary: `${context.student.displayName} missed a fixture session and needs a catch-up plan for the next class.`,
        };
      case 'STALLED_DAILY_PLAN':
        return {
          evidenceSummary: `${context.blockedDailyPlanCount} blocked, ${context.skippedDailyPlanCount} skipped, and ${context.incompleteDailyPlanCount} incomplete daily plans.`,
          teacherInterventionRecommendation:
            context.blockedDailyPlanCount > 0
              ? 'Teacher unblocks the current daily plan with one guided retry and checks parent availability.'
              : 'Teacher monitors the open daily plan and reminds the parent to finish the video/practice pair.',
          parentSummary:
            context.blockedDailyPlanCount > 0
              ? `${context.student.displayName} has a blocked fixture daily plan that needs teacher and parent follow-up.`
              : `${context.student.displayName} is on track but should finish the open fixture daily plan.`,
        };
    }
  }

  private buildParentTeacherLearnerSummaryRow(
    context: ParentTeacherProgressAlertContext,
    alerts: DemoLearningParentTeacherProgressAlertRow[],
  ): DemoLearningParentTeacherLearnerSummaryRow {
    const highRiskAlertCount = alerts.filter(
      (alert) => alert.alertSeverity === 'HIGH',
    ).length;
    const mediumRiskAlertCount = alerts.filter(
      (alert) => alert.alertSeverity === 'MEDIUM',
    ).length;
    const resolvedAlertCount = alerts.filter(
      (alert) => alert.followUpStatus === 'RESOLVED',
    ).length;

    return {
      learningPathId: context.learningPathId,
      enrollmentId: context.enrollmentId,
      studentId: context.student.id,
      childProfileId: context.student.childProfileId,
      studentName: context.student.displayName,
      parentEmail: context.student.parentEmail,
      courseId: context.course.id,
      courseCode: context.course.code,
      courseTitle: context.course.title,
      classId: context.classCohort.id,
      classCode: context.classCohort.code,
      classTitle: context.classCohort.title,
      teacherName: context.classCohort.teacherName,
      progressStatus: context.progress.status,
      progressPercent: context.progressPercent,
      attendanceRatePercent: context.attendanceRatePercent,
      missingSubmissionCount: context.missingSubmissionCount,
      skippedVideoCount: context.skippedVideoCount,
      blockedDailyPlanCount: context.blockedDailyPlanCount,
      averagePracticeScorePercent: context.averagePracticeScorePercent,
      alertCount: alerts.length,
      highRiskAlertCount,
      mediumRiskAlertCount,
      followUpNeededAlertCount: alerts.length - resolvedAlertCount,
      highestAlertSeverity:
        highRiskAlertCount > 0
          ? 'HIGH'
          : mediumRiskAlertCount > 0
            ? 'MEDIUM'
            : 'NONE',
    };
  }

  private buildParentTeacherProgressAlertStatusCounts(
    alertRows: DemoLearningParentTeacherProgressAlertRow[],
  ): DemoLearningParentTeacherProgressAlertStatusCounts {
    return {
      alertSeverity: this.countByStatus(
        progressAlertSeverities,
        alertRows,
        (row) => row.alertSeverity,
      ),
      alertReason: this.countByStatus(
        progressAlertReasons,
        alertRows,
        (row) => row.alertReason,
      ),
      followUpStatus: this.countByStatus(
        progressAlertFollowUpStatuses,
        alertRows,
        (row) => row.followUpStatus,
      ),
    };
  }

  private buildTopAlertReasonRows(
    reasonCounts: Record<DemoLearningProgressAlertReason, number>,
  ): DemoLearningParentTeacherAlertReasonSummaryRow[] {
    return progressAlertReasons
      .map((alertReason) => ({
        alertReason,
        reasonLabel: this.labelProgressAlertReason(alertReason),
        alertCount: reasonCounts[alertReason],
      }))
      .filter((row) => row.alertCount > 0)
      .sort(
        (left, right) =>
          right.alertCount - left.alertCount ||
          left.reasonLabel.localeCompare(right.reasonLabel),
      );
  }

  private labelProgressAlertReason(reason: DemoLearningProgressAlertReason) {
    switch (reason) {
      case 'MISSING_SUBMISSIONS':
        return 'Missing submissions';
      case 'LOW_PRACTICE_SCORE':
        return 'Low practice score';
      case 'SKIPPED_VIDEO':
        return 'Skipped video';
      case 'ATTENDANCE_SESSION_GAP':
        return 'Attendance/session gap';
      case 'STALLED_DAILY_PLAN':
        return 'Stalled daily plan';
    }
  }

  private buildSubscriptionEntitlementLifecycleRows(
    accessRows: DemoLearningSubscriptionEntitlementDailyPlanAccessRow[],
  ): DemoLearningSubscriptionEntitlementLifecycleRow[] {
    const requireAccessRow = (
      predicate: (
        row: DemoLearningSubscriptionEntitlementDailyPlanAccessRow,
      ) => boolean,
      label: string,
    ) => {
      const row = accessRows.find(predicate);
      if (!row) {
        throw new Error(
          `Missing local demo entitlement access row for ${label}`,
        );
      }

      return row;
    };

    const activeRow = requireAccessRow(
      (row) => row.enrollmentId === 'enroll-ava-a1-active',
      'active entitlement lifecycle hardening',
    );
    const pendingPaymentRow = requireAccessRow(
      (row) => row.enrollmentId === 'enroll-minh-a1-pending',
      'pending-payment entitlement lifecycle hardening',
    );
    const refundedRow = requireAccessRow(
      (row) => row.enrollmentId === 'enroll-khoa-a1-canceled',
      'refunded entitlement lifecycle hardening',
    );

    const lifecycleInputs = [
      {
        lifecycleRowId: 'entitlement-lifecycle-sub-ava-a1-active',
        lifecycleState: 'ACTIVE' as const,
        sourceRow: activeRow,
        entitlementStatus: 'GRANTED' as const,
        accessStatus: 'UNLOCKED' as const,
        decisionReason:
          'Active paid fixture entitlement remains unlocked for the local-demo daily plan.',
        nextSafeActionLabel: 'Allow read-only local-demo daily plan access',
      },
      {
        lifecycleRowId: 'entitlement-lifecycle-sub-minh-a1-pending-payment',
        lifecycleState: 'PENDING_PAYMENT' as const,
        sourceRow: pendingPaymentRow,
        entitlementStatus: 'BLOCKED' as const,
        accessStatus: 'BLOCKED_PENDING_PAYMENT' as const,
        decisionReason:
          'Pending fixture payment keeps learning access blocked until the local-demo payment evidence succeeds.',
        nextSafeActionLabel: 'Keep blocked and review fixture payment evidence',
      },
      {
        lifecycleRowId: 'entitlement-lifecycle-sub-khoa-a1-refunded',
        lifecycleState: 'REFUNDED' as const,
        sourceRow: refundedRow,
        entitlementStatus: 'BLOCKED' as const,
        accessStatus: 'BLOCKED_REFUNDED' as const,
        decisionReason:
          'Refunded fixture payment keeps course path access blocked and review-only.',
        nextSafeActionLabel: 'Keep blocked after synthetic refund',
      },
      {
        lifecycleRowId: 'entitlement-lifecycle-sub-ava-a1-expired-snapshot',
        lifecycleState: 'EXPIRED' as const,
        sourceRow: activeRow,
        entitlementStatus: 'BLOCKED' as const,
        accessStatus: 'BLOCKED_EXPIRED' as const,
        decisionReason:
          'Expired fixture snapshot blocks the same Ava entitlement after the period end without changing the active base row.',
        nextSafeActionLabel: 'Renew fixture subscription before unlocking',
      },
      {
        lifecycleRowId: 'entitlement-lifecycle-sub-khoa-a1-revoked-snapshot',
        lifecycleState: 'REVOKED' as const,
        sourceRow: refundedRow,
        entitlementStatus: 'BLOCKED' as const,
        accessStatus: 'BLOCKED_REVOKED' as const,
        decisionReason:
          'Revoked fixture snapshot documents support/ops manual entitlement removal after refund review, with no provider mutation.',
        nextSafeActionLabel:
          'Keep revoked until a new fixture entitlement exists',
      },
    ];

    return lifecycleInputs.map((input) => {
      const auditTraceKey = [
        input.lifecycleRowId,
        input.sourceRow.entitlementId,
        input.lifecycleState,
        input.accessStatus,
      ].join('->');

      return {
        lifecycleRowId: input.lifecycleRowId,
        lifecycleState: input.lifecycleState,
        relationshipKey: input.sourceRow.relationshipKey,
        entitlementId: input.sourceRow.entitlementId,
        entitlementStatus: input.entitlementStatus,
        accessStatus: input.accessStatus,
        sourceEnrollmentId: input.sourceRow.enrollmentId,
        sourceSubscriptionId: input.sourceRow.subscriptionId,
        sourcePaymentId: input.sourceRow.paymentId,
        sourceRefundIds: input.sourceRow.refundIds,
        studentId: input.sourceRow.studentId,
        childProfileId: input.sourceRow.childProfileId,
        studentName: input.sourceRow.studentName,
        courseId: input.sourceRow.courseId,
        courseCode: input.sourceRow.courseCode,
        decisionReason: input.decisionReason,
        nextSafeActionLabel: input.nextSafeActionLabel,
        auditTraceKey,
        auditTraceIds: [
          input.sourceRow.relationshipKey,
          input.sourceRow.entitlementId,
          input.lifecycleRowId,
          auditTraceKey,
        ],
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary: `${input.lifecycleState} entitlement lifecycle row maps ${input.sourceRow.studentName} to ${input.accessStatus} with fixture-only audit evidence.`,
      } satisfies DemoLearningSubscriptionEntitlementLifecycleRow;
    });
  }

  private buildSubscriptionEntitlementAccessStatus(input: {
    enrollment: DemoLearningEnrollment;
    subscription: DemoLearningSubscription;
    payment: DemoLearningPayment;
    refundCount: number;
    generatedAt: string;
  }): DemoLearningSubscriptionEntitlementDailyPlanAccessStatus {
    if (input.payment.status === 'REFUNDED' || input.refundCount > 0) {
      return 'BLOCKED_REFUNDED';
    }

    if (
      input.enrollment.status === 'CANCELED' ||
      input.subscription.status === 'CANCELED'
    ) {
      return 'BLOCKED_CANCELED';
    }

    if (
      input.subscription.status === 'EXPIRED' ||
      new Date(input.subscription.currentPeriodEnd).getTime() <
        new Date(input.generatedAt).getTime()
    ) {
      return 'BLOCKED_EXPIRED';
    }

    if (
      input.enrollment.status !== 'ACTIVE' ||
      input.subscription.status !== 'ACTIVE' ||
      input.payment.status !== 'SUCCEEDED'
    ) {
      return 'BLOCKED_PENDING_PAYMENT';
    }

    return 'UNLOCKED';
  }

  private buildSubscriptionEntitlementBlockedReason(
    accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus,
  ) {
    switch (accessStatus) {
      case 'UNLOCKED':
        return null;
      case 'BLOCKED_PENDING_PAYMENT':
        return 'Fixture subscription or enrollment is not active paid; wait for the local-demo payment confirmation before unlocking learning access.';
      case 'BLOCKED_EXPIRED':
        return 'Fixture subscription period has expired; renew the local-demo subscription before unlocking this course path.';
      case 'BLOCKED_REVOKED':
        return 'Fixture entitlement was revoked by support/ops audit review; keep course path and daily plan access blocked.';
      case 'BLOCKED_REFUNDED':
        return 'Fixture payment was refunded; keep course path and daily plan access blocked in read-only evidence.';
      case 'BLOCKED_CANCELED':
        return 'Fixture enrollment or subscription was canceled; keep learning path access blocked until a new fixture entitlement exists.';
    }
  }

  private buildSubscriptionEntitlementNextAction(
    accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus,
  ) {
    switch (accessStatus) {
      case 'UNLOCKED':
        return 'Open local-demo daily plan';
      case 'BLOCKED_PENDING_PAYMENT':
        return 'Confirm fixture payment before unlocking';
      case 'BLOCKED_EXPIRED':
        return 'Renew fixture subscription before unlocking';
      case 'BLOCKED_REVOKED':
        return 'Keep revoked until support/ops audit review creates a new fixture entitlement';
      case 'BLOCKED_REFUNDED':
        return 'Keep blocked after synthetic refund';
      case 'BLOCKED_CANCELED':
        return 'Create a new fixture entitlement before unlocking';
    }
  }

  private selectDailyPlanForAccess(
    dailyPlans: DemoLearningDailyPlan[],
    accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus,
    learningPathId: string,
  ) {
    const sortedDailyPlans = [...dailyPlans].sort(
      (left, right) =>
        left.sequence - right.sequence || left.id.localeCompare(right.id),
    );
    if (sortedDailyPlans.length === 0) {
      throw new Error(
        `Missing local demo daily plan for learning path ${learningPathId}`,
      );
    }

    if (accessStatus === 'UNLOCKED') {
      return (
        sortedDailyPlans.find((plan) =>
          ['IN_PROGRESS', 'ASSIGNED'].includes(plan.status),
        ) ??
        sortedDailyPlans.find((plan) => plan.status === 'COMPLETED') ??
        sortedDailyPlans[0]
      );
    }

    return (
      sortedDailyPlans.find((plan) =>
        ['BLOCKED', 'SKIPPED'].includes(plan.status),
      ) ?? sortedDailyPlans[0]
    );
  }

  private buildLearningPathEvidenceRow(input: {
    learningPath: DemoLearningPath;
    enrollment: DemoLearningEnrollment;
    student: DemoLearningStudent;
    course: DemoLearningCourse;
    classCohort: DemoLearningClassCohort;
    dailyPlans: DemoLearningDailyPlan[];
    videoEvidence: DemoLearningVideoEvidence[];
    practiceAttempts: DemoLearningPracticeAttempt[];
  }): DemoLearningPathEvidenceRow {
    const dailyPlanCounts = this.countDailyPlanStatuses(input.dailyPlans);
    const videoEvidenceCounts = this.countVideoEvidenceStatuses(
      input.videoEvidence,
    );
    const practiceAttemptCounts = this.countPracticeAttemptStatuses(
      input.practiceAttempts,
    );
    const completedDailyPlanCount = dailyPlanCounts.COMPLETED;
    const progressPercent = this.percent(
      completedDailyPlanCount,
      input.dailyPlans.length,
    );

    return {
      learningPathId: input.learningPath.id,
      enrollmentId: input.enrollment.id,
      studentId: input.student.id,
      childProfileId: input.student.childProfileId,
      studentName: input.student.displayName,
      courseId: input.course.id,
      courseCode: input.course.code,
      courseTitle: input.course.title,
      classId: input.classCohort.id,
      classCode: input.classCohort.code,
      classTitle: input.classCohort.title,
      title: input.learningPath.title,
      pathStatus: input.learningPath.status,
      dailyPlanCount: input.dailyPlans.length,
      completedDailyPlanCount,
      blockedDailyPlanCount: dailyPlanCounts.BLOCKED,
      skippedDailyPlanCount: dailyPlanCounts.SKIPPED,
      completedVideoCount: videoEvidenceCounts.COMPLETED,
      passedPracticeCount: practiceAttemptCounts.PASSED,
      averagePracticeScorePercent: this.averagePracticeScorePercent(
        input.practiceAttempts,
      ),
      progressPercent,
      learnerStatusBand: this.buildLearningPathLearnerBand({
        pathStatus: input.learningPath.status,
        dailyPlanCount: input.dailyPlans.length,
        progressPercent,
        skippedDailyPlanCount: dailyPlanCounts.SKIPPED,
        blockedDailyPlanCount: dailyPlanCounts.BLOCKED,
      }),
    };
  }

  private buildDailyPlanEvidenceRow(input: {
    plan: DemoLearningDailyPlan;
    learningPath: DemoLearningPath;
    enrollment: DemoLearningEnrollment;
    student: DemoLearningStudent;
    course: DemoLearningCourse;
    classCohort: DemoLearningClassCohort;
    lesson: DemoLearningLesson;
    videoEvidence: DemoLearningVideoEvidence;
    practiceAttempt: DemoLearningPracticeAttempt;
  }): DemoLearningDailyPlanEvidenceRow {
    return {
      dailyPlanId: input.plan.id,
      learningPathId: input.learningPath.id,
      enrollmentId: input.enrollment.id,
      studentId: input.student.id,
      childProfileId: input.student.childProfileId,
      studentName: input.student.displayName,
      courseCode: input.course.code,
      classCode: input.classCohort.code,
      lessonId: input.lesson.id,
      lessonCode: input.lesson.code,
      lessonTitle: input.lesson.title,
      sequence: input.plan.sequence,
      planDate: input.plan.planDate,
      title: input.plan.title,
      dailyPlanStatus: input.plan.status,
      videoEvidenceStatus: input.videoEvidence.status,
      watchedSeconds: input.videoEvidence.watchedSeconds,
      requiredVideoSeconds: input.videoEvidence.requiredSeconds,
      videoCompletionPercent: this.percent(
        input.videoEvidence.watchedSeconds,
        input.videoEvidence.requiredSeconds,
      ),
      practiceAttemptStatus: input.practiceAttempt.status,
      practiceAttemptNumber: input.practiceAttempt.attemptNumber,
      practiceScorePercent: input.practiceAttempt.scorePercent ?? null,
    };
  }

  private buildLessonAssessmentRow(input: {
    lesson: DemoLearningLesson;
    classCohort: DemoLearningClassCohort;
    course: DemoLearningCourse;
    assignments: DemoLearningAssignment[];
    submissions: DemoLearningSubmission[];
  }): DemoLearningLessonAssessmentRow {
    const submissionCounts = this.countSubmissionStatuses(input.submissions);

    return {
      lessonId: input.lesson.id,
      lessonCode: input.lesson.code,
      lessonTitle: input.lesson.title,
      lessonStatus: input.lesson.status,
      classId: input.classCohort.id,
      classCode: input.classCohort.code,
      courseCode: input.course.code,
      sequence: input.lesson.sequence,
      assignmentCount: input.assignments.length,
      quizCount: input.assignments.filter(
        (assignment) => assignment.kind === 'QUIZ',
      ).length,
      assignmentTaskCount: input.assignments.filter(
        (assignment) => assignment.kind === 'ASSIGNMENT',
      ).length,
      expectedSubmissionCount:
        input.assignments.length * input.classCohort.enrollmentIds.length,
      submissionRecordCount: input.submissions.length,
      missingSubmissionCount: submissionCounts.MISSING,
      averageScorePercent: this.averageSubmissionScorePercent(
        input.submissions,
      ),
    };
  }

  private buildAssignmentAssessmentRow(input: {
    assignment: DemoLearningAssignment;
    lesson: DemoLearningLesson;
    classCohort: DemoLearningClassCohort;
    course: DemoLearningCourse;
    submissions: DemoLearningSubmission[];
  }): DemoLearningAssignmentAssessmentRow {
    const submissionCounts = this.countSubmissionStatuses(input.submissions);
    const feedbackCounts = this.countFeedbackStatuses(input.submissions);

    return {
      assignmentId: input.assignment.id,
      lessonId: input.lesson.id,
      lessonCode: input.lesson.code,
      classId: input.classCohort.id,
      classCode: input.classCohort.code,
      courseCode: input.course.code,
      kind: input.assignment.kind,
      title: input.assignment.title,
      status: input.assignment.status,
      dueAt: input.assignment.dueAt,
      expectedSubmissionCount: input.classCohort.enrollmentIds.length,
      submittedSubmissionCount: submissionCounts.SUBMITTED,
      lateSubmissionCount: submissionCounts.LATE,
      missingSubmissionCount: submissionCounts.MISSING,
      resubmittedSubmissionCount: submissionCounts.RESUBMITTED,
      scoredSubmissionCount: this.countScoredSubmissions(input.submissions),
      feedbackGivenCount: feedbackCounts.GIVEN,
      pendingFeedbackCount: feedbackCounts.PENDING,
      averageScorePercent: this.averageSubmissionScorePercent(
        input.submissions,
      ),
    };
  }

  private buildLearnerAssessmentRow(input: {
    enrollment: DemoLearningEnrollment;
    student: DemoLearningStudent;
    course: DemoLearningCourse;
    classCohort: DemoLearningClassCohort;
    progressStatus: DemoLearningLearnerAssessmentRow['progressStatus'];
    progressCompletionPercent: number;
    expectedAssignmentCount: number;
    submissions: DemoLearningSubmission[];
  }): DemoLearningLearnerAssessmentRow {
    const submissionCounts = this.countSubmissionStatuses(input.submissions);
    const feedbackCounts = this.countFeedbackStatuses(input.submissions);
    const completedSubmissionCount =
      submissionCounts.SUBMITTED +
      submissionCounts.LATE +
      submissionCounts.RESUBMITTED;
    const scoredSubmissionCount = this.countScoredSubmissions(
      input.submissions,
    );
    const averageScorePercent = this.averageSubmissionScorePercent(
      input.submissions,
    );

    return {
      enrollmentId: input.enrollment.id,
      studentId: input.student.id,
      childProfileId: input.student.childProfileId,
      studentName: input.student.displayName,
      courseId: input.course.id,
      courseCode: input.course.code,
      courseTitle: input.course.title,
      classId: input.classCohort.id,
      classCode: input.classCohort.code,
      classTitle: input.classCohort.title,
      progressStatus: input.progressStatus,
      expectedAssignmentCount: input.expectedAssignmentCount,
      submittedSubmissionCount: submissionCounts.SUBMITTED,
      lateSubmissionCount: submissionCounts.LATE,
      missingSubmissionCount: submissionCounts.MISSING,
      resubmittedSubmissionCount: submissionCounts.RESUBMITTED,
      scoredSubmissionCount,
      feedbackPendingCount: feedbackCounts.PENDING,
      averageScorePercent,
      assignmentCompletionPercent: this.percent(
        completedSubmissionCount,
        input.expectedAssignmentCount,
      ),
      progressCompletionPercent: input.progressCompletionPercent,
      assessmentBand: this.buildAssessmentBand({
        progressStatus: input.progressStatus,
        expectedAssignmentCount: input.expectedAssignmentCount,
        missingSubmissionCount: submissionCounts.MISSING,
        scoredSubmissionCount,
        averageScorePercent,
      }),
    };
  }

  private buildEnrollmentRow(input: {
    enrollment: DemoLearningEnrollment;
    student: DemoLearningStudent;
    course: DemoLearningCourse;
    subscription: DemoLearningSubscription;
    payment: DemoLearningPayment;
    refunds: DemoLearningRefund[];
    commissions: DemoLearningCommission[];
  }): DemoLearningEnrollmentReportRow {
    const grossPaidCents = ['SUCCEEDED', 'REFUNDED'].includes(
      input.payment.status,
    )
      ? input.payment.amountCents
      : 0;
    const pendingPaymentCents =
      input.payment.status === 'PENDING' ? input.payment.amountCents : 0;
    const refundedCents = input.refunds.reduce(
      (sum, refund) =>
        refund.status === 'SUCCEEDED' ? sum + refund.amountCents : sum,
      0,
    );
    const commissionByStatus = this.sumCommissionsByStatus(input.commissions);

    return {
      enrollmentId: input.enrollment.id,
      studentId: input.student.id,
      childProfileId: input.student.childProfileId,
      studentName: input.student.displayName,
      parentEmail: input.student.parentEmail,
      courseId: input.course.id,
      courseCode: input.course.code,
      courseTitle: input.course.title,
      levelCode: input.course.levelCode,
      packageCode: input.course.packageCode,
      packageName: input.course.packageName,
      enrollmentStatus: input.enrollment.status,
      enrollmentSource: input.enrollment.source,
      subscriptionId: input.subscription.id,
      subscriptionStatus: input.subscription.status,
      planCode: input.subscription.planCode,
      paymentId: input.payment.id,
      paymentStatus: input.payment.status,
      refundIds: input.refunds.map((refund) => refund.id),
      refundStatus: input.refunds[0]?.status ?? 'NONE',
      commissionIds: input.commissions.map((commission) => commission.id),
      grossPaidCents,
      pendingPaymentCents,
      refundedCents,
      netRevenueCents: grossPaidCents - refundedCents,
      commissionPendingCents: commissionByStatus.PENDING,
      commissionPayableCents: commissionByStatus.PAYABLE,
      commissionApprovedCents: commissionByStatus.APPROVED,
      commissionCanceledCents: commissionByStatus.CANCELED,
    };
  }

  private buildStatusCounts(
    fixture: DemoLearningCoreFixture,
  ): DemoLearningStatusCounts {
    return {
      enrollment: this.countByStatus(
        enrollmentStatuses,
        fixture.enrollments,
        (enrollment) => enrollment.status,
      ),
      subscription: this.countByStatus(
        subscriptionStatuses,
        fixture.subscriptions,
        (subscription) => subscription.status,
      ),
      payment: this.countByStatus(
        paymentStatuses,
        fixture.payments,
        (payment) => payment.status,
      ),
      refund: this.countByStatus(
        refundStatuses,
        fixture.refunds,
        (refund) => refund.status,
      ),
      commission: this.countByStatus(
        commissionStatuses,
        fixture.commissions,
        (commission) => commission.status,
      ),
    };
  }

  private buildCourseAggregates(
    rows: DemoLearningEnrollmentReportRow[],
  ): DemoLearningCourseAggregateRow[] {
    const aggregates = new Map<string, DemoLearningCourseAggregateRow>();

    for (const row of rows) {
      const existing =
        aggregates.get(row.courseId) ??
        ({
          courseId: row.courseId,
          courseCode: row.courseCode,
          courseTitle: row.courseTitle,
          enrollmentCount: 0,
          activeEnrollmentCount: 0,
          pendingEnrollmentCount: 0,
          canceledEnrollmentCount: 0,
          grossPaidCents: 0,
          refundedCents: 0,
          netRevenueCents: 0,
          commissionEarnedCents: 0,
        } satisfies DemoLearningCourseAggregateRow);

      existing.enrollmentCount += 1;
      if (row.enrollmentStatus === 'ACTIVE') {
        existing.activeEnrollmentCount += 1;
      }
      if (row.enrollmentStatus === 'PENDING') {
        existing.pendingEnrollmentCount += 1;
      }
      if (row.enrollmentStatus === 'CANCELED') {
        existing.canceledEnrollmentCount += 1;
      }
      existing.grossPaidCents += row.grossPaidCents;
      existing.refundedCents += row.refundedCents;
      existing.netRevenueCents += row.netRevenueCents;
      existing.commissionEarnedCents +=
        row.commissionPendingCents +
        row.commissionPayableCents +
        row.commissionApprovedCents;
      aggregates.set(row.courseId, existing);
    }

    return [...aggregates.values()].sort((left, right) =>
      left.courseCode.localeCompare(right.courseCode),
    );
  }

  private buildSessionRow(input: {
    session: DemoLearningSession;
    classCohort: DemoLearningClassCohort;
    course: DemoLearningCourse;
    attendance: DemoLearningAttendanceRecord[];
  }): DemoLearningSessionReportRow {
    const attendanceCounts = this.countAttendanceStatuses(input.attendance);

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

  private buildClassAggregates(input: {
    classes: DemoLearningClassCohort[];
    coursesById: Map<string, DemoLearningCourse>;
    learnerRows: DemoLearningLearnerProgressRow[];
    sessionRows: DemoLearningSessionReportRow[];
  }): DemoLearningClassAggregateRow[] {
    return input.classes
      .map((classCohort) => {
        const course = this.requireCourseById(
          input.coursesById,
          classCohort.courseId,
        );
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
          attendanceRatePercent: this.percent(
            presentAttendanceCount + lateAttendanceCount,
            attendanceRecordCount,
          ),
          averageLearnerCompletionPercent: this.averagePercent(
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

  private buildClassSessionStatusCounts(
    fixture: DemoLearningCoreFixture,
  ): DemoLearningClassSessionStatusCounts {
    return {
      class: this.countByStatus(
        classStatuses,
        fixture.classes,
        (classCohort) => classCohort.status,
      ),
      session: this.countByStatus(
        sessionStatuses,
        fixture.sessions,
        (session) => session.status,
      ),
      attendance: this.countAttendanceStatuses(fixture.attendance),
      progress: this.countByStatus(
        progressStatuses,
        fixture.progress,
        (progress) => progress.status,
      ),
    };
  }

  private buildLessonAssignmentAssessmentStatusCounts(
    fixture: DemoLearningCoreFixture,
  ): DemoLearningLessonAssignmentAssessmentStatusCounts {
    return {
      lesson: this.countByStatus(
        lessonStatuses,
        fixture.lessons,
        (lesson) => lesson.status,
      ),
      assignment: this.countByStatus(
        assignmentStatuses,
        fixture.assignments,
        (assignment) => assignment.status,
      ),
      submission: this.countSubmissionStatuses(fixture.submissions),
      feedback: this.countFeedbackStatuses(fixture.submissions),
      progress: this.countByStatus(
        progressStatuses,
        fixture.progress,
        (progress) => progress.status,
      ),
    };
  }

  private buildLearningPathDailyPlanVideoPracticeStatusCounts(
    fixture: DemoLearningCoreFixture,
    learningPathRows: DemoLearningPathEvidenceRow[],
  ): DemoLearningPathDailyPlanVideoPracticeStatusCounts {
    return {
      learningPath: this.countByStatus(
        learningPathStatuses,
        fixture.learningPaths,
        (path) => path.status,
      ),
      dailyPlan: this.countDailyPlanStatuses(fixture.dailyPlans),
      videoEvidence: this.countVideoEvidenceStatuses(fixture.videoEvidence),
      practiceAttempt: this.countPracticeAttemptStatuses(
        fixture.practiceAttempts,
      ),
      learnerBand: this.countByStatus(
        learningPathLearnerBands,
        learningPathRows,
        (row) => row.learnerStatusBand,
      ),
    };
  }

  private countAttendanceStatuses(
    records: DemoLearningAttendanceRecord[],
  ): Record<DemoLearningAttendanceStatus, number> {
    return this.countByStatus(
      attendanceStatuses,
      records,
      (record) => record.status,
    );
  }

  private countSubmissionStatuses(
    records: DemoLearningSubmission[],
  ): Record<DemoLearningSubmissionStatus, number> {
    return this.countByStatus(
      submissionStatuses,
      records,
      (record) => record.status,
    );
  }

  private countFeedbackStatuses(
    records: DemoLearningSubmission[],
  ): Record<DemoLearningFeedbackStatus, number> {
    return this.countByStatus(
      feedbackStatuses,
      records,
      (record) => record.feedbackStatus,
    );
  }

  private countDailyPlanStatuses(
    records: DemoLearningDailyPlan[],
  ): Record<DemoLearningDailyPlanStatus, number> {
    return this.countByStatus(
      dailyPlanStatuses,
      records,
      (record) => record.status,
    );
  }

  private countVideoEvidenceStatuses(
    records: DemoLearningVideoEvidence[],
  ): Record<DemoLearningVideoEvidenceStatus, number> {
    return this.countByStatus(
      videoEvidenceStatuses,
      records,
      (record) => record.status,
    );
  }

  private countPracticeAttemptStatuses(
    records: DemoLearningPracticeAttempt[],
  ): Record<DemoLearningPracticeAttemptStatus, number> {
    return this.countByStatus(
      practiceAttemptStatuses,
      records,
      (record) => record.status,
    );
  }

  private countScoredSubmissions(records: DemoLearningSubmission[]) {
    return records.filter((record) => record.scorePercent !== undefined).length;
  }

  private averageSubmissionScorePercent(records: DemoLearningSubmission[]) {
    const scores = records
      .map((record) => record.scorePercent)
      .filter((score): score is number => score !== undefined);

    return this.averagePercent(scores);
  }

  private averagePracticeScorePercent(records: DemoLearningPracticeAttempt[]) {
    const scores = records
      .map((record) => record.scorePercent)
      .filter((score): score is number => score !== undefined);

    return this.averagePercent(scores);
  }

  private countScoreBands(records: DemoLearningSubmission[]) {
    return records.reduce(
      (totals, record) => {
        if (record.status === 'MISSING') {
          totals.MISSING += 1;
          return totals;
        }

        const score = record.scorePercent;
        if (score === undefined) {
          return totals;
        }
        if (score >= 90) {
          totals.EXCELLENT += 1;
          return totals;
        }
        if (score >= 75) {
          totals.ON_TRACK += 1;
          return totals;
        }

        totals.NEEDS_SUPPORT += 1;
        return totals;
      },
      {
        EXCELLENT: 0,
        ON_TRACK: 0,
        NEEDS_SUPPORT: 0,
        MISSING: 0,
      } satisfies Record<
        Exclude<DemoLearningAssessmentBand, 'WITHDRAWN'>,
        number
      >,
    );
  }

  private buildAssessmentBand(input: {
    progressStatus: DemoLearningLearnerAssessmentRow['progressStatus'];
    expectedAssignmentCount: number;
    missingSubmissionCount: number;
    scoredSubmissionCount: number;
    averageScorePercent: number;
  }): DemoLearningAssessmentBand {
    if (input.progressStatus === 'WITHDRAWN') {
      return 'WITHDRAWN';
    }

    if (
      input.scoredSubmissionCount === 0 ||
      input.missingSubmissionCount === input.expectedAssignmentCount
    ) {
      return 'MISSING';
    }

    if (input.averageScorePercent >= 90 && input.missingSubmissionCount === 0) {
      return 'EXCELLENT';
    }

    if (input.averageScorePercent >= 75 && input.missingSubmissionCount <= 1) {
      return 'ON_TRACK';
    }

    return 'NEEDS_SUPPORT';
  }

  private buildLearningPathLearnerBand(input: {
    pathStatus: DemoLearningPathStatus;
    dailyPlanCount: number;
    progressPercent: number;
    skippedDailyPlanCount: number;
    blockedDailyPlanCount: number;
  }): DemoLearningPathLearnerBand {
    if (input.pathStatus === 'WITHDRAWN') {
      return 'WITHDRAWN';
    }

    if (input.dailyPlanCount === 0 || input.progressPercent === 0) {
      return 'INACTIVE';
    }

    if (
      input.pathStatus === 'NEEDS_SUPPORT' ||
      input.blockedDailyPlanCount > 0 ||
      input.skippedDailyPlanCount > 1
    ) {
      return 'NEEDS_SUPPORT';
    }

    return 'ON_TRACK';
  }

  private sumCommissionsByStatus(commissions: DemoLearningCommission[]) {
    return commissions.reduce(
      (totals, commission) => {
        totals[commission.status] += commission.amountCents;
        return totals;
      },
      {
        PENDING: 0,
        PAYABLE: 0,
        APPROVED: 0,
        CANCELED: 0,
      } satisfies Record<DemoLearningCommissionStatus, number>,
    );
  }

  private countByStatus<TStatus extends string, TItem>(
    statuses: readonly TStatus[],
    items: TItem[],
    statusFor: (item: TItem) => TStatus,
  ) {
    const counts = Object.fromEntries(
      statuses.map((status) => [status, 0]),
    ) as Record<TStatus, number>;

    for (const item of items) {
      counts[statusFor(item)] += 1;
    }

    return counts;
  }

  private percent(numerator: number, denominator: number) {
    if (denominator === 0) {
      return 0;
    }

    return Math.round((numerator / denominator) * 100);
  }

  private averagePercent(values: number[]) {
    if (values.length === 0) {
      return 0;
    }

    return Math.round(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
  }

  private groupBy<TItem>(
    items: TItem[],
    keyFor: (item: TItem) => string,
  ): Map<string, TItem[]> {
    const groups = new Map<string, TItem[]>();

    for (const item of items) {
      const key = keyFor(item);
      const group = groups.get(key) ?? [];
      group.push(item);
      groups.set(key, group);
    }

    return groups;
  }

  private requireEnrollment(
    enrollmentsById: Map<string, DemoLearningEnrollment>,
    enrollmentId: string,
  ) {
    const enrollment = enrollmentsById.get(enrollmentId);
    if (!enrollment) {
      throw new Error(`Missing local demo enrollment for ${enrollmentId}`);
    }

    return enrollment;
  }

  private requireStudent(
    studentsById: Map<string, DemoLearningStudent>,
    enrollment: DemoLearningEnrollment,
  ) {
    const student = studentsById.get(enrollment.studentId);
    if (!student) {
      throw new Error(`Missing local demo student for ${enrollment.studentId}`);
    }

    return student;
  }

  private requireStudentById(
    studentsById: Map<string, DemoLearningStudent>,
    studentId: string,
  ) {
    const student = studentsById.get(studentId);
    if (!student) {
      throw new Error(`Missing local demo student for ${studentId}`);
    }

    return student;
  }

  private requireCourse(
    coursesById: Map<string, DemoLearningCourse>,
    enrollment: DemoLearningEnrollment,
  ) {
    const course = coursesById.get(enrollment.courseId);
    if (!course) {
      throw new Error(`Missing local demo course for ${enrollment.courseId}`);
    }

    return course;
  }

  private requireCourseById(
    coursesById: Map<string, DemoLearningCourse>,
    courseId: string,
  ) {
    const course = coursesById.get(courseId);
    if (!course) {
      throw new Error(`Missing local demo course for ${courseId}`);
    }

    return course;
  }

  private requireClass(
    classesById: Map<string, DemoLearningClassCohort>,
    classId: string,
  ) {
    const classCohort = classesById.get(classId);
    if (!classCohort) {
      throw new Error(`Missing local demo class for ${classId}`);
    }

    return classCohort;
  }

  private requireLesson(
    lessonsById: Map<string, DemoLearningLesson>,
    lessonId: string,
  ) {
    const lesson = lessonsById.get(lessonId);
    if (!lesson) {
      throw new Error(`Missing local demo lesson for ${lessonId}`);
    }

    return lesson;
  }

  private requireLearningPath(
    pathsById: Map<string, DemoLearningPath>,
    pathId: string,
  ) {
    const learningPath = pathsById.get(pathId);
    if (!learningPath) {
      throw new Error(`Missing local demo learning path for ${pathId}`);
    }

    return learningPath;
  }

  private requireDailyPlan(
    dailyPlansById: Map<string, DemoLearningDailyPlan>,
    dailyPlanId: string,
  ) {
    const dailyPlan = dailyPlansById.get(dailyPlanId);
    if (!dailyPlan) {
      throw new Error(`Missing local demo daily plan for ${dailyPlanId}`);
    }

    return dailyPlan;
  }

  private requireScreenTimePolicy(
    policiesById: Map<string, DemoLearningScreenTimePolicy>,
    policyId: string,
  ) {
    const policy = policiesById.get(policyId);
    if (!policy) {
      throw new Error(`Missing local demo screen-time policy for ${policyId}`);
    }

    return policy;
  }

  private requireGuardian(
    guardiansById: Map<string, DemoLearningParentGuardian>,
    guardianId: string,
  ) {
    const guardian = guardiansById.get(guardianId);
    if (!guardian) {
      throw new Error(`Missing local demo parent guardian for ${guardianId}`);
    }

    return guardian;
  }

  private requireGuardianByChildProfileId(
    guardiansByChildProfileId: Map<string, DemoLearningParentGuardian>,
    childProfileId: string,
  ) {
    const guardian = guardiansByChildProfileId.get(childProfileId);
    if (!guardian) {
      throw new Error(
        `Missing local demo parent guardian for child ${childProfileId}`,
      );
    }

    return guardian;
  }

  private requireProgress(
    progressByEnrollmentId: Map<string, DemoLearningProgressRecord>,
    enrollmentId: string,
  ) {
    const progress = progressByEnrollmentId.get(enrollmentId);
    if (!progress) {
      throw new Error(`Missing local demo progress record for ${enrollmentId}`);
    }

    return progress;
  }

  private requireVideoEvidence(
    videoEvidenceByDailyPlanId: Map<string, DemoLearningVideoEvidence>,
    dailyPlanId: string,
  ) {
    const videoEvidence = videoEvidenceByDailyPlanId.get(dailyPlanId);
    if (!videoEvidence) {
      throw new Error(
        `Missing local demo video evidence for daily plan ${dailyPlanId}`,
      );
    }

    return videoEvidence;
  }

  private requirePracticeAttempt(
    practiceAttemptByDailyPlanId: Map<string, DemoLearningPracticeAttempt>,
    dailyPlanId: string,
  ) {
    const practiceAttempt = practiceAttemptByDailyPlanId.get(dailyPlanId);
    if (!practiceAttempt) {
      throw new Error(
        `Missing local demo practice attempt for daily plan ${dailyPlanId}`,
      );
    }

    return practiceAttempt;
  }

  private requireContentOwner(
    ownersById: Map<string, DemoLearningContentOwner>,
    ownerId: string,
  ) {
    const owner = ownersById.get(ownerId);
    if (!owner) {
      throw new Error(`Missing local demo content owner for ${ownerId}`);
    }

    return owner;
  }

  private requireContentItem(
    contentItemsById: Map<string, DemoLearningContentLibraryItem>,
    contentItemId: string,
  ) {
    const contentItem = contentItemsById.get(contentItemId);
    if (!contentItem) {
      throw new Error(
        `Missing local demo content library item for ${contentItemId}`,
      );
    }

    return contentItem;
  }

  private requireContentClassAssignment(
    classAssignmentsById: Map<string, DemoLearningContentClassAssignment>,
    classAssignmentId: string,
  ) {
    const assignment = classAssignmentsById.get(classAssignmentId);
    if (!assignment) {
      throw new Error(
        `Missing local demo content class assignment for ${classAssignmentId}`,
      );
    }

    return assignment;
  }

  private requireAiTutorChatSession(
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

  private requireAiTutorSafetyFlag(
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

  private requireAiTutorSupportRecommendation(
    supportRecommendationsById: Map<
      string,
      DemoLearningAiTutorSupportRecommendation
    >,
    supportRecommendationId: string,
  ) {
    const supportRecommendation = supportRecommendationsById.get(
      supportRecommendationId,
    );
    if (!supportRecommendation) {
      throw new Error(
        `Missing local demo AI tutor support recommendation for ${supportRecommendationId}`,
      );
    }

    return supportRecommendation;
  }

  private requireAchievementRecord(
    achievementRecordsById: Map<string, DemoLearningAchievementRecord>,
    achievementRecordId: string,
  ) {
    const achievementRecord = achievementRecordsById.get(achievementRecordId);
    if (!achievementRecord) {
      throw new Error(
        `Missing local demo achievement record for ${achievementRecordId}`,
      );
    }

    return achievementRecord;
  }

  private requireBadgeAward(
    badgeAwardsById: Map<string, DemoLearningBadgeAward>,
    badgeAwardId: string,
  ) {
    const badgeAward = badgeAwardsById.get(badgeAwardId);
    if (!badgeAward) {
      throw new Error(`Missing local demo badge award for ${badgeAwardId}`);
    }

    return badgeAward;
  }

  private requireCertificateFixture(
    certificateFixturesById: Map<string, DemoLearningCertificateFixture>,
    certificateFixtureId: string,
  ) {
    const certificateFixture =
      certificateFixturesById.get(certificateFixtureId);
    if (!certificateFixture) {
      throw new Error(
        `Missing local demo certificate fixture for ${certificateFixtureId}`,
      );
    }

    return certificateFixture;
  }

  private requireMilestone(
    milestonesById: Map<string, DemoLearningMilestone>,
    milestoneId: string,
  ) {
    const milestone = milestonesById.get(milestoneId);
    if (!milestone) {
      throw new Error(`Missing local demo milestone for ${milestoneId}`);
    }

    return milestone;
  }

  private requireWeeklyDigest(
    weeklyDigestsById: Map<string, DemoLearningWeeklyDigest>,
    weeklyDigestId: string,
  ) {
    const weeklyDigest = weeklyDigestsById.get(weeklyDigestId);
    if (!weeklyDigest) {
      throw new Error(`Missing local demo weekly digest for ${weeklyDigestId}`);
    }

    return weeklyDigest;
  }

  private requireSubscription(
    subscriptionsByEnrollmentId: Map<string, DemoLearningSubscription>,
    enrollment: DemoLearningEnrollment,
  ) {
    const subscription = subscriptionsByEnrollmentId.get(enrollment.id);
    if (!subscription) {
      throw new Error(`Missing local demo subscription for ${enrollment.id}`);
    }

    return subscription;
  }

  private requirePayment(
    paymentsBySubscriptionId: Map<string, DemoLearningPayment>,
    subscription: DemoLearningSubscription,
  ) {
    const payment = paymentsBySubscriptionId.get(subscription.id);
    if (!payment) {
      throw new Error(`Missing local demo payment for ${subscription.id}`);
    }

    return payment;
  }
}
