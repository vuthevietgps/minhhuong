import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningContentClassAssignment,
  DemoLearningContentLibraryItem,
  DemoLearningCoreFixture,
  DemoLearningTeacherContentClassAssignmentRow,
  DemoLearningTeacherContentLibraryItemRow,
  DemoLearningTeacherContentLibraryLearningPathPublishReport,
  DemoLearningTeacherContentLibraryStatusCounts,
  DemoLearningTeacherContentParentSummaryRow,
  DemoLearningTeacherContentStudentVisibilityRow,
} from '../learning-local-demo.types';
import {
  countByStatus,
  groupBy,
  requireClass,
  requireContentOwner,
  requireCourseById,
  requireDailyPlan,
  requireGuardian,
  requireLearningPath,
  requireLesson,
  requireStudentById,
} from './shared';

export const contentOwnerRoles = ['TEACHER', 'ADMIN'] as const;

export const contentAssetKinds = ['VIDEO', 'PRACTICE', 'LESSON'] as const;

export const contentPublishStatuses = [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
] as const;

export const contentClassAssignmentStatuses = [
  'PUBLISHED',
  'BLOCKED_UNPUBLISHED',
] as const;

export const contentStudentVisibilityStatuses = [
  'VISIBLE',
  'BLOCKED_UNPUBLISHED',
  'BLOCKED_ARCHIVED',
] as const;

