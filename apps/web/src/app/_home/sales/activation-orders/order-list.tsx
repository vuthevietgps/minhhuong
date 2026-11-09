"use client";

import { openAuthenticatedUpload } from "../../lib/api";
import { formatDate, formatMoney, formatStatusCodeVi } from "../../lib/format";
import { activationStatusClass, activationStatusLabels } from "../activation-status";
import { saleOrderNextStep } from "./helpers";
import type { ActivationOrdersPanelState } from "./use-activation-orders-panel-state";

/** "Danh sách đơn hàng": tabs, search and order cards with actions. */
export function ActivationOrderList(state: ActivationOrdersPanelState) {
  const {
    approveOrder,
    canApprove,
    canCreate,
    cancelOrder,
    durationDays,
    filterFromDate,
    filterToDate,
    isLoading,
    newStatusAlerts,
    openRevokeModal,
    orderSearch,
    orderTab,
    orders,
    rejectOrder,
    resubmitNotes,
    resubmitOrder,
    reviewNotes,
    role,
    session,
    setDurationDays,
    setFilterFromDate,
    setFilterToDate,
    setMessage,
    setNewStatusAlerts,
    setOperationInvoices,
    setOrderSearch,
    setOrderTab,
    setResubmitInvoices,
    setResubmitNotes,
    setReviewNotes,
    tabOptions,
    visibleOrders,
  } = state;
  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Danh sách đơn hàng</h3>
          <span className="text-xs text-slate-500">
            {visibleOrders.length} trong {orders.length} bản ghi
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
            onChange={(event) => setOrderSearch(event.target.value)}
            placeholder="Tìm học viên, mã hoặc trạng thái"
            value={orderSearch}
          />
          <div className="flex gap-2 overflow-x-auto">
            {tabOptions.map((item) => (
              <button
                className={`h-10 shrink-0 rounded-lg px-3 text-xs font-medium ${
                  orderTab === item.key
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
                key={item.key}
                onClick={() => setOrderTab(item.key)}
                type="button"
              >
                {item.label} {item.count}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span>Từ ngày</span>
            <input
              className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
              onChange={(event) => setFilterFromDate(event.target.value)}
              type="date"
              value={filterFromDate}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span>Đến ngày</span>
            <input
              className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
              onChange={(event) => setFilterToDate(event.target.value)}
              type="date"
              value={filterToDate}
            />
          </label>
          {(filterFromDate || filterToDate) && (
            <button
              className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-100"
              onClick={() => {
                setFilterFromDate("");
                setFilterToDate("");
              }}
              type="button"
            >
              Xóa bộ lọc ngày
            </button>
          )}
        </div>
      </div>

      {newStatusAlerts.length > 0 && (
        <div className="mt-3 space-y-2">
          {newStatusAlerts.map((alert) => (
            <div
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                alert.newStatus === "APPROVED"
                  ? "border border-teal-200 bg-teal-50 text-teal-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}
              key={alert.id}
            >
              <span>
                {alert.newStatus === "APPROVED" ? "✅" : "❌"} Đơn của{" "}
                <strong>{alert.email}</strong> vừa{" "}
                {alert.newStatus === "APPROVED"
                  ? "được duyệt"
                  : "bị từ chối"}
              </span>
              <button
                className="shrink-0 rounded px-2 py-1 opacity-70 hover:opacity-100"
                onClick={() =>
                  setNewStatusAlerts((current) =>
                    current.filter((a) => a.id !== alert.id),
                  )
                }
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 max-h-[520px] divide-y divide-slate-200 overflow-auto border-y border-slate-200">
        {visibleOrders.map((order) => (
          <div className="py-3" key={order.id}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">
                      {order.customerEmail}
                    </p>
                    {order.customerPhone && (
                      <p className="text-xs text-slate-500">
                        {order.customerPhone}
                      </p>
                    )}
                    <span
                      className={`inline-flex h-7 items-center rounded-lg px-2 text-xs font-medium ring-1 ${activationStatusClass(order.status)}`}
                    >
                      {activationStatusLabels[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.user.profile?.displayName ?? "Học viên"} /{" "}
                    {formatStatusCodeVi(order.user.status)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatMoney(order.amountCents, order.currency)}
                    {order.packageName ? ` / ${order.packageName}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.source === "SELF_SERVICE"
                      ? "Tự phục vụ"
                      : "Nhân viên hỗ trợ"}
                    {order.channelParticipant
                      ? ` / ${order.channelParticipant.code}`
                      : order.agency
                        ? ` / ${order.agency.code}`
                        : ""}
                    {order.transferContent
                      ? ` / ${order.transferContent}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-700">
                    Bước tiếp theo: {saleOrderNextStep(order, role)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Ngày tạo {formatDate(order.createdAt)}
                  </p>
                  <button
                    className="mt-0.5 font-mono text-xs text-slate-400 hover:text-slate-600"
                    onClick={() =>
                      void navigator.clipboard.writeText(order.id)
                    }
                    title="Sao chép mã đơn"
                    type="button"
                  >
                    #{order.id.slice(0, 8)}
                  </button>
                  {(order.commissionEarnings?.length ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-teal-700">
                      Hoa hồng{" "}
                      {formatMoney(
                        order.commissionEarnings?.reduce(
                          (sum, earning) => sum + earning.amountCents,
                          0,
                        ) ?? 0,
                        order.currency,
                      )}
                    </p>
                  )}
                  {order.expiresAt && (
                    <p className="mt-1 text-xs text-teal-700">
                      Hết hạn {formatDate(order.expiresAt)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.saleInvoiceUrl && (
                    <button
                      className="h-8 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium"
                      onClick={() => {
                        void openAuthenticatedUpload(
                          order.saleInvoiceUrl!,
                          session.accessToken,
                        ).catch((error: unknown) => {
                          setMessage(
                            error instanceof Error
                              ? error.message
                              : "Không thể mở hóa đơn kinh doanh.",
                          );
                        });
                      }}
                      type="button"
                    >
                      {order.source === "SELF_SERVICE"
                        ? "Minh chứng thanh toán"
                        : "Hóa đơn kinh doanh"}
                    </button>
                  )}
                  {order.operationInvoiceUrl && (
                    <button
                      className="h-8 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium"
                      onClick={() => {
                        void openAuthenticatedUpload(
                          order.operationInvoiceUrl!,
                          session.accessToken,
                        ).catch((error: unknown) => {
                          setMessage(
                            error instanceof Error
                              ? error.message
                              : "Không thể mở hóa đơn vận hành.",
                          );
                        });
                      }}
                      type="button"
                    >
                      Hóa đơn vận hành
                    </button>
                  )}
                </div>
              </div>

              {canApprove && order.status === "WAITING_PAYMENT" && (
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  Đang chờ học viên tải minh chứng thanh toán trước khi
                  duyệt.
                </div>
              )}

              {canApprove && order.status === "PENDING_REVIEW" && (
                <div className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[120px_1fr]">
                  <input
                    className="h-9 rounded-lg border border-slate-300 px-3 text-sm"
                    min="1"
                    onChange={(event) =>
                      setDurationDays((current) => ({
                        ...current,
                        [order.id]: event.target.value,
                      }))
                    }
                    placeholder={String(order.requestedDurationDays ?? 365)}
                    type="number"
                    value={
                      durationDays[order.id] ??
                      String(order.requestedDurationDays ?? 365)
                    }
                  />
                  <input
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className="block w-full text-sm text-slate-600"
                    onChange={(event) =>
                      setOperationInvoices((current) => ({
                        ...current,
                        [order.id]: event.target.files?.[0] ?? null,
                      }))
                    }
                    type="file"
                  />
                  <input
                    className="h-9 rounded-lg border border-slate-300 px-3 text-sm sm:col-span-2"
                    onChange={(event) =>
                      setReviewNotes((current) => ({
                        ...current,
                        [order.id]: event.target.value,
                      }))
                    }
                    placeholder="Ghi chú duyệt"
                    value={reviewNotes[order.id] ?? ""}
                  />
                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <button
                      className="h-9 rounded-lg bg-teal-700 px-3 text-xs font-medium text-white disabled:opacity-60"
                      disabled={isLoading}
                      onClick={() => void approveOrder(order.id)}
                      type="button"
                    >
                      Duyệt quyền truy cập
                    </button>
                    <button
                      className="h-9 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 disabled:opacity-60"
                      disabled={isLoading}
                      onClick={() => void rejectOrder(order.id)}
                      type="button"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              )}

              {canApprove && order.status === "APPROVED" && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    className="h-8 rounded-lg border border-purple-200 px-3 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-60"
                    disabled={isLoading}
                    onClick={() => openRevokeModal(order.id)}
                    type="button"
                  >
                    Thu hồi quyền truy cập
                  </button>
                </div>
              )}

              {canCreate && order.status === "REJECTED" && (
                <div className="grid gap-2 rounded-lg bg-rose-50 p-3 sm:grid-cols-2">
                  <p className="text-xs font-semibold text-rose-800 sm:col-span-2">
                    Gửi duyệt lại sau khi đã khắc phục vấn đề
                  </p>
                  <input
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className="block w-full text-sm text-slate-600 sm:col-span-2"
                    onChange={(event) =>
                      setResubmitInvoices((current) => ({
                        ...current,
                        [order.id]: event.target.files?.[0] ?? null,
                      }))
                    }
                    type="file"
                  />
                  <input
                    className="h-9 rounded-lg border border-rose-200 bg-white px-3 text-sm sm:col-span-2"
                    onChange={(event) =>
                      setResubmitNotes((current) => ({
                        ...current,
                        [order.id]: event.target.value,
                      }))
                    }
                    placeholder="Mô tả nội dung đã khắc phục (không bắt buộc)"
                    value={resubmitNotes[order.id] ?? ""}
                  />
                  <button
                    className="h-9 rounded-lg bg-rose-700 px-3 text-xs font-medium text-white disabled:opacity-60"
                    disabled={isLoading}
                    onClick={() => void resubmitOrder(order.id)}
                    type="button"
                  >
                    Gửi duyệt lại
                  </button>
                  <button
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 disabled:opacity-60"
                    disabled={isLoading}
                    onClick={() => void cancelOrder(order.id)}
                    type="button"
                  >
                    Hủy đơn
                  </button>
                </div>
              )}

              {canCreate &&
                (order.status === "WAITING_PAYMENT" ||
                  order.status === "PENDING_REVIEW") && (
                  <div className="flex justify-end">
                    <button
                      className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-60"
                      disabled={isLoading}
                      onClick={() => void cancelOrder(order.id)}
                      type="button"
                    >
                      Huỷ đơn
                    </button>
                  </div>
                )}
            </div>
          </div>
        ))}

        {visibleOrders.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500">
            Không có đơn kích hoạt phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
}
