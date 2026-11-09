import type { DemoLearningAiTutorChatSafetyTeacherReviewReport } from "./ai-tutor-chat-safety-teacher-review.types";
import type { DemoLearningCertificateFixtureRow, DemoLearningRecognitionSummaryRow, DemoLearningStudentAchievementSummaryRow } from "./shared.types";

export type DemoLearningStudentAchievementBadgeCertificateReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningAiTutorChatSafetyTeacherReviewReport["safety"] & {
    certificateIssuerProviderUsed: false;
    realAchievementMutationUsed: false;
    realBadgeMutationUsed: false;
    realCertificateMutationUsed: false;
    realCredentialIssuanceUsed: false;
    realRecognitionNotificationMutationUsed: false;
  };
  totals: {
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
  studentRows: DemoLearningStudentAchievementSummaryRow[];
  certificateRows: DemoLearningCertificateFixtureRow[];
  recognitionRows: DemoLearningRecognitionSummaryRow[];
};
