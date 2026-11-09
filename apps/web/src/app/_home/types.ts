export type Role =
  | "STUDENT"
  | "PARENT"
  | "TEACHER"
  | "CONTENT_EDITOR"
  | "ADMIN"
  | "DIRECTOR"
  | "SUPPORT"
  | "SALE"
  | "AGENCY_OWNER"
  | "AGENCY_MANAGER"
  | "OPERATIONS";

type Metric = {
  label: string;
  value: string;
  delta: string;
};

export type DashboardPayload = {
  role: Role;
  title: string;
  metrics: Metric[];
  actions: string[];
  user: {
    id: string;
    email: string;
    displayName?: string;
    roles: Role[];
    status?: string;
  };
};

export type Session = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    roles: Role[];
  };
};

export type ContentTagKind =
  "TOPIC" | "AUDIENCE" | "LEVEL" | "SKILL" | "FORMAT" | "INTENT" | "CUSTOM";

export type ContentTag = {
  id: string;
  slug: string;
  name: string;
  kind: ContentTagKind;
  description?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    lessons: number;
  };
};

export type LearningUsageStatus = {
  usageDate: string;
  deviceType: "PHONE" | "TABLET" | "COMPUTER" | "UNKNOWN";
  isLimited: boolean;
  limitMinutes: number | null;
  baseLimitMinutes?: number | null;
  grantedExtraMinutes?: number;
  usedSeconds: number;
  usedMinutes: number;
  remainingSeconds: number | null;
  remainingMinutes: number | null;
  isWarning: boolean;
  limitReached: boolean;
  byDevice: Array<{
    deviceType: "PHONE" | "TABLET" | "COMPUTER" | "UNKNOWN";
    usedSeconds: number;
    usedMinutes: number;
  }>;
};

type LearningHomeLesson = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  durationSec: number;
  estimateMinutes: number;
  courseTitle: string;
  courseSlug: string;
  unitTitle: string;
  levelCode: string;
  hasPractice: boolean;
  video: {
    id: string;
    title?: string;
    provider: "INTERNAL" | "YOUTUBE" | "EXTERNAL";
    sourceUrl?: string;
    embedUrl?: string;
    thumbnailUrl?: string;
    durationSec?: number;
  } | null;
  progress: {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    score?: number | null;
    lastPositionSec: number;
    watchCount: number;
    lastWatchedAt?: string | null;
    isFavorite: boolean;
    progressPercent: number;
  };
};

type LearningDailyPlanItemType =
  | "VIDEO"
  | "PRACTICE"
  | "NEXT_LESSON"
  | "REST"
  | "REVIEW"
  | "AI_CONVERSATION"
  | "REWARD";

export type LearningDailyPlanItemStatus =
  "READY" | "STARTED" | "COMPLETED" | "SKIPPED" | "LOCKED";

type LearningDailyPlanEvidenceSummary = {
  type: "VIDEO_EXPOSURE" | "ACTIVITY_ATTEMPT" | string;
  watchPercent?: number;
  minWatchPercent?: number;
  percent?: number;
  minScore?: number | null;
  score?: number | null;
  maxScore?: number | null;
  passed?: boolean;
  evidenceId?: string | null;
  attemptId?: string | null;
};

export type LearningPersistentDailyPlanItem = {
  id: string;
  planId: string;
  sequence: number;
  itemType: LearningDailyPlanItemType;
  lessonId: string | null;
  activityId: string | null;
  required: boolean;
  status: LearningDailyPlanItemStatus;
  minWatchPercent?: number | null;
  minScore?: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
  lesson?: {
    id: string;
    slug?: string;
    title: string;
    description?: string | null;
    durationSec?: number | null;
  } | null;
  activity?: {
    id: string;
    title: string;
    type?: string;
  } | null;
  evidenceSummary?: LearningDailyPlanEvidenceSummary | null;
  blockedReason?: string | null;
};

export type LearningPersistentDailyPlan = {
  plan: {
    id: string;
    childProfileId: string;
    planDate: string;
    status: "DRAFT" | "ACTIVE" | "COMPLETED" | "SKIPPED" | "EXPIRED";
    targetMinutes: number;
  } | null;
  planDate: string;
  timezone: string;
  generated: boolean;
  contentSource: {
    mode: "ASSIGNED_PATH" | "UNASSIGNED_FALLBACK";
    reason?: string;
    contentPackageTitle?: string | null;
    learningPathTitle?: string | null;
  };
  items: LearningPersistentDailyPlanItem[];
};

export type ActiveVideoPlanContext = {
  kind: "VIDEO";
  lessonId: string;
  itemId?: string;
  planId?: string;
  watchPercent?: number;
  minWatchPercent?: number;
  passed?: boolean;
  blockedReason?: string | null;
};

