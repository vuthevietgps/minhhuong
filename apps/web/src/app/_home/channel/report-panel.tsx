"use client";

import { BarChart3, ClipboardList } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { formatDate, formatMoney, formatStatusCodeVi } from "../lib/format";
import type { ChannelParticipantSummary, Session } from "../types";

type MoneyBreakdown = Record<
  string,
  {
    count: number;
    amountCents: number;
  }
>;

type ChannelReport = {
  period: {
    from: string;
    to: string;
  };
  orderPipeline: {
    totalCount: number;
    totalAmountCents: number;
    byStatus: MoneyBreakdown;
    bySource: MoneyBreakdown;
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
    requestCount: number;
    requestedAmountCents: number;
    paidCount: number;
    paidAmountCents: number;
    byStatus: MoneyBreakdown;
  };
  topSales: Array<{
    participantId?: string;
    userId?: string;
    email: string;
    displayName?: string;
    orderCount: number;
    revenueCents: number;
    commissionCount: number;
    commissionCents: number;
  }>;
  topAgencies: Array<{
    participantId?: string;
    agencyId?: string;
    code: string;
    name: string;
    orderCount: number;
    revenueCents: number;
    commissionCount: number;
    commissionCents: number;
  }>;
  recentApprovedOrders: Array<{
    id: string;
    customerEmail: string;
    amountCents: number;
    currency: string;
    source: "SALE_ASSISTED" | "SELF_SERVICE";
    activatedAt?: string;
    expiresAt?: string;
    createdBy?: {
      email: string;
      profile?: {
        displayName?: string;
      };
    };
    agency?: {
      code: string;
      name: string;
    };
    channelParticipant?: ChannelParticipantSummary;
  }>;
  recentPayouts: Array<{
    id: string;
    status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAID" | "CANCELED";
    amountCents: number;
    currency: string;
    createdAt: string;
    paidAt?: string;
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
  }>;
};

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultReportFrom() {
  return dateInputValue(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
}

function defaultReportTo() {
  return dateInputValue(new Date());
}

export function ChannelReportPanel({ session }: { session: Session }) {
  const [from, setFrom] = useState(defaultReportFrom);
  const [to, setTo] = useState(defaultReportTo);
  const [report, setReport] = useState<ChannelReport | null>(null);
  const [message, setMessage] = useState("Đang tải báo cáo kênh.");
  const [isLoading, setIsLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setMessage("Đang tải báo cáo kênh...");

    try {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/report?${params}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể tải báo cáo."));
      }

      setReport((await response.json()) as ChannelReport);
      setMessage("Đã tải báo cáo.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải báo cáo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, from, to]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReport();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReport]);

  function exportCsv() {
    if (!report) {
      setMessage("Hãy tải báo cáo trước khi xuất.");
      return;
    }

    const rows = [
      ["section", "name", "đơn hàng", "revenue_vnd", "commission_vnd"],
      [
        "summary",
        "doanh thu đã duyệt",
        String(report.approvedRevenue.orderCount),
        String(Math.round(report.approvedRevenue.amountCents / 100)),
        "",
      ],
      [
        "summary",
        "hoa hồng",
        String(report.commissions.totalCount),
        "",
        String(Math.round(report.commissions.totalAmountCents / 100)),
      ],
      ...report.topSales.map((sale) => [
        "sale",
        sale.displayName ?? sale.email,
        String(sale.orderCount),
        String(Math.round(sale.revenueCents / 100)),
        String(Math.round(sale.commissionCents / 100)),
      ]),
      ...report.topAgencies.map((agency) => [
        "agency",
        `${agency.code} - ${agency.name}`,
        String(agency.orderCount),
        String(Math.round(agency.revenueCents / 100)),
        String(Math.round(agency.commissionCents / 100)),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `channel-report-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportOrdersCsv() {
    setIsLoading(true);
    setMessage("Đang xuất CSV đơn hàng...");

    try {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/report/csv?${params.toString()}`,
        { headers: authHeaders },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể xuất CSV đơn hàng."),
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `channel-orders-${from}-${to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Đã xuất CSV đơn hàng.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể xuất CSV đơn hàng.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const orderStatusRows = Object.entries(report?.orderPipeline.byStatus ?? {});
  const payoutStatusRows = Object.entries(report?.payouts.byStatus ?? {});

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Báo cáo kênh
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Doanh thu, hoa hồng và kênh bán hàng
          </h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Từ ngày</span>
            <input
              className="mt-1 h-10 rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setFrom(event.target.value)}
              type="date"
              value={from}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Đến ngày</span>
            <input
              className="mt-1 h-10 rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setTo(event.target.value)}
              type="date"
              value={to}
            />
          </label>
          <button
            className="flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void loadReport()}
            type="button"
          >
            <BarChart3 size={17} />
            Làm mới
          </button>
          <button
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 disabled:opacity-60"
            disabled={!report}
            onClick={exportCsv}
            type="button"
          >
            <ClipboardList size={17} />
            Xuất CSV
          </button>
          <button
            className="flex h-10 items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-800 hover:bg-teal-100 disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void exportOrdersCsv()}
            type="button"
          >
            <ClipboardList size={17} />
            Xuất CSV đơn hàng
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Doanh thu đã duyệt",
            formatMoney(report?.approvedRevenue.amountCents ?? 0, "VND"),
            `${report?.approvedRevenue.orderCount ?? 0} đơn đã duyệt`,
          ],
          [
            "Đơn trong quy trình",
            formatMoney(report?.orderPipeline.totalAmountCents ?? 0, "VND"),
            `${report?.orderPipeline.totalCount ?? 0} đơn hàng`,
          ],
          [
            "Hoa hồng phát sinh",
            formatMoney(report?.commissions.totalAmountCents ?? 0, "VND"),
            `${report?.commissions.totalCount ?? 0} dòng hoa hồng`,
          ],
          [
            "Khoản đã chi",
            formatMoney(report?.payouts.paidAmountCents ?? 0, "VND"),
            `${report?.payouts.paidCount ?? 0} yêu cầu đã chi trả`,
          ],
        ].map(([label, value, helper]) => (
          <div className="rounded-lg bg-slate-100 p-4" key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{helper}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Nhân viên nổi bật</h3>
            <span className="text-xs text-slate-500">
              {report
                ? `${formatDate(report.period.from)} - ${formatDate(report.period.to)}`
                : "Chưa có báo cáo"}
            </span>
          </div>
          <div className="mt-3 max-h-80 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {report?.topSales.map((sale) => (
              <div
                className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]"
                key={sale.participantId ?? sale.userId ?? sale.email}
              >
                <div>
                  <p className="text-sm font-semibold">
                    {sale.displayName ?? sale.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{sale.email}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold">
                    {formatMoney(sale.revenueCents, "VND")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {sale.orderCount} đơn hàng /{" "}
                    {formatMoney(sale.commissionCents, "VND")} hoa hồng
                  </p>
                </div>
              </div>
            ))}
            {(!report || report.topSales.length === 0) && (
              <div className="py-8 text-center text-sm text-slate-500">
                Chưa có doanh thu kinh doanh trong kỳ này.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Đại lý nổi bật</h3>
            <span className="text-xs text-slate-500">
              {report?.topAgencies.length ?? 0} đại lý
            </span>
          </div>
          <div className="mt-3 max-h-80 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {report?.topAgencies.map((agency) => (
              <div
                className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]"
                key={agency.participantId ?? agency.agencyId ?? agency.code}
              >
                <div>
                  <p className="text-sm font-semibold">{agency.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{agency.code}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold">
                    {formatMoney(agency.revenueCents, "VND")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {agency.orderCount} đơn hàng /{" "}
                    {formatMoney(agency.commissionCents, "VND")} hoa hồng
                  </p>
                </div>
              </div>
            ))}
            {(!report || report.topAgencies.length === 0) && (
              <div className="py-8 text-center text-sm text-slate-500">
                Chưa có doanh thu đại lý trong kỳ này.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-4">
          <div>
            <h3 className="text-base font-semibold">Trạng thái đơn hàng</h3>
            <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
              {orderStatusRows.map(([status, value]) => (
                <div
                  className="flex items-center justify-between py-2 text-sm"
                  key={status}
                >
                  <span className="font-medium">{status}</span>
                  <span className="text-slate-500">
                    {value.count} / {formatMoney(value.amountCents, "VND")}
                  </span>
                </div>
              ))}
              {orderStatusRows.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-500">
                  Chưa có đơn hàng.
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">Trạng thái chi trả</h3>
            <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
              {payoutStatusRows.map(([status, value]) => (
                <div
                  className="flex items-center justify-between py-2 text-sm"
                  key={status}
                >
                  <span className="font-medium">{status}</span>
                  <span className="text-slate-500">
                    {value.count} / {formatMoney(value.amountCents, "VND")}
                  </span>
                </div>
              ))}
              {payoutStatusRows.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-500">
                  Chưa có yêu cầu chi trả.
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold">Đơn mới được duyệt</h3>
          <div className="mt-3 max-h-96 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {report?.recentApprovedOrders.map((order) => (
              <div
                className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]"
                key={order.id}
              >
                <div>
                  <p className="text-sm font-semibold">{order.customerEmail}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatStatusCodeVi(order.source)}
                    {order.channelParticipant
                      ? ` / ${order.channelParticipant.code}`
                      : order.agency
                        ? ` / ${order.agency.code}`
                        : ""}
                    {order.createdBy ? ` / ${order.createdBy.email}` : ""}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold">
                    {formatMoney(order.amountCents, order.currency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.activatedAt
                      ? formatDate(order.activatedAt)
                      : "Chưa có ngày kích hoạt"}
                  </p>
                </div>
              </div>
            ))}
            {(!report || report.recentApprovedOrders.length === 0) && (
              <div className="py-8 text-center text-sm text-slate-500">
                Chưa có đơn được duyệt trong kỳ này.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
