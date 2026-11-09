import type {
  DemoLearningAchievementRecord,
  DemoLearningAiTutorSupportRecommendation,
  DemoLearningAttendanceRecord,
  DemoLearningAttendanceStatus,
  DemoLearningClassCohort,
  DemoLearningContentOwner,
  DemoLearningCourse,
  DemoLearningDailyPlan,
  DemoLearningDailyPlanStatus,
  DemoLearningEnrollment,
  DemoLearningPath,
  DemoLearningPracticeAttempt,
  DemoLearningLesson,
  DemoLearningPayment,
  DemoLearningParentGuardian,
  DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
  DemoLearningScreenTimePolicy,
  DemoLearningStudent,
  DemoLearningSubmission,
  DemoLearningSubmissionStatus,
  DemoLearningSubscription,
  DemoLearningProgressRecord,
  DemoLearningVideoEvidence,
  DemoLearningVideoEvidenceStatus,
  DemoLearningWeeklyDigest,
  DemoLearningWeeklyDigestActionOwner,
  DemoLearningWeeklyDigestActionPriority,
} from '../learning-local-demo.types';

export const submissionStatuses = [
  'SUBMITTED',
  'LATE',
  'MISSING',
  'RESUBMITTED',
] as const;

export const attendanceStatuses = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
] as const;

export const progressStatuses = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'NEEDS_SUPPORT',
  'COMPLETED',
  'WITHDRAWN',
] as const;

export const dailyPlanStatuses = [
  'COMPLETED',
  'IN_PROGRESS',
  'BLOCKED',
  'SKIPPED',
  'ASSIGNED',
] as const;

export const videoEvidenceStatuses = [
  'COMPLETED',
  'INCOMPLETE',
  'SKIPPED',
] as const;

export const practiceAttemptStatuses = [
  'PASSED',
  'NEEDS_RETRY',
  'INCOMPLETE',
  'SKIPPED',
] as const;

export const screenTimePolicyStatuses = [
  'ACTIVE',
  'PAUSED',
  'DISABLED',
] as const;

export const sessionGateDecisions = [
  'ALLOWED',
  'BLOCKED',
  'OVERRIDE_ALLOWED',
] as const;

export const dailyPlanGuardAccessResults: readonly DemoLearningParentScreenTimeDailyPlanGuardAccessResult[] =
  ['ALLOWED_SESSION', 'BLOCKED_SESSION'];

export const screenTimeGrantDecisions = [
  'APPROVED',
  'DENIED',
  'PENDING',
] as const;

export const weeklyDigestActionPriorities: readonly DemoLearningWeeklyDigestActionPriority[] =
  ['LOW', 'MEDIUM', 'HIGH'];

export const weeklyDigestActionOwners: readonly DemoLearningWeeklyDigestActionOwner[] =
  ['PARENT', 'TEACHER'];

export function countAttendanceStatuses(
  records: DemoLearningAttendanceRecord[],
): Record<DemoLearningAttendanceStatus, number> {
  return countByStatus(attendanceStatuses, records, (record) => record.status);
}

export function countSubmissionStatuses(
  records: DemoLearningSubmission[],
): Record<DemoLearningSubmissionStatus, number> {
  return countByStatus(submissionStatuses, records, (record) => record.status);
}

export function countDailyPlanStatuses(
  records: DemoLearningDailyPlan[],
): Record<DemoLearningDailyPlanStatus, number> {
  return countByStatus(dailyPlanStatuses, records, (record) => record.status);
}

export function countVideoEvidenceStatuses(
  records: DemoLearningVideoEvidence[],
): Record<DemoLearningVideoEvidenceStatus, number> {
  return countByStatus(
    videoEvidenceStatuses,
    records,
    (record) => record.status,
  );
}

export function averagePracticeScorePercent(
  records: DemoLearningPracticeAttempt[],
) {
  const scores = records
    .map((record) => record.scorePercent)
    .filter((score): score is number => score !== undefined);

  return averagePercent(scores);
}

