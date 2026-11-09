import type { DemoLearningAcceptanceTraceabilityGateReport } from './acceptance-traceability-gate.types';
import type { DemoLearningFollowUpActionOutcome } from './follow-up-action-outcome.types';
import type { DemoLearningMvpReadinessOverviewSliceKey } from './mvp-readiness-overview.types';
import type { DemoLearningMvpRoleJourneyEntrypointOwner } from './mvp-role-journey-entrypoints.types';
import type { DemoLearningParentScreenTimeGrantDailyPlanGuardSafety } from './parent-screen-time-grant-daily-plan-guard.types';
import type { DemoLearningRemedialRetryUnresolvedSupportEscalation } from './remedial-retry-unresolved-support-escalation.types';
import type {
  DemoLearningAchievementKind,
  DemoLearningAiTutorChatSessionStatus,
  DemoLearningAiTutorGuardDecision,
  DemoLearningAiTutorMessageRole,
  DemoLearningAiTutorSafetySeverity,
  DemoLearningAiTutorSupportPriority,
  DemoLearningAiTutorSupportRecommendationStatus,
  DemoLearningAiTutorTeacherReviewStatus,
  DemoLearningAiTutorTopicCategory,
  DemoLearningAssignmentKind,
  DemoLearningAssignmentStatus,
  DemoLearningAttendanceStatus,
  DemoLearningBadgeAwardStatus,
  DemoLearningCertificateFixtureStatus,
  DemoLearningClassStatus,
  DemoLearningCommissionStatus,
  DemoLearningContentAssetKind,
  DemoLearningContentClassAssignmentStatus,
  DemoLearningContentOwnerRole,
  DemoLearningContentPublishStatus,
  DemoLearningContentStudentVisibilityStatus,
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
  DemoLearningEnrollmentStatus,
  DemoLearningFeedbackStatus,
  DemoLearningGuardianRelationship,
  DemoLearningLessonStatus,
  DemoLearningMilestoneStatus,
  DemoLearningMvpAcceptanceEvidenceIndexSafetyStatus,
  DemoLearningMvpAcceptanceEvidenceIndexStatus,
  DemoLearningPathStatus,
  DemoLearningPaymentStatus,
  DemoLearningPracticeAttemptStatus,
  DemoLearningProgressStatus,
  DemoLearningRecognitionAudience,
  DemoLearningRecognitionStatus,
  DemoLearningRefundStatus,
  DemoLearningRemedialRetryCompletionStatus,
  DemoLearningReportPermissionActorRole,
  DemoLearningReportPermissionDecision,
  DemoLearningReportPermissionScope,
  DemoLearningScreenTimeGrantDecision,
  DemoLearningScreenTimePolicyStatus,
  DemoLearningSessionCompletionPracticeProgressRollupStatus,
  DemoLearningSessionGateBlockedReason,
  DemoLearningSessionGateDecision,
  DemoLearningSessionStatus,
  DemoLearningSubmissionStatus,
  DemoLearningSubscriptionStatus,
  DemoLearningSupportOutcomeEvidenceStatus,
  DemoLearningVideoEvidenceStatus,
  DemoLearningWeeklyDigestActionOwner,
  DemoLearningWeeklyDigestActionPriority,
  DemoLearningWeeklyDigestActionStatus,
  DemoLearningWeeklyDigestAudience,
  DemoLearningWeeklyDigestDeliveryStatus,
} from './shared-statuses.types';
import type { DemoLearningSubscriptionEntitlementDailyPlanAccessStatus } from './subscription-entitlement-daily-plan-access.types';
import type { DemoLearningTeacherEscalationFollowupResolution } from './teacher-escalation-followup-resolution.types';

export type DemoLearningStudent = {
  id: string;
  childProfileId: string;
  displayName: string;
  parentEmail: string;
  ageBand: string;
};

export type DemoLearningCourse = {
  id: string;
  code: string;
  slug: string;
  title: string;
  levelCode: string;
  packageCode: string;
  packageName: string;
};

