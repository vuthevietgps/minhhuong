import { LearningLocalDemoController } from './learning-local-demo.controller';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService (controller)', () => {
  const service = new LearningLocalDemoService();

  it('exposes the report through the controller', () => {
    const controller = new LearningLocalDemoController(service);
    const report = controller.getStudentCourseEnrollmentSubscriptionReport();

    expect(report.reportName).toBe(
      'Learning local demo Student -> Course -> Enrollment -> Subscription/Payment -> Refund/Commission Report',
    );
    expect(report.rows).toHaveLength(4);
    expect(report.rows).toContainEqual(
      expect.objectContaining({
        enrollmentId: 'enroll-linh-phonics-active',
        commissionPayableCents: 25200000,
        commissionApprovedCents: 28800000,
      }),
    );

    const flowReport =
      controller.getStudentCourseEnrollmentSubscriptionFlowReport();
    expect(flowReport.reportName).toBe(
      'Learning local demo Student -> Course -> Enrollment -> Subscription/Payment fixture -> Refund/Commission fixture Flow Report',
    );
    expect(flowReport.productionReady).toBe(false);
    expect(flowReport.fixtureOnly).toBe(true);
    expect(flowReport.totals).toEqual(
      expect.objectContaining({
        studentCount: 4,
        courseCount: 2,
        enrollmentCount: 4,
        subscriptionCount: 4,
        fixturePaymentEvidenceCount: 4,
        refundEvidenceCount: 1,
        commissionEvidenceCount: 4,
        openSafetyGateCount: 0,
      }),
    );

    const accessReport =
      controller.getSubscriptionEntitlementDailyPlanAccessReport();
    expect(accessReport.reportName).toBe(
      'Learning local demo Subscription Entitlement -> Daily Plan Access Gate Report',
    );
    expect(accessReport.productionReady).toBe(false);
    expect(accessReport.fixtureOnly).toBe(true);
    expect(accessReport.totals).toEqual(
      expect.objectContaining({
        studentCount: 4,
        courseCount: 2,
        enrollmentCount: 4,
        subscriptionCount: 4,
        entitlementCount: 4,
        dailyPlanAccessCaseCount: 4,
        unlockedAccessCount: 2,
        blockedAccessCount: 2,
        blockedExpiredCount: 1,
        blockedRevokedCount: 1,
        lifecycleRowCount: 5,
        openSafetyGateCount: 0,
      }),
    );

    const parentTeacherProgressAccessSummaryReport =
      controller.getParentTeacherProgressAccessSummaryReport();
    expect(parentTeacherProgressAccessSummaryReport.reportName).toBe(
      'Learning local demo Parent/Teacher Progress Access Summary Report',
    );
    expect(parentTeacherProgressAccessSummaryReport.progressRows).toHaveLength(
      4,
    );
    expect(
      parentTeacherProgressAccessSummaryReport.parentSummaryRows,
    ).toHaveLength(4);
    expect(
      parentTeacherProgressAccessSummaryReport.teacherSummaryRows,
    ).toHaveLength(4);
    expect(parentTeacherProgressAccessSummaryReport.totals).toEqual(
      expect.objectContaining({
        parentGuardianCount: 4,
        teacherCount: 3,
        progressSummaryCount: 4,
        parentSummaryCount: 4,
        teacherSummaryCount: 4,
        blockedReasonCount: 2,
        blockedAccessInSummariesWithReasonCount: 2,
        openSafetyGateCount: 0,
      }),
    );

    const parentTeacherReportPermissionPrivacyRedactionReport =
      controller.getParentTeacherReportPermissionPrivacyRedactionReport();
    expect(parentTeacherReportPermissionPrivacyRedactionReport.reportName).toBe(
      'Learning local demo Parent/Teacher Report Permission Privacy Redaction Report',
    );
    expect(
      parentTeacherReportPermissionPrivacyRedactionReport.permissionCaseRows,
    ).toHaveLength(6);
    expect(
      parentTeacherReportPermissionPrivacyRedactionReport.fieldVisibilityRows,
    ).toHaveLength(24);
    expect(parentTeacherReportPermissionPrivacyRedactionReport.totals).toEqual(
      expect.objectContaining({
        reportPermissionCaseCount: 6,
        allowedReportCaseCount: 4,
        deniedReportCaseCount: 2,
        teacherUnassignedDeniedCaseCount: 1,
        supportOpsAuditReadOnlyCaseCount: 1,
        redactedFieldCount: 2,
        parentVisibleFieldCount: 4,
        teacherVisibleFieldCount: 8,
        supportOpsVisibleFieldCount: 3,
        permissionTraceCount: 6,
        openSafetyGateCount: 0,
      }),
    );

    const parentTeacherReportReviewQueueMessagePreviewReport =
      controller.getParentTeacherReportReviewQueueMessagePreviewReport();
    expect(parentTeacherReportReviewQueueMessagePreviewReport.reportName).toBe(
      'Learning local demo Parent/Teacher Report Review Queue Message Preview Report',
    );
    expect(
      parentTeacherReportReviewQueueMessagePreviewReport.reviewQueueRows,
    ).toHaveLength(2);
    expect(
      parentTeacherReportReviewQueueMessagePreviewReport.messagePreviewRows,
    ).toHaveLength(2);
    expect(parentTeacherReportReviewQueueMessagePreviewReport.totals).toEqual(
      expect.objectContaining({
        reportSummaryCount: 1,
        permissionRedactionReferenceCount: 2,
        reviewQueueItemCount: 2,
        approvedPreviewCount: 1,
        heldPreviewCount: 1,
        reviewDecisionTraceCount: 2,
        approvedWithPermissionRedactionEvidenceCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const parentPortalApprovedReportInboxReadReceiptReport =
      controller.getParentPortalApprovedReportInboxReadReceiptReport();
    expect(parentPortalApprovedReportInboxReadReceiptReport.reportName).toBe(
      'Learning local demo Parent Portal Approved Report Inbox Read Receipt Report',
    );
    expect(
      parentPortalApprovedReportInboxReadReceiptReport.parentInboxRows,
    ).toHaveLength(3);
    expect(
      parentPortalApprovedReportInboxReadReceiptReport.readAckRows,
    ).toHaveLength(2);
    expect(parentPortalApprovedReportInboxReadReceiptReport.totals).toEqual(
      expect.objectContaining({
        approvedPreviewCount: 2,
        heldPreviewCount: 1,
        parentInboxItemCount: 3,
        visibleParentInboxItemCount: 2,
        hiddenHeldPreviewCount: 1,
        readAckEvidenceCount: 2,
        permissionRedactionReferenceCount: 3,
        alignedApprovedParentInboxEntryCount: 1,
        alignedParentReadReceiptCount: 1,
        stableAlignedReadReceiptTraceCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const classSessionReport =
      controller.getClassSessionAttendanceProgressReport();
    expect(classSessionReport.reportName).toBe(
      'Learning local demo Class -> Session -> Attendance -> Progress Report',
    );
    expect(classSessionReport.learnerRows).toHaveLength(4);
    expect(classSessionReport.sessionRows).toHaveLength(5);
    expect(classSessionReport.totals).toEqual(
      expect.objectContaining({
        attendanceRecordCount: 8,
        presentAttendanceCount: 4,
        absentAttendanceCount: 1,
        lateAttendanceCount: 2,
        excusedAttendanceCount: 1,
        completedProgressCount: 1,
        needsSupportCount: 1,
      }),
    );

    const lessonAssignmentReport =
      controller.getLessonAssignmentAssessmentProgressReport();
    expect(lessonAssignmentReport.reportName).toBe(
      'Learning local demo Lesson -> Assignment/Quiz -> Submission -> Score/Feedback -> Progress Report',
    );
    expect(lessonAssignmentReport.lessonRows).toHaveLength(5);
    expect(lessonAssignmentReport.assignmentRows).toHaveLength(6);
    expect(lessonAssignmentReport.learnerRows).toHaveLength(4);
    expect(lessonAssignmentReport.totals).toEqual(
      expect.objectContaining({
        expectedSubmissionCount: 14,
        submissionRecordCount: 14,
        missingSubmissionCount: 6,
        lateSubmissionCount: 2,
        resubmittedSubmissionCount: 1,
        averageScorePercent: 86,
        overallAssignmentCompletionPercent: 57,
      }),
    );

    const learningPathReport =
      controller.getLearningPathDailyPlanVideoPracticeEvidenceReport();
    expect(learningPathReport.reportName).toBe(
      'Learning local demo Learning Path -> Daily Plan -> Video Evidence -> Practice Attempt -> Progress Report',
    );
    expect(learningPathReport.learningPathRows).toHaveLength(4);
    expect(learningPathReport.dailyPlanRows).toHaveLength(10);
    expect(learningPathReport.totals).toEqual(
      expect.objectContaining({
        learningPathCount: 4,
        dailyPlanCount: 10,
        videoEvidenceCount: 10,
        completedVideoCount: 6,
        practiceAttemptCount: 10,
        passedPracticeCount: 6,
        blockedSkippedIncompleteDailyPlanCount: 4,
        averagePracticeScorePercent: 82,
        averageLearnerProgressPercent: 63,
      }),
    );

    const parentTeacherAlertReport =
      controller.getParentTeacherProgressAlertInterventionReport();
    expect(parentTeacherAlertReport.reportName).toBe(
      'Learning local demo Parent/Teacher Progress Alert -> Intervention -> Parent Summary Report',
    );
    expect(parentTeacherAlertReport.learnerSummaries).toHaveLength(4);
    expect(parentTeacherAlertReport.alertRows).toHaveLength(7);
    expect(parentTeacherAlertReport.totals).toEqual(
      expect.objectContaining({
        alertCount: 7,
        highRiskAlertCount: 2,
        mediumRiskAlertCount: 5,
        followUpNeededAlertCount: 6,
        resolvedAlertCount: 1,
        teacherInterventionRecommendationCount: 7,
        parentSummaryCount: 7,
      }),
    );

    const parentScreenTimeReport =
      controller.getParentScreenTimeGuardianControlsReport();
    expect(parentScreenTimeReport.reportName).toBe(
      'Learning local demo Parent/Guardian Screen Time -> Session Gate -> Grant -> Controls Report',
    );
    expect(parentScreenTimeReport.childRows).toHaveLength(4);
    expect(parentScreenTimeReport.gateRows).toHaveLength(10);
    expect(parentScreenTimeReport.grantRows).toHaveLength(2);
    expect(parentScreenTimeReport.totals).toEqual(
      expect.objectContaining({
        parentGuardianCount: 4,
        childCount: 4,
        activeScreenTimePolicyCount: 3,
        allowedMinutes: 155,
        usedMinutes: 121,
        remainingMinutes: 34,
        grantRequestCount: 2,
        grantDecisionCount: 2,
        allowedSessionCount: 5,
        blockedSessionCount: 4,
        overrideSessionCount: 1,
        childrenNeedingParentAttentionCount: 2,
      }),
    );

    const parentScreenTimeGrantDailyPlanGuardReport =
      controller.getParentScreenTimeGrantDailyPlanGuardReport();
    expect(parentScreenTimeGrantDailyPlanGuardReport.reportName).toBe(
      'Learning local demo Parent Screen-Time Grant -> Daily Plan Guard Report',
    );
    expect(parentScreenTimeGrantDailyPlanGuardReport.accessRows).toHaveLength(
      10,
    );
    expect(
      parentScreenTimeGrantDailyPlanGuardReport.grantRuleRows,
    ).toHaveLength(2);
    expect(
      parentScreenTimeGrantDailyPlanGuardReport.sessionEvidenceRows,
    ).toHaveLength(10);
    expect(parentScreenTimeGrantDailyPlanGuardReport.totals).toEqual(
      expect.objectContaining({
        dailyPlanAccessCaseCount: 10,
        parentGrantRuleCount: 2,
        screenTimeRuleCount: 4,
        allowedSessionCount: 6,
        blockedSessionCount: 4,
        blockedReasonCount: 4,
        sessionGuardTraceCount: 10,
        learningSessionEvidenceCount: 10,
        openSafetyGateCount: 0,
      }),
    );

    const learningSessionCompletionPracticeProgressRollupReport =
      controller.getLearningSessionCompletionPracticeProgressRollupReport();
    expect(
      learningSessionCompletionPracticeProgressRollupReport.reportName,
    ).toBe(
      'Learning local demo Learning Session Completion -> Practice Progress Rollup Report',
    );
    expect(
      learningSessionCompletionPracticeProgressRollupReport.progressRollupRows,
    ).toHaveLength(6);
    expect(
      learningSessionCompletionPracticeProgressRollupReport.parentSummaryRows,
    ).toHaveLength(6);
    expect(
      learningSessionCompletionPracticeProgressRollupReport.teacherSummaryRows,
    ).toHaveLength(6);
    expect(
      learningSessionCompletionPracticeProgressRollupReport.totals,
    ).toEqual(
      expect.objectContaining({
        dailyPlanSessionReferenceCount: 6,
        lessonCompletionEvidenceCount: 6,
        practiceAttemptEvidenceCount: 6,
        progressRollupCount: 6,
        parentVisibleProgressSummaryCount: 6,
        teacherVisibleProgressSummaryCount: 6,
        stableTraceCount: 6,
        openSafetyGateCount: 0,
      }),
    );

    const teacherInterventionRemedialAssignmentSupportPlanReport =
      controller.getTeacherInterventionRemedialAssignmentSupportPlanReport();
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.reportName,
    ).toBe(
      'Learning local demo Teacher Intervention -> Remedial Assignment Support Plan Report',
    );
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.interventionReviewRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.remedialAssignmentRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.supportPlanRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.parentSummaryRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.teacherNextActionRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.totals,
    ).toEqual(
      expect.objectContaining({
        teacherInterventionReviewCount: 1,
        remedialAssignmentCount: 1,
        supportPlanCount: 1,
        parentVisibleSupportSummaryCount: 1,
        teacherVisibleNextActionCount: 1,
        stableTraceCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const remedialRetryCompletionSupportOutcomeFollowupReport =
      controller.getRemedialRetryCompletionSupportOutcomeFollowupReport();
    expect(remedialRetryCompletionSupportOutcomeFollowupReport.reportName).toBe(
      'Learning local demo Remedial Retry Completion -> Support Outcome Follow-up Summary Report',
    );
    expect(
      remedialRetryCompletionSupportOutcomeFollowupReport.retryCompletionRows,
    ).toHaveLength(1);
    expect(
      remedialRetryCompletionSupportOutcomeFollowupReport.supportOutcomeRows,
    ).toHaveLength(1);
    expect(
      remedialRetryCompletionSupportOutcomeFollowupReport.parentFollowupSummaryRows,
    ).toHaveLength(1);
    expect(
      remedialRetryCompletionSupportOutcomeFollowupReport.teacherFollowupSummaryRows,
    ).toHaveLength(1);
    expect(remedialRetryCompletionSupportOutcomeFollowupReport.totals).toEqual(
      expect.objectContaining({
        remedialRetryCompletionCount: 1,
        supportOutcomeEvidenceCount: 1,
        parentVisibleFollowupSummaryCount: 1,
        teacherVisibleFollowupSummaryCount: 1,
        stableTraceCount: 1,
        retryLinksCompleteCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const remedialRetryUnresolvedSupportEscalationReport =
      controller.getRemedialRetryUnresolvedSupportEscalationReport();
    expect(remedialRetryUnresolvedSupportEscalationReport.reportName).toBe(
      'Learning local demo Remedial Retry Unresolved -> Support Escalation Report',
    );
    expect(
      remedialRetryUnresolvedSupportEscalationReport.retryAttemptRows,
    ).toHaveLength(1);
    expect(
      remedialRetryUnresolvedSupportEscalationReport.unresolvedOutcomeRows,
    ).toHaveLength(1);
    expect(
      remedialRetryUnresolvedSupportEscalationReport.teacherEscalationRows,
    ).toHaveLength(1);
    expect(
      remedialRetryUnresolvedSupportEscalationReport.parentEscalationSummaryRows,
    ).toHaveLength(1);
    expect(
      remedialRetryUnresolvedSupportEscalationReport.teacherEscalationNextActionRows,
    ).toHaveLength(1);
    expect(remedialRetryUnresolvedSupportEscalationReport.totals).toEqual(
      expect.objectContaining({
        remedialRetryAttemptCount: 1,
        failedOrIncompleteRetryCount: 1,
        unresolvedSupportOutcomeCount: 1,
        teacherEscalationCount: 1,
        parentVisibleEscalationSummaryCount: 1,
        teacherVisibleEscalationNextActionCount: 1,
        stableTraceCount: 1,
        unresolvedRetryLinksCompleteCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const teacherEscalationFollowupResolutionReport =
      controller.getTeacherEscalationFollowupResolutionReport();
    expect(teacherEscalationFollowupResolutionReport.reportName).toBe(
      'Learning local demo Teacher Escalation Follow-up Resolution Report',
    );
    expect(
      teacherEscalationFollowupResolutionReport.resolutionRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.teacherReviewedEscalationRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.adjustedSupportRetryCompletionRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.resolvedSupportOutcomeRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.parentClosureSummaryRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.teacherClosureNoteRows,
    ).toHaveLength(1);
    expect(teacherEscalationFollowupResolutionReport.totals).toEqual(
      expect.objectContaining({
        unresolvedEscalationReferenceCount: 1,
        teacherReviewedEscalationCount: 1,
        adjustedSupportRetryCompletionCount: 1,
        resolvedSupportOutcomeCount: 1,
        parentVisibleClosureSummaryCount: 1,
        teacherVisibleClosureNoteCount: 1,
        stableTraceCount: 1,
        resolvedFlowLinksCompleteCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const mvpEndToEndReadinessTraceReport =
      controller.getMvpEndToEndReadinessTraceReport();
    expect(mvpEndToEndReadinessTraceReport.reportName).toBe(
      'Learning local demo MVP End-to-End Readiness Trace Report',
    );
    expect(mvpEndToEndReadinessTraceReport.traceRows).toHaveLength(1);
    expect(mvpEndToEndReadinessTraceReport.evidenceRows).toHaveLength(13);
    expect(mvpEndToEndReadinessTraceReport.totals).toEqual(
      expect.objectContaining({
        stableEndToEndTraceCount: 1,
        sameStudentCoursePathCount: 1,
        alignedApprovedDeliveryStudentCoursePathCount: 1,
        deterministicStatusReasonActionOwnerCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const mvpRoleJourneyEntrypointsReport =
      controller.getMvpRoleJourneyEntrypointsReport();
    expect(mvpRoleJourneyEntrypointsReport.reportName).toBe(
      'Learning local demo MVP Role Journey Entrypoints Report',
    );
    expect(mvpRoleJourneyEntrypointsReport.entrypointRows).toHaveLength(4);
    expect(mvpRoleJourneyEntrypointsReport.stableTraceRows).toHaveLength(1);
    expect(mvpRoleJourneyEntrypointsReport.totals).toEqual(
      expect.objectContaining({
        studentRoleEntrypointCount: 1,
        parentRoleEntrypointCount: 1,
        teacherRoleEntrypointCount: 1,
        adminRoleEntrypointCount: 1,
        stableRoleJourneyTraceCount: 1,
        sameStudentCoursePathCount: 4,
        linkedMvpReadinessTraceCount: 4,
        linkedParentReadReceiptCount: 4,
        linkedTeacherEscalationResolutionCount: 4,
        openSafetyGateCount: 0,
      }),
    );

    const teacherContentPublishReport =
      controller.getTeacherContentLibraryLearningPathPublishReport();
    expect(teacherContentPublishReport.reportName).toBe(
      'Learning local demo Teacher Content Library -> Learning Path Publish -> Parent Summary Report',
    );
    expect(teacherContentPublishReport.contentRows).toHaveLength(6);
    expect(teacherContentPublishReport.classAssignmentRows).toHaveLength(6);
    expect(teacherContentPublishReport.studentVisibilityRows).toHaveLength(8);
    expect(teacherContentPublishReport.parentSummaryRows).toHaveLength(3);
    expect(teacherContentPublishReport.totals).toEqual(
      expect.objectContaining({
        teacherAdminCount: 3,
        contentItemCount: 6,
        videoAssetCount: 2,
        practiceAssetCount: 2,
        lessonAssetCount: 2,
        learningPathPublishCount: 6,
        classAssignmentCount: 6,
        studentVisibilityCount: 6,
        parentVisibleSummaryCount: 3,
        blockedUnpublishedItemCount: 2,
        itemsNeedingTeacherReviewCount: 2,
      }),
    );

    const aiTutorChatSafetyTeacherReviewReport =
      controller.getAiTutorChatSafetyTeacherReviewReport();
    expect(aiTutorChatSafetyTeacherReviewReport.reportName).toBe(
      'Learning local demo AI Tutor Chat -> Safety Guard -> Teacher Review -> Parent Summary -> Learning Support Report',
    );
    expect(aiTutorChatSafetyTeacherReviewReport.chatSessionRows).toHaveLength(
      4,
    );
    expect(aiTutorChatSafetyTeacherReviewReport.messageRows).toHaveLength(12);
    expect(aiTutorChatSafetyTeacherReviewReport.safetyFlagRows).toHaveLength(4);
    expect(aiTutorChatSafetyTeacherReviewReport.teacherReviewRows).toHaveLength(
      4,
    );
    expect(aiTutorChatSafetyTeacherReviewReport.parentSummaryRows).toHaveLength(
      3,
    );
    expect(
      aiTutorChatSafetyTeacherReviewReport.supportRecommendationRows,
    ).toHaveLength(4);
    expect(aiTutorChatSafetyTeacherReviewReport.totals).toEqual(
      expect.objectContaining({
        chatSessionCount: 4,
        messageCount: 12,
        allowedMessageCount: 8,
        blockedMessageCount: 4,
        safetyFlagCount: 4,
        teacherReviewItemCount: 4,
        reviewedTeacherReviewItemCount: 2,
        parentSummaryCount: 3,
        studentsNeedingSupportCount: 3,
        topicCategoryCount: 8,
        supportRecommendationCount: 4,
      }),
    );

    const studentAchievementBadgeCertificateReport =
      controller.getStudentAchievementBadgeCertificateReport();
    expect(studentAchievementBadgeCertificateReport.reportName).toBe(
      'Learning local demo Student Achievement -> Badge -> Certificate -> Recognition Report',
    );
    expect(studentAchievementBadgeCertificateReport.studentRows).toHaveLength(
      4,
    );
    expect(
      studentAchievementBadgeCertificateReport.achievementRows,
    ).toHaveLength(6);
    expect(studentAchievementBadgeCertificateReport.badgeRows).toHaveLength(4);
    expect(
      studentAchievementBadgeCertificateReport.certificateRows,
    ).toHaveLength(3);
    expect(studentAchievementBadgeCertificateReport.milestoneRows).toHaveLength(
      7,
    );
    expect(
      studentAchievementBadgeCertificateReport.recognitionRows,
    ).toHaveLength(5);
    expect(studentAchievementBadgeCertificateReport.totals).toEqual(
      expect.objectContaining({
        achievementRecords: 6,
        badgeAwards: 4,
        certificateFixtures: 3,
        milestonesCompleted: 5,
        milestonesPending: 2,
        recognitionSummaries: 5,
        parentVisibleRecognitions: 3,
        teacherReviewItems: 3,
        studentsWithBadges: 2,
        studentsNearCertificate: 1,
        studentsNeedingEncouragement: 2,
      }),
    );

    const parentTeacherWeeklyDigestReport =
      controller.getParentTeacherWeeklyDigestReport();
    expect(parentTeacherWeeklyDigestReport.reportName).toBe(
      'Learning local demo Parent/Teacher Weekly Digest Report',
    );
    expect(parentTeacherWeeklyDigestReport.digestRows).toHaveLength(5);
    expect(parentTeacherWeeklyDigestReport.actionRows).toHaveLength(6);
    expect(parentTeacherWeeklyDigestReport.studentRows).toHaveLength(4);
    expect(parentTeacherWeeklyDigestReport.totals).toEqual(
      expect.objectContaining({
        digestCount: 5,
        parentDigestCount: 3,
        teacherDigestCount: 2,
        readyToSendDigestCount: 2,
        teacherReviewDigestCount: 2,
        heldWithdrawnDigestCount: 1,
        actionCount: 6,
        highPriorityActionCount: 2,
        studentsCovered: 4,
        studentsNeedingTeacherReview: 3,
        studentsReadyForParentSend: 2,
      }),
    );

    const followUpActionOutcomeReport =
      controller.getFollowUpActionOutcomeReport();
    expect(followUpActionOutcomeReport.reportName).toBe(
      'Learning local demo Follow-up Action Outcome Report',
    );
    expect(followUpActionOutcomeReport.outcomeRows).toHaveLength(6);
    expect(followUpActionOutcomeReport.studentRows).toHaveLength(4);
    expect(followUpActionOutcomeReport.totals).toEqual(
      expect.objectContaining({
        outcomeCount: 6,
        completedOutcomeCount: 1,
        verifiedOutcomeCount: 1,
        monitoringOutcomeCount: 2,
        heldOutcomeCount: 1,
        linkedDailyPlanCount: 6,
        linkedSupportRecommendationCount: 5,
        studentsCovered: 4,
      }),
    );

    const mvpReadinessOverviewReport =
      controller.getMvpReadinessOverviewReport();
    expect(mvpReadinessOverviewReport.reportName).toBe(
      'Learning local demo MVP Readiness Overview Report',
    );
    expect(mvpReadinessOverviewReport.rows).toHaveLength(20);
    expect(mvpReadinessOverviewReport.totals).toEqual(
      expect.objectContaining({
        sliceCount: 20,
        localDemoReadySliceCount: 19,
        localDemoReadyWithNotesSliceCount: 1,
        evidenceEndpointCount: 18,
        teacherInterventionReviewCount: 1,
        remedialAssignmentCount: 1,
        supportPlanCount: 1,
        remedialRetryCompletionCount: 1,
        supportOutcomeEvidenceCount: 1,
        remedialRetryUnresolvedAttemptCount: 1,
        unresolvedSupportOutcomeCount: 1,
        teacherEscalationCount: 1,
        teacherReviewedEscalationCount: 1,
        adjustedSupportRetryCompletionCount: 1,
        resolvedSupportOutcomeCount: 1,
        stableEndToEndTraceCount: 1,
        readinessScorePercent: 100,
        followUpOutcomeCount: 6,
        openSafetyGateCount: 0,
      }),
    );

    const acceptanceTraceabilityGateReport =
      controller.getAcceptanceTraceabilityGateReport();
    expect(acceptanceTraceabilityGateReport.reportName).toBe(
      'Learning local demo Acceptance Traceability Gate Report',
    );
    expect(acceptanceTraceabilityGateReport.rows).toHaveLength(20);
    expect(acceptanceTraceabilityGateReport.totals).toEqual(
      expect.objectContaining({
        acceptanceCriterionCount: 20,
        mappedCriterionCount: 20,
        slicesWithMappingCount: 20,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
  });
});
