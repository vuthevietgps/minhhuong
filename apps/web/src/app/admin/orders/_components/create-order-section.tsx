"use client";

import { Copy, Eye, EyeOff } from "lucide-react";
import { formatMoney } from "../../_lib/admin-client";
import type { OrdersPageState } from "./use-orders-page-state";

/** Order creation form and sale guidance. */
export function CreateOrderSection(state: OrdersPageState) {
  const {
    agencyCode,
    canCreateOrders,
    canOverrideAgencyCode,
    copyGeneratedPassword,
    createOrder,
    customerEmail,
    customerPhone,
    displayAmountVnd,
    displayName,
    generatedPassword,
    isAgencyWorkspace,
    isCreatingOrder,
    isGeneratedPasswordCopied,
    isGeneratedPasswordVisible,
    lastCreatedAccount,
    notes,
    packageCode,
    packageOptions,
    selectPackage,
    selectedPackage,
    setAgencyCode,
    setAmountVnd,
    setCustomerEmail,
    setCustomerPhone,
    setDisplayName,
    setIsGeneratedPasswordVisible,
    setNotes,
    setSaleInvoice,
    usesLockedPackagePricing,
  } = state;
  if (!canCreateOrders) return null;
  return (
    <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <form
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={createOrder}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Tạo đơn học viên
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isAgencyWorkspace
                ? "Đơn hàng mới tự động thuộc phạm vi đại lý của bạn, trừ khi quản trị viên thay đổi nguồn ghi nhận."
                : "Gửi đơn kích hoạt có nhân viên kinh doanh hỗ trợ, kèm gói học, số tiền và minh chứng thanh toán."}
            </p>
          </div>
          {selectedPackage && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {selectedPackage.durationDays} ngày
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Email học viên
            </span>
            <input
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="learner@example.com"
              required
              type="email"
              value={customerEmail}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Tên hiển thị
            </span>
            <input
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Tên hiển thị của học viên"
              value={displayName}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Số điện thoại
            </span>
            <input
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="0901 234 567"
              value={customerPhone}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Gói học
            </span>
            <select
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              onChange={(event) => selectPackage(event.target.value)}
              value={packageCode}
            >
              {packageOptions.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name} • {formatMoney(item.amountVnd * 100, "VND")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Số tiền (VNĐ)
            </span>
            <input
              className={`mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm ${
                usesLockedPackagePricing ? "bg-slate-50 text-slate-500" : ""
              }`}
              min="1000"
              onChange={(event) => setAmountVnd(event.target.value)}
              readOnly={usesLockedPackagePricing}
              required
              type="number"
              value={displayAmountVnd}
            />
            {usesLockedPackagePricing && (
              <p className="mt-1 text-xs text-slate-500">
                Số tiền được khóa theo gói đã chọn để đơn đại lý luôn khớp
                giá công bố.
              </p>
            )}
          </label>
          {canOverrideAgencyCode && (
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mã đại lý
              </span>
              <input
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) => setAgencyCode(event.target.value)}
                placeholder="AGENCY-CODE"
                value={agencyCode}
              />
            </label>
          )}
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Hóa đơn kinh doanh
            </span>
            <input
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="mt-1 block w-full text-sm text-slate-600"
              onChange={(event) =>
                setSaleInvoice(event.target.files?.[0] ?? null)
              }
              type="file"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Ghi chú
            </span>
            <textarea
              className="mt-1 min-h-28 w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Thông tin khách hàng, ghi chú thanh toán hoặc bàn giao nội bộ"
              value={notes}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            className="inline-flex h-11 items-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={isCreatingOrder}
            type="submit"
          >
            {isCreatingOrder ? "Đang tạo..." : "Tạo đơn học viên"}
          </button>
          {selectedPackage && (
            <p className="text-sm text-slate-500">
              Gói đề xuất:{" "}
              <span className="font-medium text-slate-700">
                {selectedPackage.name}
              </span>
            </p>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            Quy trình chủ đại lý
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              1. Tạo đơn học viên kèm gói học và minh chứng thanh toán.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              2. Theo dõi trạng thái duyệt, từ chối hoặc thu hồi trong cùng
              danh sách.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              3. Khi đơn bị từ chối, gửi lại hoặc hủy ngay trong phạm vi đại
              lý.
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            Bàn giao tài khoản
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Tài khoản học viên mới có thể sinh mật khẩu tạm. Hãy gửi qua
            kênh vận hành an toàn, không để trong ghi chú trình duyệt hoặc
            ảnh chụp màn hình.
          </p>
          {lastCreatedAccount && generatedPassword ? (
            <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-teal-900">
                    Mật khẩu tạm đã sẵn sàng
                  </p>
                  <p className="mt-2 text-sm text-teal-900">
                    {lastCreatedAccount.email} •{" "}
                    {lastCreatedAccount.packageName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-teal-300 bg-white px-3 text-sm font-medium text-teal-900 hover:bg-teal-100"
                    onClick={() =>
                      setIsGeneratedPasswordVisible((current) => !current)
                    }
                    type="button"
                  >
                    {isGeneratedPasswordVisible ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                    {isGeneratedPasswordVisible ? "Ẩn" : "Hiện"}
                  </button>
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-teal-300 bg-white px-3 text-sm font-medium text-teal-900 hover:bg-teal-100"
                    onClick={() => void copyGeneratedPassword()}
                    type="button"
                  >
                    <Copy size={15} />
                    {isGeneratedPasswordCopied ? "Đã sao chép" : "Sao chép"}
                  </button>
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-white px-3 py-2 font-mono text-sm text-slate-900">
                {isGeneratedPasswordVisible
                  ? generatedPassword
                  : "*".repeat(Math.max(12, generatedPassword.length))}
              </p>
              <p className="mt-2 text-xs text-teal-900">
                Chỉ hiển thị khi sẵn sàng bàn giao, sau đó sao chép vào kênh
                vận hành an toàn.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Tạo đơn học viên mới để nhận mật khẩu tạm khi tài khoản chưa
              tồn tại.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
