"use client";

import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  RefreshCw,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  adminFetch,
  adminJson,
  defaultReportPeriod,
  downloadAuthedFile,
  formatDate,
  formatMoney,
  formatStatusVi,
  openAuthedAsset,
  readApiError,
} from "../_lib/admin-client";
import {
  adminFinanceRoles,
  adminPerformanceRoles,
  hasAllowedRole,
  useStoredAdminSession,
} from "../_lib/admin-session";

type MoneyBreakdown = Record<string, { count: number; amountCents: number }>;

type CommissionSummary = {
  availableCents: number;
  heldCents: number;
  currency: string;
};

type CommissionEarning = {
  id: string;
  beneficiaryType: "SALE" | "AGENCY";
  rateBps: number;
  amountCents: number;
  currency: string;
  status: "PENDING" | "AVAILABLE" | "CANCELED";
  participant?: {
    code: string;
    displayName: string;
  };
  activationOrder?: {
    customerEmail: string;
    source: "SALE_ASSISTED" | "SELF_SERVICE";
  };
  beneficiaryAgency?: {
    code: string;
    name: string;
  };
};

type PayoutRequest = {
  id: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAID" | "CANCELED";
  amountCents: number;
  currency: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  requestNotes?: string;
  reviewNotes?: string;
  payoutInvoiceUrl?: string;
  createdAt: string;
  paidAt?: string;
  participant?: {
    code: string;
    displayName: string;
  };
  beneficiaryUser?: {
    email: string;
    profile?: {
      displayName?: string;
    };
  };
  beneficiaryAgency?: {
    code: string;
    name: string;
  };
};

type ChannelFinanceOverview = {
  orders: number;
  approvedRevenueCents: number;
  approvedOrderCount: number;
  pendingPayoutCents: number;
  pendingPayoutCount: number;
  paidPayoutCents: number;
  paidPayoutCount: number;
  wallet: CommissionSummary;
};

type ChannelWallet = {
  summary: CommissionSummary;
  earnings: CommissionEarning[];
  payoutRequests: PayoutRequest[];
  participant?: {
    code: string;
    displayName: string;
    commissionRateBps?: number | null;
    baseSalaryCents?: number;
  } | null;
};

