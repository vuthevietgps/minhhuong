"use client";



export type ActivationOrderStatus =
  | "WAITING_PAYMENT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | "REVOKED";

export type ActivationOrder = {
  id: string;
  customerEmail: string;
  customerPhone?: string;
  packageName?: string;
  requestedDurationDays?: number;
  amountCents: number;
  currency: string;
  status: ActivationOrderStatus;
  source: "SALE_ASSISTED" | "SELF_SERVICE";
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  notes?: string;
  reviewNotes?: string;
  revokeReason?: string;
  saleInvoiceUrl?: string;
  operationInvoiceUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  transferContent?: string;
  user: {
    email: string;
    status: string;
    profile?: {
      displayName?: string;
    };
  };
  reviewedBy?: {
    email: string;
  };
  createdBy?: {
    email: string;
  };
  agency?: {
    code: string;
    name: string;
  };
};

export type OrderPage = {
  items: ActivationOrder[];
  nextCursor?: string | null;
  hasMore: boolean;
};

export type ActivationPackage = {
  code: string;
  name: string;
  amountVnd: number;
  durationDays: number;
  description?: string;
};

export type SelfServiceOptions = {
  packages: ActivationPackage[];
};

export type CreateOrderResponse = {
  order: ActivationOrder;
  generatedPassword: string | null;
  isNewAccount: boolean;
};

export const fallbackActivationPackages: ActivationPackage[] = [
  {
    code: "one-month",
    name: "Quyền truy cập 1 tháng",
    amountVnd: 300000,
    durationDays: 30,
  },
  {
    code: "three-months",
    name: "Quyền truy cập 3 tháng",
    amountVnd: 800000,
    durationDays: 90,
  },
  {
    code: "one-year",
    name: "Quyền truy cập 1 năm",
    amountVnd: 2400000,
    durationDays: 365,
  },
];

export const statusTabs: Array<{
  label: string;
  value: "ALL" | ActivationOrderStatus;
}> = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xét duyệt", value: "PENDING_REVIEW" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Đã từ chối", value: "REJECTED" },
  { label: "Đã hủy", value: "CANCELED" },
  { label: "Đã thu hồi", value: "REVOKED" },
];

export function statusClass(status: ActivationOrderStatus) {
  return {
    WAITING_PAYMENT: "bg-amber-50 text-amber-700",
    PENDING_REVIEW: "bg-sky-50 text-sky-700",
    APPROVED: "bg-teal-50 text-teal-700",
    REJECTED: "bg-rose-50 text-rose-700",
    CANCELED: "bg-slate-100 text-slate-700",
    REVOKED: "bg-purple-50 text-purple-700",
  }[status];
}
