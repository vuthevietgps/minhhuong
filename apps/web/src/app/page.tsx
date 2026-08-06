"use client";

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CirclePlay,
  ClipboardCheck,
  ClipboardList,
  Crown,
  FileVideo,
  Flame,
  Gamepad2,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  LockKeyhole,
  LogIn,
  LogOut,
  PenTool,
  Play,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  Video,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearStoredSession,
  readStoredSession,
  storeSession,
} from "./session-storage";
import { adminLandingForRoles } from "./admin/_lib/admin-session";

type Role =
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

type DashboardPayload = {
  role: Role;
  title: string;
  metrics: Metric[];
  actions: string[];
  user: {
    id: string;
    email: string;
    displayName?: string;
    roles: Role[];
  };
};

type Session = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    roles: Role[];
  };
};

type LearningProfilePayload = {
  childProfile: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
};

type DemoAccount = {
  role: Role;
  label: string;
  email: string;
  icon: LucideIcon;
};

type AdminVideo = {
  id: string;
  title?: string;
  provider: "INTERNAL" | "YOUTUBE" | "EXTERNAL";
  processingStatus: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  sourceUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
};

type ContentTagKind =
  "TOPIC" | "AUDIENCE" | "LEVEL" | "SKILL" | "FORMAT" | "INTENT" | "CUSTOM";

type ContentTag = {
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

type AdminLesson = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  videos: AdminVideo[];
  activities: AdminActivity[];
  tags?: Array<{
    tag: ContentTag;
  }>;
  unit?: {
    title: string;
    course?: {
      title: string;
      level?: {
        code: string;
      };
    };
  };
};

type AdminAnswer = {
  id: string;
  text: string;
  isCorrect?: boolean;
  sortOrder: number;
};

type AdminQuestion = {
  id: string;
  type:
    | "SINGLE_CHOICE"
    | "MULTIPLE_CHOICE"
    | "TEXT_INPUT"
    | "ORDERING"
    | "SPEAKING";
  prompt: string;
  explanation?: string;
  points: number;
  answers: AdminAnswer[];
};

type AdminActivity = {
  id: string;
  title: string;
  description?: string;
  type:
    "QUIZ" | "VOCAB_GAME" | "LISTENING" | "SPEAKING" | "WRITING" | "AI_CHAT";
  questions: AdminQuestion[];
};

type AdminUnit = {
  id: string;
  title: string;
  lessons: AdminLesson[];
};

type PracticeLesson = {
  id: string;
  title: string;
  activities: Array<{
    id: string;
    title: string;
    description?: string;
    type: string;
    questions: Array<{
      id: string;
      type:
        | "SINGLE_CHOICE"
        | "MULTIPLE_CHOICE"
        | "TEXT_INPUT"
        | "ORDERING"
        | "SPEAKING";
      prompt: string;
      points: number;
      metadata?: Record<string, unknown> | null;
      answers: Array<{
        id: string;
        text: string;
      }>;
    }>;
  }>;
};

type PracticeQuestion =
  PracticeLesson["activities"][number]["questions"][number];

type VideoFeedLesson = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  durationSec?: number;
  hasPractice: boolean;
  videos: Array<{
    id: string;
    title?: string;
    provider: "INTERNAL" | "YOUTUBE" | "EXTERNAL";
    sourceUrl?: string;
    embedUrl?: string;
    thumbnailUrl?: string;
    durationSec?: number;
  }>;
  tags: ContentTag[];
  progress: {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    lastPositionSec: number;
    watchCount: number;
    lastWatchedAt?: string | null;
    isFavorite: boolean;
  };
};