type ChannelReport = {
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
  topAgencies: Array<{
    code: string;
    name: string;
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

export default function FinancePage() {
  const { loaded, roles } = useStoredAdminSession();
  const period = defaultReportPeriod();
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const [overview, setOverview] = useState<ChannelFinanceOverview | null>(null);
  const [wallet, setWallet] = useState<ChannelWallet | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [report, setReport] = useState<ChannelReport | null>(null);
  const [message, setMessage] = useState(
    "Đang tải bảng điều khiển tài chính...",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [amountVnd, setAmountVnd] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [payoutInvoices, setPayoutInvoices] = useState<
    Record<string, File | null>
  >({});
  const [payoutReviewNotes, setPayoutReviewNotes] = useState<
    Record<string, string>
  >({});

  const canViewFinance = hasAllowedRole(roles, adminFinanceRoles);
  const canViewPerformance = hasAllowedRole(roles, adminPerformanceRoles);
  const canManagePayout =
    roles.includes("ADMIN") || roles.includes("OPERATIONS");
  const canRequestPayout =
    roles.includes("AGENCY_OWNER") || roles.includes("AGENCY_MANAGER");

  const load = useCallback(async () => {
    setIsLoading(true);
    setMessage("Đang tải bảng điều khiển tài chính...");
    try {
      const [overviewData, reportData, walletData, payoutData] =
        await Promise.all([
          adminJson<ChannelFinanceOverview>(
            "/channel-finance/overview",
            undefined,
            "Không thể tải tổng quan tài chính.",
          ),
          adminJson<ChannelReport>(
            `/channel-finance/report?from=${from}&to=${to}`,
            undefined,
            "Không thể tải báo cáo tài chính.",
          ),
          adminJson<ChannelWallet>(
            "/channel-finance/wallet",
            undefined,
            "Không thể tải ví hoa hồng.",
          ),
          adminJson<PayoutRequest[]>(
            "/channel-finance/payouts",
            undefined,
            "Không thể tải hàng đợi chi trả.",
          ),
        ]);

      setOverview(overviewData);
      setReport(reportData);
      setWallet(walletData);
      setPayouts(payoutData);
      setMessage("Đã tải bảng điều khiển tài chính.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải bảng điều khiển tài chính.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    if (!loaded || !canViewFinance) {
      return;
    }

    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canViewFinance, load, loaded]);

  const summary = overview?.wallet ?? wallet?.summary;
  const participant = wallet?.participant;
  const recentEarnings = wallet?.earnings ?? [];
  const availableWithdrawalVnd = Math.floor(
    (summary?.availableCents ?? 0) / 100,
  );
  const canWithdrawNow = canRequestPayout && availableWithdrawalVnd > 0;
  const commissionRatePct =
    participant?.commissionRateBps != null
      ? (participant.commissionRateBps / 100).toFixed(1) + "%"
      : null;

  if (!loaded) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Đang kiểm tra quyền tài chính...
        </div>
      </div>
    );
  }

  if (!canViewFinance) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-amber-950">
            Vai trò này không được mở không gian báo cáo tài chính.
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            {canViewPerformance
              ? "Dùng không gian hiệu suất cá nhân để xem đơn hàng, hoa hồng và khoản chi trả của bạn."
              : "Hãy dùng khu vực cổng thông tin phù hợp với phạm vi quyền của bạn."}
          </p>
          {canViewPerformance && (
            <Link
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-amber-900 px-4 text-sm font-medium text-white"
              href="/admin/performance"
            >
              Mở hiệu suất của tôi
            </Link>
          )}
        </div>
      </div>
    );
  }

  async function exportOrdersCsv() {
    try {
      setMessage("Đang xuất tệp CSV đơn hàng đã đối soát...");
      await downloadAuthedFile(
        `/channel-finance/report/csv?from=${from}&to=${to}`,
        `channel-orders-${from}-${to}.csv`,
        "Không thể xuất tệp CSV đơn hàng.",
      );
      setMessage("Đã xuất tệp CSV đơn hàng.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể xuất tệp CSV đơn hàng.",
      );
    }
  }

  async function createPayoutRequest() {
    if (!canRequestPayout) {
      return;
    }
    const requestedAmountVnd = Number(amountVnd);
    if (!Number.isFinite(requestedAmountVnd) || requestedAmountVnd < 10000) {
      setMessage("Nhập số tiền rút tối thiểu 10.000 VNĐ.");
      return;
    }
    if (requestedAmountVnd > availableWithdrawalVnd) {
      setMessage("Số tiền rút vượt quá số dư hoa hồng khả dụng.");
      return;
    }
    if (
      !bankName.trim() ||
      !bankAccountNumber.trim() ||
      !bankAccountName.trim()
    ) {
      setMessage(
        "Yêu cầu chi trả cần có tên ngân hàng, số tài khoản và tên chủ tài khoản.",
      );
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
            amountVnd: requestedAmountVnd,
            bankName: bankName.trim(),
            bankAccountNumber: bankAccountNumber.trim(),
            bankAccountName: bankAccountName.trim(),
            requestNotes: requestNotes.trim(),
          }),
        },
        "Không thể tạo yêu cầu chi trả.",
      );

      setMessage("Đã gửi yêu cầu chi trả để bộ phận vận hành xét duyệt.");
      setAmountVnd("");
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

  async function payPayout(payoutId: string) {
    const payoutInvoice = payoutInvoices[payoutId];
    if (!canManagePayout || !payoutInvoice) {
      setMessage("Cần có hóa đơn chi trả trước khi đánh dấu đã thanh toán.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang xử lý yêu cầu chi trả...");

    try {
      const formData = new FormData();
      formData.append("reviewNotes", payoutReviewNotes[payoutId] ?? "");
      formData.append("payoutInvoice", payoutInvoice);

      const response = await adminFetch(
        `/channel-finance/payouts/${payoutId}/pay`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể thanh toán yêu cầu chi trả."),
        );
      }

      setMessage("Đã đánh dấu khoản chi trả là đã thanh toán và lưu hóa đơn.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể thanh toán yêu cầu chi trả.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function rejectPayout(payoutId: string) {
    if (!canManagePayout) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang từ chối yêu cầu chi trả...");

    try {
      await adminJson(
        `/channel-finance/payouts/${payoutId}/reject`,
        {
          method: "POST",
          body: JSON.stringify({
            reviewNotes:
              payoutReviewNotes[payoutId] ?? "Bị bộ phận vận hành từ chối.",
          }),
        },
        "Không thể từ chối yêu cầu chi trả.",
      );

      setMessage("Đã từ chối khoản chi trả và hoàn lại số dư tạm giữ.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể từ chối yêu cầu chi trả.",
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
              Không gian tài chính
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Đối soát doanh thu, hoa hồng và chi trả
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
            {commissionRatePct && (
              <p className="mt-2 text-xs text-teal-700">
                Tỷ lệ hoa hồng:{" "}
                <span className="font-semibold">{commissionRatePct}</span>
                {participant?.displayName
                  ? ` • ${participant.displayName}`
                  : ""}
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
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 text-sm font-medium text-teal-800 hover:bg-teal-100"
              onClick={() => void exportOrdersCsv()}
              type="button"
            >
              <Download size={16} />
              Xuất CSV đơn hàng
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Doanh thu đã duyệt",
              overview
                ? formatMoney(overview.approvedRevenueCents, "VND")
                : "-",
              overview ? `${overview.approvedOrderCount} đơn đã duyệt` : "-",
            ],
            [
              "Số dư khả dụng",
              summary
                ? formatMoney(summary.availableCents, summary.currency)
                : "-",
              summary
                ? `${formatMoney(summary.heldCents, summary.currency)} đang tạm giữ`
                : "-",
            ],
            [
              "Khoản chi đang chờ",
              overview ? formatMoney(overview.pendingPayoutCents, "VND") : "-",
              overview ? `${overview.pendingPayoutCount} requests` : "-",
            ],
            [
              "Hoa hồng đã tích lũy",
              report
                ? formatMoney(report.commissions.totalAmountCents, "VND")
                : "-",
              report ? `${report.commissions.totalCount} earning rows` : "-",
            ],
          ].map(([label, value, note]) => (
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

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BarChart3 size={18} />
              Nhân viên kinh doanh nổi bật
            </div>
            <div className="mt-4 space-y-3">
              {report?.topSales.slice(0, 6).map((sale) => (
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
                  <p className="mt-2 text-sm text-slate-500">
                    {sale.orderCount} đơn hàng • hoa hồng{" "}
                    {formatMoney(sale.commissionCents, "VND")}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {canRequestPayout && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Yêu cầu rút tiền
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tạo yêu cầu chi trả từ số dư hoa hồng khả dụng đến tài khoản
                  ngân hàng nhận tiền.
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                    Số tiền (VNĐ)
                    <button
                      className="text-xs font-medium text-teal-700 disabled:text-slate-400"
                      disabled={!canWithdrawNow}
                      onClick={() =>
                        setAmountVnd(String(availableWithdrawalVnd))
                      }
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
                    onChange={(event) =>
                      setBankAccountNumber(event.target.value)
                    }
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
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList size={18} />
              Hoa hồng gần đây
            </div>
            <div className="mt-4 space-y-3">
              {recentEarnings.map((earning) => (
                <article
                  className="rounded-2xl border border-slate-200 p-4"
                  key={earning.id}
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {formatMoney(earning.amountCents, earning.currency)} •{" "}
                    {earning.rateBps / 100}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {earning.participant?.code ?? earning.beneficiaryType}
                    {earning.beneficiaryAgency
                      ? ` • ${earning.beneficiaryAgency.code}`
                      : ""}
                    {earning.activationOrder
                      ? ` • ${earning.activationOrder.customerEmail}`
                      : ""}
                  </p>
                </article>
              ))}
              {recentEarnings.length === 0 && (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Chưa có khoản hoa hồng nào.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Yêu cầu chi trả
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi quy trình chi trả và quản lý minh chứng thanh toán.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {payouts.length} bản ghi
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {payouts.map((payout) => {
                return (
                  <article
                    className="rounded-2xl border border-slate-200 p-4"
                    key={payout.id}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {formatMoney(payout.amountCents, payout.currency)} •{" "}
                            {formatStatusVi(payout.status)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {payout.beneficiaryAgency?.code ??
                              payout.participant?.code ??
                              payout.beneficiaryUser?.profile?.displayName ??
                              payout.beneficiaryUser?.email ??
                              "Người thụ hưởng"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {payout.bankName} • {payout.bankAccountNumber} •{" "}
                            {payout.bankAccountName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Ngày yêu cầu {formatDate(payout.createdAt)} • Đã chi{" "}
                            {formatDate(payout.paidAt)}
                          </p>
                        </div>
                        {payout.payoutInvoiceUrl && (
                          <button
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            onClick={() =>
                              void openAuthedAsset(
                                payout.payoutInvoiceUrl!,
                                "Không thể mở hóa đơn chi trả.",
                              ).catch((error: unknown) =>
                                setMessage(
                                  error instanceof Error
                                    ? error.message
                                    : "Không thể mở hóa đơn chi trả.",
                                ),
                              )
                            }
                            type="button"
                          >
                            <FileText size={14} />
                            Hóa đơn chi trả
                          </button>
                        )}
                      </div>

                      {(payout.requestNotes || payout.reviewNotes) && (
                        <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                          {payout.requestNotes && (
                            <p>Yêu cầu: {payout.requestNotes}</p>
                          )}
                          {payout.reviewNotes && (
                            <p className="mt-1">Duyệt: {payout.reviewNotes}</p>
                          )}
                        </div>
                      )}

                      {canManagePayout &&
                        payout.status === "PENDING_REVIEW" && (
                          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <input
                              accept="application/pdf,image/jpeg,image/png,image/webp"
                              className="block w-full text-sm text-slate-600"
                              onChange={(event) =>
                                setPayoutInvoices((current) => ({
                                  ...current,
                                  [payout.id]: event.target.files?.[0] ?? null,
                                }))
                              }
                              type="file"
                            />
                            <input
                              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                              onChange={(event) =>
                                setPayoutReviewNotes((current) => ({
                                  ...current,
                                  [payout.id]: event.target.value,
                                }))
                              }
                              placeholder="Ghi chú xét duyệt"
                              value={payoutReviewNotes[payout.id] ?? ""}
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                                disabled={isSaving}
                                onClick={() => void payPayout(payout.id)}
                                type="button"
                              >
                                <CheckCircle2 size={16} />
                                Đánh dấu đã thanh toán
                              </button>
                              <button
                                className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                disabled={isSaving}
                                onClick={() => void rejectPayout(payout.id)}
                                type="button"
                              >
                                <XCircle size={16} />
                                Từ chối
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  </article>
                );
              })}
              {payouts.length === 0 && (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Chưa có yêu cầu chi trả nào.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList size={18} />
              Đơn mới được duyệt
            </div>
            <div className="mt-4 space-y-3">
              {report?.recentApprovedOrders.slice(0, 6).map((order) => (
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
            </div>
          </section>
        </div>
      </div>

      {report && report.topAgencies.length > 0 && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Đại lý nổi bật
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.topAgencies.slice(0, 6).map((agency) => (
              <article
                className="rounded-2xl border border-slate-200 p-4"
                key={agency.code}
              >
                <p className="text-sm font-semibold text-slate-950">
                  {agency.code} • {agency.name}
                </p>
                <p className="mt-3 text-xl font-semibold text-slate-950">
                  {formatMoney(agency.revenueCents, "VND")}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {agency.orderCount} đơn hàng • hoa hồng{" "}
                  {formatMoney(agency.commissionCents, "VND")}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
