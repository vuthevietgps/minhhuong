export type DemoLearningCurrency = 'VND';

export type DemoLearningEnrollmentStatus = 'ACTIVE' | 'PENDING' | 'CANCELED';

export type DemoLearningSubscriptionStatus =
  'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export type DemoLearningPaymentStatus =
  'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export type DemoLearningRefundStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED';

export type DemoLearningCommissionStatus =
  'PENDING' | 'PAYABLE' | 'APPROVED' | 'CANCELED';

export type DemoLearningClassStatus = 'ACTIVE' | 'COMPLETED';

export type DemoLearningSessionStatus = 'SCHEDULED' | 'COMPLETED';

export type DemoLearningLessonStatus = 'PUBLISHED' | 'SCHEDULED';

export type DemoLearningAssignmentKind = 'ASSIGNMENT' | 'QUIZ';

export type DemoLearningAssignmentStatus = 'OPEN' | 'CLOSED';

export type DemoLearningSubmissionStatus =
  'SUBMITTED' | 'LATE' | 'MISSING' | 'RESUBMITTED';

export type DemoLearningFeedbackStatus = 'GIVEN' | 'PENDING' | 'NOT_REQUIRED';

export type DemoLearningAssessmentBand =
  'EXCELLENT' | 'ON_TRACK' | 'NEEDS_SUPPORT' | 'MISSING' | 'WITHDRAWN';

export type DemoLearningPathStatus =
  'ACTIVE' | 'COMPLETED' | 'NEEDS_SUPPORT' | 'WITHDRAWN';

export type DemoLearningDailyPlanStatus =
  'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'SKIPPED' | 'ASSIGNED';

export type DemoLearningVideoEvidenceStatus =
  'COMPLETED' | 'INCOMPLETE' | 'SKIPPED';

export type DemoLearningPracticeAttemptStatus =
  'PASSED' | 'NEEDS_RETRY' | 'INCOMPLETE' | 'SKIPPED';

export type DemoLearningPathLearnerBand =
  'ON_TRACK' | 'NEEDS_SUPPORT' | 'INACTIVE' | 'WITHDRAWN';

export type DemoLearningProgressAlertSeverity = 'HIGH' | 'MEDIUM';

export type DemoLearningProgressAlertReason =
  | 'MISSING_SUBMISSIONS'
  | 'LOW_PRACTICE_SCORE'
  | 'SKIPPED_VIDEO'
  | 'ATTENDANCE_SESSION_GAP'
  | 'STALLED_DAILY_PLAN';

export type DemoLearningProgressAlertFollowUpStatus =
  'OPEN' | 'SCHEDULED' | 'RESOLVED' | 'MONITORING';

export type DemoLearningGuardianRelationship = 'MOTHER' | 'FATHER' | 'GUARDIAN';

export type DemoLearningScreenTimePolicyStatus =
  'ACTIVE' | 'PAUSED' | 'DISABLED';

export type DemoLearningSessionGateDecision =
  'ALLOWED' | 'BLOCKED' | 'OVERRIDE_ALLOWED';

export type DemoLearningSessionGateBlockedReason =
  | 'DAILY_LIMIT_EXCEEDED'
  | 'GUARDIAN_DENIED_GRANT'
  | 'POLICY_DISABLED_WITHDRAWN';

export type DemoLearningScreenTimeGrantDecision =
  'APPROVED' | 'DENIED' | 'PENDING';

export type DemoLearningContentOwnerRole = 'TEACHER' | 'ADMIN';

export type DemoLearningContentAssetKind = 'VIDEO' | 'PRACTICE' | 'LESSON';

export type DemoLearningContentPublishStatus =
  'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type DemoLearningContentClassAssignmentStatus =
  'PUBLISHED' | 'BLOCKED_UNPUBLISHED';

export type DemoLearningContentStudentVisibilityStatus =
  'VISIBLE' | 'BLOCKED_UNPUBLISHED' | 'BLOCKED_ARCHIVED';

export type DemoLearningAiTutorChatSessionStatus =
  'ACTIVE' | 'ESCALATED' | 'CLOSED';

export type DemoLearningAiTutorMessageRole = 'STUDENT' | 'AI_TUTOR';

export type DemoLearningAiTutorGuardDecision = 'ALLOWED' | 'BLOCKED';

export type DemoLearningAiTutorTopicCategory =
  | 'LESSON_HELP'
  | 'PRACTICE_HINT'
  | 'STUDY_PLANNING'
  | 'PERSONAL_DATA'
  | 'OFF_TOPIC_GAMING'
  | 'ACCOUNT_ACCESS'
  | 'SAFETY_REDIRECT'
  | 'ACADEMIC_INTEGRITY';

export type DemoLearningAiTutorSafetySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type DemoLearningAiTutorTeacherReviewStatus =
  'OPEN' | 'REVIEWED' | 'RESOLVED';

export type DemoLearningAiTutorSupportPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type DemoLearningAiTutorSupportRecommendationStatus =
  'RECOMMENDED' | 'MONITORING' | 'COMPLETED';

export type DemoLearningAchievementKind =
  | 'LESSON_MASTERY'
  | 'PRACTICE_STREAK'
  | 'ASSESSMENT_SCORE'
  | 'SAFE_TUTOR_USE'
  | 'COURSE_COMPLETION';

export type DemoLearningBadgeAwardStatus =
  'AWARDED' | 'HELD_FOR_TEACHER_REVIEW';

export type DemoLearningCertificateFixtureStatus =
  'READY' | 'PENDING' | 'HELD_FOR_REVIEW';

export type DemoLearningMilestoneStatus = 'COMPLETED' | 'PENDING';

export type DemoLearningRecognitionAudience = 'PARENT' | 'TEACHER';

export type DemoLearningRecognitionStatus =
  'PARENT_VISIBLE' | 'TEACHER_REVIEW' | 'ENCOURAGEMENT_NEEDED';

export type DemoLearningWeeklyDigestAudience = 'PARENT' | 'TEACHER';

export type DemoLearningWeeklyDigestDeliveryStatus =
  'READY_TO_SEND' | 'TEACHER_REVIEW' | 'HELD_WITHDRAWN';

export type DemoLearningWeeklyDigestActionPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type DemoLearningWeeklyDigestActionStatus =
  'RECOMMENDED' | 'SCHEDULED' | 'COMPLETED' | 'HELD';

export type DemoLearningWeeklyDigestActionOwner = 'PARENT' | 'TEACHER';

export type DemoLearningFollowUpActionOutcomeStatus =
  'COMPLETED' | 'VERIFIED' | 'SCHEDULED' | 'MONITORING' | 'HELD';

export type DemoLearningFollowUpActionOutcomeImpact =
  'POSITIVE' | 'STABLE' | 'NEEDS_SUPPORT' | 'NO_SEND';

export type DemoLearningRemedialRetryCompletionStatus = 'COMPLETED';

export type DemoLearningRemedialRetryUnresolvedAttemptStatus =
  'FAILED' | 'INCOMPLETE';

export type DemoLearningSupportOutcomeEvidenceStatus = 'IMPROVED';

export type DemoLearningUnresolvedSupportOutcomeStatus = 'UNRESOLVED';

export type DemoLearningUnresolvedSupportOutcomeReasonCode =
  'RETRY_SCORE_BELOW_THRESHOLD' | 'RETRY_INCOMPLETE';

export type DemoLearningTeacherEscalationStatus = 'SCHEDULED';

export type DemoLearningSupportAdjustmentStatus = 'ADJUSTED';

export type DemoLearningTeacherReviewedEscalationStatus = 'REVIEWED';

export type DemoLearningAdjustedSupportRetryCompletionStatus = 'COMPLETED';

export type DemoLearningResolvedSupportOutcomeStatus = 'RESOLVED';

export type DemoLearningResolvedSupportOutcomeReasonCode =
  'ADJUSTED_RETRY_COMPLETED';

export type DemoLearningMvpReadinessOverviewStatus =
  'LOCAL_DEMO_READY' | 'LOCAL_DEMO_READY_WITH_NOTES' | 'NEEDS_LOCAL_DEMO_FIX';

export type DemoLearningMvpReadinessOverviewSliceKey =
  | 'ENROLLMENT'
  | 'SUBSCRIPTION_FIXTURE'
  | 'REFUNDS_COMMISSION_FIXTURE'
  | 'DAILY_PLAN'
  | 'LESSON_ASSIGNMENT'
  | 'PROGRESS'
  | 'SESSION_COMPLETION_PRACTICE_ROLLUP'
  | 'TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN'
  | 'REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP'
  | 'REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION'
  | 'TEACHER_ESCALATION_FOLLOWUP_RESOLUTION'
  | 'MVP_END_TO_END_READINESS_TRACE'
  | 'MVP_ROLE_JOURNEY_ENTRYPOINTS'
  | 'REPORT_REVIEW_PREVIEW'
  | 'PARENT_PORTAL_INBOX_READ_RECEIPT'
  | 'PARENT_SCREEN_TIME_DAILY_PLAN_GUARD'
  | 'AI_TUTOR_EVIDENCE'
  | 'ACHIEVEMENTS'
  | 'WEEKLY_DIGEST'
  | 'FOLLOW_UP_OUTCOMES';

export type DemoLearningAcceptanceTraceabilityGateStatus =
  'MAPPED_LOCAL_DEMO' | 'NEEDS_LOCAL_DEMO_EVIDENCE';

export type DemoLearningAttendanceStatus =
  'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type DemoLearningProgressStatus =
  'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_SUPPORT' | 'COMPLETED' | 'WITHDRAWN';

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