export function buildTeacherContentLibraryLearningPathPublishReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningTeacherContentLibraryLearningPathPublishReport {
  const ownersById = new Map(
    fixture.contentOwners.map((owner) => [owner.id, owner]),
  );
  const contentItemsById = new Map(
    fixture.contentLibraryItems.map((item) => [item.id, item]),
  );
  const classAssignmentsById = new Map(
    fixture.contentClassAssignments.map((assignment) => [
      assignment.id,
      assignment,
    ]),
  );
  const coursesById = new Map(
    fixture.courses.map((course) => [course.id, course]),
  );
  const lessonsById = new Map(
    fixture.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const classesById = new Map(
    fixture.classes.map((classCohort) => [classCohort.id, classCohort]),
  );
  const studentsById = new Map(
    fixture.students.map((student) => [student.id, student]),
  );
  const pathsById = new Map(
    fixture.learningPaths.map((path) => [path.id, path]),
  );
  const dailyPlansById = new Map(
    fixture.dailyPlans.map((plan) => [plan.id, plan]),
  );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );

  const studentVisibilityRows = fixture.contentStudentVisibilities
    .map((visibility) => {
      const contentItem = requireContentItem(
        contentItemsById,
        visibility.contentItemId,
      );
      const classAssignment = requireContentClassAssignment(
        classAssignmentsById,
        visibility.classAssignmentId,
      );
      const learningPath = requireLearningPath(
        pathsById,
        visibility.learningPathId,
      );
      const dailyPlan = requireDailyPlan(
        dailyPlansById,
        visibility.dailyPlanId,
      );
      const student = requireStudentById(studentsById, visibility.studentId);
      const guardian = requireGuardian(
        guardiansById,
        visibility.parentGuardianId,
      );
      const course = requireCourseById(coursesById, learningPath.courseId);
      const classCohort = requireClass(classesById, learningPath.classId);
      const lesson = requireLesson(lessonsById, contentItem.lessonId);

      return {
        visibilityId: visibility.id,
        classAssignmentId: classAssignment.id,
        contentItemId: contentItem.id,
        contentTitle: contentItem.title,
        assetKind: contentItem.assetKind,
        publishStatus: contentItem.publishStatus,
        visibilityStatus: visibility.visibilityStatus,
        learningPathId: learningPath.id,
        dailyPlanId: dailyPlan.id,
        dailyPlanTitle: dailyPlan.title,
        dailyPlanStatus: dailyPlan.status,
        planDate: dailyPlan.planDate,
        studentId: student.id,
        childProfileId: student.childProfileId,
        studentName: student.displayName,
        parentGuardianId: guardian.id,
        parentGuardianName: guardian.displayName,
        courseCode: course.code,
        classCode: classCohort.code,
        lessonCode: lesson.code,
        studentVisible: visibility.studentVisible,
        parentVisible: visibility.parentVisible,
        availableOnDailyPlan: visibility.availableOnDailyPlan,
        publishedAt: visibility.publishedAt ?? null,
        blockedReason: visibility.blockedReason ?? 'NONE',
      } satisfies DemoLearningTeacherContentStudentVisibilityRow;
    })
    .sort((left, right) =>
      [
        left.classCode,
        left.studentName,
        left.planDate,
        left.contentTitle,
        left.visibilityId,
      ]
        .join('|')
        .localeCompare(
          [
            right.classCode,
            right.studentName,
            right.planDate,
            right.contentTitle,
            right.visibilityId,
          ].join('|'),
        ),
    );
  const visibilityRowsByContentItemId = groupBy(
    studentVisibilityRows,
    (row) => row.contentItemId,
  );
  const visibilityRowsByClassAssignmentId = groupBy(
    studentVisibilityRows,
    (row) => row.classAssignmentId,
  );

  const classAssignmentRows = fixture.contentClassAssignments
    .map((assignment) => {
      const contentItem = requireContentItem(
        contentItemsById,
        assignment.contentItemId,
      );
      const owner = requireContentOwner(
        ownersById,
        assignment.assignedByOwnerId,
      );
      const classCohort = requireClass(classesById, assignment.classId);
      const course = requireCourseById(coursesById, contentItem.courseId);
      const visibilityRows =
        visibilityRowsByClassAssignmentId.get(assignment.id) ?? [];

      return {
        classAssignmentId: assignment.id,
        contentItemId: contentItem.id,
        contentTitle: contentItem.title,
        assetKind: contentItem.assetKind,
        publishStatus: contentItem.publishStatus,
        assignmentStatus: assignment.assignmentStatus,
        classId: classCohort.id,
        classCode: classCohort.code,
        classTitle: classCohort.title,
        teacherName: classCohort.teacherName,
        courseCode: course.code,
        ownerName: owner.displayName,
        assignedAt: assignment.assignedAt,
        studentVisibilityCount: visibilityRows.filter(
          (row) => row.studentVisible,
        ).length,
        visibleStudentCount: visibilityRows.filter((row) => row.studentVisible)
          .length,
        blockedStudentVisibilityCount: visibilityRows.filter(
          (row) => !row.studentVisible,
        ).length,
        blockedReason: assignment.blockedReason ?? 'NONE',
      } satisfies DemoLearningTeacherContentClassAssignmentRow;
    })
    .sort((left, right) =>
      [left.classCode, left.contentTitle, left.classAssignmentId]
        .join('|')
        .localeCompare(
          [right.classCode, right.contentTitle, right.classAssignmentId].join(
            '|',
          ),
        ),
    );

  const contentRows = fixture.contentLibraryItems
    .map((contentItem) => {
      const owner = requireContentOwner(ownersById, contentItem.ownerId);
      const course = requireCourseById(coursesById, contentItem.courseId);
      const lesson = requireLesson(lessonsById, contentItem.lessonId);
      const classAssignmentCount = fixture.contentClassAssignments.filter(
        (assignment) => assignment.contentItemId === contentItem.id,
      ).length;
      const visibilityRows =
        visibilityRowsByContentItemId.get(contentItem.id) ?? [];
      const visibleRows = visibilityRows.filter((row) => row.studentVisible);
      const parentVisibleGuardianCount = new Set(
        visibilityRows
          .filter((row) => row.parentVisible)
          .map((row) => row.parentGuardianId),
      ).size;

      return {
        contentItemId: contentItem.id,
        ownerId: owner.id,
        ownerName: owner.displayName,
        ownerEmail: owner.email,
        ownerRole: owner.role,
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        lessonId: lesson.id,
        lessonCode: lesson.code,
        lessonTitle: lesson.title,
        assetKind: contentItem.assetKind,
        assetRef: contentItem.assetRef,
        title: contentItem.title,
        publishStatus: contentItem.publishStatus,
        classAssignmentCount,
        learningPathPublishCount: visibleRows.filter(
          (row) => row.availableOnDailyPlan,
        ).length,
        studentVisibilityCount: visibleRows.length,
        parentVisibleSummaryCount: parentVisibleGuardianCount,
        needsTeacherReview: contentItem.needsTeacherReview,
        blockedReason: contentItem.blockedReason ?? 'NONE',
      } satisfies DemoLearningTeacherContentLibraryItemRow;
    })
    .sort((left, right) =>
      [left.courseCode, left.lessonCode, left.assetKind, left.contentItemId]
        .join('|')
        .localeCompare(
          [
            right.courseCode,
            right.lessonCode,
            right.assetKind,
            right.contentItemId,
          ].join('|'),
        ),
    );
  const parentSummaryRows = buildTeacherContentParentSummaryRows(
    studentVisibilityRows,
    contentItemsById,
  );
  const statusCounts =
    buildTeacherContentLibraryLearningPathPublishStatusCounts(fixture);
  const learningPathPublishCount = studentVisibilityRows.filter(
    (row) => row.studentVisible && row.availableOnDailyPlan,
  ).length;
  const studentVisibilityCount = studentVisibilityRows.filter(
    (row) => row.studentVisible,
  ).length;
  const blockedUnpublishedItemCount = fixture.contentLibraryItems.filter(
    (item) => item.publishStatus !== 'PUBLISHED',
  ).length;

  return {
    reportName:
      'Learning local demo Teacher Content Library -> Learning Path Publish -> Parent Summary Report',
    generatedFor:
      'local-demo-teacher-content-library-learning-path-publish-report',
    generatedAt,
    currency: fixture.currency,
    safety: {
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      paymentProviderUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realClassMutationUsed: false,
      realSessionMutationUsed: false,
      realAttendanceMutationUsed: false,
      realProgressMutationUsed: false,
      realLessonMutationUsed: false,
      realAssignmentMutationUsed: false,
      realAssessmentMutationUsed: false,
      realLearningPathMutationUsed: false,
      realDailyPlanMutationUsed: false,
      realVideoEvidenceMutationUsed: false,
      realPracticeMutationUsed: false,
      realContentLibraryMutationUsed: false,
      realContentPublishMutationUsed: false,
      realContentUploadMutationUsed: false,
      realStorageCdnMutationUsed: false,
      realTeacherAdminAccountMutationUsed: false,
      realStudentClassVisibilityMutationUsed: false,
      realParentSummaryMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    totals: {
      teacherAdminCount: fixture.contentOwners.length,
      contentItemCount: fixture.contentLibraryItems.length,
      videoAssetCount: statusCounts.assetKind.VIDEO,
      practiceAssetCount: statusCounts.assetKind.PRACTICE,
      lessonAssetCount: statusCounts.assetKind.LESSON,
      draftContentCount: statusCounts.publishStatus.DRAFT,
      publishedContentCount: statusCounts.publishStatus.PUBLISHED,
      archivedContentCount: statusCounts.publishStatus.ARCHIVED,
      learningPathPublishCount,
      classAssignmentCount: fixture.contentClassAssignments.length,
      studentVisibilityCount,
      parentVisibleSummaryCount: parentSummaryRows.length,
      blockedUnpublishedItemCount,
      itemsNeedingTeacherReviewCount: fixture.contentLibraryItems.filter(
        (item) => item.needsTeacherReview,
      ).length,
    },
    statusCounts,
    contentRows,
    classAssignmentRows,
    studentVisibilityRows,
    parentSummaryRows,
  };
}

export function toTeacherContentLibraryLearningPathPublishMarkdown(
  report: DemoLearningTeacherContentLibraryLearningPathPublishReport,
) {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Safety',
    '',
    '- Fixture-only local demo data.',
    '- productionDbUsed=false',
    '- noProductionDbRead=true',
    '- providerApiUsed=false',
    '- aiProviderUsed=false',
    '- paymentProviderUsed=false',
    '- notificationProviderUsed=false',
    '- liveAdsExecuted=false',
    '- realStudentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
    '- realClassMutationUsed=false',
    '- realSessionMutationUsed=false',
    '- realAttendanceMutationUsed=false',
    '- realProgressMutationUsed=false',
    '- realLessonMutationUsed=false',
    '- realAssignmentMutationUsed=false',
    '- realAssessmentMutationUsed=false',
    '- realLearningPathMutationUsed=false',
    '- realDailyPlanMutationUsed=false',
    '- realVideoEvidenceMutationUsed=false',
    '- realPracticeMutationUsed=false',
    '- realContentLibraryMutationUsed=false',
    '- realContentPublishMutationUsed=false',
    '- realContentUploadMutationUsed=false',
    '- realStorageCdnMutationUsed=false',
    '- realTeacherAdminAccountMutationUsed=false',
    '- realStudentClassVisibilityMutationUsed=false',
    '- realParentSummaryMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Teacher/admin owners: ${report.totals.teacherAdminCount}`,
    `- Content items: ${report.totals.contentItemCount}`,
    `- Video assets: ${report.totals.videoAssetCount}`,
    `- Practice assets: ${report.totals.practiceAssetCount}`,
    `- Lesson assets: ${report.totals.lessonAssetCount}`,
    `- Draft content: ${report.totals.draftContentCount}`,
    `- Published content: ${report.totals.publishedContentCount}`,
    `- Archived content: ${report.totals.archivedContentCount}`,
    `- Learning-path publishes: ${report.totals.learningPathPublishCount}`,
    `- Class assignments: ${report.totals.classAssignmentCount}`,
    `- Student visibility rows: ${report.totals.studentVisibilityCount}`,
    `- Parent-visible summaries: ${report.totals.parentVisibleSummaryCount}`,
    `- Blocked/unpublished items: ${report.totals.blockedUnpublishedItemCount}`,
    `- Items needing teacher review: ${report.totals.itemsNeedingTeacherReviewCount}`,
    '',
    '## Content Library Rows',
    '',
    '| Content | Owner | Course | Lesson | Asset | Publish | Class assignments | Path publishes | Student visibility | Parent summaries | Review | Blocked reason |',
    '| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |',
    ...report.contentRows.map(
      (row) =>
        `| ${[
          row.title,
          `${row.ownerName} (${row.ownerRole})`,
          row.courseCode,
          row.lessonCode,
          row.assetKind,
          row.publishStatus,
          String(row.classAssignmentCount),
          String(row.learningPathPublishCount),
          String(row.studentVisibilityCount),
          String(row.parentVisibleSummaryCount),
          row.needsTeacherReview ? 'YES' : 'NO',
          row.blockedReason,
        ].join(' | ')} |`,
    ),
    '',
    '## Class Assignment Rows',
    '',
    '| Content | Class | Teacher | Assignment | Visible students | Blocked students | Assigned at |',
    '| --- | --- | --- | --- | ---: | ---: | --- |',
    ...report.classAssignmentRows.map(
      (row) =>
        `| ${[
          row.contentTitle,
          row.classCode,
          row.teacherName,
          row.assignmentStatus,
          String(row.visibleStudentCount),
          String(row.blockedStudentVisibilityCount),
          row.assignedAt,
        ].join(' | ')} |`,
    ),
    '',
    '## Student Visibility Rows',
    '',
    '| Student | Content | Daily plan | Course | Class | Visibility | Student | Parent | Available | Blocked reason |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.studentVisibilityRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.contentTitle,
          `${row.planDate} ${row.dailyPlanTitle}`,
          row.courseCode,
          row.classCode,
          row.visibilityStatus,
          row.studentVisible ? 'visible' : 'hidden',
          row.parentVisible ? 'visible' : 'hidden',
          row.availableOnDailyPlan ? 'yes' : 'no',
          row.blockedReason,
        ].join(' | ')} |`,
    ),
    '',
    '## Parent Summary Rows',
    '',
    '| Parent | Student | Courses | Classes | Parent visible | Blocked | Teacher review | Next date | Summary |',
    '| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |',
    ...report.parentSummaryRows.map(
      (row) =>
        `| ${[
          row.parentGuardianName,
          `${row.studentName} (${row.childProfileId})`,
          row.courseCodes.join(', '),
          row.classCodes.join(', '),
          String(row.parentVisibleItemCount),
          String(row.blockedItemCount),
          String(row.itemsNeedingTeacherReviewCount),
          row.nextAvailableDailyPlanDate ?? 'n/a',
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildTeacherContentParentSummaryRows(
  studentVisibilityRows: DemoLearningTeacherContentStudentVisibilityRow[],
  contentItemsById: Map<string, DemoLearningContentLibraryItem>,
): DemoLearningTeacherContentParentSummaryRow[] {
  const rowsByParentStudent = groupBy(
    studentVisibilityRows,
    (row) => `${row.parentGuardianId}|${row.studentId}`,
  );
  const parentRows: DemoLearningTeacherContentParentSummaryRow[] = [];

  for (const rows of rowsByParentStudent.values()) {
    const parentVisibleRows = rows.filter((row) => row.parentVisible);
    if (parentVisibleRows.length === 0) {
      continue;
    }

    const first = rows[0];
    const blockedRows = rows.filter((row) => !row.studentVisible);
    const itemsNeedingTeacherReviewCount = new Set(
      blockedRows
        .filter(
          (row) => contentItemsById.get(row.contentItemId)?.needsTeacherReview,
        )
        .map((row) => row.contentItemId),
    ).size;
    const courseCodes = [...new Set(rows.map((row) => row.courseCode))].sort(
      (left, right) => left.localeCompare(right),
    );
    const classCodes = [...new Set(rows.map((row) => row.classCode))].sort(
      (left, right) => left.localeCompare(right),
    );
    const nextAvailableDailyPlanDate =
      parentVisibleRows
        .map((row) => row.planDate)
        .sort((left, right) => left.localeCompare(right))[0] ?? null;

    parentRows.push({
      parentGuardianId: first.parentGuardianId,
      parentGuardianName: first.parentGuardianName,
      studentId: first.studentId,
      childProfileId: first.childProfileId,
      studentName: first.studentName,
      courseCodes,
      classCodes,
      parentVisibleItemCount: parentVisibleRows.length,
      blockedItemCount: blockedRows.length,
      itemsNeedingTeacherReviewCount,
      nextAvailableDailyPlanDate,
      summary:
        blockedRows.length > 0
          ? `${first.studentName} has ${parentVisibleRows.length} parent-visible content items and ${blockedRows.length} blocked draft or archived item for teacher review.`
          : `${first.studentName} has ${parentVisibleRows.length} parent-visible content items ready in the synthetic learning path.`,
    });
  }

  return parentRows.sort((left, right) =>
    [left.studentName, left.parentGuardianName, left.studentId]
      .join('|')
      .localeCompare(
        [right.studentName, right.parentGuardianName, right.studentId].join(
          '|',
        ),
      ),
  );
}

export function buildTeacherContentLibraryLearningPathPublishStatusCounts(
  fixture: DemoLearningCoreFixture,
): DemoLearningTeacherContentLibraryStatusCounts {
  return {
    ownerRole: countByStatus(
      contentOwnerRoles,
      fixture.contentOwners,
      (owner) => owner.role,
    ),
    assetKind: countByStatus(
      contentAssetKinds,
      fixture.contentLibraryItems,
      (item) => item.assetKind,
    ),
    publishStatus: countByStatus(
      contentPublishStatuses,
      fixture.contentLibraryItems,
      (item) => item.publishStatus,
    ),
    classAssignmentStatus: countByStatus(
      contentClassAssignmentStatuses,
      fixture.contentClassAssignments,
      (assignment) => assignment.assignmentStatus,
    ),
    studentVisibilityStatus: countByStatus(
      contentStudentVisibilityStatuses,
      fixture.contentStudentVisibilities,
      (visibility) => visibility.visibilityStatus,
    ),
  };
}

export function requireContentItem(
  contentItemsById: Map<string, DemoLearningContentLibraryItem>,
  contentItemId: string,
) {
  const contentItem = contentItemsById.get(contentItemId);
  if (!contentItem) {
    throw new Error(
      `Missing local demo content library item for ${contentItemId}`,
    );
  }

  return contentItem;
}

export function requireContentClassAssignment(
  classAssignmentsById: Map<string, DemoLearningContentClassAssignment>,
  classAssignmentId: string,
) {
  const assignment = classAssignmentsById.get(classAssignmentId);
  if (!assignment) {
    throw new Error(
      `Missing local demo content class assignment for ${classAssignmentId}`,
    );
  }

  return assignment;
}
