import type { DemoLearningParentScreenTimeGrantDailyPlanGuardReport } from "./parent-screen-time-grant-daily-plan-guard.types";

export type DemoLearningEnrollmentReportRow = {
  enrollmentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  courseTitle: string;
  enrollmentStatus: "ACTIVE" | "PENDING" | "CANCELED";
  subscriptionStatus:
    "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  refundStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "NONE";
  grossPaidCents: number;
  pendingPaymentCents: number;
  refundedCents: number;
  netRevenueCents: number;
  commissionPendingCents: number;
  commissionPayableCents: number;
  commissionApprovedCents: number;
  commissionCanceledCents: number;
};

export type DemoLearningCoreReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
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
  totals: {
    studentCount: number;
    courseCount: number;
    enrollmentCount: number;
    activeEnrollmentCount: number;
    pendingEnrollmentCount: number;
    canceledEnrollmentCount: number;
    subscriptionCount: number;
    activeSubscriptionCount: number;
    trialingSubscriptionCount: number;
    paymentCount: number;
    pendingPaymentCount: number;
    succeededPaymentCount: number;
    refundedPaymentCount: number;
    refundCount: number;
    commissionCount: number;
    pendingCommissionCount: number;
    payableCommissionCount: number;
    approvedCommissionCount: number;
    canceledCommissionCount: number;
    grossPaidCents: number;
    pendingPaymentCents: number;
    refundedCents: number;
    netRevenueCents: number;
    commissionEarnedCents: number;
  };
  rows: DemoLearningEnrollmentReportRow[];
};

export type DemoLearningClassAggregateRow = {
  classCode: string;
  classTitle: string;
  courseCode: string;
  teacherName: string;
  status: "ACTIVE" | "COMPLETED";
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
  classCode: string;
  courseCode: string;
  sequence: number;
  lessonCode: string;
  title: string;
  status: "SCHEDULED" | "COMPLETED";
  scheduledStart: string;
  attendanceRecordCount: number;
  presentAttendanceCount: number;
  lateAttendanceCount: number;
  absentAttendanceCount: number;
  excusedAttendanceCount: number;
};

export type DemoLearningLearnerProgressRow = {
  enrollmentId: string;
  studentName: string;
  classCode: string;
  attendanceRecordCount: number;
  presentAttendanceCount: number;
  lateAttendanceCount: number;
  absentAttendanceCount: number;
  excusedAttendanceCount: number;
  attendanceRatePercent: number;
  progressStatus:
    "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_SUPPORT" | "COMPLETED" | "WITHDRAWN";
  completedLessonCount: number;
  totalLessonCount: number;
  completionPercent: number;
};

export type DemoLearningAssignmentAssessmentRow = {
  assignmentId: string;
  lessonCode: string;
  classCode: string;
  kind: "ASSIGNMENT" | "QUIZ";
  title: string;
  status: "OPEN" | "CLOSED";
  expectedSubmissionCount: number;
  submittedSubmissionCount: number;
  lateSubmissionCount: number;
  missingSubmissionCount: number;
  resubmittedSubmissionCount: number;
  scoredSubmissionCount: number;
  pendingFeedbackCount: number;
  averageScorePercent: number;
};

export type DemoLearningLearnerAssessmentRow = {
  enrollmentId: string;
  studentName: string;
  classCode: string;
  progressStatus:
    "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_SUPPORT" | "COMPLETED" | "WITHDRAWN";
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
  assessmentBand:
    "EXCELLENT" | "ON_TRACK" | "NEEDS_SUPPORT" | "MISSING" | "WITHDRAWN";
};

export type DemoLearningPathEvidenceRow = {
  learningPathId: string;
  studentName: string;
  childProfileId: string;
  courseCode: string;
  classCode: string;
  title: string;
  pathStatus: "ACTIVE" | "COMPLETED" | "NEEDS_SUPPORT" | "WITHDRAWN";
  dailyPlanCount: number;
  completedDailyPlanCount: number;
  blockedDailyPlanCount: number;
  skippedDailyPlanCount: number;
  completedVideoCount: number;
  passedPracticeCount: number;
  averagePracticeScorePercent: number;
  progressPercent: number;
  learnerStatusBand: "ON_TRACK" | "NEEDS_SUPPORT" | "INACTIVE" | "WITHDRAWN";
};

export type DemoLearningDailyPlanEvidenceRow = {
  dailyPlanId: string;
  studentName: string;
  classCode: string;
  lessonCode: string;
  planDate: string;
  title: string;
  dailyPlanStatus:
    "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
  videoEvidenceStatus: "COMPLETED" | "INCOMPLETE" | "SKIPPED";
  videoCompletionPercent: number;
  practiceAttemptStatus: "PASSED" | "NEEDS_RETRY" | "INCOMPLETE" | "SKIPPED";
  practiceScorePercent: number | null;
};

export type DemoLearningPathDailyPlanVideoPracticeEvidenceReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningCoreReport["safety"] & {
    noProductionDbRead: true;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
  };
  totals: {
    learningPathCount: number;
    dailyPlanCount: number;
    completedDailyPlanCount: number;
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
  learningPathRows: DemoLearningPathEvidenceRow[];
  dailyPlanRows: DemoLearningDailyPlanEvidenceRow[];
};

