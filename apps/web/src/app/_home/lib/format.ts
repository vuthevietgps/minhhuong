import type { Role } from "../types";

export function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatStudyMinutes(minutes: number) {
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

export function formatVideoDuration(durationSec?: number | null) {
  if (!durationSec || durationSec <= 0) return null;

  const totalSeconds = Math.floor(durationSec);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export const roleLabels: Record<Role, string> = {
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

export function formatStatusCodeVi(value: string) {
  return statusCodeLabelsVi[value] ?? value.replaceAll("_", " ");
}

export function formatRoleCodeVi(value: string) {
  return roleLabels[value as Role] ?? value.replaceAll("_", " ");
}