export type DemoLearningEnrollment = {
  id: string;
  studentId: string;
  courseId: string;
  status: DemoLearningEnrollmentStatus;
  source: 'SELF_SERVICE' | 'SALE_ASSISTED';
  enrolledAt: string;
  startedAt?: string;
  canceledAt?: string;
  note?: string;
};

export type DemoLearningSubscription = {
  id: string;
  enrollmentId: string;
  planCode: string;
  packageCode: string;
  status: DemoLearningSubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  priceCents: number;
  currency: DemoLearningCurrency;
  provider: 'fixture_manual_bank_transfer';
  providerRef: string;
};

export type DemoLearningPayment = {
  id: string;
  subscriptionId: string;
  amountCents: number;
  currency: DemoLearningCurrency;
  status: DemoLearningPaymentStatus;
  provider: 'fixture_manual_bank_transfer';
  providerRef: string;
  paidAt?: string;
};

export type DemoLearningRefund = {
  id: string;
  paymentId: string;
  subscriptionId: string;
  amountCents: number;
  currency: DemoLearningCurrency;
  status: DemoLearningRefundStatus;
  reason: string;
  refundedAt?: string;
};

export type DemoLearningCommission = {
  id: string;
  enrollmentId: string;
  paymentId: string;
  beneficiaryType: 'SALE' | 'AGENCY';
  beneficiaryName: string;
  rateBps: number;
  baseAmountCents: number;
  amountCents: number;
  currency: DemoLearningCurrency;
  status: DemoLearningCommissionStatus;
  availableAt?: string;
  approvedAt?: string;
  canceledReason?: string;
};

export type DemoLearningClassCohort = {
  id: string;
  courseId: string;
  code: string;
  title: string;
  teacherName: string;
  status: DemoLearningClassStatus;
  startsAt: string;
  endsAt?: string;
  enrollmentIds: string[];
};

export type DemoLearningSession = {
  id: string;
  classId: string;
  courseId: string;
  sequence: number;
  lessonCode: string;
  title: string;
  status: DemoLearningSessionStatus;
  scheduledStart: string;
  scheduledEnd: string;
};

export type DemoLearningLesson = {
  id: string;
  classId: string;
  courseId: string;
  sessionId: string;
  sequence: number;
  code: string;
  title: string;
  status: DemoLearningLessonStatus;
  objective: string;
};

export type DemoLearningAssignment = {
  id: string;
  lessonId: string;
  classId: string;
  courseId: string;
  kind: DemoLearningAssignmentKind;
  title: string;
  status: DemoLearningAssignmentStatus;
  dueAt: string;
  maxScore: number;
};

export type DemoLearningSubmission = {
  id: string;
  assignmentId: string;
  enrollmentId: string;
  studentId: string;
  status: DemoLearningSubmissionStatus;
  attemptNumber: number;
  submittedAt?: string;
  scoredAt?: string;
  scorePercent?: number;
  feedbackStatus: DemoLearningFeedbackStatus;
  feedbackSummary?: string;
};

export type DemoLearningAttendanceRecord = {
  id: string;
  sessionId: string;
  classId: string;
  enrollmentId: string;
  studentId: string;
  status: DemoLearningAttendanceStatus;
  recordedAt: string;
  note?: string;
};

export type DemoLearningProgressRecord = {
  id: string;
  enrollmentId: string;
  studentId: string;
  courseId: string;
  classId: string;
  status: DemoLearningProgressStatus;
  completedLessonCount: number;
  totalLessonCount: number;
  completionPercent: number;
  completedSessionIds: string[];
  lastActivityAt: string;
  teacherNote?: string;
};

export type DemoLearningPath = {
  id: string;
  enrollmentId: string;
  studentId: string;
  courseId: string;
  classId: string;
  title: string;
  status: DemoLearningPathStatus;
  startsAt: string;
  targetCompletionAt: string;
};

export type DemoLearningDailyPlan = {
  id: string;
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  courseId: string;
  classId: string;
  lessonId: string;
  sequence: number;
  planDate: string;
  title: string;
  status: DemoLearningDailyPlanStatus;
  requiredVideoSeconds: number;
  requiredPracticeAttempts: number;
};

