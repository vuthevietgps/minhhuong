import type { DemoLearningParentTeacherWeeklyDigestReport } from "./parent-teacher-weekly-digest.types";

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
  actionOwner: "PARENT" | "TEACHER";
  actionPriority: "LOW" | "MEDIUM" | "HIGH";
  actionStatus: "RECOMMENDED" | "SCHEDULED" | "COMPLETED" | "HELD";
  outcomeStatus: "COMPLETED" | "VERIFIED" | "SCHEDULED" | "MONITORING" | "HELD";
  impactBand: "POSITIVE" | "STABLE" | "NEEDS_SUPPORT" | "NO_SEND";
  parentVisible: boolean;
  outcomeAt: string | null;
  nextReviewAt: string | null;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  digestDeliveryStatus: "READY_TO_SEND" | "TEACHER_REVIEW" | "HELD_WITHDRAWN";
  dailyPlanTitle: string | null;
  dailyPlanStatus:
    "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED" | "NONE";
  supportRecommendationId: string | null;
  supportStatus: "RECOMMENDED" | "MONITORING" | "COMPLETED" | "NONE";
  achievementKind:
    | "LESSON_MASTERY"
    | "PRACTICE_STREAK"
    | "ASSESSMENT_SCORE"
    | "SAFE_TUTOR_USE"
    | "COURSE_COMPLETION"
    | "NONE";
  parentSummaryReady: boolean;
  teacherReviewStatus: "OPEN" | "REVIEWED" | "RESOLVED" | "NONE";
  evidenceSummary: string;
  outcomeSummary: string;
};

export type DemoLearningFollowUpActionOutcomeReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningParentTeacherWeeklyDigestReport["safety"] & {
    realParentSummaryMutationUsed: false;
    realFollowUpActionOutcomeMutationUsed: false;
  };
  totals: {
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
  studentRows: DemoLearningFollowUpActionOutcomeStudentRow[];
  outcomeRows: DemoLearningFollowUpActionOutcomeRow[];
};
