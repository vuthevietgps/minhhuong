"use client";

import { formatDate } from "../../lib/format";
import type { ActivationOrder, ActivationOrderStatus, ActivationPackage, Role } from "../../types";

export type FreeTrialRecord = {
  id: string;
  childProfileId: string;
  childName: string;
  parent: { email: string; displayName: string | null };
  status: "TRIALING" | "EXPIRED";
  startsAt: string;
  endsAt: string;
  maximumEnd: string;
  canExtend: boolean;
  report: { available: boolean; availableAt: string | null };
  usage: { initialAssessments: number; lessons: number; aiResponses: number };
  limits: { initialAssessments: number; lessons: number; aiResponses: number };
};

export const fallbackActivationPackages: ActivationPackage[] = [
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

export type ActivationOrderTab = "ACTION" | "ALL" | ActivationOrderStatus;

export function saleOrderNeedsAction(order: ActivationOrder) {
  return order.status === "WAITING_PAYMENT" || order.status === "REJECTED";
}

export function saleOrderNextStep(order: ActivationOrder, role: Role) {
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

export function orderSearchText(order: ActivationOrder) {
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
