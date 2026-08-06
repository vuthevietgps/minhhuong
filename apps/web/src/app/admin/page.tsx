"use client";

import {
  ArrowRight,
  ClipboardList,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminJson,
  defaultReportPeriod,
  formatDate,
  formatMoney,
  formatStatusVi,
} from "./_lib/admin-client";
import {
  adminChannelRoles,
  adminFinanceRoles,
  adminLandingForRoles,
  adminOrdersRoles,
  adminOverviewRoles,
  adminPackagesRoles,
  adminPerformanceRoles,
  hasAllowedRole,
  useStoredAdminSession,
} from "./_lib/admin-session";

type ChannelAdminSummary = {
  agencies: number;
  activeAgencies: number;
  saleUsers: number;
  activeMembers: number;
  policies: number;
  learners: number;
};

type ChannelFinanceOverview = {
  orders: number;
  approvedRevenueCents: number;
  approvedOrderCount: number;
  pendingPayoutCents: number;
  pendingPayoutCount: number;
  paidPayoutCents: number;
  paidPayoutCount: number;
};

type ChannelReport = {
  topSales: Array<{
    email: string;
    displayName?: string;
    orderCount: number;
    revenueCents: number;
    commissionCents: number;
  }>;
};

type ActivationOrder = {
  id: string;
  customerEmail: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: string;
  packageName?: string;
};

const quickLinks = [
  {
    href: "/admin/orders",
    title: "Danh sách đơn hàng",
    description:
      "Xét duyệt các yêu cầu đang chờ, tài khoản đã thu hồi và quy trình bàn giao khách hàng.",
    icon: ClipboardList,
    roles: adminOrdersRoles,
  },
  {
    href: "/admin/channel",
    title: "Vận hành kênh",
    description:
      "Quản lý đại lý, tài khoản kinh doanh và trạng thái vận hành của người dùng.",
    icon: Users,
    roles: adminChannelRoles,
  },
  {
    href: "/admin/finance",
    title: "Tài chính",
    description:
      "Kiểm tra doanh thu, hoa hồng và xuất dữ liệu đối soát theo đơn hàng.",
    icon: WalletCards,
    roles: adminFinanceRoles,
  },
  {
    href: "/admin/performance",
    title: "Hiệu suất của tôi",
    description:
      "Theo dõi doanh thu đã duyệt, hoa hồng và hoạt động chi trả của tài khoản kênh của bạn.",
    icon: ShieldCheck,
    roles: adminPerformanceRoles,
  },
  {
    href: "/admin/packages",
    title: "Gói và bảng giá",
    description:
      "Điều chỉnh giá tự phục vụ mà không cần sửa mã nguồn hoặc dữ liệu mẫu.",
    icon: Package,
    roles: adminPackagesRoles,
  },
] as const;