export type DemoLearningVideoEvidence = {
  id: string;
  dailyPlanId: string;
  learningPathId: string;
  lessonId: string;
  enrollmentId: string;
  studentId: string;
  videoId: string;
  title: string;
  status: DemoLearningVideoEvidenceStatus;
  watchedSeconds: number;
  requiredSeconds: number;
  completedAt?: string;
  evidenceSource: 'fixture_lms_video_player';
};

export type DemoLearningPracticeAttempt = {
  id: string;
  dailyPlanId: string;
  learningPathId: string;
  lessonId: string;
  assignmentId?: string;
  enrollmentId: string;
  studentId: string;
  status: DemoLearningPracticeAttemptStatus;
  attemptNumber: number;
  scorePercent?: number;
  submittedAt?: string;
  evidenceSource: 'fixture_lms_practice_engine';
};

export type DemoLearningParentGuardian = {
  id: string;
  displayName: string;
  email: string;
  relationship: DemoLearningGuardianRelationship;
  childProfileIds: string[];
  preferredContact: 'EMAIL';
  fixtureConsentOnly: true;
};

export type DemoLearningScreenTimePolicy = {
  id: string;
  guardianId: string;
  studentId: string;
  childProfileId: string;
  status: DemoLearningScreenTimePolicyStatus;
  dailyAllowedMinutes: number;
  safeLearningWindowStart: string;
  safeLearningWindowEnd: string;
  effectiveFrom: string;
  policySource: 'fixture_parent_controls';
};

export type DemoLearningSessionGate = {
  id: string;
  dailyPlanId: string;
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  policyId: string;
  requestedAt: string;
  requestedMinutes: number;
  usedMinutesBeforeSession: number;
  decision: DemoLearningSessionGateDecision;
  blockedReason?: DemoLearningSessionGateBlockedReason;
  decidedBy:
    | 'fixture_screen_time_policy'
    | 'fixture_parent_grant'
    | 'fixture_withdrawal_guard';
  accessMode: 'SAFE_DAILY_PLAN' | 'BLOCKED';
};

export type DemoLearningScreenTimeGrantRequest = {
  id: string;
  sessionGateId: string;
  guardianId: string;
  studentId: string;
  childProfileId: string;
  requestedExtraMinutes: number;
  requestedAt: string;
  decision: DemoLearningScreenTimeGrantDecision;
  decidedAt?: string;
  grantedMinutes: number;
  decisionReason: string;
  fixtureDecisionSource: 'fixture_parent_approval';
};

export type DemoLearningContentOwner = {
  id: string;
  displayName: string;
  email: string;
  role: DemoLearningContentOwnerRole;
  classIds: string[];
  fixtureOnly: true;
};

export type DemoLearningContentLibraryItem = {
  id: string;
  ownerId: string;
  courseId: string;
  lessonId: string;
  assetKind: DemoLearningContentAssetKind;
  assetRef: string;
  title: string;
  publishStatus: DemoLearningContentPublishStatus;
  createdAt: string;
  updatedAt: string;
  needsTeacherReview: boolean;
  blockedReason?: string;
  fixtureAssetSource: 'fixture_content_library';
};

export type DemoLearningContentClassAssignment = {
  id: string;
  contentItemId: string;
  classId: string;
  assignedByOwnerId: string;
  assignmentStatus: DemoLearningContentClassAssignmentStatus;
  assignedAt: string;
  blockedReason?: string;
  fixtureAssignmentSource: 'fixture_learning_path_publish';
};

export type DemoLearningContentStudentVisibility = {
  id: string;
  classAssignmentId: string;
  contentItemId: string;
  learningPathId: string;
  dailyPlanId: string;
  studentId: string;
  parentGuardianId: string;
  visibilityStatus: DemoLearningContentStudentVisibilityStatus;
  studentVisible: boolean;
  parentVisible: boolean;
  availableOnDailyPlan: boolean;
  publishedAt?: string;
  blockedReason?: string;
  fixtureVisibilitySource: 'fixture_learning_path_publish';
};

