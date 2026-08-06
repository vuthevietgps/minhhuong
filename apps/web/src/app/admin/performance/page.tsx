"use client";

import { ArrowRight, RefreshCw, WalletCards } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  adminJson,
  defaultReportPeriod,
  formatDate,
  formatMoney,
  formatStatusVi,
} from "../_lib/admin-client";
import {
  adminPerformanceRoles,
  hasAllowedRole,
  useStoredAdminSession,
} from "../_lib/admin-session";

type MoneyBreakdown = Record<string, { count: number; amountCents: number }>;

type SalePerformanceReport = {
  period: {
    from: string;
    to: string;
  };
  orders: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvedRevenueCents: number;
    byStatus: MoneyBreakdown;
  };
  commission: {
    totalCents: number;
    commissionRateBps: number | null;
    baseSalaryCents: number;
  };
  recentOrders: Array<{
    id: string;
    status: string;
    customerEmail: string;
    amountCents: number;
    currency: string;
    packageName?: string;
    activatedAt?: string;
    expiresAt?: string;
    createdAt: string;
    commissionEarnings: Array<{
      amountCents: number;
      status: string;
    }>;
  }>;
};

type WalletSummary = {
  availableCents: number;
  heldCents: number;
  currency: string;
};

type PayoutRequest = {
  id: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: string;
  paidAt?: string;
  requestNotes?: string;
  reviewNotes?: string;
};

type PerformanceWallet = {
  summary: WalletSummary;
  payoutRequests: PayoutRequest[];
  participant?: {
    id: string;
    code: string;
    displayName: string;
    commissionRateBps?: number | null;
    baseSalaryCents?: number;
  } | null;
};

type AgencyPerformanceReport = {
  period: {
    from: string;
    to: string;
  };
  approvedRevenue: {
    orderCount: number;
    amountCents: number;
    bySource: MoneyBreakdown;
  };
  commissions: {
    totalCount: number;
    totalAmountCents: number;
    saleAmountCents: number;
    agencyAmountCents: number;
  };
  payouts: {
    paidCount: number;
    paidAmountCents: number;
    byStatus: MoneyBreakdown;
  };
  topSales: Array<{
    email: string;
    displayName?: string;
    orderCount: number;
    revenueCents: number;
    commissionCents: number;
  }>;
  recentApprovedOrders: Array<{
    id: string;
    customerEmail: string;
    amountCents: number;
    currency: string;
    activatedAt?: string;
    expiresAt?: string;
    source: string;
    agency?: {
      code: string;
      name: string;
    };
  }>;
};