export type ActivePracticePlanContext = {
  kind: "PRACTICE";
  lessonId: string;
  activityId?: string | null;
  itemId?: string;
  planId?: string;
  status?: LearningDailyPlanItemStatus;
  percent?: number;
  minScore?: number | null;
  score?: number | null;
  maxScore?: number | null;
  passed?: boolean;
  blockedReason?: string | null;
  attemptId?: string | null;
};

export type ActiveLearningPlanContext =
  ActiveVideoPlanContext | ActivePracticePlanContext;

export type PracticeDailyPlanRefresh = {
  home: LearningHomePayload;
  item: LearningPersistentDailyPlanItem | null;
  context: ActivePracticePlanContext | null;
};

export type LearningHomePayload = {
  deviceUsage: LearningUsageStatus;
  contentSource?: LearningPersistentDailyPlan["contentSource"];
  continueLesson: LearningHomeLesson | null;
  streak: number;
  dailyPlan: Array<{
    id: string;
    type: LearningDailyPlanItemType;
    title: string;
    description: string;
    lessonId: string | null;
    estimateMinutes: number;
    status: LearningDailyPlanItemStatus;
  }>;
  persistentDailyPlan?: LearningPersistentDailyPlan;
  summary: {
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    weeklyStudyMinutes: number;
  };
};

export type ParentChild = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  subscription: {
    status: string;
    currentPeriodEnd: string;
  } | null;
  screenTime: {
    isEnabled: boolean;
    dailyLimitMinutes: number;
    sessionLimitMinutes: number;
    breakMinutes: number;
    updatedAt?: string | null;
  };
  deviceUsage: LearningUsageStatus;
  progress: {
    completedLessons: number;
    inProgressLessons: number;
    watchedLessons: number;
    totalWatchCount: number;
    weeklyStudyMinutes: number;
    completionRate: number;
  };
  insight: {
    status: "LIMIT_REACHED" | "PRACTICE_READY" | "IN_PROGRESS" | "NO_ACTIVITY";
    title: string;
    description: string;
    recommendedAction: string;
    currentLesson: {
      id: string;
      title: string;
      progressPercent: number;
      hasPractice: boolean;
      lastWatchedAt?: string | null;
    } | null;
  };
};

export type ParentChildrenPayload = {
  children: ParentChild[];
};

export type ActivationOrderStatus =
  | "WAITING_PAYMENT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | "REVOKED";

export type ActivationOrder = {
  id: string;
  status: ActivationOrderStatus;
  source: "SALE_ASSISTED" | "SELF_SERVICE";
  customerEmail: string;
  customerPhone?: string;
  amountCents: number;
  currency: string;
  packageCode?: string;
  packageName?: string;
  requestedDurationDays?: number;
  durationDays?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  transferContent?: string;
  saleInvoiceUrl?: string;
  operationInvoiceUrl?: string;
  notes?: string;
  reviewNotes?: string;
  activatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    status: string;
    profile?: {
      displayName?: string;
    };
  };
  createdBy?: {
    email: string;
  };
  reviewedBy?: {
    email: string;
  };
  revokedAt?: string;
  revokeReason?: string;
  revokedById?: string;
  agency?: {
    id: string;
    code: string;
    name: string;
    defaultRateBps: number;
  };
  channelParticipant?: ChannelParticipantSummary;
  commissionEarnings?: CommissionEarning[];
};

export type ActivationPackage = {
  code: string;
  name: string;
  amountVnd: number;
  durationDays: number;
};

export type BankTransferInfo = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  notePrefix: string;
};

export type SelfServiceOptions = {
  packages: ActivationPackage[];
  bankTransfer: BankTransferInfo;
};

export type CommissionEarning = {
  id: string;
  participant?: ChannelParticipantSummary;
  beneficiaryType: "SALE" | "AGENCY";
  baseAmountCents: number;
  rateBps: number;
  amountCents: number;
  currency: string;
  status: "PENDING" | "AVAILABLE" | "CANCELED";
  createdAt: string;
  activationOrder?: {
    customerEmail: string;
    source: "SALE_ASSISTED" | "SELF_SERVICE";
    amountCents: number;
    currency: string;
  };
  beneficiaryAgency?: {
    code: string;
    name: string;
  };
};

export type ChannelParticipantSummary = {
  id: string;
  type: "SALE" | "AGENCY";
  code: string;
  displayName: string;
  status?: "ACTIVE" | "SUSPENDED";
  baseSalaryCents?: number;
  commissionRateBps?: number;
};

// ---------------------------------------------------------------------------
// ParentPortal — tabbed portal wrapping all parent panels
// ---------------------------------------------------------------------------
export type ParentTab =
  | "children"
  | "learning"
  | "learningPath"
  | "billing"
  | "reports"
  | "family"
  | "profile";
