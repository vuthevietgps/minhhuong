import {
  ArrowUp,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Crown,
  FileVideo,
  Gamepad2,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Search,
  Settings,
  ShieldCheck,
  UploadCloud,
  Users,
  Video,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ParentTab, Role } from "../types";

export const navByRole: Record<Role, [string, LucideIcon][]> = {
  STUDENT: [
    ["Tổng quan", LayoutDashboard],
    ["Bài học", Video],
    ["Luyện tập", Gamepad2],
    ["Bạn học", Bot],
    ["Gói học", Crown],
  ],
  PARENT: [
    ["Tổng quan", Users],
    ["Cùng con học", Video],
    ["Kết quả", BarChart3],
    ["Gói học", WalletCards],
    ["Các con", GraduationCap],
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

export const dashboardRouteByRole: Partial<Record<Role, Record<string, string>>> = {
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
    "Tăng trưởng": "/admin/finance",
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

export const dashboardTargetByRole: Partial<Record<Role, Record<string, string>>> = {
  STUDENT: {
    "Tổng quan": "dashboard-overview",
    "Bài học": "student-video-panel",
    "Luyện tập": "student-practice-panel",
    "Bạn học": "dashboard-ai-panel",
    "Gói học": "dashboard-access-panel",
  },
  TEACHER: {
    "Tổng quan": "dashboard-overview",
    "Việc ưu tiên": "dashboard-workspace-hub",
    "Quy trình": "dashboard-workspace-hub",
    "Tài khoản": "dashboard-access-panel",
  },
  SUPPORT: {
    "Tổng quan": "dashboard-overview",
    "Công việc": "dashboard-workspace-hub",
    "Việc ưu tiên": "dashboard-workspace-hub",
    "Quy trình": "dashboard-workspace-hub",
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

export const roleHomeCopy: Record<Role, string> = {
  STUDENT: "Hoàn thành kế hoạch hôm nay theo từng bước ngắn và rõ ràng.",
  PARENT: "Nắm tiến độ của con, giới hạn học tập và việc gia đình cần xử lý.",
  TEACHER: "Ưu tiên đúng học sinh, bài cần chấm và phản hồi cần gửi hôm nay.",
  CONTENT_EDITOR:
    "Đưa nội dung từ bản nháp đến xuất bản bằng một quy trình nhất quán.",
  ADMIN: "Theo dõi sức khỏe vận hành và chuyển nhanh đến đúng khu vực xử lý.",
  DIRECTOR: "Tập trung vào tăng trưởng, hiệu quả và rủi ro cần quyết định.",
  SUPPORT: "Xử lý yêu cầu theo mức độ ảnh hưởng và giữ phản hồi đúng cam kết.",
  SALE: "Theo sát đơn hàng, khách hàng và khoản cần phê duyệt trong ngày.",
  AGENCY_OWNER:
    "Nắm hiệu suất đại lý, đội ngũ bán hàng và dòng tiền cần chú ý.",
  AGENCY_MANAGER:
    "Điều phối đội ngũ, đơn hàng và tiến độ chi trả theo phạm vi được giao.",
  OPERATIONS: "Duyệt đúng hồ sơ, đối soát đúng chứng từ và kích hoạt đúng hạn.",
};

export const roleWorkspaceCards: Partial<Record<Role, RoleWorkspaceCard[]>> = {
  TEACHER: [
    {
      label: "Nội dung giảng dạy",
      description:
        "Quản lý bài học, học liệu và nội dung cần sử dụng trên lớp.",
      href: "/teacher/content",
      icon: FileVideo,
      meta: "Workspace giáo viên",
    },
    {
      label: "Học sinh cần hỗ trợ",
      description:
        "Mở danh sách ưu tiên và xử lý các trường hợp có nguy cơ chậm tiến độ.",
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
      description:
        "Tạo bài học, quản lý video và chỉnh sửa bản nháp tại một nơi.",
      href: "/admin/content",
      icon: FileVideo,
      meta: "Soạn thảo",
    },
    {
      label: "Ngân hàng câu hỏi",
      description:
        "Chuẩn hóa câu hỏi, đáp án và thẻ tìm kiếm trước khi gửi duyệt.",
      href: "/admin/content",
      icon: ClipboardList,
      meta: "Ngân hàng nội dung",
    },
    {
      label: "Hàng đợi xuất bản",
      description:
        "Rà soát các nội dung đang chờ duyệt và hoàn tất bước xuất bản.",
      href: "/admin/content",
      icon: CheckCircle2,
      meta: "Nội dung cần rà soát",
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
      description:
        "Duyệt hồ sơ, kiểm tra chứng từ và theo dõi trạng thái kích hoạt.",
      href: "/admin/orders",
      icon: ClipboardCheck,
      meta: "Hàng đợi vận hành",
    },
    {
      label: "Người dùng và quyền",
      description: "Quản lý tài khoản, vai trò và các trường hợp cần hỗ trợ.",
      href: "/admin/users",
      icon: Users,
      meta: "Quản lý tài khoản",
    },
  ],
  DIRECTOR: [
    {
      label: "Bức tranh điều hành",
      description:
        "Theo dõi các chỉ số cấp điều hành và điểm lệch cần quyết định.",
      href: "/admin",
      icon: LineChart,
      meta: "Cập nhật hôm nay",
    },
    {
      label: "Doanh thu và dòng tiền",
      description:
        "Phân tích doanh thu đã duyệt, hoa hồng và nghĩa vụ chi trả.",
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
      description:
        "Tạo đơn, bổ sung chứng từ và theo dõi trạng thái phê duyệt.",
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
      description:
        "Quản lý đại lý, thành viên và chính sách trong đúng phạm vi.",
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
      description:
        "Theo dõi thành viên và phạm vi được phân công trong đại lý.",
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
      meta: "Hàng đợi đơn hàng",
    },
    {
      label: "Đối soát tài chính",
      description: "Theo dõi doanh thu, hóa đơn không khớp và khoản chi trả.",
      href: "/admin/finance",
      icon: WalletCards,
      meta: "Đối soát tài chính",
    },
    {
      label: "Tài khoản và quyền học",
      description:
        "Kích hoạt, tạm khóa và hỗ trợ tài khoản theo đúng quy trình.",
      href: "/admin/users",
      icon: ShieldCheck,
      meta: "Quản lý tài khoản",
    },
  ],
};

export const parentTabByNavLabel: Record<string, ParentTab> = {
  "Tổng quan": "children",
  "Cùng con học": "learning",
  "Kết quả": "reports",
  "Gói học": "billing",
  "Các con": "family",
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
  "Device limit": "Giới hạn thời gian học",
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

export function dashboardTextVi(value: string) {
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
    [
      /^(\d+(?:\.\d+)?)M VND$/,
      (match) => `${match[1].replace(".", ",")} triệu ₫`,
    ],
    [/^([\d.,]+) VND$/, (match) => `${match[1]} ₫`],
  ];

  for (const [pattern, format] of patterns) {
    const match = value.match(pattern);
    if (match) return format(match);
  }

  return value;
}
