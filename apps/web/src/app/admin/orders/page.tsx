"use client";

import { useOrdersPageState } from "./_components/use-orders-page-state";
import { OrdersOverviewSection } from "./_components/orders-overview-section";
import { CreateOrderSection } from "./_components/create-order-section";
import { OrdersTableSection } from "./_components/orders-table-section";
import { ResubmitOrderModal, RevokeOrderModal } from "./_components/order-modals";

export default function OrdersPage() {
  const state = useOrdersPageState();
  const { canViewOrders, loaded } = state;
  if (!loaded) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Đang kiểm tra quyền đơn hàng...
        </div>
      </div>
    );
  }
  if (!canViewOrders) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-amber-950">
            Vai trò này không được mở không gian đơn hàng.
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            Hãy mở cổng phù hợp với phạm vi quyền hiện tại.
          </p>
        </div>
      </div>
    );
  }
return (
    <div className="px-6 py-6 lg:px-8 lg:py-8">
      <OrdersOverviewSection {...state} />

      <CreateOrderSection {...state} />

      <OrdersTableSection {...state} />

      <RevokeOrderModal {...state} />

      {/* Resubmit Modal */}
      <ResubmitOrderModal {...state} />
    </div>
  );
}