export function countByStatus<TStatus extends string, TItem>(
  statuses: readonly TStatus[],
  items: TItem[],
  statusFor: (item: TItem) => TStatus,
) {
  const counts = Object.fromEntries(
    statuses.map((status) => [status, 0]),
  ) as Record<TStatus, number>;

  for (const item of items) {
    counts[statusFor(item)] += 1;
  }

  return counts;
}

export function percent(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

export function averagePercent(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

export function groupBy<TItem>(
  items: TItem[],
  keyFor: (item: TItem) => string,
): Map<string, TItem[]> {
  const groups = new Map<string, TItem[]>();

  for (const item of items) {
    const key = keyFor(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  return groups;
}

export function requireEnrollment(
  enrollmentsById: Map<string, DemoLearningEnrollment>,
  enrollmentId: string,
) {
  const enrollment = enrollmentsById.get(enrollmentId);
  if (!enrollment) {
    throw new Error(`Missing local demo enrollment for ${enrollmentId}`);
  }

  return enrollment;
}

export function requireStudent(
  studentsById: Map<string, DemoLearningStudent>,
  enrollment: DemoLearningEnrollment,
) {
  const student = studentsById.get(enrollment.studentId);
  if (!student) {
    throw new Error(`Missing local demo student for ${enrollment.studentId}`);
  }

  return student;
}

export function requireStudentById(
  studentsById: Map<string, DemoLearningStudent>,
  studentId: string,
) {
  const student = studentsById.get(studentId);
  if (!student) {
    throw new Error(`Missing local demo student for ${studentId}`);
  }

  return student;
}

export function requireCourse(
  coursesById: Map<string, DemoLearningCourse>,
  enrollment: DemoLearningEnrollment,
) {
  const course = coursesById.get(enrollment.courseId);
  if (!course) {
    throw new Error(`Missing local demo course for ${enrollment.courseId}`);
  }

  return course;
}

export function requireCourseById(
  coursesById: Map<string, DemoLearningCourse>,
  courseId: string,
) {
  const course = coursesById.get(courseId);
  if (!course) {
    throw new Error(`Missing local demo course for ${courseId}`);
  }

  return course;
}

export function requireClass(
  classesById: Map<string, DemoLearningClassCohort>,
  classId: string,
) {
  const classCohort = classesById.get(classId);
  if (!classCohort) {
    throw new Error(`Missing local demo class for ${classId}`);
  }

  return classCohort;
}

export function requireLesson(
  lessonsById: Map<string, DemoLearningLesson>,
  lessonId: string,
) {
  const lesson = lessonsById.get(lessonId);
  if (!lesson) {
    throw new Error(`Missing local demo lesson for ${lessonId}`);
  }

  return lesson;
}

export function requireLearningPath(
  pathsById: Map<string, DemoLearningPath>,
  pathId: string,
) {
  const learningPath = pathsById.get(pathId);
  if (!learningPath) {
    throw new Error(`Missing local demo learning path for ${pathId}`);
  }

  return learningPath;
}

export function requireDailyPlan(
  dailyPlansById: Map<string, DemoLearningDailyPlan>,
  dailyPlanId: string,
) {
  const dailyPlan = dailyPlansById.get(dailyPlanId);
  if (!dailyPlan) {
    throw new Error(`Missing local demo daily plan for ${dailyPlanId}`);
  }

  return dailyPlan;
}

export function requireScreenTimePolicy(
  policiesById: Map<string, DemoLearningScreenTimePolicy>,
  policyId: string,
) {
  const policy = policiesById.get(policyId);
  if (!policy) {
    throw new Error(`Missing local demo screen-time policy for ${policyId}`);
  }

  return policy;
}

export function requireGuardian(
  guardiansById: Map<string, DemoLearningParentGuardian>,
  guardianId: string,
) {
  const guardian = guardiansById.get(guardianId);
  if (!guardian) {
    throw new Error(`Missing local demo parent guardian for ${guardianId}`);
  }

  return guardian;
}

export function requireGuardianByChildProfileId(
  guardiansByChildProfileId: Map<string, DemoLearningParentGuardian>,
  childProfileId: string,
) {
  const guardian = guardiansByChildProfileId.get(childProfileId);
  if (!guardian) {
    throw new Error(
      `Missing local demo parent guardian for child ${childProfileId}`,
    );
  }

  return guardian;
}

export function requireProgress(
  progressByEnrollmentId: Map<string, DemoLearningProgressRecord>,
  enrollmentId: string,
) {
  const progress = progressByEnrollmentId.get(enrollmentId);
  if (!progress) {
    throw new Error(`Missing local demo progress record for ${enrollmentId}`);
  }

  return progress;
}

export function requireVideoEvidence(
  videoEvidenceByDailyPlanId: Map<string, DemoLearningVideoEvidence>,
  dailyPlanId: string,
) {
  const videoEvidence = videoEvidenceByDailyPlanId.get(dailyPlanId);
  if (!videoEvidence) {
    throw new Error(
      `Missing local demo video evidence for daily plan ${dailyPlanId}`,
    );
  }

  return videoEvidence;
}

export function requirePracticeAttempt(
  practiceAttemptByDailyPlanId: Map<string, DemoLearningPracticeAttempt>,
  dailyPlanId: string,
) {
  const practiceAttempt = practiceAttemptByDailyPlanId.get(dailyPlanId);
  if (!practiceAttempt) {
    throw new Error(
      `Missing local demo practice attempt for daily plan ${dailyPlanId}`,
    );
  }

  return practiceAttempt;
}

export function requireContentOwner(
  ownersById: Map<string, DemoLearningContentOwner>,
  ownerId: string,
) {
  const owner = ownersById.get(ownerId);
  if (!owner) {
    throw new Error(`Missing local demo content owner for ${ownerId}`);
  }

  return owner;
}

export function requireAiTutorSupportRecommendation(
  supportRecommendationsById: Map<
    string,
    DemoLearningAiTutorSupportRecommendation
  >,
  supportRecommendationId: string,
) {
  const supportRecommendation = supportRecommendationsById.get(
    supportRecommendationId,
  );
  if (!supportRecommendation) {
    throw new Error(
      `Missing local demo AI tutor support recommendation for ${supportRecommendationId}`,
    );
  }

  return supportRecommendation;
}

export function requireAchievementRecord(
  achievementRecordsById: Map<string, DemoLearningAchievementRecord>,
  achievementRecordId: string,
) {
  const achievementRecord = achievementRecordsById.get(achievementRecordId);
  if (!achievementRecord) {
    throw new Error(
      `Missing local demo achievement record for ${achievementRecordId}`,
    );
  }

  return achievementRecord;
}

export function requireWeeklyDigest(
  weeklyDigestsById: Map<string, DemoLearningWeeklyDigest>,
  weeklyDigestId: string,
) {
  const weeklyDigest = weeklyDigestsById.get(weeklyDigestId);
  if (!weeklyDigest) {
    throw new Error(`Missing local demo weekly digest for ${weeklyDigestId}`);
  }

  return weeklyDigest;
}

export function requireSubscription(
  subscriptionsByEnrollmentId: Map<string, DemoLearningSubscription>,
  enrollment: DemoLearningEnrollment,
) {
  const subscription = subscriptionsByEnrollmentId.get(enrollment.id);
  if (!subscription) {
    throw new Error(`Missing local demo subscription for ${enrollment.id}`);
  }

  return subscription;
}

export function requirePayment(
  paymentsBySubscriptionId: Map<string, DemoLearningPayment>,
  subscription: DemoLearningSubscription,
) {
  const payment = paymentsBySubscriptionId.get(subscription.id);
  if (!payment) {
    throw new Error(`Missing local demo payment for ${subscription.id}`);
  }

  return payment;
}
