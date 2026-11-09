"use client";

import { RotateCcw, ShieldAlert } from "lucide-react";
import type { OrdersPageState } from "./use-orders-page-state";

export function RevokeOrderModal(state: OrdersPageState) {
  const {
    confirmRevoke,
    isRevoking,
    revokeOrder,
    revokeReason,
    setRevokeOrder,
    setRevokeReason,
  } = state;
  if (!revokeOrder) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setRevokeOrder(null)}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-purple-50 text-purple-700">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Thu hồi quyền đã duyệt?
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Thao tác này sẽ hoàn nguyên hoa hồng và hủy gói học gắn với{" "}
              {revokeOrder.customerEmail}.
            </p>
          </div>
        </div>
        <textarea
          className="mt-5 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400"
          onChange={(event) => setRevokeReason(event.target.value)}
          placeholder="Lý do thu hồi (không bắt buộc)"
          value={revokeReason}
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setRevokeOrder(null)}
            type="button"
          >
            Hủy
          </button>
          <button
            className="h-10 rounded-xl bg-purple-700 px-4 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
            disabled={isRevoking}
            onClick={() => void confirmRevoke()}
            type="button"
          >
            {isRevoking ? "Đang thu hồi..." : "Xác nhận thu hồi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResubmitOrderModal(state: OrdersPageState) {
  const {
    isResubmitting,
    pendingResubmit,
    resubmitOrder,
    setPendingResubmit,
    setResubmitFile,
  } = state;
  if (!pendingResubmit) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setPendingResubmit(null)}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-sky-50 text-sky-700">
            <RotateCcw size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Gửi lại đơn bị từ chối?
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Thao tác này sẽ chuyển đơn về <strong>Chờ duyệt</strong> cho{" "}
              {pendingResubmit.customerEmail}. Có thể đính kèm hóa đơn kinh
              doanh mới.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Hóa đơn kinh doanh mới (không bắt buộc)
          </label>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-slate-600"
            onChange={(e) => setResubmitFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setPendingResubmit(null)}
            type="button"
          >
            Hủy
          </button>
          <button
            className="h-10 rounded-xl bg-sky-700 px-4 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-60"
            disabled={isResubmitting}
            onClick={() => void resubmitOrder(pendingResubmit)}
            type="button"
          >
            {isResubmitting ? "Đang gửi lại..." : "Xác nhận gửi lại"}
          </button>
        </div>
      </div>
    </div>
  );
}
