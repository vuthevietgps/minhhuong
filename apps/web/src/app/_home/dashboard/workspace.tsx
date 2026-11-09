"use client";

import {
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  LineChart,
  LockKeyhole,
  Play,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { roleLabels } from "../lib/format";
import type { DashboardPayload, Role } from "../types";
import { roleWorkspaceCards } from "./roles";

export function RoleWorkspaceHub({ role }: { role: Role }) {
  const cards = (roleWorkspaceCards[role] ?? []).filter((card) => card.href.startsWith("/"));
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
          Dashboard chỉ giữ thông tin cần quyết định; biểu mẫu chi tiết nằm
          trong workspace chuyên trách.
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

export function AccessPanel({ dashboard }: { dashboard: DashboardPayload }) {
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
          ["Trạng thái", dashboard.user.status === "ACTIVE" ? "Đang hoạt động" : dashboard.user.status ?? "Chưa rõ"],
          [
            dashboard.role === "STUDENT" || dashboard.role === "PARENT"
              ? "Quyền học tập"
              : "Phạm vi truy cập",
            dashboard.role === "PARENT"
              ? "Góc nhìn gia đình"
              : "Theo vai trò được cấp",
          ],
          ["Email", dashboard.user.email],
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
