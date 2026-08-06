"use client";

import {
  BarChart3,
  BookOpen,
  Box,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  adminChannelRoles,
  adminFinanceRoles,
  adminOrdersRoles,
  adminOverviewRoles,
  adminPackagesRoles,
  adminPerformanceRoles,
  hasAllowedRole,
  useStoredAdminSession,
} from "./_lib/admin-session";

const adminContentRoles = ["ADMIN", "CONTENT_EDITOR"] as const;
const adminUsersRoles = ["ADMIN", "OPERATIONS", "DIRECTOR", "SUPPORT"] as const;
const adminAuditRoles = ["ADMIN", "DIRECTOR", "OPERATIONS"] as const;

const navItems = [
  {
    href: "/admin",
    label: "Tổng quan",
    icon: LayoutDashboard,
    exact: true,
    roles: adminOverviewRoles,
  },
  {
    href: "/admin/orders",
    label: "Danh sách đơn hàng",
    icon: Box,
    roles: adminOrdersRoles,
  },
  {
    href: "/admin/content",
    label: "Nội dung",
    icon: BookOpen,
    roles: adminContentRoles,
  },
  {
    href: "/admin/users",
    label: "Người dùng",
    icon: UserCog,
    roles: adminUsersRoles,
  },
  {
    href: "/admin/channel",
    label: "Vận hành kênh",
    icon: Users,
    roles: adminChannelRoles,
  },
  {
    href: "/admin/finance",
    label: "Tài chính",
    icon: WalletCards,
    roles: adminFinanceRoles,
  },
  {
    href: "/admin/ads-attribution",
    label: "Demo phân bổ quảng cáo",
    icon: BarChart3,
    roles: adminFinanceRoles,
  },
  {
    href: "/admin/learning-local-demo",
    label: "Demo học tập",
    icon: GraduationCap,
    roles: adminOverviewRoles,
  },
  {
    href: "/admin/audit",
    label: "Nhật ký kiểm toán",
    icon: ClipboardList,
    roles: adminAuditRoles,
  },
  {
    href: "/admin/performance",
    label: "Hiệu suất của tôi",
    icon: CircleDollarSign,
    roles: adminPerformanceRoles,
  },
  {
    href: "/admin/packages",
    label: "Gói và bảng giá",
    icon: Package,
    roles: adminPackagesRoles,
  },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { loaded, roles, session } = useStoredAdminSession();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const visibleNavItems = navItems.filter((item) =>
    hasAllowedRole(roles, item.roles),
  );

  return (
    <div className="kid-app-shell min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="kid-sidebar flex w-full flex-col border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-b-0">
        {/* Logo */}
        <div className="border-b border-slate-200 px-4 py-4 lg:px-5 lg:py-5">
          <div className="flex items-center gap-3">
            <div className="kid-logo-mark grid size-11 place-items-center bg-slate-950 text-white">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900">
                Minh Hương
              </p>
              <p className="text-xs font-semibold text-violet-500">
                Cổng quản trị
              </p>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-x-auto px-3 py-3 lg:space-y-6 lg:overflow-y-auto lg:px-4 lg:py-5">
          <div>
            <p className="mb-2 hidden px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 lg:block">
              Hệ thống
            </p>
            {!loaded && (
              <div className="px-3 py-2 text-sm text-slate-400">
                Đang kiểm tra quyền truy cập...
              </div>
            )}
            <div className="flex gap-2 lg:block lg:space-y-2">
              {visibleNavItems.map(({ href, label, icon: Icon, ...rest }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold ${
                    isActive(
                      href,
                      "exact" in rest
                        ? (rest as { exact?: boolean }).exact
                        : undefined,
                    )
                      ? "kid-nav-active"
                      : "kid-nav-link text-slate-600"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="mb-2 px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Truy cập nhanh
            </p>
            <Link
              href="/"
              className="kid-nav-link flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-600"
            >
              <ShieldCheck size={16} />
              Toàn bộ bảng điều khiển
              <ChevronRight size={14} className="ml-auto text-slate-400" />
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="hidden border-t border-slate-200 px-4 py-4 lg:block">
          <div className="mb-3 rounded-2xl border border-violet-100 bg-violet-50 px-3.5 py-3 text-xs font-medium leading-5 text-slate-500">
            {session
              ? `Đã đăng nhập với tên ${session.user.displayName ?? session.user.email}`
              : "Không gian quản trị dành cho vận hành, tài chính và quản lý kênh."}
          </div>
          <Link
            href="/"
            className="kid-nav-link flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500"
          >
            <LogOut size={16} />
            Quay lại ứng dụng
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
