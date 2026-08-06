"use client";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  MousePointerClick,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatMoney,
  formatStatusVi,
  publicApiBaseUrl,
} from "../_lib/admin-client";

type DemoAdSource = "GOOGLE_ADS" | "FACEBOOK_ADS" | "TIKTOK_ADS" | "DIRECT";

type DemoAttributionRow = {
  source: DemoAdSource;
  campaign: string;
  adGroup: string;
  keyword?: string;
  leadCount: number;
  orderCount: number;
  approvedOrderCount: number;
  revenueCents: number;
  adCostCents: number;
  grossProfitCents: number;
  contributionProfitCents: number;
  clicks: number;
  impressions: number;
  costPerLeadCents: number | null;
  roas: number | null;
  grossProfitRoas: number | null;
};

type DemoLeadOrderRow = {
  leadId: string;
  orderId: string | null;
  source: DemoAdSource;
  campaign: string;
  adGroup: string;
  keyword?: string;
  status: string;
  revenueCents: number;
  grossProfitCents: number;
  contributionBeforeAdCostCents: number;
};

type DemoLeadOrderProfitReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: "VND";
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    providerApiUsed: false;
    liveAdsExecuted: false;
    realErpMutationUsed: false;
  };
  totals: {
    leadCount: number;
    orderCount: number;
    approvedOrderCount: number;
    revenueCents: number;
    adCostCents: number;
    grossProfitCents: number;
    contributionProfitCents: number;
    clicks: number;
    impressions: number;
  };
  rows: DemoAttributionRow[];
  leadOrderMap: DemoLeadOrderRow[];
};

const reportPath = "/v1/erp-local-demo/lead-order-profit-report";

