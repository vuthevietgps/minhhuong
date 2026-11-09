"use client";

import { CheckCircle2, FileText, RotateCcw, XCircle } from "lucide-react";
import { Fragment } from "react";
import { formatDate, formatMoney, formatStatusVi, openAuthedAsset } from "../../_lib/admin-client";
import { statusClass } from "./shared";
import type { OrdersPageState } from "./use-orders-page-state";

/** Order queue table with row actions. */
export function OrdersTableSection(state: OrdersPageState) {
  const {
    actionOrderId,
    approveOrder,
    canRecoverOrders,
    canReviewOrders,
    cancelOrder,
    durationDays,
    hasMore,
    isLoading,
    isLoadingMore,
    loadOrders,
    nextCursor,
    orders,
    rejectOrder,
    reviewNotes,
    setDurationDays,
    setMessage,
    setOperationInvoices,
    setPendingResubmit,
    setResubmitFile,
    setReviewNotes,
    setRevokeOrder,
  } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Khách hàng</th>
              <th className="px-5 py-3 font-medium">Gói học</th>
              <th className="px-5 py-3 font-medium">Nguồn</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
              <th className="px-5 py-3 font-medium">Số tiền</th>
              <th className="px-5 py-3 font-medium">Ngày tạo</th>
              <th className="px-5 py-3 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {orders.map((order) => {
              const isPendingReview = order.status === "PENDING_REVIEW";
              const hasBankTransfer = Boolean(order.bankAccountNumber);
              const showDetailRow =
                isPendingReview ||
                Boolean(order.saleInvoiceUrl) ||
                Boolean(order.operationInvoiceUrl) ||
                Boolean(order.notes) ||
                Boolean(order.reviewNotes) ||
                Boolean(order.revokeReason) ||
                Boolean(order.activatedAt) ||
                Boolean(order.expiresAt) ||
                hasBankTransfer;

              return (
                <Fragment key={order.id}>
                  <tr>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-slate-950">
                        {order.customerEmail}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.customerPhone ??
                          order.createdBy?.email ??
                          order.user.profile?.displayName ??
                          "-"}
                      </p>
                      {order.agency && (
                        <p className="mt-1 text-xs text-slate-500">
                          Đại lý: {order.agency.code} • {order.agency.name}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-slate-600">
                      <p>{order.packageName ?? "Gói học đang chờ"}</p>
                      {order.requestedDurationDays && (
                        <p className="mt-1 text-xs text-slate-500">
                          Ngày yêu cầu {order.requestedDurationDays} ngày
                        </p>
                      )}
                      {order.expiresAt && (
                        <p className="mt-1 text-xs text-slate-500">
                          Hết hạn {formatDate(order.expiresAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-slate-600">
                      {formatStatusVi(order.source)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(order.status)}`}
                      >
                        {formatStatusVi(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top font-medium text-slate-950">
                      {formatMoney(order.amountCents, order.currency)}
                    </td>
                    <td className="px-5 py-4 align-top text-slate-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      {isPendingReview && canReviewOrders ? (
                        <span className="text-xs font-medium text-sky-700">
                          Duyệt bên dưới
                        </span>
                      ) : order.status === "APPROVED" && canReviewOrders ? (
                        <button
                          className="rounded-xl border border-purple-200 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50"
                          onClick={() => setRevokeOrder(order)}
                          type="button"
                        >
                          Thu hồi quyền truy cập
                        </button>
                      ) : order.status === "REJECTED" && canRecoverOrders ? (
                        <div className="flex flex-col gap-2">
                          <button
                            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 px-3 py-2 text-xs font-medium text-sky-700 hover:bg-sky-50"
                            onClick={() => {
                              setPendingResubmit(order);
                              setResubmitFile(null);
                            }}
                            type="button"
                          >
                            <RotateCcw size={12} />
                            Gửi lại
                          </button>
                          <button
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            onClick={() => void cancelOrder(order)}
                            type="button"
                          >
                            Hủy đơn hàng
                          </button>
                        </div>
                      ) : ["WAITING_PAYMENT", "PENDING_REVIEW"].includes(
                          order.status,
                        ) && canRecoverOrders ? (
                        <button
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          onClick={() => void cancelOrder(order)}
                          type="button"
                        >
                          Hủy đơn hàng
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Không cần thao tác
                        </span>
                      )}
                    </td>
                  </tr>
                  {showDetailRow && (
                    <tr className="bg-slate-50/80">
                      <td className="px-5 py-4" colSpan={7}>
                        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Dòng thời gian
                              </p>
                              <div className="mt-3 space-y-2 text-sm text-slate-600">
                                <p>Ngày tạo: {formatDate(order.createdAt)}</p>
                                <p>
                                  Ngày kích hoạt:{" "}
                                  {formatDate(order.activatedAt)}
                                </p>
                                <p>
                                  Ngày hết hạn: {formatDate(order.expiresAt)}
                                </p>
                                <p>
                                  Người duyệt:{" "}
                                  {order.reviewedBy?.email ?? "-"}
                                </p>
                              </div>
                            </div>
                            {hasBankTransfer && (
                              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                  Chuyển khoản ngân hàng
                                </p>
                                <div className="mt-3 grid gap-1 text-sm text-amber-900">
                                  <p>
                                    <span className="font-medium">
                                      Ngân hàng:
                                    </span>{" "}
                                    {order.bankName ?? "—"}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Tài khoản:
                                    </span>{" "}
                                    {order.bankAccountNumber} —{" "}
                                    {order.bankAccountName}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Nội dung:
                                    </span>{" "}
                                    <span className="font-mono">
                                      {order.transferContent ?? "—"}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Chứng từ
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {order.saleInvoiceUrl ? (
                                  <button
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    onClick={() =>
                                      void openAuthedAsset(
                                        order.saleInvoiceUrl!,
                                        "Không thể mở hóa đơn kinh doanh.",
                                      ).catch((error: unknown) =>
                                        setMessage(
                                          error instanceof Error
                                            ? error.message
                                            : "Không thể mở hóa đơn kinh doanh.",
                                        ),
                                      )
                                    }
                                    type="button"
                                  >
                                    <FileText size={14} />
                                    Hóa đơn kinh doanh
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    Chưa có hóa đơn kinh doanh
                                  </span>
                                )}
                                {order.operationInvoiceUrl && (
                                  <button
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    onClick={() =>
                                      void openAuthedAsset(
                                        order.operationInvoiceUrl!,
                                        "Không thể mở hóa đơn vận hành.",
                                      ).catch((error: unknown) =>
                                        setMessage(
                                          error instanceof Error
                                            ? error.message
                                            : "Không thể mở hóa đơn vận hành.",
                                        ),
                                      )
                                    }
                                    type="button"
                                  >
                                    <FileText size={14} />
                                    Hóa đơn vận hành
                                  </button>
                                )}
                              </div>
                            </div>
                            {(order.notes ||
                              order.reviewNotes ||
                              order.revokeReason) && (
                              <div className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Ghi chú
                                </p>
                                <div className="mt-3 space-y-2 text-sm text-slate-600">
                                  {order.notes && (
                                    <p>Ghi chú kinh doanh: {order.notes}</p>
                                  )}
                                  {order.reviewNotes && (
                                    <p>Ghi chú duyệt: {order.reviewNotes}</p>
                                  )}
                                  {order.revokeReason && (
                                    <p className="text-purple-700">
                                      Lý do thu hồi: {order.revokeReason}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {isPendingReview && canReviewOrders ? (
                            <div className="rounded-2xl border border-sky-200 bg-white p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                                Duyệt vận hành
                              </p>
                              <div className="mt-4 grid gap-3">
                                <label className="block text-sm text-slate-600">
                                  Thời hạn (ngày)
                                  <input
                                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                                    min="1"
                                    onChange={(event) =>
                                      setDurationDays((current) => ({
                                        ...current,
                                        [order.id]: event.target.value,
                                      }))
                                    }
                                    type="number"
                                    value={
                                      durationDays[order.id] ??
                                      String(
                                        order.requestedDurationDays ?? 365,
                                      )
                                    }
                                  />
                                </label>
                                <label className="block text-sm text-slate-600">
                                  Hóa đơn vận hành
                                  <input
                                    accept="application/pdf,image/jpeg,image/png,image/webp"
                                    className="mt-1 block w-full text-sm text-slate-600"
                                    onChange={(event) =>
                                      setOperationInvoices((current) => ({
                                        ...current,
                                        [order.id]:
                                          event.target.files?.[0] ?? null,
                                      }))
                                    }
                                    type="file"
                                  />
                                </label>
                                <label className="block text-sm text-slate-600">
                                  Ghi chú xét duyệt
                                  <textarea
                                    className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                    onChange={(event) =>
                                      setReviewNotes((current) => ({
                                        ...current,
                                        [order.id]: event.target.value,
                                      }))
                                    }
                                    placeholder="Ghi chú xét duyệt"
                                    value={
                                      reviewNotes[order.id] ??
                                      order.reviewNotes ??
                                      ""
                                    }
                                  />
                                </label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <button
                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                                    disabled={actionOrderId === order.id}
                                    onClick={() =>
                                      void approveOrder(order.id)
                                    }
                                    type="button"
                                  >
                                    <CheckCircle2 size={16} />
                                    Phê duyệt quyền truy cập
                                  </button>
                                  <button
                                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                    disabled={actionOrderId === order.id}
                                    onClick={() => void rejectOrder(order.id)}
                                    type="button"
                                  >
                                    <XCircle size={16} />
                                    Từ chối
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                              {canReviewOrders
                                ? "Đơn hàng này hiện không cần thao tác xét duyệt."
                                : "Vai trò của bạn chỉ có quyền xem. Bộ phận vận hành có thể duyệt, từ chối hoặc thu hồi trong cùng hàng đợi."}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {!isLoading && orders.length === 0 && (
              <tr>
                <td
                  className="px-5 py-10 text-center text-sm text-slate-500"
                  colSpan={7}
                >
                  Không có đơn phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="border-t border-slate-200 px-5 py-4">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={isLoadingMore}
            onClick={() => void loadOrders(nextCursor ?? undefined, true)}
            type="button"
          >
            {isLoadingMore ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      )}
    </section>
  );
}
