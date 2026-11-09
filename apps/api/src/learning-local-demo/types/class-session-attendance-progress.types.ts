import type {
  DemoLearningAttendanceStatus,
  DemoLearningClassStatus,
  DemoLearningCurrency,
  DemoLearningProgressStatus,
  DemoLearningSessionStatus,
} from './shared-statuses.types';

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