type LearningUsageStatus = {
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

type LearningDailyPlanItemStatus =
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

type LearningPersistentDailyPlanItem = {
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

type LearningPersistentDailyPlan = {
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

type VideoWatchEvidence = {
  evidenceId?: string | null;
  videoAssetId?: string | null;
  eventType?: string | null;
  positionSec: number;
  durationWatchedSec: number;
  watchPercent: number;
  minWatchPercent: number;
  passed: boolean;
  durationSec?: number | null;
  createdAt?: string | null;
};

type ActiveVideoPlanContext = {
  kind: "VIDEO";
  lessonId: string;
  itemId?: string;
  planId?: string;
  watchPercent?: number;
  minWatchPercent?: number;
  passed?: boolean;
  blockedReason?: string | null;
};

type ActivePracticePlanContext = {
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

type ActiveLearningPlanContext =
  ActiveVideoPlanContext | ActivePracticePlanContext;

type PracticeDailyPlanRefresh = {
  home: LearningHomePayload;
  item: LearningPersistentDailyPlanItem | null;
  context: ActivePracticePlanContext | null;
};

type LearningHomePayload = {
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

type VideoFeedPayload = {
  deviceUsage?: LearningUsageStatus;
  courses: Array<{
    id: string;
    slug: string;
    title: string;
    description?: string;
    level: {
      code: string;
      title: string;
    };
    units: Array<{
      id: string;
      title: string;
      description?: string;
      lessons: VideoFeedLesson[];
    }>;
  }>;
};

type ParentChild = {
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

type ParentChildrenPayload = {
  children: ParentChild[];
};

type ParentContentAssignment = {
  id: string;
  startedAt?: string;
  contentPackage: {
    id: string;
    code: string;
    title: string;
    status: string;
    learningPath: {
      id: string;
      code: string;
      title: string;
      status: string;
      items: Array<{
        id: string;
        sequence: number;
        lesson: {
          id: string;
          title: string;
          status: string;
        };
      }>;
    };
  };
} | null;

type AdminCourse = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  level: {
    code: string;
    title: string;
  };
  units: AdminUnit[];
};

type ContentOverview = {
  courses: number;
  lessons: number;
  videos: number;
  status: {
    drafts: number;
    inReview: number;
    published: number;
  };
};

type ActivationOrderStatus =
  | "WAITING_PAYMENT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | "REVOKED";

type ActivationOrder = {
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

type ActivationPackage = {
  code: string;
  name: string;
  amountVnd: number;
  durationDays: number;
};

type BankTransferInfo = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  notePrefix: string;
};

type SelfServiceOptions = {
  packages: ActivationPackage[];
  bankTransfer: BankTransferInfo;
};

type CommissionSummary = {
  availableCents: number;
  heldCents: number;
  currency: string;
};

type CommissionEarning = {
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

type PayoutRequest = {
  id: string;
  participant?: ChannelParticipantSummary;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAID" | "CANCELED";
  amountCents: number;
  currency: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  requestNotes?: string;
  reviewNotes?: string;
  payoutInvoiceUrl?: string;
  createdAt: string;
  paidAt?: string;
  beneficiaryUser?: {
    email: string;
    profile?: {
      displayName?: string;
    };
  };
  beneficiaryAgency?: {
    code: string;
    name: string;
  };
};

type ChannelFinanceOverview = {
  orders: number;
  approvedRevenueCents: number;
  approvedOrderCount: number;
  pendingPayoutCents: number;
  pendingPayoutCount: number;
  paidPayoutCents: number;
  paidPayoutCount: number;
  wallet: CommissionSummary;
};

type ChannelWallet = {
  summary: CommissionSummary;
  earnings: CommissionEarning[];
  payoutRequests: PayoutRequest[];
  participant?: {
    id: string;
    code: string;
    displayName: string;
    commissionRateBps?: number | null;
    baseSalaryCents?: number;
  } | null;
};

type ChannelParticipantSummary = {
  id: string;
  type: "SALE" | "AGENCY";
  code: string;
  displayName: string;
  status?: "ACTIVE" | "SUSPENDED";
  baseSalaryCents?: number;
  commissionRateBps?: number;
};

type MoneyBreakdown = Record<
  string,
  {
    count: number;
    amountCents: number;
  }
>;

type ChannelReport = {
  period: {
    from: string;
    to: string;
  };
  orderPipeline: {
    totalCount: number;
    totalAmountCents: number;
    byStatus: MoneyBreakdown;
    bySource: MoneyBreakdown;
  };
  approvedRevenue: {
    orderCount: number;
    amountCents: number;
    bySource: MoneyBreakdown;
  };
  commissions: {
    totalCount: number;
    totalAmountCents: number;
    saleAmountCents: number;
    agencyAmountCents: number;
  };
  payouts: {
    requestCount: number;
    requestedAmountCents: number;
    paidCount: number;
    paidAmountCents: number;
    byStatus: MoneyBreakdown;
  };
  topSales: Array<{
    participantId?: string;
    userId?: string;
    email: string;
    displayName?: string;
    orderCount: number;
    revenueCents: number;
    commissionCount: number;
    commissionCents: number;
  }>;
  topAgencies: Array<{
    participantId?: string;
    agencyId?: string;
    code: string;
    name: string;
    orderCount: number;
    revenueCents: number;
    commissionCount: number;
    commissionCents: number;
  }>;
  recentApprovedOrders: Array<{
    id: string;
    customerEmail: string;
    amountCents: number;
    currency: string;
    source: "SALE_ASSISTED" | "SELF_SERVICE";
    activatedAt?: string;
    expiresAt?: string;
    createdBy?: {
      email: string;
      profile?: {
        displayName?: string;
      };
    };
    agency?: {
      code: string;
      name: string;
    };
    channelParticipant?: ChannelParticipantSummary;
  }>;
  recentPayouts: Array<{
    id: string;
    status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAID" | "CANCELED";
    amountCents: number;
    currency: string;
    createdAt: string;
    paidAt?: string;
    beneficiaryUser?: {
      email: string;
      profile?: {
        displayName?: string;
      };
    };
    beneficiaryAgency?: {
      code: string;
      name: string;
    };
  }>;
};

type ChannelUser = {
  id: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  profile?: {
    displayName?: string;
  };
  roles: Array<{
    role: {
      name: Role;
    };
  }>;
  agencyMemberships: Array<{
    id: string;
    role: "OWNER" | "MANAGER" | "SALE";
    title?: string;
    rateBps?: number;
    referralCode?: string;
    isActive: boolean;
    agency: {
      id: string;
      code: string;
      name: string;
    };
  }>;
  channelParticipant?: ChannelParticipantSummary;
  subscriptions: Array<{
    status: string;
    currentPeriodEnd: string;
  }>;
};

type ChannelUserPage = {
  items: ChannelUser[];
  total: number;
  limit: number;
  nextCursor?: string | null;
};

type AgencyAdmin = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  defaultRateBps: number;
  channelParticipant?: ChannelParticipantSummary;
  notes?: string;
  members: Array<{
    id: string;
    role: "OWNER" | "MANAGER" | "SALE";
    title?: string;
    rateBps?: number;
    referralCode?: string;
    isActive: boolean;
    user: {
      id: string;
      email: string;
      status: string;
      profile?: {
        displayName?: string;
      };
    };
  }>;
  _count: {
    activationOrders: number;
    commissions: number;
    payoutRequests: number;
  };
};

type CommissionPolicyAdmin = {
  id: string;
  code: string;
  name: string;
  beneficiaryType: "SALE" | "AGENCY";
  rateBps: number;
  baseSalaryCents: number;
  isDefaultForSale: boolean;
  isDefaultForAgency: boolean;
  isActive: boolean;
};

type ChannelAdminSummary = {
  agencies: number;
  activeAgencies: number;
  saleUsers: number;
  activeMembers: number;
  policies: number;
  learners: number;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const demoPassword = "Demo@12345";

const apiErrorMessagesVi: Record<string, string> = {
  "Invalid or expired token": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  Unauthorized: "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.",
  Forbidden: "Bạn không có quyền thực hiện thao tác này.",
  "Access denied": "Bạn không có quyền truy cập.",
  "Not Found": "Không tìm thấy dữ liệu yêu cầu.",
  "Internal server error": "Máy chủ gặp lỗi. Vui lòng thử lại sau.",
};

function localizeApiError(message: string) {
  return apiErrorMessagesVi[message] ?? message;
}

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: unknown };
    if (Array.isArray(payload.message)) {
      return payload.message
        .map((message) => localizeApiError(String(message)))
        .join(" ");
    }

    if (typeof payload.message === "string") {
      return localizeApiError(payload.message);
    }

    if (payload.message && typeof payload.message === "object") {
      const detail = payload.message as { code?: string; message?: string };
      return localizeApiError(detail.message ?? detail.code ?? fallback);
    }

    return fallback;
  } catch {
    return fallback;
  }
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatStudyMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultReportFrom() {
  return dateInputValue(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
}

function defaultReportTo() {
  return dateInputValue(new Date());
}

const fallbackActivationPackages: ActivationPackage[] = [
  {
    code: "one-month",
    name: "Gói học 1 tháng",
    amountVnd: 300000,
    durationDays: 30,
  },
  {
    code: "three-months",
    name: "Gói học 3 tháng",
    amountVnd: 800000,
    durationDays: 90,
  },
  {
    code: "one-year",
    name: "Gói học 1 năm",
    amountVnd: 2400000,
    durationDays: 365,
  },
];

type ActivationOrderTab = "ACTION" | "ALL" | ActivationOrderStatus;

const activationStatusLabels: Record<ActivationOrderStatus, string> = {
  WAITING_PAYMENT: "Chờ thanh toán",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  CANCELED: "Đã hủy",
  REVOKED: "Đã thu hồi",
};

function activationStatusClass(status: ActivationOrderStatus) {
  const classes: Record<ActivationOrderStatus, string> = {
    WAITING_PAYMENT: "bg-amber-50 text-amber-800 ring-amber-200",
    PENDING_REVIEW: "bg-sky-50 text-sky-800 ring-sky-200",
    APPROVED: "bg-teal-50 text-teal-800 ring-teal-200",
    REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
    CANCELED: "bg-slate-100 text-slate-700 ring-slate-200",
    REVOKED: "bg-purple-50 text-purple-800 ring-purple-200",
  };

  return classes[status];
}

function saleOrderNeedsAction(order: ActivationOrder) {
  return order.status === "WAITING_PAYMENT" || order.status === "REJECTED";
}

function saleOrderNextStep(order: ActivationOrder, role: Role) {
  if (order.status === "WAITING_PAYMENT") {
    return "Nhắc bổ sung minh chứng thanh toán";
  }

  if (order.status === "PENDING_REVIEW") {
    return role === "OPERATIONS" || role === "ADMIN"
      ? "Kiểm tra chuyển khoản và kích hoạt"
      : "Đang chờ bộ phận vận hành duyệt";
  }

  if (order.status === "APPROVED") {
    return order.expiresAt
      ? `Hoạt động đến ${formatDate(order.expiresAt)}`
      : "Tài khoản đang hoạt động";
  }

  if (order.status === "REJECTED") {
    return order.reviewNotes
      ? `Bị từ chối: ${order.reviewNotes}`
      : "Khắc phục vấn đề và gửi duyệt lại";
  }

  return "Không cần thao tác";
}

function orderSearchText(order: ActivationOrder) {
  return [
    order.customerEmail,
    order.customerPhone,
    order.user.profile?.displayName,
    order.status,
    order.packageName,
    order.agency?.code,
    order.channelParticipant?.code,
    order.transferContent,
    order.notes,
    order.reviewNotes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

const demoAccounts: DemoAccount[] = [
  {
    role: "STUDENT",
    label: "Học sinh",
    email: "student@demo.local",
    icon: GraduationCap,
  },
  {
    role: "PARENT",
    label: "Phụ huynh",
    email: "parent@demo.local",
    icon: Users,
  },
  {
    role: "TEACHER",
    label: "Giáo viên",
    email: "teacher@demo.local",
    icon: ClipboardCheck,
  },
  {
    role: "CONTENT_EDITOR",
    label: "Nội dung",
    email: "content@demo.local",
    icon: UploadCloud,
  },
  {
    role: "ADMIN",
    label: "Quản trị viên",
    email: "admin@demo.local",
    icon: ShieldCheck,
  },
  {
    role: "DIRECTOR",
    label: "Giám đốc",
    email: "director@demo.local",
    icon: Building2,
  },
  {
    role: "SUPPORT",
    label: "Hỗ trợ",
    email: "support@demo.local",
    icon: LifeBuoy,
  },
  {
    role: "SALE",
    label: "Kinh doanh",
    email: "sale@demo.local",
    icon: CircleDollarSign,
  },
  {
    role: "AGENCY_OWNER",
    label: "Chủ đại lý",
    email: "agency@demo.local",
    icon: Building2,
  },
  {
    role: "OPERATIONS",
    label: "Vận hành",
    email: "operations@demo.local",
    icon: WalletCards,
  },
];

const roleLabels: Record<Role, string> = {
  STUDENT: "Không gian học sinh",
  PARENT: "Cổng phụ huynh",
  TEACHER: "Không gian giáo viên",
  CONTENT_EDITOR: "Xưởng nội dung",
  ADMIN: "Vận hành quản trị",
  DIRECTOR: "Bảng giám đốc",
  SUPPORT: "Bàn hỗ trợ",
  SALE: "Bàn kinh doanh",
  AGENCY_OWNER: "Bàn chủ đại lý",
  AGENCY_MANAGER: "Bàn quản lý đại lý",
  OPERATIONS: "Vận hành thanh toán",
};

const statusCodeLabelsVi: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm khóa",
  DELETED: "Đã xóa",
  DRAFT: "Bản nháp",
  IN_REVIEW: "Đang xét duyệt",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
  PENDING: "Đang chờ",
  PENDING_REVIEW: "Chờ xét duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  PAID: "Đã thanh toán",
  SALE: "Kinh doanh",
  AGENCY: "Đại lý",
  DIRECT: "Trực tiếp",
  CUSTOMER: "Khách hàng",
  MANUAL: "Thủ công",
  REFERRAL: "Giới thiệu",
  WEB: "Trang web",
};

function formatStatusCodeVi(value: string) {
  return statusCodeLabelsVi[value] ?? value.replaceAll("_", " ");
}

function formatRoleCodeVi(value: string) {
  return roleLabels[value as Role] ?? value.replaceAll("_", " ");
}

const dataTextVi: Record<string, string> = {
  "Default sale commission 10%": "Hoa hồng kinh doanh mặc định 10%",
  "Default agency commission 15%": "Hoa hồng đại lý mặc định 15%",
};

function formatDataTextVi(value: string) {
  return dataTextVi[value] ?? value;
}

const tagKindLabels: Record<ContentTagKind, string> = {
  TOPIC: "Chủ đề",
  AUDIENCE: "Đối tượng",
  LEVEL: "Trình độ",
  SKILL: "Kỹ năng",
  FORMAT: "Định dạng",
  INTENT: "Mục tiêu",
  CUSTOM: "Tùy chỉnh",
};

const navByRole: Record<Role, [string, LucideIcon][]> = {
  STUDENT: [
    ["Tổng quan", LayoutDashboard],
    ["Bài học", Video],
    ["Luyện tập", Gamepad2],
    ["Trợ lý AI", Bot],
    ["Gói học", Crown],
  ],
  PARENT: [
    ["Học sinh", Users],
    ["Học hôm nay", Video],
    ["Báo cáo", BarChart3],
    ["Thanh toán", WalletCards],
    ["Hồ sơ con", GraduationCap],
  ],
  TEACHER: [
    ["Tổng quan", LayoutDashboard],
    ["Bài học", Video],
    ["Việc ưu tiên", ClipboardList],
    ["Quy trình", LineChart],
    ["Tài khoản", Users],
  ],
  CONTENT_EDITOR: [
    ["Nội dung", FileVideo],
    ["Tải lên", UploadCloud],
    ["Ngân hàng câu hỏi", ClipboardList],
    ["Duyệt", CheckCircle2],
    ["Cài đặt", Settings],
  ],
  ADMIN: [
    ["Vận hành", LayoutDashboard],
    ["Người dùng", Users],
    ["Gói học", Crown],
    ["Thanh toán", CircleDollarSign],
    ["Nhật ký", ShieldCheck],
  ],
  DIRECTOR: [
    ["Điều hành", LineChart],
    ["Doanh thu", CircleDollarSign],
    ["Tăng trưởng", BarChart3],
    ["Rủi ro", ShieldCheck],
    ["Chiến lược", Building2],
  ],
  SUPPORT: [
    ["Tổng quan", LayoutDashboard],
    ["Công việc", LifeBuoy],
    ["Việc ưu tiên", ClipboardList],
    ["Quy trình", LineChart],
    ["Tài khoản", Users],
  ],
  SALE: [
    ["Đơn hàng", CircleDollarSign],
    ["Khách hàng", Users],
    ["Hóa đơn", UploadCloud],
    ["Phê duyệt", CheckCircle2],
    ["Báo cáo", BarChart3],
  ],
  AGENCY_OWNER: [
    ["Đại lý", Building2],
    ["Kinh doanh", Users],
    ["Đơn hàng", CircleDollarSign],
    ["Chi trả", WalletCards],
    ["Báo cáo", BarChart3],
  ],
  AGENCY_MANAGER: [
    ["Đại lý", Building2],
    ["Kinh doanh", Users],
    ["Đơn hàng", CircleDollarSign],
    ["Chi trả", WalletCards],
    ["Báo cáo", BarChart3],
  ],
  OPERATIONS: [
    ["Phê duyệt", CheckCircle2],
    ["Hóa đơn", UploadCloud],
    ["Thanh toán", CircleDollarSign],
    ["Tài khoản", Users],
    ["Nhật ký", ShieldCheck],
  ],
};

const dashboardRouteByRole: Partial<Record<Role, Record<string, string>>> = {
  TEACHER: {
    "Bài học": "/teacher/content",
  },
  CONTENT_EDITOR: {
    "Nội dung": "/admin/content",
    "Tải lên": "/admin/content",
    "Ngân hàng câu hỏi": "/admin/content",
    Duyệt: "/admin/content",
    "Cài đặt": "/admin/content",
  },
  ADMIN: {
    "Vận hành": "/admin",
    "Người dùng": "/admin/users",
    "Gói học": "/admin/packages",
    "Thanh toán": "/admin/finance",
    "Nhật ký": "/admin/audit",
  },
  DIRECTOR: {
    "Điều hành": "/admin",
    "Doanh thu": "/admin/finance",
    "Tăng trưởng": "/admin/performance",
    "Rủi ro": "/admin/audit",
    "Chiến lược": "/admin/channel",
  },
  SALE: {
    "Đơn hàng": "/admin/orders",
    "Khách hàng": "/admin/performance",
    "Hóa đơn": "/admin/orders",
    "Phê duyệt": "/admin/orders",
    "Báo cáo": "/admin/performance",
  },
  AGENCY_OWNER: {
    "Đại lý": "/admin/channel",
    "Kinh doanh": "/admin/channel",
    "Đơn hàng": "/admin/orders",
    "Chi trả": "/admin/performance",
    "Báo cáo": "/admin/performance",
  },
  AGENCY_MANAGER: {
    "Đại lý": "/admin/channel",
    "Kinh doanh": "/admin/channel",
    "Đơn hàng": "/admin/orders",
    "Chi trả": "/admin/performance",
    "Báo cáo": "/admin/performance",
  },
  OPERATIONS: {
    "Phê duyệt": "/admin/orders",
    "Hóa đơn": "/admin/orders",
    "Thanh toán": "/admin/finance",
    "Tài khoản": "/admin/users",
    "Nhật ký": "/admin/audit",
  },
};

const dashboardTargetByRole: Partial<Record<Role, Record<string, string>>> = {
  STUDENT: {
    "Tổng quan": "dashboard-overview",
    "Bài học": "student-video-panel",
    "Luyện tập": "student-practice-panel",
    "Trợ lý AI": "dashboard-ai-panel",
    "Gói học": "dashboard-access-panel",
  },
  TEACHER: {
    "Tổng quan": "dashboard-overview",
    "Việc ưu tiên": "dashboard-priority-actions",
    "Quy trình": "dashboard-secondary-panel",
    "Tài khoản": "dashboard-access-panel",
  },
  SUPPORT: {
    "Tổng quan": "dashboard-overview",
    "Công việc": "dashboard-primary-workspace",
    "Việc ưu tiên": "dashboard-priority-actions",
    "Quy trình": "dashboard-secondary-panel",
    "Tài khoản": "dashboard-access-panel",
  },
};

type RoleWorkspaceCard = {
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
  meta: string;
};

const roleHomeCopy: Record<Role, string> = {
  STUDENT: "Hoàn thành kế hoạch hôm nay theo từng bước ngắn và rõ ràng.",
  PARENT: "Nắm tiến độ của con, giới hạn học tập và việc gia đình cần xử lý.",
  TEACHER: "Ưu tiên đúng học sinh, bài cần chấm và phản hồi cần gửi hôm nay.",
  CONTENT_EDITOR: "Đưa nội dung từ bản nháp đến xuất bản bằng một quy trình nhất quán.",
  ADMIN: "Theo dõi sức khỏe vận hành và chuyển nhanh đến đúng khu vực xử lý.",
  DIRECTOR: "Tập trung vào tăng trưởng, hiệu quả và rủi ro cần quyết định.",
  SUPPORT: "Xử lý yêu cầu theo mức độ ảnh hưởng và giữ phản hồi đúng cam kết.",
  SALE: "Theo sát đơn hàng, khách hàng và khoản cần phê duyệt trong ngày.",
  AGENCY_OWNER: "Nắm hiệu suất đại lý, đội ngũ bán hàng và dòng tiền cần chú ý.",
  AGENCY_MANAGER: "Điều phối đội ngũ, đơn hàng và tiến độ chi trả theo phạm vi được giao.",
  OPERATIONS: "Duyệt đúng hồ sơ, đối soát đúng chứng từ và kích hoạt đúng hạn.",
};

const roleWorkspaceCards: Partial<Record<Role, RoleWorkspaceCard[]>> = {
  TEACHER: [
    {
      label: "Nội dung giảng dạy",
      description: "Quản lý bài học, học liệu và nội dung cần sử dụng trên lớp.",
      href: "/teacher/content",
      icon: FileVideo,
      meta: "Workspace giáo viên",
    },
    {
      label: "Học sinh cần hỗ trợ",
      description: "Mở danh sách ưu tiên và xử lý các trường hợp có nguy cơ chậm tiến độ.",
      href: "#dashboard-primary-workspace",
      icon: Users,
      meta: "Ưu tiên hôm nay",
    },
    {
      label: "Hàng đợi chấm bài",
      description: "Đi thẳng đến nhóm bài nói và phản hồi cần hoàn thành.",
      href: "#dashboard-priority-actions",
      icon: ClipboardCheck,
      meta: "64 bài đang chờ",
    },
  ],
  CONTENT_EDITOR: [
    {
      label: "Xưởng nội dung",
      description: "Tạo bài học, quản lý video và chỉnh sửa bản nháp tại một nơi.",
      href: "/admin/content",
      icon: FileVideo,
      meta: "Soạn thảo",
    },
    {
      label: "Ngân hàng câu hỏi",
      description: "Chuẩn hóa câu hỏi, đáp án và thẻ tìm kiếm trước khi gửi duyệt.",
      href: "/admin/content",
      icon: ClipboardList,
      meta: "2.430 câu hỏi",
    },
    {
      label: "Hàng đợi xuất bản",
      description: "Rà soát các nội dung đang chờ duyệt và hoàn tất bước xuất bản.",
      href: "/admin/content",
      icon: CheckCircle2,
      meta: "9 mục cần duyệt",
    },
  ],
  ADMIN: [
    {
      label: "Trung tâm vận hành",
      description: "Xem toàn cảnh đơn hàng, tài chính và trạng thái hệ thống.",
      href: "/admin",
      icon: LayoutDashboard,
      meta: "Tổng quan hệ thống",
    },
    {
      label: "Đơn hàng cần xử lý",
      description: "Duyệt hồ sơ, kiểm tra chứng từ và theo dõi trạng thái kích hoạt.",
      href: "/admin/orders",
      icon: ClipboardCheck,
      meta: "Hàng đợi vận hành",
    },
    {
      label: "Người dùng và quyền",
      description: "Quản lý tài khoản, vai trò và các trường hợp cần hỗ trợ.",
      href: "/admin/users",
      icon: Users,
      meta: "42 mục cần chú ý",
    },
  ],
  DIRECTOR: [
    {
      label: "Bức tranh điều hành",
      description: "Theo dõi các chỉ số cấp điều hành và điểm lệch cần quyết định.",
      href: "/admin",
      icon: LineChart,
      meta: "Cập nhật hôm nay",
    },
    {
      label: "Doanh thu và dòng tiền",
      description: "Phân tích doanh thu đã duyệt, hoa hồng và nghĩa vụ chi trả.",
      href: "/admin/finance",
      icon: CircleDollarSign,
      meta: "Góc nhìn tài chính",
    },
    {
      label: "Rủi ro và kiểm soát",
      description: "Xem nhật ký quan trọng và các tín hiệu cần giám sát.",
      href: "/admin/audit",
      icon: ShieldCheck,
      meta: "Theo dõi rủi ro",
    },
  ],
  SUPPORT: [
    {
      label: "Tra cứu tài khoản",
      description: "Tìm người dùng và kiểm tra nhanh trạng thái cần hỗ trợ.",
      href: "/admin/users",
      icon: Search,
      meta: "Công cụ hỗ trợ",
    },
    {
      label: "Danh sách yêu cầu",
      description: "Tập trung vào các yêu cầu đang mở và vấn đề thanh toán.",
      href: "#dashboard-primary-workspace",
      icon: LifeBuoy,
      meta: "31 yêu cầu đang mở",
    },
    {
      label: "Việc cần chuyển cấp",
      description: "Xử lý các tình huống vượt quyền hoặc có ảnh hưởng cao.",
      href: "#dashboard-priority-actions",
      icon: ArrowUp,
      meta: "Ưu tiên theo ảnh hưởng",
    },
  ],
  SALE: [
    {
      label: "Đơn hàng của tôi",
      description: "Tạo đơn, bổ sung chứng từ và theo dõi trạng thái phê duyệt.",
      href: "/admin/orders",
      icon: CircleDollarSign,
      meta: "Workspace bán hàng",
    },
    {
      label: "Khách hàng và hiệu suất",
      description: "Theo dõi học viên mới, doanh thu và kết quả cá nhân.",
      href: "/admin/performance",
      icon: BarChart3,
      meta: "Báo cáo cá nhân",
    },
    {
      label: "Khoản cần theo dõi",
      description: "Ưu tiên đơn chờ duyệt và thanh toán cần bổ sung thông tin.",
      href: "#dashboard-priority-actions",
      icon: ClipboardList,
      meta: "Theo dõi trong ngày",
    },
  ],
  AGENCY_OWNER: [
    {
      label: "Vận hành đại lý",
      description: "Quản lý đại lý, thành viên và chính sách trong đúng phạm vi.",
      href: "/admin/channel",
      icon: Building2,
      meta: "Không gian đại lý",
    },
    {
      label: "Đơn hàng đại lý",
      description: "Theo dõi toàn bộ đơn được tạo bởi đội ngũ bán hàng.",
      href: "/admin/orders",
      icon: ClipboardCheck,
      meta: "Hàng đợi đơn hàng",
    },
    {
      label: "Hiệu suất và chi trả",
      description: "Xem doanh thu, hoa hồng và khoản chi theo kỳ.",
      href: "/admin/performance",
      icon: WalletCards,
      meta: "Báo cáo đại lý",
    },
  ],
  AGENCY_MANAGER: [
    {
      label: "Đội ngũ kinh doanh",
      description: "Theo dõi thành viên và phạm vi được phân công trong đại lý.",
      href: "/admin/channel",
      icon: Users,
      meta: "Quản lý đội ngũ",
    },
    {
      label: "Đơn hàng đã gửi",
      description: "Kiểm tra tiến độ duyệt và các hồ sơ cần bổ sung.",
      href: "/admin/orders",
      icon: ClipboardCheck,
      meta: "Theo dõi đơn hàng",
    },
    {
      label: "Hiệu suất cá nhân",
      description: "Xem kết quả bán hàng và khoản hoa hồng theo kỳ.",
      href: "/admin/performance",
      icon: BarChart3,
      meta: "Báo cáo được phân quyền",
    },
  ],
  OPERATIONS: [
    {
      label: "Hàng đợi phê duyệt",
      description: "Kiểm tra chứng từ, duyệt đơn và xử lý hồ sơ bị trả lại.",
      href: "/admin/orders",
      icon: CheckCircle2,
      meta: "18 đơn đang chờ",
    },
    {
      label: "Đối soát tài chính",
      description: "Theo dõi doanh thu, hóa đơn không khớp và khoản chi trả.",
      href: "/admin/finance",
      icon: WalletCards,
      meta: "3 hóa đơn cần xem",
    },
    {
      label: "Tài khoản và quyền học",
      description: "Kích hoạt, tạm khóa và hỗ trợ tài khoản theo đúng quy trình.",
      href: "/admin/users",
      icon: ShieldCheck,
      meta: "27 tài khoản sắp hết hạn",
    },
  ],
};

const parentTabByNavLabel: Record<string, ParentTab> = {
  "Học sinh": "children",
  "Học hôm nay": "learning",
  "Báo cáo": "reports",
  "Thanh toán": "billing",
  "Hồ sơ con": "family",
};

const fallbackMetrics: Record<Role, Metric[]> = {
  STUDENT: [
    { label: "Trình độ hiện tại", value: "A1", delta: "Bài 04" },
    { label: "Mục tiêu tuần", value: "82%", delta: "+12%" },
    { label: "Bài đã hoàn thành", value: "36", delta: "+3" },
    { label: "Lượt nhắn AI còn lại", value: "184", delta: "Premium" },
  ],
  PARENT: [
    { label: "Học sinh", value: "2", delta: "đang hoạt động" },
    { label: "Thời gian học tuần", value: "4h 20m", delta: "+35m" },
    { label: "Giới hạn thiết bị", value: "45 phút/ngày", delta: "đã bật" },
    { label: "Thời hạn gói còn lại", value: "214 ngày", delta: "hàng năm" },
  ],
  TEACHER: [
    { label: "Lớp học", value: "7", delta: "+1" },
    { label: "Học sinh cần hỗ trợ", value: "23", delta: "-4" },
    { label: "Bài cần chấm", value: "64", delta: "+11" },
    { label: "Tỷ lệ hoàn thành TB", value: "78%", delta: "+4.1%" },
  ],
  CONTENT_EDITOR: [
    { label: "Bài học nháp", value: "27", delta: "+5" },
    { label: "Cần duyệt", value: "9", delta: "+2" },
    { label: "Đang xử lý", value: "4", delta: "-1" },
    { label: "Câu hỏi", value: "2,430", delta: "+184" },
  ],
  ADMIN: [
    { label: "Người dùng chờ xử lý", value: "42", delta: "+6" },
    { label: "Bài đã xuất bản", value: "318", delta: "+12" },
    { label: "Thanh toán lỗi", value: "18", delta: "-3" },
    { label: "Tình trạng hệ thống", value: "99.96%", delta: "ổn định" },
  ],
  DIRECTOR: [
    { label: "Doanh thu từ đầu tháng", value: "218.4M VND", delta: "+12.8%" },
    { label: "Gói đang hoạt động", value: "1,284", delta: "+9.4%" },
    { label: "Tỷ lệ chuyển đổi dùng thử", value: "24%", delta: "-1.2%" },
    { label: "Tỷ lệ chi phí AI", value: "6.1%", delta: "+0.4%" },
  ],
  SUPPORT: [
    { label: "Yêu cầu đang mở", value: "31", delta: "-8" },
    { label: "Vấn đề thanh toán", value: "12", delta: "+3" },
    { label: "Phản hồi trung bình", value: "6m", delta: "-2m" },
    { label: "Yêu cầu hoàn tiền", value: "5", delta: "+1" },
  ],
  SALE: [
    { label: "Đơn đã tạo", value: "42", delta: "+8 hôm nay" },
    { label: "Chờ phê duyệt", value: "15", delta: "chờ vận hành" },
    { label: "Học viên mới", value: "38", delta: "+12%" },
    { label: "Doanh thu đã gửi", value: "128.5M VND", delta: "+9%" },
  ],
  AGENCY_OWNER: [
    { label: "Doanh thu đại lý", value: "0 VND", delta: "kỳ hiện tại" },
    { label: "Nhân viên đại lý", value: "1", delta: "đang hoạt động" },
    {
      label: "Khoản chi chờ xử lý",
      value: "0 VND",
      delta: "danh sách chờ duyệt",
    },
    { label: "Mã giới thiệu", value: "2", delta: "sẵn sàng" },
  ],
  AGENCY_MANAGER: [
    { label: "Nhân viên đang quản lý", value: "0", delta: "đã phân công" },
    { label: "Đơn đã gửi", value: "0", delta: "kỳ hiện tại" },
    { label: "Hoa hồng đại lý", value: "0 VND", delta: "chờ phê duyệt" },
    {
      label: "Trạng thái chi trả",
      value: "Sẵn sàng",
      delta: "không bị tạm giữ",
    },
  ],
  OPERATIONS: [
    { label: "Đơn đang chờ", value: "18", delta: "+4 hôm nay" },
    { label: "Doanh thu đã duyệt", value: "94.8M VND", delta: "+11%" },
    { label: "Hóa đơn không khớp", value: "3", delta: "cần xem xét" },
    { label: "Tài khoản sắp hết hạn", value: "27", delta: "7 ngày" },
  ],
};

const dashboardApiTextVi: Record<string, string> = {
  "Student dashboard": "Tổng quan học sinh",
  "Parent dashboard": "Tổng quan phụ huynh",
  "Teacher dashboard": "Tổng quan giáo viên",
  "Content editor dashboard": "Tổng quan biên tập nội dung",
  "Admin dashboard": "Tổng quan quản trị",
  "Director dashboard": "Tổng quan giám đốc",
  "Support dashboard": "Tổng quan hỗ trợ",
  "Sales dashboard": "Tổng quan kinh doanh",
  "Agency owner dashboard": "Tổng quan chủ đại lý",
  "Agency manager dashboard": "Tổng quan quản lý đại lý",
  "Operations dashboard": "Tổng quan vận hành",
  "Current level": "Trình độ hiện tại",
  "Weekly goal": "Mục tiêu tuần",
  "Lessons done": "Bài đã hoàn thành",
  "AI messages left": "Lượt nhắn AI còn lại",
  "Weekly study": "Thời gian học tuần",
  "Device limit": "Giới hạn thiết bị",
  "Subscription left": "Thời hạn gói còn lại",
  "Students at risk": "Học sinh cần hỗ trợ",
  "To grade": "Bài cần chấm",
  "Avg completion": "Tỷ lệ hoàn thành TB",
  "Draft lessons": "Bài học nháp",
  "Need review": "Cần duyệt",
  "Users pending": "Người dùng chờ xử lý",
  "Published lessons": "Bài đã xuất bản",
  "Payment failures": "Thanh toán lỗi",
  "System health": "Tình trạng hệ thống",
  "Revenue MTD": "Doanh thu từ đầu tháng",
  "Active subscriptions": "Gói đang hoạt động",
  "Trial conversion": "Tỷ lệ chuyển đổi dùng thử",
  "AI cost ratio": "Tỷ lệ chi phí AI",
  "Open tickets": "Yêu cầu đang mở",
  "Billing issues": "Vấn đề thanh toán",
  "Avg response": "Phản hồi trung bình",
  "Refund requests": "Yêu cầu hoàn tiền",
  "Orders created": "Đơn đã tạo",
  "Pending approval": "Chờ phê duyệt",
  "New learners": "Học viên mới",
  "Revenue submitted": "Doanh thu đã gửi",
  "Agency revenue": "Doanh thu đại lý",
  "Agency sales": "Nhân viên đại lý",
  "Pending payouts": "Khoản chi chờ xử lý",
  "Referral codes": "Mã giới thiệu",
  "Managed sales": "Nhân viên đang quản lý",
  "Submitted orders": "Đơn đã gửi",
  "Agency commission": "Hoa hồng đại lý",
  "Payout status": "Trạng thái chi trả",
  "Pending orders": "Đơn đang chờ",
  "Approved revenue": "Doanh thu đã duyệt",
  "Invoice mismatches": "Hóa đơn không khớp",
  "Expiring accounts": "Tài khoản sắp hết hạn",
  "Pending review": "Đang chờ duyệt",
  "Commission available": "Hoa hồng khả dụng",
  Children: "Học sinh",
  "Video processing": "Video đang xử lý",
  "Question bank": "Ngân hàng câu hỏi",
  "Resume work": "Tiếp tục công việc",
  "Open reports": "Mở báo cáo",
  "Check notifications": "Kiểm tra thông báo",
  "Users pending support": "Người dùng đang chờ hỗ trợ",
  "Manage users": "Quản lý người dùng",
  "Configure plans": "Cấu hình gói học",
  "Review audit log": "Xem nhật ký kiểm toán",
  Classes: "Lớp học",
  "Assignments to grade": "Bài tập cần chấm",
  High: "Cao",
  "Open class report": "Mở báo cáo lớp",
  "Grade speaking": "Chấm bài nói",
  "Message learners": "Nhắn học viên",
  "Create learner order": "Tạo đơn học viên",
  "Follow up pending payment": "Theo dõi thanh toán chờ xử lý",
  "Request commission payout": "Yêu cầu chi trả hoa hồng",
  "Create activation order": "Tạo đơn kích hoạt",
  "Upload customer invoice": "Tải hóa đơn khách hàng",
  "Check approval status": "Kiểm tra trạng thái phê duyệt",
  "Invite sale member": "Mời nhân viên kinh doanh",
  "Review agency report": "Xem báo cáo đại lý",
  "Check sale performance": "Xem hiệu suất bán hàng",
  "Open payout queue": "Mở hàng đợi chi trả",
  "Review pending orders": "Duyệt đơn đang chờ",
  "Upload counter invoice": "Tải hóa đơn đối ứng",
  "Approve account access": "Duyệt quyền truy cập",
  "Review revenue": "Xem doanh thu",
  "Approve annual plan": "Duyệt kế hoạch năm",
  "Open risk report": "Mở báo cáo rủi ro",
  "Create lesson": "Tạo bài học",
  "Upload video": "Tải video",
  "Submit for review": "Gửi duyệt",
  "Find account": "Tra cứu tài khoản",
  "Check wallet": "Kiểm tra sổ ví",
  "Escalate payment": "Chuyển cấp vấn đề thanh toán",
  "View progress": "Xem tiến độ",
  "Review screen time": "Xem thời gian sử dụng",
  "Manage subscription": "Quản lý gói học",
  Premium: "Cao cấp",
  Standard: "Tiêu chuẩn",
  Free: "Miễn phí",
  active: "đang hoạt động",
  enabled: "đã bật",
  annual: "hàng năm",
  stable: "ổn định",
  ready: "sẵn sàng",
  "waiting ops": "chờ vận hành",
  review: "cần xem xét",
  today: "hôm nay",
  Ready: "Sẵn sàng",
  "current period": "kỳ hiện tại",
  "review queue": "danh sách chờ duyệt",
  assigned: "đã phân công",
  "pending approval": "chờ phê duyệt",
  "no holds": "không bị tạm giữ",
};

function dashboardTextVi(value: string) {
  const translated = dashboardApiTextVi[value];
  if (translated) return translated;

  const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^(\d+) need follow-up$/, (match) => `${match[1]} cần theo dõi`],
    [/^(\d+) approved$/, (match) => `${match[1]} đã duyệt`],
    [/^(.+) held$/, (match) => `${match[1]} đang tạm giữ`],
    [/^\+(\d+) today$/, (match) => `+${match[1]} hôm nay`],
    [/^(\d+) days$/, (match) => `${match[1]} ngày`],
    [/^(\d+)m\/day$/, (match) => `${match[1]} phút/ngày`],
    [/^Unit (\d+)$/, (match) => `Bài ${match[1]}`],
    [/^(\d+(?:\.\d+)?)M VND$/, (match) => `${match[1].replace(".", ",")} triệu ₫`],
    [/^([\d.,]+) VND$/, (match) => `${match[1]} ₫`],
  ];

  for (const [pattern, format] of patterns) {
    const match = value.match(pattern);
    if (match) return format(match);
  }

  return value;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [email, setEmail] = useState("student@demo.local");
  const [password, setPassword] = useState(demoPassword);
  const [status, setStatus] = useState("Chọn tài khoản demo hoặc đăng nhập.");
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const loadDashboard = useCallback(async (authSession: Session) => {
    const primaryRole = authSession.user.roles[0] ?? "STUDENT";
    const response = await fetch(`${apiBaseUrl}/v1/me/dashboard`, {
      headers: { Authorization: `Bearer ${authSession.accessToken}` },
    });

    if (!response.ok) {
      setDashboard({
        role: primaryRole,
        title: `${roleLabels[primaryRole]} - Tổng quan`,
        metrics: fallbackMetrics[primaryRole],
        actions: ["Tiếp tục công việc", "Mở báo cáo", "Kiểm tra thông báo"],
        user: authSession.user,
      });
      return;
    }

    setDashboard((await response.json()) as DashboardPayload);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedSession = readStoredSession<Session>();
      if (!storedSession) {
        setIsRestoringSession(false);
        return;
      }

      setSession(storedSession);
      setEmail(storedSession.user.email);
      setStatus("Đang khôi phục phiên...");

      void loadDashboard(storedSession).finally(() => {
        setIsRestoringSession(false);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  async function login(nextEmail = email, nextPassword = password) {
    setIsLoading(true);
    setStatus("Đang đăng nhập...");

    try {
      const response = await fetch(`${apiBaseUrl}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Thông tin đăng nhập không đúng hoặc hệ thống chưa sẵn sàng.",
          ),
        );
      }

      const data = (await response.json()) as Session;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setSession(data);
      storeSession(data);
      setEmail(nextEmail);
      setPassword(nextPassword);
      setStatus("Đăng nhập thành công.");
      await loadDashboard(data);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Không thể đăng nhập.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setSession(null);
    setDashboard(null);
    clearStoredSession();
    setStatus("Đã đăng xuất.");
  }

  if (isRestoringSession) {
    return (
      <main className="min-h-screen bg-[#f4f6f8] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Đang khôi phục phiên trước...
          </p>
        </div>
      </main>
    );
  }

  if (!session || !dashboard) {
    return (
      <LoginScreen
        email={email}
        isLoading={isLoading}
        password={password}
        status={status}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onLogin={(event) => {
          event.preventDefault();
          void login();
        }}
        onDemoLogin={(account) => void login(account.email, demoPassword)}
      />
    );
  }

  return (
    <RoleDashboard dashboard={dashboard} onLogout={logout} session={session} />
  );
}

function LoginScreen({
  email,
  isLoading,
  password,
  status,
  onDemoLogin,
  onEmailChange,
  onLogin,
  onPasswordChange,
}: {
  email: string;
  isLoading: boolean;
  password: string;
  status: string;
  onDemoLogin: (account: DemoAccount) => void;
  onEmailChange: (value: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordChange: (value: string) => void;
}) {
  return (
    <main className="kid-app-shell min-h-screen text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1200px] gap-6 px-4 py-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <section className="kid-hero flex flex-col justify-between p-6 sm:p-8">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="kid-logo-mark grid size-12 place-items-center text-white">
                <GraduationCap size={23} />
              </div>
              <div>
                <p className="text-sm font-extrabold">Anh ngữ Minh Hương</p>
                <p className="text-xs text-slate-500">
                  Ứng dụng học tiếng Anh cho gia đình
                </p>
              </div>
            </div>

            <div className="mt-8">
              <span className="kid-eyebrow">
                <Sparkles size={14} /> Cùng bé khám phá
              </span>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">
                Học tiếng Anh vui hơn mỗi ngày
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
                Một không gian học tập đầy màu sắc, giúp các bé tự tin khám phá
                và tiến bộ qua từng hoạt động nhỏ.
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={onLogin}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-violet-500"
                  onChange={(event) => onEmailChange(event.target.value)}
                  type="email"
                  value={email}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Mật khẩu
                </span>
                <input
                  className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-violet-500"
                  onChange={(event) => onPasswordChange(event.target.value)}
                  type="password"
                  value={password}
                />
              </label>
              <button
                className="kid-primary-button flex h-12 w-full items-center justify-center gap-2 px-4 text-sm disabled:opacity-60"
                disabled={isLoading}
                type="submit"
              >
                <LogIn size={18} />
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{status}</p>
                <ForgotPasswordLink />
              </div>
            </form>
          </div>

          <div className="relative z-10 mt-8 border-t border-violet-100 pt-4 text-xs text-slate-500">
            Mật khẩu demo cho tất cả tài khoản:{" "}
            <span className="font-medium">{demoPassword}</span>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl shadow-violet-100/50 backdrop-blur sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Tài khoản demo</h2>
              <p className="mt-1 text-sm text-slate-500">
                Mỗi tài khoản demo mở đúng trải nghiệm dành cho vai trò đó.
              </p>
            </div>
            <ShieldCheck className="text-slate-500" size={22} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {demoAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  className="group flex min-h-24 items-center justify-between rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md"
                  key={account.role}
                  onClick={() => onDemoLogin(account)}
                  type="button"
                >
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icon size={18} />
                      {account.label}
                    </span>
                    <span className="mt-2 block text-xs text-slate-500">
                      {account.email}
                    </span>
                  </span>
                  <ChevronRight
                    className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600"
                    size={18}
                  />
                </button>
              );
            })}
          </div>

          <SelfServiceSignupPanel />

          <div className="mt-6 rounded-3xl bg-gradient-to-br from-sky-50 via-violet-50 to-amber-50 p-5">
            <p className="text-sm font-medium">Bản demo gồm có</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                "Đăng nhập an toàn",
                "Trang chủ theo từng vai trò",
                "Khu vực nhân sự được bảo vệ",
                "Quyền truy cập theo gói học",
                "Quản lý nội dung học tập",
                "Luyện tập với AI có hướng dẫn",
              ].map((item) => (
                <div
                  className="flex items-center gap-2 text-sm text-slate-600"
                  key={item}
                >
                  <CheckCircle2 className="text-teal-600" size={17} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SelfServiceSignupPanel() {
  const [options, setOptions] = useState<SelfServiceOptions | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [packageCode, setPackageCode] = useState("one-year");
  const [notes, setNotes] = useState("");
  const [createdOrder, setCreatedOrder] = useState<ActivationOrder | null>(
    null,
  );
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [message, setMessage] = useState(
    "Tạo tài khoản và yêu cầu thanh toán ngay trên ứng dụng.",
  );
  const [isSaving, setIsSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/self-service/options`,
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Không thể tải các lựa chọn thanh toán.",
          ),
        );
      }

      const data = (await response.json()) as SelfServiceOptions;
      setOptions(data);
      setPackageCode(data.packages[0]?.code ?? "one-year");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải các lựa chọn thanh toán.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOptions]);

  const selectedPackage =
    options?.packages.find((item) => item.code === packageCode) ??
    options?.packages[0];

  async function createSelfServiceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPackage) {
      setMessage("Hãy chọn gói học trước.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo yêu cầu thanh toán...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/self-service`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            displayName,
            packageCode: selectedPackage.code,
            notes,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tạo yêu cầu thanh toán."),
        );
      }

      const data = (await response.json()) as {
        order: ActivationOrder;
        bankTransfer: BankTransferInfo;
      };
      setCreatedOrder(data.order);
      setOptions((current) =>
        current ? { ...current, bankTransfer: data.bankTransfer } : current,
      );
      setMessage(
        "Hãy chuyển khoản đúng nội dung, sau đó tải minh chứng thanh toán lên.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo yêu cầu thanh toán.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadPaymentProof() {
    if (!createdOrder || !paymentProof) {
      setMessage("Hãy chọn ảnh hoặc tệp PDF minh chứng thanh toán trước.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tải minh chứng thanh toán...");

    try {
      const formData = new FormData();
      formData.append("email", createdOrder.customerEmail);
      formData.append("paymentProof", paymentProof);

      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/self-service/${createdOrder.id}/payment-proof`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tải minh chứng thanh toán."),
        );
      }

      const updated = (await response.json()) as ActivationOrder;
      setCreatedOrder(updated);
      setMessage(
        "Đã nhận minh chứng thanh toán. Bộ phận vận hành sẽ kích hoạt tài khoản sau khi xét duyệt.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải minh chứng thanh toán.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-6 border-t border-slate-200 pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Đăng ký tự phục vụ</h2>
          <p className="mt-1 text-sm text-slate-500">
            Phụ huynh có thể đăng ký, chuyển khoản và tải minh chứng ngay trên
            ứng dụng.
          </p>
        </div>
        <WalletCards className="text-slate-500" size={22} />
      </div>

      <form className="mt-4 grid gap-3" onSubmit={createSelfServiceOrder}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Email phụ huynh
            </span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="phuhuynh@email.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              required
              type="password"
              value={password}
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Tên con</span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Tên học sinh (ví dụ: Bé Minh)"
              required
              value={displayName}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Gói học</span>
            <select
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              onChange={(event) => setPackageCode(event.target.value)}
              value={packageCode}
            >
              {(options?.packages ?? []).map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name} - {item.durationDays} ngày
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Ghi chú</span>
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Không bắt buộc"
            value={notes}
          />
        </label>

        <button
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
          disabled={isSaving || !selectedPackage}
          type="submit"
        >
          <CircleDollarSign size={18} />
          Tạo yêu cầu thanh toán
        </button>
      </form>

      {selectedPackage && (
        <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
          Đã chọn: {formatMoney(selectedPackage.amountVnd * 100, "VND")} /{" "}
          {selectedPackage.durationDays} ngày.
        </div>
      )}

      {createdOrder && (
        <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
          <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              Ngân hàng:{" "}
              <span className="font-medium">
                {createdOrder.bankName ?? options?.bankTransfer.bankName}
              </span>
            </p>
            <p>
              Tài khoản:{" "}
              <span className="font-medium">
                {createdOrder.bankAccountNumber ??
                  options?.bankTransfer.accountNumber}
              </span>
            </p>
            <p>
              Chủ tài khoản:{" "}
              <span className="font-medium">
                {createdOrder.bankAccountName ??
                  options?.bankTransfer.accountName}
              </span>
            </p>
            <p>
              Nội dung:{" "}
              <span className="font-medium">
                {createdOrder.transferContent}
              </span>
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-slate-600"
              onChange={(event) =>
                setPaymentProof(event.target.files?.[0] ?? null)
              }
              type="file"
            />
            <button
              className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSaving || createdOrder.status === "PENDING_REVIEW"}
              onClick={() => void uploadPaymentProof()}
              type="button"
            >
              Tải minh chứng
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </section>
  );
}

function RoleDashboard({
  dashboard,
  onLogout,
  session,
}: {
  dashboard: DashboardPayload;
  onLogout: () => void;
  session: Session;
}) {
  const router = useRouter();
  const role = dashboard.role;
  const navItems = navByRole[role];
  const displayName = dashboard.user.displayName ?? dashboard.user.email;
  const workItems = useMemo(() => workItemsForRole(role), [role]);
  const canOpenAdminWorkspace =
    role === "ADMIN" ||
    role === "DIRECTOR" ||
    role === "SALE" ||
    role === "OPERATIONS" ||
    role === "AGENCY_OWNER" ||
    role === "AGENCY_MANAGER";
  const adminWorkspaceHref = adminLandingForRoles([role]);
  const primaryWorkspaceHref = roleWorkspaceCards[role]?.[0]?.href;
  const hasAdvancedTools = [
    "CONTENT_EDITOR",
    "ADMIN",
    "DIRECTOR",
    "SALE",
    "AGENCY_OWNER",
    "AGENCY_MANAGER",
    "OPERATIONS",
  ].includes(role);
  const [activeNavLabel, setActiveNavLabel] = useState(navItems[0]?.[0] ?? "");
  const [parentRequestedTab, setParentRequestedTab] =
    useState<ParentTab>("children");
  const [learningProfile, setLearningProfile] =
    useState<LearningProfilePayload["childProfile"]>(null);
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [dashboardNotice, setDashboardNotice] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const workspaceSearchRef = useRef<HTMLInputElement>(null);
  const dashboardNoticeTimerRef = useRef<number | null>(null);
  const [activeStudentLessonId, setActiveStudentLessonId] = useState("");
  const [requestedStudentLessonId, setRequestedStudentLessonId] = useState("");
  const [activeStudentVideoContext, setActiveStudentVideoContext] =
    useState<ActiveVideoPlanContext | null>(null);
  const [activeStudentPracticeContext, setActiveStudentPracticeContext] =
    useState<ActivePracticePlanContext | null>(null);
  const [studentWorkspaceView, setStudentWorkspaceView] = useState<
    "video" | "practice"
  >("video");
  const [staffSummaryView, setStaffSummaryView] = useState<
    "workflow" | "guidance" | "account"
  >("workflow");
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [studentHomeRefreshToken, setStudentHomeRefreshToken] = useState(0);
  const learningChildProfileId = learningProfile?.id ?? "";

  const showDashboardNotice = useCallback((message: string) => {
    setDashboardNotice(message);
    if (dashboardNoticeTimerRef.current !== null) {
      window.clearTimeout(dashboardNoticeTimerRef.current);
    }
    dashboardNoticeTimerRef.current = window.setTimeout(
      () => setDashboardNotice(""),
      3600,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cancelReset = () => {
      cancelled = true;
    };
    const resetScroll = () => {
      if (!cancelled) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    };

    resetScroll();
    const settleTimers = [100, 700, 1500].map((delay) =>
      window.setTimeout(resetScroll, delay),
    );
    window.addEventListener("keydown", cancelReset);
    window.addEventListener("pointerdown", cancelReset);
    window.addEventListener("touchstart", cancelReset, { passive: true });
    window.addEventListener("wheel", cancelReset, { passive: true });

    return () => {
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("keydown", cancelReset);
      window.removeEventListener("pointerdown", cancelReset);
      window.removeEventListener("touchstart", cancelReset);
      window.removeEventListener("wheel", cancelReset);
    };
  }, [role]);

  useEffect(() => {
    return () => {
      if (dashboardNoticeTimerRef.current !== null) {
        window.clearTimeout(dashboardNoticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (role !== "STUDENT") {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/v1/me/learning-profile`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        if (!response.ok) {
          throw new Error("Không thể tải hồ sơ học sinh.");
        }
        const payload = (await response.json()) as LearningProfilePayload;
        if (!cancelled) {
          setLearningProfile(payload.childProfile);
          if (!payload.childProfile) {
            showDashboardNotice(
              "Tài khoản chưa có hồ sơ học sinh để mở bài học.",
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLearningProfile(null);
          showDashboardNotice(
            error instanceof Error
              ? error.message
              : "Không thể tải hồ sơ học sinh.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, session.accessToken, showDashboardNotice]);

  const scrollToDashboardTarget = useCallback(
    (targetId: string, label: string) => {
      const target = document.getElementById(targetId);
      if (!target) {
        showDashboardNotice(`Chưa tìm thấy khu vực ${label}.`);
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      showDashboardNotice(`Đã mở khu vực ${label}.`);
    },
    [showDashboardNotice],
  );

  const handleDashboardNav = useCallback(
    (label: string) => {
      setActiveNavLabel(label);

      if (role === "STUDENT" && (label === "Bài học" || label === "Luyện tập")) {
        const view = label === "Bài học" ? "video" : "practice";
        setStudentWorkspaceView(view);
        window.setTimeout(
          () =>
            scrollToDashboardTarget(
              view === "video" ? "student-video-panel" : "student-practice-panel",
              label,
            ),
          0,
        );
        return;
      }

      if (role !== "STUDENT" && role !== "PARENT" && label === "Quy trình") {
        setStaffSummaryView("workflow");
        window.setTimeout(
          () => scrollToDashboardTarget("dashboard-secondary-panel", label),
          0,
        );
        return;
      }

      if (role !== "STUDENT" && role !== "PARENT" && label === "Tài khoản") {
        setStaffSummaryView("account");
        window.setTimeout(
          () => scrollToDashboardTarget("dashboard-access-panel", label),
          0,
        );
        return;
      }

      const href = dashboardRouteByRole[role]?.[label];
      if (href) {
        router.push(href);
        return;
      }

      if (role === "PARENT") {
        const requestedTab = parentTabByNavLabel[label];
        if (requestedTab) {
          setParentRequestedTab(requestedTab);
          window.setTimeout(
            () => scrollToDashboardTarget("parent-portal-panel", label),
            0,
          );
          return;
        }
      }

      const targetId = dashboardTargetByRole[role]?.[label];
      if (targetId) {
        scrollToDashboardTarget(targetId, label);
        return;
      }

      showDashboardNotice(`Khu vực ${label} chưa được cấp cho tài khoản này.`);
    },
    [role, router, scrollToDashboardTarget, showDashboardNotice],
  );

  const handleWorkspaceSearch = useCallback(() => {
    const query = dashboardSearch.trim().toLocaleLowerCase("vi");
    if (!query) {
      workspaceSearchRef.current?.focus();
      showDashboardNotice("Nhập nội dung bạn muốn tìm.");
      return;
    }

    const targetIds = [
      "student-today-panel",
      "student-video-panel",
      "student-practice-panel",
      "parent-portal-panel",
      "dashboard-workspace-hub",
      "dashboard-primary-workspace",
      "dashboard-priority-actions",
      "dashboard-secondary-panel",
      "dashboard-ai-panel",
      "dashboard-access-panel",
    ];
    const target = targetIds
      .map((id) => document.getElementById(id))
      .find((item) =>
        item?.textContent?.toLocaleLowerCase("vi").includes(query),
      );

    if (!target) {
      showDashboardNotice(`Không tìm thấy “${dashboardSearch.trim()}”.`);
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    showDashboardNotice(`Đã tìm thấy “${dashboardSearch.trim()}”.`);
  }, [dashboardSearch, showDashboardNotice]);

  const handlePriorityAction = useCallback(
    (action: string) => {
      if (role === "TEACHER") {
        router.push("/teacher/content");
        return;
      }
      if (role === "CONTENT_EDITOR") {
        router.push("/admin/content");
        return;
      }
      if (canOpenAdminWorkspace) {
        router.push(adminWorkspaceHref);
        return;
      }
      scrollToDashboardTarget("dashboard-primary-workspace", action);
    },
    [
      adminWorkspaceHref,
      canOpenAdminWorkspace,
      role,
      router,
      scrollToDashboardTarget,
    ],
  );
  const handleStudentResume = useCallback(
    (
      lessonId: string,
      target: "video" | "practice" = "video",
      context?: ActiveLearningPlanContext,
    ) => {
      setRequestedStudentLessonId(lessonId);
      setActiveStudentLessonId(lessonId);
      setStudentWorkspaceView(target);
      setActiveStudentVideoContext(context?.kind === "VIDEO" ? context : null);
      setActiveStudentPracticeContext(
        context?.kind === "PRACTICE" ? context : null,
      );
      window.setTimeout(() => {
        document
          .getElementById(
            target === "practice"
              ? "student-practice-panel"
              : "student-video-panel",
          )
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    },
    [],
  );
  const handleStudentPracticeDailyPlanRefresh = useCallback(
    (refresh: PracticeDailyPlanRefresh) => {
      setActiveStudentPracticeContext(refresh.context);
      setStudentHomeRefreshToken((current) => current + 1);
    },
    [],
  );
  return (
    <main className="kid-app-shell min-h-screen text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col lg:flex-row">
        <aside className="kid-sidebar border-b border-violet-100 bg-white/90 px-4 py-3 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center justify-between lg:block">
            <div className="flex items-center gap-3">
              <div className="kid-logo-mark grid size-11 place-items-center text-white">
                <GraduationCap size={22} />
              </div>
              <div>
                <p className="text-sm font-extrabold">Anh ngữ Minh Hương</p>
                <p className="text-xs text-slate-500">{roleLabels[role]}</p>
              </div>
            </div>
            <button
              aria-label="Tìm trong không gian"
              className="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
              onClick={() => workspaceSearchRef.current?.focus()}
              type="button"
            >
              <Search size={18} />
            </button>
          </div>

          <nav
            aria-label="Điều hướng chính"
            className="mt-5 hidden gap-2 lg:flex lg:flex-col"
          >
            {navItems.map(([label, Icon]) => {
              const href = dashboardRouteByRole[role]?.[label];
              const className = `flex h-11 shrink-0 items-center gap-3 rounded-2xl px-3 text-sm font-bold ${
                activeNavLabel === label ? "kid-nav-active" : "kid-nav-link"
              }`;
              return href ? (
                <Link
                  className={className}
                  href={href}
                  key={label}
                  onClick={() => setActiveNavLabel(label)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ) : (
                <button
                  className={className}
                  key={label}
                  onClick={() => handleDashboardNav(label)}
                  type="button"
                >
                  <Icon size={18} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-lg border border-amber-200 bg-amber-50 p-4 lg:block">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-950">
              <Crown size={17} />
              {role === "STUDENT"
                ? "Gói cao cấp"
                : role === "PARENT"
                  ? "Quyền học cho gia đình"
                  : "Quyền truy cập công việc"}
            </div>
            <p className="mt-2 text-xs leading-5 text-amber-900">
              {role === "STUDENT"
                ? "Gói học đang hoạt động cho bài học và phần luyện tập hôm nay."
                : role === "PARENT"
                  ? "Dùng tài khoản này để theo dõi tiến độ của con, kế hoạch học, báo cáo và thanh toán."
                  : "Tài khoản này mở các công cụ đã được cấp cho phạm vi công việc của bạn."}
            </p>
          </div>
        </aside>

        <section className="kid-page flex-1 px-4 py-4 pb-28 sm:px-6 lg:px-8 lg:py-6">
          <header
            className="kid-hero flex scroll-mt-4 flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between"
            id="dashboard-overview"
          >
            <div className="relative z-10">
              <span className="kid-eyebrow">
                <Sparkles size={14} />
                {role === "STUDENT"
                  ? "Hành trình hôm nay"
                  : "Không gian hôm nay"}
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                {role === "STUDENT"
                  ? `Góc học tập của ${displayName}`
                  : dashboardTextVi(dashboard.title)}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {role === "STUDENT"
                  ? roleHomeCopy[role]
                  : `Xin chào ${displayName}. ${roleHomeCopy[role]}`}
              </p>
            </div>
            <div className="relative z-10 flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
              <form
                className="flex h-11 w-full min-w-0 basis-full items-center rounded-lg border border-slate-200 bg-white pl-3 text-sm text-slate-500 sm:w-auto sm:basis-auto"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleWorkspaceSearch();
                }}
              >
                <input
                  aria-label="Tìm trong không gian làm việc"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-48"
                  onChange={(event) => setDashboardSearch(event.target.value)}
                  placeholder="Tìm trong không gian"
                  ref={workspaceSearchRef}
                  type="search"
                  value={dashboardSearch}
                />
                <button
                  aria-label="Tìm kiếm"
                  className="grid size-11 shrink-0 place-items-center rounded-lg text-violet-700 hover:bg-violet-50"
                  type="submit"
                >
                  <Search size={16} />
                </button>
              </form>
              {primaryWorkspaceHref && (
                <Link
                  className="kid-primary-button flex h-11 flex-1 items-center justify-center gap-2 px-4 text-sm sm:flex-none"
                  href={primaryWorkspaceHref}
                >
                  <LayoutDashboard size={18} />
                  Mở không gian làm việc
                </Link>
              )}
              <div className="relative">
                <button
                  aria-expanded={notificationsOpen}
                  aria-label="Thông báo"
                  className="grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600"
                  onClick={() => setNotificationsOpen((current) => !current)}
                  type="button"
                >
                  <Bell size={18} />
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-violet-100 bg-white p-4 text-sm shadow-xl">
                    <p className="font-extrabold text-slate-800">Thông báo</p>
                    <p className="mt-1 leading-5 text-slate-500">
                      Bạn chưa có thông báo mới.
                    </p>
                  </div>
                )}
              </div>
              <button
                className="flex h-11 items-center gap-2 rounded-lg bg-white px-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200"
                onClick={onLogout}
                type="button"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          </header>

          <div className="mt-5 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            {dashboard.metrics.map((metric) => (
              <section className="kid-stat-card p-4 sm:p-5" key={metric.label}>
                <p className="text-xs text-slate-500">
                  {dashboardTextVi(metric.label)}
                </p>
                <p className="mt-2 text-xl font-extrabold sm:text-2xl">
                  {dashboardTextVi(metric.value)}
                </p>
                <p className="mt-2 text-xs text-teal-700">
                  {dashboardTextVi(metric.delta)}
                </p>
              </section>
            ))}
          </div>

          {role === "STUDENT" && (
            <>
              <StudentTodayPanel
                childDisplayName={learningProfile?.displayName}
                childProfileId={learningChildProfileId}
                onResume={handleStudentResume}
                refreshToken={studentHomeRefreshToken}
                session={session}
              />
              <section className="mt-4 rounded-2xl border border-violet-100 bg-white p-2 shadow-sm">
                <div
                  aria-label="Chọn hoạt động học tập"
                  className="grid grid-cols-2 gap-2"
                  role="tablist"
                >
                  <button
                    aria-controls="student-video-panel"
                    aria-selected={studentWorkspaceView === "video"}
                    className={`kid-learning-tab ${
                      studentWorkspaceView === "video" ? "kid-learning-tab-active" : ""
                    }`}
                    onClick={() => {
                      setStudentWorkspaceView("video");
                      setActiveNavLabel("Bài học");
                    }}
                    role="tab"
                    type="button"
                  >
                    <Video size={18} />
                    Học qua video
                  </button>
                  <button
                    aria-controls="student-practice-panel"
                    aria-selected={studentWorkspaceView === "practice"}
                    className={`kid-learning-tab ${
                      studentWorkspaceView === "practice" ? "kid-learning-tab-active" : ""
                    }`}
                    onClick={() => {
                      setStudentWorkspaceView("practice");
                      setActiveNavLabel("Luyện tập");
                    }}
                    role="tab"
                    type="button"
                  >
                    <Gamepad2 size={18} />
                    Luyện tập
                  </button>
                </div>
              </section>
              <div hidden={studentWorkspaceView !== "video"}>
                <VideoImmersionPanel
                  childProfileId={learningChildProfileId}
                  onLessonChange={setActiveStudentLessonId}
                  planContext={activeStudentVideoContext}
                  requestedLessonId={requestedStudentLessonId}
                  session={session}
                />
              </div>
              <div hidden={studentWorkspaceView !== "practice"}>
                <StudentPracticePanel
                  childProfileId={learningChildProfileId}
                  lessonId={activeStudentLessonId}
                  onDailyPlanRefresh={handleStudentPracticeDailyPlanRefresh}
                  planContext={activeStudentPracticeContext}
                  session={session}
                />
              </div>
            </>
          )}

          {role === "PARENT" && (
            <ParentPortal
              activeTab={parentRequestedTab}
              onLogout={onLogout}
              onTabChange={setParentRequestedTab}
              session={session}
            />
          )}

          {role !== "STUDENT" && role !== "PARENT" && (
            <RoleWorkspaceHub role={role} />
          )}

          {hasAdvancedTools && (
            <section className="mt-4 flex flex-col gap-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-violet-950">
                  Chế độ thao tác nhanh
                </p>
                <p className="mt-1 text-sm leading-6 text-violet-800">
                  Chỉ mở các biểu mẫu và bảng chi tiết khi bạn thực sự cần xử lý ngay trên trang này.
                </p>
              </div>
              <button
                aria-expanded={showAdvancedTools}
                className="min-h-11 shrink-0 rounded-xl border border-violet-200 bg-white px-4 text-sm font-extrabold text-violet-800 shadow-sm"
                onClick={() => setShowAdvancedTools((current) => !current)}
                type="button"
              >
                {showAdvancedTools ? "Ẩn công cụ chi tiết" : "Mở công cụ chi tiết"}
              </button>
            </section>
          )}

          {showAdvancedTools && (
            <div className="mt-4" id="dashboard-advanced-tools">
              {(role === "ADMIN" ||
                role === "CONTENT_EDITOR" ||
                role === "DIRECTOR") && (
                <ContentStudio role={role} session={session} />
              )}

              {(role === "SALE" ||
                role === "AGENCY_OWNER" ||
                role === "AGENCY_MANAGER" ||
                role === "OPERATIONS" ||
                role === "ADMIN") && (
                <ActivationOrdersPanel role={role} session={session} />
              )}

              {role === "SALE" && (
                <>
                  <MyCustomersPanel session={session} />
                  <SalePersonalReportPanel session={session} />
                </>
              )}

              {(role === "SALE" ||
                role === "AGENCY_OWNER" ||
                role === "AGENCY_MANAGER" ||
                role === "OPERATIONS" ||
                role === "ADMIN" ||
                role === "DIRECTOR") && (
                <ChannelFinancePanel role={role} session={session} />
              )}

              {(role === "OPERATIONS" ||
                role === "ADMIN" ||
                role === "DIRECTOR" ||
                role === "AGENCY_OWNER" ||
                role === "AGENCY_MANAGER") && (
                <ChannelReportPanel session={session} />
              )}

              {(role === "ADMIN" ||
                role === "OPERATIONS" ||
                role === "DIRECTOR" ||
                role === "AGENCY_OWNER" ||
                role === "AGENCY_MANAGER") && (
                <ChannelAdminPanel role={role} session={session} />
              )}
            </div>
          )}

          {role !== "STUDENT" && role !== "PARENT" && (
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <PrimaryWorkspace role={role} />

              <section
                className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
                id="dashboard-priority-actions"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Việc cần ưu tiên</h2>
                  <ChevronRight className="text-slate-400" size={18} />
                </div>
                <div className="mt-4 divide-y divide-slate-200">
                  {dashboard.actions.map((action, index) => (
                    <button
                      className="flex min-h-14 w-full items-center justify-between py-3 text-left"
                      key={action}
                      onClick={() => handlePriorityAction(action)}
                      type="button"
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {dashboardTextVi(action)}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {workItems[index % workItems.length]}
                        </span>
                      </span>
                      <ChevronRight className="text-slate-400" size={18} />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {role !== "STUDENT" && role !== "PARENT" && (
            <div
              aria-label="Thông tin hỗ trợ công việc"
              className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-violet-100 bg-white p-2 lg:hidden"
              role="tablist"
            >
              {(
                [
                  ["workflow", "Quy trình", LineChart],
                  ["guidance", "Lưu ý", ShieldCheck],
                  ["account", "Tài khoản", Users],
                ] as const
              ).map(([view, label, Icon]) => (
                <button
                  aria-selected={staffSummaryView === view}
                  className={`kid-summary-tab ${
                    staffSummaryView === view ? "kid-summary-tab-active" : ""
                  }`}
                  key={view}
                  onClick={() => setStaffSummaryView(view)}
                  role="tab"
                  type="button"
                >
                  <Icon aria-hidden="true" size={17} />
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div
              className={
                role !== "STUDENT" &&
                role !== "PARENT" &&
                staffSummaryView !== "workflow"
                  ? "hidden lg:block"
                  : ""
              }
            >
              <SecondaryPanel role={role} />
            </div>
            <div
              className={
                role !== "STUDENT" &&
                role !== "PARENT" &&
                staffSummaryView !== "guidance"
                  ? "hidden lg:block"
                  : ""
              }
            >
              <AiOrOpsPanel
                childProfileId={learningChildProfileId}
                onOpenProtected={() => {
                  if (primaryWorkspaceHref?.startsWith("/")) {
                    router.push(primaryWorkspaceHref);
                    return;
                  }
                  if (canOpenAdminWorkspace) {
                    router.push(adminWorkspaceHref);
                    return;
                  }
                  if (role === "TEACHER") {
                    router.push("/teacher");
                    return;
                  }
                  scrollToDashboardTarget(
                    "dashboard-access-panel",
                    "quyền truy cập",
                  );
                }}
                role={role}
                session={session}
              />
            </div>
            <div
              className={
                role !== "STUDENT" &&
                role !== "PARENT" &&
                staffSummaryView !== "account"
                  ? "hidden lg:block"
                  : ""
              }
            >
              <AccessPanel dashboard={dashboard} />
            </div>
          </div>

          <nav
            aria-label="Điều hướng nhanh"
            className="kid-mobile-nav lg:hidden"
          >
            {navItems.map(([label, Icon]) => {
              const href = dashboardRouteByRole[role]?.[label];
              const className = `kid-mobile-nav-item ${
                activeNavLabel === label ? "kid-mobile-nav-item-active" : ""
              }`;
              return href ? (
                <Link
                  aria-current={activeNavLabel === label ? "page" : undefined}
                  className={className}
                  href={href}
                  key={`mobile-${label}`}
                  onClick={() => setActiveNavLabel(label)}
                >
                  <Icon aria-hidden="true" size={19} />
                  <span>{label}</span>
                </Link>
              ) : (
                <button
                  aria-current={activeNavLabel === label ? "page" : undefined}
                  className={className}
                  key={`mobile-${label}`}
                  onClick={() => handleDashboardNav(label)}
                  type="button"
                >
                  <Icon aria-hidden="true" size={19} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {dashboardNotice && (
            <div
              aria-live="polite"
              className="fixed bottom-24 right-4 z-50 max-w-sm rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl lg:bottom-5 lg:right-5"
              role="status"
            >
              {dashboardNotice}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function RoleWorkspaceHub({ role }: { role: Role }) {
  const cards = roleWorkspaceCards[role] ?? [];
  if (cards.length === 0) return null;

  return (
    <section
      className="mt-4 scroll-mt-4 rounded-2xl border border-violet-100 bg-white p-4 sm:p-5"
      id="dashboard-workspace-hub"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-teal-700">
            Lối tắt theo vai trò
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">
            Chọn đúng nơi để hoàn thành công việc
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-500">
          Dashboard chỉ giữ thông tin cần quyết định; biểu mẫu chi tiết nằm trong workspace chuyên trách.
        </p>
      </div>

      <div className="kid-workspace-grid mt-4 grid gap-3 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              aria-label={`${card.label}: ${card.description}`}
              className="kid-workspace-card group flex min-h-48 flex-col rounded-2xl border border-slate-200 bg-white p-4"
              href={card.href}
              key={`${role}-${card.label}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-700">
                  <Icon size={20} />
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                  {card.meta}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                {card.label}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
              <span className="mt-4 flex items-center gap-2 text-sm font-extrabold text-violet-700">
                Mở workspace
                <ChevronRight
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                  size={18}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function PrimaryWorkspace({ role }: { role: Role }) {
  if (role === "STUDENT" || role === "PARENT") {
    return (
      <section
        className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
        id="dashboard-primary-workspace"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Bài học hiện tại
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Trao đổi thời hạn rõ ràng
            </h2>
          </div>
          <button className="flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white">
            <CirclePlay size={18} />
            Học tiếp
          </button>
        </div>

        <div className="mt-4 grid min-h-64 place-items-center rounded-lg bg-slate-950 p-4 text-white">
          <div className="w-full max-w-xl">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Bài 04 / Tiết 03</span>
              <span>Còn 14:22</span>
            </div>
            <div className="mt-10 flex items-center justify-center">
              <button className="grid size-16 place-items-center rounded-full bg-white text-slate-950">
                <Play size={28} fill="currentColor" />
              </button>
            </div>
            <div className="mt-10 h-2 rounded-full bg-white/15">
              <div className="h-2 w-[58%] rounded-full bg-teal-400" />
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-300">
              <span>Trọng tâm phát âm: từ chối khéo léo</span>
              <span>58%</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const titleByRole: Record<Role, string> = {
    STUDENT: "Không gian học tập",
    PARENT: "Tiến độ gia đình",
    TEACHER: "Danh sách lớp cần hỗ trợ",
    CONTENT_EDITOR: "Quy trình xuất bản",
    ADMIN: "Trung tâm vận hành",
    DIRECTOR: "Bảng điều hành",
    SUPPORT: "Danh sách hỗ trợ khách hàng",
    SALE: "Bàn xử lý đơn hàng",
    AGENCY_OWNER: "Bàn quản lý đại lý",
    AGENCY_MANAGER: "Bàn kinh doanh đại lý",
    OPERATIONS: "Danh sách duyệt thanh toán",
  };

  return (
    <section
      className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
      id="dashboard-primary-workspace"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Không gian làm việc
          </p>
          <h2 className="mt-1 text-xl font-semibold">{titleByRole[role]}</h2>
        </div>
        <LineChart className="text-slate-500" size={21} />
      </div>
      <div className="mt-4 divide-y divide-slate-200">
        {workspaceRows(role).map((row) => (
          <div
            className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto]"
            key={row.title}
          >
            <div>
              <p className="text-sm font-medium">{row.title}</p>
              <p className="mt-1 text-xs text-slate-500">{row.description}</p>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudentTodayPanel({
  childDisplayName,
  childProfileId,
  onResume,
  refreshToken = 0,
  session,
}: {
  childDisplayName?: string;
  childProfileId: string;
  onResume: (
    lessonId: string,
    target?: "video" | "practice",
    context?: ActiveLearningPlanContext,
  ) => void;
  refreshToken?: number;
  session: Session;
}) {
  const [home, setHome] = useState<LearningHomePayload | null>(null);
  const [message, setMessage] = useState("Đang tải kế hoạch hôm nay.");
  const [actionStatus, setActionStatus] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadHome = useCallback(async () => {
    try {
      if (!childProfileId) {
        setHome(null);
        setMessage(
          "Chưa chọn hồ sơ học sinh. Phụ huynh cần chọn đúng hồ sơ con trước khi vào luồng học.",
        );
        return;
      }

      const data = await fetchLearningHomePayload(childProfileId, authHeaders);
      setHome(data);
      setMessage(childHomeMessage(data));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải kế hoạch học.",
      );
    }
  }, [authHeaders, childProfileId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHome();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadHome, refreshToken]);

  const usage = home?.deviceUsage;
  const persistentPlan = home?.persistentDailyPlan;
  const usesPersistentPlan = Boolean(persistentPlan?.plan);
  const legacyItems = useMemo<LearningPersistentDailyPlanItem[]>(
    () =>
      (home?.dailyPlan ?? []).map((item, index) => ({
        id: item.id,
        planId: "legacy",
        sequence: index + 1,
        itemType: item.type,
        lessonId: item.lessonId,
        activityId: null,
        required: true,
        status: item.status,
        lesson: item.lessonId
          ? {
              id: item.lessonId,
              title: item.title,
              description: item.description,
            }
          : null,
      })),
    [home?.dailyPlan],
  );
  const planItems = usesPersistentPlan
    ? (persistentPlan?.items ?? [])
    : legacyItems;
  const completedItems = planItems.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const totalItems = planItems.length;
  const nextItem =
    planItems.find((item) => item.status === "STARTED") ??
    planItems.find((item) => item.status === "READY");
  const allDone =
    totalItems > 0 &&
    planItems.every((item) => ["COMPLETED", "SKIPPED"].includes(item.status));
  const noAssignment =
    persistentPlan?.contentSource.mode === "UNASSIGNED_FALLBACK" &&
    !persistentPlan.plan;
  const todayTitle = childDisplayName
    ? `Hôm nay ${childDisplayName} học gì?`
    : "Hôm nay con học gì?";
  const headline = !childProfileId
    ? "Chưa chọn hồ sơ học sinh"
    : noAssignment
      ? "Chưa có lộ trình được giao"
      : allDone
        ? "Hôm nay con học xong rồi"
        : totalItems > 0
          ? `Hôm nay con có ${totalItems} việc học`
          : "Chưa có kế hoạch hôm nay";
  const progressLabel =
    totalItems > 0 ? `Con đã hoàn thành ${completedItems}/${totalItems}` : "";
  const earnedStars = totalItems > 0 ? Math.min(3, completedItems) : 0;
  const targetStars = totalItems > 0 ? Math.min(3, totalItems) : 0;

  async function postPlanItemAction(
    item: LearningPersistentDailyPlanItem,
    action: "start" | "complete" | "skip",
  ) {
    if (!usesPersistentPlan || item.planId === "legacy") {
      return null;
    }

    setBusyItemId(item.id);
    setActionStatus("");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/daily-plans/${item.planId}/items/${item.id}/${action}`,
        {
          method: "POST",
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(await readPlanActionError(response));
      }

      return (await response.json()) as LearningPersistentDailyPlan;
    } finally {
      setBusyItemId(null);
    }
  }

  async function startPlanItem(item: LearningPersistentDailyPlanItem) {
    if (item.status === "LOCKED") {
      setActionStatus(blockedPlanMessage(item.blockedReason));
      return;
    }

    const target = item.itemType === "PRACTICE" ? "practice" : "video";
    if (item.status === "READY") {
      try {
        await postPlanItemAction(item, "start");
        await loadHome();
      } catch (error) {
        setActionStatus(
          error instanceof Error
            ? error.message
            : "Không thể bắt đầu việc học.",
        );
        return;
      }
    }

    if (item.lessonId) {
      onResume(
        item.lessonId,
        target,
        item.itemType === "VIDEO"
          ? videoPlanContextFromItem(item)
          : item.itemType === "PRACTICE"
            ? practicePlanContextFromItem(item)
            : undefined,
      );
      setActionStatus(
        item.itemType === "PRACTICE"
          ? "Đã mở phần làm bài cho việc học này."
          : "Đã mở video cho việc học này.",
      );
      return;
    }

    setActionStatus("Việc học này chưa có nội dung để mở.");
  }

  async function completePlanItem(item: LearningPersistentDailyPlanItem) {
    try {
      const updatedPlan = await postPlanItemAction(item, "complete");
      await loadHome();
      const updatedItem = updatedPlan?.items.find(
        (planItem) => planItem.id === item.id,
      );
      const planFinished =
        updatedPlan?.plan?.status === "COMPLETED" ||
        updatedPlan?.items.every((planItem) =>
          ["COMPLETED", "SKIPPED"].includes(planItem.status),
        ) === true;

      if (planFinished) {
        setActionStatus(
          "Giỏi quá, hệ thống đã xác nhận xong kế hoạch hôm nay.",
        );
        return;
      }

      setActionStatus(
        updatedItem?.status === "COMPLETED"
          ? "Tốt lắm, việc học này đã hoàn thành."
          : "Đã kiểm tra và cập nhật tiến độ học.",
      );
    } catch (error) {
      setActionStatus(
        error instanceof Error
          ? error.message
          : blockedPlanMessage(item.blockedReason),
      );
    }
  }

  async function skipPlanItem(item: LearningPersistentDailyPlanItem) {
    try {
      await postPlanItemAction(item, "skip");
      await loadHome();
      setActionStatus("Đã bỏ qua việc học không bắt buộc.");
    } catch (error) {
      setActionStatus(
        error instanceof Error
          ? error.message
          : "Không thể bỏ qua việc học này.",
      );
    }
  }

  return (
    <section
      className="mt-4 scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
      id="student-today-panel"
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Học hôm nay
            </p>
            {home && home.streak > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                <Flame size={12} />
                {home.streak} ngày
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{todayTitle}</p>
              <h2 className="mt-1 text-xl font-semibold">{headline}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {progressLabel || message}
              </p>
            </div>
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white disabled:opacity-50"
              disabled={!nextItem || usage?.limitReached}
              onClick={() => nextItem && void startPlanItem(nextItem)}
              type="button"
            >
              <CirclePlay size={18} />
              Học tiếp
            </button>
          </div>

          {home && (
            <>
              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {[
                  [
                    "Kế hoạch",
                    totalItems > 0 ? `${completedItems}/${totalItems}` : "--",
                  ],
                  [
                    "Sao hôm nay",
                    targetStars > 0 ? `${earnedStars}/${targetStars}` : "--",
                  ],
                  [
                    "Đã dùng",
                    usage ? formatStudyMinutes(usage.usedMinutes) : "--",
                  ],
                  [
                    "Còn lại",
                    usage?.remainingMinutes === null
                      ? "Không giới hạn"
                      : usage
                        ? formatStudyMinutes(usage.remainingMinutes ?? 0)
                        : "--",
                  ],
                ].map(([label, value]) => (
                  <div className="rounded-lg bg-slate-100 p-3" key={label}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Tiến độ hôm nay</span>
                  <span>
                    {totalItems > 0
                      ? `${Math.round((completedItems / totalItems) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-teal-600"
                    style={{
                      width:
                        totalItems > 0
                          ? `${Math.round((completedItems / totalItems) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <p className="mt-3 text-sm text-slate-500">{message}</p>
          {actionStatus && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {actionStatus}
            </p>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Kế hoạch hôm nay</h3>
            <span className="text-xs font-medium text-slate-500">
              {persistentPlan?.planDate ?? "Hôm nay"}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {planItems.map((item) => (
              <div
                className={`rounded-lg border p-3 ${
                  item.status === "LOCKED"
                    ? "border-slate-200 bg-slate-50"
                    : item.status === "COMPLETED"
                      ? "border-teal-200 bg-teal-50"
                      : item.status === "STARTED"
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 bg-white"
                }`}
                key={item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                      {item.itemType === "PRACTICE" ? (
                        <Gamepad2 size={17} />
                      ) : item.itemType === "REST" ? (
                        <LockKeyhole size={17} />
                      ) : item.itemType === "REVIEW" ? (
                        <RotateCcw size={17} />
                      ) : item.itemType === "AI_CONVERSATION" ? (
                        <Bot size={17} />
                      ) : item.itemType === "REWARD" ? (
                        <Crown size={17} />
                      ) : (
                        <FileVideo size={17} />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {planItemTitle(item)}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {planItemDescription(item)}
                      </span>
                      {planItemEvidenceText(item) && (
                        <span className="mt-2 block text-xs text-slate-600">
                          {planItemEvidenceText(item)}
                        </span>
                      )}
                      {item.blockedReason && (
                        <span className="mt-2 block rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-900">
                          {blockedPlanMessage(item.blockedReason)}
                        </span>
                      )}
                    </span>
                  </div>
                  <span className={planStatusClass(item.status)}>
                    {planStatusLabel(item.status)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-medium text-white disabled:opacity-50"
                    disabled={
                      item.status === "LOCKED" ||
                      item.status === "COMPLETED" ||
                      item.status === "SKIPPED" ||
                      busyItemId === item.id ||
                      !item.lessonId ||
                      item.itemType === "AI_CONVERSATION" ||
                      item.itemType === "REWARD"
                    }
                    onClick={() => void startPlanItem(item)}
                    type="button"
                  >
                    <Play size={15} />
                    {item.status === "STARTED"
                      ? "Học tiếp"
                      : primaryPlanActionLabel(item)}
                  </button>
                  <button
                    className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 disabled:opacity-50"
                    disabled={
                      !usesPersistentPlan ||
                      item.status === "LOCKED" ||
                      item.status === "COMPLETED" ||
                      item.status === "SKIPPED" ||
                      busyItemId === item.id
                    }
                    onClick={() => void completePlanItem(item)}
                    type="button"
                  >
                    <CheckCircle2 size={15} />
                    {completePlanActionLabel(item)}
                  </button>
                  {!item.required && (
                    <button
                      className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 disabled:opacity-50"
                      disabled={
                        !usesPersistentPlan ||
                        item.status === "COMPLETED" ||
                        item.status === "SKIPPED" ||
                        busyItemId === item.id
                      }
                      onClick={() => void skipPlanItem(item)}
                      type="button"
                    >
                      Bỏ qua
                    </button>
                  )}
                  {(item.itemType === "AI_CONVERSATION" ||
                    item.itemType === "REWARD") && (
                    <span className="flex h-9 items-center rounded-lg bg-slate-100 px-3 text-xs font-medium text-slate-500">
                      Sắp mở
                    </span>
                  )}
                </div>
              </div>
            ))}
            {home && planItems.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                {noAssignment
                  ? "Hồ sơ này chưa có gói học hoặc lộ trình đang hoạt động."
                  : "Hôm nay chưa có việc học nào cần làm."}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function childHomeMessage(home: LearningHomePayload) {
  const plan = home.persistentDailyPlan;
  if (home.deviceUsage.limitReached) {
    return "Hôm nay con đã hết thời gian dùng app. Hãy hỏi bố/mẹ để học thêm.";
  }
  if (plan?.contentSource.mode === "UNASSIGNED_FALLBACK" && !plan.plan) {
    return "Hồ sơ này chưa được giao gói học/lộ trình học đang hoạt động.";
  }
  if (plan?.plan?.status === "COMPLETED") {
    return "Con đã hoàn thành kế hoạch hôm nay.";
  }
  if (plan?.items.length) {
    return "Bắt đầu từ việc học đầu tiên đang sẵn sàng.";
  }
  return "Chưa có kế hoạch học hôm nay.";
}

function friendlyLearningError(message: string) {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("subscription") ||
    normalized.includes("entitlement")
  ) {
    return "Hồ sơ này chưa có gói học hợp lệ hoặc quyền học đã hết hạn.";
  }
  if (normalized.includes("childprofileid")) {
    return "Cần chọn hồ sơ học sinh trước khi học.";
  }
  if (normalized.includes("limit")) {
    return "Hôm nay con đã hết thời gian học. Hãy hỏi bố/mẹ để học thêm.";
  }
  if (
    normalized.includes("not found") ||
    normalized.includes("access denied")
  ) {
    return "Không tìm thấy hồ sơ học sinh thuộc quyền tài khoản này.";
  }
  return message;
}

async function fetchLearningHomePayload(
  childProfileId: string,
  authHeaders: HeadersInit,
) {
  const params = childProfileId
    ? `?childProfileId=${encodeURIComponent(childProfileId)}`
    : "";
  const response = await fetch(`${apiBaseUrl}/v1/learning/home${params}`, {
    headers: authHeaders,
  });
  if (!response.ok) {
    throw new Error(
      friendlyLearningError(
        await readApiError(response, "Không thể tải kế hoạch học."),
      ),
    );
  }

  return (await response.json()) as LearningHomePayload;
}

async function readPlanActionError(response: Response) {
  try {
    const payload = (await response.json()) as { message?: unknown };
    const rawMessage = payload.message;
    if (typeof rawMessage === "string") {
      return blockedPlanMessage(rawMessage);
    }
    if (rawMessage && typeof rawMessage === "object") {
      const detail = rawMessage as { code?: string; message?: string };
      return blockedPlanMessage(detail.code ?? detail.message);
    }
  } catch {
    // Fall through to the status-based fallback below.
  }
  return response.status === 403
    ? "Chưa đủ điều kiện hoàn thành."
    : "Không thể cập nhật việc học.";
}

function blockedPlanMessage(reason?: string | null) {
  const normalized = reason ?? "";
  if (normalized === "WATCH_EVIDENCE_INSUFFICIENT") {
    return "Con cần xem thêm video trước khi hoàn thành.";
  }
  if (
    normalized === "PRACTICE_SCORE_INSUFFICIENT" ||
    normalized === "PRACTICE_SCORE_BELOW_MIN" ||
    normalized.toLowerCase().includes("score")
  ) {
    return "Con cần làm bài đạt điểm cao hơn.";
  }
  if (
    normalized === "NO_BACKEND_ATTEMPT" ||
    normalized === "PRACTICE_ATTEMPT_REQUIRED" ||
    normalized.toLowerCase().includes("attempt")
  ) {
    return "Con cần nộp bài trước.";
  }
  if (normalized.toLowerCase().includes("watch")) {
    return "Con cần xem thêm video trước khi hoàn thành.";
  }
  return "Chưa đủ điều kiện hoàn thành.";
}

function planItemTitle(item: LearningPersistentDailyPlanItem) {
  if (item.itemType === "PRACTICE") {
    return item.activity?.title ?? item.lesson?.title ?? "Làm bài luyện tập";
  }
  if (item.itemType === "VIDEO") {
    return item.lesson?.title ?? "Xem video";
  }
  if (item.itemType === "AI_CONVERSATION") {
    return "Nói chuyện với AI";
  }
  if (item.itemType === "REWARD") {
    return "Nhận phần thưởng";
  }
  if (item.itemType === "REVIEW") {
    return item.lesson?.title ?? "Ôn lại bài cũ";
  }
  return item.lesson?.title ?? "Việc học";
}

function planItemDescription(item: LearningPersistentDailyPlanItem) {
  const required = item.required ? "Bắt buộc" : "Không bắt buộc";
  if (item.itemType === "VIDEO") {
    return `${required} - Xem video`;
  }
  if (item.itemType === "PRACTICE") {
    return `${required} - Làm bài sau video`;
  }
  if (item.itemType === "AI_CONVERSATION") {
    return "Sắp mở - nói chuyện với AI theo bài học";
  }
  if (item.itemType === "REWARD") {
    return "Sắp mở - phần thưởng sau khi học";
  }
  return required;
}

function planItemEvidenceText(item: LearningPersistentDailyPlanItem) {
  const evidence = item.evidenceSummary;
  if (!evidence) return "";
  if (item.itemType === "VIDEO") {
    return `Video đã ghi nhận ${evidence.watchPercent ?? 0}%, mốc hoàn thành ${
      evidence.minWatchPercent ?? item.minWatchPercent ?? 80
    }%.`;
  }
  if (item.itemType === "PRACTICE") {
    const minScore = evidence.minScore ?? item.minScore;
    const statusText =
      evidence.passed === true
        ? "đã đủ điểm"
        : evidence.passed === false
          ? "chưa đủ điểm"
          : "đang chờ kiểm tra";
    return `Bài luyện đạt ${evidence.percent ?? 0}%${
      minScore !== null && minScore !== undefined ? `, mốc ${minScore}%` : ""
    } - ${statusText}.`;
  }
  return "";
}

function videoPlanContextFromItem(
  item: LearningPersistentDailyPlanItem,
): ActiveVideoPlanContext | undefined {
  if (!item.lessonId) return undefined;

  return {
    kind: "VIDEO",
    lessonId: item.lessonId,
    itemId: item.id,
    planId: item.planId,
    watchPercent: item.evidenceSummary?.watchPercent,
    minWatchPercent:
      item.evidenceSummary?.minWatchPercent ?? item.minWatchPercent ?? 80,
    passed: item.evidenceSummary?.passed,
    blockedReason: item.blockedReason,
  };
}

function practicePlanContextFromItem(
  item: LearningPersistentDailyPlanItem,
): ActivePracticePlanContext | undefined {
  if (!item.lessonId) return undefined;

  return {
    kind: "PRACTICE",
    lessonId: item.lessonId,
    activityId: item.activityId,
    itemId: item.id,
    planId: item.planId,
    status: item.status,
    percent: item.evidenceSummary?.percent,
    minScore: item.evidenceSummary?.minScore ?? item.minScore ?? 80,
    score: item.evidenceSummary?.score,
    maxScore: item.evidenceSummary?.maxScore,
    passed: item.evidenceSummary?.passed,
    blockedReason: item.blockedReason,
    attemptId: item.evidenceSummary?.attemptId,
  };
}

function findPracticeDailyPlanItem(
  home: LearningHomePayload,
  input: {
    activityId?: string | null;
    itemId?: string;
    lessonId: string;
  },
) {
  const items = home.persistentDailyPlan?.items ?? [];
  const practiceItems = items.filter((item) => item.itemType === "PRACTICE");

  return (
    practiceItems.find((item) => input.itemId && item.id === input.itemId) ??
    practiceItems.find(
      (item) => input.activityId && item.activityId === input.activityId,
    ) ??
    practiceItems.find((item) => item.lessonId === input.lessonId) ??
    null
  );
}

function practiceDailyPlanContextMessage(
  context: ActivePracticePlanContext | null,
) {
  if (!context) return "";
  if (context.status === "COMPLETED") {
    return "Hệ thống đã xác nhận bài luyện tập hoàn thành trong kế hoạch hôm nay.";
  }
  if (context.passed) {
    return "Đã đủ điểm. Bấm kiểm tra ở Học hôm nay để xác nhận hoàn thành.";
  }
  if (context.blockedReason) {
    return blockedPlanMessage(context.blockedReason);
  }
  return "Sau khi nộp bài, kế hoạch hôm nay sẽ cập nhật kết quả.";
}

function practiceDailyPlanRefreshMessage(input: {
  context: ActivePracticePlanContext | null;
  item: LearningPersistentDailyPlanItem | null;
  percent: number;
  refreshed: boolean;
  requiredScore: number;
}) {
  if (!input.refreshed) {
    return input.percent >= input.requiredScore
      ? "Bài vừa nộp đã đủ điểm, nhưng kế hoạch hôm nay chưa cập nhật. Hãy thử bấm kiểm tra ở Học hôm nay."
      : "Con cần đạt thêm điểm để hoàn thành bài luyện; kế hoạch hôm nay chưa cập nhật.";
  }
  if (!input.item || !input.context) {
    return "Kế hoạch hôm nay đã cập nhật, nhưng chưa tìm thấy bài luyện tập tương ứng.";
  }
  if (input.context.status === "COMPLETED") {
    return "Bài luyện tập đã hoàn thành; sao hôm nay và tiến độ đã cập nhật.";
  }
  if (input.context.passed) {
    return "Đã đủ điểm. Bấm kiểm tra ở Học hôm nay để xác nhận hoàn thành.";
  }
  if (input.context.blockedReason) {
    return blockedPlanMessage(input.context.blockedReason);
  }
  return input.percent >= input.requiredScore
    ? "Bài vừa nộp đã đạt điểm; kế hoạch hôm nay đã cập nhật. Bấm kiểm tra để xác nhận hoàn thành."
    : "Con cần đạt thêm điểm để hoàn thành bài luyện.";
}

function primaryPlanActionLabel(item: LearningPersistentDailyPlanItem) {
  if (item.itemType === "PRACTICE") return "Làm bài";
  if (item.itemType === "VIDEO") return "Xem video";
  if (item.itemType === "REVIEW") return "Ôn lại";
  return "Mở";
}

function completePlanActionLabel(item: LearningPersistentDailyPlanItem) {
  if (item.itemType === "PRACTICE") {
    return item.evidenceSummary?.passed
      ? "Kiểm tra hoàn thành"
      : "Kiểm tra điểm";
  }
  if (item.itemType === "VIDEO") {
    return "Kiểm tra hoàn thành";
  }
  return "Kiểm tra hoàn thành";
}

function planStatusLabel(status: LearningDailyPlanItemStatus) {
  const labels: Record<LearningDailyPlanItemStatus, string> = {
    READY: "Sẵn sàng",
    STARTED: "Đang học",
    COMPLETED: "Đã xong",
    SKIPPED: "Đã bỏ qua",
    LOCKED: "Đang khóa",
  };
  return labels[status];
}

function lessonProgressStatusLabel(
  status: VideoFeedLesson["progress"]["status"],
) {
  const labels: Record<VideoFeedLesson["progress"]["status"], string> = {
    NOT_STARTED: "Chưa bắt đầu",
    IN_PROGRESS: "Đang học",
    COMPLETED: "Đã hoàn thành",
  };
  return labels[status];
}

function learningPathStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Đang soạn",
    IN_REVIEW: "Đang kiểm tra",
    PUBLISHED: "Đang hoạt động",
    ARCHIVED: "Đã lưu trữ",
  };
  return labels[status] ?? status;
}

function dailyLearningPlanStatusLabel(status?: string | null) {
  if (!status) return "Chưa có kế hoạch";
  const labels: Record<string, string> = {
    DRAFT: "Đang chuẩn bị",
    ACTIVE: "Đang học",
    COMPLETED: "Đã hoàn thành",
    SKIPPED: "Đã bỏ qua",
    EXPIRED: "Đã hết hạn",
  };
  return labels[status] ?? status;
}

function learningItemStatusLabel(status?: string | null) {
  if (!status) return "Chưa có trạng thái";
  const labels: Record<string, string> = {
    READY: "Sẵn sàng",
    STARTED: "Đang học",
    COMPLETED: "Đã hoàn thành",
    SKIPPED: "Đã bỏ qua",
    LOCKED: "Đang khóa",
    ACTIVE: "Đang học",
    DRAFT: "Đang chuẩn bị",
    EXPIRED: "Đã hết hạn",
  };
  return labels[status] ?? status;
}

function learningPlanItemTypeLabel(type: string) {
  const labels: Record<string, string> = {
    VIDEO: "Video",
    PRACTICE: "Bài luyện",
    GAME: "Trò chơi",
    AI_CONVERSATION: "Luyện nói",
    REVIEW: "Ôn lại",
    REWARD: "Phần thưởng",
    REST: "Nghỉ",
  };
  return labels[type] ?? type;
}

function planStatusClass(status: LearningDailyPlanItemStatus) {
  const classes: Record<LearningDailyPlanItemStatus, string> = {
    READY:
      "shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700",
    STARTED:
      "shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800",
    COMPLETED:
      "shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700",
    SKIPPED:
      "shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600",
    LOCKED:
      "shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600",
  };
  return classes[status];
}

function videoDurationSeconds(
  lesson?: VideoFeedLesson,
  video?: VideoFeedLesson["videos"][number],
) {
  return Math.max(
    1,
    Math.floor(lesson?.durationSec ?? video?.durationSec ?? 600),
  );
}

function safeDurationSeconds(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0
    ? Math.max(1, Math.floor(value))
    : fallback;
}

function watchPercentFromPosition(positionSec: number, durationSec: number) {
  return Math.max(
    0,
    Math.min(100, Math.round((positionSec / Math.max(1, durationSec)) * 100)),
  );
}

function videoEvidenceFromContext(
  context: ActiveVideoPlanContext,
  durationSec: number,
): VideoWatchEvidence {
  const watchPercent = Math.max(
    0,
    Math.min(100, Math.round(context.watchPercent ?? 0)),
  );
  const minWatchPercent = context.minWatchPercent ?? 80;

  return {
    positionSec: Math.round((durationSec * watchPercent) / 100),
    durationWatchedSec: 0,
    watchPercent,
    minWatchPercent,
    passed: context.passed === true,
    durationSec,
  };
}

function videoEvidenceStatusLabel(input: {
  hasBackendEvidence: boolean;
  passed: boolean;
  watchPercent: number;
  minWatchPercent: number;
}) {
  if (!input.hasBackendEvidence) return "Chưa ghi nhận";
  if (input.passed) return "Đã đủ điều kiện";
  if (input.watchPercent <= 0) return "Chưa xem";
  return `Chưa đủ ${input.minWatchPercent}%`;
}

function videoEvidenceStatusClass(input: {
  hasBackendEvidence: boolean;
  passed: boolean;
}) {
  if (!input.hasBackendEvidence) return "bg-slate-200 text-slate-700";
  if (input.passed) return "bg-teal-100 text-teal-700";
  return "bg-amber-100 text-amber-800";
}

function videoEvidenceMessage(evidence: VideoWatchEvidence) {
  if (evidence.passed) {
    return `Hệ thống đã ghi nhận con xem đủ ${evidence.watchPercent}% video.`;
  }
  return `Hệ thống đã ghi nhận ${evidence.watchPercent}%, cần ${evidence.minWatchPercent}% để hoàn thành.`;
}

function screenTimeLimitText(usage: LearningUsageStatus) {
  if (!usage.isLimited || usage.limitMinutes === null) {
    return "Không giới hạn";
  }
  if (usage.baseLimitMinutes && usage.grantedExtraMinutes) {
    return `${formatStudyMinutes(usage.baseLimitMinutes)} + ${formatStudyMinutes(
      usage.grantedExtraMinutes,
    )}`;
  }
  return formatStudyMinutes(usage.limitMinutes);
}

function screenTimeMessage(usage: LearningUsageStatus) {
  if (usage.limitReached) {
    return "Hôm nay con đã hết thời gian học. Hãy nhờ bố mẹ cấp thêm thời gian ở tab Học sinh.";
  }
  if (usage.isWarning && usage.remainingMinutes !== null) {
    return `Sắp hết giờ học, còn khoảng ${formatStudyMinutes(
      usage.remainingMinutes,
    )}.`;
  }
  if (!usage.isLimited) {
    return "Hôm nay chưa đặt giới hạn thời gian học.";
  }
  return "Thời gian học do hệ thống theo dõi; màn hình chỉ hiển thị số phút đã được ghi nhận.";
}

function useAuthenticatedUploadUrl(
  sourceUrl: string | undefined,
  accessToken: string,
  childProfileId?: string,
) {
  const [loadedUpload, setLoadedUpload] = useState<{
    sourceUrl: string;
    playbackUrl: string;
  }>();

  useEffect(() => {
    if (!sourceUrl?.startsWith("/uploads/")) return;

    const controller = new AbortController();
    let objectUrl: string | undefined;
    const requestUrl = new URL(`${apiBaseUrl}${sourceUrl}`);
    if (childProfileId) {
      requestUrl.searchParams.set("childProfileId", childProfileId);
    }

    void fetch(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            await readApiError(response, "Bạn không có quyền xem video này."),
          );
        }
        return response.blob();
      })
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setLoadedUpload({ sourceUrl, playbackUrl: objectUrl });
      })
      .catch(() => undefined);

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [accessToken, childProfileId, sourceUrl]);

  if (!sourceUrl) return undefined;
  if (!sourceUrl.startsWith("/uploads/")) {
    return sourceUrl.startsWith("http")
      ? sourceUrl
      : `${apiBaseUrl}${sourceUrl}`;
  }
  return loadedUpload?.sourceUrl === sourceUrl
    ? loadedUpload.playbackUrl
    : undefined;
}

async function openAuthenticatedUpload(sourceUrl: string, accessToken: string) {
  const requestUrl = new URL(sourceUrl, apiBaseUrl);
  if (requestUrl.origin !== new URL(apiBaseUrl).origin) {
    throw new Error("Đường dẫn tệp bảo vệ nằm ngoài API đã cấu hình.");
  }
  const response = await fetch(requestUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Bạn không có quyền truy cập tệp này."),
    );
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

function VideoImmersionPanel({
  childProfileId,
  onLessonChange,
  planContext,
  requestedLessonId,
  session,
}: {
  childProfileId: string;
  onLessonChange?: (lessonId: string) => void;
  planContext?: ActiveVideoPlanContext | null;
  requestedLessonId?: string;
  session: Session;
}) {
  const [feed, setFeed] = useState<VideoFeedPayload | null>(null);
  const [activeCourseId, setActiveCourseId] = useState("");
  const [activeTopicId, setActiveTopicId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [usage, setUsage] = useState<LearningUsageStatus | null>(null);
  const [studyTimerActive, setStudyTimerActive] = useState(false);
  const [message, setMessage] = useState("Đang tải video.");
  const [isSaving, setIsSaving] = useState(false);
  const [watchEvidenceByLessonId, setWatchEvidenceByLessonId] = useState<
    Record<string, VideoWatchEvidence>
  >({});

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const courses = useMemo(() => feed?.courses ?? [], [feed?.courses]);
  const activeCourse =
    courses.find((course) => course.id === activeCourseId) ?? courses[0];
  const topics = Array.from(
    new Map(
      courses
        .flatMap((course) => course.units)
        .flatMap((unit) => unit.lessons)
        .flatMap((lesson) => lesson.tags.filter((tag) => tag.kind === "TOPIC"))
        .map((tag) => [tag.id, tag]),
    ).values(),
  );
  const allLessons = courses.flatMap((course) =>
    course.units.flatMap((unit) => unit.lessons),
  );
  const activeLessons =
    activeCourse?.units
      .flatMap((unit) => unit.lessons)
      .filter((lesson) =>
        activeTopicId
          ? lesson.tags.some((tag) => tag.id === activeTopicId)
          : true,
      ) ?? [];
  const selectedLesson =
    allLessons.find((lesson) => lesson.id === selectedLessonId) ??
    activeLessons[0] ??
    allLessons[0];
  const selectedVideo = selectedLesson?.videos[0];
  const selectedVideoUrl = useAuthenticatedUploadUrl(
    selectedVideo?.sourceUrl,
    session.accessToken,
    childProfileId,
  );
  const selectedDurationSec = videoDurationSeconds(
    selectedLesson,
    selectedVideo,
  );
  const selectedContextEvidence =
    selectedLesson && planContext?.lessonId === selectedLesson.id
      ? videoEvidenceFromContext(planContext, selectedDurationSec)
      : null;
  const selectedWatchEvidence = selectedLesson
    ? (watchEvidenceByLessonId[selectedLesson.id] ?? selectedContextEvidence)
    : null;
  const localWatchPercent = selectedLesson
    ? watchPercentFromPosition(
        selectedLesson.progress.lastPositionSec,
        selectedDurationSec,
      )
    : 0;
  const displayWatchPercent =
    selectedWatchEvidence?.watchPercent ?? localWatchPercent;
  const requiredWatchPercent =
    selectedWatchEvidence?.minWatchPercent ??
    (selectedLesson && planContext?.lessonId === selectedLesson.id
      ? planContext.minWatchPercent
      : undefined) ??
    80;
  const evidencePassed = selectedWatchEvidence?.passed === true;
  const hasBackendEvidence = Boolean(selectedWatchEvidence);
  const evidenceStatusLabel = videoEvidenceStatusLabel({
    hasBackendEvidence,
    passed: evidencePassed,
    watchPercent: displayWatchPercent,
    minWatchPercent: requiredWatchPercent,
  });

  const loadUsage = useCallback(async () => {
    try {
      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/usage/today${cpParam}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as LearningUsageStatus;
      setUsage(data);
      if (data.limitReached) {
        setStudyTimerActive(false);
        setMessage(
          "Hôm nay con đã hết thời gian học. Hãy nhờ bố mẹ cấp thêm thời gian.",
        );
      }
    } catch {
      // Usage is advisory in the UI; backend still enforces the limit.
    }
  }, [authHeaders, childProfileId]);

  const loadFeed = useCallback(async () => {
    try {
      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/videos/feed${cpParam}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        await loadUsage();
        throw new Error(
          friendlyLearningError(
            await readApiError(response, "Không thể tải video."),
          ),
        );
      }

      const data = (await response.json()) as VideoFeedPayload;
      const firstCourse = data.courses[0];
      const firstLesson = firstCourse?.units.flatMap((unit) => unit.lessons)[0];
      setFeed(data);
      setUsage(data.deviceUsage ?? null);
      setActiveCourseId((current) => current || firstCourse?.id || "");
      setSelectedLessonId((current) => current || firstLesson?.id || "");
      setMessage(
        firstLesson
          ? "Chọn video và bật xem để hệ thống ghi nhận tiến độ."
          : "Hôm nay chưa có video phù hợp.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải video.",
      );
    }
  }, [authHeaders, childProfileId, loadUsage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFeed();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFeed]);

  useEffect(() => {
    if (selectedLesson?.id) {
      onLessonChange?.(selectedLesson.id);
    }
  }, [onLessonChange, selectedLesson?.id]);

  useEffect(() => {
    if (!requestedLessonId || courses.length === 0) {
      return;
    }

    const nextLesson = courses
      .flatMap((course) => course.units)
      .flatMap((unit) => unit.lessons)
      .find((lesson) => lesson.id === requestedLessonId);
    if (!nextLesson) {
      return;
    }

    const nextCourse = courses.find((course) =>
      course.units.some((unit) =>
        unit.lessons.some((lesson) => lesson.id === requestedLessonId),
      ),
    );
    const timer = window.setTimeout(() => {
      setSelectedLessonId(nextLesson.id);
      setActiveCourseId((current) => nextCourse?.id ?? current);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [courses, requestedLessonId]);

  const applyLessonProgress = useCallback(
    (lessonId: string, progress: VideoFeedLesson["progress"]) => {
      setFeed((current) =>
        current
          ? {
              courses: current.courses.map((course) => ({
                ...course,
                units: course.units.map((unit) => ({
                  ...unit,
                  lessons: unit.lessons.map((lesson) =>
                    lesson.id === lessonId ? { ...lesson, progress } : lesson,
                  ),
                })),
              })),
            }
          : current,
      );
    },
    [],
  );

  const recordWatch = useCallback(
    async (
      lesson: VideoFeedLesson,
      event: "STARTED" | "PROGRESSED" | "COMPLETED" | "REPLAYED",
      lastPositionSec?: number,
      watchedDurationSec?: number,
    ) => {
      try {
        const cpParam = childProfileId
          ? `?childProfileId=${encodeURIComponent(childProfileId)}`
          : "";
        const response = await fetch(
          `${apiBaseUrl}/v1/learning/lessons/${lesson.id}/watch${cpParam}`,
          {
            method: "POST",
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event,
              lastPositionSec: Math.max(0, Math.floor(lastPositionSec ?? 0)),
              ...(watchedDurationSec
                ? {
                    watchedDurationSec: Math.max(
                      1,
                      Math.floor(watchedDurationSec),
                    ),
                  }
                : {}),
            }),
          },
        );
        if (!response.ok) {
          if (response.status === 403) {
            setStudyTimerActive(false);
            await loadUsage();
          }
          throw new Error(
            friendlyLearningError(
              await readApiError(response, "Không thể ghi nhận tiến độ xem."),
            ),
          );
        }

        const progress =
          (await response.json()) as VideoFeedLesson["progress"] & {
            usage?: LearningUsageStatus;
            watchEvidence?: VideoWatchEvidence;
          };
        applyLessonProgress(lesson.id, {
          status: progress.status,
          lastPositionSec: progress.lastPositionSec,
          watchCount: progress.watchCount,
          lastWatchedAt: progress.lastWatchedAt,
          isFavorite: progress.isFavorite,
        });
        if (progress.watchEvidence) {
          setWatchEvidenceByLessonId((current) => ({
            ...current,
            [lesson.id]: progress.watchEvidence as VideoWatchEvidence,
          }));
          setMessage(videoEvidenceMessage(progress.watchEvidence));
        }
        if (progress.usage) {
          setUsage(progress.usage);
          if (progress.usage.limitReached) {
            setStudyTimerActive(false);
            setMessage(
              "Hôm nay con đã hết thời gian học. Hãy nhờ bố mẹ cấp thêm thời gian.",
            );
          }
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Không thể ghi nhận tiến độ xem.",
        );
      }
    },
    [applyLessonProgress, authHeaders, childProfileId, loadUsage],
  );

  useEffect(() => {
    if (!studyTimerActive || !selectedLesson || usage?.limitReached) {
      return;
    }

    const timer = window.setInterval(() => {
      void recordWatch(
        selectedLesson,
        "PROGRESSED",
        selectedLesson.progress.lastPositionSec + 60,
        60,
      );
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, [recordWatch, selectedLesson, studyTimerActive, usage?.limitReached]);

  async function toggleFavorite(lesson: VideoFeedLesson) {
    setIsSaving(true);
    try {
      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/lessons/${lesson.id}/favorite${cpParam}`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isFavorite: !lesson.progress.isFavorite }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể lưu bài yêu thích."),
        );
      }

      const progress = (await response.json()) as VideoFeedLesson["progress"];
      applyLessonProgress(lesson.id, progress);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể lưu bài yêu thích.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function selectLesson(lesson: VideoFeedLesson) {
    setSelectedLessonId(lesson.id);
    setStudyTimerActive(!usage?.limitReached);
    onLessonChange?.(lesson.id);
    void recordWatch(lesson, "STARTED", lesson.progress.lastPositionSec);
  }

  return (
    <section
      className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
      id="student-video-panel"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-teal-700">
            Học qua video
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {activeCourse?.title ?? "Thư viện video"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex max-w-full gap-2 overflow-auto">
          {courses.map((course) => (
            <button
              className={`h-9 whitespace-nowrap rounded-lg px-3 text-sm font-medium ring-1 ${
                course.id === activeCourse?.id
                  ? "bg-slate-950 text-white ring-slate-950"
                  : "bg-white text-slate-700 ring-slate-200"
              }`}
              key={course.id}
              onClick={() => {
                setActiveCourseId(course.id);
                setSelectedLessonId(
                  course.units.flatMap((unit) => unit.lessons)[0]?.id ?? "",
                );
              }}
              type="button"
            >
              {course.level.code} / {course.title}
            </button>
          ))}
        </div>
      </div>

      {topics.length > 0 && (
        <div className="mt-3 flex max-w-full gap-2 overflow-auto">
          <button
            className={`h-8 whitespace-nowrap rounded-lg px-3 text-xs font-medium ring-1 ${
              activeTopicId
                ? "bg-white text-slate-700 ring-slate-200"
                : "bg-teal-700 text-white ring-teal-700"
            }`}
            onClick={() => setActiveTopicId("")}
            type="button"
          >
            Tất cả chủ đề
          </button>
          {topics.map((topic) => (
            <button
              className={`h-8 whitespace-nowrap rounded-lg px-3 text-xs font-medium ring-1 ${
                activeTopicId === topic.id
                  ? "bg-teal-700 text-white ring-teal-700"
                  : "bg-white text-slate-700 ring-slate-200"
              }`}
              key={topic.id}
              onClick={() => {
                setActiveTopicId(topic.id);
                const lesson = allLessons.find((item) =>
                  item.tags.some((tag) => tag.id === topic.id),
                );
                setSelectedLessonId(lesson?.id ?? "");
              }}
              type="button"
            >
              {topic.name}
            </button>
          ))}
        </div>
      )}

      {usage && (
        <div
          className={`mt-3 rounded-lg border p-3 text-sm ${
            usage.limitReached
              ? "border-rose-200 bg-rose-50"
              : usage.isWarning
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="grid gap-2 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Đã học hôm nay</p>
              <p className="mt-1 font-semibold">
                {formatStudyMinutes(usage.usedMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Giới hạn ngày</p>
              <p className="mt-1 font-semibold">{screenTimeLimitText(usage)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Còn lại</p>
              <p
                className={`mt-1 font-semibold ${
                  usage.limitReached
                    ? "text-rose-700"
                    : usage.isWarning
                      ? "text-amber-700"
                      : "text-teal-700"
                }`}
              >
                {usage.remainingMinutes === null
                  ? "Không giới hạn"
                  : formatStudyMinutes(usage.remainingMinutes)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Bộ đếm video</p>
                <p className="mt-1 font-semibold">
                  {studyTimerActive ? "Đang chạy" : "Đang dừng"}
                </p>
              </div>
              <button
                className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-medium disabled:opacity-50"
                disabled={!selectedLesson || usage.limitReached}
                onClick={() => setStudyTimerActive((current) => !current)}
                type="button"
              >
                {studyTimerActive ? "Dừng" : "Bắt đầu"}
              </button>
            </div>
          </div>
          <p
            className={`mt-2 text-xs ${
              usage.limitReached
                ? "text-rose-800"
                : usage.isWarning
                  ? "text-amber-800"
                  : "text-slate-500"
            }`}
          >
            {screenTimeMessage(usage)}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          {usage?.limitReached ? (
            <div className="grid aspect-video w-full place-items-center rounded-lg border border-rose-200 bg-rose-50 p-4 text-center text-sm font-medium text-rose-900">
              Hôm nay con đã hết thời gian học. Hãy nhờ bố mẹ cấp thêm thời
              gian.
            </div>
          ) : selectedVideo?.provider === "YOUTUBE" &&
            selectedVideo.embedUrl ? (
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="aspect-video w-full rounded-lg border border-slate-200"
              src={selectedVideo.embedUrl}
              title={selectedVideo.title ?? selectedLesson?.title ?? "Video"}
            />
          ) : selectedVideoUrl ? (
            <video
              className="aspect-video w-full rounded-lg border border-slate-200 bg-black"
              controls
              onEnded={(event) => {
                if (!selectedLesson) return;
                const durationSec = safeDurationSeconds(
                  event.currentTarget.duration,
                  selectedDurationSec,
                );
                setStudyTimerActive(false);
                void recordWatch(
                  selectedLesson,
                  "COMPLETED",
                  durationSec,
                  Math.max(
                    1,
                    durationSec - selectedLesson.progress.lastPositionSec,
                  ),
                );
              }}
              onPause={() => setStudyTimerActive(false)}
              onPlay={() => {
                setStudyTimerActive(true);
                return selectedLesson
                  ? void recordWatch(
                      selectedLesson,
                      "STARTED",
                      selectedLesson.progress.lastPositionSec,
                    )
                  : undefined;
              }}
              onTimeUpdate={(event) =>
                selectedLesson
                  ? applyLessonProgress(selectedLesson.id, {
                      ...selectedLesson.progress,
                      lastPositionSec: Math.floor(
                        event.currentTarget.currentTime,
                      ),
                    })
                  : undefined
              }
              src={selectedVideoUrl}
            />
          ) : (
            <div className="grid aspect-video w-full place-items-center rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-500">
              Chưa chọn video
            </div>
          )}

          {selectedLesson && (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-teal-700">
                      Bằng chứng xem video
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Cần xem đủ {requiredWatchPercent}% để hoàn thành phần
                      video.
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${videoEvidenceStatusClass(
                      {
                        hasBackendEvidence,
                        passed: evidencePassed,
                      },
                    )}`}
                  >
                    {evidenceStatusLabel}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-white">
                    <div
                      className={`h-2 rounded-full ${
                        evidencePassed ? "bg-teal-600" : "bg-amber-500"
                      }`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, displayWatchPercent),
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {displayWatchPercent}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {hasBackendEvidence
                    ? selectedWatchEvidence?.passed
                      ? "Hệ thống đã ghi nhận đủ thời lượng xem video."
                      : "Hệ thống đã ghi nhận tiến độ nhưng con cần xem thêm để hoàn thành."
                    : "Chưa có ghi nhận xem video. Bật video để hệ thống lưu tiến độ."}
                </p>
                {selectedLesson &&
                  planContext?.lessonId === selectedLesson.id && (
                    <p className="mt-1 text-xs text-teal-700">
                      Video này đang được mở từ kế hoạch học hôm nay.
                    </p>
                  )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold">
                    {selectedLesson.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedLesson.progress.watchCount} lần ghi nhận / tiến độ{" "}
                    {lessonProgressStatusLabel(selectedLesson.progress.status)}
                  </p>
                  {selectedLesson.tags.length > 0 && (
                    <p className="mt-2 flex flex-wrap gap-1 text-xs text-slate-500">
                      {selectedLesson.tags.map((tag) => (
                        <span
                          className="rounded-md bg-slate-100 px-2 py-1"
                          key={tag.id}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium disabled:opacity-60"
                    disabled={isSaving}
                    onClick={() => void toggleFavorite(selectedLesson)}
                    type="button"
                  >
                    {selectedLesson.progress.isFavorite ? "Đã lưu" : "Lưu bài"}
                  </button>
                  <button
                    className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium"
                    onClick={() =>
                      void recordWatch(selectedLesson, "REPLAYED", 0)
                    }
                    type="button"
                  >
                    Xem lại
                  </button>
                  <button
                    className="h-9 rounded-lg bg-teal-700 px-3 text-sm font-medium text-white"
                    onClick={() =>
                      void recordWatch(
                        selectedLesson,
                        "PROGRESSED",
                        selectedLesson.progress.lastPositionSec,
                      )
                    }
                    type="button"
                  >
                    Cập nhật tiến độ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-h-[520px] overflow-auto border-y border-slate-200">
          {(activeCourse?.units ?? []).map((unit) => (
            <div className="py-3" key={unit.id}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {unit.title}
              </p>
              <div className="space-y-2">
                {unit.lessons
                  .filter((lesson) =>
                    activeTopicId
                      ? lesson.tags.some((tag) => tag.id === activeTopicId)
                      : true,
                  )
                  .map((lesson) => (
                    <button
                      className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left ${
                        lesson.id === selectedLesson?.id
                          ? "border-teal-300 bg-teal-50"
                          : "border-slate-200 bg-white"
                      }`}
                      key={lesson.id}
                      onClick={() => selectLesson(lesson)}
                      type="button"
                    >
                      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                        <Play size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {lesson.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {lesson.progress.watchCount} lượt xem
                          {lesson.hasPractice ? " / bài luyện" : ""}
                          {lesson.progress.isFavorite ? " / đã lưu" : ""}
                        </p>
                        {lesson.tags.length > 0 && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {lesson.tags.map((tag) => tag.name).join(", ")}
                          </p>
                        )}
                      </div>
                      {lesson.progress.status === "COMPLETED" && (
                        <CheckCircle2
                          className="shrink-0 text-teal-600"
                          size={17}
                        />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type PracticeAttemptResult = {
  score: number;
  maxScore: number;
  responses: Array<{
    questionId: string;
    isCorrect: boolean;
    feedback?: string;
  }>;
};

type PracticeSubmitResponse = {
  questionId: string;
  selectedAnswerIds?: string[];
  textAnswer?: string;
  orderedAnswerIds?: string[];
};

function StudentPracticePanel({
  childProfileId,
  lessonId,
  onDailyPlanRefresh,
  planContext,
  session,
}: {
  childProfileId: string;
  lessonId?: string;
  onDailyPlanRefresh?: (refresh: PracticeDailyPlanRefresh) => void;
  planContext?: ActivePracticePlanContext | null;
  session: Session;
}) {
  const [practice, setPractice] = useState<PracticeLesson | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [orderedAnswers, setOrderedAnswers] = useState<
    Record<string, string[]>
  >({});
  const [result, setResult] = useState<PracticeAttemptResult | null>(null);
  const [refreshedPracticeContext, setRefreshedPracticeContext] =
    useState<ActivePracticePlanContext | null>(null);
  const [planRefreshMessage, setPlanRefreshMessage] = useState("");
  const [message, setMessage] = useState("Đang tải phần luyện tập.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadPractice = useCallback(async () => {
    try {
      if (!lessonId) {
        setPractice(null);
        setMessage("Chọn một bài video để mở phần luyện tập.");
        return;
      }

      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const practiceResponse = await fetch(
        `${apiBaseUrl}/v1/learning/lessons/${lessonId}/practice${cpParam}`,
        { headers: authHeaders },
      );
      if (!practiceResponse.ok) {
        throw new Error(
          friendlyLearningError(
            await readApiError(
              practiceResponse,
              "Không thể tải phần luyện tập.",
            ),
          ),
        );
      }

      const data = (await practiceResponse.json()) as PracticeLesson;
      setPractice(data);
      setSelectedAnswers({});
      setTextAnswers({});
      setOrderedAnswers({});
      setResult(null);
      setRefreshedPracticeContext(null);
      setPlanRefreshMessage("");
      setMessage(
        data.activities.length > 0
          ? "Trả lời từng câu rồi nộp để hệ thống chấm điểm."
          : "Bài video này chưa có phần luyện tập.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải phần luyện tập.",
      );
    }
  }, [authHeaders, childProfileId, lessonId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPractice();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPractice]);

  async function submitPractice() {
    const activity = practice?.activities[0];
    if (!activity) {
      return;
    }

    const responses = activity.questions.flatMap<PracticeSubmitResponse>(
      (question) => {
        if (!isPracticeQuestionAutoGraded(question)) {
          return [];
        }

        if (question.type === "TEXT_INPUT") {
          return [
            {
              questionId: question.id,
              textAnswer: textAnswers[question.id] ?? "",
            },
          ];
        }

        if (question.type === "ORDERING") {
          return [
            {
              questionId: question.id,
              orderedAnswerIds: orderedAnswerIdsFor(question),
            },
          ];
        }

        return [
          {
            questionId: question.id,
            selectedAnswerIds: selectedAnswers[question.id] ?? [],
          },
        ];
      },
    );

    if (responses.length === 0) {
      setMessage("Phần này chưa có câu hỏi có thể tự chấm.");
      return;
    }

    const unansweredCount = activity.questions.filter(
      (question) =>
        isPracticeQuestionAutoGraded(question) && !isQuestionAnswered(question),
    ).length;
    if (unansweredCount > 0) {
      setMessage("Con còn câu chưa trả lời. Hãy hoàn thành rồi nộp bài.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Đang nộp bài để hệ thống chấm điểm.");

    try {
      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/activities/${activity.id}/attempts${cpParam}`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            responses,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          friendlyLearningError(
            await readApiError(response, "Không thể nộp bài luyện tập."),
          ),
        );
      }

      const data = (await response.json()) as PracticeAttemptResult;
      const percent = practiceResultPercent(data);
      const requiredScore = requiredPracticeScoreForPlan(
        planContext,
        lessonId,
        activity,
      );
      let refreshedItem: LearningPersistentDailyPlanItem | null = null;
      let refreshedContext: ActivePracticePlanContext | null = null;
      let dailyPlanRefreshed = false;
      try {
        if (childProfileId && lessonId) {
          const refreshedHome = await fetchLearningHomePayload(
            childProfileId,
            authHeaders,
          );
          refreshedItem = findPracticeDailyPlanItem(refreshedHome, {
            activityId: activity.id,
            itemId: planContext?.itemId,
            lessonId,
          });
          refreshedContext = refreshedItem
            ? (practicePlanContextFromItem(refreshedItem) ?? null)
            : null;
          setRefreshedPracticeContext(refreshedContext);
          setPlanRefreshMessage(
            practiceDailyPlanRefreshMessage({
              context: refreshedContext,
              item: refreshedItem,
              percent,
              requiredScore,
              refreshed: true,
            }),
          );
          onDailyPlanRefresh?.({
            context: refreshedContext,
            home: refreshedHome,
            item: refreshedItem,
          });
          dailyPlanRefreshed = true;
        } else {
          setPlanRefreshMessage(
            "Đã nộp bài, nhưng chưa có hồ sơ con để cập nhật kế hoạch hôm nay.",
          );
        }
      } catch (refreshError) {
        setPlanRefreshMessage(
          refreshError instanceof Error
            ? `Đã nộp bài, nhưng chưa cập nhật được kế hoạch hôm nay: ${refreshError.message}`
            : "Đã nộp bài, nhưng chưa cập nhật được kế hoạch hôm nay.",
        );
      }
      setResult(data);
      const refreshSuffix = dailyPlanRefreshed
        ? " Kế hoạch hôm nay đã được cập nhật."
        : " Kế hoạch hôm nay chưa cập nhật được; " +
          "kết quả bài làm vẫn đã được chấm.";
      setMessage(
        percent >= requiredScore
          ? `Hệ thống đã chấm ${percent}%, đạt mốc ${requiredScore}%.${refreshSuffix}`
          : `Hệ thống đã chấm ${percent}%, cần ${requiredScore}% để hoàn thành ` +
              `việc học.${refreshSuffix}`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể nộp bài luyện tập.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleChoice(
    questionId: string,
    answerId: string,
    multiple: boolean,
  ) {
    setSelectedAnswers((current) => {
      if (!multiple) {
        return { ...current, [questionId]: [answerId] };
      }

      const currentAnswers = current[questionId] ?? [];
      const nextAnswers = currentAnswers.includes(answerId)
        ? currentAnswers.filter((item) => item !== answerId)
        : [...currentAnswers, answerId];

      return { ...current, [questionId]: nextAnswers };
    });
  }

  function orderedAnswerIdsFor(question: PracticeQuestion) {
    const current = orderedAnswers[question.id];
    return current?.length
      ? current
      : question.answers.map((answer) => answer.id);
  }

  function moveOrderedAnswer(
    question: PracticeQuestion,
    index: number,
    delta: number,
  ) {
    const current = orderedAnswerIdsFor(question);
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= current.length) {
      return;
    }

    const next = [...current];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setOrderedAnswers((state) => ({ ...state, [question.id]: next }));
  }

  function isQuestionAnswered(question: PracticeQuestion) {
    if (!isPracticeQuestionAutoGraded(question)) {
      return false;
    }

    if (question.type === "TEXT_INPUT") {
      return Boolean(textAnswers[question.id]?.trim());
    }

    if (question.type === "ORDERING") {
      return orderedAnswerIdsFor(question).length === question.answers.length;
    }

    return (selectedAnswers[question.id] ?? []).length > 0;
  }

  function resetPracticeRun() {
    setSelectedAnswers({});
    setTextAnswers({});
    setOrderedAnswers({});
    setResult(null);
    setPlanRefreshMessage("");
    setMessage("Làm lại từ đầu rồi nộp để hệ thống chấm điểm mới.");
  }

  const activity = practice?.activities[0];
  const candidatePracticeContext = refreshedPracticeContext ?? planContext;
  const practiceContext =
    candidatePracticeContext &&
    candidatePracticeContext.lessonId === lessonId &&
    (!activity ||
      !candidatePracticeContext.activityId ||
      candidatePracticeContext.activityId === activity.id)
      ? candidatePracticeContext
      : null;
  const requiredPracticeScore = requiredPracticeScoreForPlan(
    practiceContext,
    lessonId,
    activity,
  );
  const answerableQuestions =
    activity?.questions.filter(isPracticeQuestionAutoGraded) ?? [];
  const answeredCount =
    activity?.questions.filter(isQuestionAnswered).length ?? 0;
  const totalQuestions = activity?.questions.length ?? 0;
  const resultPercent = result ? practiceResultPercent(result) : null;
  const backendEvidencePercent = practiceContext?.percent ?? null;
  const passedPractice =
    practiceContext?.passed === true ||
    (resultPercent !== null && resultPercent >= requiredPracticeScore);
  const earnedPracticeStars =
    resultPercent !== null
      ? practiceStarsForPercent(resultPercent, requiredPracticeScore)
      : practiceContext?.passed
        ? 2
        : 0;
  const submitDisabled =
    isSubmitting ||
    Boolean(result) ||
    !activity ||
    answerableQuestions.length === 0 ||
    answeredCount < answerableQuestions.length;

  return (
    <section
      className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
      id="student-practice-panel"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Luyện tập
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {activity?.title ?? "Phần luyện tập đang chuẩn bị"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="grid min-w-full grid-cols-3 gap-2 sm:min-w-[300px]">
          {[
            [
              "Câu",
              `${answeredCount}/${answerableQuestions.length || totalQuestions || 0}`,
            ],
            ["Cần đạt", `${requiredPracticeScore}%`],
            ["Sao", `${earnedPracticeStars}/3`],
          ].map(([label, value]) => (
            <div
              className="rounded-lg bg-slate-100 p-3 text-center"
              key={label}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {practiceContext && (
        <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 shrink-0 text-sky-700" size={16} />
            <div>
              <p className="font-semibold">
                Kế hoạch hôm nay đang theo dõi bài này.
              </p>
              <p className="mt-1">
                {backendEvidencePercent !== null
                  ? `Kết quả đã cập nhật: ${backendEvidencePercent}%, mốc cần đạt ${requiredPracticeScore}%.`
                  : resultPercent !== null
                    ? `Bài vừa nộp đạt ${resultPercent}%, đang chờ kế hoạch hôm nay cập nhật.`
                    : `Chưa có bài đã nộp; cần đạt ${requiredPracticeScore}% để hoàn thành.`}
              </p>
              <p className="mt-1 text-sky-800">
                {practiceDailyPlanContextMessage(practiceContext)}
              </p>
              {practiceContext.blockedReason && (
                <p className="mt-1 text-sky-800">
                  {blockedPlanMessage(practiceContext.blockedReason)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div
          className={`mt-4 rounded-lg border p-4 ${
            passedPractice
              ? "border-teal-200 bg-teal-50 text-teal-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {passedPractice
                  ? "Giỏi quá, đã đạt mốc!"
                  : "Sắp đạt rồi, làm lại nhé."}
              </p>
              <p className="mt-1 text-sm">
                Điểm hệ thống chấm: {result.score}/{result.maxScore} (
                {resultPercent}%), mốc cần đạt {requiredPracticeScore}%.
              </p>
            </div>
            <div
              aria-label={`Đạt ${earnedPracticeStars} trên 3 sao`}
              className="flex gap-1"
            >
              {[0, 1, 2].map((index) => (
                <span
                  className={practiceStarClass(index, earnedPracticeStars)}
                  key={index}
                >
                  <Sparkles size={15} />
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm">
            {planRefreshMessage ||
              practiceDailyPlanRefreshMessage({
                context: practiceContext,
                item: null,
                percent: resultPercent ?? 0,
                requiredScore: requiredPracticeScore,
                refreshed: false,
              })}
          </p>
        </div>
      )}

      {activity ? (
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Tiến độ trả lời</span>
              <span>
                {answerableQuestions.length > 0
                  ? `${Math.round((answeredCount / answerableQuestions.length) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-teal-600"
                style={{
                  width:
                    answerableQuestions.length > 0
                      ? `${Math.round((answeredCount / answerableQuestions.length) * 100)}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          {activity.questions.map((question, index) => {
            const response = result?.responses.find(
              (item) => item.questionId === question.id,
            );
            const answered = isQuestionAnswered(question);
            const imageUrl = practiceMediaUrl(question, [
              "imageUrl",
              "promptImageUrl",
              "image",
              "promptImage",
            ]);
            const audioUrl = practiceMediaUrl(question, [
              "audioUrl",
              "promptAudioUrl",
              "audio",
              "promptAudio",
            ]);
            const unsupported = !isPracticeQuestionAutoGraded(question);

            return (
              <div
                className={`rounded-lg border p-4 ${
                  response
                    ? response.isCorrect
                      ? "border-teal-200 bg-teal-50"
                      : "border-amber-200 bg-amber-50"
                    : answered
                      ? "border-sky-200 bg-sky-50"
                      : "border-slate-200 bg-white"
                }`}
                key={question.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    Câu {index + 1}/{totalQuestions}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {question.points} điểm
                  </span>
                </div>
                <p className="mt-3 text-base font-semibold leading-6 text-slate-950">
                  {question.prompt}
                </p>

                {(imageUrl || audioUrl) && (
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                    {imageUrl && (
                      <div
                        aria-label="Hình minh họa câu hỏi"
                        className="min-h-40 rounded-lg border border-slate-200 bg-slate-100 bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      />
                    )}
                    {audioUrl && (
                      <audio
                        className="w-full min-w-64"
                        controls
                        preload="none"
                        src={audioUrl}
                      />
                    )}
                  </div>
                )}

                {unsupported ? (
                  <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
                    Dạng câu hỏi này chưa hỗ trợ tự chấm trong MVP luyện tập.
                  </p>
                ) : question.type === "TEXT_INPUT" ? (
                  <textarea
                    className="mt-3 min-h-24 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                    disabled={Boolean(result)}
                    onChange={(event) =>
                      setTextAnswers((current) => ({
                        ...current,
                        [question.id]: event.target.value,
                      }))
                    }
                    placeholder="Gõ câu trả lời của con"
                    value={textAnswers[question.id] ?? ""}
                  />
                ) : question.type === "ORDERING" ? (
                  <div className="mt-3 space-y-2">
                    {orderedAnswerIdsFor(question).map(
                      (answerId, answerIndex) => {
                        const answer = question.answers.find(
                          (item) => item.id === answerId,
                        );
                        if (!answer) {
                          return null;
                        }

                        return (
                          <div
                            className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                            key={answer.id}
                          >
                            <span>{answer.text}</span>
                            <span className="flex gap-1">
                              <button
                                aria-label="Đưa đáp án lên"
                                className="grid size-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                                disabled={Boolean(result) || answerIndex === 0}
                                onClick={() =>
                                  moveOrderedAnswer(question, answerIndex, -1)
                                }
                                type="button"
                              >
                                <ArrowUp size={16} />
                              </button>
                              <button
                                aria-label="Đưa đáp án xuống"
                                className="grid size-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                                disabled={
                                  Boolean(result) ||
                                  answerIndex === question.answers.length - 1
                                }
                                onClick={() =>
                                  moveOrderedAnswer(question, answerIndex, 1)
                                }
                                type="button"
                              >
                                <ArrowDown size={16} />
                              </button>
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.answers.map((answer) => {
                      const isMultiple = question.type === "MULTIPLE_CHOICE";
                      const checked = (
                        selectedAnswers[question.id] ?? []
                      ).includes(answer.id);

                      return (
                        <button
                          aria-pressed={checked}
                          className={practiceAnswerClass(checked)}
                          disabled={Boolean(result)}
                          key={answer.id}
                          onClick={() =>
                            toggleChoice(question.id, answer.id, isMultiple)
                          }
                          type="button"
                        >
                          <span className="grid size-6 shrink-0 place-items-center rounded-full border border-current text-xs font-semibold">
                            {checked ? "✓" : ""}
                          </span>
                          {answer.text}
                        </button>
                      );
                    })}
                  </div>
                )}
                {response && (
                  <p
                    className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                      response.isCorrect ? "text-teal-700" : "text-rose-700"
                    }`}
                  >
                    {practiceFeedbackText(response)}
                  </p>
                )}
              </div>
            );
          })}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              {result
                ? "Kết quả hiển thị sau khi hệ thống chấm bài."
                : submitDisabled
                  ? "Trả lời đủ câu hỏi tự chấm để nộp bài."
                  : "Sẵn sàng nộp bài để hệ thống chấm."}
            </div>
            <div className="flex flex-wrap gap-2">
              {result && (
                <button
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700"
                  onClick={resetPracticeRun}
                  type="button"
                >
                  <RotateCcw size={17} />
                  Làm lại
                </button>
              )}
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                disabled={submitDisabled}
                onClick={() => void submitPractice()}
                type="button"
              >
                <CheckCircle2 size={18} />
                {isSubmitting ? "Đang nộp" : result ? "Đã nộp" : "Nộp bài"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Chọn bài học từ Học hôm nay hoặc Video để mở phần luyện tập.
        </p>
      )}
    </section>
  );
}

function isPracticeQuestionAutoGraded(question: PracticeQuestion) {
  return (
    question.type === "SINGLE_CHOICE" ||
    question.type === "MULTIPLE_CHOICE" ||
    question.type === "TEXT_INPUT" ||
    question.type === "ORDERING"
  );
}

function requiredPracticeScoreForPlan(
  context: ActivePracticePlanContext | null | undefined,
  lessonId: string | undefined,
  activity: PracticeLesson["activities"][number] | undefined,
) {
  if (
    context &&
    context.lessonId === lessonId &&
    (!activity || !context.activityId || context.activityId === activity.id)
  ) {
    return context.minScore ?? 80;
  }

  return 80;
}

function practiceResultPercent(
  result: Pick<PracticeAttemptResult, "score" | "maxScore">,
) {
  return result.maxScore > 0
    ? Math.round((result.score / result.maxScore) * 100)
    : 0;
}

function practiceStarsForPercent(percent: number, requiredPercent: number) {
  if (percent >= Math.max(95, requiredPercent)) return 3;
  if (percent >= requiredPercent) return 2;
  if (percent > 0) return 1;
  return 0;
}

function practiceStarClass(index: number, earnedStars: number) {
  return `grid size-9 place-items-center rounded-lg ${
    index < earnedStars
      ? "bg-amber-200 text-amber-800"
      : "bg-white/70 text-slate-400"
  }`;
}

function practiceAnswerClass(checked: boolean) {
  return `flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm font-medium transition disabled:cursor-default ${
    checked
      ? "border-teal-500 bg-teal-50 text-teal-950"
      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
  }`;
}

function practiceFeedbackText(
  response: PracticeAttemptResult["responses"][number],
) {
  if (response.isCorrect) return "Đúng. Hệ thống đã ghi nhận câu này.";
  return response.feedback ?? "Chưa đúng. Con xem lại bài rồi làm lại nhé.";
}

function practiceMediaUrl(question: PracticeQuestion, keys: string[]) {
  const metadata = question.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return "";
  }

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value.startsWith("http") ? value : `${apiBaseUrl}${value}`;
    }
  }

  return "";
}

function ActivationOrdersPanel({
  role,
  session,
}: {
  role: Role;
  session: Session;
}) {
  const canCreate =
    role === "SALE" ||
    role === "AGENCY_OWNER" ||
    role === "AGENCY_MANAGER" ||
    role === "ADMIN";
  const canApprove = role === "OPERATIONS" || role === "ADMIN";
  const [orders, setOrders] = useState<ActivationOrder[]>([]);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [packageOptions, setPackageOptions] = useState<ActivationPackage[]>(
    fallbackActivationPackages,
  );
  const [packageCode, setPackageCode] = useState("one-year");
  const [amountVnd, setAmountVnd] = useState("2400000");
  const [agencyCode, setAgencyCode] = useState("");
  const [notes, setNotes] = useState("");
  const [saleInvoice, setSaleInvoice] = useState<File | null>(null);
  const [operationInvoices, setOperationInvoices] = useState<
    Record<string, File | null>
  >({});
  const [resubmitInvoices, setResubmitInvoices] = useState<
    Record<string, File | null>
  >({});
  const [resubmitNotes, setResubmitNotes] = useState<Record<string, string>>(
    {},
  );
  const [durationDays, setDurationDays] = useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [orderTab, setOrderTab] = useState<ActivationOrderTab>("ACTION");
  const [orderSearch, setOrderSearch] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [showAdvancedFields, setShowAdvancedFields] = useState(
    role === "AGENCY_OWNER" || role === "AGENCY_MANAGER",
  );
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [lastCreatedInfo, setLastCreatedInfo] = useState<{
    email: string;
    packageName: string;
    password: string;
  } | null>(null);
  const [message, setMessage] = useState("Đang tải đơn kích hoạt.");
  const [isLoading, setIsLoading] = useState(false);
  const prevStatusesRef = useRef<Record<string, string>>({});
  const [newStatusAlerts, setNewStatusAlerts] = useState<
    Array<{ id: string; email: string; newStatus: string }>
  >([]);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filterFromDate) params.set("fromDate", filterFromDate);
      if (filterToDate) params.set("toDate", filterToDate);
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders?${params.toString()}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tải đơn kích hoạt."),
        );
      }

      const data = (await response.json()) as {
        items: ActivationOrder[];
        hasMore: boolean;
      };
      const items = Array.isArray(data)
        ? (data as ActivationOrder[])
        : data.items;
      // Detect status changes for real-time alerts
      const prev = prevStatusesRef.current;
      if (Object.keys(prev).length > 0) {
        const alerts: Array<{ id: string; email: string; newStatus: string }> =
          [];
        for (const item of items) {
          const oldStatus = prev[item.id];
          if (
            oldStatus &&
            oldStatus !== item.status &&
            (item.status === "APPROVED" || item.status === "REJECTED")
          ) {
            alerts.push({
              id: item.id,
              email: item.customerEmail,
              newStatus: item.status,
            });
          }
        }
        if (alerts.length > 0) {
          setNewStatusAlerts((current) => [...current, ...alerts]);
        }
      }
      prevStatusesRef.current = Object.fromEntries(
        items.map((item) => [item.id, item.status]),
      );
      setOrders(items);
      setMessage(`Đã tải ${items.length} đơn kích hoạt.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải đơn kích hoạt.",
      );
    }
  }, [authHeaders, filterFromDate, filterToDate]);

  const loadPackages = useCallback(async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/self-service/options`,
      );
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as SelfServiceOptions;
      if (data.packages.length > 0) {
        setPackageOptions(data.packages);
      }
    } catch {
      // Keep the local package presets if the public options endpoint is offline.
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
      void loadPackages();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOrders, loadPackages]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        void loadOrders();
      }
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [loadOrders]);

  const selectedPackage = useMemo(
    () => packageOptions.find((item) => item.code === packageCode),
    [packageCode, packageOptions],
  );

  function selectPackage(nextCode: string) {
    setPackageCode(nextCode);
    const nextPackage = packageOptions.find((item) => item.code === nextCode);
    if (nextPackage) {
      setAmountVnd(String(nextPackage.amountVnd));
    }
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate) {
      return;
    }

    setIsLoading(true);
    setGeneratedPassword(null);
    setLastCreatedInfo(null);
    setMessage("Đang tạo đơn kích hoạt...");

    try {
      const formData = new FormData();
      formData.append("email", customerEmail);
      formData.append("displayName", displayName);
      if (customerPhone.trim()) {
        formData.append("phone", customerPhone.trim());
      }
      formData.append("amountVnd", amountVnd);
      formData.append("currency", "VND");
      if (selectedPackage) {
        formData.append("packageCode", selectedPackage.code);
        formData.append("packageName", selectedPackage.name);
        formData.append(
          "requestedDurationDays",
          String(selectedPackage.durationDays),
        );
      }
      if (agencyCode.trim()) {
        formData.append("agencyCode", agencyCode);
      }
      formData.append("notes", notes);
      if (saleInvoice) {
        formData.append("saleInvoice", saleInvoice);
      }

      const response = await fetch(`${apiBaseUrl}/v1/activation-orders`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tạo đơn kích hoạt."),
        );
      }

      const result = (await response.json()) as {
        order: ActivationOrder;
        generatedPassword: string | null;
        isNewAccount: boolean;
      };
      if (result.generatedPassword) {
        setGeneratedPassword(result.generatedPassword);
        setLastCreatedInfo({
          email: customerEmail,
          packageName: selectedPackage?.name ?? "Gói học",
          password: result.generatedPassword,
        });
        setMessage(
          "Đã tạo đơn và tài khoản mới — hãy gửi mật khẩu tạm cho học viên qua kênh an toàn.",
        );
      } else {
        setMessage("Đã tạo đơn và đang chờ bộ phận vận hành duyệt.");
      }
      setCustomerEmail("");
      setCustomerPhone("");
      setDisplayName("");
      setAmountVnd(String(selectedPackage?.amountVnd ?? 2400000));
      setAgencyCode("");
      setNotes("");
      setSaleInvoice(null);
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo đơn kích hoạt.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function resubmitOrder(orderId: string) {
    setIsLoading(true);
    setMessage("Đang gửi duyệt lại đơn...");

    try {
      const formData = new FormData();
      formData.append("notes", resubmitNotes[orderId] ?? "");
      const invoice = resubmitInvoices[orderId];
      if (invoice) {
        formData.append("saleInvoice", invoice);
      }

      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${orderId}/resubmit`,
        {
          method: "POST",
          headers: authHeaders,
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể gửi duyệt lại đơn."),
        );
      }

      setMessage("Đã gửi lại đơn để duyệt.");
      setResubmitNotes((current) => ({ ...current, [orderId]: "" }));
      setResubmitInvoices((current) => ({ ...current, [orderId]: null }));
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể gửi duyệt lại đơn.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function approveOrder(orderId: string) {
    const operationInvoice = operationInvoices[orderId];
    const days = durationDays[orderId] || "365";

    if (!canApprove || !operationInvoice) {
      setMessage("Cần tải hóa đơn vận hành trước khi duyệt.");
      return;
    }

    setIsLoading(true);
    setMessage("Đang duyệt đơn và kích hoạt tài khoản...");

    try {
      const formData = new FormData();
      formData.append("durationDays", days);
      formData.append("reviewNotes", reviewNotes[orderId] ?? "");
      formData.append("operationInvoice", operationInvoice);

      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${orderId}/approve`,
        {
          method: "POST",
          headers: authHeaders,
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể duyệt đơn."));
      }

      setMessage("Đã duyệt đơn. Tài khoản hoạt động đến ngày hết hạn đã chọn.");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể duyệt đơn.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function rejectOrder(orderId: string) {
    if (!canApprove) {
      return;
    }

    setIsLoading(true);
    setMessage("Đang từ chối đơn...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${orderId}/reject`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewNotes:
              reviewNotes[orderId] ??
              "Bị từ chối trong bước kiểm tra thanh toán.",
          }),
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể từ chối đơn."));
      }

      setMessage("Đã từ chối đơn.");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể từ chối đơn.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const [revokeOrderId, setRevokeOrderId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  function openRevokeModal(orderId: string) {
    setRevokeOrderId(orderId);
    setRevokeReason("");
  }

  function closeRevokeModal() {
    setRevokeOrderId(null);
    setRevokeReason("");
  }

  async function confirmRevoke() {
    if (!revokeOrderId) return;
    setIsLoading(true);
    setMessage("Đang thu hồi đơn...");
    closeRevokeModal();
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${revokeOrderId}/revoke`,
        {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            revokeReason: revokeReason.trim() || undefined,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể thu hồi đơn."));
      }
      setMessage("Đã thu hồi đơn và hoàn nguyên hoa hồng.");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể thu hồi đơn.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelOrder(orderId: string) {
    if (!window.confirm("Huỷ đơn hàng này? Thao tác không thể hoàn tác.")) {
      return;
    }

    setIsLoading(true);
    setMessage("Đang hủy đơn...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${orderId}/cancel`,
        { method: "POST", headers: authHeaders },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể hủy đơn."));
      }

      setMessage("Đã hủy đơn.");
      await loadOrders();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể hủy đơn.");
    } finally {
      setIsLoading(false);
    }
  }

  const reviewOrders = orders.filter(
    (order) => order.status === "PENDING_REVIEW",
  );
  const actionOrders = orders.filter((order) =>
    canApprove
      ? order.status === "PENDING_REVIEW" || order.status === "WAITING_PAYMENT"
      : saleOrderNeedsAction(order),
  );
  const approvedOrders = orders.filter((order) => order.status === "APPROVED");
  const rejectedOrders = orders.filter((order) => order.status === "REJECTED");
  const approvedRevenueCents = approvedOrders.reduce(
    (sum, order) => sum + order.amountCents,
    0,
  );
  const commissionCents = orders.reduce(
    (sum, order) =>
      sum +
      (order.commissionEarnings?.reduce(
        (earningSum, earning) => earningSum + earning.amountCents,
        0,
      ) ?? 0),
    0,
  );
  const thisMonth = new Date().toISOString().substring(0, 7);
  const thisMonthApprovedCount = approvedOrders.filter((o) =>
    o.createdAt.startsWith(thisMonth),
  ).length;
  const normalizedSearch = orderSearch.trim().toLowerCase();
  const visibleOrders = orders
    .filter((order) => {
      const matchesTab =
        orderTab === "ALL"
          ? true
          : orderTab === "ACTION"
            ? actionOrders.some((item) => item.id === order.id)
            : order.status === orderTab;
      const matchesSearch = normalizedSearch
        ? orderSearchText(order).includes(normalizedSearch)
        : true;
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tabOptions: Array<{
    key: ActivationOrderTab;
    label: string;
    count: number;
  }> = [
    {
      key: "ACTION",
      label: canApprove ? "Cần duyệt" : "Cần xử lý",
      count: actionOrders.length,
    },
    { key: "PENDING_REVIEW", label: "Đang duyệt", count: reviewOrders.length },
    { key: "APPROVED", label: "Đã duyệt", count: approvedOrders.length },
    { key: "REJECTED", label: "Bị từ chối", count: rejectedOrders.length },
    { key: "ALL", label: "Tất cả", count: orders.length },
  ];

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Đơn kích hoạt
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Bàn xử lý kinh doanh hằng ngày
          </h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
          <button
            className="mt-2 h-7 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            disabled={isLoading}
            onClick={() => void loadOrders()}
            type="button"
          >
            ↺ Làm mới
          </button>
        </div>
        <div className="flex overflow-x-auto border-y border-slate-200 text-center">
          {[
            ["Cần xử lý", actionOrders.length],
            ["Đang duyệt", reviewOrders.length],
            ["Tháng này ✓", thisMonthApprovedCount],
            ["Doanh thu", formatMoney(approvedRevenueCents, "VND")],
            ["Hoa hồng", formatMoney(commissionCents, "VND")],
          ].map(([label, value], index) => (
            <div
              className={`min-w-[5rem] flex-1 shrink-0 p-3 ${index > 0 ? "border-l border-slate-200" : ""}`}
              key={label}
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        {canCreate ? (
          <form className="space-y-3" onSubmit={createOrder}>
            <div className="rounded-lg bg-slate-100 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Đơn học viên mới</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Kích hoạt qua nhân viên kinh doanh kèm minh chứng thanh
                    toán.
                  </p>
                </div>
                <span className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  {selectedPackage
                    ? `${selectedPackage.durationDays} ngày`
                    : "Số tiền tùy chỉnh"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Gói học
                </span>
                <select
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  onChange={(event) => selectPackage(event.target.value)}
                  value={packageCode}
                >
                  {packageOptions.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name} - {formatMoney(item.amountVnd * 100, "VND")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Số tiền (VND)
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  min="1000"
                  onChange={(event) => setAmountVnd(event.target.value)}
                  type="number"
                  value={amountVnd}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email học viên{" "}
                  <span className="font-normal text-rose-500">*</span>
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder="khachhang@email.com"
                  required
                  type="email"
                  value={customerEmail}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Số điện thoại
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="0901 234 567 (không bắt buộc)"
                  type="tel"
                  value={customerPhone}
                />
              </label>
            </div>

            {customerEmail.includes("@") &&
              orders.some(
                (o) =>
                  o.customerEmail.toLowerCase() ===
                    customerEmail.toLowerCase() &&
                  (o.status === "PENDING_REVIEW" ||
                    o.status === "WAITING_PAYMENT" ||
                    o.status === "APPROVED"),
              ) && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  ⚠️ Email này đã có đơn đang xử lý hoặc đã kích hoạt. Hãy kiểm
                  tra danh sách trước khi tạo mới.
                </div>
              )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Tên học viên{" "}
                  <span className="font-normal text-rose-500">*</span>
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  value={displayName}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Ảnh chứng từ{" "}
                <span className="font-normal text-slate-400">
                  (CK / hóa đơn — tùy chọn)
                </span>
              </span>
              <input
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="mt-1 block w-full text-sm text-slate-600"
                onChange={(event) =>
                  setSaleInvoice(event.target.files?.[0] ?? null)
                }
                type="file"
              />
            </label>

            <button
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700"
              onClick={() => setShowAdvancedFields((current) => !current)}
              type="button"
            >
              {showAdvancedFields ? "Ẩn chi tiết" : "Thêm chi tiết"}
            </button>

            {showAdvancedFields && (
              <div className="grid gap-3 rounded-lg bg-slate-50 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Đại lý / mã giới thiệu
                    </span>
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setAgencyCode(event.target.value)}
                      placeholder="Không bắt buộc"
                      value={agencyCode}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Ghi chú kinh doanh
                  </span>
                  <textarea
                    className="mt-1 min-h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    onChange={(event) => setNotes(event.target.value)}
                    value={notes}
                  />
                </label>
              </div>
            )}

            <button
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              <CircleDollarSign size={18} />
              Gửi bộ phận vận hành duyệt
            </button>

            {generatedPassword && (
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
                <p className="text-xs font-semibold text-teal-800">
                  Đã tạo tài khoản mới — hãy gửi mật khẩu tạm này cho học viên:
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded bg-white px-3 py-1.5 font-mono text-sm font-bold text-teal-900 ring-1 ring-teal-200">
                    {generatedPassword}
                  </code>
                  <button
                    className="h-8 rounded-lg border border-teal-200 px-3 text-xs font-medium text-teal-800 hover:bg-teal-100"
                    onClick={() => {
                      void navigator.clipboard.writeText(generatedPassword);
                    }}
                    type="button"
                  >
                    Sao chép
                  </button>
                  <button
                    className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    onClick={() => {
                      setGeneratedPassword(null);
                      setLastCreatedInfo(null);
                    }}
                    type="button"
                  >
                    Đóng
                  </button>
                </div>
                {lastCreatedInfo && (
                  <button
                    className="mt-2 h-8 w-full rounded-lg border border-teal-300 bg-white px-3 text-xs font-medium text-teal-800 hover:bg-teal-50"
                    onClick={() => {
                      const msg = [
                        `🎓 Thông tin đăng nhập MinhHương`,
                        `Email: ${lastCreatedInfo.email}`,
                        `Mật khẩu tạm: ${lastCreatedInfo.password}`,
                        `Gói: ${lastCreatedInfo.packageName}`,
                        ``,
                        `Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên.`,
                      ].join("\n");
                      void navigator.clipboard.writeText(msg);
                    }}
                    type="button"
                  >
                    📋 Sao chép thông tin gửi khách (Zalo/Messenger)
                  </button>
                )}
                <p className="mt-1.5 text-xs text-teal-700">
                  Mật khẩu chỉ hiển thị một lần. Học viên nên đổi mật khẩu sau
                  lần đăng nhập đầu tiên.
                </p>
              </div>
            )}
          </form>
        ) : (
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
            Bộ phận vận hành kiểm tra minh chứng, tải hóa đơn đối ứng và kích
            hoạt quyền học.
          </div>
        )}

        <div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Danh sách đơn hàng</h3>
              <span className="text-xs text-slate-500">
                {visibleOrders.length} trong {orders.length} bản ghi
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Tìm học viên, mã hoặc trạng thái"
                value={orderSearch}
              />
              <div className="flex gap-2 overflow-x-auto">
                {tabOptions.map((item) => (
                  <button
                    className={`h-10 shrink-0 rounded-lg px-3 text-xs font-medium ${
                      orderTab === item.key
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                    key={item.key}
                    onClick={() => setOrderTab(item.key)}
                    type="button"
                  >
                    {item.label} {item.count}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <span>Từ ngày</span>
                <input
                  className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
                  onChange={(event) => setFilterFromDate(event.target.value)}
                  type="date"
                  value={filterFromDate}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <span>Đến ngày</span>
                <input
                  className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
                  onChange={(event) => setFilterToDate(event.target.value)}
                  type="date"
                  value={filterToDate}
                />
              </label>
              {(filterFromDate || filterToDate) && (
                <button
                  className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-100"
                  onClick={() => {
                    setFilterFromDate("");
                    setFilterToDate("");
                  }}
                  type="button"
                >
                  Xóa bộ lọc ngày
                </button>
              )}
            </div>
          </div>

          {newStatusAlerts.length > 0 && (
            <div className="mt-3 space-y-2">
              {newStatusAlerts.map((alert) => (
                <div
                  className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                    alert.newStatus === "APPROVED"
                      ? "border border-teal-200 bg-teal-50 text-teal-800"
                      : "border border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                  key={alert.id}
                >
                  <span>
                    {alert.newStatus === "APPROVED" ? "✅" : "❌"} Đơn của{" "}
                    <strong>{alert.email}</strong> vừa{" "}
                    {alert.newStatus === "APPROVED"
                      ? "được duyệt"
                      : "bị từ chối"}
                  </span>
                  <button
                    className="shrink-0 rounded px-2 py-1 opacity-70 hover:opacity-100"
                    onClick={() =>
                      setNewStatusAlerts((current) =>
                        current.filter((a) => a.id !== alert.id),
                      )
                    }
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 max-h-[520px] divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {visibleOrders.map((order) => (
              <div className="py-3" key={order.id}>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">
                          {order.customerEmail}
                        </p>
                        {order.customerPhone && (
                          <p className="text-xs text-slate-500">
                            {order.customerPhone}
                          </p>
                        )}
                        <span
                          className={`inline-flex h-7 items-center rounded-lg px-2 text-xs font-medium ring-1 ${activationStatusClass(order.status)}`}
                        >
                          {activationStatusLabels[order.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.user.profile?.displayName ?? "Học viên"} /{" "}
                        {formatStatusCodeVi(order.user.status)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatMoney(order.amountCents, order.currency)}
                        {order.packageName ? ` / ${order.packageName}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.source === "SELF_SERVICE"
                          ? "Tự phục vụ"
                          : "Nhân viên hỗ trợ"}
                        {order.channelParticipant
                          ? ` / ${order.channelParticipant.code}`
                          : order.agency
                            ? ` / ${order.agency.code}`
                            : ""}
                        {order.transferContent
                          ? ` / ${order.transferContent}`
                          : ""}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-700">
                        Bước tiếp theo: {saleOrderNextStep(order, role)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ngày tạo {formatDate(order.createdAt)}
                      </p>
                      <button
                        className="mt-0.5 font-mono text-xs text-slate-400 hover:text-slate-600"
                        onClick={() =>
                          void navigator.clipboard.writeText(order.id)
                        }
                        title="Sao chép mã đơn"
                        type="button"
                      >
                        #{order.id.slice(0, 8)}
                      </button>
                      {(order.commissionEarnings?.length ?? 0) > 0 && (
                        <p className="mt-1 text-xs text-teal-700">
                          Hoa hồng{" "}
                          {formatMoney(
                            order.commissionEarnings?.reduce(
                              (sum, earning) => sum + earning.amountCents,
                              0,
                            ) ?? 0,
                            order.currency,
                          )}
                        </p>
                      )}
                      {order.expiresAt && (
                        <p className="mt-1 text-xs text-teal-700">
                          Hết hạn {formatDate(order.expiresAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.saleInvoiceUrl && (
                        <button
                          className="h-8 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium"
                          onClick={() => {
                            void openAuthenticatedUpload(
                              order.saleInvoiceUrl!,
                              session.accessToken,
                            ).catch((error: unknown) => {
                              setMessage(
                                error instanceof Error
                                  ? error.message
                                  : "Không thể mở hóa đơn kinh doanh.",
                              );
                            });
                          }}
                          type="button"
                        >
                          {order.source === "SELF_SERVICE"
                            ? "Minh chứng thanh toán"
                            : "Hóa đơn kinh doanh"}
                        </button>
                      )}
                      {order.operationInvoiceUrl && (
                        <button
                          className="h-8 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium"
                          onClick={() => {
                            void openAuthenticatedUpload(
                              order.operationInvoiceUrl!,
                              session.accessToken,
                            ).catch((error: unknown) => {
                              setMessage(
                                error instanceof Error
                                  ? error.message
                                  : "Không thể mở hóa đơn vận hành.",
                              );
                            });
                          }}
                          type="button"
                        >
                          Hóa đơn vận hành
                        </button>
                      )}
                    </div>
                  </div>

                  {canApprove && order.status === "WAITING_PAYMENT" && (
                    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                      Đang chờ học viên tải minh chứng thanh toán trước khi
                      duyệt.
                    </div>
                  )}

                  {canApprove && order.status === "PENDING_REVIEW" && (
                    <div className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[120px_1fr]">
                      <input
                        className="h-9 rounded-lg border border-slate-300 px-3 text-sm"
                        min="1"
                        onChange={(event) =>
                          setDurationDays((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        placeholder={String(order.requestedDurationDays ?? 365)}
                        type="number"
                        value={
                          durationDays[order.id] ??
                          String(order.requestedDurationDays ?? 365)
                        }
                      />
                      <input
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        className="block w-full text-sm text-slate-600"
                        onChange={(event) =>
                          setOperationInvoices((current) => ({
                            ...current,
                            [order.id]: event.target.files?.[0] ?? null,
                          }))
                        }
                        type="file"
                      />
                      <input
                        className="h-9 rounded-lg border border-slate-300 px-3 text-sm sm:col-span-2"
                        onChange={(event) =>
                          setReviewNotes((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        placeholder="Ghi chú duyệt"
                        value={reviewNotes[order.id] ?? ""}
                      />
                      <div className="flex flex-wrap gap-2 sm:col-span-2">
                        <button
                          className="h-9 rounded-lg bg-teal-700 px-3 text-xs font-medium text-white disabled:opacity-60"
                          disabled={isLoading}
                          onClick={() => void approveOrder(order.id)}
                          type="button"
                        >
                          Duyệt quyền truy cập
                        </button>
                        <button
                          className="h-9 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 disabled:opacity-60"
                          disabled={isLoading}
                          onClick={() => void rejectOrder(order.id)}
                          type="button"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  )}

                  {canApprove && order.status === "APPROVED" && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        className="h-8 rounded-lg border border-purple-200 px-3 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-60"
                        disabled={isLoading}
                        onClick={() => openRevokeModal(order.id)}
                        type="button"
                      >
                        Thu hồi quyền truy cập
                      </button>
                    </div>
                  )}

                  {canCreate && order.status === "REJECTED" && (
                    <div className="grid gap-2 rounded-lg bg-rose-50 p-3 sm:grid-cols-2">
                      <p className="text-xs font-semibold text-rose-800 sm:col-span-2">
                        Gửi duyệt lại sau khi đã khắc phục vấn đề
                      </p>
                      <input
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        className="block w-full text-sm text-slate-600 sm:col-span-2"
                        onChange={(event) =>
                          setResubmitInvoices((current) => ({
                            ...current,
                            [order.id]: event.target.files?.[0] ?? null,
                          }))
                        }
                        type="file"
                      />
                      <input
                        className="h-9 rounded-lg border border-rose-200 bg-white px-3 text-sm sm:col-span-2"
                        onChange={(event) =>
                          setResubmitNotes((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        placeholder="Mô tả nội dung đã khắc phục (không bắt buộc)"
                        value={resubmitNotes[order.id] ?? ""}
                      />
                      <button
                        className="h-9 rounded-lg bg-rose-700 px-3 text-xs font-medium text-white disabled:opacity-60"
                        disabled={isLoading}
                        onClick={() => void resubmitOrder(order.id)}
                        type="button"
                      >
                        Gửi duyệt lại
                      </button>
                      <button
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 disabled:opacity-60"
                        disabled={isLoading}
                        onClick={() => void cancelOrder(order.id)}
                        type="button"
                      >
                        Hủy đơn
                      </button>
                    </div>
                  )}

                  {canCreate &&
                    (order.status === "WAITING_PAYMENT" ||
                      order.status === "PENDING_REVIEW") && (
                      <div className="flex justify-end">
                        <button
                          className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-60"
                          disabled={isLoading}
                          onClick={() => void cancelOrder(order.id)}
                          type="button"
                        >
                          Huỷ đơn
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {visibleOrders.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">
                Không có đơn kích hoạt phù hợp với bộ lọc.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revoke confirmation modal */}
      {revokeOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeRevokeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-semibold text-slate-900 mb-1">
              Thu hồi quyền truy cập?
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Thao tác này sẽ hủy gói học và hoàn nguyên toàn bộ hoa hồng của
              đơn. Không thể hoàn tác.
            </p>
            <textarea
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Lý do thu hồi (không bắt buộc, hiển thị trong nhật ký)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRevokeModal}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={() => void confirmRevoke()}
                className="px-4 py-2 text-sm bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-medium"
              >
                Xác nhận thu hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ChannelAdminPanel({
  role,
  session,
}: {
  role: Role;
  session: Session;
}) {
  const canManageGlobal = role === "ADMIN" || role === "OPERATIONS";
  const canManageMembers = canManageGlobal;
  const [summary, setSummary] = useState<ChannelAdminSummary | null>(null);
  const [agencies, setAgencies] = useState<AgencyAdmin[]>([]);
  const [users, setUsers] = useState<ChannelUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [nextUserCursor, setNextUserCursor] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userRole, setUserRole] = useState<"ALL" | Role>("ALL");
  const [userStatus, setUserStatus] = useState<
    "ALL" | "ACTIVE" | "SUSPENDED" | "DELETED"
  >("ALL");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [policies, setPolicies] = useState<CommissionPolicyAdmin[]>([]);
  const [agencyCode, setAgencyCode] = useState("NEW-AGENCY");
  const [agencyName, setAgencyName] = useState("Đại lý mới");
  const [agencyRate, setAgencyRate] = useState("1500");
  const [saleEmail, setSaleEmail] = useState("new.sale@example.com");
  const [salePassword, setSalePassword] = useState("Sale@12345");
  const [saleName, setSaleName] = useState("Nhân viên kinh doanh mới");
  const [saleBaseSalary, setSaleBaseSalary] = useState("8000000");
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [memberSaleEmail, setMemberSaleEmail] = useState("sale@demo.local");
  const [memberRate, setMemberRate] = useState("1000");
  const [policyCode, setPolicyCode] = useState("default-sale-10");
  const [policyName, setPolicyName] = useState(
    "Hoa hồng kinh doanh mặc định 10%",
  );
  const [policyType, setPolicyType] = useState<"SALE" | "AGENCY">("SALE");
  const [policyRate, setPolicyRate] = useState("1000");
  const [message, setMessage] = useState("Đang tải quản trị kênh.");
  const [isSaving, setIsSaving] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const jsonHeaders = useMemo(
    () => ({
      ...authHeaders,
      "Content-Type": "application/json",
    }),
    [authHeaders],
  );

  const buildUserListUrl = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams({ limit: "50" });
      const q = userSearch.trim();
      if (q) {
        params.set("q", q);
      }
      if (userRole !== "ALL") {
        params.set("role", userRole);
      }
      if (userStatus !== "ALL") {
        params.set("status", userStatus);
      }
      if (cursor) {
        params.set("cursor", cursor);
      }

      return `${apiBaseUrl}/v1/channel-admin/users?${params.toString()}`;
    },
    [userRole, userSearch, userStatus],
  );

  const loadUsersPage = useCallback(
    async (cursor?: string, append = false) => {
      setIsLoadingUsers(true);
      try {
        const response = await fetch(buildUserListUrl(cursor), {
          headers: authHeaders,
        });
        if (!response.ok) {
          throw new Error(
            await readApiError(response, "Không thể tải người dùng."),
          );
        }

        const page = (await response.json()) as ChannelUserPage;
        setUsers((current) =>
          append ? [...current, ...page.items] : page.items,
        );
        setUserTotal(page.total);
        setNextUserCursor(page.nextCursor ?? null);
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [authHeaders, buildUserListUrl],
  );

  const loadChannelAdmin = useCallback(async () => {
    try {
      const [summaryResponse, agenciesResponse, policiesResponse] =
        await Promise.all([
          fetch(`${apiBaseUrl}/v1/channel-admin/summary`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/channel-admin/agencies`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/channel-admin/commission-policies`, {
            headers: authHeaders,
          }),
        ]);

      if (!summaryResponse.ok || !agenciesResponse.ok || !policiesResponse.ok) {
        throw new Error("Vai trò này không được truy cập API quản trị kênh.");
      }

      const nextAgencies = (await agenciesResponse.json()) as AgencyAdmin[];
      setSummary((await summaryResponse.json()) as ChannelAdminSummary);
      setAgencies(nextAgencies);
      setPolicies((await policiesResponse.json()) as CommissionPolicyAdmin[]);
      setSelectedAgencyId((current) => current || nextAgencies[0]?.id || "");
      await loadUsersPage();
      setMessage(
        canManageMembers
          ? "Quản trị kênh đã sẵn sàng."
          : "Chế độ chỉ xem kênh.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải quản trị kênh.",
      );
    }
  }, [authHeaders, canManageMembers, loadUsersPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadChannelAdmin();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadChannelAdmin]);

  async function createAgency(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageGlobal) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo đại lý...");
    try {
      const response = await fetch(`${apiBaseUrl}/v1/channel-admin/agencies`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          code: agencyCode,
          name: agencyName,
          defaultRateBps: Number(agencyRate),
        }),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể tạo đại lý."));
      }

      setMessage("Đã tạo đại lý.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo đại lý.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createSaleUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageMembers) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo nhân viên kinh doanh...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-admin/sale-users`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            email: saleEmail,
            password: salePassword,
            displayName: saleName,
            role: "SALE",
            rateBps: Number(memberRate),
            baseSalaryVnd: Number(saleBaseSalary),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tạo nhân viên kinh doanh."),
        );
      }

      setMessage("Đã tạo nhân viên kinh doanh.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo nhân viên kinh doanh.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageMembers || !selectedAgencyId) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang gán nhân viên vào đại lý...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-admin/agencies/${selectedAgencyId}/members`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            saleEmail: memberSaleEmail,
            title: "Kinh doanh đại lý",
            rateBps: Number(memberRate),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể gán thành viên."),
        );
      }

      setMessage("Đã gán thành viên đại lý.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể gán thành viên.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function upsertPolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageGlobal) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang lưu chính sách hoa hồng...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-admin/commission-policies`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            code: policyCode,
            name: policyName,
            beneficiaryType: policyType,
            rateBps: Number(policyRate),
            isDefaultForSale: policyType === "SALE",
            isDefaultForAgency: policyType === "AGENCY",
            isActive: true,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể lưu chính sách."),
        );
      }

      setMessage("Đã lưu chính sách hoa hồng.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể lưu chính sách.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateUserStatus(
    userId: string,
    status: "ACTIVE" | "SUSPENDED",
    reason?: string,
  ) {
    if (!canManageMembers) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang cập nhật trạng thái người dùng...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-admin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: jsonHeaders,
          body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể cập nhật người dùng."),
        );
      }

      setMessage("Đã cập nhật trạng thái người dùng.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật người dùng.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const [suspendModal, setSuspendModal] = useState<{ userId: string } | null>(
    null,
  );
  const [suspendReasonInput, setSuspendReasonInput] = useState("");

  const saleUsers = users.filter((user) =>
    user.roles.some((item) => item.role.name === "SALE"),
  );

  return (
    <>
      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Quản trị kênh
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Đại lý, nhân viên kinh doanh và chính sách
            </h2>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
          <div className="grid grid-cols-3 border-y border-slate-200 text-center lg:min-w-96">
            {[
              [
                "Đại lý",
                `${summary?.activeAgencies ?? 0}/${summary?.agencies ?? 0}`,
              ],
              [
                "Nhân viên kinh doanh",
                String(summary?.saleUsers ?? saleUsers.length),
              ],
              ["Học viên", String(summary?.learners ?? 0)],
            ].map(([label, value], index) => (
              <div
                className={index > 0 ? "border-l border-slate-200 p-3" : "p-3"}
                key={label}
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            {canManageMembers ? (
              <>
                {canManageGlobal && (
                  <form className="space-y-3" onSubmit={createAgency}>
                    <h3 className="text-base font-semibold">Tạo đại lý</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setAgencyCode(event.target.value)}
                        placeholder="Mã"
                        value={agencyCode}
                      />
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setAgencyName(event.target.value)}
                        placeholder="Tên"
                        value={agencyName}
                      />
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setAgencyRate(event.target.value)}
                        placeholder="Tỷ lệ (điểm cơ bản)"
                        type="number"
                        value={agencyRate}
                      />
                    </div>
                    <button
                      className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                      disabled={isSaving}
                      type="submit"
                    >
                      Tạo đại lý
                    </button>
                  </form>
                )}

                <form
                  className="space-y-3 border-t border-slate-200 pt-4"
                  onSubmit={createSaleUser}
                >
                  <h3 className="text-base font-semibold">
                    Tạo nhân viên kinh doanh
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setSaleEmail(event.target.value)}
                      placeholder="Email"
                      type="email"
                      value={saleEmail}
                    />
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setSalePassword(event.target.value)}
                      placeholder="Mật khẩu"
                      value={salePassword}
                    />
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setSaleName(event.target.value)}
                      placeholder="Tên hiển thị"
                      value={saleName}
                    />
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) =>
                        setSaleBaseSalary(event.target.value)
                      }
                      placeholder="Lương cơ bản (VND)"
                      type="number"
                      value={saleBaseSalary}
                    />
                  </div>
                  <button
                    className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isSaving}
                    type="submit"
                  >
                    Tạo nhân viên
                  </button>
                </form>

                <form
                  className="space-y-3 border-t border-slate-200 pt-4"
                  onSubmit={addMember}
                >
                  <h3 className="text-base font-semibold">
                    Gán nhân viên vào đại lý
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                      onChange={(event) =>
                        setSelectedAgencyId(event.target.value)
                      }
                      value={selectedAgencyId}
                    >
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.code}
                        </option>
                      ))}
                    </select>
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) =>
                        setMemberSaleEmail(event.target.value)
                      }
                      placeholder="Email nhân viên"
                      type="email"
                      value={memberSaleEmail}
                    />
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setMemberRate(event.target.value)}
                      placeholder="Tỷ lệ (điểm cơ bản)"
                      type="number"
                      value={memberRate}
                    />
                  </div>
                  <button
                    className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isSaving || agencies.length === 0}
                    type="submit"
                  >
                    Gán thành viên
                  </button>
                </form>

                {canManageGlobal && (
                  <form
                    className="space-y-3 border-t border-slate-200 pt-4"
                    onSubmit={upsertPolicy}
                  >
                    <h3 className="text-base font-semibold">
                      Chính sách hoa hồng
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setPolicyCode(event.target.value)}
                        placeholder="Mã"
                        value={policyCode}
                      />
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setPolicyName(event.target.value)}
                        placeholder="Tên"
                        value={policyName}
                      />
                      <select
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                        onChange={(event) =>
                          setPolicyType(event.target.value as "SALE" | "AGENCY")
                        }
                        value={policyType}
                      >
                        <option value="SALE">Kinh doanh</option>
                        <option value="AGENCY">Đại lý</option>
                      </select>
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setPolicyRate(event.target.value)}
                        placeholder="Tỷ lệ (điểm cơ bản)"
                        type="number"
                        value={policyRate}
                      />
                    </div>
                    <button
                      className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                      disabled={isSaving}
                      type="submit"
                    >
                      Lưu chính sách
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                Vai trò này chỉ được xem cấu hình thành viên kênh.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Đại lý</h3>
                <span className="text-xs text-slate-500">
                  {agencies.length} bản ghi
                </span>
              </div>
              <div className="mt-3 max-h-72 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
                {agencies.map((agency) => (
                  <div className="py-3" key={agency.id}>
                    <p className="text-sm font-semibold">
                      {agency.code} / {agency.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatStatusCodeVi(agency.status)} /{" "}
                      {(agency.channelParticipant?.commissionRateBps ??
                        agency.defaultRateBps) / 100}
                      % / {agency._count.activationOrders} đơn hàng
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Thành viên:{" "}
                      {agency.members
                        .map(
                          (member) =>
                            member.user.profile?.displayName ??
                            member.user.email,
                        )
                        .join(", ") || "Không có"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Người dùng</h3>
                  <span className="text-xs text-slate-500">
                    {users.length}/{userTotal} đã tải
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-[minmax(160px,1fr)_120px_120px_auto]">
                  <input
                    className="h-9 rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setUserSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        setUserSearch(userSearchInput);
                      }
                    }}
                    placeholder="Email, tên hoặc mã"
                    value={userSearchInput}
                  />
                  <select
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setUserRole(event.target.value as "ALL" | Role)
                    }
                    value={userRole}
                  >
                    <option value="ALL">Tất cả vai trò</option>
                    {(Object.keys(roleLabels) as Role[]).map((item) => (
                      <option key={item} value={item}>
                        {formatRoleCodeVi(item)}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setUserStatus(
                        event.target.value as
                          "ALL" | "ACTIVE" | "SUSPENDED" | "DELETED",
                      )
                    }
                    value={userStatus}
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="SUSPENDED">Tạm khóa</option>
                    <option value="DELETED">Đã xóa</option>
                  </select>
                  <button
                    className="h-9 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isLoadingUsers}
                    onClick={() => setUserSearch(userSearchInput)}
                    type="button"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>
              <div className="mt-3 max-h-80 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
                {users.map((item) => {
                  const roles = item.roles
                    .map((entry) => formatRoleCodeVi(entry.role.name))
                    .join(", ");
                  return (
                    <div className="py-3" key={item.id}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {item.profile?.displayName ?? item.email}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.email} / {formatStatusCodeVi(item.status)} /{" "}
                            {roles}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.channelParticipant
                              ? `${item.channelParticipant.code} / ${item.channelParticipant.commissionRateBps ?? 0} điểm cơ bản / lương ${formatMoney(item.channelParticipant.baseSalaryCents ?? 0, "VND")}`
                              : item.agencyMemberships
                                  .map((member) => member.agency.code)
                                  .join(", ") || "Chưa có thành viên kênh"}
                          </p>
                        </div>
                        {canManageMembers && item.status !== "DELETED" && (
                          <div className="flex gap-2">
                            <button
                              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium"
                              disabled={isSaving || item.status === "ACTIVE"}
                              onClick={() =>
                                void updateUserStatus(item.id, "ACTIVE")
                              }
                              type="button"
                            >
                              Kích hoạt
                            </button>
                            <button
                              className="h-8 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700"
                              disabled={isSaving || item.status === "SUSPENDED"}
                              onClick={() => {
                                setSuspendModal({ userId: item.id });
                                setSuspendReasonInput("");
                              }}
                              type="button"
                            >
                              Tạm khóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {nextUserCursor && (
                <button
                  className="mt-3 h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium disabled:opacity-60"
                  disabled={isLoadingUsers}
                  onClick={() => void loadUsersPage(nextUserCursor, true)}
                  type="button"
                >
                  {isLoadingUsers ? "Đang tải..." : "Tải thêm"}
                </button>
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold">Chính sách hoa hồng</h3>
              <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
                {policies.map((policy) => (
                  <div className="py-3" key={policy.id}>
                    <p className="text-sm font-medium">
                      {policy.code} / {formatRoleCodeVi(policy.beneficiaryType)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDataTextVi(policy.name)} / {policy.rateBps / 100}%
                      / lương {formatMoney(policy.baseSalaryCents, "VND")} /{" "}
                      {policy.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Suspend reason modal */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSuspendModal(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-1">
              Tạm khóa người dùng?
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Bạn có thể nhập lý do; nội dung sẽ được lưu trong nhật ký kiểm
              toán.
            </p>
            <textarea
              rows={3}
              value={suspendReasonInput}
              onChange={(e) => setSuspendReasonInput(e.target.value)}
              placeholder="Lý do tạm khóa (không bắt buộc)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSuspendModal(null)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  void updateUserStatus(
                    suspendModal.userId,
                    "SUSPENDED",
                    suspendReasonInput.trim() || undefined,
                  );
                  setSuspendModal(null);
                }}
                className="px-4 py-2 text-sm bg-rose-700 text-white rounded-lg hover:bg-rose-800 font-medium"
              >
                Tạm khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChannelReportPanel({ session }: { session: Session }) {
  const [from, setFrom] = useState(defaultReportFrom);
  const [to, setTo] = useState(defaultReportTo);
  const [report, setReport] = useState<ChannelReport | null>(null);
  const [message, setMessage] = useState("Đang tải báo cáo kênh.");
  const [isLoading, setIsLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setMessage("Đang tải báo cáo kênh...");

    try {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/report?${params}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể tải báo cáo."));
      }

      setReport((await response.json()) as ChannelReport);
      setMessage("Đã tải báo cáo.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải báo cáo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, from, to]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReport();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReport]);

  function exportCsv() {
    if (!report) {
      setMessage("Hãy tải báo cáo trước khi xuất.");
      return;
    }

    const rows = [
      ["section", "name", "đơn hàng", "revenue_vnd", "commission_vnd"],
      [
        "summary",
        "doanh thu đã duyệt",
        String(report.approvedRevenue.orderCount),
        String(Math.round(report.approvedRevenue.amountCents / 100)),
        "",
      ],
      [
        "summary",
        "hoa hồng",
        String(report.commissions.totalCount),
        "",
        String(Math.round(report.commissions.totalAmountCents / 100)),
      ],
      ...report.topSales.map((sale) => [
        "sale",
        sale.displayName ?? sale.email,
        String(sale.orderCount),
        String(Math.round(sale.revenueCents / 100)),
        String(Math.round(sale.commissionCents / 100)),
      ]),
      ...report.topAgencies.map((agency) => [
        "agency",
        `${agency.code} - ${agency.name}`,
        String(agency.orderCount),
        String(Math.round(agency.revenueCents / 100)),
        String(Math.round(agency.commissionCents / 100)),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `channel-report-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportOrdersCsv() {
    setIsLoading(true);
    setMessage("Đang xuất CSV đơn hàng...");

    try {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/report/csv?${params.toString()}`,
        { headers: authHeaders },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể xuất CSV đơn hàng."),
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `channel-orders-${from}-${to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Đã xuất CSV đơn hàng.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể xuất CSV đơn hàng.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const orderStatusRows = Object.entries(report?.orderPipeline.byStatus ?? {});
  const payoutStatusRows = Object.entries(report?.payouts.byStatus ?? {});

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Báo cáo kênh
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Doanh thu, hoa hồng và kênh bán hàng
          </h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Từ ngày</span>
            <input
              className="mt-1 h-10 rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setFrom(event.target.value)}
              type="date"
              value={from}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Đến ngày</span>
            <input
              className="mt-1 h-10 rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setTo(event.target.value)}
              type="date"
              value={to}
            />
          </label>
          <button
            className="flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void loadReport()}
            type="button"
          >
            <BarChart3 size={17} />
            Làm mới
          </button>
          <button
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 disabled:opacity-60"
            disabled={!report}
            onClick={exportCsv}
            type="button"
          >
            <ClipboardList size={17} />
            Xuất CSV
          </button>
          <button
            className="flex h-10 items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-800 hover:bg-teal-100 disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void exportOrdersCsv()}
            type="button"
          >
            <ClipboardList size={17} />
            Xuất CSV đơn hàng
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Doanh thu đã duyệt",
            formatMoney(report?.approvedRevenue.amountCents ?? 0, "VND"),
            `${report?.approvedRevenue.orderCount ?? 0} đơn đã duyệt`,
          ],
          [
            "Đơn trong quy trình",
            formatMoney(report?.orderPipeline.totalAmountCents ?? 0, "VND"),
            `${report?.orderPipeline.totalCount ?? 0} đơn hàng`,
          ],
          [
            "Hoa hồng phát sinh",
            formatMoney(report?.commissions.totalAmountCents ?? 0, "VND"),
            `${report?.commissions.totalCount ?? 0} dòng hoa hồng`,
          ],
          [
            "Khoản đã chi",
            formatMoney(report?.payouts.paidAmountCents ?? 0, "VND"),
            `${report?.payouts.paidCount ?? 0} yêu cầu đã chi trả`,
          ],
        ].map(([label, value, helper]) => (
          <div className="rounded-lg bg-slate-100 p-4" key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{helper}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Nhân viên nổi bật</h3>
            <span className="text-xs text-slate-500">
              {report
                ? `${formatDate(report.period.from)} - ${formatDate(report.period.to)}`
                : "Chưa có báo cáo"}
            </span>
          </div>
          <div className="mt-3 max-h-80 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {report?.topSales.map((sale) => (
              <div
                className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]"
                key={sale.participantId ?? sale.userId ?? sale.email}
              >
                <div>
                  <p className="text-sm font-semibold">
                    {sale.displayName ?? sale.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{sale.email}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold">
                    {formatMoney(sale.revenueCents, "VND")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {sale.orderCount} đơn hàng /{" "}
                    {formatMoney(sale.commissionCents, "VND")} hoa hồng
                  </p>
                </div>
              </div>
            ))}
            {(!report || report.topSales.length === 0) && (
              <div className="py-8 text-center text-sm text-slate-500">
                Chưa có doanh thu kinh doanh trong kỳ này.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Đại lý nổi bật</h3>
            <span className="text-xs text-slate-500">
              {report?.topAgencies.length ?? 0} đại lý
            </span>
          </div>
          <div className="mt-3 max-h-80 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {report?.topAgencies.map((agency) => (
              <div
                className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]"
                key={agency.participantId ?? agency.agencyId ?? agency.code}
              >
                <div>
                  <p className="text-sm font-semibold">{agency.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{agency.code}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold">
                    {formatMoney(agency.revenueCents, "VND")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {agency.orderCount} đơn hàng /{" "}
                    {formatMoney(agency.commissionCents, "VND")} hoa hồng
                  </p>
                </div>
              </div>
            ))}
            {(!report || report.topAgencies.length === 0) && (
              <div className="py-8 text-center text-sm text-slate-500">
                Chưa có doanh thu đại lý trong kỳ này.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-4">
          <div>
            <h3 className="text-base font-semibold">Trạng thái đơn hàng</h3>
            <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
              {orderStatusRows.map(([status, value]) => (
                <div
                  className="flex items-center justify-between py-2 text-sm"
                  key={status}
                >
                  <span className="font-medium">{status}</span>
                  <span className="text-slate-500">
                    {value.count} / {formatMoney(value.amountCents, "VND")}
                  </span>
                </div>
              ))}
              {orderStatusRows.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-500">
                  Chưa có đơn hàng.
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">Trạng thái chi trả</h3>
            <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
              {payoutStatusRows.map(([status, value]) => (
                <div
                  className="flex items-center justify-between py-2 text-sm"
                  key={status}
                >
                  <span className="font-medium">{status}</span>
                  <span className="text-slate-500">
                    {value.count} / {formatMoney(value.amountCents, "VND")}
                  </span>
                </div>
              ))}
              {payoutStatusRows.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-500">
                  Chưa có yêu cầu chi trả.
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold">Đơn mới được duyệt</h3>
          <div className="mt-3 max-h-96 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {report?.recentApprovedOrders.map((order) => (
              <div
                className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]"
                key={order.id}
              >
                <div>
                  <p className="text-sm font-semibold">{order.customerEmail}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatStatusCodeVi(order.source)}
                    {order.channelParticipant
                      ? ` / ${order.channelParticipant.code}`
                      : order.agency
                        ? ` / ${order.agency.code}`
                        : ""}
                    {order.createdBy ? ` / ${order.createdBy.email}` : ""}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold">
                    {formatMoney(order.amountCents, order.currency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.activatedAt
                      ? formatDate(order.activatedAt)
                      : "Chưa có ngày kích hoạt"}
                  </p>
                </div>
              </div>
            ))}
            {(!report || report.recentApprovedOrders.length === 0) && (
              <div className="py-8 text-center text-sm text-slate-500">
                Chưa có đơn được duyệt trong kỳ này.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type MyCustomer = {
  id: string;
  email: string;
  status: string;
  displayName?: string | null;
  subscription: { status: string; currentPeriodEnd: string } | null;
  totalOrders: number;
  approvedOrders: number;
  latestOrder: {
    id: string;
    status: string;
    packageName?: string | null;
    expiresAt?: string | null;
    createdAt: string;
  };
};

function MyCustomersPanel({ session }: { session: Session }) {
  const [customers, setCustomers] = useState<MyCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Đang tải khách hàng...");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/v1/activation-orders/my-customers`,
          {
            headers: authHeaders,
          },
        );
        if (!response.ok) {
          throw new Error(
            await readApiError(response, "Không thể tải khách hàng."),
          );
        }
        const data = (await response.json()) as { customers: MyCustomer[] };
        const list = data.customers;
        setCustomers(list);
        setMessage(`${list.length} customer(s) found.`);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Không thể tải khách hàng.",
        );
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authHeaders]);

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Khách hàng của tôi
        </p>
        <h2 className="mt-1 text-xl font-semibold">Danh sách học viên</h2>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
        <input
          className="mt-2 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm sm:max-w-xs"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          type="search"
          value={search}
        />
      </div>

      <div className="mt-3 divide-y divide-slate-200">
        {customers.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Chưa có khách hàng.
          </p>
        ) : (
          customers
            .filter(
              (c) =>
                !search ||
                c.email.toLowerCase().includes(search.toLowerCase()) ||
                (c.displayName ?? "")
                  .toLowerCase()
                  .includes(search.toLowerCase()),
            )
            .map((customer) => (
              <div
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                key={customer.id}
              >
                <div>
                  <p className="text-sm font-medium">
                    {customer.displayName ?? customer.email}
                  </p>
                  <p className="text-xs text-slate-500">{customer.email}</p>
                  {customer.subscription && (
                    <p className="text-xs text-teal-700">
                      Gói học:{" "}
                      {formatStatusCodeVi(customer.subscription.status)} · hết
                      hạn {formatDate(customer.subscription.currentPeriodEnd)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  <span>
                    {customer.approvedOrders}/{customer.totalOrders} đã duyệt
                  </span>
                  {customer.latestOrder && (
                    <span
                      className={
                        customer.latestOrder.status === "APPROVED"
                          ? "text-teal-700"
                          : "text-amber-700"
                      }
                    >
                      {activationStatusLabels[
                        customer.latestOrder.status as ActivationOrderStatus
                      ] ?? customer.latestOrder.status}
                    </span>
                  )}
                  {customer.latestOrder?.expiresAt && (
                    <span>
                      Hết hạn {formatDate(customer.latestOrder.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </section>
  );
}

type SaleReport = {
  period: { from: string; to: string };
  orders: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvedRevenueCents: number;
  };
  commission: {
    totalCents: number;
    commissionRateBps: number | null;
    baseSalaryCents: number;
  };
  recentOrders: ActivationOrder[];
};

function SalePersonalReportPanel({ session }: { session: Session }) {
  const [report, setReport] = useState<SaleReport | null>(null);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [message, setMessage] = useState("Đang tải báo cáo của bạn...");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadReport = useCallback(async () => {
    setMessage("Đang tải...");
    try {
      const params = new URLSearchParams({ from: fromDate, to: toDate });
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/my-report?${params.toString()}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể tải báo cáo."));
      }
      const data = (await response.json()) as SaleReport;
      setReport(data);
      setMessage(`Report for ${fromDate} – ${toDate}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải báo cáo.",
      );
    }
  }, [authHeaders, fromDate, toDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReport();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadReport]);

  const commissionRatePct =
    report?.commission.commissionRateBps != null
      ? (report.commission.commissionRateBps / 100).toFixed(1) + "%"
      : null;

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Hiệu suất của tôi
          </p>
          <h2 className="mt-1 text-xl font-semibold">Báo cáo kinh doanh</h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span>Từ ngày</span>
            <input
              className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
              onChange={(event) => setFromDate(event.target.value)}
              type="date"
              value={fromDate}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span>Đến ngày</span>
            <input
              className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
              onChange={(event) => setToDate(event.target.value)}
              type="date"
              value={toDate}
            />
          </label>
          <button
            className="h-8 rounded-lg bg-slate-950 px-3 text-xs font-medium text-white"
            onClick={() => void loadReport()}
            type="button"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {report && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Tổng đơn hàng", report.orders.total],
              ["Đã duyệt", report.orders.approved],
              [
                "Doanh thu",
                formatMoney(report.orders.approvedRevenueCents, "VND"),
              ],
              [
                "Hoa hồng nhận được",
                formatMoney(report.commission.totalCents, "VND"),
              ],
            ].map(([label, value]) => (
              <div className="rounded-lg bg-slate-50 p-3" key={String(label)}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {commissionRatePct && (
            <p className="mt-3 text-xs text-slate-600">
              Tỷ lệ hoa hồng của bạn:{" "}
              <span className="font-semibold text-teal-700">
                {commissionRatePct}
              </span>
              {report.commission.baseSalaryCents > 0 && (
                <>
                  {" "}
                  · Lương cơ bản:{" "}
                  <span className="font-semibold">
                    {formatMoney(report.commission.baseSalaryCents, "VND")}
                  </span>
                  /tháng
                </>
              )}
            </p>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-semibold">Đơn hàng gần đây</h3>
            <div className="mt-2 divide-y divide-slate-200">
              {report.recentOrders.map((order) => (
                <div
                  className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between"
                  key={order.id}
                >
                  <div>
                    <p className="text-sm font-medium">{order.customerEmail}</p>
                    <p className="text-xs text-slate-500">
                      {formatMoney(order.amountCents, order.currency)}
                      {order.packageName ? ` · ${order.packageName}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-6 items-center rounded-lg px-2 text-xs font-medium ring-1 ${activationStatusClass(order.status)}`}
                    >
                      {activationStatusLabels[order.status]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function ChannelFinancePanel({
  role,
  session,
}: {
  role: Role;
  session: Session;
}) {
  const canRequestPayout =
    role === "SALE" || role === "AGENCY_OWNER" || role === "AGENCY_MANAGER";
  const canPayPayout = role === "OPERATIONS" || role === "ADMIN";
  const [overview, setOverview] = useState<ChannelFinanceOverview | null>(null);
  const [wallet, setWallet] = useState<ChannelWallet | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [amountVnd, setAmountVnd] = useState("100000");
  const [bankName, setBankName] = useState("Vietcombank");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [payoutInvoices, setPayoutInvoices] = useState<
    Record<string, File | null>
  >({});
  const [payoutReviewNotes, setPayoutReviewNotes] = useState<
    Record<string, string>
  >({});
  const [message, setMessage] = useState("Đang tải tài chính kênh.");
  const [isSaving, setIsSaving] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadFinance = useCallback(async () => {
    try {
      const [overviewResponse, walletResponse, payoutsResponse] =
        await Promise.all([
          fetch(`${apiBaseUrl}/v1/channel-finance/overview`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/channel-finance/wallet`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/channel-finance/payouts`, {
            headers: authHeaders,
          }),
        ]);

      if (!overviewResponse.ok || !walletResponse.ok || !payoutsResponse.ok) {
        throw new Error("Vai trò này không được truy cập API tài chính kênh.");
      }

      setOverview((await overviewResponse.json()) as ChannelFinanceOverview);
      setWallet((await walletResponse.json()) as ChannelWallet);
      setPayouts((await payoutsResponse.json()) as PayoutRequest[]);
      setMessage("Đã tải ví hoa hồng và danh sách chi trả.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải tài chính kênh.",
      );
    }
  }, [authHeaders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFinance();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFinance]);

  async function createPayoutRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRequestPayout) {
      return;
    }
    if (Number(amountVnd) > availableWithdrawalVnd) {
      setMessage("Số tiền rút vượt quá số dư hoa hồng khả dụng.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo yêu cầu chi trả...");

    try {
      const response = await fetch(`${apiBaseUrl}/v1/channel-finance/payouts`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountVnd: Number(amountVnd),
          bankName,
          bankAccountNumber,
          bankAccountName,
          requestNotes,
        }),
      });
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tạo yêu cầu chi trả."),
        );
      }

      setMessage("Đã gửi yêu cầu chi trả để bộ phận vận hành duyệt.");
      setRequestNotes("");
      await loadFinance();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo yêu cầu chi trả.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function payPayout(payoutId: string) {
    const payoutInvoice = payoutInvoices[payoutId];
    if (!canPayPayout || !payoutInvoice) {
      setMessage("Cần tải hóa đơn chi trả trước khi đánh dấu đã chi.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang xử lý chi trả...");

    try {
      const formData = new FormData();
      formData.append("reviewNotes", payoutReviewNotes[payoutId] ?? "");
      formData.append("payoutInvoice", payoutInvoice);

      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/payouts/${payoutId}/pay`,
        {
          method: "POST",
          headers: authHeaders,
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể xử lý yêu cầu chi trả."),
        );
      }

      setMessage("Đã đánh dấu chi trả và lưu hóa đơn.");
      await loadFinance();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể xử lý yêu cầu chi trả.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function rejectPayout(payoutId: string) {
    if (!canPayPayout) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang từ chối yêu cầu chi trả...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/payouts/${payoutId}/reject`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewNotes:
              payoutReviewNotes[payoutId] ?? "Bị bộ phận vận hành từ chối.",
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể từ chối yêu cầu chi trả."),
        );
      }

      setMessage("Đã từ chối chi trả và hoàn lại số dư tạm giữ.");
      await loadFinance();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể từ chối yêu cầu chi trả.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const summary = overview?.wallet ?? wallet?.summary;
  const participant = wallet?.participant;
  const recentEarnings = wallet?.earnings ?? [];
  const pendingPayouts = payouts.filter(
    (payout) => payout.status === "PENDING_REVIEW",
  );
  const availableWithdrawalVnd = Math.floor(
    (summary?.availableCents ?? 0) / 100,
  );
  const canWithdrawNow = canRequestPayout && availableWithdrawalVnd > 0;
  const commissionRatePct =
    participant?.commissionRateBps != null
      ? (participant.commissionRateBps / 100).toFixed(1) + "%"
      : null;

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Tài chính kênh
          </p>
          <h2 className="mt-1 text-xl font-semibold">Ví hoa hồng và chi trả</h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
          {commissionRatePct && (
            <p className="mt-1 text-xs text-teal-700">
              Tỷ lệ hoa hồng:{" "}
              <span className="font-semibold">{commissionRatePct}</span>
              {participant?.displayName ? ` · ${participant.displayName}` : ""}
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 border-y border-slate-200 text-center lg:min-w-96">
          {[
            [
              "Khả dụng",
              formatMoney(
                summary?.availableCents ?? 0,
                summary?.currency ?? "VND",
              ),
            ],
            [
              "Tạm giữ",
              formatMoney(summary?.heldCents ?? 0, summary?.currency ?? "VND"),
            ],
            ["Đang chờ", String(pendingPayouts.length)],
          ].map(([label, value], index) => (
            <div
              className={index > 0 ? "border-l border-slate-200 p-3" : "p-3"}
              key={label}
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-100 p-4">
              <p className="text-xs text-slate-500">Doanh thu đã duyệt</p>
              <p className="mt-2 text-xl font-semibold">
                {formatMoney(overview?.approvedRevenueCents ?? 0, "VND")}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 p-4">
              <p className="text-xs text-slate-500">Khoản đã chi</p>
              <p className="mt-2 text-xl font-semibold">
                {formatMoney(overview?.paidPayoutCents ?? 0, "VND")}
              </p>
            </div>
          </div>

          {canRequestPayout && (
            <form
              className="mt-4 space-y-3 border-t border-slate-200 pt-4"
              onSubmit={createPayoutRequest}
            >
              <h3 className="text-base font-semibold">Yêu cầu rút tiền</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                    Số tiền (VND)
                    <button
                      className="text-xs font-medium text-teal-700 disabled:text-slate-400"
                      disabled={!canWithdrawNow}
                      onClick={() =>
                        setAmountVnd(String(availableWithdrawalVnd))
                      }
                      type="button"
                    >
                      Dùng toàn bộ số dư
                    </button>
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    min="10000"
                    max={Math.max(availableWithdrawalVnd, 10000)}
                    onChange={(event) => setAmountVnd(event.target.value)}
                    type="number"
                    value={amountVnd}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Ngân hàng
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setBankName(event.target.value)}
                    value={bankName}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Số tài khoản
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) =>
                      setBankAccountNumber(event.target.value)
                    }
                    value={bankAccountNumber}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Tên chủ tài khoản
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setBankAccountName(event.target.value)}
                    value={bankAccountName}
                  />
                </label>
              </div>
              <input
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setRequestNotes(event.target.value)}
                placeholder="Ghi chú rút tiền"
                value={requestNotes}
              />
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                disabled={isSaving || !canWithdrawNow}
                type="submit"
              >
                <WalletCards size={18} />
                {canWithdrawNow ? "Yêu cầu chi trả" : "Không có số dư khả dụng"}
              </button>
            </form>
          )}

          <div className="mt-4">
            <h3 className="text-base font-semibold">Hoa hồng gần đây</h3>
            <div className="mt-3 max-h-72 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
              {recentEarnings.map((earning) => (
                <div className="py-3" key={earning.id}>
                  <p className="text-sm font-medium">
                    {formatMoney(earning.amountCents, earning.currency)} /{" "}
                    {earning.rateBps / 100}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {earning.participant?.code ??
                      formatRoleCodeVi(earning.beneficiaryType)}
                    {earning.beneficiaryAgency
                      ? ` / ${earning.beneficiaryAgency.code}`
                      : ""}
                    {earning.activationOrder
                      ? ` / ${earning.activationOrder.customerEmail}`
                      : ""}
                  </p>
                </div>
              ))}
              {recentEarnings.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500">
                  Chưa có khoản hoa hồng nào.
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Yêu cầu chi trả</h3>
            <span className="text-xs text-slate-500">
              {payouts.length} bản ghi
            </span>
          </div>
          <div className="mt-3 max-h-[520px] divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {payouts.map((payout) => (
              <div className="py-3" key={payout.id}>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {formatMoney(payout.amountCents, payout.currency)} /{" "}
                        {formatStatusCodeVi(payout.status)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payout.beneficiaryAgency?.code ??
                          payout.participant?.code ??
                          payout.beneficiaryUser?.profile?.displayName ??
                          payout.beneficiaryUser?.email ??
                          "Người thụ hưởng"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payout.bankName} / {payout.bankAccountNumber} /{" "}
                        {payout.bankAccountName}
                      </p>
                    </div>
                    {payout.payoutInvoiceUrl && (
                      <button
                        className="h-8 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium"
                        onClick={() => {
                          void openAuthenticatedUpload(
                            payout.payoutInvoiceUrl!,
                            session.accessToken,
                          ).catch((error: unknown) => {
                            setMessage(
                              error instanceof Error
                                ? error.message
                                : "Không thể mở hóa đơn chi trả.",
                            );
                          });
                        }}
                        type="button"
                      >
                        Hóa đơn chi trả
                      </button>
                    )}
                  </div>

                  {canPayPayout && payout.status === "PENDING_REVIEW" && (
                    <div className="grid gap-2 rounded-lg bg-slate-50 p-3">
                      <input
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        className="block w-full text-sm text-slate-600"
                        onChange={(event) =>
                          setPayoutInvoices((current) => ({
                            ...current,
                            [payout.id]: event.target.files?.[0] ?? null,
                          }))
                        }
                        type="file"
                      />
                      <input
                        className="h-9 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) =>
                          setPayoutReviewNotes((current) => ({
                            ...current,
                            [payout.id]: event.target.value,
                          }))
                        }
                        placeholder="Ghi chú duyệt"
                        value={payoutReviewNotes[payout.id] ?? ""}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="h-9 rounded-lg bg-teal-700 px-3 text-xs font-medium text-white disabled:opacity-60"
                          disabled={isSaving}
                          onClick={() => void payPayout(payout.id)}
                          type="button"
                        >
                          Đánh dấu đã chi
                        </button>
                        <button
                          className="h-9 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 disabled:opacity-60"
                          disabled={isSaving}
                          onClick={() => void rejectPayout(payout.id)}
                          type="button"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {payouts.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">
                Chưa có yêu cầu chi trả.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContentStudio({ role, session }: { role: Role; session: Session }) {
  const canManage = role === "ADMIN" || role === "CONTENT_EDITOR";
  const canPublish = role === "ADMIN";
  const [overview, setOverview] = useState<ContentOverview | null>(null);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [tags, setTags] = useState<ContentTag[]>([]);
  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [seriesLevelCode, setSeriesLevelCode] = useState("A1");
  const [seriesTitle, setSeriesTitle] = useState("Chuỗi học qua video mới");
  const [seriesDescription, setSeriesDescription] = useState("");
  const [seriesUnitTitle, setSeriesUnitTitle] = useState("Bắt đầu tại đây");
  const [tagName, setTagName] = useState("Thói quen hằng ngày");
  const [tagKind, setTagKind] = useState<ContentTagKind>("TOPIC");
  const [tagColor, setTagColor] = useState("#0f766e");
  const [editingTagId, setEditingTagId] = useState("");
  const [tagLessonId, setTagLessonId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [title, setTitle] = useState("Bài học video mới");
  const [description, setDescription] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [questionLessonId, setQuestionLessonId] = useState("");
  const [activityTitle, setActivityTitle] = useState("Kiểm tra nhanh");
  const [questionPrompt, setQuestionPrompt] = useState("Câu nào lịch sự hơn?");
  const [answerOptions, setAnswerOptions] = useState([
    "Gửi ngay đi.",
    "Bạn có thể gửi khi thuận tiện không?",
    "",
    "",
  ]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(1);
  const [explanation, setExplanation] = useState(
    "Cấu trúc “Could you...” lịch sự hơn trong tiếng Anh công sở.",
  );
  const [message, setMessage] = useState("Đang tải dữ liệu nội dung.");
  const [isSaving, setIsSaving] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const activeCourseId = courseId || courses[0]?.id || "";
  const selectedCourse = courses.find((course) => course.id === activeCourseId);
  const activeUnitId = unitId || selectedCourse?.units[0]?.id || "";
  const selectedUnit =
    selectedCourse?.units.find((unit) => unit.id === activeUnitId) ??
    selectedCourse?.units[0];
  const previewVideo = lessons.flatMap((lesson) => lesson.videos).find(Boolean);
  const previewVideoUrl = useAuthenticatedUploadUrl(
    previewVideo?.sourceUrl,
    session.accessToken,
  );
  const selectedQuestionLesson =
    lessons.find((lesson) => lesson.id === questionLessonId) ??
    lessons.find((lesson) => lesson.status === "DRAFT") ??
    lessons[0];
  const selectedTagLesson =
    lessons.find((lesson) => lesson.id === tagLessonId) ??
    lessons.find((lesson) => lesson.status === "DRAFT") ??
    lessons[0];

  const loadContent = useCallback(async () => {
    try {
      const [overviewResponse, coursesResponse, lessonsResponse, tagsResponse] =
        await Promise.all([
          fetch(`${apiBaseUrl}/v1/admin/content/overview`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/admin/content/courses`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/admin/content/lessons`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/admin/content/tags`, {
            headers: authHeaders,
          }),
        ]);

      if (
        !overviewResponse.ok ||
        !coursesResponse.ok ||
        !lessonsResponse.ok ||
        !tagsResponse.ok
      ) {
        throw new Error("Vai trò này không được truy cập API nội dung.");
      }

      setOverview((await overviewResponse.json()) as ContentOverview);
      setCourses((await coursesResponse.json()) as AdminCourse[]);
      setLessons((await lessonsResponse.json()) as AdminLesson[]);
      setTags((await tagsResponse.json()) as ContentTag[]);
      setMessage(
        canManage
          ? "Sẵn sàng tạo bài học video."
          : "Tổng quan nội dung ở chế độ chỉ xem.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu nội dung.",
      );
    }
  }, [authHeaders, canManage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContent();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadContent]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelectedTagIds(
        selectedTagLesson?.tags?.map((item) => item.tag.id) ?? [],
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedTagLesson?.id, selectedTagLesson?.tags]);

  async function createVideoSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo chuỗi video...");

    try {
      const courseResponse = await fetch(
        `${apiBaseUrl}/v1/admin/content/courses`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            levelCode: seriesLevelCode,
            title: seriesTitle,
            description: seriesDescription,
            isPublished: false,
          }),
        },
      );
      if (!courseResponse.ok) {
        throw new Error(
          await readApiError(courseResponse, "Không thể tạo chuỗi video."),
        );
      }

      const course = (await courseResponse.json()) as AdminCourse;
      const unitResponse = await fetch(`${apiBaseUrl}/v1/admin/content/units`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
          title: seriesUnitTitle,
          sortOrder: 0,
        }),
      });
      if (!unitResponse.ok) {
        throw new Error(
          await readApiError(
            unitResponse,
            "Đã tạo chuỗi nhưng chưa tạo được chương.",
          ),
        );
      }

      const unit = (await unitResponse.json()) as AdminUnit;
      setCourseId(course.id);
      setUnitId(unit.id);
      setSeriesTitle("Chuỗi học qua video mới");
      setSeriesDescription("");
      setSeriesUnitTitle("Bắt đầu tại đây");
      setMessage("Đã tạo chuỗi video.");
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo chuỗi video.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function saveContentTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) {
      return;
    }

    setIsSaving(true);
    setMessage(editingTagId ? "Đang cập nhật thẻ..." : "Đang tạo thẻ...");

    try {
      const response = await fetch(
        editingTagId
          ? `${apiBaseUrl}/v1/admin/content/tags/${editingTagId}`
          : `${apiBaseUrl}/v1/admin/content/tags`,
        {
          method: editingTagId ? "PATCH" : "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: tagName,
            kind: tagKind,
            color: tagColor,
            isActive: true,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể lưu thẻ."));
      }

      setEditingTagId("");
      setTagName(tagKind === "TOPIC" ? "Thói quen hằng ngày" : "Thẻ mới");
      setMessage(
        editingTagId
          ? "Đã cập nhật thẻ."
          : tagKind === "TOPIC"
            ? "Đã tạo chủ đề."
            : "Đã tạo thẻ.",
      );
      await loadContent();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu thẻ.");
    } finally {
      setIsSaving(false);
    }
  }

  async function archiveContentTag(tag: ContentTag) {
    if (!canManage) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang xóa thẻ...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/admin/content/tags/${tag.id}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders,
          },
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể xóa thẻ."));
      }

      setSelectedTagIds((current) =>
        current.filter((tagId) => tagId !== tag.id),
      );
      setMessage("Đã xóa thẻ.");
      await loadContent();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể xóa thẻ.");
    } finally {
      setIsSaving(false);
    }
  }

  function beginEditTag(tag: ContentTag) {
    setEditingTagId(tag.id);
    setTagName(tag.name);
    setTagKind(tag.kind);
    setTagColor(tag.color ?? "#0f766e");
  }

  function cancelEditTag() {
    setEditingTagId("");
    setTagName(tagKind === "TOPIC" ? "Thói quen hằng ngày" : "Thẻ mới");
  }

  function toggleSelectedTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((item) => item !== tagId)
        : [...current, tagId],
    );
  }

  async function saveLessonTags(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !selectedTagLesson) {
      return;
    }
    if (selectedTagLesson.status !== "DRAFT") {
      setMessage("Chỉ có thể đổi thẻ khi bài học đang ở trạng thái nháp.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang lưu thẻ bài học...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/admin/content/lessons/${selectedTagLesson.id}/tags`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tagIds: selectedTagIds }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể lưu thẻ bài học."),
        );
      }

      setMessage("Đã lưu thẻ bài học.");
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể lưu thẻ bài học.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createVideoLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !selectedUnit) {
      setMessage("Bạn không có quyền hoặc chưa chọn chương.");
      return;
    }
    if (!youtubeUrl && !videoFile) {
      setMessage("Hãy thêm liên kết YouTube hoặc chọn tệp video.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo bài học...");

    try {
      const lessonResponse = await fetch(
        `${apiBaseUrl}/v1/admin/content/lessons`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            unitId: selectedUnit.id,
            title,
            description,
            type: "VIDEO",
          }),
        },
      );

      if (!lessonResponse.ok) {
        throw new Error("Không thể tạo bài học.");
      }

      const lesson = (await lessonResponse.json()) as AdminLesson;

      if (youtubeUrl) {
        const videoResponse = await fetch(
          `${apiBaseUrl}/v1/admin/content/lessons/${lesson.id}/videos/link`,
          {
            method: "POST",
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: "YOUTUBE",
              title: videoTitle || title,
              url: youtubeUrl,
            }),
          },
        );
        if (!videoResponse.ok) {
          throw new Error(
            "Đã tạo bài học nhưng không thể đính kèm video YouTube.",
          );
        }
      } else if (videoFile) {
        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("title", videoTitle || title);

        const videoResponse = await fetch(
          `${apiBaseUrl}/v1/admin/content/lessons/${lesson.id}/videos/upload`,
          {
            method: "POST",
            headers: authHeaders,
            body: formData,
          },
        );
        if (!videoResponse.ok) {
          throw new Error("Đã tạo bài học nhưng không thể tải tệp video.");
        }
      }

      setTitle("Bài học video mới");
      setDescription("");
      setVideoTitle("");
      setYoutubeUrl("");
      setVideoFile(null);
      setMessage("Đã lưu bài học nháp kèm video.");
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo bài học.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function transitionLesson(
    lessonId: string,
    action: "submit-review" | "publish",
  ) {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/admin/content/lessons/${lessonId}/${action}`,
        {
          method: "POST",
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error("Không thể thay đổi trạng thái bài học.");
      }
      setMessage(
        action === "publish"
          ? "Đã xuất bản bài học."
          : "Đã gửi bài học để duyệt.",
      );
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể cập nhật bài học.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createPracticeQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !selectedQuestionLesson) {
      setMessage("Hãy chọn bài học và dùng tài khoản có quyền nội dung.");
      return;
    }
    if (selectedQuestionLesson.status !== "DRAFT") {
      setMessage("Chỉ có thể thêm câu hỏi luyện tập vào bài học nháp.");
      return;
    }

    const answers = answerOptions
      .map((text, index) => ({
        text: text.trim(),
        isCorrect: index === correctAnswerIndex,
        sortOrder: index,
      }))
      .filter((answer) => answer.text.length > 0);

    if (answers.length < 2 || !answers.some((answer) => answer.isCorrect)) {
      setMessage("Câu hỏi cần ít nhất hai lựa chọn và một đáp án đúng.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo hoạt động luyện tập...");

    try {
      const activityResponse = await fetch(
        `${apiBaseUrl}/v1/admin/content/lessons/${selectedQuestionLesson.id}/activities`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: activityTitle,
            type: "QUIZ",
            description: "Luyện tập sau video",
          }),
        },
      );

      if (!activityResponse.ok) {
        throw new Error("Không thể tạo hoạt động luyện tập.");
      }

      const activity = (await activityResponse.json()) as AdminActivity;
      const questionResponse = await fetch(
        `${apiBaseUrl}/v1/admin/content/activities/${activity.id}/questions`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "SINGLE_CHOICE",
            prompt: questionPrompt,
            explanation,
            points: 1,
            answers,
          }),
        },
      );

      if (!questionResponse.ok) {
        throw new Error("Đã tạo hoạt động nhưng không thể lưu câu hỏi.");
      }

      setMessage("Đã tạo câu hỏi luyện tập.");
      setQuestionPrompt("Câu nào lịch sự hơn?");
      setAnswerOptions([
        "Gửi ngay đi.",
        "Bạn có thể gửi khi thuận tiện không?",
        "",
        "",
      ]);
      setCorrectAnswerIndex(1);
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo câu hỏi.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Xưởng nội dung
          </p>
          <h2 className="mt-1 text-xl font-semibold">Quản lý bài học video</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản trị viên tạo bài học, đính kèm YouTube hoặc video nội bộ rồi
            xuất bản.
          </p>
        </div>
        <div className="grid grid-cols-3 border-y border-slate-200 text-center lg:min-w-80">
          {[
            ["Bản nháp", overview?.status.drafts ?? 0],
            ["Duyệt", overview?.status.inReview ?? 0],
            ["Đã xuất bản", overview?.status.published ?? 0],
          ].map(([label, value], index) => (
            <div
              className={index > 0 ? "border-l border-slate-200 p-3" : "p-3"}
              key={label}
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div>
          {canManage ? (
            <>
              <form
                className="space-y-3 border-b border-slate-200 pb-4"
                onSubmit={createVideoSeries}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">
                      Chuỗi bài học video
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Khóa học và chương đầu tiên cho chuỗi video theo thứ tự.
                    </p>
                  </div>
                  <FileVideo className="text-slate-500" size={20} />
                </div>
                <div className="grid gap-3 sm:grid-cols-[90px_1fr]">
                  <input
                    className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setSeriesLevelCode(event.target.value)}
                    placeholder="A1"
                    value={seriesLevelCode}
                  />
                  <input
                    className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setSeriesTitle(event.target.value)}
                    placeholder="Tên chuỗi bài học"
                    value={seriesTitle}
                  />
                </div>
                <input
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(event) => setSeriesUnitTitle(event.target.value)}
                  placeholder="Chương đầu tiên"
                  value={seriesUnitTitle}
                />
                <textarea
                  className="min-h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  onChange={(event) => setSeriesDescription(event.target.value)}
                  placeholder="Ghi chú"
                  value={seriesDescription}
                />
                <button
                  className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  Tạo chuỗi bài học
                </button>
              </form>

              <div className="mt-4 border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">Quản lý thẻ</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Chủ đề là thẻ dùng cho tìm kiếm, trò chơi và ngữ cảnh AI.
                    </p>
                  </div>
                  <Search className="text-slate-500" size={20} />
                </div>

                <form
                  className="mt-3 grid gap-3 sm:grid-cols-[1fr_130px_110px_auto]"
                  onSubmit={saveContentTag}
                >
                  <input
                    className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setTagName(event.target.value)}
                    placeholder="Thẻ hoặc chủ đề"
                    value={tagName}
                  />
                  <select
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setTagKind(event.target.value as ContentTagKind)
                    }
                    value={tagKind}
                  >
                    {(Object.keys(tagKindLabels) as ContentTagKind[]).map(
                      (kind) => (
                        <option key={kind} value={kind}>
                          {tagKindLabels[kind]}
                        </option>
                      ),
                    )}
                  </select>
                  <input
                    className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setTagColor(event.target.value)}
                    type="color"
                    value={tagColor}
                  />
                  <button
                    className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isSaving}
                    type="submit"
                  >
                    {editingTagId ? "Lưu" : "Thêm"}
                  </button>
                </form>
                {editingTagId && (
                  <button
                    className="mt-2 h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium"
                    onClick={cancelEditTag}
                    type="button"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}

                <div className="mt-3 max-h-36 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
                  {tags.map((tag) => (
                    <div
                      className="flex items-center justify-between gap-3 py-2"
                      key={tag.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {tagKindLabels[tag.kind]} / {tag.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tag._count?.lessons ?? 0} bài học /{" "}
                          {tag.isActive ? "Đang hoạt động" : "Bị ẩn"}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium"
                          onClick={() => beginEditTag(tag)}
                          type="button"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          className="h-8 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 disabled:opacity-60"
                          disabled={isSaving || !tag.isActive}
                          onClick={() => void archiveContentTag(tag)}
                          type="button"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <form className="mt-4 space-y-3" onSubmit={saveLessonTags}>
                  <select
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) => {
                      const lesson = lessons.find(
                        (item) => item.id === event.target.value,
                      );
                      setTagLessonId(event.target.value);
                      setSelectedTagIds(
                        lesson?.tags?.map((item) => item.tag.id) ?? [],
                      );
                    }}
                    value={selectedTagLesson?.id ?? ""}
                  >
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.title} - {formatStatusCodeVi(lesson.status)}
                      </option>
                    ))}
                  </select>
                  <div className="flex max-h-32 flex-wrap gap-2 overflow-auto">
                    {tags
                      .filter((tag) => tag.isActive)
                      .map((tag) => (
                        <button
                          className={`min-h-8 rounded-lg px-3 text-xs font-medium ring-1 ${
                            selectedTagIds.includes(tag.id)
                              ? "bg-teal-700 text-white ring-teal-700"
                              : "bg-white text-slate-700 ring-slate-200"
                          }`}
                          key={tag.id}
                          onClick={() => toggleSelectedTag(tag.id)}
                          type="button"
                        >
                          {tag.kind === "TOPIC"
                            ? "Chủ đề"
                            : tagKindLabels[tag.kind]}{" "}
                          / {tag.name}
                        </button>
                      ))}
                  </div>
                  <button
                    className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isSaving || !selectedTagLesson}
                    type="submit"
                  >
                    Lưu thẻ bài học
                  </button>
                </form>
              </div>

              <form className="mt-4 space-y-3" onSubmit={createVideoLesson}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Khóa học
                    </span>
                    <select
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                      onChange={(event) => {
                        const nextCourseId = event.target.value;
                        const nextCourse = courses.find(
                          (course) => course.id === nextCourseId,
                        );
                        setCourseId(nextCourseId);
                        setUnitId(nextCourse?.units[0]?.id ?? "");
                      }}
                      value={activeCourseId}
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.level.code} - {course.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Chương / buổi học
                    </span>
                    <select
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                      onChange={(event) => setUnitId(event.target.value)}
                      value={activeUnitId}
                    >
                      {(selectedCourse?.units ?? []).map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Tên bài học
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setTitle(event.target.value)}
                    value={title}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Ghi chú bài học
                  </span>
                  <textarea
                    className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    onChange={(event) => setDescription(event.target.value)}
                    value={description}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Tên video
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setVideoTitle(event.target.value)}
                    placeholder="Không bắt buộc"
                    value={videoTitle}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Liên kết YouTube
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Hoặc tải tệp video
                  </span>
                  <input
                    accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                    className="mt-1 block w-full text-sm text-slate-600"
                    onChange={(event) =>
                      setVideoFile(event.target.files?.[0] ?? null)
                    }
                    type="file"
                  />
                </label>

                <button
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  <UploadCloud size={18} />
                  {isSaving ? "Đang lưu..." : "Tạo bài học"}
                </button>
                <p className="text-sm text-slate-500">{message}</p>
              </form>
            </>
          ) : (
            <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
              Giám đốc chỉ được xem tại đây để theo dõi quy trình nội dung,
              trạng thái xuất bản và kho video.
            </div>
          )}

          {canManage && (
            <form
              className="mt-5 border-t border-slate-200 pt-4"
              onSubmit={createPracticeQuestion}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Tạo câu hỏi nhanh</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Tạo câu hỏi trắc nghiệm một đáp án cho bài học.
                  </p>
                </div>
                <ClipboardList className="text-slate-500" size={20} />
              </div>

              <label className="mt-3 block">
                <span className="text-sm font-medium text-slate-700">
                  Bài học
                </span>
                <select
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  onChange={(event) => setQuestionLessonId(event.target.value)}
                  value={selectedQuestionLesson?.id ?? ""}
                >
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title} - {formatStatusCodeVi(lesson.status)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Hoạt động
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setActivityTitle(event.target.value)}
                    value={activityTitle}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Đáp án đúng
                  </span>
                  <select
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setCorrectAnswerIndex(Number(event.target.value))
                    }
                    value={correctAnswerIndex}
                  >
                    {answerOptions.map((_answer, index) => (
                      <option key={index} value={index}>
                        Lựa chọn {index + 1}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-3 block">
                <span className="text-sm font-medium text-slate-700">
                  Câu hỏi
                </span>
                <textarea
                  className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  onChange={(event) => setQuestionPrompt(event.target.value)}
                  value={questionPrompt}
                />
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {answerOptions.map((answer, index) => (
                  <label className="block" key={index}>
                    <span className="text-sm font-medium text-slate-700">
                      Lựa chọn {index + 1}
                    </span>
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => {
                        const next = [...answerOptions];
                        next[index] = event.target.value;
                        setAnswerOptions(next);
                      }}
                      value={answer}
                    />
                  </label>
                ))}
              </div>

              <label className="mt-3 block">
                <span className="text-sm font-medium text-slate-700">
                  Giải thích
                </span>
                <textarea
                  className="mt-1 min-h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  onChange={(event) => setExplanation(event.target.value)}
                  value={explanation}
                />
              </label>

              <button
                className="mt-3 flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                <ClipboardList size={18} />
                Tạo câu hỏi
              </button>
            </form>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Bài học gần đây</h3>
            <span className="text-xs text-slate-500">
              {overview?.lessons ?? lessons.length} bài học /{" "}
              {overview?.videos ?? 0} video
            </span>
          </div>
          <div className="mt-3 max-h-[360px] divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {lessons.map((lesson) => (
              <div className="py-3" key={lesson.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lesson.unit?.course?.level?.code} /{" "}
                      {lesson.unit?.course?.title} / {lesson.unit?.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lesson.videos.length} video -{" "}
                      {formatStatusCodeVi(lesson.status)}
                    </p>
                    {lesson.tags && lesson.tags.length > 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        {lesson.tags.map((item) => item.tag.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canManage && lesson.status === "DRAFT" && (
                      <button
                        className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium"
                        disabled={isSaving}
                        onClick={() =>
                          void transitionLesson(lesson.id, "submit-review")
                        }
                        type="button"
                      >
                        Gửi duyệt
                      </button>
                    )}
                    {canPublish && lesson.status === "IN_REVIEW" && (
                      <button
                        className="h-8 rounded-lg bg-teal-700 px-3 text-xs font-medium text-white"
                        disabled={isSaving}
                        onClick={() =>
                          void transitionLesson(lesson.id, "publish")
                        }
                        type="button"
                      >
                        Xuất bản
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {previewVideo && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">
                Xem trước video trong ứng dụng
              </p>
              {previewVideo.provider === "YOUTUBE" && previewVideo.embedUrl ? (
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full rounded-lg border border-slate-200"
                  src={previewVideo.embedUrl}
                  title={previewVideo.title ?? "Xem trước video YouTube"}
                />
              ) : previewVideoUrl ? (
                <video
                  className="aspect-video w-full rounded-lg border border-slate-200 bg-black"
                  controls
                  src={previewVideoUrl}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SecondaryPanel({ role }: { role: Role }) {
  const workflows: Record<Role, Array<[string, string, number]>> = {
    STUDENT: [
      ["Đánh giá đầu vào", "Hoàn tất", 100],
      ["Giao tiếp cơ bản", "Đang học", 68],
      ["Phản xạ hội thoại", "Tiếp theo", 22],
      ["Thuyết trình tự tin", "Sắp mở", 0],
    ],
    PARENT: [
      ["Thiết lập hồ sơ", "Hoàn tất", 100],
      ["Kế hoạch học tuần", "Đang theo dõi", 68],
      ["Báo cáo tiến độ", "Cần xem", 32],
      ["Mục tiêu tiếp theo", "Chưa bắt đầu", 0],
    ],
    TEACHER: [
      ["Chuẩn bị lớp", "Hoàn tất", 100],
      ["Chấm bài và phản hồi", "Đang xử lý", 64],
      ["Hỗ trợ học sinh", "Tiếp theo", 31],
      ["Tổng kết tuần", "Chưa bắt đầu", 0],
    ],
    CONTENT_EDITOR: [
      ["Soạn bản nháp", "Hoàn tất", 100],
      ["Kiểm tra học liệu", "Đang xử lý", 64],
      ["Gửi duyệt", "Tiếp theo", 31],
      ["Xuất bản", "Đang chờ", 0],
    ],
    ADMIN: [
      ["Tiếp nhận tín hiệu", "Hoàn tất", 100],
      ["Xác minh phạm vi", "Đang xử lý", 64],
      ["Phê duyệt thay đổi", "Tiếp theo", 31],
      ["Theo dõi sau xử lý", "Đang chờ", 0],
    ],
    DIRECTOR: [
      ["Phát hiện điểm lệch", "Hoàn tất", 100],
      ["Phân tích tác động", "Đang xem", 64],
      ["Ra quyết định", "Tiếp theo", 31],
      ["Theo dõi kết quả", "Đang chờ", 0],
    ],
    SUPPORT: [
      ["Tiếp nhận yêu cầu", "Hoàn tất", 100],
      ["Phân loại ảnh hưởng", "Đang xử lý", 64],
      ["Phản hồi hoặc chuyển cấp", "Tiếp theo", 31],
      ["Xác nhận hoàn tất", "Đang chờ", 0],
    ],
    SALE: [
      ["Tạo đơn", "Hoàn tất", 100],
      ["Bổ sung chứng từ", "Đang xử lý", 64],
      ["Theo dõi phê duyệt", "Tiếp theo", 31],
      ["Xác nhận kích hoạt", "Đang chờ", 0],
    ],
    AGENCY_OWNER: [
      ["Phân công đội ngũ", "Hoàn tất", 100],
      ["Theo dõi đơn hàng", "Đang xử lý", 64],
      ["Đối soát hoa hồng", "Tiếp theo", 31],
      ["Xác nhận chi trả", "Đang chờ", 0],
    ],
    AGENCY_MANAGER: [
      ["Nhận phạm vi", "Hoàn tất", 100],
      ["Điều phối bán hàng", "Đang xử lý", 64],
      ["Theo dõi kết quả", "Tiếp theo", 31],
      ["Báo cáo đại lý", "Đang chờ", 0],
    ],
    OPERATIONS: [
      ["Tiếp nhận hồ sơ", "Hoàn tất", 100],
      ["Đối soát chứng từ", "Đang xử lý", 64],
      ["Phê duyệt đơn", "Tiếp theo", 31],
      ["Kích hoạt tài khoản", "Đang chờ", 0],
    ],
  };
  const titles: Record<Role, string> = {
    STUDENT: "Lộ trình học",
    PARENT: "Nhịp đồng hành",
    TEACHER: "Quy trình chăm sóc lớp",
    CONTENT_EDITOR: "Quy trình xuất bản",
    ADMIN: "Quy trình kiểm soát",
    DIRECTOR: "Chu trình quyết định",
    SUPPORT: "Quy trình hỗ trợ",
    SALE: "Quy trình đơn hàng",
    AGENCY_OWNER: "Chu trình vận hành đại lý",
    AGENCY_MANAGER: "Chu trình điều phối",
    OPERATIONS: "Quy trình phê duyệt",
  };
  const items = workflows[role];

  return (
    <section
      className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4"
      id="dashboard-secondary-panel"
    >
      <h2 className="text-lg font-semibold">{titles[role]}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {items.map(([title, status, progress]) => (
          <div className="py-3 first:pt-0 last:pb-0" key={String(title)}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-slate-500">{status}</p>
              </div>
              {progress === 100 ? (
                <CheckCircle2 className="text-teal-600" size={18} />
              ) : progress === 0 ? (
                <LockKeyhole className="text-slate-400" size={18} />
              ) : (
                <ChevronRight className="text-slate-400" size={18} />
              )}
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-teal-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AiOrOpsPanel({
  childProfileId,
  onOpenProtected,
  role,
  session,
}: {
  childProfileId: string;
  onOpenProtected: () => void;
  role: Role;
  session: Session;
}) {
  const isStudent = role === "STUDENT";
  const isParent = role === "PARENT";
  const staffPanelTitles: Record<Role, string> = {
    STUDENT: "Trợ lý AI",
    PARENT: "Gợi ý đồng hành",
    TEACHER: "Ghi chú giảng dạy",
    CONTENT_EDITOR: "Lưu ý xuất bản",
    ADMIN: "Nguyên tắc kiểm soát",
    DIRECTOR: "Góc nhìn quyết định",
    SUPPORT: "Cam kết hỗ trợ",
    SALE: "Nhịp theo dõi khách hàng",
    AGENCY_OWNER: "Điểm kiểm soát đại lý",
    AGENCY_MANAGER: "Lưu ý điều phối",
    OPERATIONS: "Nguyên tắc phê duyệt",
  };
  const staffNotes: Record<Role, string> = {
    STUDENT: "",
    PARENT: "",
    TEACHER: "Ưu tiên phản hồi có bằng chứng và hoàn tất vòng hỗ trợ trước khi đóng việc.",
    CONTENT_EDITOR: "Chỉ xuất bản khi video, câu hỏi, thẻ và trạng thái duyệt đã nhất quán.",
    ADMIN: "Mọi thay đổi quyền và dữ liệu quan trọng cần có lý do cùng dấu vết kiểm toán.",
    DIRECTOR: "Đi từ tín hiệu đến tác động và quyết định; không xử lý chi tiết vận hành tại đây.",
    SUPPORT: "Giữ người dùng được cập nhật, chuyển cấp đúng hạn và xác nhận kết quả sau xử lý.",
    SALE: "Mỗi đơn cần đủ thông tin khách hàng, chứng từ và bước tiếp theo rõ ràng.",
    AGENCY_OWNER: "Theo dõi theo phạm vi đại lý và đối soát trước khi xác nhận chi trả.",
    AGENCY_MANAGER: "Chỉ thao tác trong phạm vi thành viên và đơn hàng được phân công.",
    OPERATIONS: "Không kích hoạt quyền học khi chứng từ hoặc trạng thái phê duyệt chưa hợp lệ.",
  };
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSessionId, setChatSessionId] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatStatus, setChatStatus] = useState("");
  const [chatBusy, setChatBusy] = useState(false);

  async function sendChatMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message) {
      setChatStatus("Hãy nhập câu hoặc chủ đề con muốn luyện.");
      return;
    }
    if (!childProfileId) {
      setChatStatus("Chưa tải được hồ sơ học sinh. Hãy thử tải lại trang.");
      return;
    }

    setChatBusy(true);
    setChatStatus("");
    try {
      const response = await fetch(`${apiBaseUrl}/v1/ai-chat/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childProfileId,
          message,
          ...(chatSessionId ? { sessionId: chatSessionId } : {}),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        assistantMessage?: string;
        message?: string | string[];
        sessionId?: string;
      };
      if (!response.ok) {
        const errorMessage = Array.isArray(payload.message)
          ? payload.message.join(" ")
          : payload.message;
        throw new Error(errorMessage ?? "Không thể gửi tin nhắn.");
      }

      setChatSessionId(payload.sessionId ?? chatSessionId);
      setChatReply(payload.assistantMessage ?? "Trợ lý đã nhận được câu hỏi.");
      setChatInput("");
    } catch (error) {
      setChatStatus(
        error instanceof Error ? error.message : "Không thể gửi tin nhắn.",
      );
    } finally {
      setChatBusy(false);
    }
  }

  return (
    <section
      className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4"
      id="dashboard-ai-panel"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isStudent
            ? "Trợ lý AI"
            : isParent
              ? "Gợi ý đồng hành"
              : staffPanelTitles[role]}
        </h2>
        {isStudent ? (
          <Sparkles className="text-violet-600" size={18} />
        ) : (
          <PenTool size={18} />
        )}
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <p className="rounded-lg bg-slate-100 p-3 text-slate-700">
          {isStudent
            ? "Thử hỏi: “Giúp con luyện cách chào hỏi bằng tiếng Anh.”"
            : isParent
              ? "Chọn đúng hồ sơ con trước khi mở bài học và báo cáo tiến độ."
              : roleHomeCopy[role]}
        </p>
        <p className="rounded-lg bg-violet-50 p-3 text-violet-950">
          {isStudent
            ? "Trợ lý sử dụng hồ sơ học tập và quyền của gói đang hoạt động."
            : isParent
              ? "Các giới hạn học và thiết bị được quản lý trong hồ sơ gia đình."
              : staffNotes[role]}
        </p>
      </div>

      {isStudent ? (
        <>
          <button
            aria-expanded={chatOpen}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-700 px-3 text-sm font-medium text-white"
            onClick={() => setChatOpen((current) => !current)}
            type="button"
          >
            <Bot size={18} />
            {chatOpen ? "Đóng trò chuyện" : "Mở trò chuyện"}
          </button>
          {chatOpen && (
            <form className="mt-3 space-y-3" onSubmit={sendChatMessage}>
              {chatReply && (
                <p className="rounded-2xl bg-violet-50 p-3 text-sm leading-6 text-violet-950">
                  {chatReply}
                </p>
              )}
              <textarea
                aria-label="Tin nhắn cho trợ lý AI"
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none"
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Con muốn luyện câu nào?"
                value={chatInput}
              />
              {chatStatus && (
                <p className="text-xs font-medium text-rose-600">
                  {chatStatus}
                </p>
              )}
              <button
                className="kid-primary-button flex h-10 w-full items-center justify-center gap-2 text-sm disabled:opacity-50"
                disabled={chatBusy}
                type="submit"
              >
                <Send size={16} />
                {chatBusy ? "Đang gửi..." : "Gửi cho trợ lý"}
              </button>
            </form>
          )}
        </>
      ) : (
        <button
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-700 px-3 text-sm font-medium text-white"
          onClick={onOpenProtected}
          type="button"
        >
          <ShieldCheck size={18} />
          {isParent ? "Xem quyền gia đình" : "Mở workspace chuyên trách"}
        </button>
      )}
    </section>
  );
}

function AccessPanel({ dashboard }: { dashboard: DashboardPayload }) {
  return (
    <section
      className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4"
      id="dashboard-access-panel"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tóm tắt tài khoản</h2>
        <ShieldCheck className="text-slate-500" size={18} />
      </div>
      <div className="mt-4 grid grid-cols-2 border-y border-slate-200">
        {[
          ["Loại tài khoản", roleLabels[dashboard.role]],
          ["Trạng thái", "Đang hoạt động"],
          [
            dashboard.role === "STUDENT" || dashboard.role === "PARENT"
              ? "Quyền học tập"
              : "Phạm vi truy cập",
            dashboard.role === "STUDENT"
              ? "Cao cấp"
              : dashboard.role === "PARENT"
                ? "Góc nhìn gia đình"
                : "Công cụ công việc",
          ],
          ["Hỗ trợ", "Khả dụng"],
        ].map(([label, value], index) => (
          <div
            className={`p-3 ${index % 2 === 1 ? "border-l border-slate-200" : ""} ${
              index < 2 ? "border-b border-slate-200" : ""
            }`}
            key={label}
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-100 p-3 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Users size={17} />
          {dashboard.user.roles.map((role) => roleLabels[role]).join(", ")}
        </span>
        <ChevronRight size={17} className="text-slate-500" />
      </div>
    </section>
  );
}

function workItemsForRole(role: Role) {
  const items: Record<Role, string[]> = {
    STUDENT: ["Tiếp tục bài học", "Luyện tập sau video", "Hỏi trợ lý AI"],
    PARENT: ["Xem tiến độ của con", "Xem thời gian học", "Quản lý thanh toán"],
    TEACHER: [
      "Ưu tiên học sinh tiến độ thấp",
      "Chấm bài nói",
      "Gửi ghi chú lớp",
    ],
    CONTENT_EDITOR: [
      "Sửa thông tin bài nháp",
      "Tải bản chép lời",
      "Xuất bản chương đã duyệt",
    ],
    ADMIN: [
      "Kiểm tra vấn đề thanh toán",
      "Điều chỉnh quyền học",
      "Xem nhật ký kiểm toán",
    ],
    DIRECTOR: [
      "Xem doanh thu gói học",
      "So sánh nhóm học viên",
      "Duyệt ngân sách",
    ],
    SUPPORT: [
      "Mở yêu cầu hỗ trợ",
      "Kiểm tra sổ ví",
      "Chuyển cấp vấn đề nhà cung cấp",
    ],
    SALE: ["Tạo đơn học viên", "Tải hóa đơn khách hàng", "Theo dõi phê duyệt"],
    AGENCY_OWNER: [
      "Tạo đơn đại lý",
      "Mời nhân viên kinh doanh",
      "Duyệt chi trả",
    ],
    AGENCY_MANAGER: [
      "Tạo đơn đại lý",
      "Theo dõi nhân viên kinh doanh",
      "Xem báo cáo",
    ],
    OPERATIONS: [
      "Kiểm tra minh chứng chuyển khoản",
      "Tải hóa đơn đối ứng",
      "Kích hoạt tài khoản",
    ],
  };

  return items[role];
}

function workspaceRows(role: Role) {
  const rows: Record<
    Role,
    { title: string; description: string; value: string }[]
  > = {
    STUDENT: [],
    PARENT: [],
    TEACHER: [
      {
        title: "Lớp A1 buổi tối",
        description: "9 học sinh chưa hoàn thành bài luyện nói tuần này.",
        value: "Cao",
      },
      {
        title: "Chấm phát âm",
        description: "AI đã chấm sơ bộ; đang chờ giáo viên duyệt.",
        value: "36",
      },
      {
        title: "Tin nhắn phụ huynh",
        description: "Hai học sinh cần ghi chú tiến độ trước thứ Sáu.",
        value: "2",
      },
    ],
    CONTENT_EDITOR: [
      {
        title: "Chương giao tiếp công sở",
        description: "Đã tải video nhưng bản chép lời thiếu mốc thời gian.",
        value: "Bản nháp",
      },
      {
        title: "Bài kiểm tra ngữ pháp A2",
        description: "12 câu hỏi cần xác nhận đáp án.",
        value: "Duyệt",
      },
      {
        title: "Nền tảng IELTS",
        description: "Đề cương khóa học mới đang chờ phê duyệt.",
        value: "Queued",
      },
    ],
    ADMIN: [
      {
        title: "Đợt gia hạn thất bại",
        description:
          "Webhook nhà cung cấp ghi nhận 18 giao dịch thanh toán lỗi.",
        value: "18",
      },
      {
        title: "Cấp quyền thủ công",
        description: "Bộ phận hỗ trợ yêu cầu điều chỉnh quyền học năm.",
        value: "5",
      },
      {
        title: "Duyệt nhật ký",
        description: "Đáp án câu hỏi đã thay đổi sau khi xuất bản.",
        value: "7",
      },
    ],
    DIRECTOR: [
      {
        title: "Doanh thu gói học năm",
        description: "Gói năm có tỷ lệ chuyển đổi tốt hơn gói tháng.",
        value: "+12.8%",
      },
      {
        title: "Hiệu quả đầu tư nội dung",
        description: "Lộ trình video A1 có tỷ lệ hoàn thành tốt nhất.",
        value: "78%",
      },
      {
        title: "Kiểm soát chi phí AI",
        description: "Mức dùng AI cao cấp đang trong mục tiêu tháng.",
        value: "6.1%",
      },
    ],
    SUPPORT: [
      {
        title: "Đối soát ví",
        description: "Năm tài khoản cần xác nhận sổ giao dịch.",
        value: "5",
      },
      {
        title: "Vấn đề đăng nhập",
        description: "Yêu cầu mới phản ánh phiên hết hạn sau khi đặt lại.",
        value: "12",
      },
      {
        title: "Danh sách hoàn tiền",
        description: "Mã tham chiếu nhà cung cấp cần đối chiếu thủ công.",
        value: "3",
      },
    ],
    SALE: [
      {
        title: "Đơn học viên mới",
        description:
          "Tạo thông tin đăng nhập và tải minh chứng thanh toán của khách.",
        value: "Bản nháp",
      },
      {
        title: "Đang chờ duyệt",
        description: "Các đơn đang chờ vận hành xác nhận đã nhận tiền.",
        value: "15",
      },
      {
        title: "Theo dõi gia hạn",
        description:
          "Các tài khoản hết hạn tháng này cần được liên hệ gia hạn.",
        value: "27",
      },
    ],
    AGENCY_OWNER: [
      {
        title: "Bàn kinh doanh đại lý",
        description:
          "Tạo nhân viên kinh doanh trong đại lý và theo dõi mã giới thiệu.",
        value: "Chủ đại lý",
      },
      {
        title: "Chi trả đại lý",
        description: "Rút hoa hồng đại lý khả dụng sau khi vận hành duyệt.",
        value: "Sẵn sàng",
      },
      {
        title: "Báo cáo kênh",
        description:
          "Doanh thu và hoa hồng chỉ hiển thị trong phạm vi đại lý của bạn.",
        value: "Theo phạm vi",
      },
    ],
    AGENCY_MANAGER: [
      {
        title: "Nhân viên đang quản lý",
        description:
          "Theo dõi hoạt động kinh doanh và xử lý liên tục đơn học viên.",
        value: "Đội ngũ",
      },
      {
        title: "Đơn đại lý",
        description: "Gửi minh chứng thanh toán khách hàng dưới đại lý.",
        value: "Hàng đợi",
      },
      {
        title: "Báo cáo theo phạm vi",
        description: "Báo cáo chỉ gồm doanh thu của đại lý được phân công.",
        value: "Theo phạm vi",
      },
    ],
    OPERATIONS: [
      {
        title: "Kiểm tra chuyển khoản",
        description:
          "Đối chiếu hóa đơn khách với số tiền nhận được trước khi duyệt.",
        value: "18",
      },
      {
        title: "Kích hoạt quyền truy cập",
        description: "Đơn được duyệt sẽ tạo gói học và ngày hết hạn.",
        value: "Hàng đợi",
      },
      {
        title: "Kho hóa đơn",
        description: "Hóa đơn đối ứng được lưu theo từng đơn kích hoạt.",
        value: "PDF",
      },
    ],
  };

  return rows[role];
}

function ParentChildrenPanel({
  onSwitchToBilling,
  onSwitchToFamily,
  session,
}: {
  onSwitchToBilling: () => void;
  onSwitchToFamily: () => void;
  session: Session;
}) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("Đang tải dữ liệu học tập của con.");
  const [savingChildId, setSavingChildId] = useState<string | null>(null);
  const [grantingChildId, setGrantingChildId] = useState<string | null>(null);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadChildren = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/v1/parent/children`, {
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tải danh sách học sinh."),
        );
      }

      const data = (await response.json()) as ParentChildrenPayload;
      setChildren(data.children);
      setLimits(
        Object.fromEntries(
          data.children.map((child) => [
            child.id,
            String(child.screenTime.dailyLimitMinutes),
          ]),
        ),
      );
      setEnabled(
        Object.fromEntries(
          data.children.map((child) => [child.id, child.screenTime.isEnabled]),
        ),
      );
      setMessage(
        data.children.length > 0
          ? "Xem tiến độ học và cài đặt thiết bị hàng ngày."
          : "no-children",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách học sinh.",
      );
    }
  }, [authHeaders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadChildren();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadChildren]);

  async function saveScreenTime(child: ParentChild) {
    const limit = Number(limits[child.id]);

    if (!Number.isInteger(limit) || limit < 10 || limit > 240) {
      setMessage("Số phút/ngày phải từ 10 đến 240 phút.");
      return;
    }

    setSavingChildId(child.id);
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/parent/children/${child.id}/screen-time`,
        {
          method: "PATCH",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isEnabled: enabled[child.id] ?? false,
            dailyLimitMinutes: limit,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể lưu giới hạn thiết bị."),
        );
      }

      const screenTime = (await response.json()) as ParentChild["screenTime"];
      setChildren((current) =>
        current.map((item) =>
          item.id === child.id ? { ...item, screenTime } : item,
        ),
      );
      setLimits((current) => ({ ...current, [child.id]: String(limit) }));
      setEnabled((current) => ({
        ...current,
        [child.id]: screenTime.isEnabled,
      }));
      setMessage(`Đã lưu giới hạn thiết bị cho ${child.displayName}.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể lưu giới hạn thiết bị.",
      );
    } finally {
      setSavingChildId(null);
    }
  }

  async function grantExtraDeviceTime(
    child: ParentChild,
    extraMinutes: number,
  ) {
    setGrantingChildId(child.id);
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/parent/children/${child.id}/device-time-grants`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            extraMinutes,
            note: "Cộng thêm từ phụ huynh",
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Không thể cộng thêm thời gian thiết bị.",
          ),
        );
      }

      setMessage(`Đã cộng ${extraMinutes} phút cho ${child.displayName}.`);
      await loadChildren();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể cộng thêm thời gian thiết bị.",
      );
    } finally {
      setGrantingChildId(null);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Theo dõi học tập
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Tiến độ và giới hạn thiết bị
          </h2>
          {message === "no-children" ? (
            <p className="mt-1 text-sm text-slate-500">
              Chưa có hồ sơ con nào.{" "}
              <button
                className="font-medium text-teal-700 hover:underline"
                onClick={onSwitchToFamily}
                type="button"
              >
                Thêm hồ sơ con ngay →
              </button>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          )}
        </div>
        <Users className="text-slate-500" size={22} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {children.map((child) => {
          const childLimit =
            limits[child.id] ?? String(child.screenTime.dailyLimitMinutes);
          const childEnabled = enabled[child.id] ?? child.screenTime.isEnabled;
          const completionRate = Math.min(
            100,
            Math.max(0, child.progress.completionRate),
          );

          return (
            <article
              className="rounded-lg border border-slate-200 p-4"
              key={child.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-semibold">{child.displayName}</p>
                  {child.subscription && (
                    <p className="mt-1 text-sm text-slate-500">
                      {child.subscription.status === "ACTIVE"
                        ? "Gói đang hoạt động"
                        : child.subscription.status}
                    </p>
                  )}
                  {!child.subscription && (
                    <button
                      className="mt-1 rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                      onClick={onSwitchToBilling}
                      type="button"
                    >
                      Mua gói học →
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  [
                    "Tuần này",
                    formatStudyMinutes(child.progress.weeklyStudyMinutes),
                  ],
                  [
                    "Thiết bị hôm nay",
                    formatStudyMinutes(child.deviceUsage.usedMinutes),
                  ],
                  [
                    "Còn lại",
                    child.deviceUsage.remainingMinutes === null
                      ? "Không giới hạn"
                      : formatStudyMinutes(child.deviceUsage.remainingMinutes),
                  ],
                  ["Hoàn thành", String(child.progress.completedLessons)],
                ].map(([label, value]) => (
                  <div className="rounded-lg bg-slate-100 p-3" key={label}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Tiến độ bài học</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-teal-600"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-teal-50 p-3">
                <p className="text-sm font-semibold text-teal-950">
                  {child.insight.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-teal-900">
                  {child.insight.description}
                </p>
                <p className="mt-2 text-xs font-medium text-teal-950">
                  {child.insight.recommendedAction}
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      checked={childEnabled}
                      className="size-4"
                      onChange={(event) =>
                        setEnabled((current) => ({
                          ...current,
                          [child.id]: event.target.checked,
                        }))
                      }
                      type="checkbox"
                    />
                    Bật giới hạn thiết bị
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Số phút tối đa/ngày
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm md:w-32"
                      max={240}
                      min={10}
                      onChange={(event) =>
                        setLimits((current) => ({
                          ...current,
                          [child.id]: event.target.value,
                        }))
                      }
                      type="number"
                      value={childLimit}
                    />
                  </label>
                  <button
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white disabled:opacity-60"
                    disabled={savingChildId === child.id}
                    onClick={() => void saveScreenTime(child)}
                    type="button"
                  >
                    <Settings size={17} />
                    Lưu
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {child.screenTime.isEnabled
                    ? `${child.deviceUsage.limitMinutes ?? child.screenTime.dailyLimitMinutes} phút/ngày đã bật.`
                    : "Giới hạn đang tắt."}
                  {child.deviceUsage.grantedExtraMinutes
                    ? ` Cộng thêm hôm nay: ${child.deviceUsage.grantedExtraMinutes} phút.`
                    : ""}
                  {child.deviceUsage.byDevice.length > 0
                    ? ` Hôm nay: ${child.deviceUsage.byDevice
                        .map(
                          (item) =>
                            `${item.deviceType.toLowerCase()} ${formatStudyMinutes(
                              item.usedMinutes,
                            )}`,
                        )
                        .join(", ")}.`
                    : " Chưa ghi nhận thiết bị hôm nay."}
                  {child.subscription
                    ? ` Gói học đến ngày ${formatDate(child.subscription.currentPeriodEnd)}.`
                    : " Chưa có gói học."}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[10, 15, 30].map((minutes) => (
                    <button
                      className="h-9 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-900 disabled:opacity-50"
                      disabled={!childEnabled || grantingChildId === child.id}
                      key={minutes}
                      onClick={() => void grantExtraDeviceTime(child, minutes)}
                      type="button"
                    >
                      +{minutes} phút hôm nay
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ForgotPasswordLink — inline modal for forgot password flow
// ---------------------------------------------------------------------------
function ForgotPasswordLink() {
  const [open, setOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpStatus, setFpStatus] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  function closeModal() {
    setOpen(false);
    setFpStatus("");
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFpLoading(true);
    setFpStatus("");
    try {
      const res = await fetch(`${apiBaseUrl}/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = (await res.json()) as { message?: string };
      setFpStatus(data.message ?? "Email đã được gửi nếu tài khoản tồn tại.");
    } catch {
      setFpStatus("Không thể gửi email. Vui lòng thử lại.");
    } finally {
      setFpLoading(false);
    }
  }

  return (
    <>
      <button
        className="text-sm text-teal-700 hover:underline"
        onClick={() => setOpen(true)}
        type="button"
      >
        Quên mật khẩu?
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold">Đặt lại mật khẩu</h3>
            <p className="mt-1 text-sm text-slate-500">
              Nhập email đăng ký để nhận link đặt lại mật khẩu.
            </p>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => void handleSubmit(e)}
            >
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(e) => setFpEmail(e.target.value)}
                  required
                  type="email"
                  value={fpEmail}
                />
              </label>
              <button
                className="h-10 w-full rounded-lg bg-teal-700 text-sm font-medium text-white disabled:opacity-60"
                disabled={fpLoading}
                type="submit"
              >
                {fpLoading ? "Đang gửi..." : "Gửi link đặt lại"}
              </button>
              {fpStatus && <p className="text-sm text-teal-700">{fpStatus}</p>}
            </form>
            <button
              className="mt-3 text-sm text-slate-500 hover:underline"
              onClick={closeModal}
              type="button"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// ParentPortal — tabbed portal wrapping all parent panels
// ---------------------------------------------------------------------------
type ParentTab =
  | "children"
  | "learning"
  | "learningPath"
  | "billing"
  | "reports"
  | "family"
  | "profile";

function ParentPortal({
  activeTab,
  onLogout,
  onTabChange,
  session,
}: {
  activeTab: ParentTab;
  onLogout: () => void;
  onTabChange: (tab: ParentTab) => void;
  session: Session;
}) {
  const tabs: Array<{ id: ParentTab; label: string }> = [
    { id: "children", label: "Học sinh" },
    { id: "learning", label: "Học hôm nay" },
    { id: "learningPath", label: "Lộ trình" },
    { id: "family", label: "Hồ sơ con" },
    { id: "reports", label: "Báo cáo" },
    { id: "billing", label: "Đơn & thanh toán" },
    { id: "profile", label: "Tài khoản" },
  ];

  return (
    <section className="mt-6 scroll-mt-4" id="parent-portal-panel">
      <div
        aria-label="Khu vực dành cho phụ huynh"
        className="kid-tab-rail flex gap-2 overflow-x-auto border-b border-slate-200 pb-1"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={`min-h-11 shrink-0 rounded-t-lg px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-slate-500 hover:text-slate-800"
            }`}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {activeTab === "children" && (
          <ParentChildrenPanel
            onSwitchToBilling={() => onTabChange("billing")}
            onSwitchToFamily={() => onTabChange("family")}
            session={session}
          />
        )}
        {activeTab === "learningPath" && (
          <ParentLearningPathPanel session={session} />
        )}
        {activeTab === "learning" && (
          <ParentChildLearningPanel session={session} />
        )}
        {activeTab === "billing" && <ParentBillingPanel session={session} />}
        {activeTab === "reports" && (
          <ParentLearningReportPanel session={session} />
        )}
        {activeTab === "family" && <ParentFamilyPanel session={session} />}
        {activeTab === "profile" && (
          <ParentProfilePanel onLogout={onLogout} session={session} />
        )}
      </div>
    </section>
  );
}

function ParentChildLearningPanel({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState("");
  const [requestedLessonId, setRequestedLessonId] = useState("");
  const [activeVideoContext, setActiveVideoContext] =
    useState<ActiveVideoPlanContext | null>(null);
  const [activePracticeContext, setActivePracticeContext] =
    useState<ActivePracticePlanContext | null>(null);
  const [homeRefreshToken, setHomeRefreshToken] = useState(0);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [message, setMessage] = useState("Đang tải hồ sơ học sinh.");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
          headers: authHeaders,
        });
        if (!res.ok) {
          throw new Error(
            await readApiError(res, "Không thể tải danh sách hồ sơ con."),
          );
        }

        const data = (await res.json()) as ParentChildrenPayload;
        setChildren(data.children);
        setSelectedChildId(
          (current) => current ?? data.children[0]?.id ?? null,
        );
        setMessage(
          data.children.length > 0
            ? "Chọn hồ sơ con để bắt đầu buổi học hôm nay."
            : "Chưa có hồ sơ học sinh. Hãy tạo hồ sơ con trước.",
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách hồ sơ con.",
        );
      } finally {
        setChildrenLoading(false);
      }
    })();
  }, [authHeaders]);

  const selectedChild =
    children.find((child) => child.id === selectedChildId) ?? null;

  const handleResume = useCallback(
    (
      lessonId: string,
      target: "video" | "practice" = "video",
      context?: ActiveLearningPlanContext,
    ) => {
      setRequestedLessonId(lessonId);
      setActiveLessonId(lessonId);
      setActiveVideoContext(context?.kind === "VIDEO" ? context : null);
      setActivePracticeContext(context?.kind === "PRACTICE" ? context : null);
      window.setTimeout(() => {
        document
          .getElementById(
            target === "practice"
              ? "student-practice-panel"
              : "student-video-panel",
          )
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    },
    [],
  );
  const handlePracticeDailyPlanRefresh = useCallback(
    (refresh: PracticeDailyPlanRefresh) => {
      setActivePracticeContext(refresh.context);
      setHomeRefreshToken((current) => current + 1);
    },
    [],
  );

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Học cùng con
            </p>
            <h2 className="mt-1 text-xl font-semibold">Kế hoạch học hôm nay</h2>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
          <div className="flex max-w-full gap-2 overflow-auto">
            {children.map((child) => (
              <button
                className={`h-9 whitespace-nowrap rounded-lg px-3 text-sm font-medium ring-1 ${
                  selectedChildId === child.id
                    ? "bg-slate-950 text-white ring-slate-950"
                    : "bg-white text-slate-700 ring-slate-200"
                }`}
                key={child.id}
                onClick={() => {
                  setSelectedChildId(child.id);
                  setActiveLessonId("");
                  setRequestedLessonId("");
                  setActiveVideoContext(null);
                  setActivePracticeContext(null);
                  setHomeRefreshToken((current) => current + 1);
                }}
                type="button"
              >
                {child.displayName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {childrenLoading ? (
        <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">
          Đang tải...
        </p>
      ) : !selectedChild ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          Chưa có hồ sơ học sinh để mở buổi học.
        </p>
      ) : (
        <>
          <StudentTodayPanel
            childDisplayName={selectedChild.displayName}
            childProfileId={selectedChild.id}
            onResume={handleResume}
            refreshToken={homeRefreshToken}
            session={session}
          />
          <VideoImmersionPanel
            childProfileId={selectedChild.id}
            onLessonChange={setActiveLessonId}
            planContext={activeVideoContext}
            requestedLessonId={requestedLessonId}
            session={session}
          />
          <StudentPracticePanel
            childProfileId={selectedChild.id}
            lessonId={activeLessonId}
            onDailyPlanRefresh={handlePracticeDailyPlanRefresh}
            planContext={activePracticeContext}
            session={session}
          />
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ParentBillingPanel — order history and bank transfer info
// ---------------------------------------------------------------------------
function ParentLearningPathPanel({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<ParentContentAssignment>(null);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
          headers: authHeaders,
        });
        if (!res.ok)
          throw new Error(
            await readApiError(res, "Không thể tải hồ sơ học sinh."),
          );
        const data = (await res.json()) as ParentChildrenPayload;
        setChildren(data.children);
        if (data.children.length > 0) setSelectedChildId(data.children[0].id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể tải hồ sơ học sinh.",
        );
      } finally {
        setChildrenLoading(false);
      }
    })();
  }, [authHeaders]);

  useEffect(() => {
    if (!selectedChildId) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAssignmentLoading(true);
      setError("");
      void (async () => {
        try {
          const res = await fetch(
            `${apiBaseUrl}/v1/parent/children/${selectedChildId}/content-assignment`,
            {
              headers: authHeaders,
            },
          );
          if (!res.ok)
            throw new Error(
              await readApiError(res, "Không thể tải lộ trình học."),
            );
          setAssignment((await res.json()) as ParentContentAssignment);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Không thể tải lộ trình học.",
          );
          setAssignment(null);
        } finally {
          setAssignmentLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authHeaders, selectedChildId]);

  if (childrenLoading)
    return <p className="py-6 text-sm text-slate-500">Đang tải...</p>;
  if (children.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Chưa có hồ sơ học sinh nào.</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-700">
          Chọn học sinh:
        </span>
        {children.map((child) => (
          <button
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedChildId === child.id
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-slate-200 text-slate-600 hover:border-teal-300"
            }`}
            key={child.id}
            onClick={() => setSelectedChildId(child.id)}
            type="button"
          >
            {child.displayName}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {assignmentLoading ? (
        <p className="text-sm text-slate-500">Đang tải lộ trình...</p>
      ) : assignment ? (
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                {assignment.contentPackage.code}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {assignment.contentPackage.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {assignment.contentPackage.learningPath.code} ·{" "}
                {assignment.contentPackage.learningPath.title}
              </p>
            </div>
            <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-700">
              {learningPathStatusLabel(
                assignment.contentPackage.learningPath.status,
              )}
            </span>
          </div>

          <div className="mt-5 rounded-lg border border-slate-100">
            <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Bài trong lộ trình
            </div>
            <ul className="divide-y divide-slate-100">
              {assignment.contentPackage.learningPath.items.length === 0 ? (
                <li className="px-4 py-3 text-sm text-slate-500">
                  Chưa có bài trong lộ trình.
                </li>
              ) : (
                assignment.contentPackage.learningPath.items.map((item) => (
                  <li
                    className="flex items-center gap-3 px-4 py-3 text-sm"
                    key={item.id}
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                      {item.sequence}
                    </span>
                    <span className="flex-1 text-slate-800">
                      {item.lesson.title}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {learningPathStatusLabel(item.lesson.status)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </article>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <ClipboardList className="mx-auto mb-3 text-slate-300" size={40} />
          <p className="text-sm font-medium text-slate-700">
            Chưa được gán lộ trình học chính
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Khi trung tâm gán gói học, lộ trình sẽ hiển thị tại đây.
          </p>
        </div>
      )}
    </section>
  );
}

type MyOrder = {
  id: string;
  status: string;
  source: string;
  packageName?: string | null;
  amountCents: number;
  currency: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  transferContent?: string | null;
  saleInvoiceUrl?: string | null;
  reviewNotes?: string | null;
  activatedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
};

const orderStatusLabel: Record<string, string> = {
  WAITING_PAYMENT: "Chờ chuyển khoản",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã kích hoạt",
  REJECTED: "Bị từ chối",
  CANCELED: "Đã hủy",
  REVOKED: "Đã thu hồi",
};
const orderStatusColor: Record<string, string> = {
  WAITING_PAYMENT: "bg-amber-100 text-amber-800",
  PENDING_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-teal-100 text-teal-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELED: "bg-slate-100 text-slate-600",
  REVOKED: "bg-red-100 text-red-800",
};

function ParentBillingPanel({ session }: { session: Session }) {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/v1/me/activation-orders`, {
          headers: authHeaders,
        });
        if (!res.ok)
          throw new Error(await readApiError(res, "Không thể tải đơn hàng."));
        const data = (await res.json()) as { orders: MyOrder[] };
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [authHeaders]);

  if (loading)
    return <p className="text-sm text-slate-500 py-6">Đang tải đơn hàng...</p>;
  if (error) return <p className="text-sm text-red-600 py-6">{error}</p>;

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <WalletCards className="mx-auto mb-3 text-slate-300" size={40} />
        <p className="text-sm text-slate-500">Chưa có đơn thanh toán nào.</p>
        <p className="mt-1 text-xs text-slate-400">
          Khi bạn mua gói học, đơn sẽ xuất hiện tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusLabel = orderStatusLabel[order.status] ?? order.status;
        const statusColor =
          orderStatusColor[order.status] ?? "bg-slate-100 text-slate-600";
        return (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5"
            key={order.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{order.packageName ?? "Gói học"}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatMoney(order.amountCents, order.currency)} &middot;{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>
            {order.status === "WAITING_PAYMENT" && order.transferContent && (
              <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm">
                <p className="font-semibold text-amber-900">
                  Thông tin chuyển khoản
                </p>
                <table className="mt-2 w-full">
                  <tbody className="text-slate-700">
                    {order.bankName && (
                      <tr>
                        <td className="py-0.5 pr-4 text-slate-500 text-xs w-32">
                          Ngân hàng
                        </td>
                        <td className="font-medium">{order.bankName}</td>
                      </tr>
                    )}
                    {order.bankAccountNumber && (
                      <tr>
                        <td className="py-0.5 pr-4 text-slate-500 text-xs">
                          Số TK
                        </td>
                        <td className="font-medium">
                          {order.bankAccountNumber}
                        </td>
                      </tr>
                    )}
                    {order.bankAccountName && (
                      <tr>
                        <td className="py-0.5 pr-4 text-slate-500 text-xs">
                          Tên TK
                        </td>
                        <td className="font-medium">{order.bankAccountName}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-0.5 pr-4 text-slate-500 text-xs">
                        Nội dung CK
                      </td>
                      <td className="font-semibold text-teal-800">
                        {order.transferContent}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-0.5 pr-4 text-slate-500 text-xs">
                        Số tiền
                      </td>
                      <td className="font-semibold">
                        {formatMoney(order.amountCents, order.currency)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {order.status === "APPROVED" && order.expiresAt && (
              <p className="mt-2 text-xs text-teal-700">
                Hết hạn: {new Date(order.expiresAt).toLocaleDateString("vi-VN")}
              </p>
            )}
            {order.reviewNotes && (
              <p className="mt-2 text-xs text-red-600">
                Ghi chú: {order.reviewNotes}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ParentReportsPanel — select a child then show weekly report
// ---------------------------------------------------------------------------
type ChildReportData = {
  childProfileId: string;
  period: { weeks: number; sinceDate: string };
  summary: {
    totalLessonsWatched: number;
    completedLessons: number;
    totalWatchCount: number;
    totalStudyMinutes: number;
    totalDeviceMinutes: number;
    totalGrantedExtraMinutes: number;
  };
  weeklyUsage: Array<{
    week: string;
    usedSeconds: number;
    usedMinutes: number;
    completed: number;
    watched: number;
    minutes: number;
  }>;
  recentLessons: Array<{
    lessonId: string;
    title: string;
    status: string;
    progressPercent: number;
    watchCount: number;
    lastWatchedAt: string | null;
    hasPractice: boolean;
  }>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ParentReportsPanelLegacy({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [report, setReport] = useState<ChildReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [childrenLoading, setChildrenLoading] = useState(true);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
          headers: authHeaders,
        });
        if (res.ok) {
          const data = (await res.json()) as ParentChildrenPayload;
          setChildren(data.children);
          if (data.children.length > 0) setSelectedChildId(data.children[0].id);
        }
      } finally {
        setChildrenLoading(false);
      }
    })();
  }, [authHeaders]);

  useEffect(() => {
    if (!selectedChildId) return;

    const timer = window.setTimeout(() => {
      setLoading(true);
      setReport(null);
      void (async () => {
        try {
          const res = await fetch(
            `${apiBaseUrl}/v1/parent/children/${selectedChildId}/report?weeks=4`,
            {
              headers: authHeaders,
            },
          );
          if (res.ok) setReport((await res.json()) as ChildReportData);
        } finally {
          setLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedChildId, authHeaders]);

  if (childrenLoading)
    return <p className="text-sm text-slate-500 py-6">Đang tải...</p>;
  if (children.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Chưa có hồ sơ con nào.</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-700">
          Chọn học sinh:
        </span>
        {children.map((child) => (
          <button
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedChildId === child.id
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-slate-200 text-slate-600 hover:border-teal-300"
            }`}
            key={child.id}
            onClick={() => setSelectedChildId(child.id)}
            type="button"
          >
            {child.displayName}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-500">Đang tải báo cáo...</p>}

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Bài hoàn thành",
                value: String(report.summary.completedLessons),
              },
              {
                label: "Thời gian học (phút)",
                value: String(report.summary.totalStudyMinutes),
              },
              {
                label: "Thời gian thiết bị (phút)",
                value: String(report.summary.totalDeviceMinutes),
              },
              {
                label: "Cộng thêm thiết bị (phút)",
                value: String(report.summary.totalGrantedExtraMinutes),
              },
            ].map((m) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-4"
                key={m.label}
              >
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="mt-2 text-2xl font-semibold">{m.value}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {report.period.weeks} tuần gần nhất
                </p>
              </div>
            ))}
          </div>

          {report.weeklyUsage.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold">Thống kê theo tuần</h3>
              <div className="mt-3 space-y-2">
                {report.weeklyUsage
                  .slice()
                  .sort((a, b) => a.week.localeCompare(b.week))
                  .map((w) => {
                    const maxMin = Math.max(
                      ...report.weeklyUsage.map((x) => x.usedMinutes),
                      1,
                    );
                    const pct = Math.round((w.usedMinutes / maxMin) * 100);
                    return (
                      <div className="flex items-center gap-3" key={w.week}>
                        <span className="w-24 shrink-0 text-xs text-slate-500">
                          {w.week}
                        </span>
                        <div className="flex-1 h-4 rounded-full bg-slate-100">
                          <div
                            className="h-4 rounded-full bg-teal-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-20 shrink-0 text-right text-xs text-slate-600">
                          {formatStudyMinutes(w.usedMinutes)} · {w.completed}{" "}
                          bài
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {report.recentLessons.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold">Bài học gần đây</h3>
              <ul className="mt-3 divide-y divide-slate-100">
                {report.recentLessons.map((lesson) => (
                  <li
                    className="flex items-center justify-between py-2 text-sm"
                    key={lesson.lessonId}
                  >
                    <span className="text-slate-800">{lesson.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        lesson.status === "COMPLETED"
                          ? "bg-teal-100 text-teal-700"
                          : lesson.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {lesson.status === "COMPLETED"
                        ? "Hoàn thành"
                        : lesson.status === "IN_PROGRESS"
                          ? "Đang học"
                          : formatStatusCodeVi(lesson.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

type ParentLearningReportRange = "7d" | "30d";

type ParentLearningEvidenceReport = {
  child: {
    id: string;
    displayName: string;
  };
  range: ParentLearningReportRange;
  fromDate: string;
  toDate: string;
  activeAssignment: {
    packageTitle: string;
    learningPathTitle: string;
  } | null;
  summary: {
    completedPlanDays: number;
    activeDays: number;
    videoItemsCompleted: number;
    practiceItemsCompleted: number;
    averagePracticeScorePercent: number | null;
    totalWatchEvidenceMinutes: number;
    blockedItems: number;
  };
  days: Array<{
    date: string;
    planStatus: string | null;
    completedItems: number;
    totalItems: number;
    blockedItems: number;
    videoSummary: {
      completed: number;
      insufficientEvidence: number;
      maxWatchPercent: number | null;
      watchEvidenceMinutes: number;
    };
    practiceSummary: {
      completed: number;
      attempts: number;
      averageScorePercent: number | null;
    };
    items: Array<{
      itemId: string;
      itemType: string;
      status: string;
      lessonTitle: string | null;
      activityTitle: string | null;
      evidenceSummary: {
        watchPercent?: number;
        minWatchPercent?: number;
        percent?: number;
        minScore?: number | null;
      } | null;
      blockedReason: string | null;
      blockedMessage: string | null;
    }>;
    emptyState: {
      message: string;
    } | null;
  }>;
  emptyState: {
    message: string;
  } | null;
};

function ParentLearningReportPanel({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [range, setRange] = useState<ParentLearningReportRange>("7d");
  const [report, setReport] = useState<ParentLearningEvidenceReport | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
          headers: authHeaders,
        });
        if (!res.ok) {
          throw new Error(
            await readApiError(res, "Không thể tải hồ sơ học sinh."),
          );
        }
        const data = (await res.json()) as ParentChildrenPayload;
        setChildren(data.children);
        if (data.children.length > 0) setSelectedChildId(data.children[0].id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể tải hồ sơ học sinh.",
        );
      } finally {
        setChildrenLoading(false);
      }
    })();
  }, [authHeaders]);

  useEffect(() => {
    if (!selectedChildId) return;

    const timer = window.setTimeout(() => {
      setLoading(true);
      setReport(null);
      setError("");
      void (async () => {
        try {
          const res = await fetch(
            `${apiBaseUrl}/v1/parent/children/${selectedChildId}/learning-report?range=${range}`,
            {
              headers: authHeaders,
            },
          );
          if (!res.ok) {
            throw new Error(
              await readApiError(res, "Không thể tải báo cáo học tập."),
            );
          }
          setReport((await res.json()) as ParentLearningEvidenceReport);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải báo cáo học tập.",
          );
        } finally {
          setLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedChildId, range, authHeaders]);

  if (childrenLoading)
    return <p className="py-6 text-sm text-slate-500">Đang tải...</p>;
  if (children.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Chưa có hồ sơ con nào.</p>
      </div>
    );
  }

  const visibleItems =
    report?.days
      .flatMap((day) => day.items.map((item) => ({ ...item, date: day.date })))
      .slice()
      .reverse() ?? [];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700">
            Chọn học sinh:
          </span>
          {children.map((child) => (
            <button
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedChildId === child.id
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-slate-200 text-slate-600 hover:border-teal-300"
              }`}
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              type="button"
            >
              {child.displayName}
            </button>
          ))}
        </div>
        <div className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1">
          {(["7d", "30d"] as ParentLearningReportRange[]).map((option) => (
            <button
              className={`h-8 rounded-md px-3 text-sm font-medium ${
                range === option
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              key={option}
              onClick={() => setRange(option)}
              type="button"
            >
              {option === "7d" ? "7 ngày" : "30 ngày"}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Đang tải báo cáo...</p>}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {report && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  {report.fromDate} - {report.toDate}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {report.child.displayName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {report.activeAssignment
                    ? `${report.activeAssignment.packageTitle} - ${report.activeAssignment.learningPathTitle}`
                    : "Con chưa được gán lộ trình học chính."}
                </p>
              </div>
              <BarChart3 className="text-slate-400" size={24} />
            </div>
            {report.emptyState && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                {report.emptyState.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {[
              {
                label: "Ngày có học",
                value: `${report.summary.activeDays}/${range === "7d" ? 7 : 30}`,
              },
              {
                label: "Ngày xong kế hoạch",
                value: String(report.summary.completedPlanDays),
              },
              {
                label: "Video hoàn thành",
                value: String(report.summary.videoItemsCompleted),
              },
              {
                label: "Bài luyện đạt",
                value: String(report.summary.practiceItemsCompleted),
              },
              {
                label: "Điểm bài luyện TB",
                value:
                  report.summary.averagePracticeScorePercent === null
                    ? "—"
                    : `${report.summary.averagePracticeScorePercent}%`,
              },
              {
                label: "Phút video đã ghi nhận",
                value: formatStudyMinutes(
                  report.summary.totalWatchEvidenceMinutes,
                ),
              },
            ].map((m) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-4"
                key={m.label}
              >
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="mt-2 text-2xl font-semibold">{m.value}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {range === "7d" ? "7 ngày gần nhất" : "30 ngày gần nhất"}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold">Dòng thời gian học tập</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-100 text-xs text-slate-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Ngày</th>
                    <th className="py-2 pr-4 font-medium">Kế hoạch</th>
                    <th className="py-2 pr-4 font-medium">Việc học</th>
                    <th className="py-2 pr-4 font-medium">Video</th>
                    <th className="py-2 pr-4 font-medium">Bài luyện</th>
                    <th className="py-2 font-medium">Cần chú ý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.days
                    .slice()
                    .reverse()
                    .map((day) => {
                      const blockedMessages = day.items
                        .map((item) => item.blockedMessage)
                        .filter(Boolean);
                      return (
                        <tr key={day.date}>
                          <td className="py-3 pr-4 align-top text-slate-700">
                            {day.date}
                          </td>
                          <td className="py-3 pr-4 align-top">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                day.planStatus === "COMPLETED"
                                  ? "bg-teal-100 text-teal-700"
                                  : day.planStatus
                                    ? "bg-slate-100 text-slate-600"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {dailyLearningPlanStatusLabel(day.planStatus)}
                            </span>
                          </td>
                          <td className="py-3 pr-4 align-top text-slate-700">
                            {day.completedItems}/{day.totalItems}
                          </td>
                          <td className="py-3 pr-4 align-top text-slate-700">
                            {day.videoSummary.completed} video -{" "}
                            {day.videoSummary.maxWatchPercent ?? 0}% cao nhất -{" "}
                            {formatStudyMinutes(
                              day.videoSummary.watchEvidenceMinutes,
                            )}
                          </td>
                          <td className="py-3 pr-4 align-top text-slate-700">
                            {day.practiceSummary.completed} đạt -{" "}
                            {day.practiceSummary.attempts} lần làm
                            {day.practiceSummary.averageScorePercent !== null
                              ? ` - ${day.practiceSummary.averageScorePercent}%`
                              : ""}
                          </td>
                          <td className="py-3 align-top">
                            {blockedMessages.length > 0 ? (
                              <div className="space-y-1 text-xs text-amber-800">
                                {blockedMessages.map((message, index) => (
                                  <p key={`${day.date}-${index}`}>{message}</p>
                                ))}
                              </div>
                            ) : day.emptyState ? (
                              <p className="text-xs text-slate-500">
                                {day.emptyState.message}
                              </p>
                            ) : (
                              <p className="text-xs text-teal-700">
                                Hoàn thành.
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold">Bằng chứng theo việc học</h3>
            <div className="mt-3 space-y-3">
              {visibleItems.map((item) => (
                <div
                  className="rounded-lg border border-slate-100 p-3"
                  key={item.itemId}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {item.lessonTitle ??
                          item.activityTitle ??
                          learningPlanItemTypeLabel(item.itemType)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.date} - {learningPlanItemTypeLabel(item.itemType)}{" "}
                        - {learningItemStatusLabel(item.status)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.blockedReason
                          ? "bg-amber-100 text-amber-800"
                          : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      {item.blockedReason ? "Cần thêm chứng cứ" : "Đạt"}
                    </span>
                  </div>
                  {item.itemType === "VIDEO" && item.evidenceSummary && (
                    <p className="mt-2 text-xs text-slate-600">
                      Video đã xem: {item.evidenceSummary.watchPercent ?? 0}%,
                      mốc {item.evidenceSummary.minWatchPercent ?? 80}%
                    </p>
                  )}
                  {item.itemType === "PRACTICE" && item.evidenceSummary && (
                    <p className="mt-2 text-xs text-slate-600">
                      Bài luyện: {item.evidenceSummary.percent ?? 0}%{" "}
                      {item.evidenceSummary.minScore !== null &&
                      item.evidenceSummary.minScore !== undefined
                        ? `, mốc ${item.evidenceSummary.minScore}%`
                        : ""}
                    </p>
                  )}
                  {item.blockedMessage && (
                    <p className="mt-2 text-xs text-amber-800">
                      {item.blockedMessage}
                    </p>
                  )}
                </div>
              ))}
              {visibleItems.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                  {report.emptyState?.message ?? "Chưa có bằng chứng học tập."}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ParentFamilyPanel — quản lý hồ sơ con (thêm / xóa)
// ---------------------------------------------------------------------------
function ParentFamilyPanel({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [childName, setChildName] = useState("");
  const [addStatus, setAddStatus] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadChildren = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = (await res.json()) as ParentChildrenPayload;
        setChildren(data.children);
      }
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  async function handleAddChild(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddLoading(true);
    setAddStatus("");
    try {
      const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: childName.trim() }),
      });
      if (!res.ok)
        throw new Error(await readApiError(res, "Không thể thêm hồ sơ con."));
      setAddStatus("Đã thêm hồ sơ thành công!");
      setChildName("");
      await loadChildren();
    } catch (err) {
      setAddStatus(err instanceof Error ? err.message : "Lỗi khi thêm hồ sơ.");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDeleteChild(childProfileId: string) {
    setConfirmDeleteId(null);
    setDeletingId(childProfileId);
    try {
      const res = await fetch(
        `${apiBaseUrl}/v1/parent/children/${childProfileId}`,
        {
          method: "DELETE",
          headers: authHeaders,
        },
      );
      if (!res.ok)
        throw new Error(await readApiError(res, "Không thể xóa hồ sơ."));
      await loadChildren();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold">Thêm hồ sơ học sinh</h3>
        <p className="mt-1 text-xs text-slate-500">
          Nhập tên của con để tạo hồ sơ học tập mới.
        </p>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => void handleAddChild(e)}
        >
          <input
            className="h-9 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Tên con (ví dụ: Bé Minh)"
            required
            type="text"
            value={childName}
          />
          <button
            className="h-9 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
            disabled={addLoading}
            type="submit"
          >
            {addLoading ? "Đang thêm..." : "Thêm"}
          </button>
        </form>
        {addStatus && <p className="mt-2 text-sm text-teal-700">{addStatus}</p>}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải...</p>
      ) : children.length === 0 ? (
        <p className="text-sm text-slate-500">
          Chưa có hồ sơ học sinh nào. Hãy thêm hồ sơ đầu tiên!
        </p>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold">
            Hồ sơ học sinh ({children.length})
          </h3>
          <ul className="divide-y divide-slate-100">
            {children.map((child) => (
              <li
                className="flex items-center justify-between gap-3 py-3"
                key={child.id}
              >
                <div>
                  <p className="text-sm font-medium">{child.displayName}</p>
                  {child.subscription && (
                    <p className="text-xs text-slate-500">
                      Gói: {formatStatusCodeVi(child.subscription.status)} · Hết
                      hạn{" "}
                      {new Date(
                        child.subscription.currentPeriodEnd,
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
                {confirmDeleteId === child.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Xác nhận xóa?
                    </span>
                    <button
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      disabled={deletingId === child.id}
                      onClick={() => void handleDeleteChild(child.id)}
                      type="button"
                    >
                      {deletingId === child.id ? "Đang xóa..." : "Xác nhận"}
                    </button>
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      onClick={() => setConfirmDeleteId(null)}
                      type="button"
                    >
                      Không
                    </button>
                  </div>
                ) : (
                  <button
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    disabled={deletingId === child.id}
                    onClick={() => setConfirmDeleteId(child.id)}
                    type="button"
                  >
                    Xóa hồ sơ
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ParentProfilePanel — update display name, change password
// ---------------------------------------------------------------------------
function ParentProfilePanel({
  onLogout,
  session,
}: {
  onLogout: () => void;
  session: Session;
}) {
  const [displayName, setDisplayName] = useState(
    session.user.displayName ?? "",
  );
  const [profileStatus, setProfileStatus] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    }),
    [session.accessToken],
  );

  async function handleProfileSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus("");
    try {
      const res = await fetch(`${apiBaseUrl}/v1/me/profile`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ displayName }),
      });
      if (!res.ok)
        throw new Error(await readApiError(res, "Không thể cập nhật hồ sơ."));
      setProfileStatus("Đã lưu thay đổi.");
    } catch (err) {
      setProfileStatus(err instanceof Error ? err.message : "Lỗi lưu hồ sơ.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus("Mật khẩu mới không khớp.");
      return;
    }
    setPwLoading(true);
    setPwStatus("");
    try {
      const res = await fetch(`${apiBaseUrl}/v1/me/change-password`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok)
        throw new Error(await readApiError(res, "Không thể đổi mật khẩu."));
      setPwStatus("Đổi mật khẩu thành công! Đang đăng xuất...");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        onLogout();
      }, 1500);
    } catch (err) {
      setPwStatus(err instanceof Error ? err.message : "Lỗi đổi mật khẩu.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold">Thông tin cá nhân</h3>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => void handleProfileSave(e)}
        >
          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              Tên hiển thị
            </span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(e) => setDisplayName(e.target.value)}
              type="text"
              value={displayName}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-700">Email</span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
              disabled
              type="email"
              value={session.user.email}
            />
          </label>
          <button
            className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
            disabled={profileLoading}
            type="submit"
          >
            {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          {profileStatus && (
            <p className="text-sm text-teal-700">{profileStatus}</p>
          )}
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold">Đổi mật khẩu</h3>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => void handleChangePassword(e)}
        >
          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              Mật khẩu hiện tại
            </span>
            <input
              autoComplete="current-password"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              Mật khẩu mới
            </span>
            <input
              autoComplete="new-password"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(e) => setNewPassword(e.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              Xác nhận mật khẩu mới
            </span>
            <input
              autoComplete="new-password"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>
          <button
            className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
            disabled={pwLoading}
            type="submit"
          >
            {pwLoading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
          {pwStatus && (
            <p
              className={`text-sm ${pwStatus.includes("thành công") ? "text-teal-700" : "text-red-600"}`}
            >
              {pwStatus}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
