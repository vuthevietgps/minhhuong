import type { DemoLearningClassAggregateRow, DemoLearningCoreReport, DemoLearningLearnerProgressRow, DemoLearningSessionReportRow } from "./shared.types";

export type DemoLearningClassSessionAttendanceProgressReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningCoreReport["safety"];
  totals: {
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
  classAggregates: DemoLearningClassAggregateRow[];
  sessionRows: DemoLearningSessionReportRow[];
  learnerRows: DemoLearningLearnerProgressRow[];
};