export type DemoLearningAiTutorChatSession = {
  id: string;
  enrollmentId: string;
  studentId: string;
  learningPathId: string;
  dailyPlanId: string;
  lessonId: string;
  status: DemoLearningAiTutorChatSessionStatus;
  startedAt: string;
  endedAt?: string;
  fixtureSessionSource: 'fixture_ai_tutor_chat';
};

export type DemoLearningAiTutorChatMessage = {
  id: string;
  chatSessionId: string;
  role: DemoLearningAiTutorMessageRole;
  sequence: number;
  sentAt: string;
  topicCategory: DemoLearningAiTutorTopicCategory;
  guardDecision: DemoLearningAiTutorGuardDecision;
  blockedTopic: boolean;
  messagePreview: string;
  fixtureMessageSource: 'fixture_ai_tutor_chat';
};

export type DemoLearningAiTutorSafetyFlag = {
  id: string;
  chatSessionId: string;
  messageId: string;
  studentId: string;
  topicCategory: DemoLearningAiTutorTopicCategory;
  guardDecision: DemoLearningAiTutorGuardDecision;
  severity: DemoLearningAiTutorSafetySeverity;
  reason: string;
  blockedTopic: boolean;
  fixtureGuardrailSource: 'fixture_ai_tutor_safety_guard';
};

export type DemoLearningAiTutorTeacherReviewItem = {
  id: string;
  chatSessionId: string;
  safetyFlagId: string;
  studentId: string;
  assignedTeacherName: string;
  status: DemoLearningAiTutorTeacherReviewStatus;
  createdAt: string;
  reviewedAt?: string;
  actionSummary: string;
  fixtureReviewSource: 'fixture_teacher_review_queue';
};

export type DemoLearningAiTutorParentSummary = {
  id: string;
  chatSessionId: string;
  studentId: string;
  parentGuardianId: string;
  createdAt: string;
  summary: string;
  fixtureSummarySource: 'fixture_parent_summary';
};

export type DemoLearningAiTutorSupportRecommendation = {
  id: string;
  chatSessionId: string;
  teacherReviewItemId: string;
  studentId: string;
  learningPathId: string;
  dailyPlanId: string;
  priority: DemoLearningAiTutorSupportPriority;
  status: DemoLearningAiTutorSupportRecommendationStatus;
  recommendation: string;
  fixtureRecommendationSource: 'fixture_learning_support_report';
};

export type DemoLearningAchievementRecord = {
  id: string;
  studentId: string;
  enrollmentId: string;
  courseId: string;
  classId: string;
  learningPathId: string;
  dailyPlanId: string;
  lessonId: string;
  assignmentId?: string;
  progressId: string;
  aiTutorSupportRecommendationId?: string;
  achievementKind: DemoLearningAchievementKind;
  earnedAt: string;
  evidenceScorePercent?: number;
  points: number;
  evidenceSummary: string;
  fixtureAchievementSource: 'fixture_student_achievement_report';
};

export type DemoLearningBadgeAward = {
  id: string;
  studentId: string;
  enrollmentId: string;
  courseId: string;
  classId: string;
  badgeCode: string;
  badgeName: string;
  status: DemoLearningBadgeAwardStatus;
  awardedAt: string;
  achievementRecordIds: string[];
  pointsRequired: number;
  badgeSummary: string;
  fixtureBadgeSource: 'fixture_badge_award_report';
};

export type DemoLearningCertificateFixture = {
  id: string;
  studentId: string;
  enrollmentId: string;
  courseId: string;
  classId: string;
  learningPathId: string;
  status: DemoLearningCertificateFixtureStatus;
  eligibleAt?: string;
  heldReason?: string;
  completedBadgeAwardIds: string[];
  pendingMilestoneIds: string[];
  certificateTitle: string;
  certificatePreviewRef: string;
  fixtureCertificateSource: 'fixture_certificate_preview_only';
};

