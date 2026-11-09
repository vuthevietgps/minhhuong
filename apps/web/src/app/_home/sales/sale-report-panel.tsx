"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";
import type { ActivationOrder, Session } from "../types";
import { activationStatusClass, activationStatusLabels } from "./activation-status";

type SaleReport = {
  period: { from: string; to: string };
  orders: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvedRevenueCents: number;
  };
  commission: {
    totalCents: number;
    commissionRateBps: number | null;
    baseSalaryCents: number;
  };
  recentOrders: ActivationOrder[];
};

export function SalePersonalReportPanel({ session }: { session: Session }) {
  const [report, setReport] = useState<SaleReport | null>(null);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [message, setMessage] = useState("Đang tải báo cáo của bạn...");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadReport = useCallback(async () => {
    setMessage("Đang tải...");
    try {
      const params = new URLSearchParams({ from: fromDate, to: toDate });
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/my-report?${params.toString()}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể tải báo cáo."));
      }
      const data = (await response.json()) as SaleReport;
      setReport(data);
      setMessage(`Report for ${fromDate} – ${toDate}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải báo cáo.",
      );
    }
  }, [authHeaders, fromDate, toDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReport();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadReport]);

  const commissionRatePct =
    report?.commission.commissionRateBps != null
      ? (report.commission.commissionRateBps / 100).toFixed(1) + "%"
      : null;

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Hiệu suất của tôi
          </p>
          <h2 className="mt-1 text-xl font-semibold">Báo cáo kinh doanh</h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span>Từ ngày</span>
            <input
              className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
              onChange={(event) => setFromDate(event.target.value)}
              type="date"
              value={fromDate}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span>Đến ngày</span>
            <input
              className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
              onChange={(event) => setToDate(event.target.value)}
              type="date"
              value={toDate}
            />
          </label>
          <button
            className="h-8 rounded-lg bg-slate-950 px-3 text-xs font-medium text-white"
            onClick={() => void loadReport()}
            type="button"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {report && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Tổng đơn hàng", report.orders.total],
              ["Đã duyệt", report.orders.approved],
              [
                "Doanh thu",
                formatMoney(report.orders.approvedRevenueCents, "VND"),
              ],
              [
                "Hoa hồng nhận được",
                formatMoney(report.commission.totalCents, "VND"),
              ],
            ].map(([label, value]) => (
              <div className="rounded-lg bg-slate-50 p-3" key={String(label)}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {commissionRatePct && (
            <p className="mt-3 text-xs text-slate-600">
              Tỷ lệ hoa hồng của bạn:{" "}
              <span className="font-semibold text-teal-700">
                {commissionRatePct}
              </span>
              {report.commission.baseSalaryCents > 0 && (
                <>
                  {" "}
                  · Lương cơ bản:{" "}
                  <span className="font-semibold">
                    {formatMoney(report.commission.baseSalaryCents, "VND")}
                  </span>
                  /tháng
                </>
              )}
            </p>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-semibold">Đơn hàng gần đây</h3>
            <div className="mt-2 divide-y divide-slate-200">
              {report.recentOrders.map((order) => (
                <div
                  className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between"
                  key={order.id}
                >
                  <div>
                    <p className="text-sm font-medium">{order.customerEmail}</p>
                    <p className="text-xs text-slate-500">
                      {formatMoney(order.amountCents, order.currency)}
                      {order.packageName ? ` · ${order.packageName}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-6 items-center rounded-lg px-2 text-xs font-medium ring-1 ${activationStatusClass(order.status)}`}
                    >
                      {activationStatusLabels[order.status]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
