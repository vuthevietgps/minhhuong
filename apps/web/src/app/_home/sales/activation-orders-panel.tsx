"use client";

import { formatMoney } from "../lib/format";
import type { Role, Session } from "../types";
import { useActivationOrdersPanelState } from "./activation-orders/use-activation-orders-panel-state";
import { FreeTrialExtensionCard } from "./activation-orders/free-trial-extension-card";
import { CreateActivationOrderForm } from "./activation-orders/create-order-form";
import { ActivationOrderList } from "./activation-orders/order-list";

export function ActivationOrdersPanel({
  role,
  session,
}: {
  role: Role;
  session: Session;
}) {
  const state = useActivationOrdersPanelState({ role, session });
  const {
    actionOrders,
    approvedRevenueCents,
    closeRevokeModal,
    commissionCents,
    confirmRevoke,
    isLoading,
    loadOrders,
    message,
    reviewOrders,
    revokeOrderId,
    revokeReason,
    setRevokeReason,
    thisMonthApprovedCount,
  } = state;
return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Đơn kích hoạt
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Bàn xử lý kinh doanh hằng ngày
          </h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
          <button
            className="mt-2 h-7 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            disabled={isLoading}
            onClick={() => void loadOrders()}
            type="button"
          >
            ↺ Làm mới
          </button>
        </div>
        <div className="flex overflow-x-auto border-y border-slate-200 text-center">
          {[
            ["Cần xử lý", actionOrders.length],
            ["Đang duyệt", reviewOrders.length],
            ["Tháng này ✓", thisMonthApprovedCount],
            ["Doanh thu", formatMoney(approvedRevenueCents, "VND")],
            ["Hoa hồng", formatMoney(commissionCents, "VND")],
          ].map(([label, value], index) => (
            <div
              className={`min-w-[5rem] flex-1 shrink-0 p-3 ${index > 0 ? "border-l border-slate-200" : ""}`}
              key={label}
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <FreeTrialExtensionCard {...state} />

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <CreateActivationOrderForm {...state} />

        <ActivationOrderList {...state} />
      </div>

      {/* Revoke confirmation modal */}
      {revokeOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeRevokeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-semibold text-slate-900 mb-1">
              Thu hồi quyền truy cập?
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Thao tác này sẽ hủy gói học và hoàn nguyên toàn bộ hoa hồng của
              đơn. Không thể hoàn tác.
            </p>
            <textarea
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Lý do thu hồi (không bắt buộc, hiển thị trong nhật ký)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRevokeModal}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={() => void confirmRevoke()}
                className="px-4 py-2 text-sm bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-medium"
              >
                Xác nhận thu hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
