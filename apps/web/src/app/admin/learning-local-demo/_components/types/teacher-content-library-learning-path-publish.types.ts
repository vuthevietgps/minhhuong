import type { DemoLearningParentScreenTimeGuardianControlsReport } from "./parent-screen-time-guardian-controls.types";
import type { DemoLearningTeacherContentLibraryItemRow, DemoLearningTeacherContentParentSummaryRow, DemoLearningTeacherContentStudentVisibilityRow } from "./shared.types";

export type DemoLearningTeacherContentLibraryLearningPathPublishReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningParentScreenTimeGuardianControlsReport["safety"] & {
    realContentLibraryMutationUsed: false;
    realContentPublishMutationUsed: false;
    realContentUploadMutationUsed: false;
    realStorageCdnMutationUsed: false;
    realTeacherAdminAccountMutationUsed: false;
    realStudentClassVisibilityMutationUsed: false;
    realParentSummaryMutationUsed: false;
  };
  totals: {
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
  contentRows: DemoLearningTeacherContentLibraryItemRow[];
  studentVisibilityRows: DemoLearningTeacherContentStudentVisibilityRow[];
  parentSummaryRows: DemoLearningTeacherContentParentSummaryRow[];
};