function formatInteger(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatRatio(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${value.toFixed(2)}x`;
}

function sourceLabel(source: DemoAdSource) {
  return source.replaceAll("_", " ");
}

function sourceBadgeClass(source: DemoAdSource) {
  return {
    GOOGLE_ADS: "bg-sky-50 text-sky-700 ring-sky-100",
    FACEBOOK_ADS: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    TIKTOK_ADS: "bg-rose-50 text-rose-700 ring-rose-100",
    DIRECT: "bg-slate-100 text-slate-700 ring-slate-200",
  }[source];
}

function contributionClass(value: number) {
  return value < 0 ? "text-rose-700" : "text-slate-950";
}

export default function AdsAttributionDemoPage() {
  const [report, setReport] = useState<DemoLeadOrderProfitReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(
    "Đang tải báo cáo phân bổ quảng cáo demo...",
  );

  const endpointUrl = `${publicApiBaseUrl}${reportPath}`;

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setMessage("Đang tải báo cáo phân bổ quảng cáo demo...");

    try {
      const response = await fetch(endpointUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(
          `Điểm cuối dữ liệu mô phỏng trả về mã ${response.status}.`,
        );
      }

      const data = (await response.json()) as DemoLeadOrderProfitReport;
      setReport(data);
      setMessage(
        `Đã tải báo cáo dựa trên dữ liệu mô phỏng từ GET ${reportPath}.`,
      );
    } catch (error) {
      setReport(null);
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải báo cáo phân bổ quảng cáo demo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [endpointUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReport();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReport]);

  const metricCards = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      {
        label: "Khách tiềm năng",
        value: formatInteger(report.totals.leadCount),
        note: `${formatInteger(report.totals.clicks)} lượt nhấp`,
      },
      {
        label: "Đơn hàng",
        value: formatInteger(report.totals.orderCount),
        note: `${formatInteger(report.totals.approvedOrderCount)} đơn đã duyệt`,
      },
      {
        label: "Doanh thu",
        value: formatMoney(report.totals.revenueCents, report.currency),
        note: "Chỉ tính đơn đã duyệt",
      },
      {
        label: "Chi phí quảng cáo",
        value: formatMoney(report.totals.adCostCents, report.currency),
        note: `${formatInteger(report.totals.impressions)} lượt hiển thị`,
      },
      {
        label: "Lợi nhuận gộp",
        value: formatMoney(report.totals.grossProfitCents, report.currency),
        note: "Sau giá vốn",
      },
      {
        label: "Lợi nhuận sau quảng cáo",
        value: formatMoney(
          report.totals.contributionProfitCents,
          report.currency,
        ),
        note: "Lợi nhuận gộp trừ quảng cáo và chi phí biến đổi",
      },
    ];
  }, [report]);

  return (
    <div className="px-6 py-6 lg:px-8 lg:py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
              <BarChart3 size={18} />
              Chỉ dùng dữ liệu demo/giả lập local
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Phân bổ quảng cáo từ khách tiềm năng đến đơn hàng và lợi nhuận
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {message}
            </p>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void loadReport()}
            type="button"
          >
            <RefreshCw size={16} />
            Làm mới dữ liệu giả lập
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Chỉ dữ liệu giả lập", report?.safety.fixtureOnly],
            [
              "Không dùng DB production",
              report ? !report.safety.productionDbUsed : null,
            ],
            [
              "Không gọi API nhà cung cấp",
              report ? !report.safety.providerApiUsed : null,
            ],
            ["ERP chỉ đọc", report ? !report.safety.realErpMutationUsed : null],
          ].map(([label, passed]) => (
            <div
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              key={String(label)}
            >
              <div
                className={`grid size-9 place-items-center rounded-xl ${
                  passed
                    ? "bg-teal-50 text-teal-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {passed ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertTriangle size={17} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">{label}</p>
                <p className="text-xs text-slate-500">
                  {passed
                    ? "Đã đóng trong bản demo local"
                    : "Đang chờ dữ liệu giả lập"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {report && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((item) => (
              <article
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                key={item.label}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <p
                  className={`mt-3 text-2xl font-semibold ${
                    item.label === "Lợi nhuận sau quảng cáo"
                      ? contributionClass(report.totals.contributionProfitCents)
                      : "text-slate-950"
                  }`}
                >
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{item.note}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <TrendingUp size={18} />
              Dòng phân bổ
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Được nhóm theo nguồn, chiến dịch và nhóm quảng cáo từ báo cáo giả
              lập.
            </p>
          </div>
          {report && (
            <span className="text-xs text-slate-500">
              Thời điểm tạo{" "}
              {new Date(report.generatedAt).toLocaleDateString("vi-VN")}
            </span>
          )}
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Nguồn</th>
                  <th className="px-5 py-3">Chiến dịch / nhóm quảng cáo</th>
                  <th className="px-5 py-3 text-right">Khách tiềm năng</th>
                  <th className="px-5 py-3 text-right">Đơn hàng</th>
                  <th className="px-5 py-3 text-right">Đã duyệt</th>
                  <th className="px-5 py-3 text-right">Doanh thu</th>
                  <th className="px-5 py-3 text-right">Chi phí quảng cáo</th>
                  <th className="px-5 py-3 text-right">Lợi nhuận gộp</th>
                  <th className="px-5 py-3 text-right">Lợi nhuận đóng góp</th>
                  <th className="px-5 py-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {report?.rows.map((row) => (
                  <tr key={`${row.source}-${row.campaign}-${row.adGroup}`}>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${sourceBadgeClass(row.source)}`}
                      >
                        {sourceLabel(row.source)}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-slate-950">
                        {row.campaign}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.adGroup}
                        {row.keyword ? ` / ${row.keyword}` : ""}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatInteger(row.clicks)} lượt nhấp /{" "}
                        {formatInteger(row.impressions)} lượt hiển thị / CPL{" "}
                        {row.costPerLeadCents === null
                          ? "-"
                          : formatMoney(row.costPerLeadCents, "VND")}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatInteger(row.leadCount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatInteger(row.orderCount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatInteger(row.approvedOrderCount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top font-medium text-slate-950">
                      {formatMoney(row.revenueCents, "VND")}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatMoney(row.adCostCents, "VND")}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatMoney(row.grossProfitCents, "VND")}
                    </td>
                    <td
                      className={`px-5 py-4 text-right align-top font-semibold ${contributionClass(row.contributionProfitCents)}`}
                    >
                      {formatMoney(row.contributionProfitCents, "VND")}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatRatio(row.roas)}
                    </td>
                  </tr>
                ))}
                {!report && (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-sm text-slate-500"
                      colSpan={10}
                    >
                      {isLoading
                        ? "Đang tải báo cáo giả lập..."
                        : "Chưa có báo cáo giả lập."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MousePointerClick size={18} />
          Theo dõi từ khách tiềm năng đến đơn hàng
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Dữ liệu giả lập gồm khách đã chuyển đổi, đang chờ và chưa chuyển đổi.
        </p>

        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {report?.leadOrderMap.map((item) => (
            <article
              className="rounded-2xl border border-slate-200 p-4"
              key={item.leadId}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {item.leadId}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.orderId ?? "Không có đơn"} /{" "}
                    {formatStatusVi(item.status)}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${sourceBadgeClass(item.source)}`}
                >
                  {sourceLabel(item.source)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Doanh thu
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {formatMoney(item.revenueCents, "VND")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Lợi nhuận gộp
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {formatMoney(item.grossProfitCents, "VND")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Trước quảng cáo
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {formatMoney(item.contributionBeforeAdCostCents, "VND")}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {item.campaign} / {item.adGroup}
                {item.keyword ? ` / ${item.keyword}` : ""}
              </p>
            </article>
          ))}
          {!report && (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Dữ liệu theo dõi sẽ hiển thị sau khi báo cáo giả lập tải xong.
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-teal-200 bg-teal-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-white text-teal-700">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-teal-950">
              Giới hạn bản demo local
            </p>
            <p className="mt-1 text-sm leading-6 text-teal-900">
              Màn hình chỉ đọc dữ liệu giả lập. Không đọc database production,
              không gọi API quảng cáo, không chạy quảng cáo thật và không thay
              đổi dữ liệu ERP.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
