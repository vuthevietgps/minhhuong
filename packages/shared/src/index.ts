export type LearningLevelCode =
  | "STARTER"
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "IELTS_FOUNDATION";

export type SubscriptionPlanCode = "FREE" | "BASIC" | "PREMIUM" | "PREMIUM_AI";

export type EntitlementStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAUSED";

export type UserRole = "DIRECTOR" | "ADMIN" | "TEACHER" | "SUPPORT" | "LEARNER";

export type ActivityType =
  | "QUIZ"
  | "VOCAB_GAME"
  | "LISTENING"
  | "SPEAKING"
  | "WRITING"
  | "AI_CHAT";

export type LessonPublishStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "PUBLISHED"
  | "ARCHIVED";

export interface LessonSummary {
  id: string;
  title: string;
  levelCode: LearningLevelCode;
  durationMinutes: number;
  isLocked: boolean;
  progressPercent: number;
}

export interface LearnerDashboardSnapshot {
  learnerName: string;
  currentLevel: LearningLevelCode;
  activePlan: SubscriptionPlanCode;
  streakDays: number;
  weeklyGoalMinutes: number;
  lessons: LessonSummary[];
}

export interface ApiEnvelope<T> {
  data: T;
  requestId?: string;
}

export interface EntitlementSnapshot {
  status: EntitlementStatus;
  planCode: SubscriptionPlanCode;
  startsAt: string;
  endsAt: string;
  aiMessagesRemaining: number;
}

export interface AdminContentNode {
  id: string;
  title: string;
  status: LessonPublishStatus;
  childrenCount: number;
  updatedAt: string;
}