export type DemoLearningParentTeacherProgressAlertRow = {
  alertId: string;
  studentName: string;
  childProfileId: string;
  parentEmail: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  alertSeverity: "HIGH" | "MEDIUM";
  alertReason:
    | "MISSING_SUBMISSIONS"
    | "LOW_PRACTICE_SCORE"
    | "SKIPPED_VIDEO"
    | "ATTENDANCE_SESSION_GAP"
    | "STALLED_DAILY_PLAN";
  reasonLabel: string;
  evidenceSummary: string;
  progressPercent: number;
  attendanceRatePercent: number;
  teacherInterventionRecommendation: string;
  parentSummary: string;
  followUpStatus: "OPEN" | "SCHEDULED" | "RESOLVED" | "MONITORING";
  recommendedFollowUpAt: string;
};

export type DemoLearningParentTeacherAlertReasonSummaryRow = {
  alertReason:
    | "MISSING_SUBMISSIONS"
    | "LOW_PRACTICE_SCORE"
    | "SKIPPED_VIDEO"
    | "ATTENDANCE_SESSION_GAP"
    | "STALLED_DAILY_PLAN";
  reasonLabel: string;
  alertCount: number;
};

export type DemoLearningParentScreenTimeChildControlsRow = {
  guardianId: string;
  guardianName: string;
  guardianEmail: string;
  relationship: "MOTHER" | "FATHER" | "GUARDIAN";
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCodes: string[];
  activePolicyId: string | null;
  policyStatus: "ACTIVE" | "PAUSED" | "DISABLED";
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
  studentName: string;
  childProfileId: string;
  guardianName: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  lessonCode: string;
  dailyPlanTitle: string;
  requestedAt: string;
  requestedMinutes: number;
  usedMinutesBeforeSession: number;
  sessionUsedMinutes: number;
  decision: "ALLOWED" | "BLOCKED" | "OVERRIDE_ALLOWED";
  blockedReason:
    | "DAILY_LIMIT_EXCEEDED"
    | "GUARDIAN_DENIED_GRANT"
    | "POLICY_DISABLED_WITHDRAWN"
    | "NONE";
  decidedBy:
    | "fixture_screen_time_policy"
    | "fixture_parent_grant"
    | "fixture_withdrawal_guard";
  safeDailyPlanAccess: boolean;
};

export type DemoLearningParentScreenTimeGrantRow = {
  grantRequestId: string;
  sessionGateId: string;
  guardianName: string;
  studentName: string;
  childProfileId: string;
  requestedExtraMinutes: number;
  requestedAt: string;
  decision: "APPROVED" | "DENIED" | "PENDING";
  decidedAt: string | null;
  grantedMinutes: number;
  decisionReason: string;
};

export type DemoLearningSessionCompletionPracticeProgressRollupReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningParentScreenTimeGrantDailyPlanGuardReport["safety"] & {
    realLearningSessionCompletionMutationUsed: false;
    realParentProgressSummaryMutationUsed: false;
    realTeacherProgressSummaryMutationUsed: false;
  };
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
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
  progressRollupRows: {
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
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    lessonId: string;
    lessonCode: string;
    lessonTitle: string;
    videoEvidenceId: string;
    videoEvidenceStatus: "COMPLETED" | "INCOMPLETE" | "SKIPPED";
    videoCompletionPercent: number;
    lessonCompletionEvidenceId: string;
    lessonCompletionStatus: "COMPLETED" | "INCOMPLETE" | "SKIPPED";
    practiceAttemptId: string;
    practiceAttemptStatus: "PASSED" | "NEEDS_RETRY" | "INCOMPLETE" | "SKIPPED";
    practiceAttemptNumber: number;
    practiceScorePercent: number;
    progressRecordId: string;
    completionPercent: number;
    progressStatus:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "NEEDS_SUPPORT"
      | "COMPLETED"
      | "WITHDRAWN";
    rollupStatus: "COMPLETED" | "ON_TRACK" | "NEEDS_SUPPORT" | "IN_PROGRESS";
    parentVisibleProgressSummaryId: string;
    teacherVisibleProgressSummaryId: string;
    nextSafeActionLabel: string;
    evidenceSummary: string;
  }[];
  parentSummaryRows: {
    parentVisibleProgressSummaryId: string;
    progressRollupId: string;
    stableTraceKey: string;
    parentGuardianName: string;
    parentGuardianEmail: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    dailyPlanTitle: string;
    completionPercent: number;
    practiceScorePercent: number;
    rollupStatus: "COMPLETED" | "ON_TRACK" | "NEEDS_SUPPORT" | "IN_PROGRESS";
    nextSafeActionLabel: string;
    parentVisible: true;
    summary: string;
  }[];
  teacherSummaryRows: {
    teacherVisibleProgressSummaryId: string;
    progressRollupId: string;
    stableTraceKey: string;
    teacherName: string;
    classCode: string;
    courseCode: string;
    studentName: string;
    childProfileId: string;
    dailyPlanId: string;
    lessonCode: string;
    completionPercent: number;
    practiceScorePercent: number;
    rollupStatus: "COMPLETED" | "ON_TRACK" | "NEEDS_SUPPORT" | "IN_PROGRESS";
    nextSafeActionLabel: string;
    teacherVisible: true;
    summary: string;
  }[];
};

