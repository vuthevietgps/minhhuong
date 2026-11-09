"use client";

import { CircleDollarSign } from "lucide-react";
import { formatMoney } from "../../lib/format";
import type { ActivationOrdersPanelState } from "./use-activation-orders-panel-state";

/** New activation order form (or read-only notice). */
export function CreateActivationOrderForm(state: ActivationOrdersPanelState) {
  const {
    agencyCode,
    amountVnd,
    canCreate,
    createOrder,
    customerEmail,
    customerPhone,
    displayName,
    generatedPassword,
    isLoading,
    lastCreatedInfo,
    notes,
    orders,
    packageCode,
    packageOptions,
    selectPackage,
    selectedPackage,
    setAgencyCode,
    setAmountVnd,
    setCustomerEmail,
    setCustomerPhone,
    setDisplayName,
    setGeneratedPassword,
    setLastCreatedInfo,
    setNotes,
    setSaleInvoice,
    setShowAdvancedFields,
    showAdvancedFields,
  } = state;
  return <>{canCreate ? (
    <form className="space-y-3" onSubmit={createOrder}>
      <div className="rounded-lg bg-slate-100 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Đơn học viên mới</h3>
            <p className="mt-1 text-xs text-slate-500">
              Kích hoạt qua nhân viên kinh doanh kèm minh chứng thanh
              toán.
            </p>
          </div>
          <span className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            {selectedPackage
              ? `${selectedPackage.durationDays} ngày`
              : "Số tiền tùy chỉnh"}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Gói học
          </span>
          <select
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
            onChange={(event) => selectPackage(event.target.value)}
            value={packageCode}
          >
            {packageOptions.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name} - {formatMoney(item.amountVnd * 100, "VND")}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Số tiền (VND)
          </span>
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            min="1000"
            onChange={(event) => setAmountVnd(event.target.value)}
            type="number"
            value={amountVnd}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Email học viên{" "}
            <span className="font-normal text-rose-500">*</span>
          </span>
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="khachhang@email.com"
            required
            type="email"
            value={customerEmail}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Số điện thoại
          </span>
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="0901 234 567 (không bắt buộc)"
            type="tel"
            value={customerPhone}
          />
        </label>
      </div>

      {customerEmail.includes("@") &&
        orders.some(
          (o) =>
            o.customerEmail.toLowerCase() ===
              customerEmail.toLowerCase() &&
            (o.status === "PENDING_REVIEW" ||
              o.status === "WAITING_PAYMENT" ||
              o.status === "APPROVED"),
        ) && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠️ Email này đã có đơn đang xử lý hoặc đã kích hoạt. Hãy kiểm
            tra danh sách trước khi tạo mới.
          </div>
        )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Tên học viên{" "}
            <span className="font-normal text-rose-500">*</span>
          </span>
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Nguyễn Văn A"
            required
            value={displayName}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Ảnh chứng từ{" "}
          <span className="font-normal text-slate-400">
            (CK / hóa đơn — tùy chọn)
          </span>
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

      <button
        className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700"
        onClick={() => setShowAdvancedFields((current) => !current)}
        type="button"
      >
        {showAdvancedFields ? "Ẩn chi tiết" : "Thêm chi tiết"}
      </button>

      {showAdvancedFields && (
        <div className="grid gap-3 rounded-lg bg-slate-50 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Đại lý / mã giới thiệu
              </span>
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setAgencyCode(event.target.value)}
                placeholder="Không bắt buộc"
                value={agencyCode}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Ghi chú kinh doanh
            </span>
            <textarea
              className="mt-1 min-h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </label>
        </div>
      )}

      <button
        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
        disabled={isLoading}
        type="submit"
      >
        <CircleDollarSign size={18} />
        Gửi bộ phận vận hành duyệt
      </button>

      {generatedPassword && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
          <p className="text-xs font-semibold text-teal-800">
            Đã tạo tài khoản mới — hãy gửi mật khẩu tạm này cho học viên:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded bg-white px-3 py-1.5 font-mono text-sm font-bold text-teal-900 ring-1 ring-teal-200">
              {generatedPassword}
            </code>
            <button
              className="h-8 rounded-lg border border-teal-200 px-3 text-xs font-medium text-teal-800 hover:bg-teal-100"
              onClick={() => {
                void navigator.clipboard.writeText(generatedPassword);
              }}
              type="button"
            >
              Sao chép
            </button>
            <button
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => {
                setGeneratedPassword(null);
                setLastCreatedInfo(null);
              }}
              type="button"
            >
              Đóng
            </button>
          </div>
          {lastCreatedInfo && (
            <button
              className="mt-2 h-8 w-full rounded-lg border border-teal-300 bg-white px-3 text-xs font-medium text-teal-800 hover:bg-teal-50"
              onClick={() => {
                const msg = [
                  `🎓 Thông tin đăng nhập MinhHương`,
                  `Email: ${lastCreatedInfo.email}`,
                  `Mật khẩu tạm: ${lastCreatedInfo.password}`,
                  `Gói: ${lastCreatedInfo.packageName}`,
                  ``,
                  `Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên.`,
                ].join("\n");
                void navigator.clipboard.writeText(msg);
              }}
              type="button"
            >
              📋 Sao chép thông tin gửi khách (Zalo/Messenger)
            </button>
          )}
          <p className="mt-1.5 text-xs text-teal-700">
            Mật khẩu chỉ hiển thị một lần. Học viên nên đổi mật khẩu sau
            lần đăng nhập đầu tiên.
          </p>
        </div>
      )}
    </form>
  ) : (
    <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
      Bộ phận vận hành kiểm tra minh chứng, tải hóa đơn đối ứng và kích
      hoạt quyền học.
    </div>
  )}</>;
}