export type DemoLearningMilestone = {
  id: string;
  studentId: string;
  enrollmentId: string;
  courseId: string;
  classId: string;
  learningPathId: string;
  dailyPlanId: string;
  lessonId: string;
  title: string;
  status: DemoLearningMilestoneStatus;
  completedAt?: string;
  pendingReason?: string;
  fixtureMilestoneSource: 'fixture_learning_milestone_report';
};

export type DemoLearningRecognitionSummary = {
  id: string;
  studentId: string;
  parentGuardianId: string;
  courseId: string;
  classId: string;
  audience: DemoLearningRecognitionAudience;
  status: DemoLearningRecognitionStatus;
  parentVisible: boolean;
  teacherReviewRequired: boolean;
  encouragementNeeded: boolean;
  sourceBadgeAwardId?: string;
  sourceCertificateFixtureId?: string;
  sourceAiTutorSupportRecommendationId?: string;
  summary: string;
  createdAt: string;
  fixtureRecognitionSource: 'fixture_recognition_summary_report';
};

export type DemoLearningWeeklyDigest = {
  id: string;
  studentId: string;
  enrollmentId: string;
  courseId: string;
  classId: string;
  parentGuardianId: string;
  weekStart: string;
  weekEnd: string;
  audience: DemoLearningWeeklyDigestAudience;
  deliveryStatus: DemoLearningWeeklyDigestDeliveryStatus;
  parentVisible: boolean;
  sourceAlertIds: string[];
  sourceRecognitionSummaryIds: string[];
  sourceAiTutorTeacherReviewItemIds: string[];
  sourceCertificateFixtureId?: string;
  highlight: string;
  riskSummary: string;
  parentSummary: string;
  teacherNote: string;
  fixtureDigestSource: 'fixture_parent_teacher_weekly_digest';
};

export type DemoLearningWeeklyDigestAction = {
  id: string;
  digestId: string;
  studentId: string;
  owner: DemoLearningWeeklyDigestActionOwner;
  priority: DemoLearningWeeklyDigestActionPriority;
  status: DemoLearningWeeklyDigestActionStatus;
  dueAt: string;
  sourceAlertId?: string;
  sourceRecognitionSummaryId?: string;
  actionSummary: string;
  fixtureActionSource: 'fixture_parent_teacher_weekly_digest';
};

export type DemoLearningRemedialRetryCompletion = {
  id: string;
  studentId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  remedialDailyPlanId: string;
  remedialPracticeAttemptId: string;
  retryStatus: DemoLearningRemedialRetryCompletionStatus;
  completedAt: string;
  completionPercent: number;
  scorePercent: number;
  supportOutcomeId: string;
  supportOutcomeStatus: DemoLearningSupportOutcomeEvidenceStatus;
  outcomeAt: string;
  parentFollowupSummaryId: string;
  teacherFollowupSummaryId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  evidenceSummary: string;
  outcomeSummary: string;
  parentFollowupSummary: string;
  teacherFollowupSummary: string;
  fixtureRetrySource: 'fixture_remedial_retry_completion_support_outcome';
};