export type DemoLearningTeacherContentLibraryItemRow = {
  contentItemId: string;
  ownerName: string;
  ownerEmail: string;
  ownerRole: "TEACHER" | "ADMIN";
  courseCode: string;
  lessonCode: string;
  assetKind: "VIDEO" | "PRACTICE" | "LESSON";
  title: string;
  publishStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  classAssignmentCount: number;
  learningPathPublishCount: number;
  studentVisibilityCount: number;
  parentVisibleSummaryCount: number;
  needsTeacherReview: boolean;
  blockedReason: string;
};

export type DemoLearningTeacherContentStudentVisibilityRow = {
  visibilityId: string;
  contentTitle: string;
  assetKind: "VIDEO" | "PRACTICE" | "LESSON";
  publishStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibilityStatus: "VISIBLE" | "BLOCKED_UNPUBLISHED" | "BLOCKED_ARCHIVED";
  dailyPlanTitle: string;
  dailyPlanStatus:
    "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
  planDate: string;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  lessonCode: string;
  studentVisible: boolean;
  parentVisible: boolean;
  availableOnDailyPlan: boolean;
  blockedReason: string;
};

export type DemoLearningTeacherContentParentSummaryRow = {
  parentGuardianName: string;
  studentName: string;
  childProfileId: string;
  courseCodes: string[];
  classCodes: string[];
  parentVisibleItemCount: number;
  blockedItemCount: number;
  itemsNeedingTeacherReviewCount: number;
  nextAvailableDailyPlanDate: string | null;
  summary: string;
};

export type DemoLearningAiTutorChatSessionRow = {
  chatSessionId: string;
  studentName: string;
  childProfileId: string;
  courseCode: string;
  classCode: string;
  dailyPlanTitle: string;
  lessonCode: string;
  sessionStatus: "ACTIVE" | "ESCALATED" | "CLOSED";
  messageCount: number;
  allowedMessageCount: number;
  blockedMessageCount: number;
  safetyFlagCount: number;
  teacherReviewItemCount: number;
  supportRecommendationCount: number;
  parentSummaryReady: boolean;
};

export type DemoLearningAiTutorTeacherReviewQueueRow = {
  teacherReviewItemId: string;
  studentName: string;
  childProfileId: string;
  classCode: string;
  lessonCode: string;
  dailyPlanTitle: string;
  assignedTeacherName: string;
  topicCategory:
    | "LESSON_HELP"
    | "PRACTICE_HINT"
    | "STUDY_PLANNING"
    | "PERSONAL_DATA"
    | "OFF_TOPIC_GAMING"
    | "ACCOUNT_ACCESS"
    | "SAFETY_REDIRECT"
    | "ACADEMIC_INTEGRITY";
  severity: "LOW" | "MEDIUM" | "HIGH";
  reviewStatus: "OPEN" | "REVIEWED" | "RESOLVED";
  actionSummary: string;
  parentSummaryReady: boolean;
  supportRecommendationCount: number;
};

export type DemoLearningAiTutorSupportRecommendationRow = {
  supportRecommendationId: string;
  studentName: string;
  childProfileId: string;
  courseCode: string;
  classCode: string;
  dailyPlanTitle: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "RECOMMENDED" | "MONITORING" | "COMPLETED";
  recommendation: string;
};

export type DemoLearningStudentAchievementSummaryRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  progressStatus:
    "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_SUPPORT" | "COMPLETED" | "WITHDRAWN";
  completionPercent: number;
  achievementRecordCount: number;
  badgeAwardCount: number;
  completedMilestoneCount: number;
  pendingMilestoneCount: number;
  certificateStatus: "READY" | "PENDING" | "HELD_FOR_REVIEW" | "NONE";
  parentVisibleRecognitionCount: number;
  teacherReviewItemCount: number;
  nearCertificate: boolean;
  needsEncouragement: boolean;
};

export type DemoLearningCertificateFixtureRow = {
  certificateFixtureId: string;
  studentName: string;
  childProfileId: string;
  courseCode: string;
  classCode: string;
  certificateTitle: string;
  status: "READY" | "PENDING" | "HELD_FOR_REVIEW";
  completedBadgeAwardCount: number;
  pendingMilestoneCount: number;
  certificatePreviewRef: string;
};

export type DemoLearningRecognitionSummaryRow = {
  recognitionSummaryId: string;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  audience: "PARENT" | "TEACHER";
  status: "PARENT_VISIBLE" | "TEACHER_REVIEW" | "ENCOURAGEMENT_NEEDED";
  parentVisible: boolean;
  teacherReviewRequired: boolean;
  encouragementNeeded: boolean;
  sourceAiTutorSupportRecommendationId: string | null;
  summary: string;
};