export type DemoLearningFollowUpActionOutcome = {
  id: string;
  weeklyDigestActionId: string;
  digestId: string;
  studentId: string;
  outcomeStatus: DemoLearningFollowUpActionOutcomeStatus;
  impactBand: DemoLearningFollowUpActionOutcomeImpact;
  parentVisible: boolean;
  outcomeAt?: string;
  nextReviewAt?: string;
  sourceDailyPlanId?: string;
  sourceAiTutorSupportRecommendationId?: string;
  sourceAchievementRecordId?: string;
  sourceAiTutorParentSummaryId?: string;
  sourceAiTutorTeacherReviewItemId?: string;
  evidenceSummary: string;
  outcomeSummary: string;
  fixtureOutcomeSource: 'fixture_followup_action_outcome_report';
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

export type DemoLearningRemedialRetryUnresolvedSupportEscalation = {
  id: string;
  studentId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  remedialDailyPlanId: string;
  remedialPracticeAttemptId: string;
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  attemptedAt: string;
  completionPercent: number;
  scorePercent: number;
  unresolvedOutcomeId: string;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  outcomeAt: string;
  teacherEscalationId: string;
  teacherEscalationStatus: DemoLearningTeacherEscalationStatus;
  supportAdjustmentId: string;
  supportAdjustmentStatus: DemoLearningSupportAdjustmentStatus;
  parentEscalationSummaryId: string;
  teacherEscalationNextActionId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  evidenceSummary: string;
  unresolvedOutcomeSummary: string;
  teacherEscalationSummary: string;
  supportAdjustmentSummary: string;
  parentEscalationSummary: string;
  teacherNextActionSummary: string;
  fixtureRetrySource: 'fixture_remedial_retry_unresolved_support_escalation';
};

export type DemoLearningTeacherEscalationFollowupResolution = {
  id: string;
  studentId: string;
  unresolvedRetryAttemptId: string;
  unresolvedOutcomeId: string;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  teacherReviewedEscalationId: string;
  teacherReviewedEscalationStatus: DemoLearningTeacherReviewedEscalationStatus;
  teacherReviewedAt: string;
  adjustedSupportRetryCompletionId: string;
  adjustedSupportRetryStatus: DemoLearningAdjustedSupportRetryCompletionStatus;
  completedAt: string;
  completionPercent: number;
  scorePercent: number;
  resolvedSupportOutcomeId: string;
  resolvedSupportOutcomeStatus: DemoLearningResolvedSupportOutcomeStatus;
  resolvedOutcomeReasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  resolvedOutcomeAt: string;
  parentClosureSummaryId: string;
  teacherClosureNoteId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  evidenceSummary: string;
  teacherReviewSummary: string;
  adjustedRetryCompletionSummary: string;
  resolvedOutcomeSummary: string;
  parentClosureSummary: string;
  teacherClosureNoteSummary: string;
  fixtureResolutionSource: 'fixture_teacher_escalation_followup_resolution_report';
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

export type DemoLearningStatusCounts = {
  enrollment: Record<DemoLearningEnrollmentStatus, number>;
  subscription: Record<DemoLearningSubscriptionStatus, number>;
  payment: Record<DemoLearningPaymentStatus, number>;
  refund: Record<DemoLearningRefundStatus, number>;
  commission: Record<DemoLearningCommissionStatus, number>;
};

export type DemoLearningReportTotals = {
  studentCount: number;
  courseCount: number;
  enrollmentCount: number;
  activeEnrollmentCount: number;
  pendingEnrollmentCount: number;
  canceledEnrollmentCount: number;
  subscriptionCount: number;
  activeSubscriptionCount: number;
  trialingSubscriptionCount: number;
  canceledSubscriptionCount: number;
  paymentCount: number;
  pendingPaymentCount: number;
  succeededPaymentCount: number;
  refundedPaymentCount: number;
  refundCount: number;
  succeededRefundCount: number;
  commissionCount: number;
  pendingCommissionCount: number;
  payableCommissionCount: number;
  approvedCommissionCount: number;
  canceledCommissionCount: number;
  grossPaidCents: number;
  pendingPaymentCents: number;
  refundedCents: number;
  netRevenueCents: number;
  commissionPendingCents: number;
  commissionPayableCents: number;
  commissionApprovedCents: number;
  commissionCanceledCents: number;
  commissionEarnedCents: number;
};

export type DemoLearningEnrollmentReportRow = {
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  levelCode: string;
  packageCode: string;
  packageName: string;
  enrollmentStatus: DemoLearningEnrollmentStatus;
  enrollmentSource: DemoLearningEnrollment['source'];
  subscriptionId: string;
  subscriptionStatus: DemoLearningSubscriptionStatus;
  planCode: string;
  paymentId: string;
  paymentStatus: DemoLearningPaymentStatus;
  refundIds: string[];
  refundStatus: DemoLearningRefundStatus | 'NONE';
  commissionIds: string[];
  grossPaidCents: number;
  pendingPaymentCents: number;
  refundedCents: number;
  netRevenueCents: number;
  commissionPendingCents: number;
  commissionPayableCents: number;
  commissionApprovedCents: number;
  commissionCanceledCents: number;
};

export type DemoLearningCourseAggregateRow = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  enrollmentCount: number;
  activeEnrollmentCount: number;
  pendingEnrollmentCount: number;
  canceledEnrollmentCount: number;
  grossPaidCents: number;
  refundedCents: number;
  netRevenueCents: number;
  commissionEarnedCents: number;
};

export type DemoLearningCoreReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    providerApiUsed: false;
    paymentProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningReportTotals;
  statusCounts: DemoLearningStatusCounts;
  courseAggregates: DemoLearningCourseAggregateRow[];
  rows: DemoLearningEnrollmentReportRow[];
};

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety = {
  productionReady: false;
  fixtureOnly: true;
  productionDbUsed: false;
  noProductionDbRead: true;
  providerApiUsed: false;
  paymentProviderUsed: false;
  aiProviderExecutionUsed: false;
  notificationProviderUsed: false;
  liveAdsExecuted: false;
  realStudentMutationUsed: false;
  realCourseMutationUsed: false;
  realEnrollmentMutationUsed: false;
  realSubscriptionMutationUsed: false;
  realPaymentMutationUsed: false;
  realRefundMutationUsed: false;
  realCommissionMutationUsed: false;
  realLearningMutationUsed: false;
  realErpMutationUsed: false;
  secretsRequired: false;
};

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowTotals = {
  studentCount: number;
  courseCount: number;
  enrollmentCount: number;
  subscriptionCount: number;
  fixturePaymentEvidenceCount: number;
  refundEvidenceCount: number;
  commissionEvidenceCount: number;
  relationshipTraceCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowRelationshipRow =
  {
    relationshipKey: string;
    studentId: string;
    childProfileId: string;
    studentName: string;
    courseId: string;
    courseCode: string;
    courseTitle: string;
    enrollmentId: string;
    enrollmentStatus: DemoLearningEnrollmentStatus;
    subscriptionId: string;
    subscriptionStatus: DemoLearningSubscriptionStatus;
    paymentId: string;
    paymentStatus: DemoLearningPaymentStatus;
    refundIds: string[];
    commissionIds: string[];
    fixtureOnly: true;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowEvidenceRow = {
  evidenceKind:
    | 'STUDENT_PROFILE'
    | 'COURSE_PACKAGE'
    | 'ENROLLMENT_SUBSCRIPTION'
    | 'PAYMENT_FIXTURE'
    | 'REFUND_FIXTURE'
    | 'COMMISSION_FIXTURE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowReport = {
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
  safety: DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningStudentCourseEnrollmentSubscriptionFlowTotals;
  relationshipRows: DemoLearningStudentCourseEnrollmentSubscriptionFlowRelationshipRow[];
  evidenceRows: DemoLearningStudentCourseEnrollmentSubscriptionFlowEvidenceRow[];
};

export type DemoLearningSubscriptionEntitlementDailyPlanAccessStatus =
  | 'UNLOCKED'
  | 'BLOCKED_PENDING_PAYMENT'
  | 'BLOCKED_EXPIRED'
  | 'BLOCKED_REVOKED'
  | 'BLOCKED_REFUNDED'
  | 'BLOCKED_CANCELED';

export type DemoLearningSubscriptionEntitlementLifecycleState =
  | 'ACTIVE'
  | 'PENDING_PAYMENT'
  | 'EXPIRED'
  | 'REVOKED'
  | 'REFUNDED'
  | 'CANCELED';

export type DemoLearningSubscriptionEntitlementDailyPlanAccessSafety =
  DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety;

export type DemoLearningSubscriptionEntitlementDailyPlanAccessTotals = {
  studentCount: number;
  courseCount: number;
  enrollmentCount: number;
  subscriptionCount: number;
  entitlementCount: number;
  learningPathCount: number;
  dailyPlanAccessCaseCount: number;
  unlockedAccessCount: number;
  blockedAccessCount: number;
  blockedPendingPaymentCount: number;
  blockedExpiredCount: number;
  blockedRevokedCount: number;
  blockedRefundedCount: number;
  blockedCanceledCount: number;
  lifecycleRowCount: number;
  lifecycleExpiredRowCount: number;
  lifecycleRevokedRowCount: number;
  lifecycleRowsWithReasonCount: number;
  relationshipTraceCount: number;
  accessCasesWithRelationshipTraceCount: number;
  blockedAccessWithReasonCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningSubscriptionEntitlementDailyPlanAccessRow = {
  relationshipKey: string;
  entitlementId: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  blockedReason: string | null;
  nextSafeActionLabel: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  enrollmentId: string;
  enrollmentStatus: DemoLearningEnrollmentStatus;
  subscriptionId: string;
  subscriptionStatus: DemoLearningSubscriptionStatus;
  paymentId: string;
  paymentStatus: DemoLearningPaymentStatus;
  refundIds: string[];
  learningPathId: string;
  learningPathTitle: string;
  learningPathStatus: DemoLearningPathStatus;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  planDate: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSubscriptionEntitlementLifecycleRow = {
  lifecycleRowId: string;
  lifecycleState: DemoLearningSubscriptionEntitlementLifecycleState;
  relationshipKey: string;
  entitlementId: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  sourceEnrollmentId: string;
  sourceSubscriptionId: string;
  sourcePaymentId: string;
  sourceRefundIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  decisionReason: string;
  nextSafeActionLabel: string;
  auditTraceKey: string;
  auditTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSubscriptionEntitlementDailyPlanAccessEvidenceRow = {
  evidenceKind:
    | 'COURSE_ENTITLEMENT'
    | 'UNLOCKED_DAILY_PLAN_ACCESS'
    | 'BLOCKED_DAILY_PLAN_ACCESS'
    | 'ENTITLEMENT_LIFECYCLE_HARDENING'
    | 'RELATIONSHIP_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSubscriptionEntitlementDailyPlanAccessReport = {
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
  safety: DemoLearningSubscriptionEntitlementDailyPlanAccessSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningSubscriptionEntitlementDailyPlanAccessTotals;
  accessRows: DemoLearningSubscriptionEntitlementDailyPlanAccessRow[];
  lifecycleRows: DemoLearningSubscriptionEntitlementLifecycleRow[];
  evidenceRows: DemoLearningSubscriptionEntitlementDailyPlanAccessEvidenceRow[];
};

export type DemoLearningParentTeacherProgressAccessSummarySafety =
  DemoLearningSubscriptionEntitlementDailyPlanAccessSafety;

export type DemoLearningParentTeacherProgressAccessSummaryTotals = {
  studentCount: number;
  parentGuardianCount: number;
  teacherCount: number;
  courseCount: number;
  enrollmentCount: number;
  subscriptionCount: number;
  entitlementCount: number;
  dailyPlanAccessCaseCount: number;
  unlockedAccessCount: number;
  blockedAccessCount: number;
  blockedReasonCount: number;
  progressSummaryCount: number;
  parentSummaryCount: number;
  teacherSummaryCount: number;
  relationshipTraceCount: number;
  parentSummaryWithTraceCount: number;
  teacherSummaryWithTraceCount: number;
  blockedAccessInSummariesWithReasonCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningParentTeacherProgressAccessRow = {
  progressSummaryId: string;
  relationshipKey: string;
  progressEvidenceKey: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  teacherOwnerIds: string[];
  teacherOwnerNames: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  teacherName: string;
  enrollmentId: string;
  enrollmentStatus: DemoLearningEnrollmentStatus;
  subscriptionId: string;
  subscriptionStatus: DemoLearningSubscriptionStatus;
  paymentStatus: DemoLearningPaymentStatus;
  entitlementId: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  blockedReason: string | null;
  nextSafeActionLabel: string;
  learningPathId: string;
  learningPathStatus: DemoLearningPathStatus;
  dailyPlanId: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  progressId: string;
  progressStatus: DemoLearningProgressStatus;
  completionPercent: number;
  completedLessonCount: number;
  totalLessonCount: number;
  videoEvidenceId: string;
  videoEvidenceStatus: DemoLearningVideoEvidenceStatus;
  practiceAttemptId: string;
  practiceAttemptStatus: DemoLearningPracticeAttemptStatus;
  evidenceCoverageCount: number;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningParentTeacherProgressParentSummaryRow = {
  parentSummaryId: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  relationship: DemoLearningGuardianRelationship;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  courseTitle: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  blockedReason: string | null;
  nextSafeActionLabel: string;
  dailyPlanId: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  progressStatus: DemoLearningProgressStatus;
  completionPercent: number;
  evidenceCoverageCount: number;
  parentFacingSummary: string;
};

export type DemoLearningParentTeacherProgressTeacherSummaryRow = {
  teacherSummaryId: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  blockedRelationshipTraceIds: string[];
  teacherOwnerId: string;
  teacherName: string;
  teacherEmail: string;
  teacherRole: DemoLearningContentOwnerRole;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  studentCount: number;
  progressSummaryIds: string[];
  enrollmentIds: string[];
  unlockedAccessCount: number;
  blockedAccessCount: number;
  blockedReasonCount: number;
  averageCompletionPercent: number;
  completedProgressCount: number;
  needsSupportProgressCount: number;
  withdrawnProgressCount: number;
  evidenceCoverageCount: number;
  teacherFacingSummary: string;
};

export type DemoLearningParentTeacherProgressAccessEvidenceRow = {
  evidenceKind:
    | 'PARENT_GUARDIAN_LINK'
    | 'TEACHER_COURSE_LINK'
    | 'PROGRESS_ACCESS_SUMMARY'
    | 'BLOCKED_REASON_SUMMARY'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningParentTeacherProgressAccessSummaryReport = {
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
  safety: DemoLearningParentTeacherProgressAccessSummarySafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentTeacherProgressAccessSummaryTotals;
  progressRows: DemoLearningParentTeacherProgressAccessRow[];
  parentSummaryRows: DemoLearningParentTeacherProgressParentSummaryRow[];
  teacherSummaryRows: DemoLearningParentTeacherProgressTeacherSummaryRow[];
  evidenceRows: DemoLearningParentTeacherProgressAccessEvidenceRow[];
};

export type DemoLearningReportPermissionActorRole =
  'PARENT_GUARDIAN' | 'TEACHER' | 'ADMIN' | 'SUPPORT_OPS';

export type DemoLearningReportPermissionScope =
  | 'OWN_CHILD'
  | 'NON_OWNING_CHILD'
  | 'ASSIGNED_CLASS'
  | 'UNASSIGNED_CLASS'
  | 'ADMIN_CLASS'
  | 'SUPPORT_AUDIT_READ_ONLY';

export type DemoLearningReportPermissionDecision = 'ALLOWED' | 'DENIED';

export type DemoLearningReportFieldVisibility =
  'VISIBLE' | 'REDACTED' | 'DENIED';

export type DemoLearningReportFieldScope =
  | 'PARENT_VISIBLE'
  | 'TEACHER_VISIBLE'
  | 'ADMIN_VISIBLE'
  | 'SUPPORT_AUDIT_VISIBLE'
  | 'SUPPORT_AUDIT_MUTATION'
  | 'TEACHER_INTERNAL'
  | 'GUARDIAN_PRIVATE'
  | 'NON_OWNING_CHILD_PRIVATE'
  | 'UNASSIGNED_CLASS_PRIVATE';

export type DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety =
  DemoLearningSubscriptionEntitlementDailyPlanAccessSafety;

export type DemoLearningParentTeacherReportPermissionPrivacyRedactionTotals = {
  studentCount: number;
  parentGuardianCount: number;
  teacherCount: number;
  supportOpsCount: number;
  courseCount: number;
  reportPermissionCaseCount: number;
  allowedReportCaseCount: number;
  deniedReportCaseCount: number;
  teacherUnassignedDeniedCaseCount: number;
  supportOpsAuditReadOnlyCaseCount: number;
  visibleFieldCount: number;
  redactedFieldCount: number;
  deniedFieldCount: number;
  parentVisibleFieldCount: number;
  teacherVisibleFieldCount: number;
  supportOpsVisibleFieldCount: number;
  parentRedactedFieldCount: number;
  teacherRedactedFieldCount: number;
  supportOpsDeniedFieldCount: number;
  permissionTraceCount: number;
  casesWithTraceCount: number;
  deniedOrRedactedCaseWithReasonCount: number;
  redactedOrDeniedFieldWithReasonCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
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

export type DemoLearningParentTeacherReportFieldVisibilityRow = {
  fieldVisibilityId: string;
  permissionCaseId: string;
  actorId: string;
  actorRole: DemoLearningReportPermissionActorRole;
  fieldKey: string;
  fieldLabel: string;
  fieldScope: DemoLearningReportFieldScope;
  visibility: DemoLearningReportFieldVisibility;
  visibleValue: string | null;
  redactedValue: string | null;
  reason: string | null;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportPermissionPrivacyRedactionEvidenceRow =
  {
    evidenceKind:
      | 'PARENT_ALLOWED_REPORT_SCOPE'
      | 'PARENT_DENIED_NON_OWNER_SCOPE'
      | 'TEACHER_ASSIGNED_CLASS_SCOPE'
      | 'TEACHER_DENIED_UNASSIGNED_CLASS_SCOPE'
      | 'ADMIN_CLASS_SCOPE'
      | 'SUPPORT_OPS_AUDIT_READ_ONLY_SCOPE'
      | 'FIELD_VISIBILITY_REDACTION'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningParentTeacherReportPermissionPrivacyRedactionReport = {
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
  safety: DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentTeacherReportPermissionPrivacyRedactionTotals;
  permissionCaseRows: DemoLearningParentTeacherReportPermissionCaseRow[];
  fieldVisibilityRows: DemoLearningParentTeacherReportFieldVisibilityRow[];
  evidenceRows: DemoLearningParentTeacherReportPermissionPrivacyRedactionEvidenceRow[];
};

export type DemoLearningReportPreviewDecisionStatus =
  'APPROVED' | 'HELD_NEEDS_EDIT';

export type DemoLearningReportReviewQueueReviewerRole = 'TEACHER' | 'ADMIN';

export type DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety =
  DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety;

export type DemoLearningParentTeacherReportReviewQueueMessagePreviewTotals = {
  studentCount: number;
  parentGuardianCount: number;
  teacherCount: number;
  courseCount: number;
  reportSummaryCount: number;
  permissionRedactionReferenceCount: number;
  reviewQueueItemCount: number;
  messagePreviewCount: number;
  approvedPreviewCount: number;
  heldPreviewCount: number;
  redactionAwarePreviewCount: number;
  reviewDecisionTraceCount: number;
  casesWithStableRelationshipTraceCount: number;
  heldOrNeedsEditWithReasonCount: number;
  approvedWithPermissionRedactionEvidenceCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningParentTeacherReportReviewSummaryRow = {
  reportSummaryId: string;
  sourceProgressSummaryId: string;
  sourceParentSummaryId: string | null;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  classId: string;
  classCode: string;
  parentGuardianId: string;
  parentGuardianName: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  summary: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportPermissionRedactionReferenceRow = {
  permissionRedactionReferenceId: string;
  permissionCaseId: string;
  actorId: string;
  actorRole: DemoLearningReportPermissionActorRole;
  permissionDecision: DemoLearningReportPermissionDecision;
  reportScope: DemoLearningReportPermissionScope;
  visibleFieldCount: number;
  redactedFieldCount: number;
  deniedFieldCount: number;
  redactedFieldVisibilityIds: string[];
  deniedFieldVisibilityIds: string[];
  permissionReason: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportReviewQueueRow = {
  reviewQueueItemId: string;
  reportSummaryId: string;
  permissionCaseId: string;
  permissionRedactionReferenceId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  classId: string;
  classCode: string;
  parentGuardianId: string;
  parentGuardianName: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: DemoLearningReportReviewQueueReviewerRole;
  reviewStatus: DemoLearningReportPreviewDecisionStatus;
  createdAt: string;
  reviewedAt: string;
  reviewReason: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportMessagePreviewRow = {
  messagePreviewId: string;
  reviewQueueItemId: string;
  reportSummaryId: string;
  permissionCaseId: string;
  permissionRedactionReferenceId: string;
  previewDecision: DemoLearningReportPreviewDecisionStatus;
  decisionTraceId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  classCode: string;
  parentGuardianId: string;
  parentGuardianName: string;
  reviewerName: string;
  permissionDecision: DemoLearningReportPermissionDecision;
  permissionEvidenceReferenced: boolean;
  redactionEvidenceReferenced: boolean;
  redactedFieldVisibilityIds: string[];
  deniedFieldVisibilityIds: string[];
  heldReason: string | null;
  approvalReason: string | null;
  messagePreview: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  aiProviderExecutionUsed: false;
  notificationDeliveryUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportReviewQueueMessagePreviewEvidenceRow =
  {
    evidenceKind:
      | 'REPORT_SUMMARY_SOURCE'
      | 'PERMISSION_REDACTION_REFERENCE'
      | 'REVIEW_QUEUE_DECISION'
      | 'APPROVED_PARENT_PREVIEW'
      | 'HELD_PARENT_PREVIEW'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningParentTeacherReportReviewQueueMessagePreviewReport = {
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
  safety: DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentTeacherReportReviewQueueMessagePreviewTotals;
  reportSummaryRows: DemoLearningParentTeacherReportReviewSummaryRow[];
  permissionRedactionReferenceRows: DemoLearningParentTeacherReportPermissionRedactionReferenceRow[];
  reviewQueueRows: DemoLearningParentTeacherReportReviewQueueRow[];
  messagePreviewRows: DemoLearningParentTeacherReportMessagePreviewRow[];
  evidenceRows: DemoLearningParentTeacherReportReviewQueueMessagePreviewEvidenceRow[];
};

export type DemoLearningParentPortalApprovedReportInboxVisibility =
  'VISIBLE_TO_PARENT' | 'HIDDEN_HELD_REVIEW';

export type DemoLearningParentPortalApprovedReportReadAckStatus =
  'READ_ACKNOWLEDGED';

export type DemoLearningParentPortalApprovedReportInboxReadReceiptSafety =
  DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety;

export type DemoLearningParentPortalApprovedReportInboxReadReceiptTotals = {
  studentCount: number;
  parentGuardianCount: number;
  teacherCount: number;
  courseCount: number;
  approvedPreviewCount: number;
  heldPreviewCount: number;
  parentInboxItemCount: number;
  visibleParentInboxItemCount: number;
  hiddenHeldPreviewCount: number;
  readAckEvidenceCount: number;
  permissionRedactionReferenceCount: number;
  parentInboxTraceCount: number;
  visibleInboxItemsWithStableRelationshipTraceCount: number;
  hiddenHeldPreviewsWithReasonCount: number;
  visibleParentPreviewWithPermissionRedactionEvidenceCount: number;
  alignedApprovedParentInboxEntryCount: number;
  alignedParentReadReceiptCount: number;
  stableAlignedReadReceiptTraceCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningParentPortalApprovedReportInboxRow = {
  parentInboxItemId: string;
  messagePreviewId: string;
  reviewQueueItemId: string;
  reportSummaryId: string;
  permissionCaseId: string;
  permissionRedactionReferenceId: string;
  decisionTraceId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  classCode: string;
  parentGuardianId: string;
  parentGuardianName: string;
  inboxVisibility: DemoLearningParentPortalApprovedReportInboxVisibility;
  parentVisible: boolean;
  hiddenFromParent: boolean;
  hiddenReason: string | null;
  visibleSubject: string | null;
  visibleBody: string | null;
  visibleCourseLabel: string | null;
  permissionDecision: DemoLearningReportPermissionDecision;
  permissionEvidenceReferenced: boolean;
  redactionEvidenceReferenced: boolean;
  redactedFieldVisibilityIds: string[];
  deniedFieldVisibilityIds: string[];
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  aiProviderExecutionUsed: false;
  notificationDeliveryUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentPortalApprovedReportReadAckRow = {
  readAckEvidenceId: string;
  parentInboxItemId: string;
  messagePreviewId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  studentId: string;
  childProfileId: string;
  readAckStatus: DemoLearningParentPortalApprovedReportReadAckStatus;
  readAt: string;
  acknowledgedAt: string;
  acknowledgementLabel: string;
  evidenceReason: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  notificationDeliveryUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentPortalApprovedReportInboxReadReceiptEvidenceRow =
  {
    evidenceKind:
      | 'VISIBLE_PARENT_INBOX_ITEM'
      | 'HIDDEN_HELD_PREVIEW'
      | 'READ_ACK_RECEIPT'
      | 'ALIGNED_APPROVED_DELIVERY_READ_RECEIPT'
      | 'PERMISSION_REDACTION_REFERENCE'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningParentPortalApprovedReportInboxReadReceiptReport = {
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
  safety: DemoLearningParentPortalApprovedReportInboxReadReceiptSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentPortalApprovedReportInboxReadReceiptTotals;
  parentInboxRows: DemoLearningParentPortalApprovedReportInboxRow[];
  readAckRows: DemoLearningParentPortalApprovedReportReadAckRow[];
  evidenceRows: DemoLearningParentPortalApprovedReportInboxReadReceiptEvidenceRow[];
};

export type DemoLearningClassSessionStatusCounts = {
  class: Record<DemoLearningClassStatus, number>;
  session: Record<DemoLearningSessionStatus, number>;
  attendance: Record<DemoLearningAttendanceStatus, number>;
  progress: Record<DemoLearningProgressStatus, number>;
};

export type DemoLearningClassSessionProgressTotals = {
  studentCount: number;
  courseCount: number;
  classCount: number;
  activeClassCount: number;
  completedClassCount: number;
  sessionCount: number;
  completedSessionCount: number;
  scheduledSessionCount: number;
  attendanceRecordCount: number;
  presentAttendanceCount: number;
  lateAttendanceCount: number;
  absentAttendanceCount: number;
  excusedAttendanceCount: number;
  attendedAttendanceCount: number;
  attendanceRatePercent: number;
  progressRecordCount: number;
  completedProgressCount: number;
  inProgressCount: number;
  needsSupportCount: number;
  withdrawnProgressCount: number;
  completedLessonCount: number;
  totalLessonCount: number;
  overallCompletionPercent: number;
  averageLearnerCompletionPercent: number;
};

export type DemoLearningClassAggregateRow = {
  classId: string;
  classCode: string;
  classTitle: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  status: DemoLearningClassStatus;
  studentCount: number;
  sessionCount: number;
  completedSessionCount: number;
  scheduledSessionCount: number;
  attendanceRecordCount: number;
  presentAttendanceCount: number;
  lateAttendanceCount: number;
  absentAttendanceCount: number;
  excusedAttendanceCount: number;
  attendanceRatePercent: number;
  averageLearnerCompletionPercent: number;
  completedProgressCount: number;
  needsSupportCount: number;
};

export type DemoLearningSessionReportRow = {
  sessionId: string;
  classId: string;
  classCode: string;
  courseCode: string;
  sequence: number;
  lessonCode: string;
  title: string;
  status: DemoLearningSessionStatus;
  scheduledStart: string;
  attendanceRecordCount: number;
  presentAttendanceCount: number;
  lateAttendanceCount: number;
  absentAttendanceCount: number;
  excusedAttendanceCount: number;
};

export type DemoLearningLearnerProgressRow = {
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  totalSessions: number;
  completedSessions: number;
  attendanceRecordCount: number;
  presentAttendanceCount: number;
  lateAttendanceCount: number;
  absentAttendanceCount: number;
  excusedAttendanceCount: number;
  attendedAttendanceCount: number;
  attendanceRatePercent: number;
  progressStatus: DemoLearningProgressStatus;
  completedLessonCount: number;
  totalLessonCount: number;
  completionPercent: number;
  completedSessionIds: string[];
  lastActivityAt: string;
};

export type DemoLearningClassSessionAttendanceProgressReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    providerApiUsed: false;
    paymentProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningClassSessionProgressTotals;
  statusCounts: DemoLearningClassSessionStatusCounts;
  classAggregates: DemoLearningClassAggregateRow[];
  sessionRows: DemoLearningSessionReportRow[];
  learnerRows: DemoLearningLearnerProgressRow[];
};

export type DemoLearningLessonAssignmentAssessmentStatusCounts = {
  lesson: Record<DemoLearningLessonStatus, number>;
  assignment: Record<DemoLearningAssignmentStatus, number>;
  submission: Record<DemoLearningSubmissionStatus, number>;
  feedback: Record<DemoLearningFeedbackStatus, number>;
  progress: Record<DemoLearningProgressStatus, number>;
};

export type DemoLearningLessonAssignmentAssessmentTotals = {
  studentCount: number;
  courseCount: number;
  classCount: number;
  lessonCount: number;
  publishedLessonCount: number;
  scheduledLessonCount: number;
  assignmentCount: number;
  quizCount: number;
  assignmentTaskCount: number;
  openAssignmentCount: number;
  closedAssignmentCount: number;
  expectedSubmissionCount: number;
  submissionRecordCount: number;
  submittedSubmissionCount: number;
  lateSubmissionCount: number;
  missingSubmissionCount: number;
  resubmittedSubmissionCount: number;
  completedSubmissionCount: number;
  scoredSubmissionCount: number;
  feedbackGivenCount: number;
  pendingFeedbackCount: number;
  feedbackNotRequiredCount: number;
  excellentScoreCount: number;
  onTrackScoreCount: number;
  needsSupportScoreCount: number;
  missingScoreCount: number;
  averageScorePercent: number;
  learnerAssessmentCount: number;
  excellentLearnerCount: number;
  onTrackLearnerCount: number;
  needsSupportLearnerCount: number;
  missingLearnerCount: number;
  withdrawnLearnerCount: number;
  overallAssignmentCompletionPercent: number;
  averageLearnerScorePercent: number;
};

export type DemoLearningLessonAssessmentRow = {
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  lessonStatus: DemoLearningLessonStatus;
  classId: string;
  classCode: string;
  courseCode: string;
  sequence: number;
  assignmentCount: number;
  quizCount: number;
  assignmentTaskCount: number;
  expectedSubmissionCount: number;
  submissionRecordCount: number;
  missingSubmissionCount: number;
  averageScorePercent: number;
};

export type DemoLearningAssignmentAssessmentRow = {
  assignmentId: string;
  lessonId: string;
  lessonCode: string;
  classId: string;
  classCode: string;
  courseCode: string;
  kind: DemoLearningAssignmentKind;
  title: string;
  status: DemoLearningAssignmentStatus;
  dueAt: string;
  expectedSubmissionCount: number;
  submittedSubmissionCount: number;
  lateSubmissionCount: number;
  missingSubmissionCount: number;
  resubmittedSubmissionCount: number;
  scoredSubmissionCount: number;
  feedbackGivenCount: number;
  pendingFeedbackCount: number;
  averageScorePercent: number;
};

export type DemoLearningLearnerAssessmentRow = {
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  progressStatus: DemoLearningProgressStatus;
  expectedAssignmentCount: number;
  submittedSubmissionCount: number;
  lateSubmissionCount: number;
  missingSubmissionCount: number;
  resubmittedSubmissionCount: number;
  scoredSubmissionCount: number;
  feedbackPendingCount: number;
  averageScorePercent: number;
  assignmentCompletionPercent: number;
  progressCompletionPercent: number;
  assessmentBand: DemoLearningAssessmentBand;
};

export type DemoLearningLessonAssignmentAssessmentProgressReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    providerApiUsed: false;
    paymentProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningLessonAssignmentAssessmentTotals;
  statusCounts: DemoLearningLessonAssignmentAssessmentStatusCounts;
  lessonRows: DemoLearningLessonAssessmentRow[];
  assignmentRows: DemoLearningAssignmentAssessmentRow[];
  learnerRows: DemoLearningLearnerAssessmentRow[];
};

export type DemoLearningPathDailyPlanVideoPracticeStatusCounts = {
  learningPath: Record<DemoLearningPathStatus, number>;
  dailyPlan: Record<DemoLearningDailyPlanStatus, number>;
  videoEvidence: Record<DemoLearningVideoEvidenceStatus, number>;
  practiceAttempt: Record<DemoLearningPracticeAttemptStatus, number>;
  learnerBand: Record<DemoLearningPathLearnerBand, number>;
};

export type DemoLearningPathDailyPlanVideoPracticeTotals = {
  studentCount: number;
  courseCount: number;
  learningPathCount: number;
  activeLearningPathCount: number;
  completedLearningPathCount: number;
  needsSupportLearningPathCount: number;
  withdrawnLearningPathCount: number;
  dailyPlanCount: number;
  completedDailyPlanCount: number;
  inProgressDailyPlanCount: number;
  blockedDailyPlanCount: number;
  skippedDailyPlanCount: number;
  assignedDailyPlanCount: number;
  blockedSkippedIncompleteDailyPlanCount: number;
  videoEvidenceCount: number;
  completedVideoCount: number;
  incompleteVideoCount: number;
  skippedVideoCount: number;
  practiceAttemptCount: number;
  passedPracticeCount: number;
  needsRetryPracticeCount: number;
  incompletePracticeCount: number;
  skippedPracticeCount: number;
  averagePracticeScorePercent: number;
  overallDailyPlanCompletionPercent: number;
  averageLearnerProgressPercent: number;
  onTrackLearnerCount: number;
  needsSupportLearnerCount: number;
  inactiveLearnerCount: number;
  withdrawnLearnerCount: number;
};

export type DemoLearningPathEvidenceRow = {
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  title: string;
  pathStatus: DemoLearningPathStatus;
  dailyPlanCount: number;
  completedDailyPlanCount: number;
  blockedDailyPlanCount: number;
  skippedDailyPlanCount: number;
  completedVideoCount: number;
  passedPracticeCount: number;
  averagePracticeScorePercent: number;
  progressPercent: number;
  learnerStatusBand: DemoLearningPathLearnerBand;
};

export type DemoLearningDailyPlanEvidenceRow = {
  dailyPlanId: string;
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  sequence: number;
  planDate: string;
  title: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  videoEvidenceStatus: DemoLearningVideoEvidenceStatus;
  watchedSeconds: number;
  requiredVideoSeconds: number;
  videoCompletionPercent: number;
  practiceAttemptStatus: DemoLearningPracticeAttemptStatus;
  practiceAttemptNumber: number;
  practiceScorePercent: number | null;
};

export type DemoLearningPathDailyPlanVideoPracticeEvidenceReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    paymentProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningPathDailyPlanVideoPracticeTotals;
  statusCounts: DemoLearningPathDailyPlanVideoPracticeStatusCounts;
  learningPathRows: DemoLearningPathEvidenceRow[];
  dailyPlanRows: DemoLearningDailyPlanEvidenceRow[];
};

export type DemoLearningTeacherContentLibraryStatusCounts = {
  ownerRole: Record<DemoLearningContentOwnerRole, number>;
  assetKind: Record<DemoLearningContentAssetKind, number>;
  publishStatus: Record<DemoLearningContentPublishStatus, number>;
  classAssignmentStatus: Record<
    DemoLearningContentClassAssignmentStatus,
    number
  >;
  studentVisibilityStatus: Record<
    DemoLearningContentStudentVisibilityStatus,
    number
  >;
};

export type DemoLearningTeacherContentLibraryTotals = {
  teacherAdminCount: number;
  contentItemCount: number;
  videoAssetCount: number;
  practiceAssetCount: number;
  lessonAssetCount: number;
  draftContentCount: number;
  publishedContentCount: number;
  archivedContentCount: number;
  learningPathPublishCount: number;
  classAssignmentCount: number;
  studentVisibilityCount: number;
  parentVisibleSummaryCount: number;
  blockedUnpublishedItemCount: number;
  itemsNeedingTeacherReviewCount: number;
};

export type DemoLearningTeacherContentLibraryItemRow = {
  contentItemId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerRole: DemoLearningContentOwnerRole;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  assetKind: DemoLearningContentAssetKind;
  assetRef: string;
  title: string;
  publishStatus: DemoLearningContentPublishStatus;
  classAssignmentCount: number;
  learningPathPublishCount: number;
  studentVisibilityCount: number;
  parentVisibleSummaryCount: number;
  needsTeacherReview: boolean;
  blockedReason: string;
};

export type DemoLearningTeacherContentClassAssignmentRow = {
  classAssignmentId: string;
  contentItemId: string;
  contentTitle: string;
  assetKind: DemoLearningContentAssetKind;
  publishStatus: DemoLearningContentPublishStatus;
  assignmentStatus: DemoLearningContentClassAssignmentStatus;
  classId: string;
  classCode: string;
  classTitle: string;
  teacherName: string;
  courseCode: string;
  ownerName: string;
  assignedAt: string;
  studentVisibilityCount: number;
  visibleStudentCount: number;
  blockedStudentVisibilityCount: number;
  blockedReason: string;
};

export type DemoLearningTeacherContentStudentVisibilityRow = {
  visibilityId: string;
  classAssignmentId: string;
  contentItemId: string;
  contentTitle: string;
  assetKind: DemoLearningContentAssetKind;
  publishStatus: DemoLearningContentPublishStatus;
  visibilityStatus: DemoLearningContentStudentVisibilityStatus;
  learningPathId: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  planDate: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  lessonCode: string;
  studentVisible: boolean;
  parentVisible: boolean;
  availableOnDailyPlan: boolean;
  publishedAt: string | null;
  blockedReason: string;
};

export type DemoLearningTeacherContentParentSummaryRow = {
  parentGuardianId: string;
  parentGuardianName: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCodes: string[];
  classCodes: string[];
  parentVisibleItemCount: number;
  blockedItemCount: number;
  itemsNeedingTeacherReviewCount: number;
  nextAvailableDailyPlanDate: string | null;
  summary: string;
};

export type DemoLearningTeacherContentLibraryLearningPathPublishReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    aiProviderUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realContentLibraryMutationUsed: false;
    realContentPublishMutationUsed: false;
    realContentUploadMutationUsed: false;
    realStorageCdnMutationUsed: false;
    realTeacherAdminAccountMutationUsed: false;
    realStudentClassVisibilityMutationUsed: false;
    realParentSummaryMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningTeacherContentLibraryTotals;
  statusCounts: DemoLearningTeacherContentLibraryStatusCounts;
  contentRows: DemoLearningTeacherContentLibraryItemRow[];
  classAssignmentRows: DemoLearningTeacherContentClassAssignmentRow[];
  studentVisibilityRows: DemoLearningTeacherContentStudentVisibilityRow[];
  parentSummaryRows: DemoLearningTeacherContentParentSummaryRow[];
};

export type DemoLearningAiTutorChatSafetyTeacherReviewStatusCounts = {
  sessionStatus: Record<DemoLearningAiTutorChatSessionStatus, number>;
  messageRole: Record<DemoLearningAiTutorMessageRole, number>;
  guardDecision: Record<DemoLearningAiTutorGuardDecision, number>;
  topicCategory: Record<DemoLearningAiTutorTopicCategory, number>;
  safetySeverity: Record<DemoLearningAiTutorSafetySeverity, number>;
  teacherReviewStatus: Record<DemoLearningAiTutorTeacherReviewStatus, number>;
  supportPriority: Record<DemoLearningAiTutorSupportPriority, number>;
  supportRecommendationStatus: Record<
    DemoLearningAiTutorSupportRecommendationStatus,
    number
  >;
};

export type DemoLearningAiTutorChatSafetyTeacherReviewTotals = {
  chatSessionCount: number;
  messageCount: number;
  allowedMessageCount: number;
  blockedMessageCount: number;
  safetyFlagCount: number;
  blockedTopicCount: number;
  teacherReviewItemCount: number;
  reviewedTeacherReviewItemCount: number;
  parentSummaryCount: number;
  studentsNeedingSupportCount: number;
  topicCategoryCount: number;
  supportRecommendationCount: number;
};

export type DemoLearningAiTutorChatSessionRow = {
  chatSessionId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  courseId: string;
  courseCode: string;
  classId: string;
  classCode: string;
  teacherName: string;
  learningPathId: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  sessionStatus: DemoLearningAiTutorChatSessionStatus;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
  allowedMessageCount: number;
  blockedMessageCount: number;
  safetyFlagCount: number;
  teacherReviewItemCount: number;
  supportRecommendationCount: number;
  parentSummaryReady: boolean;
};

export type DemoLearningAiTutorChatMessageRow = {
  messageId: string;
  chatSessionId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  sequence: number;
  role: DemoLearningAiTutorMessageRole;
  sentAt: string;
  topicCategory: DemoLearningAiTutorTopicCategory;
  guardDecision: DemoLearningAiTutorGuardDecision;
  blockedTopic: boolean;
  messagePreview: string;
};

export type DemoLearningAiTutorSafetyFlagRow = {
  safetyFlagId: string;
  chatSessionId: string;
  messageId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  topicCategory: DemoLearningAiTutorTopicCategory;
  guardDecision: DemoLearningAiTutorGuardDecision;
  severity: DemoLearningAiTutorSafetySeverity;
  blockedTopic: boolean;
  reason: string;
};

export type DemoLearningAiTutorTeacherReviewQueueRow = {
  teacherReviewItemId: string;
  chatSessionId: string;
  safetyFlagId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  lessonCode: string;
  dailyPlanTitle: string;
  assignedTeacherName: string;
  topicCategory: DemoLearningAiTutorTopicCategory;
  severity: DemoLearningAiTutorSafetySeverity;
  reviewStatus: DemoLearningAiTutorTeacherReviewStatus;
  createdAt: string;
  reviewedAt: string | null;
  actionSummary: string;
  parentSummaryReady: boolean;
  supportRecommendationCount: number;
};

export type DemoLearningAiTutorParentSummaryRow = {
  parentSummaryId: string;
  chatSessionId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  createdAt: string;
  summary: string;
};

export type DemoLearningAiTutorSupportRecommendationRow = {
  supportRecommendationId: string;
  chatSessionId: string;
  teacherReviewItemId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  dailyPlanTitle: string;
  priority: DemoLearningAiTutorSupportPriority;
  status: DemoLearningAiTutorSupportRecommendationStatus;
  recommendation: string;
};

export type DemoLearningAiTutorChatSafetyTeacherReviewReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    aiProviderUsed: false;
    aiProviderExecutionUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realAiChatMutationUsed: false;
    realAiModerationMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realLearningSupportMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningAiTutorChatSafetyTeacherReviewTotals;
  statusCounts: DemoLearningAiTutorChatSafetyTeacherReviewStatusCounts;
  chatSessionRows: DemoLearningAiTutorChatSessionRow[];
  messageRows: DemoLearningAiTutorChatMessageRow[];
  safetyFlagRows: DemoLearningAiTutorSafetyFlagRow[];
  teacherReviewRows: DemoLearningAiTutorTeacherReviewQueueRow[];
  parentSummaryRows: DemoLearningAiTutorParentSummaryRow[];
  supportRecommendationRows: DemoLearningAiTutorSupportRecommendationRow[];
};

export type DemoLearningStudentAchievementBadgeCertificateStatusCounts = {
  achievementKind: Record<DemoLearningAchievementKind, number>;
  badgeAwardStatus: Record<DemoLearningBadgeAwardStatus, number>;
  certificateStatus: Record<DemoLearningCertificateFixtureStatus, number>;
  milestoneStatus: Record<DemoLearningMilestoneStatus, number>;
  recognitionAudience: Record<DemoLearningRecognitionAudience, number>;
  recognitionStatus: Record<DemoLearningRecognitionStatus, number>;
};

export type DemoLearningStudentAchievementBadgeCertificateTotals = {
  achievementRecords: number;
  badgeAwards: number;
  certificateFixtures: number;
  milestonesCompleted: number;
  milestonesPending: number;
  recognitionSummaries: number;
  parentVisibleRecognitions: number;
  teacherReviewItems: number;
  studentsWithBadges: number;
  studentsNearCertificate: number;
  studentsNeedingEncouragement: number;
};

export type DemoLearningStudentAchievementSummaryRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  progressStatus: DemoLearningProgressStatus;
  completionPercent: number;
  achievementRecordCount: number;
  badgeAwardCount: number;
  completedMilestoneCount: number;
  pendingMilestoneCount: number;
  certificateStatus: DemoLearningCertificateFixtureStatus | 'NONE';
  parentVisibleRecognitionCount: number;
  teacherReviewItemCount: number;
  nearCertificate: boolean;
  needsEncouragement: boolean;
};

export type DemoLearningAchievementRecordRow = {
  achievementRecordId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  lessonCode: string;
  lessonTitle: string;
  dailyPlanTitle: string;
  assignmentTitle: string | null;
  progressStatus: DemoLearningProgressStatus;
  achievementKind: DemoLearningAchievementKind;
  earnedAt: string;
  evidenceScorePercent: number | null;
  points: number;
  aiTutorSupportRecommendationId: string | null;
  evidenceSummary: string;
};

export type DemoLearningBadgeAwardRow = {
  badgeAwardId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  badgeCode: string;
  badgeName: string;
  status: DemoLearningBadgeAwardStatus;
  awardedAt: string;
  achievementRecordCount: number;
  pointsRequired: number;
  badgeSummary: string;
};

export type DemoLearningCertificateFixtureRow = {
  certificateFixtureId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  learningPathTitle: string;
  certificateTitle: string;
  status: DemoLearningCertificateFixtureStatus;
  eligibleAt: string | null;
  heldReason: string;
  completedBadgeAwardCount: number;
  pendingMilestoneCount: number;
  certificatePreviewRef: string;
};

export type DemoLearningMilestoneRow = {
  milestoneId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  learningPathTitle: string;
  dailyPlanTitle: string;
  lessonCode: string;
  title: string;
  status: DemoLearningMilestoneStatus;
  completedAt: string | null;
  pendingReason: string;
};

export type DemoLearningRecognitionSummaryRow = {
  recognitionSummaryId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  audience: DemoLearningRecognitionAudience;
  status: DemoLearningRecognitionStatus;
  parentVisible: boolean;
  teacherReviewRequired: boolean;
  encouragementNeeded: boolean;
  sourceBadgeAwardId: string | null;
  sourceCertificateFixtureId: string | null;
  sourceAiTutorSupportRecommendationId: string | null;
  createdAt: string;
  summary: string;
};

export type DemoLearningStudentAchievementBadgeCertificateReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    aiProviderUsed: false;
    aiProviderExecutionUsed: false;
    certificateIssuerProviderUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realAiChatMutationUsed: false;
    realAiModerationMutationUsed: false;
    realLearningSupportMutationUsed: false;
    realAchievementMutationUsed: false;
    realBadgeMutationUsed: false;
    realCertificateMutationUsed: false;
    realCredentialIssuanceUsed: false;
    realRecognitionNotificationMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningStudentAchievementBadgeCertificateTotals;
  statusCounts: DemoLearningStudentAchievementBadgeCertificateStatusCounts;
  studentRows: DemoLearningStudentAchievementSummaryRow[];
  achievementRows: DemoLearningAchievementRecordRow[];
  badgeRows: DemoLearningBadgeAwardRow[];
  certificateRows: DemoLearningCertificateFixtureRow[];
  milestoneRows: DemoLearningMilestoneRow[];
  recognitionRows: DemoLearningRecognitionSummaryRow[];
};

export type DemoLearningParentTeacherWeeklyDigestStatusCounts = {
  audience: Record<DemoLearningWeeklyDigestAudience, number>;
  deliveryStatus: Record<DemoLearningWeeklyDigestDeliveryStatus, number>;
  actionPriority: Record<DemoLearningWeeklyDigestActionPriority, number>;
  actionStatus: Record<DemoLearningWeeklyDigestActionStatus, number>;
  actionOwner: Record<DemoLearningWeeklyDigestActionOwner, number>;
};

export type DemoLearningParentTeacherWeeklyDigestTotals = {
  digestCount: number;
  parentDigestCount: number;
  teacherDigestCount: number;
  readyToSendDigestCount: number;
  teacherReviewDigestCount: number;
  heldWithdrawnDigestCount: number;
  parentVisibleDigestCount: number;
  teacherOnlyDigestCount: number;
  actionCount: number;
  highPriorityActionCount: number;
  scheduledActionCount: number;
  completedActionCount: number;
  studentsCovered: number;
  studentsNeedingTeacherReview: number;
  studentsReadyForParentSend: number;
};

export type DemoLearningParentTeacherWeeklyDigestRow = {
  digestId: string;
  weekStart: string;
  weekEnd: string;
  audience: DemoLearningWeeklyDigestAudience;
  deliveryStatus: DemoLearningWeeklyDigestDeliveryStatus;
  parentVisible: boolean;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  parentEmail: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  progressStatus: DemoLearningProgressStatus;
  completionPercent: number;
  attendanceRatePercent: number;
  assignmentCompletionPercent: number;
  averagePracticeScorePercent: number;
  alertCount: number;
  highRiskAlertCount: number;
  followUpNeededAlertCount: number;
  achievementRecordCount: number;
  badgeAwardCount: number;
  certificateStatus: DemoLearningCertificateFixtureStatus | 'NONE';
  recognitionSummaryCount: number;
  parentVisibleRecognitionCount: number;
  actionCount: number;
  highPriorityActionCount: number;
  sourceAlertIds: string[];
  sourceRecognitionSummaryIds: string[];
  sourceAiTutorTeacherReviewItemIds: string[];
  sourceCertificateFixtureId: string | null;
  highlight: string;
  riskSummary: string;
  parentSummary: string;
  teacherNote: string;
};

export type DemoLearningParentTeacherWeeklyDigestActionRow = {
  actionId: string;
  digestId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  owner: DemoLearningWeeklyDigestActionOwner;
  priority: DemoLearningWeeklyDigestActionPriority;
  status: DemoLearningWeeklyDigestActionStatus;
  dueAt: string;
  sourceAlertId: string | null;
  sourceRecognitionSummaryId: string | null;
  actionSummary: string;
};

export type DemoLearningParentTeacherWeeklyDigestStudentRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  parentDigestCount: number;
  teacherDigestCount: number;
  readyToSendDigestCount: number;
  teacherReviewDigestCount: number;
  heldWithdrawnDigestCount: number;
  actionCount: number;
  highPriorityActionCount: number;
  completedActionCount: number;
  nextActionDueAt: string | null;
  weeklySummary: string;
};

export type DemoLearningParentTeacherWeeklyDigestReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    aiProviderUsed: false;
    aiProviderExecutionUsed: false;
    certificateIssuerProviderUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realAiChatMutationUsed: false;
    realAiModerationMutationUsed: false;
    realLearningSupportMutationUsed: false;
    realAchievementMutationUsed: false;
    realBadgeMutationUsed: false;
    realCertificateMutationUsed: false;
    realCredentialIssuanceUsed: false;
    realRecognitionNotificationMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realWeeklyDigestNotificationMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningParentTeacherWeeklyDigestTotals;
  statusCounts: DemoLearningParentTeacherWeeklyDigestStatusCounts;
  studentRows: DemoLearningParentTeacherWeeklyDigestStudentRow[];
  digestRows: DemoLearningParentTeacherWeeklyDigestRow[];
  actionRows: DemoLearningParentTeacherWeeklyDigestActionRow[];
};

export type DemoLearningFollowUpActionOutcomeStatusCounts = {
  outcomeStatus: Record<DemoLearningFollowUpActionOutcomeStatus, number>;
  impactBand: Record<DemoLearningFollowUpActionOutcomeImpact, number>;
  actionOwner: Record<DemoLearningWeeklyDigestActionOwner, number>;
  actionPriority: Record<DemoLearningWeeklyDigestActionPriority, number>;
};

export type DemoLearningFollowUpActionOutcomeTotals = {
  outcomeCount: number;
  completedOutcomeCount: number;
  verifiedOutcomeCount: number;
  scheduledOutcomeCount: number;
  monitoringOutcomeCount: number;
  heldOutcomeCount: number;
  parentVisibleOutcomeCount: number;
  teacherOnlyOutcomeCount: number;
  positiveOutcomeCount: number;
  needsSupportOutcomeCount: number;
  noSendOutcomeCount: number;
  linkedDailyPlanCount: number;
  linkedSupportRecommendationCount: number;
  linkedAchievementCount: number;
  linkedParentSummaryCount: number;
  linkedTeacherReviewCount: number;
  studentsCovered: number;
  studentsWithCompletedOrVerifiedOutcome: number;
  studentsWithOpenOutcome: number;
};

export type DemoLearningFollowUpActionOutcomeStudentRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  outcomeCount: number;
  completedOrVerifiedCount: number;
  scheduledOrMonitoringCount: number;
  heldOutcomeCount: number;
  needsSupportOutcomeCount: number;
  parentVisibleOutcomeCount: number;
  nextReviewAt: string | null;
  outcomeSummary: string;
};

export type DemoLearningFollowUpActionOutcomeRow = {
  outcomeId: string;
  actionId: string;
  digestId: string;
  weekStart: string;
  weekEnd: string;
  actionOwner: DemoLearningWeeklyDigestActionOwner;
  actionPriority: DemoLearningWeeklyDigestActionPriority;
  actionStatus: DemoLearningWeeklyDigestActionStatus;
  outcomeStatus: DemoLearningFollowUpActionOutcomeStatus;
  impactBand: DemoLearningFollowUpActionOutcomeImpact;
  parentVisible: boolean;
  outcomeAt: string | null;
  nextReviewAt: string | null;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  parentEmail: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  digestAudience: DemoLearningWeeklyDigestAudience;
  digestDeliveryStatus: DemoLearningWeeklyDigestDeliveryStatus;
  dailyPlanId: string | null;
  dailyPlanTitle: string | null;
  dailyPlanStatus: DemoLearningDailyPlanStatus | 'NONE';
  supportRecommendationId: string | null;
  supportPriority: DemoLearningAiTutorSupportPriority | 'NONE';
  supportStatus: DemoLearningAiTutorSupportRecommendationStatus | 'NONE';
  achievementRecordId: string | null;
  achievementKind: DemoLearningAchievementKind | 'NONE';
  achievementPoints: number;
  parentSummaryId: string | null;
  parentSummaryReady: boolean;
  teacherReviewItemId: string | null;
  teacherReviewStatus: DemoLearningAiTutorTeacherReviewStatus | 'NONE';
  sourceAlertId: string | null;
  sourceRecognitionSummaryId: string | null;
  actionSummary: string;
  evidenceSummary: string;
  outcomeSummary: string;
};

export type DemoLearningFollowUpActionOutcomeReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    aiProviderUsed: false;
    aiProviderExecutionUsed: false;
    certificateIssuerProviderUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realAiChatMutationUsed: false;
    realAiModerationMutationUsed: false;
    realLearningSupportMutationUsed: false;
    realAchievementMutationUsed: false;
    realBadgeMutationUsed: false;
    realCertificateMutationUsed: false;
    realCredentialIssuanceUsed: false;
    realRecognitionNotificationMutationUsed: false;
    realParentSummaryMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realWeeklyDigestNotificationMutationUsed: false;
    realFollowUpActionOutcomeMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningFollowUpActionOutcomeTotals;
  statusCounts: DemoLearningFollowUpActionOutcomeStatusCounts;
  studentRows: DemoLearningFollowUpActionOutcomeStudentRow[];
  outcomeRows: DemoLearningFollowUpActionOutcomeRow[];
};

export type DemoLearningMvpReadinessOverviewStatusCounts = {
  readinessStatus: Record<DemoLearningMvpReadinessOverviewStatus, number>;
};

export type DemoLearningMvpReadinessOverviewTotals = {
  sliceCount: number;
  localDemoReadySliceCount: number;
  localDemoReadyWithNotesSliceCount: number;
  needsLocalDemoFixSliceCount: number;
  productionReadySliceCount: number;
  fixtureOnlySliceCount: number;
  safetyClosedSliceCount: number;
  evidenceEndpointCount: number;
  jsonExportCount: number;
  markdownExportCount: number;
  readinessScorePercent: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
  studentCount: number;
  courseCount: number;
  enrollmentCount: number;
  activeEnrollmentCount: number;
  subscriptionCount: number;
  refundCount: number;
  commissionCount: number;
  dailyPlanCount: number;
  completedDailyPlanCount: number;
  lessonCount: number;
  assignmentCount: number;
  progressRecordCount: number;
  needsSupportLearnerCount: number;
  aiTutorChatSessionCount: number;
  aiTutorSafetyFlagCount: number;
  achievementRecordCount: number;
  badgeAwardCount: number;
  teacherInterventionReviewCount: number;
  remedialAssignmentCount: number;
  supportPlanCount: number;
  remedialRetryCompletionCount: number;
  supportOutcomeEvidenceCount: number;
  remedialRetryUnresolvedAttemptCount: number;
  unresolvedSupportOutcomeCount: number;
  teacherEscalationCount: number;
  parentVisibleEscalationSummaryCount: number;
  teacherVisibleEscalationNextActionCount: number;
  teacherReviewedEscalationCount: number;
  adjustedSupportRetryCompletionCount: number;
  resolvedSupportOutcomeCount: number;
  parentVisibleClosureSummaryCount: number;
  teacherVisibleClosureNoteCount: number;
  stableEndToEndTraceCount: number;
  weeklyDigestCount: number;
  weeklyDigestActionCount: number;
  followUpOutcomeCount: number;
};

export type DemoLearningMvpReadinessOverviewRow = {
  sliceKey: DemoLearningMvpReadinessOverviewSliceKey;
  sliceName: string;
  readinessStatus: DemoLearningMvpReadinessOverviewStatus;
  productionReady: false;
  fixtureOnly: true;
  safetyClosed: boolean;
  sourceEndpointPath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  primaryMetricLabel: string;
  primaryMetricValue: number;
  secondaryMetricLabel: string;
  secondaryMetricValue: number;
  coverageLabel: string;
  coverageValue: number;
  riskNote: string;
  evidenceSummary: string;
};

export type DemoLearningMvpReadinessOverviewReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  productionReady: false;
  safety: DemoLearningFollowUpActionOutcomeReport['safety'] & {
    realLearningSessionCompletionMutationUsed: false;
    realParentProgressSummaryMutationUsed: false;
    realTeacherProgressSummaryMutationUsed: false;
    realTeacherInterventionReviewMutationUsed: false;
    realRemedialAssignmentMutationUsed: false;
    realSupportPlanMutationUsed: false;
    realParentSupportSummaryMutationUsed: false;
    realTeacherNextActionMutationUsed: false;
    realRemedialRetryCompletionMutationUsed: false;
    realSupportOutcomeEvidenceMutationUsed: false;
    realParentFollowupSummaryMutationUsed: false;
    realTeacherFollowupSummaryMutationUsed: false;
    realRemedialRetryUnresolvedAttemptMutationUsed: false;
    realUnresolvedSupportOutcomeMutationUsed: false;
    realTeacherEscalationMutationUsed: false;
    realSupportAdjustmentMutationUsed: false;
    realParentEscalationSummaryMutationUsed: false;
    realTeacherEscalationNextActionMutationUsed: false;
    realTeacherReviewedEscalationMutationUsed: false;
    realAdjustedSupportRetryCompletionMutationUsed: false;
    realResolvedSupportOutcomeMutationUsed: false;
    realParentClosureSummaryMutationUsed: false;
    realTeacherClosureNoteMutationUsed: false;
  };
  totals: DemoLearningMvpReadinessOverviewTotals;
  statusCounts: DemoLearningMvpReadinessOverviewStatusCounts;
  rows: DemoLearningMvpReadinessOverviewRow[];
};

export type DemoLearningAcceptanceTraceabilityGateStatusCounts = {
  acceptanceStatus: Record<
    DemoLearningAcceptanceTraceabilityGateStatus,
    number
  >;
};

export type DemoLearningAcceptanceTraceabilityGateTotals = {
  sliceCount: number;
  acceptanceCriterionCount: number;
  mappedCriterionCount: number;
  slicesWithMappingCount: number;
  slicesMissingMappingCount: number;
  productionReadyClaimCount: number;
  fixtureOnlyCriterionCount: number;
  safetyClosedCriterionCount: number;
  evidenceEndpointCount: number;
  jsonExportCount: number;
  markdownExportCount: number;
  dashboardEvidenceCount: number;
  seedCommandCount: number;
  reportCommandCount: number;
  testCommandCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningAcceptanceTraceabilityGateRow = {
  sliceKey: DemoLearningMvpReadinessOverviewSliceKey;
  sliceName: string;
  acceptanceCriterionId: string;
  acceptanceCriterionName: string;
  acceptanceStatus: DemoLearningAcceptanceTraceabilityGateStatus;
  readinessStatus: DemoLearningMvpReadinessOverviewStatus;
  productionReady: false;
  fixtureOnly: true;
  safetyClosed: boolean;
  evidenceEndpointPath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  dashboardEvidencePath: string;
  seedCommand: string;
  reportCommand: string;
  testCommand: string;
  safetyGatesCovered: string[];
  remainingLocalDemoNote: string;
  evidenceSummary: string;
};

export type DemoLearningAcceptanceTraceabilityGateReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  productionReady: false;
  fixtureOnly: true;
  safety: DemoLearningMvpReadinessOverviewReport['safety'];
  totals: DemoLearningAcceptanceTraceabilityGateTotals;
  statusCounts: DemoLearningAcceptanceTraceabilityGateStatusCounts;
  rows: DemoLearningAcceptanceTraceabilityGateRow[];
};

export type DemoLearningMvpAcceptanceEvidenceIndexStatus = 'MAPPED_LOCAL_DEMO';

export type DemoLearningMvpAcceptanceEvidenceIndexOwnerLabel =
  DemoLearningMvpRoleJourneyEntrypointOwner;

export type DemoLearningMvpAcceptanceEvidenceIndexSafetyStatus =
  'SAFETY_CLOSED';

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

export type DemoLearningParentScreenTimeGuardianControlsStatusCounts = {
  policyStatus: Record<DemoLearningScreenTimePolicyStatus, number>;
  gateDecision: Record<DemoLearningSessionGateDecision, number>;
  grantDecision: Record<DemoLearningScreenTimeGrantDecision, number>;
};

export type DemoLearningParentScreenTimeGuardianControlsTotals = {
  parentGuardianCount: number;
  childCount: number;
  activeScreenTimePolicyCount: number;
  allowedMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  grantRequestCount: number;
  grantDecisionCount: number;
  approvedGrantCount: number;
  deniedGrantCount: number;
  allowedSessionCount: number;
  blockedSessionCount: number;
  overrideSessionCount: number;
  childrenNeedingParentAttentionCount: number;
};

export type DemoLearningParentScreenTimeChildControlsRow = {
  guardianId: string;
  guardianName: string;
  guardianEmail: string;
  relationship: DemoLearningGuardianRelationship;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseIds: string[];
  courseCodes: string[];
  activePolicyId: string | null;
  policyStatus: DemoLearningScreenTimePolicyStatus;
  dailyAllowedMinutes: number;
  approvedGrantMinutes: number;
  totalAllowedMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  grantRequestCount: number;
  grantDecisionCount: number;
  allowedSessionCount: number;
  blockedSessionCount: number;
  overrideSessionCount: number;
  needsParentAttention: boolean;
  parentAttentionReason: string;
};

export type DemoLearningParentScreenTimeGateRow = {
  gateId: string;
  dailyPlanId: string;
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  guardianId: string;
  guardianName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  teacherName: string;
  lessonId: string;
  lessonCode: string;
  dailyPlanTitle: string;
  requestedAt: string;
  requestedMinutes: number;
  usedMinutesBeforeSession: number;
  sessionUsedMinutes: number;
  decision: DemoLearningSessionGateDecision;
  blockedReason: DemoLearningSessionGateBlockedReason | 'NONE';
  decidedBy: DemoLearningSessionGate['decidedBy'];
  accessMode: DemoLearningSessionGate['accessMode'];
  safeDailyPlanAccess: boolean;
};

export type DemoLearningParentScreenTimeGrantRow = {
  grantRequestId: string;
  sessionGateId: string;
  guardianId: string;
  guardianName: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  requestedExtraMinutes: number;
  requestedAt: string;
  decision: DemoLearningScreenTimeGrantDecision;
  decidedAt: string | null;
  grantedMinutes: number;
  decisionReason: string;
};

export type DemoLearningParentScreenTimeGuardianControlsReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    aiProviderUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realParentGuardianMutationUsed: false;
    realScreenTimePolicyMutationUsed: false;
    realLearningSessionGateMutationUsed: false;
    realScreenTimeGrantMutationUsed: false;
    realDailyPlanAccessMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningParentScreenTimeGuardianControlsTotals;
  statusCounts: DemoLearningParentScreenTimeGuardianControlsStatusCounts;
  childRows: DemoLearningParentScreenTimeChildControlsRow[];
  gateRows: DemoLearningParentScreenTimeGateRow[];
  grantRows: DemoLearningParentScreenTimeGrantRow[];
};

export type DemoLearningParentScreenTimeDailyPlanGuardAccessResult =
  'ALLOWED_SESSION' | 'BLOCKED_SESSION';

export type DemoLearningParentScreenTimeGrantDailyPlanGuardSafety =
  DemoLearningSubscriptionEntitlementDailyPlanAccessSafety & {
    aiProviderUsed: false;
    realParentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realParentGuardianMutationUsed: false;
    realScreenTimePolicyMutationUsed: false;
    realLearningSessionGateMutationUsed: false;
    realScreenTimeGrantMutationUsed: false;
    realDailyPlanAccessMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
  };

export type DemoLearningParentScreenTimeGrantDailyPlanGuardStatusCounts = {
  policyStatus: Record<DemoLearningScreenTimePolicyStatus, number>;
  gateDecision: Record<DemoLearningSessionGateDecision, number>;
  grantDecision: Record<DemoLearningScreenTimeGrantDecision, number>;
  accessResult: Record<
    DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
    number
  >;
};

export type DemoLearningParentScreenTimeGrantDailyPlanGuardTotals = {
  studentCount: number;
  parentGuardianCount: number;
  courseCount: number;
  dailyPlanAccessCaseCount: number;
  parentGrantRuleCount: number;
  screenTimeRuleCount: number;
  allowedSessionCount: number;
  blockedSessionCount: number;
  blockedReasonCount: number;
  safeNextActionCount: number;
  blockedOrLimitedCaseWithSafeNextActionCount: number;
  sessionGuardTraceCount: number;
  accessCasesWithStableTraceCount: number;
  allowedCasesWithStableTraceCount: number;
  blockedCasesWithStableTraceCount: number;
  blockedCasesWithReasonAndNextActionCount: number;
  learningSessionEvidenceCount: number;
  allowedLearningSessionEvidenceCount: number;
  blockedLearningSessionEvidenceCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow = {
  accessCaseId: string;
  sessionGuardTraceKey: string;
  sessionGuardTraceIds: string[];
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  relationship: DemoLearningGuardianRelationship;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  teacherName: string;
  learningPathId: string;
  learningPathTitle: string;
  learningPathStatus: DemoLearningPathStatus;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  lessonId: string;
  lessonCode: string;
  sessionId: string;
  screenTimePolicyId: string;
  screenTimePolicyStatus: DemoLearningScreenTimePolicyStatus;
  dailyAllowedMinutes: number;
  safeLearningWindowStart: string;
  safeLearningWindowEnd: string;
  parentGrantRuleId: string | null;
  parentGrantDecision: DemoLearningScreenTimeGrantDecision | 'NONE';
  parentGrantRuleApplied: boolean;
  grantedMinutes: number;
  requestedAt: string;
  requestedMinutes: number;
  usedMinutesBeforeSession: number;
  totalAllowedMinutesForCase: number;
  accessDecision: DemoLearningSessionGateDecision;
  accessResult: DemoLearningParentScreenTimeDailyPlanGuardAccessResult;
  blockedReasonCode: DemoLearningSessionGateBlockedReason | 'NONE';
  blockedReason: string | null;
  nextSafeActionLabel: string;
  learningSessionEvidenceId: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow = {
  grantRuleId: string;
  sessionGateId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  requestedExtraMinutes: number;
  grantedMinutes: number;
  requestedAt: string;
  decidedAt: string | null;
  decision: DemoLearningScreenTimeGrantDecision;
  allowsDailyPlanAccess: boolean;
  decisionReason: string;
  ruleTraceKey: string;
};

export type DemoLearningParentScreenTimeGrantDailyPlanGuardSessionEvidenceRow =
  {
    learningSessionEvidenceId: string;
    sessionGuardTraceKey: string;
    sessionGateId: string;
    dailyPlanId: string;
    dailyPlanTitle: string;
    studentId: string;
    childProfileId: string;
    studentName: string;
    courseCode: string;
    requestedAt: string;
    accessResult: DemoLearningParentScreenTimeDailyPlanGuardAccessResult;
    accessDecision: DemoLearningSessionGateDecision;
    sessionStarted: boolean;
    sessionDurationMinutes: number;
    blockedReason: string | null;
    nextSafeActionLabel: string;
    evidenceSummary: string;
  };

export type DemoLearningParentScreenTimeGrantDailyPlanGuardEvidenceRow = {
  evidenceKind:
    | 'PARENT_CHILD_COURSE_PLAN_TRACE'
    | 'PARENT_GRANT_RULE'
    | 'SCREEN_TIME_RULE'
    | 'ALLOWED_LEARNING_SESSION'
    | 'BLOCKED_LEARNING_SESSION'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningParentScreenTimeGrantDailyPlanGuardReport = {
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
  safety: DemoLearningParentScreenTimeGrantDailyPlanGuardSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentScreenTimeGrantDailyPlanGuardTotals;
  statusCounts: DemoLearningParentScreenTimeGrantDailyPlanGuardStatusCounts;
  accessRows: DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow[];
  grantRuleRows: DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow[];
  sessionEvidenceRows: DemoLearningParentScreenTimeGrantDailyPlanGuardSessionEvidenceRow[];
  evidenceRows: DemoLearningParentScreenTimeGrantDailyPlanGuardEvidenceRow[];
};

export type DemoLearningSessionCompletionPracticeProgressRollupStatus =
  'COMPLETED' | 'ON_TRACK' | 'NEEDS_SUPPORT' | 'IN_PROGRESS';

export type DemoLearningTeacherInterventionReviewStatus = 'REVIEWED';

export type DemoLearningRemedialAssignmentFixtureStatus = 'ASSIGNED';

export type DemoLearningSupportPlanFixtureStatus =
  'PARENT_VISIBLE_REVIEW_READY';

export type DemoLearningTeacherNextActionStatus = 'SCHEDULED';

export type DemoLearningSessionCompletionPracticeProgressRollupSafety =
  DemoLearningParentScreenTimeGrantDailyPlanGuardSafety & {
    realLearningSessionCompletionMutationUsed: false;
    realParentProgressSummaryMutationUsed: false;
    realTeacherProgressSummaryMutationUsed: false;
  };

export type DemoLearningSessionCompletionPracticeProgressRollupStatusCounts = {
  accessResult: Record<
    DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
    number
  >;
  dailyPlanStatus: Record<DemoLearningDailyPlanStatus, number>;
  practiceAttemptStatus: Record<DemoLearningPracticeAttemptStatus, number>;
  rollupStatus: Record<
    DemoLearningSessionCompletionPracticeProgressRollupStatus,
    number
  >;
};

export type DemoLearningSessionCompletionPracticeProgressRollupTotals = {
  studentCount: number;
  courseCount: number;
  dailyPlanSessionReferenceCount: number;
  allowedDailyPlanSessionReferenceCount: number;
  lessonCompletionEvidenceCount: number;
  practiceAttemptEvidenceCount: number;
  scoredPracticeAttemptEvidenceCount: number;
  progressRollupCount: number;
  parentVisibleProgressSummaryCount: number;
  teacherVisibleProgressSummaryCount: number;
  stableTraceCount: number;
  rollupsWithStudentCourseDailyPlanSessionCount: number;
  rollupsWithLessonPracticeEvidenceCount: number;
  rollupsWithParentTeacherSummaryCount: number;
  practiceAttemptsWithDeterministicScoreStatusCount: number;
  rollupsWithCompletionPercentCount: number;
  rollupsWithSafeNextActionLabelCount: number;
  completedRollupCount: number;
  needsSupportRollupCount: number;
  averageCompletionPercent: number;
  averagePracticeScorePercent: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
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

export type DemoLearningSessionCompletionPracticeProgressParentSummaryRow = {
  parentVisibleProgressSummaryId: string;
  progressRollupId: string;
  stableTraceKey: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  completionPercent: number;
  practiceScorePercent: number;
  rollupStatus: DemoLearningSessionCompletionPracticeProgressRollupStatus;
  nextSafeActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningSessionCompletionPracticeProgressTeacherSummaryRow = {
  teacherVisibleProgressSummaryId: string;
  progressRollupId: string;
  stableTraceKey: string;
  teacherName: string;
  classId: string;
  classCode: string;
  courseCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  dailyPlanId: string;
  lessonCode: string;
  completionPercent: number;
  practiceScorePercent: number;
  rollupStatus: DemoLearningSessionCompletionPracticeProgressRollupStatus;
  nextSafeActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningSessionCompletionPracticeProgressEvidenceRow = {
  evidenceKind:
    | 'ALLOWED_DAILY_PLAN_SESSION_REFERENCE'
    | 'LESSON_VIDEO_COMPLETION'
    | 'PRACTICE_SCORE_ATTEMPT'
    | 'PROGRESS_ROLLUP'
    | 'PARENT_VISIBLE_SUMMARY'
    | 'TEACHER_VISIBLE_SUMMARY'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSessionCompletionPracticeProgressRollupReport = {
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
  safety: DemoLearningSessionCompletionPracticeProgressRollupSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningSessionCompletionPracticeProgressRollupTotals;
  statusCounts: DemoLearningSessionCompletionPracticeProgressRollupStatusCounts;
  progressRollupRows: DemoLearningSessionCompletionPracticeProgressRollupRow[];
  parentSummaryRows: DemoLearningSessionCompletionPracticeProgressParentSummaryRow[];
  teacherSummaryRows: DemoLearningSessionCompletionPracticeProgressTeacherSummaryRow[];
  evidenceRows: DemoLearningSessionCompletionPracticeProgressEvidenceRow[];
};

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety =
  DemoLearningSessionCompletionPracticeProgressRollupSafety & {
    realTeacherInterventionReviewMutationUsed: false;
    realRemedialAssignmentMutationUsed: false;
    realSupportPlanMutationUsed: false;
    realParentSupportSummaryMutationUsed: false;
    realTeacherNextActionMutationUsed: false;
  };

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanStatusCounts =
  {
    interventionReviewStatus: Record<
      DemoLearningTeacherInterventionReviewStatus,
      number
    >;
    remedialAssignmentStatus: Record<
      DemoLearningRemedialAssignmentFixtureStatus,
      number
    >;
    supportPlanStatus: Record<DemoLearningSupportPlanFixtureStatus, number>;
    teacherNextActionStatus: Record<
      DemoLearningTeacherNextActionStatus,
      number
    >;
  };

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanTotals =
  {
    studentCount: number;
    teacherCount: number;
    courseCount: number;
    needsSupportProgressRollupCount: number;
    teacherInterventionReviewCount: number;
    remedialAssignmentCount: number;
    supportPlanCount: number;
    parentVisibleSupportSummaryCount: number;
    teacherVisibleNextActionCount: number;
    supportReasonCount: number;
    stableTraceCount: number;
    interventionLinksCompleteCount: number;
    supportPlansWithDeterministicStatusCount: number;
    remedialAssignmentsWithDeterministicStatusCount: number;
    teacherNextActionsWithSafeLabelCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };

export type DemoLearningTeacherInterventionReviewRow = {
  interventionReviewId: string;
  progressRollupId: string;
  stableTraceKey: string;
  stableTraceIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  learningPathId: string;
  sourceDailyPlanId: string;
  sourceDailyPlanTitle: string;
  sourceSessionId: string;
  learningSessionEvidenceId: string;
  remedialDailyPlanId: string;
  remedialPracticeAttemptId: string;
  remedialLessonId: string;
  remedialLessonCode: string;
  sourceAssignmentId: string | null;
  progressRecordId: string;
  rollupStatus: DemoLearningSessionCompletionPracticeProgressRollupStatus;
  completionPercent: number;
  practiceScorePercent: number;
  supportReason: string;
  reviewStatus: DemoLearningTeacherInterventionReviewStatus;
  reviewedAt: string;
  remedialAssignmentId: string;
  supportPlanId: string;
  parentVisibleSupportSummaryId: string;
  teacherVisibleNextActionId: string;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningRemedialAssignmentRow = {
  remedialAssignmentId: string;
  interventionReviewId: string;
  supportPlanId: string;
  progressRollupId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseCode: string;
  remedialDailyPlanId: string;
  remedialDailyPlanTitle: string;
  remedialLessonId: string;
  remedialLessonCode: string;
  sourcePracticeAttemptId: string;
  sourceAssignmentId: string | null;
  status: DemoLearningRemedialAssignmentFixtureStatus;
  dueAt: string;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSupportPlanRow = {
  supportPlanId: string;
  interventionReviewId: string;
  progressRollupId: string;
  remedialAssignmentId: string;
  parentVisibleSupportSummaryId: string;
  teacherVisibleNextActionId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseCode: string;
  supportReason: string;
  status: DemoLearningSupportPlanFixtureStatus;
  safeNextActionLabel: string;
  parentVisible: true;
  teacherVisible: true;
  planSummary: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentVisibleSupportSummaryRow = {
  parentVisibleSupportSummaryId: string;
  supportPlanId: string;
  interventionReviewId: string;
  progressRollupId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  supportReason: string;
  safeNextActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningTeacherVisibleNextActionRow = {
  teacherVisibleNextActionId: string;
  supportPlanId: string;
  interventionReviewId: string;
  progressRollupId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  classId: string;
  classCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  status: DemoLearningTeacherNextActionStatus;
  dueAt: string;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanEvidenceRow =
  {
    evidenceKind:
      | 'NEEDS_SUPPORT_PROGRESS_ROLLUP'
      | 'TEACHER_INTERVENTION_REVIEW'
      | 'REMEDIAL_ASSIGNMENT'
      | 'SUPPORT_PLAN'
      | 'PARENT_VISIBLE_SUPPORT_SUMMARY'
      | 'TEACHER_VISIBLE_NEXT_ACTION'
      | 'STABLE_TRACE'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport =
  {
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
    safety: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety;
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES';
      summary: string;
      remainingLocalDemoNotes: string[];
    };
    totals: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanTotals;
    statusCounts: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanStatusCounts;
    interventionReviewRows: DemoLearningTeacherInterventionReviewRow[];
    remedialAssignmentRows: DemoLearningRemedialAssignmentRow[];
    supportPlanRows: DemoLearningSupportPlanRow[];
    parentSummaryRows: DemoLearningParentVisibleSupportSummaryRow[];
    teacherNextActionRows: DemoLearningTeacherVisibleNextActionRow[];
    evidenceRows: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanEvidenceRow[];
  };

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupSafety =
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety & {
    realRemedialRetryCompletionMutationUsed: false;
    realSupportOutcomeEvidenceMutationUsed: false;
    realParentFollowupSummaryMutationUsed: false;
    realTeacherFollowupSummaryMutationUsed: false;
  };

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupStatusCounts =
  {
    retryStatus: Record<DemoLearningRemedialRetryCompletionStatus, number>;
    supportOutcomeStatus: Record<
      DemoLearningSupportOutcomeEvidenceStatus,
      number
    >;
  };

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupTotals = {
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  supportPlanReferenceCount: number;
  remedialAssignmentReferenceCount: number;
  remedialRetryCompletionCount: number;
  supportOutcomeEvidenceCount: number;
  parentVisibleFollowupSummaryCount: number;
  teacherVisibleFollowupSummaryCount: number;
  safeNextActionCount: number;
  stableTraceCount: number;
  retryLinksCompleteCount: number;
  outcomesWithDeterministicStatusCount: number;
  retriesWithDeterministicStatusScoreCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningRemedialRetryCompletionRow = {
  retryCompletionId: string;
  stableTraceKey: string;
  stableTraceIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  learningPathId: string;
  progressRollupId: string;
  interventionReviewId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  remedialDailyPlanId: string;
  remedialDailyPlanTitle: string;
  remedialPracticeAttemptId: string;
  remedialLessonCode: string;
  retryStatus: DemoLearningRemedialRetryCompletionStatus;
  completedAt: string;
  completionPercent: number;
  scorePercent: number;
  supportOutcomeId: string;
  supportOutcomeStatus: DemoLearningSupportOutcomeEvidenceStatus;
  supportOutcomeAt: string;
  parentFollowupSummaryId: string;
  teacherFollowupSummaryId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
  outcomeSummary: string;
  parentFollowupSummary: string;
  teacherFollowupSummary: string;
};

export type DemoLearningSupportOutcomeEvidenceRow = {
  supportOutcomeId: string;
  retryCompletionId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseCode: string;
  status: DemoLearningSupportOutcomeEvidenceStatus;
  scorePercent: number;
  completionPercent: number;
  outcomeAt: string;
  parentFollowupSummaryId: string;
  teacherFollowupSummaryId: string;
  safeNextActionLabel: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  outcomeSummary: string;
};

export type DemoLearningParentVisibleFollowupSummaryRow = {
  parentFollowupSummaryId: string;
  supportOutcomeId: string;
  retryCompletionId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  retryStatus: DemoLearningRemedialRetryCompletionStatus;
  supportOutcomeStatus: DemoLearningSupportOutcomeEvidenceStatus;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningTeacherVisibleFollowupSummaryRow = {
  teacherFollowupSummaryId: string;
  supportOutcomeId: string;
  retryCompletionId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  classId: string;
  classCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  retryStatus: DemoLearningRemedialRetryCompletionStatus;
  supportOutcomeStatus: DemoLearningSupportOutcomeEvidenceStatus;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupEvidenceRow =
  {
    evidenceKind:
      | 'SUPPORT_PLAN_REFERENCE'
      | 'REMEDIAL_ASSIGNMENT_REFERENCE'
      | 'REMEDIAL_RETRY_COMPLETION'
      | 'SUPPORT_OUTCOME_EVIDENCE'
      | 'PARENT_VISIBLE_FOLLOWUP_SUMMARY'
      | 'TEACHER_VISIBLE_FOLLOWUP_SUMMARY'
      | 'STABLE_TRACE'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport = {
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
  safety: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupTotals;
  statusCounts: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupStatusCounts;
  retryCompletionRows: DemoLearningRemedialRetryCompletionRow[];
  supportOutcomeRows: DemoLearningSupportOutcomeEvidenceRow[];
  parentFollowupSummaryRows: DemoLearningParentVisibleFollowupSummaryRow[];
  teacherFollowupSummaryRows: DemoLearningTeacherVisibleFollowupSummaryRow[];
  evidenceRows: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupEvidenceRow[];
};

export type DemoLearningRemedialRetryUnresolvedSupportEscalationSafety =
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety & {
    realRemedialRetryUnresolvedAttemptMutationUsed: false;
    realUnresolvedSupportOutcomeMutationUsed: false;
    realTeacherEscalationMutationUsed: false;
    realSupportAdjustmentMutationUsed: false;
    realParentEscalationSummaryMutationUsed: false;
    realTeacherEscalationNextActionMutationUsed: false;
  };

export type DemoLearningRemedialRetryUnresolvedSupportEscalationStatusCounts = {
  retryStatus: Record<DemoLearningRemedialRetryUnresolvedAttemptStatus, number>;
  unresolvedOutcomeStatus: Record<
    DemoLearningUnresolvedSupportOutcomeStatus,
    number
  >;
  reasonCode: Record<DemoLearningUnresolvedSupportOutcomeReasonCode, number>;
  teacherEscalationStatus: Record<DemoLearningTeacherEscalationStatus, number>;
  supportAdjustmentStatus: Record<DemoLearningSupportAdjustmentStatus, number>;
};

export type DemoLearningRemedialRetryUnresolvedSupportEscalationTotals = {
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  supportPlanReferenceCount: number;
  remedialAssignmentReferenceCount: number;
  remedialRetryAttemptCount: number;
  failedOrIncompleteRetryCount: number;
  unresolvedSupportOutcomeCount: number;
  teacherEscalationCount: number;
  supportAdjustmentCount: number;
  parentVisibleEscalationSummaryCount: number;
  teacherVisibleEscalationNextActionCount: number;
  safeNextActionCount: number;
  stableTraceCount: number;
  unresolvedRetryLinksCompleteCount: number;
  outcomesWithDeterministicStatusReasonActionCount: number;
  attemptsWithDeterministicStatusScoreCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningRemedialRetryUnresolvedAttemptRow = {
  retryAttemptId: string;
  stableTraceKey: string;
  stableTraceIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  learningPathId: string;
  progressRollupId: string;
  interventionReviewId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  remedialDailyPlanId: string;
  remedialDailyPlanTitle: string;
  remedialPracticeAttemptId: string;
  remedialLessonCode: string;
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  attemptedAt: string;
  completionPercent: number;
  scorePercent: number;
  unresolvedOutcomeId: string;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  outcomeAt: string;
  teacherEscalationId: string;
  teacherEscalationStatus: DemoLearningTeacherEscalationStatus;
  supportAdjustmentId: string;
  supportAdjustmentStatus: DemoLearningSupportAdjustmentStatus;
  parentEscalationSummaryId: string;
  teacherEscalationNextActionId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
  unresolvedOutcomeSummary: string;
  teacherEscalationSummary: string;
  supportAdjustmentSummary: string;
  parentEscalationSummary: string;
  teacherNextActionSummary: string;
};

export type DemoLearningUnresolvedSupportOutcomeEvidenceRow = {
  unresolvedOutcomeId: string;
  retryAttemptId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseCode: string;
  status: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  outcomeAt: string;
  teacherEscalationId: string;
  parentEscalationSummaryId: string;
  teacherEscalationNextActionId: string;
  safeNextActionLabel: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  outcomeSummary: string;
};

export type DemoLearningTeacherEscalationSupportAdjustmentRow = {
  teacherEscalationId: string;
  supportAdjustmentId: string;
  unresolvedOutcomeId: string;
  retryAttemptId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  classId: string;
  classCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  escalationStatus: DemoLearningTeacherEscalationStatus;
  supportAdjustmentStatus: DemoLearningSupportAdjustmentStatus;
  safeNextActionLabel: string;
  teacherVisible: true;
  escalationSummary: string;
  supportAdjustmentSummary: string;
};

export type DemoLearningParentVisibleEscalationSummaryRow = {
  parentEscalationSummaryId: string;
  unresolvedOutcomeId: string;
  retryAttemptId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningTeacherVisibleEscalationNextActionRow = {
  teacherEscalationNextActionId: string;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  unresolvedOutcomeId: string;
  retryAttemptId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  classId: string;
  classCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningRemedialRetryUnresolvedSupportEscalationEvidenceRow = {
  evidenceKind:
    | 'SUPPORT_PLAN_REFERENCE'
    | 'REMEDIAL_ASSIGNMENT_REFERENCE'
    | 'FAILED_OR_INCOMPLETE_RETRY'
    | 'UNRESOLVED_SUPPORT_OUTCOME'
    | 'TEACHER_ESCALATION_SUPPORT_ADJUSTMENT'
    | 'PARENT_VISIBLE_ESCALATION_SUMMARY'
    | 'TEACHER_VISIBLE_ESCALATION_NEXT_ACTION'
    | 'STABLE_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningRemedialRetryUnresolvedSupportEscalationReport = {
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
  safety: DemoLearningRemedialRetryUnresolvedSupportEscalationSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningRemedialRetryUnresolvedSupportEscalationTotals;
  statusCounts: DemoLearningRemedialRetryUnresolvedSupportEscalationStatusCounts;
  retryAttemptRows: DemoLearningRemedialRetryUnresolvedAttemptRow[];
  unresolvedOutcomeRows: DemoLearningUnresolvedSupportOutcomeEvidenceRow[];
  teacherEscalationRows: DemoLearningTeacherEscalationSupportAdjustmentRow[];
  parentEscalationSummaryRows: DemoLearningParentVisibleEscalationSummaryRow[];
  teacherEscalationNextActionRows: DemoLearningTeacherVisibleEscalationNextActionRow[];
  evidenceRows: DemoLearningRemedialRetryUnresolvedSupportEscalationEvidenceRow[];
};

export type DemoLearningTeacherEscalationFollowupResolutionSafety =
  DemoLearningRemedialRetryUnresolvedSupportEscalationSafety & {
    realTeacherReviewedEscalationMutationUsed: false;
    realAdjustedSupportRetryCompletionMutationUsed: false;
    realResolvedSupportOutcomeMutationUsed: false;
    realParentClosureSummaryMutationUsed: false;
    realTeacherClosureNoteMutationUsed: false;
  };

export type DemoLearningTeacherEscalationFollowupResolutionStatusCounts = {
  teacherReviewedEscalationStatus: Record<
    DemoLearningTeacherReviewedEscalationStatus,
    number
  >;
  adjustedSupportRetryStatus: Record<
    DemoLearningAdjustedSupportRetryCompletionStatus,
    number
  >;
  resolvedOutcomeStatus: Record<
    DemoLearningResolvedSupportOutcomeStatus,
    number
  >;
  resolvedOutcomeReasonCode: Record<
    DemoLearningResolvedSupportOutcomeReasonCode,
    number
  >;
};

export type DemoLearningTeacherEscalationFollowupResolutionTotals = {
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  unresolvedEscalationReferenceCount: number;
  teacherReviewedEscalationCount: number;
  adjustedSupportRetryCompletionCount: number;
  resolvedSupportOutcomeCount: number;
  parentVisibleClosureSummaryCount: number;
  teacherVisibleClosureNoteCount: number;
  safeNextActionCount: number;
  stableTraceCount: number;
  resolvedFlowLinksCompleteCount: number;
  outcomesWithDeterministicStatusReasonActionCount: number;
  adjustedRetriesWithDeterministicStatusScoreCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningTeacherEscalationFollowupResolutionRow = {
  resolutionId: string;
  stableTraceKey: string;
  stableTraceIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  learningPathId: string;
  progressRollupId: string;
  interventionReviewId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  remedialDailyPlanId: string;
  remedialDailyPlanTitle: string;
  remedialPracticeAttemptId: string;
  remedialLessonCode: string;
  unresolvedRetryAttemptId: string;
  unresolvedRetryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeId: string;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  unresolvedReasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  teacherReviewedEscalationId: string;
  teacherReviewedEscalationStatus: DemoLearningTeacherReviewedEscalationStatus;
  teacherReviewedAt: string;
  adjustedSupportRetryCompletionId: string;
  adjustedSupportRetryStatus: DemoLearningAdjustedSupportRetryCompletionStatus;
  completedAt: string;
  completionPercent: number;
  scorePercent: number;
  resolvedSupportOutcomeId: string;
  resolvedSupportOutcomeStatus: DemoLearningResolvedSupportOutcomeStatus;
  resolvedOutcomeReasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  resolvedOutcomeAt: string;
  parentClosureSummaryId: string;
  teacherClosureNoteId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
  teacherReviewSummary: string;
  adjustedRetryCompletionSummary: string;
  resolvedOutcomeSummary: string;
  parentClosureSummary: string;
  teacherClosureNoteSummary: string;
};

export type DemoLearningTeacherReviewedEscalationRow = {
  teacherReviewedEscalationId: string;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  unresolvedOutcomeId: string;
  unresolvedRetryAttemptId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  courseCode: string;
  classCode: string;
  reviewStatus: DemoLearningTeacherReviewedEscalationStatus;
  reviewedAt: string;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningAdjustedSupportRetryCompletionRow = {
  adjustedSupportRetryCompletionId: string;
  teacherReviewedEscalationId: string;
  supportAdjustmentId: string;
  unresolvedRetryAttemptId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherName: string;
  courseCode: string;
  remedialAssignmentId: string;
  remedialDailyPlanId: string;
  remedialPracticeAttemptId: string;
  retryStatus: DemoLearningAdjustedSupportRetryCompletionStatus;
  completedAt: string;
  scorePercent: number;
  completionPercent: number;
  resolvedSupportOutcomeId: string;
  safeNextActionLabel: string;
  summary: string;
};

export type DemoLearningResolvedSupportOutcomeEvidenceRow = {
  resolvedSupportOutcomeId: string;
  adjustedSupportRetryCompletionId: string;
  teacherReviewedEscalationId: string;
  unresolvedOutcomeId: string;
  supportAdjustmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseCode: string;
  status: DemoLearningResolvedSupportOutcomeStatus;
  reasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  outcomeAt: string;
  parentClosureSummaryId: string;
  teacherClosureNoteId: string;
  safeNextActionLabel: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  outcomeSummary: string;
};

export type DemoLearningParentVisibleClosureSummaryRow = {
  parentClosureSummaryId: string;
  resolvedSupportOutcomeId: string;
  adjustedSupportRetryCompletionId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  resolvedOutcomeStatus: DemoLearningResolvedSupportOutcomeStatus;
  resolvedOutcomeReasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningTeacherVisibleClosureNoteRow = {
  teacherClosureNoteId: string;
  resolvedSupportOutcomeId: string;
  adjustedSupportRetryCompletionId: string;
  teacherReviewedEscalationId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  classId: string;
  classCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  resolvedOutcomeStatus: DemoLearningResolvedSupportOutcomeStatus;
  resolvedOutcomeReasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningTeacherEscalationFollowupResolutionEvidenceRow = {
  evidenceKind:
    | 'UNRESOLVED_ESCALATION_REFERENCE'
    | 'TEACHER_REVIEWED_ESCALATION'
    | 'ADJUSTED_SUPPORT_RETRY_COMPLETION'
    | 'RESOLVED_SUPPORT_OUTCOME'
    | 'PARENT_VISIBLE_CLOSURE_SUMMARY'
    | 'TEACHER_VISIBLE_CLOSURE_NOTE'
    | 'SAFE_NEXT_ACTION'
    | 'STABLE_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningTeacherEscalationFollowupResolutionReport = {
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
  safety: DemoLearningTeacherEscalationFollowupResolutionSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningTeacherEscalationFollowupResolutionTotals;
  statusCounts: DemoLearningTeacherEscalationFollowupResolutionStatusCounts;
  resolutionRows: DemoLearningTeacherEscalationFollowupResolutionRow[];
  teacherReviewedEscalationRows: DemoLearningTeacherReviewedEscalationRow[];
  adjustedSupportRetryCompletionRows: DemoLearningAdjustedSupportRetryCompletionRow[];
  resolvedSupportOutcomeRows: DemoLearningResolvedSupportOutcomeEvidenceRow[];
  parentClosureSummaryRows: DemoLearningParentVisibleClosureSummaryRow[];
  teacherClosureNoteRows: DemoLearningTeacherVisibleClosureNoteRow[];
  evidenceRows: DemoLearningTeacherEscalationFollowupResolutionEvidenceRow[];
};

export type DemoLearningMvpEndToEndReadinessTraceSafety =
  DemoLearningTeacherEscalationFollowupResolutionSafety;

export type DemoLearningMvpEndToEndReadinessTraceStatusCounts = {
  traceStatus: Record<'LOCAL_DEMO_READY_WITH_NOTES', number>;
  ownerLabel: Record<'TEACHER', number>;
};

export type DemoLearningMvpEndToEndReadinessTraceTotals = {
  studentCount: number;
  courseCount: number;
  enrollmentOrSubscriptionCount: number;
  paymentRefundCommissionFixtureEvidenceCount: number;
  entitlementOrDailyPlanCount: number;
  practiceProgressOrCompletionCount: number;
  parentTeacherReportCount: number;
  permissionRedactionEvidenceCount: number;
  approvedDeliveryOrReadReceiptCount: number;
  alignedApprovedDeliveryStudentCoursePathCount: number;
  screenTimeGuardEvidenceCount: number;
  teacherInterventionEvidenceCount: number;
  remedialRetryOrEscalationEvidenceCount: number;
  escalationResolutionEvidenceCount: number;
  stableEndToEndTraceCount: number;
  deterministicStatusReasonActionOwnerCount: number;
  sameStudentCoursePathCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningMvpEndToEndReadinessTraceRow = {
  traceId: string;
  stableEndToEndTraceKey: string;
  stableEndToEndTraceIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  enrollmentId: string;
  enrollmentStatus: DemoLearningEnrollmentStatus;
  subscriptionId: string;
  subscriptionStatus: DemoLearningSubscriptionStatus;
  paymentId: string;
  paymentStatus: DemoLearningPaymentStatus;
  refundIds: string[];
  commissionIds: string[];
  entitlementId: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  entitlementAccessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  learningPathId: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  practiceProgressRollupId: string;
  practiceAttemptId: string;
  practiceAttemptStatus: DemoLearningPracticeAttemptStatus;
  practiceScorePercent: number;
  progressStatus: DemoLearningProgressStatus;
  parentTeacherReportSummaryId: string;
  parentTeacherPermissionCaseId: string;
  permissionRedactionEvidenceId: string;
  approvedDeliveryOrReadReceiptId: string;
  approvedDeliveryStudentId: string;
  approvedDeliveryCourseId: string;
  screenTimeGuardEvidenceId: string;
  screenTimeAccessResult: DemoLearningParentScreenTimeDailyPlanGuardAccessResult;
  teacherInterventionReviewId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  remedialRetryOrEscalationId: string;
  remedialRetryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeId: string;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  escalationResolutionId: string;
  resolvedSupportOutcomeId: string;
  resolutionStatus: DemoLearningResolvedSupportOutcomeStatus;
  traceStatus: 'LOCAL_DEMO_READY_WITH_NOTES';
  reasonLabel: string;
  actionLabel: string;
  ownerLabel: 'TEACHER';
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  productionReady: false;
  evidenceSummary: string;
};

export type DemoLearningMvpEndToEndReadinessTraceEvidenceRow = {
  evidenceKind:
    | 'STUDENT_COURSE_ENROLLMENT_SUBSCRIPTION'
    | 'PAYMENT_REFUND_COMMISSION_FIXTURE'
    | 'ENTITLEMENT_DAILY_PLAN'
    | 'PRACTICE_PROGRESS_COMPLETION'
    | 'PARENT_TEACHER_REPORTING'
    | 'PERMISSION_REDACTION'
    | 'APPROVED_DELIVERY_READ_RECEIPT'
    | 'SCREEN_TIME_GUARD'
    | 'TEACHER_INTERVENTION'
    | 'REMEDIAL_RETRY_OR_ESCALATION'
    | 'ESCALATION_RESOLUTION'
    | 'STABLE_END_TO_END_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningMvpEndToEndReadinessTraceReport = {
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
  safety: DemoLearningMvpEndToEndReadinessTraceSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningMvpEndToEndReadinessTraceTotals;
  statusCounts: DemoLearningMvpEndToEndReadinessTraceStatusCounts;
  traceRows: DemoLearningMvpEndToEndReadinessTraceRow[];
  evidenceRows: DemoLearningMvpEndToEndReadinessTraceEvidenceRow[];
};

export type DemoLearningMvpRoleJourneyEntrypointRole =
  'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN_OPERATOR';

export type DemoLearningMvpRoleJourneyEntrypointStatus =
  'LOCAL_DEMO_READY_WITH_NOTES';

export type DemoLearningMvpRoleJourneyEntrypointOwner =
  'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN_OPERATOR';

export type DemoLearningMvpRoleJourneyEntrypointsSafety =
  DemoLearningMvpEndToEndReadinessTraceSafety;

export type DemoLearningMvpRoleJourneyEntrypointsStatusCounts = {
  role: Record<DemoLearningMvpRoleJourneyEntrypointRole, number>;
  status: Record<DemoLearningMvpRoleJourneyEntrypointStatus, number>;
  ownerLabel: Record<DemoLearningMvpRoleJourneyEntrypointOwner, number>;
};

export type DemoLearningMvpRoleJourneyEntrypointsTotals = {
  roleEntrypointCount: number;
  studentRoleEntrypointCount: number;
  parentRoleEntrypointCount: number;
  teacherRoleEntrypointCount: number;
  adminRoleEntrypointCount: number;
  stableRoleJourneyTraceCount: number;
  sameStudentCoursePathCount: number;
  linkedMvpReadinessTraceCount: number;
  linkedParentReadReceiptCount: number;
  linkedTeacherEscalationResolutionCount: number;
  deterministicStatusReasonActionOwnerCount: number;
  routeAnchorActionStatusLabelCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningMvpRoleJourneyEntrypointRow = {
  roleEntrypointId: string;
  role: DemoLearningMvpRoleJourneyEntrypointRole;
  roleLabel: string;
  stableRoleJourneyTraceId: string;
  stableRoleJourneyTraceKey: string;
  stableRoleJourneyTraceIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  learningPathId: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  practiceAttemptId: string;
  routePath: string;
  dashboardAnchor: string;
  routeLabel: string;
  anchorLabel: string;
  actionLabel: string;
  statusLabel: DemoLearningMvpRoleJourneyEntrypointStatus;
  reasonLabel: string;
  ownerLabel: DemoLearningMvpRoleJourneyEntrypointOwner;
  mvpReadinessTraceId: string;
  parentInboxItemId: string;
  parentReadReceiptEvidenceId: string;
  screenTimeGuardEvidenceId: string;
  teacherProgressSummaryId: string;
  teacherInterventionReviewId: string;
  remedialAssignmentId: string;
  remedialRetryOrEscalationId: string;
  teacherEscalationResolutionId: string;
  safetyOverviewAnchor: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  productionReady: false;
  evidenceSummary: string;
};

export type DemoLearningMvpRoleJourneyTraceRow = {
  stableRoleJourneyTraceId: string;
  stableRoleJourneyTraceKey: string;
  studentId: string;
  courseId: string;
  learningPathId: string;
  roleEntrypointIds: string[];
  roleLabels: string[];
  mvpReadinessTraceId: string;
  parentReadReceiptEvidenceId: string;
  teacherEscalationResolutionId: string;
  traceStatus: DemoLearningMvpRoleJourneyEntrypointStatus;
  reasonLabel: string;
  actionLabel: string;
  ownerLabel: 'ADMIN_OPERATOR';
  evidenceSummary: string;
};

export type DemoLearningMvpRoleJourneyEntrypointsEvidenceRow = {
  evidenceKind:
    | 'STUDENT_ENTRYPOINT'
    | 'PARENT_ENTRYPOINT'
    | 'TEACHER_ENTRYPOINT'
    | 'ADMIN_OPERATOR_ENTRYPOINT'
    | 'STABLE_ROLE_JOURNEY_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningMvpRoleJourneyEntrypointsReport = {
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
  safety: DemoLearningMvpRoleJourneyEntrypointsSafety;
  currentStatus: {
    status: DemoLearningMvpRoleJourneyEntrypointStatus;
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningMvpRoleJourneyEntrypointsTotals;
  statusCounts: DemoLearningMvpRoleJourneyEntrypointsStatusCounts;
  entrypointRows: DemoLearningMvpRoleJourneyEntrypointRow[];
  stableTraceRows: DemoLearningMvpRoleJourneyTraceRow[];
  evidenceRows: DemoLearningMvpRoleJourneyEntrypointsEvidenceRow[];
};

export type DemoLearningParentTeacherProgressAlertStatusCounts = {
  alertSeverity: Record<DemoLearningProgressAlertSeverity, number>;
  alertReason: Record<DemoLearningProgressAlertReason, number>;
  followUpStatus: Record<DemoLearningProgressAlertFollowUpStatus, number>;
};

export type DemoLearningParentTeacherProgressAlertTotals = {
  studentCount: number;
  courseCount: number;
  learnerProgressSummaryCount: number;
  alertCount: number;
  highRiskAlertCount: number;
  mediumRiskAlertCount: number;
  resolvedAlertCount: number;
  followUpNeededAlertCount: number;
  teacherInterventionRecommendationCount: number;
  parentSummaryCount: number;
  openFollowUpCount: number;
  scheduledFollowUpCount: number;
  resolvedFollowUpCount: number;
  monitoringFollowUpCount: number;
};

export type DemoLearningParentTeacherAlertReasonSummaryRow = {
  alertReason: DemoLearningProgressAlertReason;
  reasonLabel: string;
  alertCount: number;
};

export type DemoLearningParentTeacherLearnerSummaryRow = {
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  teacherName: string;
  progressStatus: DemoLearningProgressStatus;
  progressPercent: number;
  attendanceRatePercent: number;
  missingSubmissionCount: number;
  skippedVideoCount: number;
  blockedDailyPlanCount: number;
  averagePracticeScorePercent: number;
  alertCount: number;
  highRiskAlertCount: number;
  mediumRiskAlertCount: number;
  followUpNeededAlertCount: number;
  highestAlertSeverity: DemoLearningProgressAlertSeverity | 'NONE';
};

export type DemoLearningParentTeacherProgressAlertRow = {
  alertId: string;
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  teacherName: string;
  alertSeverity: DemoLearningProgressAlertSeverity;
  alertReason: DemoLearningProgressAlertReason;
  reasonLabel: string;
  evidenceSummary: string;
  progressPercent: number;
  attendanceRatePercent: number;
  missingSubmissionCount: number;
  skippedVideoCount: number;
  blockedDailyPlanCount: number;
  averagePracticeScorePercent: number;
  teacherInterventionRecommendation: string;
  parentSummary: string;
  followUpStatus: DemoLearningProgressAlertFollowUpStatus;
  recommendedFollowUpAt: string;
};

export type DemoLearningParentTeacherProgressAlertInterventionReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    aiProviderUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningParentTeacherProgressAlertTotals;
  statusCounts: DemoLearningParentTeacherProgressAlertStatusCounts;
  topAlertReasons: DemoLearningParentTeacherAlertReasonSummaryRow[];
  learnerSummaries: DemoLearningParentTeacherLearnerSummaryRow[];
  alertRows: DemoLearningParentTeacherProgressAlertRow[];
};