export type DemoLearningCoreFixture = {
  generatedFor: string;
  currency: DemoLearningCurrency;
  students: DemoLearningStudent[];
  courses: DemoLearningCourse[];
  enrollments: DemoLearningEnrollment[];
  subscriptions: DemoLearningSubscription[];
  payments: DemoLearningPayment[];
  refunds: DemoLearningRefund[];
  commissions: DemoLearningCommission[];
  classes: DemoLearningClassCohort[];
  sessions: DemoLearningSession[];
  lessons: DemoLearningLesson[];
  assignments: DemoLearningAssignment[];
  submissions: DemoLearningSubmission[];
  attendance: DemoLearningAttendanceRecord[];
  progress: DemoLearningProgressRecord[];
  learningPaths: DemoLearningPath[];
  dailyPlans: DemoLearningDailyPlan[];
  videoEvidence: DemoLearningVideoEvidence[];
  practiceAttempts: DemoLearningPracticeAttempt[];
  parentGuardians: DemoLearningParentGuardian[];
  screenTimePolicies: DemoLearningScreenTimePolicy[];
  sessionGates: DemoLearningSessionGate[];
  screenTimeGrantRequests: DemoLearningScreenTimeGrantRequest[];
  contentOwners: DemoLearningContentOwner[];
  contentLibraryItems: DemoLearningContentLibraryItem[];
  contentClassAssignments: DemoLearningContentClassAssignment[];
  contentStudentVisibilities: DemoLearningContentStudentVisibility[];
  aiTutorChatSessions: DemoLearningAiTutorChatSession[];
  aiTutorChatMessages: DemoLearningAiTutorChatMessage[];
  aiTutorSafetyFlags: DemoLearningAiTutorSafetyFlag[];
  aiTutorTeacherReviewItems: DemoLearningAiTutorTeacherReviewItem[];
  aiTutorParentSummaries: DemoLearningAiTutorParentSummary[];
  aiTutorSupportRecommendations: DemoLearningAiTutorSupportRecommendation[];
  achievementRecords: DemoLearningAchievementRecord[];
  badgeAwards: DemoLearningBadgeAward[];
  certificateFixtures: DemoLearningCertificateFixture[];
  milestones: DemoLearningMilestone[];
  recognitionSummaries: DemoLearningRecognitionSummary[];
  weeklyDigests: DemoLearningWeeklyDigest[];
  weeklyDigestActions: DemoLearningWeeklyDigestAction[];
  followUpActionOutcomes: DemoLearningFollowUpActionOutcome[];
  remedialRetryCompletions: DemoLearningRemedialRetryCompletion[];
  remedialRetryUnresolvedEscalations: DemoLearningRemedialRetryUnresolvedSupportEscalation[];
  teacherEscalationFollowupResolutions: DemoLearningTeacherEscalationFollowupResolution[];
};

export type DemoLearningParentTeacherReportPermissionCaseRow = {
  permissionCaseId: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: DemoLearningReportPermissionActorRole;
  reportScope: DemoLearningReportPermissionScope;
  permissionDecision: DemoLearningReportPermissionDecision;
  decisionReason: string;
  targetStudentId: string | null;
  targetChildProfileId: string | null;
  targetStudentName: string | null;
  targetCourseId: string | null;
  targetCourseCode: string | null;
  targetClassId: string | null;
  targetClassCode: string | null;
  progressSummaryId: string | null;
  sourceParentSummaryId: string | null;
  sourceTeacherSummaryId: string | null;
  sourceAccessStatus:
    | DemoLearningSubscriptionEntitlementDailyPlanAccessStatus
    | 'CLASS_SCOPE'
    | 'SUPPORT_AUDIT_SCOPE'
    | 'DENIED_SCOPE';
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  visibleFieldCount: number;
  redactedFieldCount: number;
  deniedFieldCount: number;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  caseSummary: string;
};

export type DemoLearningMvpAcceptanceEvidenceIndexOwnerLabel =
  DemoLearningMvpRoleJourneyEntrypointOwner;

export type DemoLearningMvpAcceptanceEvidenceIndexStatusCounts = {
  statusLabel: Record<DemoLearningMvpAcceptanceEvidenceIndexStatus, number>;
  ownerLabel: Record<DemoLearningMvpAcceptanceEvidenceIndexOwnerLabel, number>;
  safetyStatus: Record<
    DemoLearningMvpAcceptanceEvidenceIndexSafetyStatus,
    number
  >;
};

