import type { ActivationOrderStatus } from "../types";

export const activationStatusLabels: Record<ActivationOrderStatus, string> = {
  WAITING_PAYMENT: "Chờ thanh toán",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  CANCELED: "Đã hủy",
  REVOKED: "Đã thu hồi",
};

export function activationStatusClass(status: ActivationOrderStatus) {
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
