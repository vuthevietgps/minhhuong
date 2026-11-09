import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService (recognition and digest)', () => {
  const service = new LearningLocalDemoService();

  it('builds a fixture-only AI tutor chat safety teacher review report', () => {
    const report = service.buildAiTutorChatSafetyTeacherReviewReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T06:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      aiProviderExecutionUsed: false,
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
      realAiChatMutationUsed: false,
      realAiModerationMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realLearningSupportMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      chatSessionCount: 4,
      messageCount: 12,
      allowedMessageCount: 8,
      blockedMessageCount: 4,
      safetyFlagCount: 4,
      blockedTopicCount: 4,
      teacherReviewItemCount: 4,
      reviewedTeacherReviewItemCount: 2,
      parentSummaryCount: 3,
      studentsNeedingSupportCount: 3,
      topicCategoryCount: 8,
      supportRecommendationCount: 4,
    });
    expect(report.statusCounts).toEqual({
      sessionStatus: {
        ACTIVE: 0,
        ESCALATED: 3,
        CLOSED: 1,
      },
      messageRole: {
        STUDENT: 8,
        AI_TUTOR: 4,
      },
      guardDecision: {
        ALLOWED: 8,
        BLOCKED: 4,
      },
      topicCategory: {
        LESSON_HELP: 2,
        PRACTICE_HINT: 4,
        STUDY_PLANNING: 1,
        PERSONAL_DATA: 1,
        OFF_TOPIC_GAMING: 1,
        ACCOUNT_ACCESS: 1,
        SAFETY_REDIRECT: 1,
        ACADEMIC_INTEGRITY: 1,
      },
      safetySeverity: {
        LOW: 1,
        MEDIUM: 2,
        HIGH: 1,
      },
      teacherReviewStatus: {
        OPEN: 2,
        REVIEWED: 1,
        RESOLVED: 1,
      },
      supportPriority: {
        LOW: 0,
        MEDIUM: 2,
        HIGH: 2,
      },
      supportRecommendationStatus: {
        RECOMMENDED: 1,
        MONITORING: 1,
        COMPLETED: 2,
      },
    });
  });

  it('derives AI tutor safety review and learning support rollups', () => {
    const report = service.buildAiTutorChatSafetyTeacherReviewReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T06:00:00.000Z',
    );

    const minhSession = report.chatSessionRows.find(
      (row) => row.chatSessionId === 'ai-chat-minh-colors-off-topic',
    );
    const linhSession = report.chatSessionRows.find(
      (row) => row.chatSessionId === 'ai-chat-linh-phonics-short-e',
    );
    const accountReview = report.teacherReviewRows.find(
      (row) => row.teacherReviewItemId === 'ai-review-khoa-account-access',
    );
    const avaSummary = report.parentSummaryRows.find(
      (row) => row.parentSummaryId === 'ai-parent-summary-ava-colors',
    );
    const khoaSupportRows = report.supportRecommendationRows.filter(
      (row) => row.studentId === 'student-khoa',
    );

    expect(minhSession).toEqual(
      expect.objectContaining({
        studentName: 'Minh Tran',
        dailyPlanId: 'plan-minh-a1-day-02',
        lessonCode: 'A1-L02',
        messageCount: 3,
        allowedMessageCount: 2,
        blockedMessageCount: 1,
        safetyFlagCount: 1,
        teacherReviewItemCount: 1,
        supportRecommendationCount: 1,
        parentSummaryReady: true,
      }),
    );
    expect(linhSession).toEqual(
      expect.objectContaining({
        sessionStatus: 'CLOSED',
        safetyFlagCount: 0,
        teacherReviewItemCount: 0,
        parentSummaryReady: true,
      }),
    );
    expect(accountReview).toEqual(
      expect.objectContaining({
        studentName: 'Khoa Le',
        topicCategory: 'ACCOUNT_ACCESS',
        severity: 'HIGH',
        reviewStatus: 'OPEN',
        parentSummaryReady: false,
        supportRecommendationCount: 1,
      }),
    );
    expect(avaSummary).toEqual(
      expect.objectContaining({
        parentGuardianName: 'Ava Parent',
        courseCode: 'MH-A1-STARTER',
        classCode: 'MH-A1-JUN-WEEKDAY',
      }),
    );
    expect(khoaSupportRows).toHaveLength(2);
    expect(khoaSupportRows).toContainEqual(
      expect.objectContaining({
        priority: 'HIGH',
        status: 'MONITORING',
      }),
    );
  });

  it('renders AI tutor chat safety teacher review Markdown evidence', () => {
    const report = service.buildAiTutorChatSafetyTeacherReviewReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T06:00:00.000Z',
    );
    const markdown = service.toAiTutorChatSafetyTeacherReviewMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('aiProviderExecutionUsed=false');
    expect(markdown).toContain('realAiChatMutationUsed=false');
    expect(markdown).toContain('realAiModerationMutationUsed=false');
    expect(markdown).toContain('realParentMessageMutationUsed=false');
    expect(markdown).toContain('realTeacherInterventionMutationUsed=false');
    expect(markdown).toContain('realLearningSupportMutationUsed=false');
    expect(markdown).toContain('Chat sessions: 4');
    expect(markdown).toContain('Blocked messages: 4');
    expect(markdown).toContain('## Teacher Review Queue');
    expect(markdown).toContain('ai-chat-minh-colors-off-topic');
    expect(markdown).toContain('## Learning Support Recommendation Rows');
  });

  it('builds a fixture-only student achievement badge certificate report', () => {
    const report = service.buildStudentAchievementBadgeCertificateReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T07:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      aiProviderExecutionUsed: false,
      certificateIssuerProviderUsed: false,
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
      realAiChatMutationUsed: false,
      realAiModerationMutationUsed: false,
      realLearningSupportMutationUsed: false,
      realAchievementMutationUsed: false,
      realBadgeMutationUsed: false,
      realCertificateMutationUsed: false,
      realCredentialIssuanceUsed: false,
      realRecognitionNotificationMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
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
    });
    expect(report.statusCounts).toEqual({
      achievementKind: {
        LESSON_MASTERY: 1,
        PRACTICE_STREAK: 1,
        ASSESSMENT_SCORE: 2,
        SAFE_TUTOR_USE: 1,
        COURSE_COMPLETION: 1,
      },
      badgeAwardStatus: {
        AWARDED: 4,
        HELD_FOR_TEACHER_REVIEW: 0,
      },
      certificateStatus: {
        READY: 1,
        PENDING: 1,
        HELD_FOR_REVIEW: 1,
      },
      milestoneStatus: {
        COMPLETED: 5,
        PENDING: 2,
      },
      recognitionAudience: {
        PARENT: 2,
        TEACHER: 3,
      },
      recognitionStatus: {
        PARENT_VISIBLE: 2,
        TEACHER_REVIEW: 1,
        ENCOURAGEMENT_NEEDED: 2,
      },
    });
  });

  it('derives achievement recognition and certificate rows from existing learning evidence', () => {
    const report = service.buildStudentAchievementBadgeCertificateReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T07:00:00.000Z',
    );

    const ava = report.studentRows.find(
      (row) => row.studentId === 'student-ava',
    );
    const linhCertificate = report.certificateRows.find(
      (row) => row.certificateFixtureId === 'certificate-linh-phonics-ready',
    );
    const minhRecognition = report.recognitionRows.find(
      (row) =>
        row.recognitionSummaryId === 'recognition-minh-parent-encouragement',
    );
    const khoaAchievement = report.achievementRows.find(
      (row) =>
        row.achievementRecordId === 'achievement-khoa-prewithdrawal-greetings',
    );

    expect(ava).toEqual(
      expect.objectContaining({
        studentName: 'Ava Nguyen',
        progressStatus: 'IN_PROGRESS',
        achievementRecordCount: 2,
        badgeAwardCount: 2,
        completedMilestoneCount: 2,
        pendingMilestoneCount: 1,
        certificateStatus: 'PENDING',
        nearCertificate: true,
        needsEncouragement: false,
      }),
    );
    expect(linhCertificate).toEqual(
      expect.objectContaining({
        studentName: 'Linh Pham',
        courseCode: 'MH-PHONICS-BOOSTER',
        status: 'READY',
        completedBadgeAwardCount: 2,
        pendingMilestoneCount: 0,
        certificatePreviewRef: 'fixture-certificate-preview-linh-phonics',
      }),
    );
    expect(minhRecognition).toEqual(
      expect.objectContaining({
        parentGuardianName: 'Minh Parent',
        status: 'ENCOURAGEMENT_NEEDED',
        parentVisible: true,
        teacherReviewRequired: true,
        sourceAiTutorSupportRecommendationId: 'ai-support-minh-colors-redirect',
      }),
    );
    expect(khoaAchievement).toEqual(
      expect.objectContaining({
        studentName: 'Khoa Le',
        progressStatus: 'WITHDRAWN',
        aiTutorSupportRecommendationId: 'ai-support-khoa-hint-only',
        evidenceScorePercent: 80,
      }),
    );
  });

  it('renders student achievement badge certificate Markdown evidence', () => {
    const report = service.buildStudentAchievementBadgeCertificateReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T07:00:00.000Z',
    );
    const markdown =
      service.toStudentAchievementBadgeCertificateMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('certificateIssuerProviderUsed=false');
    expect(markdown).toContain('realAchievementMutationUsed=false');
    expect(markdown).toContain('realBadgeMutationUsed=false');
    expect(markdown).toContain('realCertificateMutationUsed=false');
    expect(markdown).toContain('realCredentialIssuanceUsed=false');
    expect(markdown).toContain('realRecognitionNotificationMutationUsed=false');
    expect(markdown).toContain('Achievement records: 6');
    expect(markdown).toContain('Badge awards: 4');
    expect(markdown).toContain('## Certificate Fixture Rows');
    expect(markdown).toContain('certificate-linh-phonics-ready');
    expect(markdown).toContain('## Recognition Summary Rows');
    expect(markdown).toContain('ai-support-minh-colors-redirect');
  });

  it('builds a fixture-only parent teacher weekly digest report', () => {
    const report = service.buildParentTeacherWeeklyDigestReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T08:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      aiProviderExecutionUsed: false,
      certificateIssuerProviderUsed: false,
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
      realAiChatMutationUsed: false,
      realAiModerationMutationUsed: false,
      realLearningSupportMutationUsed: false,
      realAchievementMutationUsed: false,
      realBadgeMutationUsed: false,
      realCertificateMutationUsed: false,
      realCredentialIssuanceUsed: false,
      realRecognitionNotificationMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realWeeklyDigestNotificationMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      digestCount: 5,
      parentDigestCount: 3,
      teacherDigestCount: 2,
      readyToSendDigestCount: 2,
      teacherReviewDigestCount: 2,
      heldWithdrawnDigestCount: 1,
      parentVisibleDigestCount: 2,
      teacherOnlyDigestCount: 3,
      actionCount: 6,
      highPriorityActionCount: 2,
      scheduledActionCount: 2,
      completedActionCount: 1,
      studentsCovered: 4,
      studentsNeedingTeacherReview: 3,
      studentsReadyForParentSend: 2,
    });
    expect(report.statusCounts).toEqual({
      audience: {
        PARENT: 3,
        TEACHER: 2,
      },
      deliveryStatus: {
        READY_TO_SEND: 2,
        TEACHER_REVIEW: 2,
        HELD_WITHDRAWN: 1,
      },
      actionPriority: {
        LOW: 1,
        MEDIUM: 3,
        HIGH: 2,
      },
      actionStatus: {
        RECOMMENDED: 2,
        SCHEDULED: 2,
        COMPLETED: 1,
        HELD: 1,
      },
      actionOwner: {
        PARENT: 3,
        TEACHER: 3,
      },
    });
  });

  it('derives weekly digest rows from progress alerts achievements and review evidence', () => {
    const report = service.buildParentTeacherWeeklyDigestReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T08:00:00.000Z',
    );

    const avaTeacher = report.digestRows.find(
      (row) => row.digestId === 'digest-ava-teacher-2026-w23',
    );
    const minhParent = report.digestRows.find(
      (row) => row.digestId === 'digest-minh-parent-2026-w23',
    );
    const khoaTeacher = report.digestRows.find(
      (row) => row.digestId === 'digest-khoa-teacher-2026-w23',
    );
    const linhStudent = report.studentRows.find(
      (row) => row.studentId === 'student-linh',
    );

    expect(avaTeacher).toEqual(
      expect.objectContaining({
        audience: 'TEACHER',
        deliveryStatus: 'TEACHER_REVIEW',
        parentVisible: false,
        progressStatus: 'IN_PROGRESS',
        completionPercent: 67,
        certificateStatus: 'PENDING',
        actionCount: 1,
        sourceCertificateFixtureId: 'certificate-ava-a1-near-ready',
      }),
    );
    expect(avaTeacher?.sourceAiTutorTeacherReviewItemIds).toContain(
      'ai-review-ava-personal-data',
    );
    expect(minhParent).toEqual(
      expect.objectContaining({
        studentName: 'Minh Tran',
        audience: 'PARENT',
        deliveryStatus: 'TEACHER_REVIEW',
        parentVisible: false,
        assignmentCompletionPercent: 25,
        averagePracticeScorePercent: 65,
        alertCount: 3,
        highRiskAlertCount: 2,
        highPriorityActionCount: 1,
      }),
    );
    expect(khoaTeacher).toEqual(
      expect.objectContaining({
        studentName: 'Khoa Le',
        deliveryStatus: 'HELD_WITHDRAWN',
        progressStatus: 'WITHDRAWN',
        parentVisible: false,
        certificateStatus: 'HELD_FOR_REVIEW',
        sourceCertificateFixtureId: 'certificate-khoa-a1-held',
      }),
    );
    expect(linhStudent).toEqual(
      expect.objectContaining({
        parentDigestCount: 1,
        teacherDigestCount: 0,
        readyToSendDigestCount: 1,
        actionCount: 1,
        completedActionCount: 1,
        nextActionDueAt: null,
      }),
    );
  });

  it('renders parent teacher weekly digest Markdown evidence', () => {
    const report = service.buildParentTeacherWeeklyDigestReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T08:00:00.000Z',
    );
    const markdown = service.toParentTeacherWeeklyDigestMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain(
      'realWeeklyDigestNotificationMutationUsed=false',
    );
    expect(markdown).toContain('Weekly digests: 5');
    expect(markdown).toContain('Students needing teacher review: 3');
    expect(markdown).toContain('## Weekly Digest Rows');
    expect(markdown).toContain('digest-minh-parent-2026-w23');
    expect(markdown).toContain('## Action Rows');
    expect(markdown).toContain('digest-action-khoa-teacher-hold');
  });

  it('builds a fixture-only follow-up action outcome report', () => {
    const report = service.buildFollowUpActionOutcomeReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T09:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      aiProviderExecutionUsed: false,
      certificateIssuerProviderUsed: false,
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
      realAiChatMutationUsed: false,
      realAiModerationMutationUsed: false,
      realLearningSupportMutationUsed: false,
      realAchievementMutationUsed: false,
      realBadgeMutationUsed: false,
      realCertificateMutationUsed: false,
      realCredentialIssuanceUsed: false,
      realRecognitionNotificationMutationUsed: false,
      realParentSummaryMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realWeeklyDigestNotificationMutationUsed: false,
      realFollowUpActionOutcomeMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      outcomeCount: 6,
      completedOutcomeCount: 1,
      verifiedOutcomeCount: 1,
      scheduledOutcomeCount: 1,
      monitoringOutcomeCount: 2,
      heldOutcomeCount: 1,
      parentVisibleOutcomeCount: 2,
      teacherOnlyOutcomeCount: 4,
      positiveOutcomeCount: 2,
      needsSupportOutcomeCount: 2,
      noSendOutcomeCount: 1,
      linkedDailyPlanCount: 6,
      linkedSupportRecommendationCount: 5,
      linkedAchievementCount: 4,
      linkedParentSummaryCount: 3,
      linkedTeacherReviewCount: 3,
      studentsCovered: 4,
      studentsWithCompletedOrVerifiedOutcome: 2,
      studentsWithOpenOutcome: 3,
    });
    expect(report.statusCounts).toEqual({
      outcomeStatus: {
        COMPLETED: 1,
        VERIFIED: 1,
        SCHEDULED: 1,
        MONITORING: 2,
        HELD: 1,
      },
      impactBand: {
        POSITIVE: 2,
        STABLE: 1,
        NEEDS_SUPPORT: 2,
        NO_SEND: 1,
      },
      actionOwner: {
        PARENT: 3,
        TEACHER: 3,
      },
      actionPriority: {
        LOW: 1,
        MEDIUM: 3,
        HIGH: 2,
      },
    });
  });

  it('derives follow-up outcome rows from digest actions and learning evidence', () => {
    const report = service.buildFollowUpActionOutcomeReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T09:00:00.000Z',
    );

    const minhTeacher = report.outcomeRows.find(
      (row) => row.outcomeId === 'followup-outcome-minh-teacher-recovery-plan',
    );
    const linhParent = report.outcomeRows.find(
      (row) => row.outcomeId === 'followup-outcome-linh-parent-celebrate',
    );
    const khoaHold = report.outcomeRows.find(
      (row) => row.outcomeId === 'followup-outcome-khoa-teacher-hold',
    );
    const avaStudent = report.studentRows.find(
      (row) => row.studentId === 'student-ava',
    );

    expect(minhTeacher).toEqual(
      expect.objectContaining({
        studentName: 'Minh Tran',
        actionId: 'digest-action-minh-teacher-recovery-plan',
        digestDeliveryStatus: 'TEACHER_REVIEW',
        actionOwner: 'TEACHER',
        actionPriority: 'HIGH',
        outcomeStatus: 'SCHEDULED',
        impactBand: 'NEEDS_SUPPORT',
        parentVisible: false,
        dailyPlanStatus: 'BLOCKED',
        supportRecommendationId: 'ai-support-minh-colors-redirect',
        supportStatus: 'RECOMMENDED',
        achievementKind: 'SAFE_TUTOR_USE',
        teacherReviewItemId: 'ai-review-minh-off-topic-game',
        teacherReviewStatus: 'OPEN',
      }),
    );
    expect(linhParent).toEqual(
      expect.objectContaining({
        actionOwner: 'PARENT',
        outcomeStatus: 'COMPLETED',
        impactBand: 'POSITIVE',
        parentVisible: true,
        parentSummaryReady: true,
        achievementKind: 'COURSE_COMPLETION',
      }),
    );
    expect(khoaHold).toEqual(
      expect.objectContaining({
        actionStatus: 'HELD',
        outcomeStatus: 'HELD',
        impactBand: 'NO_SEND',
        dailyPlanStatus: 'COMPLETED',
        supportStatus: 'MONITORING',
        teacherReviewStatus: 'OPEN',
        parentSummaryReady: false,
      }),
    );
    expect(avaStudent).toEqual(
      expect.objectContaining({
        outcomeCount: 2,
        completedOrVerifiedCount: 1,
        scheduledOrMonitoringCount: 1,
        parentVisibleOutcomeCount: 1,
        nextReviewAt: '2026-06-07T09:00:00.000Z',
      }),
    );
  });

  it('renders follow-up action outcome Markdown evidence', () => {
    const report = service.buildFollowUpActionOutcomeReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T09:00:00.000Z',
    );
    const markdown = service.toFollowUpActionOutcomeMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('realFollowUpActionOutcomeMutationUsed=false');
    expect(markdown).toContain('Follow-up outcomes: 6');
    expect(markdown).toContain('Linked support recommendations: 5');
    expect(markdown).toContain('## Outcome Rows');
    expect(markdown).toContain('followup-outcome-minh-teacher-recovery-plan');
    expect(markdown).toContain('ai-support-minh-colors-redirect');
    expect(markdown).toContain('ai-review-khoa-account-access');
  });
});
