import type { DemoLearningCoreFixture } from '../learning-local-demo.types';

/** Weekly digests, follow-up outcomes, remedial retries and escalations. */
export const followUpFixture: Pick<
  DemoLearningCoreFixture,
  | 'weeklyDigests'
  | 'weeklyDigestActions'
  | 'followUpActionOutcomes'
  | 'remedialRetryCompletions'
  | 'remedialRetryUnresolvedEscalations'
  | 'teacherEscalationFollowupResolutions'
> = {
  weeklyDigests: [
    {
      id: 'digest-ava-parent-2026-w23',
      studentId: 'student-ava',
      enrollmentId: 'enroll-ava-a1-active',
      courseId: 'course-a1-starter',
      classId: 'class-a1-june-weekday',
      parentGuardianId: 'guardian-ava-parent',
      weekStart: '2026-06-01',
      weekEnd: '2026-06-07',
      audience: 'PARENT',
      deliveryStatus: 'READY_TO_SEND',
      parentVisible: true,
      sourceAlertIds: ['alert-student-ava-stalled-daily-plan'],
      sourceRecognitionSummaryIds: ['recognition-ava-parent-colors'],
      sourceAiTutorTeacherReviewItemIds: [],
      sourceCertificateFixtureId: 'certificate-ava-a1-near-ready',
      highlight:
        'Ava earned two A1 badges and completed the greetings and colors milestones.',
      riskSummary:
        'Family preview remains in progress, so the digest asks the parent to protect one short practice window.',
      parentSummary:
        'Ava is on track for the local-demo certificate preview after one more family words milestone.',
      teacherNote:
        'Teacher Mai can send this digest after checking the family preview reminder.',
      fixtureDigestSource: 'fixture_parent_teacher_weekly_digest',
    },
    {
      id: 'digest-ava-teacher-2026-w23',
      studentId: 'student-ava',
      enrollmentId: 'enroll-ava-a1-active',
      courseId: 'course-a1-starter',
      classId: 'class-a1-june-weekday',
      parentGuardianId: 'guardian-ava-parent',
      weekStart: '2026-06-01',
      weekEnd: '2026-06-07',
      audience: 'TEACHER',
      deliveryStatus: 'TEACHER_REVIEW',
      parentVisible: false,
      sourceAlertIds: ['alert-student-ava-stalled-daily-plan'],
      sourceRecognitionSummaryIds: [
        'recognition-ava-teacher-certificate-check',
      ],
      sourceAiTutorTeacherReviewItemIds: ['ai-review-ava-personal-data'],
      sourceCertificateFixtureId: 'certificate-ava-a1-near-ready',
      highlight:
        'Ava has enough badge evidence for a near-ready certificate preview.',
      riskSummary:
        'Teacher review is required because the family milestone and privacy reminder are still open.',
      parentSummary:
        'Hold the teacher-only details until the privacy reminder and family preview are reviewed.',
      teacherNote:
        'Check the certificate preview and AI privacy reminder before final parent send.',
      fixtureDigestSource: 'fixture_parent_teacher_weekly_digest',
    },
    {
      id: 'digest-minh-parent-2026-w23',
      studentId: 'student-minh',
      enrollmentId: 'enroll-minh-a1-pending',
      courseId: 'course-a1-starter',
      classId: 'class-a1-june-weekday',
      parentGuardianId: 'guardian-minh-parent',
      weekStart: '2026-06-01',
      weekEnd: '2026-06-07',
      audience: 'PARENT',
      deliveryStatus: 'TEACHER_REVIEW',
      parentVisible: false,
      sourceAlertIds: [
        'alert-student-minh-missing-submissions',
        'alert-student-minh-low-practice-score',
        'alert-student-minh-stalled-daily-plan',
      ],
      sourceRecognitionSummaryIds: ['recognition-minh-parent-encouragement'],
      sourceAiTutorTeacherReviewItemIds: ['ai-review-minh-off-topic-game'],
      highlight:
        'Minh completed a greetings catch-up and can recover the colors plan with parent support.',
      riskSummary:
        'The digest is held for teacher review because submissions, practice score, and daily plan blockers all need follow-up.',
      parentSummary:
        'Minh needs a positive parent-facing encouragement note before this weekly digest is sent.',
      teacherNote:
        'Teacher Mai should add a short recovery plan and payment follow-up note before parent delivery.',
      fixtureDigestSource: 'fixture_parent_teacher_weekly_digest',
    },
    {
      id: 'digest-linh-parent-2026-w21',
      studentId: 'student-linh',
      enrollmentId: 'enroll-linh-phonics-active',
      courseId: 'course-phonics-booster',
      classId: 'class-phonics-may-booster',
      parentGuardianId: 'guardian-linh-parent',
      weekStart: '2026-05-18',
      weekEnd: '2026-05-24',
      audience: 'PARENT',
      deliveryStatus: 'READY_TO_SEND',
      parentVisible: true,
      sourceAlertIds: [],
      sourceRecognitionSummaryIds: ['recognition-linh-parent-certificate'],
      sourceAiTutorTeacherReviewItemIds: [],
      sourceCertificateFixtureId: 'certificate-linh-phonics-ready',
      highlight:
        'Linh completed the phonics booster path and has a read-only certificate preview ready.',
      riskSummary:
        'No open weekly risk remains in the synthetic evidence for this completed booster path.',
      parentSummary:
        'Linh finished the weekly phonics goal and the digest can celebrate the certificate preview.',
      teacherNote:
        'Teacher Hanh can mark the parent celebration digest complete in local-demo evidence.',
      fixtureDigestSource: 'fixture_parent_teacher_weekly_digest',
    },
    {
      id: 'digest-khoa-teacher-2026-w23',
      studentId: 'student-khoa',
      enrollmentId: 'enroll-khoa-a1-canceled',
      courseId: 'course-a1-starter',
      classId: 'class-a1-june-weekday',
      parentGuardianId: 'guardian-khoa-parent',
      weekStart: '2026-06-01',
      weekEnd: '2026-06-07',
      audience: 'TEACHER',
      deliveryStatus: 'HELD_WITHDRAWN',
      parentVisible: false,
      sourceAlertIds: ['alert-student-khoa-skipped-video'],
      sourceRecognitionSummaryIds: ['recognition-khoa-withdrawn-hold'],
      sourceAiTutorTeacherReviewItemIds: [
        'ai-review-khoa-account-access',
        'ai-review-khoa-academic-integrity',
      ],
      sourceCertificateFixtureId: 'certificate-khoa-a1-held',
      highlight:
        'Khoa has pre-withdrawal achievement evidence but no parent digest should be sent.',
      riskSummary:
        'The digest is held because the local-demo enrollment is canceled and refunded.',
      parentSummary:
        'No parent notification is sent from this fixture-only withdrawn state.',
      teacherNote:
        'Keep the digest teacher-only and retain the certificate hold evidence.',
      fixtureDigestSource: 'fixture_parent_teacher_weekly_digest',
    },
  ],
  weeklyDigestActions: [
    {
      id: 'digest-action-ava-parent-family-preview',
      digestId: 'digest-ava-parent-2026-w23',
      studentId: 'student-ava',
      owner: 'PARENT',
      priority: 'MEDIUM',
      status: 'RECOMMENDED',
      dueAt: '2026-06-06T09:00:00.000Z',
      sourceAlertId: 'alert-student-ava-stalled-daily-plan',
      sourceRecognitionSummaryId: 'recognition-ava-parent-colors',
      actionSummary:
        'Parent protects a 15-minute family words preview before the next class.',
      fixtureActionSource: 'fixture_parent_teacher_weekly_digest',
    },
    {
      id: 'digest-action-ava-teacher-certificate-check',
      digestId: 'digest-ava-teacher-2026-w23',
      studentId: 'student-ava',
      owner: 'TEACHER',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      dueAt: '2026-06-06T10:00:00.000Z',
      sourceAlertId: 'alert-student-ava-stalled-daily-plan',
      sourceRecognitionSummaryId: 'recognition-ava-teacher-certificate-check',
      actionSummary:
        'Teacher checks the family preview and privacy reminder before marking the certificate preview ready.',
      fixtureActionSource: 'fixture_parent_teacher_weekly_digest',
    },
    {
      id: 'digest-action-minh-teacher-recovery-plan',
      digestId: 'digest-minh-parent-2026-w23',
      studentId: 'student-minh',
      owner: 'TEACHER',
      priority: 'HIGH',
      status: 'SCHEDULED',
      dueAt: '2026-06-06T11:00:00.000Z',
      sourceAlertId: 'alert-student-minh-missing-submissions',
      sourceRecognitionSummaryId: 'recognition-minh-parent-encouragement',
      actionSummary:
        'Teacher prepares a three-task colors recovery checklist and parent encouragement note.',
      fixtureActionSource: 'fixture_parent_teacher_weekly_digest',
    },
    {
      id: 'digest-action-minh-parent-practice-window',
      digestId: 'digest-minh-parent-2026-w23',
      studentId: 'student-minh',
      owner: 'PARENT',
      priority: 'MEDIUM',
      status: 'RECOMMENDED',
      dueAt: '2026-06-06T13:00:00.000Z',
      sourceAlertId: 'alert-student-minh-stalled-daily-plan',
      sourceRecognitionSummaryId: 'recognition-minh-parent-encouragement',
      actionSummary:
        'Parent confirms a quiet practice window for the colors retry after teacher review.',
      fixtureActionSource: 'fixture_parent_teacher_weekly_digest',
    },
    {
      id: 'digest-action-linh-parent-celebrate',
      digestId: 'digest-linh-parent-2026-w21',
      studentId: 'student-linh',
      owner: 'PARENT',
      priority: 'LOW',
      status: 'COMPLETED',
      dueAt: '2026-05-24T11:00:00.000Z',
      sourceRecognitionSummaryId: 'recognition-linh-parent-certificate',
      actionSummary:
        'Parent receives the completion celebration and certificate preview link in fixture evidence.',
      fixtureActionSource: 'fixture_parent_teacher_weekly_digest',
    },
    {
      id: 'digest-action-khoa-teacher-hold',
      digestId: 'digest-khoa-teacher-2026-w23',
      studentId: 'student-khoa',
      owner: 'TEACHER',
      priority: 'HIGH',
      status: 'HELD',
      dueAt: '2026-06-01T15:00:00.000Z',
      sourceAlertId: 'alert-student-khoa-skipped-video',
      sourceRecognitionSummaryId: 'recognition-khoa-withdrawn-hold',
      actionSummary:
        'Teacher keeps the weekly digest held because the enrollment is withdrawn and refunded.',
      fixtureActionSource: 'fixture_parent_teacher_weekly_digest',
    },
  ],
  followUpActionOutcomes: [
    {
      id: 'followup-outcome-ava-parent-family-preview',
      weeklyDigestActionId: 'digest-action-ava-parent-family-preview',
      digestId: 'digest-ava-parent-2026-w23',
      studentId: 'student-ava',
      outcomeStatus: 'MONITORING',
      impactBand: 'STABLE',
      parentVisible: true,
      nextReviewAt: '2026-06-07T09:00:00.000Z',
      sourceDailyPlanId: 'plan-ava-a1-day-03',
      sourceAiTutorSupportRecommendationId: 'ai-support-ava-privacy-reminder',
      sourceAiTutorParentSummaryId: 'ai-parent-summary-ava-colors',
      evidenceSummary:
        'Ava parent protected the fixture practice window, but the family preview daily plan remains in progress.',
      outcomeSummary:
        'Keep Ava visible to the parent and monitor the family preview before the certificate preview is marked ready.',
      fixtureOutcomeSource: 'fixture_followup_action_outcome_report',
    },
    {
      id: 'followup-outcome-ava-teacher-certificate-check',
      weeklyDigestActionId: 'digest-action-ava-teacher-certificate-check',
      digestId: 'digest-ava-teacher-2026-w23',
      studentId: 'student-ava',
      outcomeStatus: 'VERIFIED',
      impactBand: 'POSITIVE',
      parentVisible: false,
      outcomeAt: '2026-06-06T10:30:00.000Z',
      nextReviewAt: '2026-06-07T10:00:00.000Z',
      sourceDailyPlanId: 'plan-ava-a1-day-02',
      sourceAiTutorSupportRecommendationId: 'ai-support-ava-privacy-reminder',
      sourceAchievementRecordId: 'achievement-ava-colors-practice',
      sourceAiTutorTeacherReviewItemId: 'ai-review-ava-personal-data',
      evidenceSummary:
        'Teacher Mai verified the privacy reminder and colors achievement evidence before the final family preview check.',
      outcomeSummary:
        'Ava teacher follow-up is verified; only the final family milestone remains before parent-ready certificate messaging.',
      fixtureOutcomeSource: 'fixture_followup_action_outcome_report',
    },
    {
      id: 'followup-outcome-minh-teacher-recovery-plan',
      weeklyDigestActionId: 'digest-action-minh-teacher-recovery-plan',
      digestId: 'digest-minh-parent-2026-w23',
      studentId: 'student-minh',
      outcomeStatus: 'SCHEDULED',
      impactBand: 'NEEDS_SUPPORT',
      parentVisible: false,
      nextReviewAt: '2026-06-07T11:00:00.000Z',
      sourceDailyPlanId: 'plan-minh-a1-day-02',
      sourceAiTutorSupportRecommendationId: 'ai-support-minh-colors-redirect',
      sourceAchievementRecordId: 'achievement-minh-greetings-catchup',
      sourceAiTutorTeacherReviewItemId: 'ai-review-minh-off-topic-game',
      evidenceSummary:
        'Teacher recovery plan is scheduled from the blocked colors daily plan, open AI tutor review, and Minh greetings catch-up evidence.',
      outcomeSummary:
        'Minh still needs a teacher-written recovery checklist before the parent digest can become parent-visible.',
      fixtureOutcomeSource: 'fixture_followup_action_outcome_report',
    },
    {
      id: 'followup-outcome-minh-parent-practice-window',
      weeklyDigestActionId: 'digest-action-minh-parent-practice-window',
      digestId: 'digest-minh-parent-2026-w23',
      studentId: 'student-minh',
      outcomeStatus: 'MONITORING',
      impactBand: 'NEEDS_SUPPORT',
      parentVisible: false,
      nextReviewAt: '2026-06-07T13:00:00.000Z',
      sourceDailyPlanId: 'plan-minh-a1-day-02',
      sourceAiTutorSupportRecommendationId: 'ai-support-minh-colors-redirect',
      sourceAiTutorParentSummaryId: 'ai-parent-summary-minh-colors',
      evidenceSummary:
        'Parent practice window is recorded as pending because colors practice remains blocked and the parent summary is held for teacher review.',
      outcomeSummary:
        'Keep Minh parent-facing details held until teacher review adds the recovery note.',
      fixtureOutcomeSource: 'fixture_followup_action_outcome_report',
    },
    {
      id: 'followup-outcome-linh-parent-celebrate',
      weeklyDigestActionId: 'digest-action-linh-parent-celebrate',
      digestId: 'digest-linh-parent-2026-w21',
      studentId: 'student-linh',
      outcomeStatus: 'COMPLETED',
      impactBand: 'POSITIVE',
      parentVisible: true,
      outcomeAt: '2026-05-24T11:30:00.000Z',
      sourceDailyPlanId: 'plan-linh-phonics-day-02',
      sourceAchievementRecordId: 'achievement-linh-short-e-course-complete',
      sourceAiTutorParentSummaryId: 'ai-parent-summary-linh-phonics',
      evidenceSummary:
        'Linh parent celebration completed after the phonics course completion achievement and allowed tutor parent summary.',
      outcomeSummary:
        'Linh has a completed positive outcome and remains ready for parent-facing celebration evidence.',
      fixtureOutcomeSource: 'fixture_followup_action_outcome_report',
    },
    {
      id: 'followup-outcome-khoa-teacher-hold',
      weeklyDigestActionId: 'digest-action-khoa-teacher-hold',
      digestId: 'digest-khoa-teacher-2026-w23',
      studentId: 'student-khoa',
      outcomeStatus: 'HELD',
      impactBand: 'NO_SEND',
      parentVisible: false,
      outcomeAt: '2026-06-01T15:15:00.000Z',
      sourceDailyPlanId: 'plan-khoa-a1-day-01',
      sourceAiTutorSupportRecommendationId:
        'ai-support-khoa-access-parent-check',
      sourceAchievementRecordId: 'achievement-khoa-prewithdrawal-greetings',
      sourceAiTutorTeacherReviewItemId: 'ai-review-khoa-account-access',
      evidenceSummary:
        'Teacher held Khoa follow-up because the enrollment is withdrawn, access remains blocked, and no parent digest should be sent.',
      outcomeSummary:
        'Khoa remains teacher-only with no parent send or live learning mutation from fixture evidence.',
      fixtureOutcomeSource: 'fixture_followup_action_outcome_report',
    },
  ],
  remedialRetryCompletions: [
    {
      id: 'remedial-retry-completion-minh-colors-2026-06-07',
      studentId: 'student-minh',
      supportPlanId:
        'support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
      remedialAssignmentId:
        'remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
      remedialDailyPlanId: 'plan-minh-a1-day-02',
      remedialPracticeAttemptId: 'practice-minh-a1-day-02',
      retryStatus: 'COMPLETED',
      completedAt: '2026-06-07T11:20:00.000Z',
      completionPercent: 100,
      scorePercent: 82,
      supportOutcomeId: 'support-outcome-minh-colors-retry-improved',
      supportOutcomeStatus: 'IMPROVED',
      outcomeAt: '2026-06-07T11:30:00.000Z',
      parentFollowupSummaryId: 'parent-followup-summary-minh-colors-retry',
      teacherFollowupSummaryId: 'teacher-followup-summary-minh-colors-retry',
      parentVisible: true,
      teacherVisible: true,
      safeNextActionLabel:
        'Keep the parent practice window and monitor the next colors plan.',
      evidenceSummary:
        'Minh completed the fixture colors remedial retry with 100% completion and an 82% score after Teacher Mai review.',
      outcomeSummary:
        'Support outcome improved; Minh can continue the colors plan with parent-visible encouragement and teacher monitoring.',
      parentFollowupSummary:
        'Minh finished the colors retry in the local demo and should keep one short parent practice window before the next lesson.',
      teacherFollowupSummary:
        'Teacher Mai should review Minh once after the next colors plan and keep the parent wording encouragement-focused.',
      fixtureRetrySource: 'fixture_remedial_retry_completion_support_outcome',
    },
  ],
  remedialRetryUnresolvedEscalations: [
    {
      id: 'remedial-retry-unresolved-minh-colors-2026-06-08',
      studentId: 'student-minh',
      supportPlanId:
        'support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
      remedialAssignmentId:
        'remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
      remedialDailyPlanId: 'plan-minh-a1-day-02',
      remedialPracticeAttemptId: 'practice-minh-a1-day-02',
      retryStatus: 'INCOMPLETE',
      attemptedAt: '2026-06-08T11:20:00.000Z',
      completionPercent: 45,
      scorePercent: 58,
      unresolvedOutcomeId: 'unresolved-support-outcome-minh-colors-retry',
      unresolvedOutcomeStatus: 'UNRESOLVED',
      reasonCode: 'RETRY_INCOMPLETE',
      outcomeAt: '2026-06-08T11:30:00.000Z',
      teacherEscalationId: 'teacher-escalation-minh-colors-retry',
      teacherEscalationStatus: 'SCHEDULED',
      supportAdjustmentId: 'support-adjustment-minh-colors-retry',
      supportAdjustmentStatus: 'ADJUSTED',
      parentEscalationSummaryId: 'parent-escalation-summary-minh-colors-retry',
      teacherEscalationNextActionId:
        'teacher-escalation-next-action-minh-colors-retry',
      parentVisible: true,
      teacherVisible: true,
      safeNextActionLabel:
        'Schedule a teacher-led micro-review before any parent-facing next retry.',
      evidenceSummary:
        'Minh started the fixture colors retry but stopped at 45% completion and a 58% practice score, so the support outcome remains unresolved.',
      unresolvedOutcomeSummary:
        'The retry is incomplete; Teacher Mai should adjust the support plan and keep parent messaging escalation-focused but non-alarming.',
      teacherEscalationSummary:
        'Teacher Mai schedules a micro-review and checks the blocked colors practice evidence before assigning another retry.',
      supportAdjustmentSummary:
        'Support adjustment narrows the colors task to one vocabulary group and keeps the practice window parent-supported.',
      parentEscalationSummary:
        'Minh needs one short teacher-guided colors review before the next parent-supported retry window.',
      teacherNextActionSummary:
        'Teacher Mai reviews the colors retry evidence, confirms the reduced task, and records fixture-only next action evidence.',
      fixtureRetrySource:
        'fixture_remedial_retry_unresolved_support_escalation',
    },
  ],
  teacherEscalationFollowupResolutions: [
    {
      id: 'teacher-escalation-followup-resolution-minh-colors-2026-06-09',
      studentId: 'student-minh',
      unresolvedRetryAttemptId:
        'remedial-retry-unresolved-minh-colors-2026-06-08',
      unresolvedOutcomeId: 'unresolved-support-outcome-minh-colors-retry',
      teacherEscalationId: 'teacher-escalation-minh-colors-retry',
      supportAdjustmentId: 'support-adjustment-minh-colors-retry',
      teacherReviewedEscalationId:
        'teacher-reviewed-escalation-minh-colors-retry',
      teacherReviewedEscalationStatus: 'REVIEWED',
      teacherReviewedAt: '2026-06-09T09:00:00.000Z',
      adjustedSupportRetryCompletionId:
        'adjusted-support-retry-completion-minh-colors-2026-06-09',
      adjustedSupportRetryStatus: 'COMPLETED',
      completedAt: '2026-06-09T11:15:00.000Z',
      completionPercent: 100,
      scorePercent: 88,
      resolvedSupportOutcomeId:
        'resolved-support-outcome-minh-colors-adjusted-retry',
      resolvedSupportOutcomeStatus: 'RESOLVED',
      resolvedOutcomeReasonCode: 'ADJUSTED_RETRY_COMPLETED',
      resolvedOutcomeAt: '2026-06-09T11:25:00.000Z',
      parentClosureSummaryId:
        'parent-closure-summary-minh-colors-adjusted-retry',
      teacherClosureNoteId: 'teacher-closure-note-minh-colors-adjusted-retry',
      parentVisible: true,
      teacherVisible: true,
      safeNextActionLabel:
        'Close the escalation and keep one light parent-supported colors review.',
      evidenceSummary:
        'Teacher Mai reviewed Minh unresolved colors escalation, confirmed the adjusted support plan, and Minh completed the reduced retry with 100% completion and an 88% score.',
      teacherReviewSummary:
        'Teacher Mai reviewed the unresolved retry evidence and confirmed the support adjustment before the reduced colors retry.',
      adjustedRetryCompletionSummary:
        'Minh completed the adjusted colors retry after the teacher review using the narrowed vocabulary group.',
      resolvedOutcomeSummary:
        'The support outcome is resolved because the adjusted retry reached completion and exceeded the fixture score threshold.',
      parentClosureSummary:
        'Minh completed the teacher-adjusted colors retry; the parent only needs to keep one light review window.',
      teacherClosureNoteSummary:
        'Close the escalation in local-demo evidence and monitor the next colors plan without adding another remedial retry.',
      fixtureResolutionSource:
        'fixture_teacher_escalation_followup_resolution_report',
    },
  ],
};
