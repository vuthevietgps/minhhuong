import type {
  DemoLearningContentAssetKind,
  DemoLearningContentClassAssignmentStatus,
  DemoLearningContentOwnerRole,
  DemoLearningContentPublishStatus,
  DemoLearningContentStudentVisibilityStatus,
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
} from './shared-statuses.types';

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
