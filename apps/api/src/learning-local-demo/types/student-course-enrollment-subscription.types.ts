import type {
  DemoLearningCommissionStatus,
  DemoLearningCurrency,
  DemoLearningEnrollmentStatus,
  DemoLearningPaymentStatus,
  DemoLearningRefundStatus,
  DemoLearningSubscriptionStatus,
} from './shared-statuses.types';
import type { DemoLearningEnrollment } from './shared.types';

export type DemoLearningStatusCounts = {
  enrollment: Record<DemoLearningEnrollmentStatus, number>;
  subscription: Record<DemoLearningSubscriptionStatus, number>;
  payment: Record<DemoLearningPaymentStatus, number>;
  refund: Record<DemoLearningRefundStatus, number>;
  commission: Record<DemoLearningCommissionStatus, number>;
};

export type DemoLearningReportTotals = {
  studentCount: number;
  courseCount: number;
  enrollmentCount: number;
  activeEnrollmentCount: number;
  pendingEnrollmentCount: number;
  canceledEnrollmentCount: number;
  subscriptionCount: number;
  activeSubscriptionCount: number;
  trialingSubscriptionCount: number;
  canceledSubscriptionCount: number;
  paymentCount: number;
  pendingPaymentCount: number;
  succeededPaymentCount: number;
  refundedPaymentCount: number;
  refundCount: number;
  succeededRefundCount: number;
  commissionCount: number;
  pendingCommissionCount: number;
  payableCommissionCount: number;
  approvedCommissionCount: number;
  canceledCommissionCount: number;
  grossPaidCents: number;
  pendingPaymentCents: number;
  refundedCents: number;
  netRevenueCents: number;
  commissionPendingCents: number;
  commissionPayableCents: number;
  commissionApprovedCents: number;
  commissionCanceledCents: number;
  commissionEarnedCents: number;
};

export type DemoLearningEnrollmentReportRow = {
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  levelCode: string;
  packageCode: string;
  packageName: string;
  enrollmentStatus: DemoLearningEnrollmentStatus;
  enrollmentSource: DemoLearningEnrollment['source'];
  subscriptionId: string;
  subscriptionStatus: DemoLearningSubscriptionStatus;
  planCode: string;
  paymentId: string;
  paymentStatus: DemoLearningPaymentStatus;
  refundIds: string[];
  refundStatus: DemoLearningRefundStatus | 'NONE';
  commissionIds: string[];
  grossPaidCents: number;
  pendingPaymentCents: number;
  refundedCents: number;
  netRevenueCents: number;
  commissionPendingCents: number;
  commissionPayableCents: number;
  commissionApprovedCents: number;
  commissionCanceledCents: number;
};

export type DemoLearningCourseAggregateRow = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  enrollmentCount: number;
  activeEnrollmentCount: number;
  pendingEnrollmentCount: number;
  canceledEnrollmentCount: number;
  grossPaidCents: number;
  refundedCents: number;
  netRevenueCents: number;
  commissionEarnedCents: number;
};

export type DemoLearningCoreReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    providerApiUsed: false;
    paymentProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningReportTotals;
  statusCounts: DemoLearningStatusCounts;
  courseAggregates: DemoLearningCourseAggregateRow[];
  rows: DemoLearningEnrollmentReportRow[];
};
