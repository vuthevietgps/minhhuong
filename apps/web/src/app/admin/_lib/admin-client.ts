import { getStoredAccessToken } from "../../session-storage";

export const publicApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const adminApiBase = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/v1`;

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

export async function readApiError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return payload.message.map(localizeApiError).join(" ");
    }

    return localizeApiError(payload.message ?? fallback);
  } catch {
    return fallback;
  }
}

export async function adminFetch(path: string, options?: RequestInit) {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error(
      "Phiên đã hết hạn. Hãy đăng nhập lại từ trang tổng quan chính.",
    );
  }

  return fetch(`${adminApiBase}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
}

export async function adminJson<T>(
  path: string,
  options?: RequestInit,
  fallback = "Yêu cầu thất bại.",
) {
  const response = await adminFetch(path, options);
  if (!response.ok) {
    throw new Error(await readApiError(response, fallback));
  }

  return (await response.json()) as T;
}

export async function downloadAuthedFile(
  path: string,
  filename: string,
  fallback = "Không thể tải tệp xuống.",
) {
  const response = await adminFetch(path);
  if (!response.ok) {
    throw new Error(await readApiError(response, fallback));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function openAuthedAsset(
  path: string,
  fallback = "Không thể mở tệp được bảo vệ.",
) {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error(
      "Phiên đã hết hạn. Hãy đăng nhập lại từ trang tổng quan chính.",
    );
  }
  const url = new URL(path, publicApiBaseUrl);
  if (url.origin !== new URL(publicApiBaseUrl).origin) {
    throw new Error("Đường dẫn tệp được bảo vệ nằm ngoài API đã cấu hình.");
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, fallback));
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export function formatMoney(amountCents: number, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export function formatDate(value?: string | Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

const statusLabelsVi: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  READY: "Sẵn sàng",
  BLOCKED: "Bị chặn",
  SUSPENDED: "Tạm khóa",
  DELETED: "Đã xóa",
  WAITING_PAYMENT: "Chờ thanh toán",
  PENDING: "Đang chờ",
  PENDING_REVIEW: "Chờ xét duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  CANCELLED: "Đã hủy",
  REVOKED: "Đã thu hồi",
  EXPIRED: "Đã hết hạn",
  PAID: "Đã thanh toán",
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Đã hoàn tất",
  FAILED: "Thất bại",
  OPEN: "Đang mở",
  RESOLVED: "Đã giải quyết",
  HELD: "Tạm giữ",
  REFUNDED: "Đã hoàn tiền",
  AVAILABLE: "Khả dụng",
  PAID_OUT: "Đã chi trả",
  REVERSED: "Đã hoàn nguyên",
  SALE: "Kinh doanh",
  AGENCY: "Đại lý",
  DIRECT: "Trực tiếp",
  CUSTOMER: "Khách hàng",
  ADMIN: "Quản trị viên",
  MANUAL: "Thủ công",
  REFERRAL: "Giới thiệu",
  WEB: "Trang web",
};

const roleLabelsVi: Record<string, string> = {
  STUDENT: "Học viên",
  PARENT: "Phụ huynh",
  TEACHER: "Giáo viên",
  SALE: "Nhân viên kinh doanh",
  AGENCY: "Đại lý",
  AGENCY_OWNER: "Chủ đại lý",
  AGENCY_MANAGER: "Quản lý đại lý",
  MANAGER: "Quản lý",
  OWNER: "Chủ sở hữu",
  ADMIN: "Quản trị viên",
  OPERATIONS: "Vận hành",
  DIRECTOR: "Giám đốc",
  CONTENT_EDITOR: "Biên tập nội dung",
  SUPPORT: "Hỗ trợ",
};

function humanizeCode(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toLocaleUpperCase("vi-VN"));
}

export function formatStatusVi(value?: string | null) {
  if (!value) return "-";
  return statusLabelsVi[value] ?? humanizeCode(value);
}

export function formatRoleVi(value?: string | null) {
  if (!value) return "-";
  return roleLabelsVi[value] ?? humanizeCode(value);
}

export function toInputDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function defaultReportPeriod() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
  return {
    from: toInputDate(from),
    to: toInputDate(to),
  };
}
