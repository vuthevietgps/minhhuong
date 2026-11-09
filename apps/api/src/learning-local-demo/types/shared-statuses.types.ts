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

export type DemoLearningPathStatus =
  'ACTIVE' | 'COMPLETED' | 'NEEDS_SUPPORT' | 'WITHDRAWN';

export type DemoLearningDailyPlanStatus =
  'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'SKIPPED' | 'ASSIGNED';

export type DemoLearningVideoEvidenceStatus =
  'COMPLETED' | 'INCOMPLETE' | 'SKIPPED';

export type DemoLearningPracticeAttemptStatus =
  'PASSED' | 'NEEDS_RETRY' | 'INCOMPLETE' | 'SKIPPED';

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

export type DemoLearningAttendanceStatus =
  'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type DemoLearningProgressStatus =
  'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_SUPPORT' | 'COMPLETED' | 'WITHDRAWN';

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

export type DemoLearningMvpAcceptanceEvidenceIndexStatus = 'MAPPED_LOCAL_DEMO';

export type DemoLearningMvpAcceptanceEvidenceIndexSafetyStatus =
  'SAFETY_CLOSED';

export type DemoLearningParentScreenTimeDailyPlanGuardAccessResult =
  'ALLOWED_SESSION' | 'BLOCKED_SESSION';

export type DemoLearningSessionCompletionPracticeProgressRollupStatus =
  'COMPLETED' | 'ON_TRACK' | 'NEEDS_SUPPORT' | 'IN_PROGRESS';
