import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService (classroom and progress)', () => {
  const service = new LearningLocalDemoService();

  it('builds a fixture-only class session attendance progress report', () => {
    const report = service.buildClassSessionAttendanceProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T00:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      providerApiUsed: false,
      paymentProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realClassMutationUsed: false,
      realSessionMutationUsed: false,
      realAttendanceMutationUsed: false,
      realProgressMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      classCount: 2,
      activeClassCount: 1,
      completedClassCount: 1,
      sessionCount: 5,
      completedSessionCount: 4,
      scheduledSessionCount: 1,
      attendanceRecordCount: 8,
      presentAttendanceCount: 4,
      lateAttendanceCount: 2,
      absentAttendanceCount: 1,
      excusedAttendanceCount: 1,
      attendedAttendanceCount: 6,
      attendanceRatePercent: 75,
      progressRecordCount: 4,
      completedProgressCount: 1,
      inProgressCount: 1,
      needsSupportCount: 1,
      withdrawnProgressCount: 1,
      completedLessonCount: 6,
      totalLessonCount: 11,
      overallCompletionPercent: 55,
      averageLearnerCompletionPercent: 58,
    });
    expect(report.statusCounts.attendance).toEqual({
      PRESENT: 4,
      ABSENT: 1,
      LATE: 2,
      EXCUSED: 1,
    });
    expect(report.statusCounts.progress).toEqual({
      NOT_STARTED: 0,
      IN_PROGRESS: 1,
      NEEDS_SUPPORT: 1,
      COMPLETED: 1,
      WITHDRAWN: 1,
    });
  });

  it('aggregates class attendance and completion states', () => {
    const report = service.buildClassSessionAttendanceProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T00:00:00.000Z',
    );
    const a1 = report.classAggregates.find(
      (row) => row.classCode === 'MH-A1-JUN-WEEKDAY',
    );
    const phonics = report.classAggregates.find(
      (row) => row.classCode === 'MH-PHONICS-MAY',
    );

    expect(a1).toEqual(
      expect.objectContaining({
        studentCount: 3,
        sessionCount: 3,
        completedSessionCount: 2,
        scheduledSessionCount: 1,
        attendanceRecordCount: 6,
        presentAttendanceCount: 3,
        lateAttendanceCount: 1,
        absentAttendanceCount: 1,
        excusedAttendanceCount: 1,
        attendanceRatePercent: 67,
        averageLearnerCompletionPercent: 44,
        needsSupportCount: 1,
      }),
    );
    expect(phonics).toEqual(
      expect.objectContaining({
        studentCount: 1,
        completedSessionCount: 2,
        attendanceRecordCount: 2,
        lateAttendanceCount: 1,
        attendanceRatePercent: 100,
        averageLearnerCompletionPercent: 100,
        completedProgressCount: 1,
      }),
    );
  });

  it('keeps scheduled sessions read-only without attendance records', () => {
    const report = service.buildClassSessionAttendanceProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T00:00:00.000Z',
    );
    const scheduled = report.sessionRows.find(
      (row) => row.sessionId === 'session-a1-003-family',
    );

    expect(scheduled).toEqual(
      expect.objectContaining({
        status: 'SCHEDULED',
        attendanceRecordCount: 0,
        presentAttendanceCount: 0,
        absentAttendanceCount: 0,
        lateAttendanceCount: 0,
        excusedAttendanceCount: 0,
      }),
    );
  });

  it('renders class session attendance progress Markdown evidence', () => {
    const report = service.buildClassSessionAttendanceProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T00:00:00.000Z',
    );
    const markdown = service.toClassSessionAttendanceProgressMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('realAttendanceMutationUsed=false');
    expect(markdown).toContain('## Session Rows');
    expect(markdown).toContain('MH-A1-JUN-WEEKDAY');
    expect(markdown).toContain('NEEDS_SUPPORT');
  });

  it('builds a fixture-only lesson assignment assessment progress report', () => {
    const report = service.buildLessonAssignmentAssessmentProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T01:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      providerApiUsed: false,
      paymentProviderUsed: false,
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
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      classCount: 2,
      lessonCount: 5,
      publishedLessonCount: 4,
      scheduledLessonCount: 1,
      assignmentCount: 6,
      quizCount: 3,
      assignmentTaskCount: 3,
      openAssignmentCount: 2,
      closedAssignmentCount: 4,
      expectedSubmissionCount: 14,
      submissionRecordCount: 14,
      submittedSubmissionCount: 5,
      lateSubmissionCount: 2,
      missingSubmissionCount: 6,
      resubmittedSubmissionCount: 1,
      completedSubmissionCount: 8,
      scoredSubmissionCount: 8,
      feedbackGivenCount: 6,
      pendingFeedbackCount: 2,
      feedbackNotRequiredCount: 6,
      excellentScoreCount: 3,
      onTrackScoreCount: 4,
      needsSupportScoreCount: 1,
      missingScoreCount: 6,
      averageScorePercent: 86,
      learnerAssessmentCount: 4,
      excellentLearnerCount: 1,
      onTrackLearnerCount: 1,
      needsSupportLearnerCount: 1,
      missingLearnerCount: 0,
      withdrawnLearnerCount: 1,
      overallAssignmentCompletionPercent: 57,
      averageLearnerScorePercent: 83,
    });
  });

  it('covers submitted missing late and resubmitted assessment states', () => {
    const report = service.buildLessonAssignmentAssessmentProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T01:00:00.000Z',
    );

    expect(report.statusCounts.submission).toEqual({
      SUBMITTED: 5,
      LATE: 2,
      MISSING: 6,
      RESUBMITTED: 1,
    });
    expect(report.statusCounts.feedback).toEqual({
      GIVEN: 6,
      PENDING: 2,
      NOT_REQUIRED: 6,
    });

    const colorsQuiz = report.assignmentRows.find(
      (row) => row.assignmentId === 'assignment-a1-002-colors-quiz',
    );
    expect(colorsQuiz).toEqual(
      expect.objectContaining({
        kind: 'QUIZ',
        expectedSubmissionCount: 3,
        missingSubmissionCount: 2,
        resubmittedSubmissionCount: 1,
        scoredSubmissionCount: 1,
        averageScorePercent: 90,
      }),
    );
  });

  it('aggregates learner assessment bands with progress evidence', () => {
    const report = service.buildLessonAssignmentAssessmentProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T01:00:00.000Z',
    );
    const ava = report.learnerRows.find(
      (row) => row.enrollmentId === 'enroll-ava-a1-active',
    );
    const minh = report.learnerRows.find(
      (row) => row.enrollmentId === 'enroll-minh-a1-pending',
    );
    const khoa = report.learnerRows.find(
      (row) => row.enrollmentId === 'enroll-khoa-a1-canceled',
    );
    const linh = report.learnerRows.find(
      (row) => row.enrollmentId === 'enroll-linh-phonics-active',
    );

    expect(ava).toEqual(
      expect.objectContaining({
        expectedAssignmentCount: 4,
        submittedSubmissionCount: 3,
        resubmittedSubmissionCount: 1,
        missingSubmissionCount: 0,
        averageScorePercent: 88,
        assignmentCompletionPercent: 100,
        progressCompletionPercent: 67,
        assessmentBand: 'ON_TRACK',
      }),
    );
    expect(minh).toEqual(
      expect.objectContaining({
        expectedAssignmentCount: 4,
        lateSubmissionCount: 1,
        missingSubmissionCount: 3,
        averageScorePercent: 70,
        assignmentCompletionPercent: 25,
        progressCompletionPercent: 33,
        assessmentBand: 'NEEDS_SUPPORT',
      }),
    );
    expect(khoa).toEqual(
      expect.objectContaining({
        missingSubmissionCount: 3,
        progressStatus: 'WITHDRAWN',
        assessmentBand: 'WITHDRAWN',
      }),
    );
    expect(linh).toEqual(
      expect.objectContaining({
        expectedAssignmentCount: 2,
        lateSubmissionCount: 1,
        averageScorePercent: 94,
        assignmentCompletionPercent: 100,
        progressCompletionPercent: 100,
        assessmentBand: 'EXCELLENT',
      }),
    );
  });

  it('renders lesson assignment assessment Markdown evidence', () => {
    const report = service.buildLessonAssignmentAssessmentProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T01:00:00.000Z',
    );
    const markdown =
      service.toLessonAssignmentAssessmentProgressMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('realLessonMutationUsed=false');
    expect(markdown).toContain('realAssignmentMutationUsed=false');
    expect(markdown).toContain('realAssessmentMutationUsed=false');
    expect(markdown).toContain('## Assignment Rows');
    expect(markdown).toContain('Colors and objects quiz');
    expect(markdown).toContain('Resubmitted');
    expect(markdown).toContain('WITHDRAWN');
  });

  it('builds a fixture-only learning path daily plan video practice report', () => {
    const report =
      service.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T02:00:00.000Z',
      );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
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
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      learningPathCount: 4,
      activeLearningPathCount: 1,
      completedLearningPathCount: 1,
      needsSupportLearningPathCount: 1,
      withdrawnLearningPathCount: 1,
      dailyPlanCount: 10,
      completedDailyPlanCount: 6,
      inProgressDailyPlanCount: 1,
      blockedDailyPlanCount: 1,
      skippedDailyPlanCount: 2,
      assignedDailyPlanCount: 0,
      blockedSkippedIncompleteDailyPlanCount: 4,
      videoEvidenceCount: 10,
      completedVideoCount: 6,
      incompleteVideoCount: 2,
      skippedVideoCount: 2,
      practiceAttemptCount: 10,
      passedPracticeCount: 6,
      needsRetryPracticeCount: 1,
      incompletePracticeCount: 1,
      skippedPracticeCount: 2,
      averagePracticeScorePercent: 82,
      overallDailyPlanCompletionPercent: 60,
      averageLearnerProgressPercent: 63,
      onTrackLearnerCount: 2,
      needsSupportLearnerCount: 1,
      inactiveLearnerCount: 0,
      withdrawnLearnerCount: 1,
    });
  });

  it('covers daily-plan blocked skipped incomplete video and practice states', () => {
    const report =
      service.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T02:00:00.000Z',
      );

    expect(report.statusCounts.dailyPlan).toEqual({
      COMPLETED: 6,
      IN_PROGRESS: 1,
      BLOCKED: 1,
      SKIPPED: 2,
      ASSIGNED: 0,
    });
    expect(report.statusCounts.videoEvidence).toEqual({
      COMPLETED: 6,
      INCOMPLETE: 2,
      SKIPPED: 2,
    });
    expect(report.statusCounts.practiceAttempt).toEqual({
      PASSED: 6,
      NEEDS_RETRY: 1,
      INCOMPLETE: 1,
      SKIPPED: 2,
    });

    const minhBlockedPlan = report.dailyPlanRows.find(
      (row) => row.dailyPlanId === 'plan-minh-a1-day-02',
    );
    expect(minhBlockedPlan).toEqual(
      expect.objectContaining({
        dailyPlanStatus: 'BLOCKED',
        videoEvidenceStatus: 'INCOMPLETE',
        videoCompletionPercent: 21,
        practiceAttemptStatus: 'NEEDS_RETRY',
        practiceScorePercent: 58,
      }),
    );
  });

  it('aggregates learner path progress bands for parent and teacher review', () => {
    const report =
      service.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T02:00:00.000Z',
      );
    const ava = report.learningPathRows.find(
      (row) => row.learningPathId === 'path-ava-a1-june',
    );
    const minh = report.learningPathRows.find(
      (row) => row.learningPathId === 'path-minh-a1-june',
    );
    const linh = report.learningPathRows.find(
      (row) => row.learningPathId === 'path-linh-phonics-may',
    );
    const khoa = report.learningPathRows.find(
      (row) => row.learningPathId === 'path-khoa-a1-withdrawn',
    );

    expect(ava).toEqual(
      expect.objectContaining({
        dailyPlanCount: 3,
        completedDailyPlanCount: 2,
        completedVideoCount: 2,
        passedPracticeCount: 2,
        averagePracticeScorePercent: 88,
        progressPercent: 67,
        learnerStatusBand: 'ON_TRACK',
      }),
    );
    expect(minh).toEqual(
      expect.objectContaining({
        blockedDailyPlanCount: 1,
        skippedDailyPlanCount: 1,
        averagePracticeScorePercent: 65,
        progressPercent: 33,
        learnerStatusBand: 'NEEDS_SUPPORT',
      }),
    );
    expect(linh).toEqual(
      expect.objectContaining({
        averagePracticeScorePercent: 94,
        progressPercent: 100,
        learnerStatusBand: 'ON_TRACK',
      }),
    );
    expect(khoa).toEqual(
      expect.objectContaining({
        pathStatus: 'WITHDRAWN',
        progressPercent: 50,
        learnerStatusBand: 'WITHDRAWN',
      }),
    );
  });

  it('renders learning path daily plan video practice Markdown evidence', () => {
    const report =
      service.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T02:00:00.000Z',
      );
    const markdown =
      service.toLearningPathDailyPlanVideoPracticeEvidenceMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('noProductionDbRead=true');
    expect(markdown).toContain('realLearningPathMutationUsed=false');
    expect(markdown).toContain('realDailyPlanMutationUsed=false');
    expect(markdown).toContain('realVideoEvidenceMutationUsed=false');
    expect(markdown).toContain('realPracticeMutationUsed=false');
    expect(markdown).toContain('## Daily Plan Video Practice Rows');
    expect(markdown).toContain('Ava A1 daily video and practice path');
    expect(markdown).toContain('NEEDS_RETRY');
  });

  it('builds a fixture-only parent teacher progress alert intervention report', () => {
    const report = service.buildParentTeacherProgressAlertInterventionReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T03:00:00.000Z',
    );

    expect(report.safety).toEqual({
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
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      learnerProgressSummaryCount: 4,
      alertCount: 7,
      highRiskAlertCount: 2,
      mediumRiskAlertCount: 5,
      resolvedAlertCount: 1,
      followUpNeededAlertCount: 6,
      teacherInterventionRecommendationCount: 7,
      parentSummaryCount: 7,
      openFollowUpCount: 3,
      scheduledFollowUpCount: 2,
      resolvedFollowUpCount: 1,
      monitoringFollowUpCount: 1,
    });
    expect(report.statusCounts.alertReason).toEqual({
      MISSING_SUBMISSIONS: 1,
      LOW_PRACTICE_SCORE: 1,
      SKIPPED_VIDEO: 2,
      ATTENDANCE_SESSION_GAP: 1,
      STALLED_DAILY_PLAN: 2,
    });
  });

  it('derives deterministic parent teacher alert rows from fixture evidence', () => {
    const report = service.buildParentTeacherProgressAlertInterventionReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T03:00:00.000Z',
    );

    const minh = report.learnerSummaries.find(
      (row) => row.enrollmentId === 'enroll-minh-a1-pending',
    );
    const avaStalled = report.alertRows.find(
      (row) => row.alertId === 'alert-student-ava-stalled-daily-plan',
    );
    const khoaResolved = report.alertRows.find(
      (row) => row.alertId === 'alert-student-khoa-skipped-video',
    );

    expect(minh).toEqual(
      expect.objectContaining({
        progressStatus: 'NEEDS_SUPPORT',
        progressPercent: 33,
        attendanceRatePercent: 50,
        missingSubmissionCount: 3,
        skippedVideoCount: 1,
        blockedDailyPlanCount: 1,
        averagePracticeScorePercent: 65,
        alertCount: 5,
        highRiskAlertCount: 2,
        mediumRiskAlertCount: 3,
        followUpNeededAlertCount: 5,
        highestAlertSeverity: 'HIGH',
      }),
    );
    expect(avaStalled).toEqual(
      expect.objectContaining({
        alertSeverity: 'MEDIUM',
        alertReason: 'STALLED_DAILY_PLAN',
        followUpStatus: 'MONITORING',
        parentSummary:
          'Ava Nguyen is on track but should finish the open fixture daily plan.',
      }),
    );
    expect(khoaResolved).toEqual(
      expect.objectContaining({
        alertSeverity: 'MEDIUM',
        alertReason: 'SKIPPED_VIDEO',
        followUpStatus: 'RESOLVED',
        teacherInterventionRecommendation:
          'Teacher marks the skipped-video item resolved because this learner is withdrawn in synthetic fixtures.',
      }),
    );
  });

  it('renders parent teacher alert intervention Markdown evidence', () => {
    const report = service.buildParentTeacherProgressAlertInterventionReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T03:00:00.000Z',
    );
    const markdown =
      service.toParentTeacherProgressAlertInterventionMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('aiProviderUsed=false');
    expect(markdown).toContain('notificationProviderUsed=false');
    expect(markdown).toContain('realParentMessageMutationUsed=false');
    expect(markdown).toContain('realTeacherInterventionMutationUsed=false');
    expect(markdown).toContain('## Top Alert Reasons');
    expect(markdown).toContain('Missing submissions');
    expect(markdown).toContain('Teacher intervention');
    expect(markdown).toContain('Parent summary');
  });
});
