"use client";

import { CalendarRange, ClipboardList, RefreshCw, Search } from "lucide-react";
import { statusTabs } from "./shared";
import type { OrdersPageState } from "./use-orders-page-state";

/** Header, queue metrics and filters. */
export function OrdersOverviewSection(state: OrdersPageState) {
  const {
    canReviewOrders,
    fromDateInput,
    isAgencyWorkspace,
    isLoading,
    loadOrders,
    message,
    onSearchSubmit,
    queueSummary,
    searchInput,
    setFromDate,
    setFromDateInput,
    setSearch,
    setSearchInput,
    setStatus,
    setToDate,
    setToDateInput,
    status,
    toDateInput,
  } = state;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
            <ClipboardList size={18} />
            Danh sách đơn hàng
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {canReviewOrders
              ? "Theo dõi vòng đời kích hoạt và các lượt thu hồi sau phê duyệt"
              : isAgencyWorkspace
                ? "Tạo đơn học viên và khôi phục doanh thu đại lý bị gián đoạn"
                : "Tạo đơn học viên và theo dõi tiến độ xét duyệt"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {canReviewOrders
              ? message
              : isAgencyWorkspace
                ? "Không gian đơn hàng được giới hạn theo các đại lý gắn với tài khoản này. Bạn có thể tạo đơn học viên mới, theo dõi phê duyệt, từ chối, hủy và gửi lại ngay tại đây."
                : message}
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void loadOrders()}
          type="button"
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Hàng đợi đã tải",
            String(queueSummary.loaded),
            "Đơn hàng trong dữ liệu hiện tại",
          ],
          [
            "Chờ xét duyệt",
            String(queueSummary.pendingReview),
            canReviewOrders
              ? "Cần bộ phận vận hành xử lý"
              : "Đang chờ bộ phận vận hành",
          ],
          [
            "Đã duyệt",
            String(queueSummary.approved),
            "Tài khoản đang hoạt động theo bộ lọc hiện tại",
          ],
          [
            "Đã chuyển xử lý",
            String(queueSummary.escalated),
            "Đơn bị từ chối hoặc thu hồi",
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

      <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              className={`h-10 rounded-full px-4 text-sm font-medium ${
                status === tab.value
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form
          className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_160px_160px_auto_auto]"
          onSubmit={onSearchSubmit}
        >
          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <Search size={16} />
            <input
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm email khách hàng"
              value={searchInput}
            />
          </div>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <CalendarRange size={16} />
            <input
              className="w-full bg-transparent outline-none"
              onChange={(event) => setFromDateInput(event.target.value)}
              type="date"
              value={fromDateInput}
            />
          </label>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <CalendarRange size={16} />
            <input
              className="w-full bg-transparent outline-none"
              onChange={(event) => setToDateInput(event.target.value)}
              type="date"
              value={toDateInput}
            />
          </label>
          <button
            className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white"
            type="submit"
          >
            Áp dụng
          </button>
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setFromDateInput("");
              setToDateInput("");
              setFromDate("");
              setToDate("");
            }}
            type="button"
          >
            Xóa bộ lọc
          </button>
        </form>
      </div>
    </section>
  );
}
