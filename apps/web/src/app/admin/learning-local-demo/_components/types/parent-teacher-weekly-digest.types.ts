import type { DemoLearningStudentAchievementBadgeCertificateReport } from "./student-achievement-badge-certificate.types";

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

export type DemoLearningParentTeacherWeeklyDigestRow = {
  digestId: string;
  weekStart: string;
  weekEnd: string;
  audience: "PARENT" | "TEACHER";
  deliveryStatus: "READY_TO_SEND" | "TEACHER_REVIEW" | "HELD_WITHDRAWN";
  parentVisible: boolean;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  progressStatus:
    "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_SUPPORT" | "COMPLETED" | "WITHDRAWN";
  completionPercent: number;
  attendanceRatePercent: number;
  assignmentCompletionPercent: number;
  averagePracticeScorePercent: number;
  alertCount: number;
  highRiskAlertCount: number;
  actionCount: number;
  highPriorityActionCount: number;
  certificateStatus: "READY" | "PENDING" | "HELD_FOR_REVIEW" | "NONE";
  highlight: string;
  riskSummary: string;
};

export type DemoLearningParentTeacherWeeklyDigestActionRow = {
  actionId: string;
  digestId: string;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  owner: "PARENT" | "TEACHER";
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "RECOMMENDED" | "SCHEDULED" | "COMPLETED" | "HELD";
  dueAt: string;
  sourceAlertId: string | null;
  actionSummary: string;
};

export type DemoLearningParentTeacherWeeklyDigestReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningStudentAchievementBadgeCertificateReport["safety"] & {
    realWeeklyDigestNotificationMutationUsed: false;
  };
  totals: {
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
  studentRows: DemoLearningParentTeacherWeeklyDigestStudentRow[];
  digestRows: DemoLearningParentTeacherWeeklyDigestRow[];
  actionRows: DemoLearningParentTeacherWeeklyDigestActionRow[];
};