export type DemoLearningMvpAcceptanceEvidenceIndexTotals = {
  evidenceIndexRowCount: number;
  acceptanceCriterionCount: number;
  mappedCriterionCount: number;
  readinessSliceCount: number;
  endpointEvidenceCount: number;
  dashboardAnchorEvidenceCount: number;
  jsonExportEvidenceCount: number;
  markdownExportEvidenceCount: number;
  roleJourneyEvidenceCount: number;
  endToEndTraceEvidenceCount: number;
  parentReadReceiptAlignmentEvidenceCount: number;
  teacherEscalationResolutionEvidenceCount: number;
  deterministicStatusReasonActionOwnerCount: number;
  coreStudentCoursePathEvidenceCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningMvpAcceptanceEvidenceIndexRow = {
  evidenceIndexRowId: string;
  acceptanceCriterionId: string;
  acceptanceCriterionName: string;
  sliceKey: DemoLearningMvpReadinessOverviewSliceKey;
  sliceName: string;
  endpointPath: string;
  dashboardAnchor: string;
  jsonExportPath: string;
  markdownExportPath: string;
  coreStudentCoursePath: string;
  coreStudentId: string;
  coreCourseId: string;
  coreLearningPathId: string;
  safetyStatus: DemoLearningMvpAcceptanceEvidenceIndexSafetyStatus;
  statusLabel: DemoLearningMvpAcceptanceEvidenceIndexStatus;
  reasonLabel: string;
  actionLabel: string;
  ownerLabel: DemoLearningMvpAcceptanceEvidenceIndexOwnerLabel;
  linkedRoleJourneyEvidence: boolean;
  linkedEndToEndTraceEvidence: boolean;
  linkedParentReadReceiptAlignmentEvidence: boolean;
  linkedTeacherEscalationResolutionEvidence: boolean;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  productionReady: false;
  evidenceSummary: string;
};

export type DemoLearningMvpAcceptanceEvidenceIndexEvidenceRow = {
  evidenceKind:
    | 'ACCEPTANCE_CRITERION_MAPPING'
    | 'ENDPOINT'
    | 'DASHBOARD_ANCHOR'
    | 'JSON_EXPORT'
    | 'MARKDOWN_EXPORT'
    | 'ROLE_JOURNEY'
    | 'END_TO_END_TRACE'
    | 'PARENT_READ_RECEIPT_ALIGNMENT'
    | 'TEACHER_ESCALATION_RESOLUTION'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningMvpAcceptanceEvidenceIndexReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningAcceptanceTraceabilityGateReport['safety'];
  currentStatus: {
    status: DemoLearningMvpAcceptanceEvidenceIndexStatus;
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningMvpAcceptanceEvidenceIndexTotals;
  statusCounts: DemoLearningMvpAcceptanceEvidenceIndexStatusCounts;
  evidenceIndexRows: DemoLearningMvpAcceptanceEvidenceIndexRow[];
  evidenceRows: DemoLearningMvpAcceptanceEvidenceIndexEvidenceRow[];
};

export type DemoLearningSessionCompletionPracticeProgressRollupSafety =
  DemoLearningParentScreenTimeGrantDailyPlanGuardSafety & {
    realLearningSessionCompletionMutationUsed: false;
    realParentProgressSummaryMutationUsed: false;
    realTeacherProgressSummaryMutationUsed: false;
  };

export type DemoLearningSessionCompletionPracticeProgressRollupRow = {
  progressRollupId: string;
  stableTraceKey: string;
  stableTraceIds: string[];
  accessCaseId: string;
  learningSessionEvidenceId: string;
  sessionGateId: string;
  sessionId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  parentGuardianName: string;
  teacherName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  learningPathId: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  videoEvidenceId: string;
  videoEvidenceStatus: DemoLearningVideoEvidenceStatus;
  videoCompletionPercent: number;
  lessonCompletionEvidenceId: string;
  lessonCompletionStatus: DemoLearningVideoEvidenceStatus;
  practiceAttemptId: string;
  practiceAttemptStatus: DemoLearningPracticeAttemptStatus;
  practiceAttemptNumber: number;
  practiceScorePercent: number;
  progressRecordId: string;
  completionPercent: number;
  progressStatus: DemoLearningProgressStatus;
  rollupStatus: DemoLearningSessionCompletionPracticeProgressRollupStatus;
  parentVisibleProgressSummaryId: string;
  teacherVisibleProgressSummaryId: string;
  nextSafeActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};
