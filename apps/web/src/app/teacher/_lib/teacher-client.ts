const apiMessageVi: Record<string, string> = {
  "Invalid or expired token": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  Unauthorized: "Bạn cần đăng nhập để tiếp tục.",
  "Access denied": "Bạn không có quyền thực hiện thao tác này.",
  Forbidden: "Bạn không có quyền truy cập nội dung này.",
  "Not Found": "Không tìm thấy dữ liệu được yêu cầu.",
  "Internal server error": "Máy chủ gặp lỗi. Vui lòng thử lại sau.",
};

export function localizeTeacherMessage(message: string) {
  return apiMessageVi[message] ?? message;
}