export default function PerformancePage() {
  const { loaded, roles, session } = useStoredAdminSession();
  const period = defaultReportPeriod();
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const [saleReport, setSaleReport] = useState<SalePerformanceReport | null>(
    null,
  );
  const [agencyReport, setAgencyReport] =
    useState<AgencyPerformanceReport | null>(null);
  const [wallet, setWallet] = useState<PerformanceWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("Đang tải bảng hiệu suất của bạn...");
  const [amountVnd, setAmountVnd] = useState("100000");
  const [bankName, setBankName] = useState("Vietcombank");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  const canView = hasAllowedRole(roles, adminPerformanceRoles);
  const performanceMode =
    roles.includes("AGENCY_OWNER") || roles.includes("AGENCY_MANAGER")
      ? "agency"
      : roles.includes("SALE")
        ? "sale"
        : "none";

  const load = useCallback(async () => {
    setIsLoading(true);
    setMessage(
      performanceMode === "agency"
        ? "Đang tải không gian hiệu suất đại lý..."
        : "Đang tải bảng hiệu suất của bạn...",
    );
    try {
      if (performanceMode === "agency") {
        const [reportData, walletData] = await Promise.all([
          adminJson<AgencyPerformanceReport>(
            `/channel-finance/report?from=${from}&to=${to}`,
            undefined,
            "Không thể tải báo cáo hiệu suất đại lý.",
          ),
          adminJson<PerformanceWallet>(
            "/channel-finance/wallet",
            undefined,
            "Không thể tải ví hoa hồng đại lý.",
          ),
        ]);
        setAgencyReport(reportData);
        setSaleReport(null);
        setWallet(walletData);
        setMessage("Đã tải không gian hiệu suất đại lý.");
      } else {
        const [reportData, walletData] = await Promise.all([
          adminJson<SalePerformanceReport>(
            `/channel-finance/my-report?from=${from}&to=${to}`,
            undefined,
            "Không thể tải báo cáo hiệu suất của bạn.",
          ),
          adminJson<PerformanceWallet>(
            "/channel-finance/wallet",
            undefined,
            "Không thể tải ví hoa hồng của bạn.",
          ),
        ]);
        setSaleReport(reportData);
        setAgencyReport(null);
        setWallet(walletData);
        setMessage("Đã tải bảng hiệu suất cá nhân.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : performanceMode === "agency"
            ? "Không thể tải không gian hiệu suất đại lý."
            : "Không thể tải bảng hiệu suất của bạn.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [from, performanceMode, to]);

  useEffect(() => {
    if (!loaded || !canView) {
      return;
    }

    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canView, load, loaded]);

  const availableWithdrawalVnd = Math.floor(
    (wallet?.summary.availableCents ?? 0) / 100,
  );
  const canWithdrawNow = availableWithdrawalVnd > 0;
  const metricCards =
    performanceMode === "agency"
      ? [
          [
            "Doanh thu đã duyệt",
            agencyReport
              ? formatMoney(agencyReport.approvedRevenue.amountCents, "VND")
              : "-",
            agencyReport
              ? `${agencyReport.approvedRevenue.orderCount} đơn đã duyệt`
              : "-",
          ],
          [
            "Hoa hồng đại lý",
            agencyReport
              ? formatMoney(agencyReport.commissions.agencyAmountCents, "VND")
              : "-",
            agencyReport
              ? `${agencyReport.commissions.totalCount} dòng thu nhập`
              : "-",
          ],
          [
            "Số dư khả dụng",
            wallet
              ? formatMoney(
                  wallet.summary.availableCents,
                  wallet.summary.currency,
                )
              : "-",
            wallet
              ? `${formatMoney(wallet.summary.heldCents, wallet.summary.currency)} đang tạm giữ`
              : "-",
          ],
          [
            "Đã chi trả",
            agencyReport
              ? formatMoney(agencyReport.payouts.paidAmountCents, "VND")
              : "-",
            agencyReport
              ? `${agencyReport.payouts.paidCount} yêu cầu đã chi trả`
              : "-",
          ],
        ]
      : [
          [
            "Doanh thu đã duyệt",
            saleReport
              ? formatMoney(saleReport.orders.approvedRevenueCents, "VND")
              : "-",
            saleReport ? `${saleReport.orders.approved} đơn đã duyệt` : "-",
          ],
          [
            "Hoa hồng đã nhận",
            saleReport
              ? formatMoney(saleReport.commission.totalCents, "VND")
              : "-",
            saleReport
              ? `Tỷ lệ ${((saleReport.commission.commissionRateBps ?? 0) / 100).toFixed(2)}%`
              : "-",
          ],
          [
            "Số dư khả dụng",
            wallet
              ? formatMoney(
                  wallet.summary.availableCents,
                  wallet.summary.currency,
                )
              : "-",
            wallet
              ? `${formatMoney(wallet.summary.heldCents, wallet.summary.currency)} đang tạm giữ`
              : "-",
          ],
          [
            "Lương cơ bản",
            saleReport
              ? formatMoney(saleReport.commission.baseSalaryCents, "VND")
              : "-",
            wallet?.participant
              ? wallet.participant.code
              : "Chưa có mã thành viên",
          ],
        ];

  if (!loaded) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Đang tải không gian cá nhân...
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-amber-950">
            Vai trò này không được truy cập hiệu suất cá nhân.
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            Không gian hiệu suất dành cho vai trò kinh doanh và đại lý. Hãy dùng
            khu vực tài chính nếu cần xem đối soát rộng hơn.
          </p>
          <Link
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-amber-900 px-4 text-sm font-medium text-white"
            href="/admin/finance"
          >
            Mở không gian tài chính
          </Link>
        </div>
      </div>
    );
  }

  async function createPayoutRequest() {
    if (Number(amountVnd) > availableWithdrawalVnd) {
      setMessage("Số tiền rút vượt quá số dư hoa hồng khả dụng.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo yêu cầu chi trả...");

    try {
      await adminJson(
        "/channel-finance/payouts",
        {
          method: "POST",
          body: JSON.stringify({
            amountVnd: Number(amountVnd),
            bankName,
            bankAccountNumber,
            bankAccountName,
            requestNotes,
          }),
        },
        "Không thể tạo yêu cầu chi trả.",
      );
      setMessage("Đã gửi yêu cầu chi trả để bộ phận vận hành xét duyệt.");
      setRequestNotes("");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo yêu cầu chi trả.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="px-6 py-6 lg:px-8 lg:py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
              <WalletCards size={18} />
              {performanceMode === "agency"
                ? "Hiệu suất đại lý"
                : "Hiệu suất của tôi"}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {performanceMode === "agency"
                ? "Doanh thu đại lý, hiệu suất đội ngũ và tiến độ chi trả trong một không gian"
                : "Doanh thu, hoa hồng và tiến độ chi trả của tài khoản kênh"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
            {session && (
              <p className="mt-2 text-xs text-slate-400">
                Đăng nhập với tên{" "}
                {session.user.displayName ?? session.user.email}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-500">
                Từ ngày
              </span>
              <input
                className="mt-1 h-10 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) => setFrom(event.target.value)}
                type="date"
                value={from}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">
                Đến ngày
              </span>
              <input
                className="mt-1 h-10 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) => setTo(event.target.value)}
                type="date"
                value={to}
              />
            </label>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={isLoading}
              onClick={() => void load()}
              type="button"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(([label, value, note]) => (
            <article
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              key={label}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{note}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {performanceMode === "agency" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Nhân viên nổi bật trong đại lý
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Xem ai đang tạo doanh thu được duyệt nhiều nhất trong phạm
                    vi đại lý.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-medium text-teal-700"
                  href="/admin/channel"
                >
                  Mở kênh
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {agencyReport?.topSales.slice(0, 6).map((sale) => (
                  <article
                    className="rounded-2xl border border-slate-200 p-4"
                    key={sale.email}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {sale.displayName ?? sale.email}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {sale.email}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-950">
                        {formatMoney(sale.revenueCents, "VND")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {sale.orderCount} đơn đã duyệt • hoa hồng{" "}
                      {formatMoney(sale.commissionCents, "VND")}
                    </p>
                  </article>
                ))}
                {agencyReport &&
                  agencyReport.topSales.length === 0 &&
                  !isLoading && (
                    <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      Chưa ghi nhận hiệu suất kinh doanh trong kỳ hiện tại.
                    </div>
                  )}
              </div>
            </section>
          ) : (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Đơn khách hàng gần đây
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Theo dõi phê duyệt, hết hạn và hoa hồng của các đơn gần đây.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-medium text-teal-700"
                  href="/admin/orders"
                >
                  Mở đơn hàng
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {saleReport?.recentOrders.map((order) => {
                  const availableCommission = order.commissionEarnings
                    .filter((earning) => earning.status !== "CANCELED")
                    .reduce((sum, earning) => sum + earning.amountCents, 0);

                  return (
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
                            {order.packageName ?? "Gói học đang chờ"} • tạo ngày{" "}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-950">
                          {formatMoney(order.amountCents, order.currency)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        {formatStatusVi(order.status)} • hoa hồng{" "}
                        {formatMoney(availableCommission, "VND")}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Đã kích hoạt {formatDate(order.activatedAt)} • Hết hạn{" "}
                        {formatDate(order.expiresAt)}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Yêu cầu rút tiền
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {performanceMode === "agency"
                  ? "Gửi yêu cầu chi trả trực tiếp từ số dư hoa hồng đại lý khả dụng."
                  : "Gửi yêu cầu chi trả trực tiếp từ số dư hoa hồng khả dụng."}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                  Số tiền (VNĐ)
                  <button
                    className="text-xs font-medium text-teal-700 disabled:text-slate-400"
                    disabled={!canWithdrawNow}
                    onClick={() => setAmountVnd(String(availableWithdrawalVnd))}
                    type="button"
                  >
                    Dùng số dư khả dụng
                  </button>
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  max={Math.max(availableWithdrawalVnd, 10000)}
                  min="10000"
                  onChange={(event) => setAmountVnd(event.target.value)}
                  type="number"
                  value={amountVnd}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Ngân hàng
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setBankName(event.target.value)}
                  value={bankName}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Số tài khoản
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setBankAccountNumber(event.target.value)}
                  value={bankAccountNumber}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Tên chủ tài khoản
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setBankAccountName(event.target.value)}
                  value={bankAccountName}
                />
              </label>
            </div>
            <input
              className="mt-3 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              onChange={(event) => setRequestNotes(event.target.value)}
              placeholder="Ghi chú rút tiền"
              value={requestNotes}
            />
            <button
              className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSaving || !canWithdrawNow}
              onClick={() => void createPayoutRequest()}
              type="button"
            >
              <WalletCards size={16} />
              {canWithdrawNow ? "Yêu cầu chi trả" : "Không có số dư khả dụng"}
            </button>
          </section>
        </div>

        <div className="space-y-4">
          {performanceMode === "agency" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Đơn mới được duyệt
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Các đơn học viên đã duyệt đang đóng góp vào doanh thu đại
                    lý.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-medium text-teal-700"
                  href="/admin/orders"
                >
                  Mở đơn hàng
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {agencyReport?.recentApprovedOrders.slice(0, 8).map((order) => (
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
                          {formatStatusVi(order.source)} •{" "}
                          {order.agency
                            ? `${order.agency.code} • ${order.agency.name}`
                            : "Trực tiếp"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-950">
                        {formatMoney(order.amountCents, order.currency)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Đã kích hoạt {formatDate(order.activatedAt)} • Hết hạn{" "}
                      {formatDate(order.expiresAt)}
                    </p>
                  </article>
                ))}
                {agencyReport &&
                  agencyReport.recentApprovedOrders.length === 0 &&
                  !isLoading && (
                    <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      Chưa có đơn đại lý được duyệt trong kỳ hiện tại.
                    </div>
                  )}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Yêu cầu chi trả
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Quy trình chi trả gần đây gắn với ví của bạn.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {wallet?.payoutRequests.slice(0, 8).map((payout) => (
                <article
                  className="rounded-2xl border border-slate-200 p-4"
                  key={payout.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatStatusVi(payout.status)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ngày yêu cầu {formatDate(payout.createdAt)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-950">
                      {formatMoney(payout.amountCents, payout.currency)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Ngày chi {formatDate(payout.paidAt)}
                  </p>
                  {payout.requestNotes && (
                    <p className="mt-1 text-xs text-slate-400">
                      Yêu cầu: {payout.requestNotes}
                    </p>
                  )}
                  {payout.reviewNotes && (
                    <p className="mt-1 text-xs text-slate-400">
                      Duyệt: {payout.reviewNotes}
                    </p>
                  )}
                </article>
              ))}
              {wallet && wallet.payoutRequests.length === 0 && !isLoading && (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Chưa có yêu cầu chi trả nào.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