export default function AdminPage() {
  const router = useRouter();
  const { loaded, roles } = useStoredAdminSession();
  const [summary, setSummary] = useState<ChannelAdminSummary | null>(null);
  const [finance, setFinance] = useState<ChannelFinanceOverview | null>(null);
  const [report, setReport] = useState<ChannelReport | null>(null);
  const [pendingOrders, setPendingOrders] = useState<ActivationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Đang tải không gian quản trị...");

  const canViewOverview = hasAllowedRole(roles, adminOverviewRoles);
  const canViewPerformance = hasAllowedRole(roles, adminPerformanceRoles);
  const isAgencyWorkspace =
    roles.includes("AGENCY_OWNER") || roles.includes("AGENCY_MANAGER");
  const agencyWorkspaceLabel = roles.includes("AGENCY_OWNER")
    ? "Không gian chủ đại lý"
    : roles.includes("AGENCY_MANAGER")
      ? "Không gian quản lý đại lý"
      : "Không gian quản trị";

  useEffect(() => {
    if (!loaded) {
      return;
    }

    if (!canViewOverview && canViewPerformance) {
      router.replace(adminLandingForRoles(roles));
    }
  }, [canViewOverview, canViewPerformance, loaded, roles, router]);

  useEffect(() => {
    if (!loaded || !canViewOverview) {
      return;
    }

    const period = defaultReportPeriod();

    void (async () => {
      setIsLoading(true);
      setMessage("Đang tải không gian quản trị...");

      const [summaryResult, financeResult, reportResult, ordersResult] =
        await Promise.allSettled([
          adminJson<ChannelAdminSummary>(
            "/channel-admin/summary",
            undefined,
            "Không thể tải tổng quan kênh.",
          ),
          adminJson<ChannelFinanceOverview>(
            "/channel-finance/overview",
            undefined,
            "Không thể tải tổng quan tài chính.",
          ),
          adminJson<ChannelReport>(
            `/channel-finance/report?from=${period.from}&to=${period.to}`,
            undefined,
            "Không thể tải báo cáo kênh.",
          ),
          adminJson<{ items: ActivationOrder[] }>(
            "/activation-orders?status=PENDING_REVIEW&limit=6",
            undefined,
            "Không thể tải các đơn đang chờ.",
          ),
        ]);

      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value);
      }
      if (financeResult.status === "fulfilled") {
        setFinance(financeResult.value);
      }
      if (reportResult.status === "fulfilled") {
        setReport(reportResult.value);
      }
      if (ordersResult.status === "fulfilled") {
        setPendingOrders(ordersResult.value.items ?? []);
      }

      const hasData =
        summaryResult.status === "fulfilled" ||
        financeResult.status === "fulfilled" ||
        reportResult.status === "fulfilled" ||
        ordersResult.status === "fulfilled";

      setMessage(
        hasData
          ? "Không gian quản trị đã sẵn sàng. Một số thẻ có thể bị ẩn nếu vai trò của bạn không có quyền."
          : "Không thể tải dữ liệu quản trị. Hãy đăng nhập lại hoặc kiểm tra quyền của vai trò.",
      );
      setIsLoading(false);
    })();
  }, [canViewOverview, loaded]);

  if (!loaded) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Đang kiểm tra quyền quản trị...
        </div>
      </div>
    );
  }

  if (!canViewOverview && canViewPerformance) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Đang chuyển đến không gian hiệu suất cá nhân...
        </div>
      </div>
    );
  }

  if (!canViewOverview) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-amber-950">
            Vai trò này không được truy cập tổng quan quản trị.
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            Hãy dùng bảng tổng quan chính hoặc cổng phù hợp với phạm vi quyền
            của bạn.
          </p>
        </div>
      </div>
    );
  }

  const visibleQuickLinks = quickLinks
    .filter((item) => hasAllowedRole(roles, item.roles))
    .map((item) => {
      if (!isAgencyWorkspace) {
        return item;
      }

      const descriptionOverrides: Record<string, string> = {
        "/admin/orders":
          "Tạo đơn học viên, theo dõi phê duyệt và xử lý đơn bị từ chối trong phạm vi đại lý.",
        "/admin/channel":
          "Quản lý tài khoản kinh doanh, mã giới thiệu và quyền thành viên của đại lý.",
        "/admin/finance":
          "Xem doanh thu đã duyệt, hoa hồng khả dụng và lịch sử chi trả của đại lý.",
        "/admin/performance":
          "Theo dõi hiệu suất đội ngũ, doanh thu đã duyệt và tiến độ chi trả mà không cần mở toàn bộ sổ tài chính.",
      };

      return {
        ...item,
        description: descriptionOverrides[item.href] ?? item.description,
      };
    });

  const heroTitle = isAgencyWorkspace
    ? "Đơn hàng, đội ngũ kinh doanh và dòng hoa hồng trong phạm vi đại lý"
    : "Vận hành, tài chính và quản lý kênh tại một nơi";
  const heroDescription = isAgencyWorkspace
    ? "Tạo đơn học viên, quản lý nhân viên, xem doanh thu đã duyệt và yêu cầu chi trả trong cùng một cổng. Dữ liệu đã được giới hạn theo đại lý của tài khoản."
    : message;
  const primaryCtaLabel = isAgencyWorkspace
    ? "Tạo đơn học viên"
    : "Mở danh sách";
  const pendingSectionTitle = isAgencyWorkspace
    ? "Đơn đại lý đang chờ"
    : "Đơn đang chờ duyệt";
  const pendingSectionDescription = isAgencyWorkspace
    ? "Các đơn học viên mới nhất trong phạm vi của bạn vẫn cần vận hành duyệt."
    : "Các phê duyệt mới nhất đang chờ vận hành.";
  const topSalesTitle = isAgencyWorkspace
    ? "Nhân viên nổi bật trong phạm vi"
    : "Nhân viên nổi bật kỳ này";
  const topSalesDescription = isAgencyWorkspace
    ? "Những nhân viên tạo nhiều doanh thu được duyệt nhất trong đại lý ở kỳ báo cáo hiện tại."
    : "Những người tạo nhiều doanh thu được duyệt nhất trong kỳ báo cáo hiện tại.";

  const metricCards = [
    {
      label: "Doanh thu đã duyệt",
      value: finance ? formatMoney(finance.approvedRevenueCents, "VND") : "-",
      note: finance
        ? `${finance.approvedOrderCount} đơn đã duyệt`
        : "Cần quyền tài chính",
    },
    {
      label: "Đại lý",
      value: summary ? String(summary.agencies) : "-",
      note: summary
        ? `${summary.activeAgencies} đại lý đang hoạt động`
        : "Cần quyền quản lý kênh",
    },
    {
      label: "Khoản chi đang chờ",
      value: finance ? formatMoney(finance.pendingPayoutCents, "VND") : "-",
      note: finance
        ? `${finance.pendingPayoutCount} yêu cầu`
        : "Cần quyền tài chính",
    },
    {
      label: "Chờ xét duyệt",
      value: String(pendingOrders.length),
      note:
        pendingOrders.length > 0
          ? "Đơn đang chờ vận hành"
          : "Danh sách đã xử lý hết",
    },
  ];

  return (
    <div className="kid-page px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="kid-hero p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative z-10">
            <div className="kid-eyebrow">
              <Sparkles size={14} />
              {agencyWorkspaceLabel}
            </div>
            <h1 className="mt-3 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {heroTitle}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {heroDescription}
            </p>
            {isAgencyWorkspace && (
              <p className="mt-2 text-xs text-slate-400">{message}</p>
            )}
          </div>
          <Link
            className="kid-primary-button relative z-10 inline-flex h-11 items-center gap-2 whitespace-nowrap px-5 text-sm"
            href="/admin/orders"
          >
            {primaryCtaLabel}
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((item) => (
            <section className="kid-stat-card p-5" key={item.label}>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{item.note}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Không gian truy cập nhanh
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Các khu vực quản trị chuyên biệt cho từng nghiệp vụ vận hành.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {visibleQuickLinks.map(
              ({ href, title, description, icon: Icon }) => (
                <Link
                  className="group rounded-3xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:bg-violet-50/50 hover:shadow-lg"
                  href={href}
                  key={href}
                >
                  <div className="flex items-center justify-between">
                    <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-200">
                      <Icon size={18} />
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 transition group-hover:text-slate-500"
                    />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-950">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </Link>
              ),
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {pendingSectionTitle}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {pendingSectionDescription}
              </p>
            </div>
            <Link
              className="text-sm font-medium text-teal-700"
              href="/admin/orders"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {isLoading && pendingOrders.length === 0 && (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Đang tải danh sách đơn hàng...
              </div>
            )}
            {!isLoading && pendingOrders.length === 0 && (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Không có đơn nào đang chờ duyệt.
              </div>
            )}
            {pendingOrders.map((order) => (
              <article
                className="rounded-2xl border border-slate-200 p-4"
                key={order.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {order.customerEmail}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.packageName ?? "Gói học đang chờ"} •{" "}
                      {formatMoney(order.amountCents, order.currency)}
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                    {formatStatusVi(order.status)}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Ngày tạo {formatDate(order.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {report && report.topSales.length > 0 && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {topSalesTitle}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {topSalesDescription}
              </p>
            </div>
            <Link
              className="text-sm font-medium text-teal-700"
              href={isAgencyWorkspace ? "/admin/channel" : "/admin/finance"}
            >
              {isAgencyWorkspace ? "Mở không gian kênh" : "Mở tài chính"}
            </Link>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {report.topSales.slice(0, 3).map((sale) => (
              <article
                className="rounded-2xl border border-slate-200 p-4"
                key={sale.email}
              >
                <p className="text-sm font-semibold text-slate-950">
                  {sale.displayName ?? sale.email}
                </p>
                <p className="mt-1 text-xs text-slate-500">{sale.email}</p>
                <p className="mt-4 text-xl font-semibold text-slate-950">
                  {formatMoney(sale.revenueCents, "VND")}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {sale.orderCount} đơn hàng • hoa hồng{" "}
                  {formatMoney(sale.commissionCents, "VND")}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
